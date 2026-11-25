// Листы выгрузок в Excel (anXlsx, lnXlsx, stXlsx, bXlsx рабочего сайта): те же листы, столбцы и итоги.
import { agg, dayList, expFiltered, filtered, periodTxt, prevList, rangeOf, type Flt } from "./base";
import { checkKey, discOf, entAmt, PAYS, payOf, type Ctx, type S } from "./cost";
import { dLong, WD, wdIdx } from "./util";
import { xlToday, type XSheet } from "./xl";
import { lensData, type LRow } from "../lens/logic";
import { stockSold } from "../stock-margin/logic";

export const fname = (c: Ctx, F: Flt, pre: string, ext: string) => { const r = rangeOf(F, filtered(c, F)); return `${pre}_${r.from}_${r.to}${F.point !== "all" ? "_" + F.point : ""}.${ext}`; };

export function analyticsSheets(c: Ctx, F: Flt): XSheet[] | null {
  const list = filtered(c, F); if (!list.length) return null;
  const a = agg(list), pv = prevList(c, F), pa = pv ? agg(pv.list) : null, r = rangeOf(F, list), ex = expFiltered(c, F), mg = c.marginOf(list), pm = pv ? c.marginOf(pv.list) : null;
  const ch = (x: number, p: number) => (p ? (x - p) / p : null);
  const k = (n: string, x: number, p: number | null | undefined) => ({ n, c: x, p: p == null ? null : p, d: p == null ? null : ch(x, p) });
  const expS = ex.reduce((x, e) => x + entAmt(e), 0);
  const kp = [k("Выручка, сум", a.rev, pa && pa.rev), k("Выручка в среднем за день, сум", Math.round(a.rev / r.days), pa ? Math.round(pa.rev / r.days) : null), k("Продаж (позиций)", a.n, pa && pa.n), k("Чеков", a.checks, pa && pa.checks), k("Проданных единиц", a.units, pa && pa.units), k("Средний чек, сум", Math.round(a.avg), pa && Math.round(pa.avg)), k("Средняя цена единицы, сум", Math.round(a.unitPrice), pa && Math.round(pa.unitPrice)), k("Наличные (Б/Ч), сум", a.cash, pa && pa.cash), k("Расходы дня, сум", expS, null), k("Скидки, сум", a.disc, pa && pa.disc), k("Валовая прибыль, сум", mg.rev ? Math.round(mg.gross) : (null as never), pm && pm.rev ? Math.round(pm.gross) : null)];
  interface G { k: string; r: number; n: number; u: number; ch: Set<string> }
  const grp = (key: "point" | "cat" | "product", l: S[]) => { const m: Record<string, G> = {}; l.forEach((s) => { const kk = (s[key] as string) || "—"; const o = m[kk] || (m[kk] = { k: kk, r: 0, n: 0, u: 0, ch: new Set() }); o.r += +s.sum || 0; o.n++; o.u += +(s.qty || 0); o.ch.add(checkKey(s)); }); return m; };
  const withPrev = (key: "point" | "cat") => { const g = grp(key, list), gp = pa ? grp(key, pv!.list) : ({} as Record<string, G>); return Object.values(g).sort((x, y) => y.r - x.r).map((o) => ({ k: o.k, r: o.r, n: o.n, u: o.u, ck: o.ch.size, sh: o.r / a.rev, avg: Math.round(o.r / o.ch.size), up: o.u ? Math.round(o.r / o.u) : 0, pr: gp[o.k] ? gp[o.k].r : null, d: gp[o.k] ? ch(o.r, gp[o.k].r) : null, m: c.marginOf(list.filter((s) => (s[key] || "—") === o.k)).m })); };
  const pts = withPrev("point"), cats = withPrev("cat");
  const py: Record<string, number> = {}; list.forEach((s) => Object.entries(payOf(s)).forEach(([kk, v]) => (py[kk] = (py[kk] || 0) + v)));
  const pays = PAYS.filter((p) => py[p]).map((p) => ({ k: p, r: py[p], sh: py[p] / a.rev }));
  let cum = 0; const prods = Object.values(grp("product", list)).sort((x, y) => y.r - x.r).map((o, i) => { cum += o.r; const sh = cum / a.rev; return { i: i + 1, k: o.k, u: o.u, r: o.r, sh: o.r / a.rev, cs: sh, abc: sh <= 0.8001 ? "A" : sh <= 0.95 ? "B" : "C" }; });
  const days = dayList(r), wdCount = [0, 0, 0, 0, 0, 0, 0]; days.forEach((d) => wdCount[wdIdx(d)]++);
  const wdS = [0, 0, 0, 0, 0, 0, 0], wdN = [0, 0, 0, 0, 0, 0, 0]; list.forEach((s) => { wdS[wdIdx(s.date)] += +s.sum || 0; wdN[wdIdx(s.date)]++; });
  const wd = WD.map((w, i) => ({ w, days: wdCount[i], r: wdS[i], n: wdN[i], avg: wdCount[i] ? Math.round(wdS[i] / wdCount[i]) : 0 }));
  const sub = periodTxt(F, list, ` · выгружено ${xlToday()}`) + (pv ? ` · сравнение с ${dLong(pv.from)} — ${dLong(pv.to)}` : "");
  const cmpCols = [{ header: "Прошлый период, сум", key: "pr", type: "money" as const, width: 18 }, { header: "Изменение", key: "d", type: "pct" as const, width: 11 }];
  return [
    { name: "Показатели", title: "Аналитика продаж — ключевые показатели", subtitle: sub, columns: [{ header: "Показатель", key: "n", type: "text", width: 36 }, { header: "Текущий период", key: "c", type: "money", width: 18 }, { header: "Прошлый период", key: "p", type: "money", width: 18 }, { header: "Изменение", key: "d", type: "pct", width: 12 }], rows: kp, note: "Изменение: рост или падение к прошлому периоду такой же длины." },
    { name: "По точкам", title: "Точки", subtitle: sub, columns: [{ header: "Точка", key: "k", type: "text", width: 14 }, { header: "Выручка, сум", key: "r", type: "money", width: 16 }, { header: "Доля", key: "sh", type: "pct", width: 8 }, { header: "Чеков", key: "ck", type: "int", width: 8 }, { header: "Единиц", key: "u", type: "int", width: 8 }, { header: "Ср. чек, сум", key: "avg", type: "money", width: 15 }, { header: "Маржа", key: "m", type: "pct", width: 8 }, ...cmpCols], rows: pts, total: { k: "Итого", r: a.rev, sh: 1, ck: a.checks, u: a.units, avg: Math.round(a.avg), m: mg.m, pr: pa ? pa.rev : null, d: pa ? ch(a.rev, pa.rev) : null } },
    { name: "По категориям", title: "Категории товаров", subtitle: sub, columns: [{ header: "Категория", key: "k", type: "text", width: 22 }, { header: "Выручка, сум", key: "r", type: "money", width: 16 }, { header: "Доля", key: "sh", type: "pct", width: 8 }, { header: "Единиц", key: "u", type: "int", width: 8 }, { header: "Ср. цена ед., сум", key: "up", type: "money", width: 16 }, { header: "Маржа", key: "m", type: "pct", width: 8 }, ...cmpCols], rows: cats, total: { k: "Итого", r: a.rev, sh: 1, u: a.units } },
    { name: "Товары ABC", title: "Товары по выручке и ABC-анализ", subtitle: sub, columns: [{ header: "#", key: "i", type: "int", width: 6 }, { header: "Товар", key: "k", type: "text", width: 40 }, { header: "Единиц", key: "u", type: "int", width: 9 }, { header: "Выручка, сум", key: "r", type: "money", width: 16 }, { header: "Доля", key: "sh", type: "pct", width: 8 }, { header: "Накопленная доля", key: "cs", type: "pct", width: 12 }, { header: "Класс", key: "abc", type: "text", width: 8 }], rows: prods, total: { k: "Итого", u: a.units, r: a.rev, sh: 1 }, note: "A — товары, дающие первые 80% выручки; B — следующие 15%; C — последние 5%." },
    { name: "Дни недели", title: "Выручка по дням недели", subtitle: sub, columns: [{ header: "День", key: "w", type: "text", width: 8 }, { header: "Таких дней", key: "days", type: "int", width: 11 }, { header: "Выручка, сум", key: "r", type: "money", width: 16 }, { header: "Позиций", key: "n", type: "int", width: 9 }, { header: "В среднем за день, сум", key: "avg", type: "money", width: 20 }], rows: wd, total: { w: "Итого", days: r.days, r: a.rev, n: a.n } },
    { name: "Оплата", title: "Способы оплаты", subtitle: sub, columns: [{ header: "Способ", key: "k", type: "text", width: 16 }, { header: "Сумма, сум", key: "r", type: "money", width: 16 }, { header: "Доля", key: "sh", type: "pct", width: 8 }], rows: pays, total: { k: "Итого", r: a.rev, sh: 1 } },
  ];
}

