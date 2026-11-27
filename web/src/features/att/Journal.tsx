// «Журнал дня»: плитки, таблица отметок, лента вживую, по точкам, киоски и «вовремя» за неделю.
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, Clock, LogIn, LogOut, Monitor, ScanFace, Smartphone } from "lucide-react";
import { Card } from "@/components/Card";
import { Fold } from "@/components/Fold";
import { Chip, Tile, TileLabel, TileSub, TileValue } from "@/components/Tile";
import { DUR, EASE, land } from "@/lib/motion";
import { useMedia } from "@/lib/useMedia";
import { cn } from "@/lib/utils";
import { HintCtx, Piece } from "@/features/analytics/Puzzle";
import { Avatar, Dot, DotChip, PointChip, usePointCol } from "@/features/users/common";
import { initials } from "@/features/users/logic";
import { useAttDay, useAttEvents } from "./hooks";
import { DaySheet } from "./DaySheet";
import { addDays, dayOf, deviceKind, fmtH, hm, pct, shifts, todayStr, wdOf, type AttEmp, type AttEvent, type Shift } from "./logic";

type Row = { key: string; emp?: AttEmp; name: string; point: string; sh: Shift | null };
const JCOLS = "grid-cols-[minmax(0,1.5fr)_128px_64px_96px_64px_112px_minmax(0,1fr)_132px]";

const Dev = ({ ua, label }: { ua?: string | null; label?: boolean }) => {
  const d = deviceKind(ua);
  if (!d) return <span className="text-muted-foreground">—</span>;
  const I = d.kind === "phone" ? Smartphone : Monitor;
  return <span className="inline-flex items-center gap-1.5 whitespace-nowrap"><I className="size-4 text-muted-foreground" />{label !== false && d.label}</span>;
};

function status(sh: Shift | null): { t: string; c: string } {
  if (!sh) return { t: "не отметился", c: "var(--minus)" };
  if (sh.last.kind === "out") return { t: "ушёл", c: "var(--chart-2)" };
  if (sh.late > 0) return { t: "опоздал", c: "var(--warn)" };
  return { t: "на работе", c: "var(--plus)" };
}

