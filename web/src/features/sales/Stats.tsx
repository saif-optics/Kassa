// «Статистика»: блок мозаики — столбики выручки по точкам (дни / недели) и таблица по периодам (дни / недели / месяцы) ниже сетки.
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import { RowCards, type RowColumn } from "@/components/RowCards";
import { Segments } from "@/components/Segments";
import { useIsPhone } from "@/lib/useMedia";
import { cn } from "@/lib/utils";
import { WD, dLong, fmt, periodLabel, pointColor, statsOf, wdIdx, type Ctx, type Filter, type Group, type SaleX, type StF } from "./logic";
import { Field, Note, Pager, usePager } from "./parts";
import { useSize } from "./useWidth";

const NOFILT: StF = { from: "", to: "", wd: [] };
const Dash = () => <span className="text-muted-foreground">—</span>;
const GROUPS: [Group, string][] = [["day", "Дни"], ["week", "Недели"], ["month", "Месяцы"]];

/** шаг сетки оси Y: «круглое» число так, чтобы делений было не больше четырёх */
function niceStep(max: number) {
  const raw = max / 4, e = Math.pow(10, Math.floor(Math.log10(raw || 1)));
  return [1, 2, 2.5, 5, 10].map((m) => m * e).find((v) => v >= raw) || 10 * e;
}
const mlnY = (v: number) => (v / 1e6).toFixed(v % 1e6 ? 1 : 0).replace(".", ",");

/** блок «Выручка по точкам»: стопки по дням или неделям на фоновых дорожках, слева ось в млн */
export function RevenueChart({ c, F, list, i = 0 }: { c: Ctx; F: Filter; list: SaleX[]; i?: number }) {
  const [g, setG] = useState<Group>("day"), [hv, setHv] = useState<number | null>(null);
  const S = statsOf(c, F, list, g, NOFILT), [ref, { w, h }] = useSize<HTMLDivElement>(), n = S.asc.length;
  const toggle = <Segments size="sm" aria-label="Группировка" items={GROUPS.slice(0, 2).map(([key, label]) => ({ key, label }))} value={g} onChange={(v) => { setG(v as Group); setHv(null); }} />;
  const LBL = 22, AX = 44, H = Math.max(0, h - LBL), pw = Math.max(0, w - AX);
  const max = Math.max(1, ...S.asc.map((r) => r.tot)), step = niceStep(max), top = Math.ceil(max / step) * step;
  const ticks: number[] = []; for (let v = 0; v <= top + 1e-6; v += step) ticks.push(v);
  const colW = n ? pw / n : 0, lw = g === "week" ? 84 : 40;
  const every = Math.max(g === "day" ? 3 : 1, Math.ceil(lw / Math.max(1, colW)));
  const ti = g === "day" ? S.asc.findIndex((r) => r.k === c.today) : -1;
  const showLbl = (k: number) => k === ti || (k % every === 0 && (ti < 0 || Math.abs(k - ti) >= every));
  const hr = hv != null ? S.asc[hv] : null;
  return (
    <Card title="Выручка по точкам" action={toggle} i={i} className="gap-2">
      <div ref={ref} className="relative min-h-0 flex-1" role="img" aria-label="Выручка по периодам">
        {!n ? <p className="py-10 text-center text-[13px] text-muted-foreground">Нет продаж за период</p> : w > 0 && h > 0 && <>
          <div className="absolute top-0 left-0" style={{ width: AX, height: H }}>
            {ticks.map((v) => <span key={v} className="num absolute right-2 -translate-y-1/2 text-xs leading-none text-muted-foreground" style={{ top: H - (v / top) * H }}>{v ? mlnY(v) : "0"}</span>)}
          </div>
          <div className="absolute top-0" style={{ left: AX, width: pw, height: H }}>
            {ticks.map((v) => <i key={v} className="absolute inset-x-0 h-px bg-foreground/10" style={{ top: Math.min(H - 1, H - (v / top) * H) }} />)}
            <div className="absolute inset-0 flex" onMouseLeave={() => setHv(null)}>
              {S.asc.map((r, k) => {
                const sun = g === "day" && wdIdx(r.k) === 6, segs = S.pts.filter((p) => (r.by[p] || 0) > 0), gap = Math.max(1, Math.min(4, colW * 0.12));
                return (
                  <div key={r.k} className="relative h-full min-w-0 flex-1" style={{ padding: `0 ${gap / 2}px` }} onMouseEnter={() => setHv(k)} onClick={() => setHv(k)}>
                    <div className={cn("relative h-full w-full overflow-hidden rounded-[6px] bg-foreground/5", hv === k && "bg-foreground/10")}>
                      {sun && !r.tot && <span className="absolute inset-x-0 top-1.5 text-center text-[11px] leading-none text-muted-foreground">вс</span>}
                      {r.tot > 0 && <div className="absolute inset-x-0 bottom-0 flex flex-col-reverse overflow-hidden rounded-t-[6px]">
                        {segs.map((p) => <i key={p} className="block w-full" style={{ height: Math.max(3, ((r.by[p] || 0) / top) * H), background: pointColor(p, c.settings.points) }} />)}
                      </div>}
                    </div>
                  </div>);
              })}
            </div>
            {hr && hv != null && <div className="glass pointer-events-none absolute z-10 rounded-xl px-3 py-2 text-[12.5px]" style={{ top: 4, ...(hv < n / 2 ? { left: Math.max(0, (hv + 1) * colW + 4) } : { right: Math.max(0, (n - hv) * colW + 4) }) }}>
              <b>{g === "day" ? dLong(hr.k) : periodLabel(hr.k, g)}</b>
              <div className="flex justify-between gap-4"><span>Итого</span><b className="num">{fmt(hr.tot)}</b></div>
              {[...S.pts].reverse().filter((p) => (hr.by[p] || 0) > 0).map((p) => <div key={p} className="flex items-center justify-between gap-4"><span className="flex items-center gap-1.5"><i className="size-2 rounded-full" style={{ background: pointColor(p, c.settings.points) }} />{p}</span><b className="num">{fmt(hr.by[p])}</b></div>)}
            </div>}
          </div>
          <div className="absolute" style={{ left: AX, top: H, width: pw, height: LBL }}>
            {S.asc.map((r, k) => showLbl(k) && <span key={r.k} className={cn("absolute top-1.5 -translate-x-1/2 text-xs leading-none whitespace-nowrap text-muted-foreground", k === ti && "font-semibold text-foreground")} style={{ left: (k + 0.5) * colW }}>{periodLabel(r.k, g)}</span>)}
          </div></>}
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
