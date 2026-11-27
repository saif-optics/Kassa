// Новые расчёты раскладки «Б-пазл»: темп к плану, нужно в рабочий день, недели, число «перестали продаваться».
// buildAnalytics не трогаем (по нему сверка с рабочим сайтом) — всё здесь считается отдельно и только читает данные.
import { matchOf, type Flt } from "./base";
import type { Ctx, S } from "./cost";
import { plConf, plOff, plPrevShares } from "./logic";
import { addD, dShort, fmt, monthEnd, MONTHS_FULL, normS, today, weekStart } from "./util";

/** «283 млн», «203,8 млн», «675 тыс»: короткая запись суммы для крупных цифр */
export const mln = (n: number) => {
  const a = Math.abs(n), s = n < 0 ? "−" : "";
  if (a >= 1e6) { const v = a / 1e6; return s + (v >= 100 ? String(Math.round(v)) : v.toFixed(1).replace(".", ",")) + " млн"; }
  if (a >= 1e3) return s + Math.round(a / 1e3) + " тыс";
  return s + Math.round(a);
};
/** число в млн с запятой без единицы: 81,3 / 742 */
export const mn = (n: number) => { const v = n / 1e6; return Math.abs(v) >= 100 ? String(Math.round(v)) : v.toFixed(1).replace(".", ","); };
/** единица для рядов столбиков: млн, а если всё мельче — тыс */
export const unitOf = (mx: number) => (mx >= 1e6 ? { div: 1e6, note: "млн сум", f: mn } : { div: 1e3, note: "тыс сум", f: (n: number) => String(Math.round(n / 1e3)) });

const sumOf = (l: S[]) => l.reduce((x, s) => x + (+s.sum || 0), 0);

/** план месяца в сумах для выбранной точки (доля точки — как в карточке плана); 0 — плана нет */
export function monthPlan(c: Ctx, F: Flt, M: string): number {
  const cf = plConf(c, M); if (!cf.total) return 0;
  if (F.point === "all") return cf.total;
  const sh = Object.assign(plPrevShares(c, M), cf.shares);
  return cf.total * ((sh[F.point] || 0) / 100);
}

/** путь к плану: нарастающий план по дням периода (рабочие дни получают равные доли). Только когда период — это месяц с 1-го числа */
export function planPath(c: Ctx, F: Flt, days: string[]): { total: number; target: number; vals: number[] } | null {
  if (!days.length) return null;
  const M = days[0].slice(0, 7);
  if (!days[0].endsWith("-01") || days.some((d) => d.slice(0, 7) !== M)) return null;
  const total = monthPlan(c, F, M); if (!total) return null;
  const e = +monthEnd(M).slice(8); let w = 0; for (let i = 1; i <= e; i++) if (!plOff(c, M + "-" + String(i).padStart(2, "0"))) w++;
  let run = 0; const vals = days.map((d) => (run += plOff(c, d) ? 0 : total / (w || 1)));
  return { total, target: run, vals };
}

export interface Need {
  mode: "need" | "avg"; label: string; v: number | null; sub: string; plan: number; /** план месяца уже выполнен: v — сколько сверх */ done?: boolean;
}
/** «Нужно в рабочий день» = (план − выручка месяца) / оставшиеся рабочие дни; без плана — просто «Выручка на рабочий день». Рабочие дни — без выходных из настроек плана (по умолчанию воскресенье). */
export function needPerDay(c: Ctx, F: Flt, r: { from: string; to: string }): Need {
  const t = today(), mStart = t.slice(0, 8) + "01", past = !!r.to && r.to < mStart, M = past ? r.to.slice(0, 7) : t.slice(0, 7);
  const ok = (s: S) => F.point === "all" || s.point === F.point;
  const e = +monthEnd(M).slice(8), work: string[] = [];
  for (let i = 1; i <= e; i++) { const d = M + "-" + String(i).padStart(2, "0"); if (!plOff(c, d)) work.push(d); }
  const plan = monthPlan(c, F, M);
  const inM = c.sales.filter((s) => (s.date || "").startsWith(M) && ok(s));
  if (past) { const rev = sumOf(inM); return { mode: "avg", label: "Выручка на рабочий день", v: work.length ? rev / work.length : null, sub: `${MONTHS_FULL[+M.slice(5, 7) - 1].toLowerCase()} · ${work.length} раб. дн.`, plan }; }
  const done = work.filter((d) => d < t), left = work.filter((d) => d >= t);
  const before = sumOf(inM.filter((s) => s.date < t)), all = sumOf(inM.filter((s) => s.date <= t));
  const avg = done.length ? before / done.length : null;
  if (!plan) return { mode: "avg", label: "Выручка на рабочий день", v: avg, sub: done.length ? `за ${done.length} рабочих дн.` : "рабочих дней ещё не было", plan };
  if (all >= plan) return { mode: "need", label: "План выполнен", v: all - plan, sub: `сверх плана ${mln(plan)}`, plan, done: true };
  if (!left.length) return { mode: "need", label: "Нужно в рабочий день", v: null, sub: "рабочие дни месяца закончились", plan };
  return { mode: "need", label: "Нужно в рабочий день", v: Math.max(0, (plan - all) / left.length), sub: avg == null ? `осталось ${left.length} раб. дн.` : `сейчас в среднем ${fmtShort(avg)}`, plan };
}
const fmtShort = (n: number) => { const a = Math.abs(n); return a >= 1e6 ? (a / 1e6).toFixed(1).replace(".", ",") : fmt(n); };

/** недели периода: начало и конец (с обрезкой по периоду); идёт — если неделя включает сегодня */
export function weekSpans(r: { from: string; to: string }) {
  const out: { s: string; e: string; label: string; live: boolean }[] = [], seen = new Set<string>(), t = today();
  let d = r.from, g = 0;
  while (d <= r.to && g++ < 1500) {
    const k = weekStart(d);
    if (!seen.has(k)) { seen.add(k); const s = k < r.from ? r.from : k, e0 = addD(k, 6), e = e0 > r.to ? r.to : e0; out.push({ s, e, label: s.slice(0, 7) === e.slice(0, 7) ? `${s.slice(8)}–${e.slice(8)}` : `${dShort(s)}–${dShort(e)}`, live: e0 >= t && k <= t }); }
    d = addD(d, 1);
  }
  return out;
}

/** сколько товаров продавались за 30 дней до периода и не продавались в периоде (логика виджета «Перестали продаваться» без обрезки до 12) */
export function lostCount(c: Ctx, F: Flt, list: S[], r: { from: string }): number {
  const from30 = addD(r.from, -30), cur = new Set(list.map((s) => normS(s.product))), m = matchOf(F), seen = new Set<string>();
  c.sales.forEach((s) => { if (s.date >= from30 && s.date < r.from && m(s)) { const k = normS(s.product); if (!cur.has(k)) seen.add(k); } });
  return seen.size;
}
