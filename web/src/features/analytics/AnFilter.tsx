// Фильтр Аналитики на общих правилах нового дизайна: период и точка — Segments, даты, месяц и категория — FilterBar (на телефоне лист «Фильтры»).
import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/Card";
import { FilterBar } from "@/components/FilterSheet";
import { Segments } from "@/components/Segments";
import { Field, Sel } from "@/features/sales/parts";
import { monthOf, monthRange, pointColor, presetRange, rangeOf, filtered, type Flt } from "./base";
import type { Ctx } from "./cost";
import { MONTHS_FULL, dShort } from "./util";

const PRESETS: [string, string][] = [["today", "Сегодня"], ["7d", "7 дней"], ["month", "Месяц"], ["prev", "Прошлый месяц"], ["all", "Всё время"]];

export function AnFilter({ c, F, set, i = 0 }: { c: Ctx; F: Flt; set: (p: Partial<Flt>) => void; i?: number }) {
  const months = useMemo(() => [...new Set(c.sales.map((s) => (s.date || "").slice(0, 7)).filter(Boolean))].sort().reverse(), [c]);
  const cm = monthOf(F), r = rangeOf(F, filtered(c, F));
  const summary = `${dShort(r.from)} — ${dShort(r.to)} · ${F.cat === "all" ? "Все категории" : F.cat}`;
  const count = (F.preset === "custom" ? 1 : 0) + (F.cat !== "all" ? 1 : 0);
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
        <Field label="Категория" className="sm:w-52"><Sel label="Категория" value={F.cat} onChange={(cat) => set({ cat })} options={[{ v: "all", l: "Все категории" }, ...c.cats]} /></Field>
      </FilterBar>
    </Card>
  );
}