export function lensSheets(c: Ctx, F: Flt): XSheet[] | null {
  const { rows, list, all } = lensData(c, F); if (!list.length) return null;
  const sub = periodTxt(F, all, ` · выгружено ${xlToday()}`);
  const det = [...rows].sort((x, y) => x.s.date.localeCompare(y.s.date)).map((x: LRow) => ({ d: dLong(x.s.date), p: x.s.point, pr: x.s.product, t: x.type, i: x.idx, c: x.coat, b: x.brand, q: +(x.s.qty || 0), pc: +(x.s.price || 0), sm: +x.s.sum || 0 }));
  const m: Record<string, { t: string; i: string; c: string; u: number; r: number; avg?: number }> = {};
  rows.forEach((x) => { const k = x.kind + "|" + x.idx + "|" + x.coat; const o = m[k] || (m[k] = { t: x.kind, i: x.idx, c: x.coat, u: 0, r: 0 }); o.u += +(x.s.qty || 0); o.r += +x.s.sum || 0; });
  const sum = Object.values(m).sort((a, b) => b.u - a.u).map((o) => Object.assign(o, { avg: o.u ? Math.round(o.r / o.u) : 0 }));
  const T = (arr: Record<string, unknown>[], k: string) => arr.reduce((a, r) => a + (+(r[k] as number) || 0), 0);
  return [
    { name: "Виды линз", title: "Проданные линзы по видам", subtitle: sub, columns: [{ header: "Вид", key: "t", type: "text", width: 16 }, { header: "Индекс", key: "i", type: "text", width: 10 }, { header: "Покрытие", key: "c", type: "text", width: 20 }, { header: "Штук", key: "u", type: "int", width: 8 }, { header: "Выручка, сум", key: "r", type: "money", width: 16 }, { header: "Ср. цена, сум", key: "avg", type: "money", width: 14 }], rows: sum, total: { t: "Итого", u: T(sum, "u"), r: T(sum, "r") } },
    { name: "Все продажи линз", title: "Все продажи линз", subtitle: sub, columns: [{ header: "Дата", key: "d", type: "text", width: 12 }, { header: "Точка", key: "p", type: "text", width: 11 }, { header: "Товар", key: "pr", type: "text", width: 30 }, { header: "Вид", key: "t", type: "text", width: 15 }, { header: "Индекс", key: "i", type: "text", width: 9 }, { header: "Покрытие", key: "c", type: "text", width: 18 }, { header: "Бренд", key: "b", type: "text", width: 11 }, { header: "Штук", key: "q", type: "int", width: 7 }, { header: "Цена, сум", key: "pc", type: "money", width: 13 }, { header: "Оплачено, сум", key: "sm", type: "money", width: 14 }], rows: det, total: { d: "Итого", q: T(det, "q"), sm: T(det, "sm") } },
  ];
}

