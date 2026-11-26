// Календарь продаж: яркость дня — выручка, цвет полоски — точки, план дня; справа итог выбранного дня.
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { Card } from "@/components/Card";
import { DUR, EASE } from "@/lib/motion";
import { useIsPhone } from "@/lib/useMedia";
import { cn } from "@/lib/utils";
import { Note } from "./parts";
import { MONTHS_F, WD, WD_FULL, wdIdx, calDayOf, calDefaultSel, calOf, calShort, dLong, fmt, monthEnd, monthGen, pd, plural, pointColor, type Ctx, type Filter } from "./logic";

const mS = (v: number) => (v < 0 ? "−" : "+") + calShort(Math.abs(v));
const mln = (v: number) => (v / 1e6).toFixed(1).replace(".", ",");
// подпись ячейки на телефоне — в млн; меньше 100 тыс. не округляем до нуля
const mlnCell = (v: number) => (v >= 1e5 ? mln(v) : "<0,1");
const plOff = (c: Ctx, d: string) => (c.plan.off || [0]).includes(pd(d).getDay());

export function Calendar({ c, F, jDay, onOpenDay, i = 0 }: { c: Ctx; F: Filter; jDay: string; onOpenDay: (d: string) => void; i?: number }) {
  const isPhone = useIsPhone();
  const [calM, setCalM] = useState(""), [sel, setSel] = useState(""), [dir, setDir] = useState(0);
  const o = useMemo(() => calOf(c, F, calM, jDay), [c, F, calM, jDay]);
  const { M, months, byD, mx, best, total, wd, tgt, P } = o, today = c.today;
  const calSel = sel && sel.startsWith(M) ? sel : calDefaultSel(M, byD, jDay);
  const shift = (k: number) => { const d = pd(M + "-01"); d.setMonth(d.getMonth() + k); setCalM(d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0")); setDir(k); setSel(""); };
  const go = (m: string, s: string) => { setDir(m < M ? -1 : 1); setCalM(m); setSel(s); };

  const first = pd(M + "-01"), lead = (first.getDay() + 6) % 7, n = +monthEnd(M).slice(8), cells: (string | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= n; d++) cells.push(M + "-" + String(d).padStart(2, "0"));
  while (cells.length % 7) cells.push(null);
  const weeks: (string | null)[][] = []; for (let w = 0; w < cells.length; w += 7) weeks.push(cells.slice(w, w + 7));
  const weekInfo = weeks.map((wk) => {
    const days = wk.filter(Boolean) as string[]; const wsum = days.reduce((a, d) => a + (byD[d]?.rev || 0), 0);
    let plan: { text: string; cls: string; sub: string } | null = null;
    if (P) {
      const wdays = days.filter((d) => !plOff(c, d)), wPlan = tgt * wdays.length, wF = days.reduce((a, d) => a + (o.byP[d] || 0), 0), past = days.every((d) => d < today), fut = days.every((d) => d > today), left = wPlan - wF;
      plan = { sub: "план " + calShort(wPlan), ...(fut ? { text: "нужно " + calShort(wPlan), cls: "text-muted-foreground" } : past ? { text: mS(wF - wPlan), cls: wF >= wPlan ? "text-plus" : "text-minus" } : { text: left <= 0 ? mS(-left) : "ост. " + calShort(left), cls: left <= 0 ? "text-plus" : "text-muted-foreground" }) };
    }
    return { days, wsum, plan };
  });
  const day = calSel ? calDayOf(c, F, o.base, calSel) : null;
  const legend = [...new Set(o.list.map((s) => s.point))];

  return (
    <Card title="Календарь продаж" i={i}>
      <Note>Чем ярче день, тем больше выручка. Нажмите на день — {isPhone ? "ниже" : "справа"} появится его итог.</Note>
      <div className="flex flex-wrap items-center gap-1">
        <Button type="button" variant="secondary" size="icon-sm" aria-label="Предыдущий месяц" disabled={M <= months[0]} onClick={() => shift(-1)}><ChevronLeft /></Button>
        <b className="min-w-[9rem] text-center text-[14px]" aria-live="polite">{MONTHS_F[+M.slice(5, 7) - 1]} {M.slice(0, 4)}</b>
        <Button type="button" variant="secondary" size="icon-sm" aria-label="Следующий месяц" disabled={M >= months[months.length - 1]} onClick={() => shift(1)}><ChevronRight /></Button>
        <Button type="button" variant="secondary" size="sm" className="ml-2 max-sm:h-9" onClick={() => go(today.slice(0, 7), today)}>Сегодня</Button></div>
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        <Sum l="Выручка за месяц" v={fmt(total)} /><Sum l="Дней с продажами" v={String(wd)} /><Sum l="В среднем за день" v={fmt(wd ? total / wd : 0)} />
        {best && <Sum l="Лучший день" v={`${+best[0].slice(8)} ${monthGen(M)} · ${calShort(best[1].rev)}`} />}
      </div>
      {P && (() => {
        const pct = P.fact / P.tot, ok = P.fact >= P.tot, S = P.S, K = P.K, cls = ok ? "text-plus" : pct >= (K.done.length / K.work.length) * 0.95 ? "text-warn" : "text-minus";
        return (
          <div className="glass-inner grid gap-2 rounded-2xl p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]"><span>План {F.point === "all" ? "месяца" : F.point}: <b className="num">{fmt(P.tot)}</b></span><b className={cn("num", cls)}>{Math.round(pct * 100)}% выполнено</b></div>
            <div className="relative h-2 overflow-hidden rounded-full bg-muted"><i className={cn("block h-full rounded-full", ok ? "bg-plus" : "bg-primary")} style={{ width: Math.min(100, pct * 100).toFixed(1) + "%" }} />
              {!K.past && !K.future && <s title="Где нужно быть сегодня по графику" className="absolute inset-y-0 w-0.5 bg-foreground/60 no-underline" style={{ left: Math.min(100, K.done.length / K.work.length * 100).toFixed(1) + "%" }} />}</div>
            <div className="grid grid-cols-2 gap-2 text-[12.5px] text-muted-foreground sm:grid-cols-4">
              <Sum l="Сделано" v={fmt(P.fact)} flat /><Sum l={ok ? "Перевыполнено" : "Осталось"} v={fmt(Math.abs(P.tot - P.fact))} flat tone={ok ? "plus" : undefined} />
              <Sum l="План в день" v={fmt(tgt)} flat />
              <Sum l={K.past ? "Месяц закрыт" : ok ? "Нужно в день" : "Нужно теперь в день"} v={K.past || ok ? "—" : fmt(S.needDay)} flat tone={!K.past && !ok && S.needDay > tgt ? "minus" : undefined} sub={K.past || ok ? "" : `на ${K.left.length} ${plural(K.left.length, "рабочий день", "рабочих дня", "рабочих дней")}`} />
            </div>
          </div>);
      })()}
      <div className="grid gap-3.5 @4xl/main:grid-cols-[minmax(0,1fr)_300px]">
        <motion.div key={M} initial={{ opacity: 0, x: dir * 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: DUR.base, ease: EASE.out }} className="min-w-0">
          {isPhone ? <div className="grid gap-1" role="list" aria-label="Дни месяца">
            {cells.filter((d): d is string => !!d).map((d) => {
              const x = byD[d], v = x ? x.rev : 0, dow = pd(d).getDay(), off = dow === 0 || dow === 6, fut = d > today, on = d === calSel, isT = d === today;
              return (
                <button key={d} type="button" data-cd={d} aria-pressed={on} disabled={fut} onClick={() => setSel(d)}
                  className={cn("relative flex min-h-11 items-center gap-3 overflow-hidden rounded-xl border px-3 py-1.5 text-left outline-none transition focus-visible:ring-3 focus-visible:ring-primary/40",
                    "bg-[color-mix(in_srgb,var(--primary)_calc(var(--h)*22%),var(--muted))]", on ? "border-primary ring-2 ring-primary/50" : isT ? "border-foreground/40" : "border-transparent", fut && "opacity-40", off && !on && "opacity-60")}
                  style={{ ["--h" as string]: (v / mx).toFixed(3) }}>
                  <span className="flex w-12 shrink-0 items-baseline gap-1"><b className="num text-[15px]">{+d.slice(8)}</b><span className="text-[12px] text-muted-foreground">{WD[wdIdx(d)]}</span></span>
                  <b className="num min-w-0 flex-1 text-[14px] whitespace-nowrap">{x ? fmt(v) : dow === 0 ? "выходной" : fut ? "" : "—"}</b>
                  {x && <span className="shrink-0 text-[12px] whitespace-nowrap text-muted-foreground">{x.ck.size} {plural(x.ck.size, "чек", "чека", "чеков")}</span>}
                  {x && <span className="flex shrink-0 gap-1">{Object.keys(x.pts).sort((p, q) => x.pts[q] - x.pts[p]).map((p) => <i key={p} title={p} className="size-2.5 rounded-full" style={{ background: pointColor(p, c.settings.points) }} />)}</span>}
                  {tgt && v >= tgt ? <i title="План дня выполнен" className="size-1.5 shrink-0 rounded-full bg-plus" /> : null}
                </button>);
            })}
          </div> : <>
          <div className="grid grid-cols-7 gap-1 pb-1 text-center text-[11px] font-semibold text-muted-foreground @lg/main:grid-cols-[repeat(7,minmax(0,1fr))_92px] sm:gap-1.5">
            {[...WD, "Неделя"].map((x, i) => <span key={x} className={i === 7 ? "hidden @lg/main:block" : ""}>{x}</span>)}</div>
          <div className="grid gap-1 sm:gap-1.5">
            {weeks.map((wk, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1 @lg/main:grid-cols-[repeat(7,minmax(0,1fr))_92px] sm:gap-1.5">
                {wk.map((d, di) => {
                  if (!d) return <div key={di} aria-hidden />;
                  const x = byD[d], v = x ? x.rev : 0, sun = pd(d).getDay() === 0, fut = d > today, top = best && best[0] === d, on = d === calSel;
                  const bp = o.byP[d] || 0, showPlan = P && !sun && !plOff(c, d);
                  return (
                    <button key={d} type="button" data-cd={d} aria-pressed={on} disabled={fut} onClick={() => setSel(d)} title={dLong(d) + (x ? ": " + fmt(v) + " сум" : "")}
                      style={{ ["--h" as string]: (v / mx).toFixed(3) }}
                      className={cn("relative flex min-h-[3.6rem] min-w-0 flex-col justify-between overflow-hidden rounded-xl border p-1 text-left outline-none transition focus-visible:ring-3 focus-visible:ring-primary/40 sm:min-h-[5.2rem] sm:p-1.5",
                        "bg-[color-mix(in_srgb,var(--primary)_calc(var(--h)*34%),var(--muted))]",
                        on ? "border-primary ring-2 ring-primary/50" : "border-transparent", d === today && !on && "border-foreground/40", fut && "opacity-40", sun && !x && "opacity-60", !fut && "hover:brightness-110")}>
                      <span className="flex items-center justify-between"><span className="num text-[12px] font-semibold">{+d.slice(8)}</span>
                        {(tgt && v >= tgt ? <i title="План дня выполнен" className="size-1.5 rounded-full bg-plus" /> : null)}{top && <span className="text-[9px] font-bold text-primary max-sm:hidden">топ</span>}</span>
                      <span className="grid gap-px">
                        <b className="num truncate text-[11px] leading-none sm:text-[12.5px]"><span className="max-sm:hidden">{x ? calShort(v) : sun ? "выходной" : fut ? "" : "—"}</span><span className="sm:hidden">{x ? mlnCell(v) : sun || fut ? "" : "—"}</span></b>
                        {showPlan && <span className="num hidden truncate text-[10px] leading-none sm:block">{fut || (d === today && !x) ? <span className="text-muted-foreground">нужно {mln(P.S.needDay || tgt)}</span> : <span className={bp >= tgt ? "text-plus" : "text-minus"}>{mS(bp - tgt)}</span>}</span>}
                        {x && <span className="mt-0.5 flex h-1 overflow-hidden rounded-full">{Object.entries(x.pts).sort((a, b) => b[1] - a[1]).map(([p, y]) => <i key={p} style={{ width: (y / v * 100).toFixed(1) + "%", background: pointColor(p, c.settings.points) }} />)}</span>}
                      </span>
                    </button>);
                })}
                <div className="hidden flex-col justify-center rounded-xl bg-muted/60 px-2 py-1 text-right @lg/main:flex"><span className="text-[10px] text-muted-foreground">Неделя</span><b className="num text-[13px]">{weekInfo[wi].wsum ? calShort(weekInfo[wi].wsum) : "—"}</b>
                  {weekInfo[wi].plan && <><small className="text-[10px] text-muted-foreground">{weekInfo[wi].plan!.sub}</small><em className={cn("num text-[10.5px] not-italic", weekInfo[wi].plan!.cls)}>{weekInfo[wi].plan!.text}</em></>}</div>
              </div>))}
          </div></>}
        </motion.div>
        <aside aria-live="polite" className="glass-inner grid content-start gap-3 self-start rounded-2xl p-4 @4xl/main:col-start-2 @4xl/main:row-span-2 @4xl/main:row-start-1">
          {!calSel || !day ? <><div className="text-[15px] font-semibold">Выберите день</div><div className="text-[13px] text-muted-foreground">В этом месяце продаж пока нет.</div></> : (() => {
            const dt = pd(calSel), tops = Object.entries(day.prod).sort((a, b) => b[1] - a[1]).slice(0, 3);
            return <>
              <div><div className="text-[12px] font-semibold text-muted-foreground">{dt.getDate()} {monthGen(calSel.slice(0, 7))} · {WD_FULL[dt.getDay()]}</div>
                <div className="num text-[26px] font-semibold tracking-tight">{fmt(day.rev)}</div>
                <div className="text-[12.5px] text-muted-foreground">{day.ck} {plural(day.ck, "чек", "чека", "чеков")} · средний {fmt(day.ck ? day.rev / day.ck : 0)}{day.ex ? ` · расходы ${fmt(day.ex)}` : ""}</div></div>
              {day.rev ? <>
                <div className="grid gap-2">{Object.entries(day.pts).sort((a, b) => b[1] - a[1]).map(([p, v]) => <div key={p} className="grid gap-1"><div className="flex justify-between text-[13px]"><span>{p}</span><b className="num">{fmt(v)}</b></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted"><i className="block h-full rounded-full" style={{ width: (v / day.rev * 100).toFixed(1) + "%", background: pointColor(p, c.settings.points) }} /></div></div>)}</div>
                <div className="grid grid-cols-3 gap-2 text-[12px] text-muted-foreground"><div>Нал<b className="num block text-[13px] text-foreground">{calShort(day.pay.c)}</b></div><div>Терминал<b className="num block text-[13px] text-foreground">{calShort(day.pay.t)}</b></div><div>QR<b className="num block text-[13px] text-foreground">{calShort(day.pay.q)}</b></div></div>
                <div><h4 className="text-[12px] font-semibold text-muted-foreground uppercase">Больше всего</h4><div className="mt-1 grid gap-1">{tops.map(([k, v]) => <div key={k} className="flex justify-between gap-3 text-[13px]"><span className="truncate" title={k}>{k}</span><b className="num shrink-0">{fmt(v)}</b></div>)}</div></div>
                <Button type="button" onClick={() => onOpenDay(calSel)}>Открыть журнал дня</Button></>
                : <div className="text-[13px] text-muted-foreground">{dt.getDay() === 0 ? "Воскресенье — выходной." : "В этот день продаж нет."}</div>}
            </>;
          })()}
        </aside>
        <div className="min-w-0 @4xl/main:col-start-1 @4xl/main:row-start-2">
          {weekInfo.length > 0 && <div className="@lg/main:hidden"><h4 className="mb-1 text-[12px] font-semibold text-muted-foreground uppercase">По неделям</h4>
            <div className="grid gap-1">{weekInfo.map((w, i) => <div key={i} className="flex items-baseline justify-between gap-2 text-[13px]"><span className="num text-muted-foreground">{+w.days[0].slice(8)}–{+w.days[w.days.length - 1].slice(8)}</span><b className="num">{w.wsum ? calShort(w.wsum) : "—"}</b>
              {w.plan && <span className={cn("num text-[12px]", w.plan.cls)}>{w.plan.text}</span>}</div>)}</div></div>}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
            <span className="sm:hidden">в ячейках млн сум</span>
            <span className="inline-flex items-center gap-1.5">меньше<span className="h-2 w-16 rounded-full" style={{ background: "linear-gradient(90deg,var(--muted),var(--primary))" }} />больше</span>
            {legend.map((p) => <span key={p} className="inline-flex items-center gap-1.5"><i className="size-2 rounded-full" style={{ background: pointColor(p, c.settings.points) }} />{p}</span>)}
            {tgt ? <span className="inline-flex items-center gap-1.5"><i className="size-2 rounded-full bg-plus" />план дня выполнен</span> : null}</div>
        </div>
      </div>
    </Card>
  );
}

function Sum({ l, v, sub, flat, tone }: { l: string; v: string; sub?: string; flat?: boolean; tone?: "plus" | "minus" }) {
  return <div className={cn("min-w-0 rounded-xl px-3 py-2", !flat && "glass-inner")}><span className="block truncate text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{l}</span>
    <b className={cn("num block text-[15px] max-sm:line-clamp-2 sm:truncate", tone === "plus" && "text-plus", tone === "minus" && "text-minus")}>{v}</b>{sub ? <small className="text-[11px] text-muted-foreground">{sub}</small> : null}</div>;
}