export function Journal({ day, pt, live, wide }: { day: string; pt: string; live: boolean; wide: boolean }) {
  const cards = useMedia("(max-width: 1023px)");
  const { points, emps, events, start, ev, refs } = useAttDay(day);
  const today = todayStr();
  const week = useAttEvents(addDays(today, -6), today);
  const col = usePointCol(points.map((p) => p.point));
  const [sel, setSel] = useState<Row | null>(null);

  const empBy = useMemo(() => new Map(emps.map((e) => [e.id, e])), [emps]);
  const nameOf = (id: string) => empBy.get(id)?.name || "—";
  const sh = useMemo(() => shifts(events, start).filter((s) => !pt || s.point === pt), [events, start, pt]);
  const act = emps.filter((e) => e.active && (!pt || e.point === pt));
  const came = new Set(sh.map((s) => s.emp));
  const absent = day <= today ? act.filter((e) => !came.has(e.id)) : [];
  const rows: Row[] = [
    ...[...sh].sort((a, b) => (a.in?.ts || "z").localeCompare(b.in?.ts || "z")).map((s) => ({ key: s.emp, emp: empBy.get(s.emp), name: nameOf(s.emp), point: s.point, sh: s })),
    ...absent.map((e) => ({ key: "abs" + e.id, emp: e, name: e.name, point: e.point, sh: null })),
  ];

  // плитки
  const ins = sh.filter((s) => s.in), lates = ins.filter((s) => s.late > 0).sort((a, b) => b.late - a.late);
  const outs = sh.filter((s) => s.out);
  const firstIn = ins.length ? ins.reduce((a, s) => (s.in!.ts < a ? s.in!.ts : a), ins[0].in!.ts) : null;
  const lastOut = outs.length ? outs.reduce((a, s) => (s.out!.ts > a ? s.out!.ts : a), outs[0].out!.ts) : null;
  const total = Math.max(act.length, ins.length);
  const names = absent.slice(0, 2).map((e) => e.name.split(" ")[0]).join(", ") + (absent.length > 2 ? ` и ещё ${absent.length - 2}` : "");

  // лента: свежие сверху; опоздавшие приходы помечаем
  const lateIds = useMemo(() => new Set(sh.filter((s) => s.late > 0 && s.in).map((s) => s.in!.id)), [sh]);
  const feed = useMemo(() => [...events].filter((e) => !pt || e.point === pt).reverse(), [events, pt]);

  // по точкам
  const perPt = points.map((p) => { const n = new Set(sh.filter((s) => s.point === p.point && s.in).map((s) => s.emp)).size; const m = emps.filter((e) => e.active && e.point === p.point).length; return { p: p.point, n, m: Math.max(m, n) }; });

  // киоски: по последней отметке точки за неделю
  const weekEv = (week.data || []) as AttEvent[];
  const kiosks = points.map((p) => { const last = [...weekEv].reverse().find((e) => e.point === p.point); return { p: p.point, last, dev: [...weekEv].reverse().find((e) => e.point === p.point && e.device)?.device }; });

  // вовремя за неделю (по выбранной точке)
  const wk = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6)).map((d) => {
    const ss = shifts(weekEv.filter((e) => dayOf(e.ts) === d && (!pt || e.point === pt)), start).filter((s) => s.in);
    return { d, n: ss.length, v: ss.length ? Math.round((ss.filter((s) => s.late === 0).length / ss.length) * 100) : null };
  });

  const err = ev.isError || refs.isError;
  const msg = err ? String((ev.error || refs.error) instanceof Error ? (ev.error || refs.error)!.message : "Не удалось загрузить") : "";

  let k = 0; const nx = () => Math.min(k++, 8);
  const tiles = (
    <div className="grid grid-cols-2 gap-3.5 @min-[900px]/main:grid-cols-4">
      <Tile i={nx()} hero heroColor="var(--piece-green)" icon={LogIn}>
        <TileLabel>Пришли</TileLabel>
        <div className="flex flex-col @min-[640px]/main:flex-row @min-[640px]/main:items-end @min-[640px]/main:justify-between @min-[640px]/main:gap-3">
          <span className="flex items-baseline gap-2"><TileValue count={ins.length} /><span className="num text-[15px] font-bold text-white/80 @min-[640px]/main:text-lg">из {total}</span></span>
          <TileSub className="mt-1 @min-[640px]/main:mt-0"><span>{firstIn ? `первый ${hm(firstIn)}` : " "}</span></TileSub>
        </div>
      </Tile>
      <Tile i={nx()} icon={Clock} tone="warn" glow="warn">
        <TileLabel>Опоздали</TileLabel>
        <div className="flex flex-col @min-[640px]/main:flex-row @min-[640px]/main:items-end @min-[640px]/main:justify-between @min-[640px]/main:gap-3">
          <TileValue count={lates.length} />
          <TileSub className="mt-1 @min-[640px]/main:mt-0">{lates[0] ? <Chip tone="warn"><span className="truncate">+{lates[0].late} мин<span className="max-[639px]:hidden"> · {nameOf(lates[0].emp).split(" ")[0]}</span></span></Chip> : <span>{ins.length ? "все вовремя" : " "}</span>}</TileSub>
        </div>
      </Tile>
      <Tile i={nx()} icon={AlertCircle} tone="minus" glow="minus">
        <TileLabel>Не отметились</TileLabel>
        <div className="flex flex-col @min-[640px]/main:flex-row @min-[640px]/main:items-end @min-[640px]/main:justify-between @min-[640px]/main:gap-3">
          <TileValue count={absent.length} />
          <TileSub className="mt-1 @min-[640px]/main:mt-0"><span className="max-[639px]:hidden">{names || (day > today ? "день ещё не наступил" : " ")}</span></TileSub>
        </div>
      </Tile>
      <Tile i={nx()} icon={LogOut} tone="info" glow="info">
        <TileLabel>Ушли</TileLabel>
        <div className="flex flex-col @min-[640px]/main:flex-row @min-[640px]/main:items-end @min-[640px]/main:justify-between @min-[640px]/main:gap-3">
          <TileValue count={outs.length} />
          <TileSub className="mt-1 @min-[640px]/main:mt-0"><span className="max-[639px]:hidden">{lastOut ? `последний ${hm(lastOut)}` : ins.length ? "смена идёт" : " "}</span></TileSub>
        </div>
      </Tile>
    </div>
  );

  const open = (r: Row) => { if (r.sh) setSel(r); };

  const table = (
    <Card i={nx()} title="Отметки за день" note={cards ? undefined : "первый приход и последний уход · нажмите строку — все отметки и фото"}>
      {err && <p className="px-1 py-6 text-[13.5px] text-minus">{msg}</p>}
      {!err && ev.isLoading && <p className="px-1 py-6 text-[13.5px] text-muted-foreground">Загрузка…</p>}
      {!err && !ev.isLoading && !rows.length && <div className="px-4 py-10 text-center"><ScanFace className="mx-auto mb-2 size-8 text-muted-foreground/60" /><p className="font-semibold">Пока нет отметок</p><p className="mt-1 text-[13px] text-muted-foreground">Отметки появятся, когда сотрудники нажмут «Отметиться» на киоске точки</p></div>}
      {rows.length > 0 && !cards && (
        <div role="table" aria-label="Отметки за день">
          <div role="row" className={cn("grid items-center gap-x-3 px-2 pb-2 text-[11.5px] font-semibold tracking-[.06em] text-muted-foreground uppercase", JCOLS)}>
            <span className="pl-[52px]">Сотрудник</span><span>Точка</span><span>Приход</span><span>Опоздание</span><span>Уход</span><span>Где</span><span>Часов</span><span>Статус</span>
          </div>
          <Fold id="att.journal" rows={rows} limit={12}>{(shown) => <div>{shown.map((r, i) => <JRow key={r.key} r={r} i={i} col={col(r.point)} onOpen={open} />)}</div>}</Fold>
        </div>
      )}
      {rows.length > 0 && cards && (
        <Fold id="att.journal" rows={rows} limit={10} className="flex flex-col gap-2">{(shown) => <div className="flex flex-col gap-2">{shown.map((r, i) => <JCard key={r.key} r={r} i={i} col={col(r.point)} onOpen={open} />)}</div>}</Fold>
      )}
    </Card>
  );

  const feedPiece = (
    <Piece d={[0, 0, 1, 1]} bridge={{ dir: "v", d: "74%" }}>
      <div className="flex items-center justify-between gap-2 pb-1"><h2 className="text-lg font-bold">Лента отметок</h2>
        <DotChip color={live ? "var(--plus)" : "var(--chart-5)"} title={live ? "новые отметки появляются сами" : "обновляется раз в 30 секунд"} className="h-6 text-[12px]">{live ? "вживую" : "раз в 30 с"}</DotChip></div>
      {!feed.length ? <p className="py-3 text-[13px] text-muted-foreground">Пока тихо.</p> : (
        <Fold id="att.feed" rows={feed} limit={6}>{(shown) => (
          <ul className="flex flex-col">{shown.map((e, i) => <FeedRow key={e.id} e={e} i={i} late={lateIds.has(e.id)} name={nameOf(e.employee_id)} color={col(e.point)} />)}</ul>
        )}</Fold>
      )}
    </Piece>
  );
  const ptsPiece = (
    <Piece d={[0, 0, 1, 1]}>
      <h2 className="pb-1 text-lg font-bold">По точкам</h2>
      <ul className="flex flex-col gap-2.5">
        {perPt.map(({ p, n, m }) => (
          <li key={p} className="flex items-center gap-3 text-[13.5px]">
            <span className="flex w-[104px] shrink-0 items-center gap-2 truncate font-medium"><Dot color={col(p)} />{p}</span>
            <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted"><motion.i className="block h-full rounded-full" style={{ background: col(p) }} initial={{ width: 0 }} animate={{ width: `${m ? (n / m) * 100 : 0}%` }} transition={{ duration: DUR.slow, ease: EASE.out }} /></span>
            <span className="num w-14 shrink-0 text-right font-bold">{n} из {m}</span>
          </li>
        ))}
        {!perPt.length && <li className="text-[13px] text-muted-foreground">Точек пока нет.</li>}
      </ul>
    </Piece>
  );
  const kioskPiece = (
    <Piece d={[0, 0, 1, 1]}>
      <h2 className="pb-1 text-lg font-bold">Киоски</h2>
      <ul className="flex flex-col gap-2">
        {kiosks.map(({ p, last, dev }) => {
          const ago = last ? Math.max(0, Math.round((Date.now() - +new Date(last.ts)) / 60000)) : null, online = ago != null && ago < 60;
          return (
            <li key={p} className="flex items-center justify-between gap-2 text-[13.5px]">
              <span className="flex min-w-0 items-center gap-2"><Dev ua={dev} label={false} /><span className="min-w-0 truncate font-medium">{p}</span></span>
              <span className={cn("flex shrink-0 items-center gap-1.5 text-[12.5px] font-bold", online ? "text-plus" : "text-warn")}><Dot color={online ? "var(--plus)" : "var(--warn)"} />{ago == null ? "нет отметок" : online ? "онлайн" : ago < 24 * 60 ? `${Math.floor(ago / 60)} ч назад` : `${Math.floor(ago / 1440)} дн назад`}</span>
            </li>
          );
        })}
        {!kiosks.length && <li className="text-[13px] text-muted-foreground">Точек пока нет.</li>}
      </ul>
    </Piece>
  );
  const timePiece = (
    <Piece d={[0, 0, 1, 1]}>
      <div className="flex items-baseline justify-between gap-2 pb-1"><h2 className="text-lg font-bold">Вовремя, %</h2><span className="pz-s">неделя</span></div>
      <div className="flex h-[132px] items-end justify-between gap-2.5" role="img" aria-label={"Вовремя за неделю: " + wk.map((w) => `${wdOf(w.d)} ${w.v ?? "выходной"}`).join(", ")}>
        {wk.map((w) => (
          <div key={w.d} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
            <span className="num text-[12px] font-bold">{w.v ?? ""}</span>
            <div className="flex min-h-0 w-full flex-1 items-end"><motion.i className="block w-full rounded-t-md" style={{ background: w.v == null ? "var(--muted)" : w.v >= 95 ? "var(--plus)" : "var(--warn)" }}
              initial={{ height: 0 }} animate={{ height: w.v == null ? 3 : `${Math.max(6, w.v)}%` }} transition={{ duration: DUR.slow, ease: EASE.out }} /></div>
            <span className={cn("text-[11.5px]", w.d === today ? "font-bold text-foreground" : "text-muted-foreground")}>{wdOf(w.d)}</span>
          </div>
        ))}
      </div>
    </Piece>
  );

  return (
    <div className="flex flex-col gap-3.5">
      {tiles}
      <HintCtx.Provider value={false}>
        <div className={cn("grid items-start gap-3.5", wide ? "grid-cols-[minmax(0,1fr)_540px]" : "grid-cols-1")}>
          {table}
          <div className={cn("grid items-start gap-3.5", wide ? "grid-cols-1" : "@min-[900px]/main:grid-cols-2")}>
            <div className="pzc">{feedPiece}{ptsPiece}</div>
            <div className={cn("pzc", wide && "!grid !grid-cols-2")}>{kioskPiece}{timePiece}</div>
          </div>
        </div>
      </HintCtx.Provider>
      <DaySheet open={!!sel} onClose={() => setSel(null)} name={sel?.name || ""} color={col(sel?.point)} point={sel?.point || ""} shift={sel?.sh || null} start={start(sel?.point || "")} />
    </div>
  );
}

