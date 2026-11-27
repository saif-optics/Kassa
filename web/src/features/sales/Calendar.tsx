// Календарь продаж, итог выбранного дня и список дней (телефон, планшет). Выбранный день и месяц — в useCalendar: его делят три блока.
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Tile";
import { Row, RowCell, RowName, Rows } from "@/components/Rows";
import { cn } from "@/lib/utils";
import { MONTHS_F, WD, WD_FULL, wdIdx, addD, calDayOf, calDefaultSel, calOf, calShort, dLong, fmt, monthEnd, monthGen, pd, plural, pointColor, type Ctx, type Filter } from "./logic";

const mS = (v: number) => (v < 0 ? "−" : "+") + calShort(Math.abs(v));
const mln = (v: number) => (v / 1e6).toFixed(1).replace(".", ",");
const plOff = (c: Ctx, d: string) => (c.plan.off || [0]).includes(pd(d).getDay());
const ckWord = (n: number) => `${n} ${plural(n, "чек", "чека", "чеков")}`;

/** месяц и выбранный день календаря */
export function useCalendar(c: Ctx, F: Filter, jDay: string) {
  const [calM, setCalM] = useState(""), [sel, setSel] = useState("");
  const o = useMemo(() => calOf(c, F, calM, jDay), [c, F, calM, jDay]);
  const { M, months, byD } = o;
  const calSel = sel && sel.startsWith(M) ? sel : calDefaultSel(M, byD, jDay);
  const shift = (k: number) => { const d = pd(M + "-01"); d.setMonth(d.getMonth() + k); setCalM(d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0")); setSel(""); };
  const go = (m: string, s: string) => { setCalM(m); setSel(s); };
  const day = calSel ? calDayOf(c, F, o.base, calSel) : null;
  /** соседний день выбранного: не раньше начала первого месяца в данных и не позже сегодня */
  const step = (k: number) => { const n = addD(calSel || c.today, k); if (n > c.today || n < months[0] + "-01") return; go(n.slice(0, 7), n); };
  return { o, M, months, calSel, day, shift, go, setSel, step };
}
export type Cal = ReturnType<typeof useCalendar>;

/** отклонение дня от плана дня: текст и цвет; null — плана нет */
function planOf(c: Ctx, cal: Cal, d: string) {
  const { o } = cal, { P, tgt, byP } = o, today = c.today, x = o.byD[d], sun = pd(d).getDay() === 0;
  if (!P || sun || plOff(c, d)) return null;
  if (d > today || (d === today && !x)) return { text: "нужно " + mln(P.S.needDay || tgt), cls: "text-muted-foreground" };
  const bp = byP[d] || 0;
  return { text: mS(bp - tgt), cls: bp >= tgt ? "text-plus" : "text-minus" };
}

export function CalendarBlock({ c, cal, i = 0 }: { c: Ctx; cal: Cal; i?: number }) {
  const { o, M, months, calSel } = cal, { byD, best, total, tgt, P } = o, today = c.today;
  const first = pd(M + "-01"), lead = (first.getDay() + 6) % 7, n = +monthEnd(M).slice(8), cells: (string | null)[] = [];
  for (let k = 0; k < lead; k++) cells.push(null);
  for (let d = 1; d <= n; d++) cells.push(M + "-" + String(d).padStart(2, "0"));
  while (cells.length % 7) cells.push(null);
  const weeks: (string | null)[][] = []; for (let w = 0; w < cells.length; w += 7) weeks.push(cells.slice(w, w + 7));
  // итог недели — в подсказке ячейки
  const weekTip = (wk: (string | null)[]) => {
    const days = wk.filter(Boolean) as string[], s = days.reduce((a, d) => a + (byD[d]?.rev || 0), 0);
    return `Неделя ${+days[0].slice(8)}–${+days[days.length - 1].slice(8)}: ${s ? calShort(s) : "—"}`;
  };
  // шесть недель в месяце: клетка ниже — отклонение встаёт в строку с числом дня
  const tight = weeks.length > 5;
  const legend = [...new Set(o.list.map((s) => s.point))];
  const pct = P ? Math.round((P.fact / P.tot) * 100) : 0;
  const nav = (
    <span className="inline-flex items-center gap-1">
      <Button type="button" variant="secondary" size="icon-sm" aria-label="Предыдущий месяц" disabled={M <= months[0]} onClick={() => cal.shift(-1)}><ChevronLeft /></Button>
      <Button type="button" variant="secondary" size="icon-sm" aria-label="Следующий месяц" disabled={M >= months[months.length - 1]} onClick={() => cal.shift(1)}><ChevronRight /></Button>
    </span>);
  return (
    <Card title={`Календарь продаж · ${MONTHS_F[+M.slice(5, 7) - 1].toLowerCase()}`} action={nav} i={i} className="gap-2">
      <p className="-mt-1 text-sm text-muted-foreground">{total ? `за месяц ${calShort(total)}` : "продаж за месяц нет"}{P ? ` · план ${pct}%` : ""}{best ? ` · лучший день ${+best[0].slice(8)} ${monthGen(M)}` : ""}</p>
      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-muted-foreground @min-[1600px]/main:gap-2">
        {WD.map((x, k) => <span key={x} className={k === 6 ? "text-minus" : ""}>{x.toLowerCase()}</span>)}</div>
      <div className={cn("grid min-h-0 flex-1 grid-cols-7 gap-1.5 @min-[1600px]/main:gap-2", tight && "gap-1 @min-[1600px]/main:gap-1")} style={{ gridTemplateRows: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
        {weeks.flatMap((wk, wi) => wk.map((d, di) => {
          if (!d) return <div key={"e" + wi + di} aria-hidden />;
          const x = byD[d], v = x ? x.rev : 0, sun = pd(d).getDay() === 0, fut = d > today, top = best && best[0] === d, on = d === calSel, ok = !!tgt && v >= tgt;
          const pl = planOf(c, cal, d);
          const dev = sun ? <span className="text-muted-foreground">{x ? "воскресенье" : "выходной"}</span> : pl ? <span className={pl.cls}>{pl.text}</span> : null;
          return (
            <button key={d} type="button" data-cd={d} aria-pressed={on} disabled={fut} onClick={() => cal.setSel(d)} title={dLong(d) + (x ? ": " + fmt(v) + " сум" : "") + "\n" + weekTip(wk)}
              className={cn("relative flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-2xl px-2 text-left outline-none transition focus-visible:ring-3 focus-visible:ring-primary/40 @min-[1600px]/main:px-2.5", tight ? "px-1.5 py-1 @min-[1600px]/main:px-2" : "py-2",
                fut ? "border border-dashed border-foreground/20" : top ? "bg-primary/25" : ok ? "bg-primary/14" : "bg-foreground/6",
                on ? "ring-2 ring-primary" : d === today && "ring-1 ring-foreground/50", sun && !fut && (x ? "opacity-70" : "opacity-45"), !fut && "hover:brightness-110")}>
              <span className="flex items-center gap-1.5 text-[13px] leading-[1.1] font-semibold"><span className={cn("num", sun && "text-minus", on && "text-primary")}>{+d.slice(8)}</span>
                {ok && <i title="План дня выполнен" className="size-1.5 rounded-full bg-plus" />}{top && <span className="text-[11px] font-bold text-primary">топ</span>}</span>
              {x ? <b className={cn("num truncate leading-[1.15] font-extrabold", tight ? "text-sm @min-[1600px]/main:text-[15px]" : "text-[15px] @min-[1600px]/main:text-[17px]")}>{calShort(v)}</b> : !fut && !sun ? <b className={cn("num leading-[1.15] font-extrabold text-muted-foreground", tight ? "text-sm @min-[1600px]/main:text-[15px]" : "text-[15px] @min-[1600px]/main:text-[17px]")}>—</b> : null}
              <span className={cn("num truncate", tight ? "text-xs leading-[1.1]" : "min-h-[14px] text-[12.5px] leading-[1.15]")}>{dev}</span>
              <span className={cn("mt-auto block", tight ? "pt-1" : "pt-1.5")}>{x ? <span className={cn("flex overflow-hidden rounded-full", tight ? "h-[3px]" : "h-1")}>{Object.entries(x.pts).sort((a, b) => b[1] - a[1]).map(([p, y]) => <i key={p} style={{ width: (y / v * 100).toFixed(1) + "%", background: pointColor(p, c.settings.points) }} />)}</span> : <span className={cn("block", tight ? "h-[3px]" : "h-1")} />}</span>
            </button>);
        }))}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
        {legend.map((p) => <span key={p} className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-full" style={{ background: pointColor(p, c.settings.points) }} />{p}</span>)}
        {tgt ? <span className="ml-auto inline-flex items-center gap-1.5"><i className="size-2 rounded-full bg-plus" />план дня выполнен · ± к плану дня</span> : null}
      </div>
    </Card>
  );
}

/** итог выбранного дня; стрелки листают дни */
export function DayBlock({ c, F, cal, onOpenDay, i = 0 }: { c: Ctx; F: Filter; cal: Cal; onOpenDay: (d: string) => void; i?: number }) {
  const { calSel, day } = cal;
  const dt = calSel ? pd(calSel) : null;
  const arrows = (
    <span className="inline-flex items-center gap-1">
      <Button type="button" variant="secondary" size="icon-sm" aria-label="Предыдущий день" disabled={!calSel} onClick={() => cal.step(-1)}><ChevronLeft /></Button>
      <Button type="button" variant="secondary" size="icon-sm" aria-label="Следующий день" disabled={!calSel || calSel >= c.today} onClick={() => cal.step(1)}><ChevronRight /></Button>
    </span>);
  const pts = F.point === "all" ? c.settings.points : [F.point];
  const tops = day ? Object.entries(day.prod).sort((a, b) => b[1] - a[1]).slice(0, 2) : [];
  return (
    <Card title={dt ? `${dt.getDate()} ${monthGen(calSel.slice(0, 7))} · ${WD_FULL[dt.getDay()]}` : "Выберите день"} action={arrows} i={i}
      className="gap-0 border-primary/30 bg-[linear-gradient(160deg,color-mix(in_srgb,var(--primary)_16%,var(--card)),var(--card)_58%)]">
      {!dt || !day ? <p className="mt-2 text-[15px] text-muted-foreground">В этом месяце продаж пока нет.</p> : !day.rev ? <p className="mt-2 text-[15px] text-muted-foreground">{dt.getDay() === 0 ? "Воскресенье — выходной." : "В этот день продаж нет."}{day.ex ? ` Расходы дня ${fmt(day.ex)}.` : ""}</p> : <>
        <span className="num mt-3 block text-4xl leading-none font-extrabold tracking-[-0.02em] @min-[640px]/main:text-[44px]">{fmt(day.rev)}</span>
        <p className="mt-2 mb-2 text-sm text-muted-foreground">{ckWord(day.ck)} · средний {fmt(day.ck ? day.rev / day.ck : 0)}{day.ex ? ` · расходы ${fmt(day.ex)}` : ""}</p>
        <Rows cols="1fr auto" phone="1fr auto">
          {pts.map((p) => <Row key={p} className="min-h-9"><RowName title={p} dot={pointColor(p, c.settings.points)} /><RowCell right className={cn(!day.pts[p] && "font-normal text-muted-foreground")}>{day.pts[p] ? fmt(day.pts[p]) : "—"}</RowCell></Row>)}
        </Rows>
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {([["Нал", day.pay.c], ["Терминал", day.pay.t], ["QR", day.pay.q]] as const).map(([l, v]) => <div key={l}><div className="text-[13px] font-semibold tracking-[.06em] text-muted-foreground uppercase">{l}</div><div className="num mt-0.5 text-lg font-extrabold">{calShort(v)}</div></div>)}
        </div>
        {tops.length > 0 && <>
          <div className="mt-2.5 text-[13px] font-semibold tracking-[.06em] text-muted-foreground uppercase">Больше всего</div>
          <Rows cols="1fr auto" phone="1fr auto">{tops.map(([k, v]) => <Row key={k} className="min-h-9 text-sm"><span className="line-clamp-2 min-w-0 leading-tight break-words" title={k}>{k}</span><RowCell right className="text-[15px]">{fmt(v)}</RowCell></Row>)}</Rows></>}
        <Button type="button" className="mt-auto h-10 w-full rounded-full text-sm" onClick={() => onOpenDay(calSel)}>Открыть журнал дня</Button></>}
    </Card>
  );
}

/** список дней месяца с выручкой и отклонением к плану: телефон и планшет; на телефоне можно раскрыть весь месяц */
export function DayList({ c, cal, i = 0 }: { c: Ctx; cal: Cal; i?: number }) {
  const { o, M, calSel } = cal, { byD, best, tgt } = o, today = c.today, [all, setAll] = useState(false);
  const last = today < monthEnd(M) ? today : monthEnd(M), ds: string[] = [];
  for (let d = last; d >= M + "-01"; d = addD(d, -1)) ds.push(d);
  const shown = all ? ds : ds.slice(0, 6);
  return (
    <Card title={`Дни ${monthGen(M)}`} note="выручка · к плану" i={i} className="gap-1">
      {shown.map((d) => {
        const x = byD[d], v = x ? x.rev : 0, sun = pd(d).getDay() === 0, on = d === calSel, pl = planOf(c, cal, d), ok = !!tgt && v >= tgt;
        return (
          <button key={d} type="button" aria-pressed={on} onClick={() => cal.setSel(d)}
            className={cn("grid min-h-[52px] w-full grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-2.5 border-t border-foreground/8 text-left outline-none first:border-t-0 focus-visible:ring-3 focus-visible:ring-primary/30", sun && !x && "opacity-60")}>
            <span className={cn("flex size-10 flex-col items-center justify-center rounded-xl leading-none", on ? "bg-primary/22 ring-2 ring-primary" : ok ? "bg-primary/16" : "bg-foreground/6")}><b className={cn("num text-[15px]", sun && "text-minus")}>{+d.slice(8)}</b><span className="mt-0.5 text-[10px] text-muted-foreground">{WD[wdIdx(d)].toLowerCase()}</span></span>
            <span className="min-w-0 leading-tight">{x ? <><b className="num text-[15px]">{calShort(v)}</b>{best && best[0] === d && <Chip tone="plus" className="ml-2 h-[18px] px-1.5 text-[10px]">топ</Chip>}
              <small className="block truncate text-[13px] text-muted-foreground">{ckWord(x.ck.size)} · {Object.keys(x.pts).length} {plural(Object.keys(x.pts).length, "точка", "точки", "точек")}{ok ? " · план выполнен" : ""}</small></> : <span className="text-[15px]">{sun ? "выходной" : "—"}</span>}</span>
            <span className={cn("num text-[13px]", pl?.cls)}>{x && pl ? pl.text : ""}</span>
          </button>);
      })}
      {ds.length > 6 && <button type="button" onClick={() => setAll(!all)} className="mt-auto pt-1 text-center text-[13px] font-semibold text-primary hover:underline @min-[640px]/main:hidden">{all ? "Свернуть" : "Показать весь месяц"}</button>}
    </Card>
  );
}
