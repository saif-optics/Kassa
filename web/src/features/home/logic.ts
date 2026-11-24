// Расчёты раздела «Главная» — перенос один в один из renderHome в dev/base.html.
// Возвращает готовые значения: плитки сверху, «коротко о месяце», 14 дней, карточки разделов, точки и последние продажи.
import type { Data } from "../../lib/types";
import { cashState, compute, KASSA_POINTS, lastM, recFor } from "../kassa/logic";
import { addM, dDiff, monthRows } from "../pay/logic";
import { repDocs, rsDays } from "../report/logic";
import {
  addD, checkKey, dLong, dShort, fmt, fmtM, isLens, monthTitle, pctF, plStats, plural, planEnv, plCalc, sumOf, MONTHS_FULL,
  type PlanCalc, type PlanStats, type SaleRow,
} from "../plan/logic";
import { batchStats, batchesOf, curBatch } from "./cost";
import { makeCtx, type S } from "../analytics/cost";
import type { Access } from "../../lib/access";
import type { Task, TaskComment } from "../tasks/logic";

/** данные для «Требует внимания» и «Разделов»: задания, комментарии и права (необязательно — без них Главная как раньше) */
export interface HomeExtra { tasks?: Task[]; comments?: TaskComment[]; access?: Access }

export type Part = string | { tag: string; good: boolean };
export const partsText = (p: Part[]) => p.map((x) => (typeof x === "string" ? x : x.tag)).join(" · ");

export interface HeroCard { label: string; value: string; sub: Part[]; kind: "main" | "month" | "need" | "cash"; warn?: boolean; ring?: { p: number; color: string }; spark?: number[] }
export interface SectionCard { id: string; icon: "cash" | "receipt" | "chart" | "target" | "glasses" | "tag"; title: string; hint: string; nums: [string, string][] }
export interface BriefItem { icon: "trophy" | "receipt" | "flame" | "bag"; title: string; value: string; sub: string }
export interface DayBar { d: string; n: number; wd: string; v: number; label: string; best: boolean; sun: boolean; title: string }
export interface PointToday { p: string; r: number; n: number; checks: string; seller: string; month: number; planPct: string | null }
export interface LastSale { id: string; point: string; product: string; when: string; sum: number; pay: string }
export type AlertIcon = "pay" | "report" | "sales" | "cash" | "tasks";
export interface AlertItem { tone: "minus" | "warn" | "info"; icon: AlertIcon; title: string; sub: string; go: { tab: string; field?: string } }
export interface SectionLine { id: string; line: string; badge: number }

const WDL = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];
const MG = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const WD2 = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];

/** Дата заголовка: «Четверг, 5 ноября 2026» */
export function dateTitle(today: string) {
  const w = WDL[new Date(Date.UTC(+today.slice(0, 4), +today.slice(5, 7) - 1, +today.slice(8, 10))).getUTCDay()];
  return `${w[0].toUpperCase() + w.slice(1)}, ${+today.slice(8, 10)} ${MG[+today.slice(5, 7) - 1]} ${today.slice(0, 4)}`;
}

/** подпись столбика: млн с десятой / тысячи */
const barLabel = (v: number) => (v >= 1e6 ? (v / 1e6).toFixed(v >= 1e7 ? 0 : 1).replace(".", ",") : v ? (v / 1e3).toFixed(0) + "к" : "");

