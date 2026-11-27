// Проверка раскладки пазла без дыр: для каждой вкладки перебираем все наборы отсутствующих блоков и смотрим, что места без дыр и наложений.
// Запуск: npx tsx scripts/layout-check.ts
import { layout, type LItem, type Rect } from "../src/features/analytics/layout";

const R = (id: string, r: Rect, rn?: Rect): LItem => ({ id, r, rn, on: true });
const TABS: Record<string, LItem[]> = {
  rev: [R("chart", [0, 0, 7, 3]), R("weeks", [0, 3, 4, 1]), R("dow", [7, 0, 5, 2]), R("best", [9, 2, 3, 1]), R("fc", [7, 2, 2, 1]), R("need", [6, 3, 2, 1]), R("avg", [4, 3, 2, 1]), R("nos", [8, 3, 1, 1], [8, 3, 2, 1]), R("months", [9, 3, 3, 1], [10, 3, 2, 1])],
  goods: [R("cats", [0, 0, 4, 3]), R("avg", [0, 3, 6, 1]), R("toprev", [4, 0, 4, 3]), R("topqty", [8, 0, 4, 2]), R("abc", [8, 2, 2, 1]), R("lost", [10, 2, 2, 1]), R("pg", [6, 3, 6, 1])],
  pts: [R("days", [0, 0, 7, 2]), R("rate", [7, 0, 5, 2]), R("share", [9, 2, 3, 2]), R("perday", [7, 2, 2, 2]), R("now", [0, 2, 7, 1]), R("heat", [0, 3, 7, 1])],
  chk: [R("avgpt", [0, 0, 9, 2]), R("c35", [9, 0, 3, 1]), R("c11", [9, 1, 3, 1]), R("c7", [0, 2, 4, 1]), R("c8", [4, 2, 4, 1]), R("c10", [8, 2, 4, 1])],
  cash: [R("wf", [0, 0, 7, 2]), R("kassa", [0, 2, 4, 1]), R("diff", [4, 2, 3, 1]), R("pay", [7, 0, 5, 2]), R("cash", [9, 2, 3, 1]), R("exp", [7, 2, 2, 1]), R("bych", [0, 3, 4, 1]), R("exps", [4, 3, 5, 1]), R("recount", [9, 3, 3, 1])],
  profitOwner: [R("mcat", [0, 0, 7, 2]), R("marg", [0, 2, 3, 1]), R("gp", [3, 2, 4, 1]), R("owner", [7, 0, 5, 3]), R("c40", [0, 3, 3, 1]), R("c41", [3, 3, 2, 1]), R("c42", [5, 3, 2, 1]), R("mpts", [7, 3, 5, 1])],
  profitAlt: [R("mcat", [0, 0, 8, 2]), R("gp", [8, 0, 4, 1]), R("marg", [8, 1, 4, 1]), R("c40", [0, 2, 4, 1]), R("c41", [4, 2, 4, 1]), R("c42", [8, 2, 4, 1]), R("mpts", [0, 3, 12, 1])],
};

let bad = 0;
for (const [name, items] of Object.entries(TABS)) {
  const n = items.length; let fail = 0, tot = 0;
  for (let mask = 1; mask < 1 << n; mask++) { // 1 = блок отсутствует
    const its = items.map((i, k) => ({ ...i, on: !(mask >> k & 1) }));
    if (its.every((i) => !i.on)) continue;
    tot++;
    const L = layout(its);
    if (!L.ok) { fail++; if (fail <= 5) console.log(name, "не закрыто без дыр, нет:", its.filter((i) => !i.on).map((i) => i.id).join(",")); continue; }
    // проверка плотного покрытия: выбираем рамку исходной раскладки и считаем клетки
    for (const which of ["wide", "narrow"] as const) {
      const grid = new Map<string, string>(); let overlap = false;
      for (const i of its) if (i.on) { const r = which === "wide" ? L.rect(i.id) : (() => { const nn = L.narrow(i.id), w = L.rect(i.id); return nn ? ([nn[0], w[1], nn[1], w[3]] as Rect) : w; })();
        for (let x = r[0]; x < r[0] + r[2]; x++) for (let y = r[1]; y < r[1] + r[3]; y++) { const key = x + "," + y; if (grid.has(key)) overlap = true; grid.set(key, i.id); } }
      const full = new Set<string>(); for (const i of items) { const r = which === "wide" ? i.r : i.rn || i.r; for (let x = r[0]; x < r[0] + r[2]; x++) for (let y = r[1]; y < r[1] + r[3]; y++) full.add(x + "," + y); }
      const holes = [...full].filter((k) => !grid.has(k));
      if (overlap || holes.length) { bad++; console.log(name, which, overlap ? "НАЛОЖЕНИЕ" : "ДЫРЫ " + holes.slice(0, 3).join(" "), "нет:", its.filter((i) => !i.on).map((i) => i.id).join(",")); }
    }
  }
  console.log(name + ": наборов " + tot + ", без решения (dense) " + fail);
}
console.log(bad ? "ОШИБОК " + bad : "дыр и наложений нет");
