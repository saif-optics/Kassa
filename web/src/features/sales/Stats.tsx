// «Статистика»: две плитки — график выручки по точкам и таблица по периодам (дни / недели / месяцы).
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import { RowCards, type RowColumn } from "@/components/RowCards";
import { Segments } from "@/components/Segments";
import { useIsPhone } from "@/lib/useMedia";
import { cn } from "@/lib/utils";
import { WD, fmt, fmtM, niceStep, periodLabel, pointColor, statsOf, wdIdx, type Ctx, type Filter, type Group, type SaleX, type StF } from "./logic";
import { Field, Note, Pager, usePager } from "./parts";
import { useWidth } from "./useWidth";

const GROUPS: [Group, string][] = [["day", "Дни"], ["week", "Недели"], ["month", "Месяцы"]];
const Dash = () => <span className="text-muted-foreground">—</span>;

export function Stats({ c, F, list, resetKey, tab, i = 0 }: { c: Ctx; F: Filter; list: SaleX[]; resetKey: string; tab?: "overview" | "sale" | "journal"; i?: number }) {
  const [g, setG] = useState<Group>("day"), [stF, setStF] = useState<StF>({ from: "", to: "", wd: [] });
  useEffect(() => setStF({ from: "", to: "", wd: [] }), [resetKey]);
  const S = statsOf(c, F, list, g, stF), pg = usePager(S.desc.length);
  const [ref, w] = useWidth<HTMLDivElement>(), phone = useIsPhone();
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
  const n = S.asc.length, slot = n > 24 ? 26 : Math.max(26, Math.max(w - 56, 200) / Math.max(n, 1)), W = Math.max(w, 56 + slot * n);
  const data = S.asc.map((r) => ({ k: r.k, label: periodLabel(r.k, g), tot: r.tot, ...Object.fromEntries(S.pts.map((p) => [p, r.by[p] || 0])) }));
  const max = Math.max(1, ...S.asc.map((r) => r.tot)), step = niceStep(max / 4), top = Math.ceil(max / step) * step || 1;
  const wd = new Set(stF.wd);
  const toggleWd = (i: number) => setStF((x) => { const s = new Set(x.wd); s.has(i) ? s.delete(i) : s.add(i); return { ...x, wd: s.size === 7 ? [] : [...s] }; });

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className={cn("min-w-0", tab && tab !== "overview" && "hidden")}><Card title="Выручка по точкам" i={i}>
        <Note>Столбик — выручка периода, цвет — точка</Note>
        <Segments size="sm" aria-label="Группировка" items={GROUPS.map(([key, label]) => ({ key, label }))} value={g} onChange={(v) => setG(v as Group)} />
        <div ref={ref} className="h-[342px] overflow-x-auto" role="img" aria-label="Выручка по периодам">
          {!n ? <p className="py-10 text-center text-[13px] text-muted-foreground">Нет продаж за период</p> : w > 0 && (
            <BarChart width={W} height={330} data={data} margin={{ top: 12, right: 8, left: 0, bottom: 4 }} barCategoryGap="22%">
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} interval={Math.max(0, Math.ceil(n / Math.max(4, Math.floor(W / 56))) - 1)} />
              <YAxis width={58} tickLine={false} axisLine={false} domain={[0, top]} ticks={Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step)} tickFormatter={(v: number) => fmtM(v).replace(" ", " ")} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
              <Tooltip cursor={{ fill: "var(--muted)" }} content={({ active, payload, label }) => !active || !payload?.length ? null : (
                <div className="glass rounded-xl px-3 py-2 text-[12.5px]"><b>{label}</b>
                  {[...payload].reverse().filter((p) => +(p.value as number) > 0).map((p) => <div key={String(p.dataKey)} className="flex items-center justify-between gap-4"><span className="flex items-center gap-1.5"><i className="size-2 rounded-full" style={{ background: p.color }} />{p.name}</span><b className="num">{fmt(+(p.value as number))}</b></div>)}
                  <div className="mt-1 flex justify-between gap-4 border-t border-border pt-1"><span>Итого</span><b className="num">{fmt(payload.reduce((a, p) => a + (+(p.value as number) || 0), 0))}</b></div></div>)} />
              {S.pts.map((p, i) => <Bar key={p} dataKey={p} name={p} stackId="a" fill={pointColor(p, c.settings.points)} radius={i === S.pts.length - 1 ? [4, 4, 0, 0] : 0} isAnimationActive={false} />)}
            </BarChart>)}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted-foreground">{S.pts.map((p) => <span key={p} className="inline-flex items-center gap-1.5"><i className="size-2 rounded-full" style={{ background: pointColor(p, c.settings.points) }} />{p}</span>)}</div>
      </Card></div>

      <div className={cn("min-w-0", tab && tab !== "journal" && "hidden")}><Card title="Таблица по периодам" i={i + 1}>
        <Note>Выручка точек, чеки и средний чек</Note>
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end">
          <Field label="С"><Input type="date" aria-label="Таблица: с" value={S.from} min={S.range.from} max={S.range.to} onChange={(e) => setStF((x) => ({ ...x, from: e.target.value, to: S.to }))} className="num w-full sm:w-[9.5rem]" /></Field>
          <Field label="По"><Input type="date" aria-label="Таблица: по" value={S.to} min={S.range.from} max={S.range.to} onChange={(e) => setStF((x) => ({ ...x, to: e.target.value, from: S.from }))} className="num w-full sm:w-[9.5rem]" /></Field>
          <Field label="Дни недели" className="max-sm:col-span-2"><div role="group" aria-label="Дни недели" className="inline-flex flex-wrap gap-0.5 rounded-xl bg-muted p-[3px]">
            {WD.map((d, i) => <button key={d} type="button" data-wd={i} aria-pressed={!wd.has(i)} onClick={() => toggleWd(i)} className={cn("rounded-[9px] px-2 py-1 text-[12.5px] font-medium max-sm:h-9", !wd.has(i) ? "bg-popover text-foreground shadow-sm" : "text-muted-foreground line-through")}>{d}</button>)}</div></Field>
          <Button type="button" variant="secondary" onClick={() => setStF({ from: "", to: "", wd: [] })} className="max-sm:col-span-2 max-sm:h-11">Сбросить</Button>
        </div>
        {!n ? <p className="rounded-2xl px-4 py-8 text-center text-[13.5px] text-muted-foreground">Нет продаж в выбранные дни</p>
          : <RowCards rows={pg.slice(S.desc)} rowKey={(r) => r.k} columns={cols} dense footer={<div className="flex flex-wrap gap-x-4 gap-y-1">
            <b>Всего</b>{S.pts.map((p) => <span key={p} className="text-muted-foreground">{p} <b className="num text-foreground">{fmt(S.ptTot[p])}</b></span>)}
            <span className="text-muted-foreground">итого <b className="num text-foreground">{fmt(S.sa.rev)}</b></span><span className="text-muted-foreground">чеков <b className="num text-foreground">{S.sa.checks}</b></span><span className="text-muted-foreground">ср. чек <b className="num text-foreground">{S.sa.checks ? fmt(S.sa.avg) : "—"}</b></span></div>} />}
        <Pager pg={pg} />
      </Card></div>
    </div>
  );
}