export function homeData(d: Data, today: string, extra?: HomeExtra) {
  const env = planEnv(d, today), sales = env.sales, m = today.slice(0, 7);
  // ограниченная роль с точкой: «Точки сегодня» и «Последние продажи» только по своей точке
  const only = extra?.access && !extra.access.isAdmin ? extra.access.point : null;
  const sum = sumOf;
  const todayL = sales.filter((s) => s.date === today), month = sales.filter((s) => (s.date || "").startsWith(m));
  const lastDay = todayL.length ? today : [...new Set(sales.map((s) => s.date).filter(Boolean))].sort().pop() || today;
  const dayList = sales.filter((s) => s.date === lastDay), dayRev = sum(dayList), dayChecks = new Set(dayList.map(checkKey)).size;
  const mRev = sum(month), mChecks = new Set(month.map(checkKey)).size;
  const K: PlanCalc = plCalc(env, m), pt = K.c.total;
  const S: PlanStats | null = pt ? plStats(env, pt, K.fact, K.factBefore, K.work, K.done, K.left, K.past) : null;
  // касса последнего месяца (window.__kassa на рабочем сайте)
  const LM = lastM(d), cl = compute(d, LM), rl = recFor(d, LM), cs = rl ? cashState(d, rl, LM) : null;
  const k = { month: LM, expected: cl.expected, actual: cs ? cs.actual : null, diff: cs ? cs.actual - cl.expected : null };
  const lbl = lastDay === today ? "сегодня" : dShort(lastDay);
  const chk = (n: number) => `${n} ${plural(n, "чек", "чека", "чеков")}`;

  // по дням месяца: средний день и последние 14 дней
  const byDay: Record<string, number> = {};
  month.forEach((s) => { byDay[s.date] = (byDay[s.date] || 0) + (+s.sum || 0); });
  const mDays = Object.keys(byDay).length, avgDay = mDays ? mRev / mDays : 0;
  const dDelta = avgDay ? Math.round(((dayRev - avgDay) / avgDay) * 100) : null;
  const d14: string[] = []; for (let i = 13; i >= 0; i--) d14.push(addD(lastDay, -i));
  const allByDay: Record<string, number> = {};
  sales.forEach((s) => { if (s.date >= d14[0] && s.date <= d14[13]) allByDay[s.date] = (allByDay[s.date] || 0) + (+s.sum || 0); });
  const v14 = d14.map((x) => allByDay[x] || 0);

  const hero: HeroCard[] = [
    { kind: "main", label: `Выручка ${lbl}`, value: fmt(dayRev) + " сум", spark: v14,
      sub: [chk(dayChecks), ...(dDelta != null ? [{ tag: (dDelta >= 0 ? "+" : "−") + Math.abs(dDelta) + "% к среднему дню", good: dDelta >= 0 }] : []), ...(lastDay !== today ? ["сегодня продаж ещё нет"] : [])] },
    { kind: "month", label: "Выручка за месяц", value: fmt(mRev) + " сум", sub: [chk(mChecks), ...(pt && S && !K.past ? [`прогноз ${fmtM(S.forecast)}`] : [])],
      ring: pt && S ? { p: Math.min(1, mRev / pt), color: S.fpct >= 1 ? "var(--plus)" : S.fpct >= 0.85 ? "var(--warn)" : "var(--minus)" } : undefined },
    { kind: "need", label: "Нужно в день", value: S && !K.past ? fmt(S.needDay) + " сум" : "—",
      sub: S ? (K.past ? ["месяц закрыт"] : [`сейчас в среднем ${fmtM(S.pace)}`, `осталось ${K.left.length} раб. дн.`]) : ["план месяца не задан"] },
    { kind: "cash", label: k.actual != null ? (k.diff! >= 0 ? "Излишек в кассе" : "Недостача в кассе") : "Должно быть на руках",
      value: (k.actual != null ? fmt(Math.abs(k.diff!)) : fmt(k.expected)) + " сум",
      sub: k.actual != null ? [`должно ${fmt(k.expected)}`, `факт ${fmt(k.actual)}`] : ["касса ещё не пересчитана"], warn: k.actual != null && k.diff! < 0 },
  ];

  // карточки разделов
  const batches = batchesOf(d), bb = curBatch(batches);
  let bS = 0, bL = 0;
  if (bb && (bb.items || []).length) { const { items } = batchStats(sales, bb, "all"); bS = items.reduce((a, i) => a + (i.sold || 0), 0); bL = items.reduce((a, i) => a + (i.left || 0), 0); }
  const lensM = month.filter(isLens), lensU = lensM.reduce((a, s) => a + (+(s.qty as number) || 0), 0);
  const mg = makeCtx(d).marginOf(month as unknown as S[]);
  const pm = addD(m + "-01", -1).slice(0, 7), el = +today.slice(8);
  const prevM = sum(sales.filter((s) => (s.date || "").startsWith(pm) && +s.date.slice(8) <= el));
  const gr = prevM ? Math.round(((mRev - prevM) / prevM) * 100) : null;
  const kd = k.diff;
  const cards: SectionCard[] = [
    { id: "kassa", icon: "cash", title: "Касса", hint: "Наличные Премиума и Яшнабада, расходы и пересчёт",
      nums: [[fmtM(k.expected), "должно быть"], [k.actual != null ? (kd! >= 0 ? "+" : "−") + fmtM(Math.abs(kd!)) : "—", k.actual != null ? (kd! >= 0 ? "излишек" : "недостача") : "не пересчитано"]] },
    { id: "sales", icon: "receipt", title: "Продажи", hint: "Внести продажу или расход дня, касса дня по точкам", nums: [[fmtM(dayRev), "выручка " + lbl], [String(dayList.length), "позиций " + lbl]] },
    { id: "analytics", icon: "chart", title: "Аналитика", hint: "58 показателей и графиков за любой период", nums: [[fmtM(mRev), "за месяц"], [gr == null ? "—" : (gr >= 0 ? "+" : "") + gr + "%", "к прошлому месяцу"]] },
    { id: "plan", icon: "target", title: "План", hint: "План месяца, точки и продавцы", nums: [[pt ? pctF(mRev / pt) : "—", "выполнено"], [S && !K.past ? fmtM(S.needDay) : "—", "нужно в день"]] },
    { id: "lens", icon: "glasses", title: "Линзы", hint: "Очковые линзы: виды, точки, дни", nums: [[fmt(lensU) + " шт", "за месяц"], [fmtM(sum(lensM)), "выручка"]] },
    { id: "batch", icon: "tag", title: "Склад", hint: "Маржа, остатки по местам и новая партия", nums: [[mg.m != null ? pctF(mg.m) : "—", "маржа месяца"], [bb ? fmt(bS) + " / " + fmt(bL) : "—", "партия: продано / осталось"]] },
  ];

  // коротко о месяце
  const byPt: Record<string, number> = {}; month.forEach((s) => { byPt[s.point] = (byPt[s.point] || 0) + (+s.sum || 0); });
  const lead = Object.entries(byPt).sort((a, b) => b[1] - a[1])[0];
  const avgCk = mChecks ? mRev / mChecks : 0;
  const pmL = sales.filter((s) => (s.date || "").startsWith(pm));
  const pmCk = new Set(pmL.map(checkKey)).size, pmAvg = pmCk ? sum(pmL) / pmCk : 0, ckD = pmAvg ? Math.round(((avgCk - pmAvg) / pmAvg) * 100) : null;
  const bestD = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0];
  const byCat: Record<string, number> = {}; month.forEach((s) => { const c = s.cat || "Другое"; byCat[c] = (byCat[c] || 0) + (+s.sum || 0); });
  const topCat = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
  const brief: BriefItem[] = month.length ? [
    ...(lead ? [{ icon: "trophy" as const, title: "Лидер месяца", value: lead[0], sub: `${fmtM(lead[1])} · ${pctF(lead[1] / (mRev || 1))} выручки` }] : []),
    { icon: "receipt" as const, title: "Средний чек", value: fmt(avgCk) + " сум", sub: ckD == null ? "за этот месяц" : `${ckD >= 0 ? "+" : "−"}${Math.abs(ckD)}% к прошлому месяцу` },
    ...(bestD ? [{ icon: "flame" as const, title: "Лучший день", value: dShort(bestD[0]) + " · " + fmtM(bestD[1]), sub: `в среднем за день ${fmtM(avgDay)}` }] : []),
    ...(topCat ? [{ icon: "bag" as const, title: "Больше всего продают", value: topCat[0], sub: `${fmtM(topCat[1])} · ${pctF(topCat[1] / (mRev || 1))} выручки` }] : []),
  ] : [];
  const briefNote = MONTHS_FULL[+m.slice(5, 7) - 1] + " " + m.slice(0, 4) + (pt && S && !K.past ? ` · план выполнен на ${pctF(mRev / pt)}` : "");

  // 14 дней
  const wkSum = v14.slice(7).reduce((a, b) => a + b, 0), wkPrev = v14.slice(0, 7).reduce((a, b) => a + b, 0), wkD = wkPrev ? Math.round(((wkSum - wkPrev) / wkPrev) * 100) : null;
  const best = v14.indexOf(Math.max(...v14));
  const bars: DayBar[] = d14.map((x, i) => {
    const w = new Date(Date.UTC(+x.slice(0, 4), +x.slice(5, 7) - 1, +x.slice(8, 10))).getUTCDay();
    return { d: x, n: +x.slice(8), wd: WD2[w], v: v14[i], label: barLabel(v14[i]), best: i === best, sun: w === 0, title: `${dLong(x)}: ${fmt(v14[i])} сум` };
  });
  const week = { bars, sum: wkSum, prev: wkPrev, delta: wkD, note: `последние 7 дней ${fmtM(wkSum)}` };

  // точки за последний день
  const pts: PointToday[] = env.points.filter((p) => !only || p === only).map((p) => { const l = dayList.filter((s) => s.point === p); return { p, r: sum(l), n: new Set(l.map(checkKey)).size }; })
    .filter((o) => o.r || K.shares[o.p]).map((o) => {
      const mp = sum(month.filter((s) => s.point === o.p));
      return { ...o, checks: chk(o.n), seller: env.cfg.sellers[o.p] || "", month: mp, planPct: pt && K.shares[o.p] ? pctF(mp / ((pt * K.shares[o.p]) / 100)) : null };
    });
  const ptNote = lastDay === today ? "Выручка за сегодня" : `Последний день с продажами — ${dLong(lastDay)}`;
  const last: LastSale[] = sales.filter((s) => !only || s.point === only).sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 6)
    .map((s) => ({ id: s.id, point: s.point, product: s.product || "—", when: dShort(s.date), sum: +s.sum || 0, pay: s.pay || "" }));

  // ---- плитки по эскизу ----
  const wdayOf = (x: string) => new Date(x + "T12:00:00Z").getUTCDay();
  const timeAt = (at: number) => { const iso = new Date(at + 5 * 3600e3).toISOString(), day = iso.slice(0, 10), hm = iso.slice(11, 16); return (day === today ? "сегодня" : dShort(day)) + " " + hm; };
  const cashDiff = k.actual != null ? k.actual - k.expected : null;
  const diffLabel = cashDiff == null ? "не пересчитано" : Math.abs(cashDiff) < 1000 ? "сходится" : cashDiff < 0 ? "недостача " + fmt(-cashDiff) : "излишек " + fmt(cashDiff);
  const rsList = rsDays(d).filter((x) => x.d <= today && x.e != null), rsLast = rsList[rsList.length - 1] || null;
  const pays = [...monthRows(d, m, today), ...monthRows(d, addM(m, 1), today)];
  const nextP = pays.filter((r) => r.st !== "ok" && r.due >= today).sort((a, b) => a.due.localeCompare(b.due))[0] || null;
  const tiles = {
    today: { value: dayRev, checks: dayChecks, points: pts.filter((o) => o.r > 0).length, deltaPct: dDelta, spark: v14 },
    cash: { value: k.actual != null ? k.actual : k.expected, fact: k.actual != null, expected: k.expected, diff: cashDiff, diffLabel, ok: cashDiff != null && Math.abs(cashDiff) < 1000, at: cs ? timeAt(cs.at || 0) : null },
    plan: { value: mRev, pct: pt ? mRev / pt : null, planTotal: pt, daysLeft: K.left.length, needPerDay: S && !K.past ? S.needDay : null, fpct: S ? S.fpct : null },
    rs: { value: rsLast ? rsLast.e : null, day: rsLast ? rsLast.d : null, delta: rsLast && rsLast.s != null && rsLast.e != null ? rsLast.e - rsLast.s : null,
      nextPay: nextP ? { name: nextP.it.name, days: dDiff(today, nextP.due), due: nextP.due, sum: nextP.left || nextP.am.a } : null },
  };

  // ---- «Требует внимания» ----
  // Задания приходят отдельно (таблицы tasks, не docs): extra.tasks. Опоздания сотрудников (att_*) — пока не подключены.
  const alerts: AlertItem[] = [], taskAlerts: AlertItem[] = [];
  const full = !extra?.access || extra.access.isAdmin; // остальное — только деньги владельца, ограниченной роли не показываем
  const tk = extra?.tasks || [], tkOpen = tk.filter((t) => t.status !== "done");
  const tkOver = tkOpen.filter((t) => t.due && String(t.due).slice(0, 10) < today);
  const answered = new Set((extra?.comments || []).filter((c) => c.author_label === "Владелец").map((c) => c.task_id));
  const tkNew = tk.filter((t) => t.source === "seller" && t.status === "new"), tkNoAns = tkNew.filter((t) => !answered.has(t.id));
  if (tkNoAns.length && full) taskAlerts.push({ tone: "warn", icon: "tasks", title: `Проблемы от продавцов без ответа: ${tkNoAns.length}`,
    sub: tkNoAns.slice(0, 2).map((t) => t.title).join(", ") + (tkNoAns.length > 2 ? ` и ещё ${tkNoAns.length - 2}` : ""), go: { tab: "tasks" } });
  if (tkOver.length) taskAlerts.push({ tone: "minus", icon: "tasks", title: `Просроченные задания: ${tkOver.length}`,
    sub: tkOver.slice(0, 2).map((t) => t.title).join(", ") + (tkOver.length > 2 ? ` и ещё ${tkOver.length - 2}` : ""), go: { tab: "tasks" } });
  // просрочка: три последних месяца; «late» (не оплачен) и «part» (оплачен частично) с истёкшим сроком и остатком
  const late = [addM(m, -2), addM(m, -1), m].flatMap((M) => monthRows(d, M, today)).filter((r) => (r.st === "late" || r.st === "part") && r.due < today && r.left > 0);
  if (late.length) alerts.push({ tone: "minus", icon: "pay", title: late.length === 1 ? "Просрочен платёж" : `Просрочено платежей: ${late.length}`,
    sub: late.slice(0, 2).map((r) => r.it.name).join(", ") + (late.length > 2 ? ` и ещё ${late.length - 2}` : "") + " · " + fmtM(late.reduce((a, r) => a + (r.left || r.am.a), 0)), go: { tab: "pay" } });
  if (cashDiff != null && Math.abs(cashDiff) >= 1000) alerts.push({ tone: "minus", icon: "cash", title: cashDiff < 0 ? "Недостача в кассе" : "Излишек в кассе", sub: diffLabel + (cs ? " · пересчёт " + timeAt(cs.at || 0) : ""), go: { tab: "kassa" } });
  const rep = repDocs(d), hasRs = (x: string) => !!rep[x] && rep[x].rsEnd != null, repKeys = Object.keys(rep).filter((x) => /^\d{4}-\d\d-\d\d$/.test(x) && hasRs(x)).sort();
  const days7: string[] = []; for (let i = 7; i >= 1; i--) { const x = addD(today, -i); if (wdayOf(x) !== 0) days7.push(x); }
  const noRep = repKeys.length ? days7.filter((x) => x > repKeys[0] && !hasRs(x)) : [];
  if (noRep.length) alerts.push({ tone: "warn", icon: "report", title: "Нет выписки р/с", sub: "за " + noRep.map(dShort).join(", "), go: { tab: "report" } });
  KASSA_POINTS.forEach((p) => {
    const own = sales.filter((s) => s.point === p), first = own.reduce((a, s) => (s.date && (!a || s.date < a) ? s.date : a), "");
    const have = new Set(own.map((s) => s.date)), miss = first ? days7.filter((x) => x > first && !have.has(x)) : [];
    if (miss.length) alerts.push({ tone: "warn", icon: "sales", title: `${p}: нет продаж`, sub: "за " + miss.map(dShort).join(", "), go: { tab: "sales" } });
  });
  if (!full) alerts.length = 0; // у ограниченной роли платежей, кассы и выписок нет — остаются только задания
  alerts.push(...taskAlerts);

  // ---- разделы по важности: строка-цифра и бейдж ----
  const unpaid = pays.filter((r) => r.st !== "ok" && r.due.startsWith(m));
  const missRep = noRep.length ? noRep[noRep.length - 1] : null;
  const lastRep = repKeys.filter((x) => x <= today).pop();
  const sections: SectionLine[] = [
    { id: "kassa", line: (k.actual != null ? "на руках " : "должно быть ") + fmtM(tiles.cash.value), badge: cashDiff != null && Math.abs(cashDiff) >= 1000 ? 1 : 0 },
    { id: "sales", line: dayChecks ? `${chk(dayChecks)} ${lbl}` : "продаж " + lbl + " нет", badge: 0 },
    { id: "report", line: missRep ? `лист за ${dShort(missRep)} не внесён` : lastRep ? "последний день — " + dShort(lastRep) : "открыть", badge: missRep ? 1 : 0 },
    { id: "pay", line: unpaid.length ? `неоплачено ${unpaid.length} · ${fmtM(unpaid.reduce((a, r) => a + (r.left || r.am.a), 0))}` : "всё оплачено", badge: late.length },
    ...(extra?.tasks ? [{ id: "tasks", line: `открыто ${tkOpen.length} · новых ${tkOpen.filter((t) => t.status === "new").length}`, badge: full ? tkNew.length : 0 }] : []),
    { id: "analytics", line: fmtM(mRev) + " за месяц", badge: 0 },
    { id: "plan", line: pt ? pctF(mRev / pt) + " плана" : "план не задан", badge: 0 },
    { id: "lens", line: lensM.length ? fmtM(sum(lensM)) + " за месяц" : "открыть", badge: 0 },
    { id: "recon", line: "открыть", badge: 0 },
    { id: "batch", line: bb ? `осталось ${fmt(bL)} шт` : "открыть", badge: 0 },
  ];

  return { tiles, alerts, sections, today, m, lastDay, lbl, dayRev, dayList: dayList.length, dayChecks, mRev, mChecks, avgDay, hero, cards, brief, briefNote, week, pts, ptDayRev: pts.reduce((a, o) => a + o.r, 0), ptNote, ptTotalLabel: `Итого за ${lastDay === today ? "сегодня" : dShort(lastDay)}`, last, monthLabel: monthTitle(m), kassa: k, plan: { K, S, total: pt }, margin: mg };
}
export type HomeData = ReturnType<typeof homeData>;
