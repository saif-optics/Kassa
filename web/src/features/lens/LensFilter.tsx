// Фильтр «Линз» на общих правилах нового дизайна: период и точка — Segments, даты, месяц и вид линзы — FilterBar.
import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/Card";
import { FilterBar } from "@/components/FilterSheet";
import { Segments } from "@/components/Segments";
import { Field, Sel } from "@/features/sales/parts";
import { monthOf, monthRange, pointColor, presetRange, rangeOf, type Flt } from "../analytics/base";
import type { Ctx } from "../analytics/cost";
import { MONTHS_FULL, dShort } from "../analytics/util";

const PRESETS: [string, string][] = [["today", "Сегодня"], ["7d", "7 дней"], ["month", "Месяц"], ["prev", "Прошлый месяц"], ["all", "Всё время"]];

export function LensFilter({ c, F, set, kinds, all, i = 0 }: { c: Ctx; F: Flt; set: (p: Partial<Flt>) => void; kinds: string[]; all: Parameters<typeof rangeOf>[1]; i?: number }) {
  const months = useMemo(() => [...new Set(c.sales.map((s) => (s.date || "").slice(0, 7)).filter(Boolean))].sort().reverse(), [c]);
  const cm = monthOf(F), r = rangeOf(F, all);
  const summary = `${dShort(r.from)} — ${dShort(r.to)} · ${F.lk === "all" ? "Все виды линз" : F.lk}`;
  const count = (F.preset === "custom" ? 1 : 0) + (F.lk !== "all" ? 1 : 0);
  return (
    <Card title="Период" i={i}>
      <Segments aria-label="Период" items={PRESETS.map(([key, label]) => ({ key, label }))} value={PRESETS.some(([k]) => k === F.preset) ? F.preset : ""} onChange={(p) => set({ ...presetRange(p), preset: p })} />
      <Segments aria-label="Точка" value={F.point} onChange={(point) => set({ point })}
        items={[{ key: "all", label: <><i className="size-2 rounded-full" style={{ background: "var(--primary)" }} />Общий</> }, ...c.points.map((p) => ({ key: p, label: <><i className="size-2 rounded-full" style={{ background: pointColor(c.points, p) }} />{p}</> }))]} />
      <FilterBar summary={summary} count={count}>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-end">
          <Field label="С"><Input type="date" value={F.from} onChange={(e) => set({ from: e.target.value, preset: "custom" })} aria-label="С даты" className="num w-full sm:w-[9.5rem]" /></Field>
          <Field label="По"><Input type="date" value={F.to} onChange={(e) => set({ to: e.target.value, preset: "custom" })} aria-label="По дату" className="num w-full sm:w-[9.5rem]" /></Field>
        </div>
        <Field label="Месяц" className="sm:w-44"><Sel label="Месяц" value={cm} onChange={(m) => { if (m) set({ ...monthRange(m), preset: "custom" }); }} options={[{ v: "", l: "Свой период" }, ...months.map((m) => ({ v: m, l: MONTHS_FULL[+m.slice(5, 7) - 1] + " " + m.slice(0, 4) }))]} /></Field>
        <Field label="Вид линзы" className="sm:w-52"><Sel label="Вид линзы" value={F.lk} onChange={(lk) => set({ lk })} options={[{ v: "all", l: "Все виды линз" }, ...kinds]} /></Field>
      </FilterBar>
    </Card>
  );
}
