// Себестоимость продаж и позиций склада Billz по правилам сайта (analytics/cost.ts) — для выгрузок в Excel.
// Запуск из web/: npx tsx scripts/cost-export.ts <папка>
//   в папке: docs.json (массив {col,id,data}), bz_product.json, bz_stock.json → пишет cost.json туда же.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { toData } from "../src/lib/source";
import { makeCtx, type S } from "../src/features/analytics/cost";

const dir = process.argv[2];
if (!dir) { console.error("укажите папку с docs.json"); process.exit(1); }
const J = (f: string) => JSON.parse(readFileSync(join(dir, f), "utf8"));
const d = toData(J("docs.json")), c = makeCtx(d);
const unitPrice = (s: S) => +(s.price || 0) || (+(s.sum || 0) / (+(s.qty || 0) || 1));

// откуда взялась себестоимость — тот же порядок, что в costOf
function srcOf(s: S, cost: number): string {
  if (!(cost > 0)) return "";
  if (+(s.cost || 0) > 0) return "указана в продаже";
  if (c.lensCostOf(s) != null) return c.lensRule(s) && (c.lensRule(s)!.pair as number) > 0 ? "правило линз" : "линзы по цене";
  const m = c.matcher(s.product || "", unitPrice(s), s.point);
  return m && +(m.it.cp || 0) > 0 ? (m.b ? "партия" : "склад") : "правило товара";
}

const sales: Record<string, { cost: number; src: string }> = {};
const stat: Record<string, number> = {};
for (const s of d.sales as S[]) {
  const cost = c.costOf(s), src = srcOf(s, cost) || "нет";
  sales[s.id] = { cost, src }; stat[src] = (stat[src] || 0) + 1;
}

// склад Billz: cp из карточки, иначе правила сайта по названию/категории/цене
type P = { sku: string; name?: string; cat?: string; cp?: number; prices?: Record<string, number> };
const prods: P[] = J("bz_product.json");
const stockRows: { d: string; point: string; sku: string; q: number }[] = J("bz_stock.json");
const lastD = new Map<string, string>();
stockRows.forEach((r) => { if (!lastD.has(r.point) || r.d > lastD.get(r.point)!) lastD.set(r.point, r.d); });
const skus: Record<string, { cp: number; src: string }> = {};
const pstat: Record<string, number> = {};
for (const r of stockRows) {
  if (r.d !== lastD.get(r.point)) continue;
  const key = r.point + "|" + r.sku; if (skus[key]) continue;
  const p = prods.find((x) => x.sku === r.sku) || ({ sku: r.sku } as P);
  let cp = +(p.cp || 0), src = cp > 0 ? "карточка Billz" : "";
  if (!(cp > 0)) {
    const price = (p.prices && p.prices[r.point]) || 0;
    const s = { id: "stock:" + key, date: lastD.get(r.point)!, point: r.point, product: p.name || r.sku, cat: p.cat || "", price, sum: price, qty: 1, pay: "" } as unknown as S;
    cp = c.costOf(s); src = srcOf(s, cp) || "нет";
  }
  skus[key] = { cp, src }; pstat[src] = (pstat[src] || 0) + 1;
}

writeFileSync(join(dir, "cost.json"), JSON.stringify({ sales, stock: skus }), "utf8");
console.log("продажи:", Object.keys(sales).length, stat);
console.log("склад (последний снимок):", Object.keys(skus).length, pstat);
