// Общий фильтр периода: «Сегодня / 7 дней / месяц / прошлый месяц / всё время», даты, месяц, точка, категория.
// Состояние общее для всех разделов, где он подключён (Продажи, Аналитика, Линзы), как на рабочем сайте.
// Использование: const { F, pick } = useSalesFilter(); <SalesFilter d={d} />  (в «Линзах» — <SalesFilter d={d} lens />)
import { useSyncExternalStore } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/Card";
import { FilterBar } from "@/components/FilterSheet";
import { Segments } from "@/components/Segments";
import type { Data } from "@/lib/types";
import { Field, Sel } from "./parts";
import { MONTHS_F, curMonth, ctxOf, dLong, dShort, defaultFilter, filtered, lensKindsIn, matchOf, monthEnd, monthsOf, presetRange, rangeOf, todayTash, type Ctx, type Filter, type SaleX } from "./logic";

let state: Filter = defaultFilter();
const subs = new Set<() => void>();
const get = () => state;
const sub = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
const put = (p: Partial<Filter>) => { state = { ...state, ...p }; subs.forEach((f) => f()); };

export const PRESETS: [string, string][] = [["today", "Сегодня"], ["7d", "7 дней"], ["month", "Этот месяц"], ["prev", "Прошлый месяц"], ["all", "Всё время"]];

/** состояние фильтра и действия над ним */
export function useSalesFilter() {
  const F = useSyncExternalStore(sub, get, get);
  return {
    F,
    set: put,
    setPreset: (p: string) => put({ preset: p, ...presetRange(p, todayTash()) }),
    setRange: (from: string, to: string) => put({ from, to, preset: "custom" }),
    setMonth: (m: string) => { if (!m) return; const t = todayTash(); let to = monthEnd(m); if (to > t) to = t; put({ from: m + "-01", to, preset: "custom" }); },
    setPoint: (point: string) => put({ point }),
    setCat: (cat: string) => put({ cat }),
    setLens: (lk: string) => put({ lk }),
    /** продажи, прошедшие фильтр (период, точка, категория) */
    pick: (c: Ctx): SaleX[] => filtered(c, F),
    match: matchOf(F),
  };
}

export function SalesFilter({ d, lens, className, i = 0 }: { d: Data; lens?: boolean; className?: string; i?: number }) {
  const f = useSalesFilter(), { F } = f, c = ctxOf(d), months = monthsOf(c.sales), cm = curMonth(F, c.today);
  const r = rangeOf(F, filtered(c, F), c.today);
  const info = F.from || F.to ? `Показано: ${dLong(F.from || r.from)} — ${dLong(F.to || r.to)}` + (F.point !== "all" ? ` · ${F.point}` : "") + (F.cat !== "all" ? ` · ${F.cat}` : "") : "Показаны все продажи";
  const lk = lens ? lensKindsIn(c, F) : [];
  // для телефона: «01.11 — 24.11 · Все точки · Все категории»
  const summary = `${dShort(F.from || r.from)} — ${dShort(F.to || r.to)} · ${F.point === "all" ? "Все точки" : F.point} · ${lens ? (F.lk === "all" ? "Все виды линз" : F.lk) : (F.cat === "all" ? "Все категории" : F.cat)}`;
  const count = (F.preset === "custom" ? 1 : 0) + (F.point !== "all" ? 1 : 0) + (lens ? (F.lk !== "all" ? 1 : 0) : (F.cat !== "all" ? 1 : 0));
  return (
    <Card title="Период" i={i} className={className}>
      <Segments aria-label="Период" items={PRESETS.map(([key, label]) => ({ key, label }))} value={F.preset === "custom" ? "" : F.preset} onChange={f.setPreset} />
      <FilterBar summary={summary} count={count}>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-end">
          <Field label="С"><Input type="date" value={F.from} onChange={(e) => f.setRange(e.target.value, F.to)} aria-label="С" className="num w-full sm:w-[9.5rem]" /></Field>
          <Field label="По"><Input type="date" value={F.to} onChange={(e) => f.setRange(F.from, e.target.value)} aria-label="По" className="num w-full sm:w-[9.5rem]" /></Field>
        </div>
        <Field label="Месяц" className="sm:w-44"><Sel label="Месяц" value={cm} onChange={f.setMonth} options={[{ v: "", l: "Свой период" }, ...months.map((m) => ({ v: m, l: MONTHS_F[+m.slice(5, 7) - 1] + " " + m.slice(0, 4) }))]} /></Field>
        <Field label="Точка" className="sm:w-44"><Sel label="Точка" value={F.point} onChange={f.setPoint} options={[{ v: "all", l: "Все точки" }, ...c.settings.points]} /></Field>
        {lens
          ? <Field label="Вид линзы" className="sm:w-52"><Sel label="Вид линзы" value={F.lk} onChange={f.setLens} options={[{ v: "all", l: "Все виды линз" }, ...lk]} /></Field>
          : <Field label="Категория" className="sm:w-52"><Sel label="Категория" value={F.cat} onChange={f.setCat} options={[{ v: "all", l: "Все категории" }, ...c.settings.cats]} /></Field>}
      </FilterBar>
      <p className="text-[13px] text-muted-foreground max-sm:hidden">{info}</p>
    </Card>
  );
}
