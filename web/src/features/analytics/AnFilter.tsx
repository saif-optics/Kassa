// Шапка Аналитики одной строкой: заголовок, период и точка (Segments), категория, даты и месяц в поповере, кнопки-иконки.
// На телефоне даты, месяц и категория уходят в лист «Фильтры» (FilterBar), на узких контейнерах строка переносится.
import { useMemo, useState, type ReactNode } from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { CalendarDays, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FilterBar } from "@/components/FilterSheet";
import { Segments } from "@/components/Segments";
import { useIsPhone } from "@/lib/useMedia";
import { Field, Sel } from "@/features/sales/parts";
import { monthOf, monthRange, pointColor, presetRange, rangeOf, filtered, type Flt } from "./base";
import type { Ctx } from "./cost";
import { MONTHS_FULL, dShort } from "./util";

const PRESETS: [string, string][] = [["today", "Сегодня"], ["7d", "7 дней"], ["month", "Месяц"], ["prev", "Прошлый месяц"], ["all", "Всё время"]];

export function AnHead({ c, F, set, sub, actions }: { c: Ctx; F: Flt; set: (p: Partial<Flt>) => void; sub?: ReactNode; actions: ReactNode }) {
  const phone = useIsPhone(), [open, setOpen] = useState(false);
  const months = useMemo(() => [...new Set(c.sales.map((s) => (s.date || "").slice(0, 7)).filter(Boolean))].sort().reverse(), [c]);
  const cm = monthOf(F), r = rangeOf(F, filtered(c, F));
  const summary = `${dShort(r.from)} — ${dShort(r.to)} · ${F.cat === "all" ? "Все категории" : F.cat}`;
  const count = (F.preset === "custom" ? 1 : 0) + (F.cat !== "all" ? 1 : 0);
  const dates = (
    <div className="grid grid-cols-2 gap-2">
      <Field label="С"><Input type="date" value={F.from} onChange={(e) => set({ from: e.target.value, preset: "custom" })} aria-label="С даты" className="num w-full" /></Field>
      <Field label="По"><Input type="date" value={F.to} onChange={(e) => set({ to: e.target.value, preset: "custom" })} aria-label="По дату" className="num w-full" /></Field>
    </div>
  );
  const month = <Field label="Месяц"><Sel label="Месяц" value={cm} onChange={(m) => { if (m) set({ ...monthRange(m), preset: "custom" }); }} options={[{ v: "", l: "Свой период" }, ...months.map((m) => ({ v: m, l: MONTHS_FULL[+m.slice(5, 7) - 1] + " " + m.slice(0, 4) }))]} /></Field>;
  const cat = <Sel label="Категория" value={F.cat} onChange={(cat) => set({ cat })} options={[{ v: "all", l: "Все категории" }, ...c.cats]} />;
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-3">
      <div className="min-w-0 sm:max-w-[19rem] sm:shrink-0">
        <h1 className="text-[30px] leading-[1.1] font-extrabold tracking-[-0.02em]">Аналитика продаж</h1>
        {sub && <p className="mt-1.5 text-sm text-muted-foreground">{sub}</p>}
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-2 sm:flex-1 sm:justify-center">
        <Segments dense aria-label="Период" items={PRESETS.map(([key, label]) => ({ key, label }))} value={PRESETS.some(([k]) => k === F.preset) ? F.preset : ""} onChange={(p) => set({ ...presetRange(p), preset: p })} />
        <Segments dense aria-label="Точка" value={F.point} onChange={(point) => set({ point })}
          items={[{ key: "all", label: <><i className="size-2 rounded-full" style={{ background: "var(--primary)" }} />Общий</> }, ...c.points.map((p) => ({ key: p, label: <><i className="size-2 rounded-full" style={{ background: pointColor(c.points, p) }} />{p}</> }))]} />
        {phone ? (
          <FilterBar summary={summary} count={count}>{dates}{month}<Field label="Категория">{cat}</Field></FilterBar>
        ) : (
          <>
            <div className="w-36">{cat}</div>
            <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
              <PopoverPrimitive.Trigger className="num flex h-9 items-center gap-2 rounded-full border border-input bg-transparent px-3.5 text-[13.5px] font-medium whitespace-nowrap outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary/40" aria-label="Даты и месяц">
                <CalendarDays className="size-4 text-muted-foreground" />{dShort(r.from)}–{dShort(r.to)}<ChevronDown className="size-4 text-muted-foreground" />
              </PopoverPrimitive.Trigger>
              <PopoverPrimitive.Portal>
                <PopoverPrimitive.Content align="center" sideOffset={8} className="z-50 grid w-72 gap-3 rounded-2xl border bg-popover p-4 text-popover-foreground shadow-lg outline-none">
                  {dates}{month}
                </PopoverPrimitive.Content>
              </PopoverPrimitive.Portal>
            </PopoverPrimitive.Root>
          </>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:ml-auto">{actions}</div>
    </header>
  );
}