function JRow({ r, i, col, onOpen }: { r: Row; i: number; col: string; onOpen: (r: Row) => void }) {
  const s = r.sh, st = status(s), can = !!s;
  const hrs = s ? s.work || s.ongoing : 0;
  const dash = <span className="text-muted-foreground">—</span>;
  return (
    <motion.div {...land(Math.min(i, 6))} role="row" tabIndex={can ? 0 : undefined} onClick={() => onOpen(r)} onKeyDown={(e) => { if (can && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onOpen(r); } }}
      className={cn("grid items-center gap-x-3 rounded-xl border-t border-border/60 px-2 py-2 text-[13.5px] outline-none", JCOLS, can && "cursor-pointer transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary/40")}>
      <div className="flex min-w-0 items-center gap-3"><Avatar text={initials(r.name)} color={col} /><span className="min-w-0 font-bold leading-tight">{r.name}</span></div>
      <div><PointChip color={col}>{r.point}</PointChip></div>
      <div className="num text-[15px] font-bold">{s?.in ? hm(s.in.ts) : dash}</div>
      <div>{s?.in && s.late > 0 ? <Chip tone="warn" className="num h-7">+{s.late} мин</Chip> : dash}</div>
      <div className="num text-[15px] font-bold">{s?.out ? hm(s.out.ts) : dash}</div>
      <div>{s ? <Dev ua={(s.in || s.last).device} /> : dash}</div>
      <div className="flex items-center gap-2.5">{hrs ? <><span className="num w-10 shrink-0 font-bold">{fmtH(hrs)}</span><span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted"><i className="block h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (hrs / 600) * 100)}%` }} /></span></> : dash}</div>
      <div><DotChip color={st.c}>{st.t}</DotChip></div>
    </motion.div>
  );
}

function JCard({ r, i, col, onOpen }: { r: Row; i: number; col: string; onOpen: (r: Row) => void }) {
  const s = r.sh, st = status(s), d = s ? deviceKind((s.in || s.last).device) : null;
  return (
    <motion.div {...land(Math.min(i, 5))} role={s ? "button" : undefined} tabIndex={s ? 0 : undefined} onClick={() => onOpen(r)} onKeyDown={(e) => { if (s && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onOpen(r); } }}
      className={cn("glass-inner flex items-center gap-3 rounded-[20px] p-3.5 outline-none", s && "cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/40")}>
      <Avatar text={initials(r.name)} color={col} size={46} />
      <div className="min-w-0 flex-1">
        <div className="text-[15.5px] leading-tight font-bold">{r.name}</div>
        <div className="mt-1 flex items-center gap-1.5 text-[12.5px] text-muted-foreground"><Dot color={col} />{r.point}{d ? ` · ${d.label}` : ""}</div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="num text-[17px] leading-none font-extrabold">{s?.in ? hm(s.in.ts) : <span className="text-muted-foreground">—</span>}</span>
        {s && s.late > 0 && s.last.kind === "in" ? <Chip tone="warn" className="num">+{s.late} мин</Chip> : <DotChip color={st.c}>{st.t}</DotChip>}
      </div>
    </motion.div>
  );
}

function FeedRow({ e, i, late, name, color }: { e: AttEvent; i: number; late: boolean; name: string; color: string }) {
  const d = deviceKind(e.device), p = pct(e.score);
  return (
    <motion.li {...land(Math.min(i, 5))} className="flex items-center gap-3 border-t border-border/60 py-2">
      <span className="num w-11 shrink-0 text-[14.5px] font-bold">{hm(e.ts)}</span>
      <Avatar text={initials(name)} color={color} size={32} />
      <span className="min-w-0 flex-1"><span className="block truncate text-[13.5px] leading-tight font-bold">{name}</span>
        <span className="block truncate text-[12px] text-muted-foreground">{[e.point, d?.label, (e.kind === "in" ? "пришёл" : "ушёл") + (late ? ", опоздал" : "")].filter(Boolean).join(" · ")}</span></span>
      {p != null && <DotChip color={p >= 65 ? "var(--plus)" : "var(--warn)"} title="Совпадение лица" className="h-6 text-[12px]">{p}%</DotChip>}
    </motion.li>
  );
}