export function stockSheets(c: Ctx): XSheet[] | null {
  const items = c.stockItems, meta = c.stockMeta; if (!items.length || !meta) return null;
  const sold = stockSold(c);
  const rows = items.map((i) => ({ pt: i.pt || "", m: [i.m || i.n || i.s, i.col].filter(Boolean).join(" · "), n: i.n && i.m ? i.n : "", s: i.s && i.s !== i.m ? i.s : "", g: i.g || i.c || "", q: +i.q || 0, cp: +(i.cp || 0) || null, p: +(i.p || 0) || null, mg: +(i.cp || 0) && +(i.p || 0) ? ((i.p as number) - (i.cp as number)) / (i.p as number) : null, vc: (+i.q || 0) * (+(i.cp || 0)), sold: sold.get(i) || 0, now: (+i.q || 0) - (sold.get(i) || 0) }));
  const T = (k: string) => rows.reduce((a, r) => a + (+((r as Record<string, unknown>)[k] as number) || 0), 0);
  return [{ name: "Склад", title: "Товары по складу и точкам", subtitle: `Файл «${meta.file || ""}» · продано считается с ${dLong(meta.soldFrom || meta.date)} · выгружено ${xlToday()}`, columns: [{ header: "Место", key: "pt", type: "text", width: 11 }, { header: "Модель / наименование", key: "m", type: "text", width: 28 }, { header: "Наименование", key: "n", type: "text", width: 26 }, { header: "Артикул", key: "s", type: "text", width: 14 }, { header: "Группа", key: "g", type: "text", width: 18 }, { header: "Кол-во по файлу", key: "q", type: "int", width: 11 }, { header: "Цена покупки", key: "cp", type: "money", width: 13 }, { header: "Цена продажи", key: "p", type: "money", width: 13 }, { header: "Маржа в цене", key: "mg", type: "pct", width: 10 }, { header: "Стоимость по закупке", key: "vc", type: "money", width: 16 }, { header: "Продано", key: "sold", type: "int", width: 10 }, { header: "≈ Сейчас", key: "now", type: "int", width: 10 }], rows, total: { pt: "Итого", q: T("q"), vc: T("vc"), sold: T("sold"), now: T("now") } }];
}

void discOf;
