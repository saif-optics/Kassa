// «Статистика»: блок мозаики — столбики выручки по точкам (дни / недели) и таблица по периодам (дни / недели / месяцы) ниже сетки.
import { useEffect, useState } from "react";
import { Bar, BarChart, Tooltip, XAxis } from "recharts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import { RowCards, type RowColumn } from "@/components/RowCards";
import { Segments } from "@/components/Segments";
import { useIsPhone } from "@/lib/useMedia";
import { cn } from "@/lib/utils";
import { WD, fmt, periodLabel, pointColor, statsOf, wdIdx, type Ctx, type Filter, type Group, type SaleX, type StF } from "./logic";
import { Field, Note, Pager, usePager } from "./parts";
import { useSize } from "./useWidth";

const NOFILT: StF = { from: "", to: "", wd: [] };
const Dash = () => <span className="text-muted-foreground">—</span>;
const GROUPS: [Group, string][] = [["day", "Дни"], ["week", "Недели"], ["month", "Месяцы"]];

/** блок «Выручка по точкам»: столбики по дням или неделям занимают всё место блока */
export function RevenueChart({ c, F, list, i = 0 }: { c: Ctx; F: Filter; list: SaleX[]; i?: number }) {
  const [g, setG] = useState<Group>("day");
  const S = statsOf(c, F, list, g, NOFILT), [ref, { w, h }] = useSize<HTMLDivElement>(), n = S.asc.length;
  const data = S.asc.map((r) => ({ k: r.k, label: periodLabel(r.k, g), tot: r.tot, ...Object.fromEntries(S.pts.map((p) => [p, r.by[p] || 0])) }));
  const lw = g === "week" ? 84 : 40;
  const toggle = <Segments size="sm" aria-label="Группировка" items={GROUPS.slice(0, 2).map(([key, label]) => ({ key, label }))} value={g} onChange={(v) => setG(v as Group)} />;
  return (
    <Card title="Выручка по точкам" action={toggle} i={i} className="gap-2">
      <div ref={ref} className="min-h-0 flex-1" role="img" aria-label="Выручка по периодам">
        {!n ? <p className="py-10 text-center text-[13px] text-muted-foreground">Нет продаж за период</p> : w > 0 && h > 0 && (
          <BarChart width={w} height={h} data={data} margin={{ top: 6, right: 0, left: 0, bottom: 0 }} barCategoryGap="14%">
            <XAxis dataKey="label" padding={{ left: 10, right: 10 }} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} interval={Math.max(0, Math.ceil(n / Math.max(2, Math.floor(w / lw))) - 1)} />
            <Tooltip cursor={{ fill: "var(--muted)" }} content={({ active, payload, label }) => !active || !payload?.length ? null : (
              <div className="glass rounded-xl px-3 py-2 text-[12.5px]"><b>{label}</b>
                {[...payload].reverse().filter((p) => +(p.value as number) > 0).map((p) => <div key={String(p.dataKey)} className="flex items-center justify-between gap-4"><span className="flex items-center gap-1.5"><i className="size-2 rounded-full" style={{ background: p.color }} />{p.name}</span><b className="num">{fmt(+(p.value as number))}</b></div>)}
                <div className="mt-1 flex justify-between gap-4 border-t border-border pt-1"><span>Итого</span><b className="num">{fmt(payload.reduce((a, p) => a + (+(p.value as number) || 0), 0))}</b></div></div>)} />
            {S.pts.map((p, k) => <Bar key={p} dataKey={p} name={p} stackId="a" fill={pointColor(p, c.settings.points)} radius={k === S.pts.length - 1 ? [5, 5, 2, 2] : 2} isAnimationActive={false} />)}
          </BarChart>)}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted-foreground">{S.pts.map((p) => <span key={p} className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-full" style={{ background: pointColor(p, c.settings.points) }} />{p}</span>)}</div>
    </Card>
  );
}

