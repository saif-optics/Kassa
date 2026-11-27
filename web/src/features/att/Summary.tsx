// «Сводка»: по сотрудникам за неделю или месяц — дни, опоздания, средний приход, часы, смены без ухода, с итогом.
import { useMemo } from "react";
import { motion } from "motion/react";
import { CalendarCheck, Clock, Timer, Users } from "lucide-react";
import { Card } from "@/components/Card";
import { Fold } from "@/components/Fold";
import { Chip, Tile, TileLabel, TileValue } from "@/components/Tile";
import { land } from "@/lib/motion";
import { useMedia } from "@/lib/useMedia";
import { cn } from "@/lib/utils";
import { Avatar, PointChip, usePointCol } from "@/features/users/common";
import { initials } from "@/features/users/logic";
import { useAttEvents, useAttRefs } from "./hooks";
import { fmtH, fmtMin, hm, mins, periodOf, shifts, startOf, todayStr } from "./logic";
import type { Per } from "./nav";

type Sum = { id: string; name: string; pts: string[]; days: number; late: number; lateMin: number; work: number; inSum: number; inN: number; noOut: number };
const SCOLS = "grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_64px_104px_120px_112px_80px_130px]";

export function Summary({ day, per, pt }: { day: string; per: Per; pt: string }) {
  const cards = useMedia("(max-width: 1023px)");
  const { from, to } = periodOf(day, per);
  const refs = useAttRefs(), ev = useAttEvents(from, to, false);
  const points = refs.data?.points || [], emps = refs.data?.emps || [];
  const col = usePointCol(points.map((p) => p.point));
  const start = startOf(points);
  const rows = useMemo<Sum[]>(() => {
    const by = new Map<string, Sum>();
    for (const s of shifts(ev.data || [], start).filter((x) => !pt || x.point === pt)) {
      const r = by.get(s.emp) || { id: s.emp, name: emps.find((e) => e.id === s.emp)?.name || "—", pts: [], days: 0, late: 0, lateMin: 0, work: 0, inSum: 0, inN: 0, noOut: 0 };
      r.days++; if (!r.pts.includes(s.point)) r.pts.push(s.point);
      if (s.late) { r.late++; r.lateMin += s.late; }
      r.work += s.work;
      if (s.in) { r.inSum += mins(hm(s.in.ts)); r.inN++; }
      if (s.in && !s.out && s.day !== todayStr()) r.noOut++; // смена сегодня ещё идёт — не «без ухода»
      by.set(s.emp, r);
    }
    return [...by.values()].sort((a, b) => b.lateMin - a.lateMin || a.name.localeCompare(b.name, "ru"));
  }, [ev.data, start, pt, emps]);
  const tot = rows.reduce((a, r) => ({ days: a.days + r.days, late: a.late + r.late, lateMin: a.lateMin + r.lateMin, work: a.work + r.work, inSum: a.inSum + r.inSum, inN: a.inN + r.inN, noOut: a.noOut + r.noOut }), { days: 0, late: 0, lateMin: 0, work: 0, inSum: 0, inN: 0, noOut: 0 });
  const avg = (r: { inSum: number; inN: number }) => (r.inN ? fmtH(Math.round(r.inSum / r.inN)) : "—");
  const err = ev.isError ? (ev.error instanceof Error ? ev.error.message : "Не удалось загрузить") : "";

  let k = 0; const nx = () => Math.min(k++, 8);
  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-2 gap-3.5 @min-[900px]/main:grid-cols-4">
        <Tile i={nx()} hero icon={Users}><TileLabel>Сотрудников отмечалось</TileLabel><TileValue count={rows.length} /></Tile>
        <Tile i={nx()} icon={Clock} tone="warn" glow={tot.late ? "warn" : null}><TileLabel>Опозданий</TileLabel><TileValue count={tot.late} /></Tile>
        <Tile i={nx()} icon={Timer} tone="minus" glow={tot.lateMin ? "minus" : null}><TileLabel>Всего опоздали</TileLabel><TileValue>{fmtH(tot.lateMin)}</TileValue></Tile>
        <Tile i={nx()} icon={CalendarCheck} tone="plus" glow="plus"><TileLabel>Средний приход</TileLabel><TileValue>{avg(tot)}</TileValue></Tile>
      </div>
      <Card i={nx()} title={per === "week" ? "Сводка за неделю" : "Сводка за месяц"} note={cards ? undefined : "опоздания — от времени начала работы точки"}>
        {err && <p className="px-1 py-6 text-[13.5px] text-minus">{err}</p>}
        {!err && ev.isLoading && <p className="px-1 py-6 text-[13.5px] text-muted-foreground">Загрузка…</p>}
        {!err && !ev.isLoading && !rows.length && <p className="px-4 py-10 text-center text-[13.5px] text-muted-foreground">Пока нет отметок. Выберите другой период или точку.</p>}
        {rows.length > 0 && !cards && (
          <div role="table" aria-label="Сводка">
            <div role="row" className={cn("grid items-center gap-x-3 px-2 pb-2 text-[11.5px] font-semibold tracking-[.06em] text-muted-foreground uppercase", SCOLS)}>
              <span className="pl-[52px]">Сотрудник</span><span>Точки</span><span>Дней</span><span>Опозданий</span><span>Всего опоздал</span><span>Средний приход</span><span>Часов</span><span>Без ухода</span>
            </div>
            <Fold id="att.sum" rows={rows} limit={12}>{(shown) => <div>{shown.map((r, i) => (
              <motion.div key={r.id} {...land(Math.min(i, 6))} role="row" className={cn("grid items-center gap-x-3 border-t border-border/60 px-2 py-2 text-[13.5px]", SCOLS)}>
                <div className="flex min-w-0 items-center gap-3"><Avatar text={initials(r.name)} color={col(r.pts[0])} /><span className="min-w-0 font-bold">{r.name}</span></div>
                <div className="flex flex-wrap gap-1">{r.pts.map((p) => <PointChip key={p} color={col(p)}>{p}</PointChip>)}</div>
                <div className="num font-semibold">{r.days}</div>
                <div><Chip tone={r.late ? "warn" : "plus"} className="num">{r.late}</Chip></div>
                <div className="num">{r.lateMin ? fmtMin(r.lateMin) : "—"}</div>
                <div className="num">{avg(r)}</div>
                <div className="num font-semibold">{fmtH(r.work)}</div>
                <div>{r.noOut ? <Chip tone="warn">без ухода · {r.noOut}</Chip> : <span className="text-muted-foreground">—</span>}</div>
              </motion.div>))}</div>}</Fold>
            <div role="row" className={cn("grid items-center gap-x-3 border-t-2 border-border px-2 pt-3 text-[13.5px] font-bold", SCOLS)}>
              <span className="pl-[52px]">Итого</span><span /><span className="num">{tot.days}</span><span className="num">{tot.late}</span><span className="num">{tot.lateMin ? fmtMin(tot.lateMin) : "—"}</span><span className="num">{avg(tot)}</span><span className="num">{fmtH(tot.work)}</span><span className="num">{tot.noOut || "—"}</span>
            </div>
          </div>
        )}
        {rows.length > 0 && cards && (
          <Fold id="att.sum" rows={rows} limit={8} className="flex flex-col gap-2">{(shown) => <div className="flex flex-col gap-2">{shown.map((r, i) => (
            <motion.div key={r.id} {...land(Math.min(i, 5))} className="glass-inner flex flex-col gap-2.5 rounded-[20px] p-3.5">
              <div className="flex items-center gap-3"><Avatar text={initials(r.name)} color={col(r.pts[0])} size={42} />
                <div className="min-w-0 flex-1"><div className="font-bold">{r.name}</div><div className="text-[12.5px] text-muted-foreground">{r.pts.join(", ")}</div></div>
                <Chip tone={r.late ? "warn" : "plus"} className="num">{r.late ? `опозданий ${r.late}` : "без опозданий"}</Chip></div>
              <dl className="grid grid-cols-4 gap-2 text-center text-[12px] text-muted-foreground">
                {([["дней", r.days], ["средний приход", avg(r)], ["часов", fmtH(r.work)], ["опоздал", r.lateMin ? fmtH(r.lateMin) : "—"]] as const).map(([t, v]) => <div key={t}><dd className="num text-[15px] font-bold text-foreground">{v}</dd><dt>{t}</dt></div>)}
              </dl>
              {r.noOut > 0 && <Chip tone="warn" className="w-fit">без ухода · {r.noOut}</Chip>}
            </motion.div>))}</div>}</Fold>
        )}
      </Card>
    </div>
  );
}