/** таблица по периодам: группа дни / недели / месяцы, свой диапазон и дни недели */
export function PeriodTable({ c, F, list, resetKey, i = 0 }: { c: Ctx; F: Filter; list: SaleX[]; resetKey: string; i?: number }) {
  const [g, setG] = useState<Group>("day"), [stF, setStF] = useState<StF>(NOFILT);
  useEffect(() => setStF(NOFILT), [resetKey]);
  const S = statsOf(c, F, list, g, stF), pg = usePager(S.desc.length), phone = useIsPhone();
  // на телефоне колонки точек уходят в раскрытую часть, справа остаётся «Итого»
  const al = phone ? undefined : "right" as const;
  type R = (typeof S.desc)[number];
  const cols: RowColumn<R>[] = [
    { key: "k", title: g === "day" ? "День" : g === "week" ? "Неделя" : "Месяц", main: true, cell: (r) => <span className="whitespace-nowrap">{periodLabel(r.k, g)}{g === "day" && <> <span className="text-xs font-normal text-muted-foreground">{WD[wdIdx(r.k)]}</span></>}</span> },
    ...S.pts.map((p): RowColumn<R> => ({ key: "p:" + p, title: p, align: al, cell: (r) => (r.by[p] ? fmt(r.by[p]) : <Dash />) })),
    { key: "tot", title: "Итого", align: "right", cell: (r) => <b>{fmt(r.tot)}</b> },
    { key: "ch", title: "Чеков", align: al, sub: phone, hideMobile: true, cell: (r) => (phone ? r.ch + " чек." : r.ch) },
    { key: "avg", title: "Ср. чек", align: al, sub: phone, hideMobile: true, cell: (r) => (r.ch ? (phone ? "ср. " : "") + fmt(r.tot / r.ch) : "—") },
  ];
  const n = S.asc.length, wd = new Set(stF.wd);
  const toggleWd = (k: number) => setStF((x) => { const s = new Set(x.wd); s.has(k) ? s.delete(k) : s.add(k); return { ...x, wd: s.size === 7 ? [] : [...s] }; });
  return (
    <Card title="Таблица по периодам" i={i}>
      <Note>Выручка точек, чеки и средний чек</Note>
      <Segments size="sm" aria-label="Группировка таблицы" items={GROUPS.map(([key, label]) => ({ key, label }))} value={g} onChange={(v) => setG(v as Group)} />
      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end">
        <Field label="С"><Input type="date" aria-label="Таблица: с" value={S.from} min={S.range.from} max={S.range.to} onChange={(e) => setStF((x) => ({ ...x, from: e.target.value, to: S.to }))} className="num w-full sm:w-[9.5rem]" /></Field>
        <Field label="По"><Input type="date" aria-label="Таблица: по" value={S.to} min={S.range.from} max={S.range.to} onChange={(e) => setStF((x) => ({ ...x, to: e.target.value, from: S.from }))} className="num w-full sm:w-[9.5rem]" /></Field>
        <Field label="Дни недели" className="max-sm:col-span-2"><div role="group" aria-label="Дни недели" className="inline-flex flex-wrap gap-0.5 rounded-xl bg-muted p-[3px]">
          {WD.map((d, k) => <button key={d} type="button" data-wd={k} aria-pressed={!wd.has(k)} onClick={() => toggleWd(k)} className={cn("rounded-[9px] px-2 py-1 text-[12.5px] font-medium max-sm:h-9", !wd.has(k) ? "bg-popover text-foreground shadow-sm" : "text-muted-foreground line-through")}>{d}</button>)}</div></Field>
        <Button type="button" variant="secondary" onClick={() => setStF(NOFILT)} className="max-sm:col-span-2 max-sm:h-11">Сбросить</Button>
      </div>
      {!n ? <p className="rounded-2xl px-4 py-8 text-center text-[13.5px] text-muted-foreground">Нет продаж в выбранные дни</p>
        : <RowCards rows={pg.slice(S.desc)} rowKey={(r) => r.k} columns={cols} dense footer={<div className="flex flex-wrap gap-x-4 gap-y-1">
          <b>Всего</b>{S.pts.map((p) => <span key={p} className="text-muted-foreground">{p} <b className="num text-foreground">{fmt(S.ptTot[p])}</b></span>)}
          <span className="text-muted-foreground">итого <b className="num text-foreground">{fmt(S.sa.rev)}</b></span><span className="text-muted-foreground">чеков <b className="num text-foreground">{S.sa.checks}</b></span><span className="text-muted-foreground">ср. чек <b className="num text-foreground">{S.sa.checks ? fmt(S.sa.avg) : "—"}</b></span></div>} />}
      <Pager pg={pg} />
    </Card>
  );
}
