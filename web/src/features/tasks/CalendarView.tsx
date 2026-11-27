// Вид «Календарь»: месяц с метками, справа — список выбранного дня, ближайшие события и «Кому видно».
// На компьютере и планшете — пазл (общий Puzzle/Piece, как в Аналитике и Пользователях), на телефоне — компактный календарь и карточки дня.
import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { pl } from "@/features/pay/logic";
import { HintCtx, Piece, Puzzle, Scroll } from "@/features/analytics/Puzzle";
import { Card } from "@/components/Card";
import { MONTHS_GEN, TONE_COL, WD, WD_FULL, addMonths, ddmm, dow, eventWhen, monthTitle, monthWeeks, type CalItem, type Tone } from "./calendar";
import { DateTile, DayRow, ScopeChip, mixC, scopeWords, type Who } from "./common";
import type { CalEvent, Task } from "./logic";

export interface CalP {
  ym: string; setYm: (ym: string) => void; sel: string; setSel: (d: string) => void; today: string;
  byDay: Map<string, CalItem[]>; dayItems: CalItem[]; upcoming: CalEvent[]; w: Who; eventsOk: boolean;
  onToggle: (t: Task) => void; onOpen: (it: CalItem) => void; onAdd: (day: string) => void; onAllEvents: () => void; point: string;
}

const LEGEND: [Tone, string][] = [["coral", "важно / просрочено"], ["brand", "обычно"], ["muted", "низко"], ["violet", "событие"], ["green", "выполнено"]];

const dayTitle = (sel: string, today: string) => (sel === today ? `Сегодня, ${ddmm(sel)}` : `${WD_FULL[dow(sel)]}, ${ddmm(sel)}`);
const dayNote = (items: CalItem[]) => {
  const t = items.filter((x) => x.kind === "task").length, e = items.length - t;
  return [t ? `${t} ${pl(t, "задание", "задания", "заданий")}` : "", e ? `${e} ${pl(e, "событие", "события", "событий")}` : ""].filter(Boolean).join(" · ") || "пусто";
};

function Mark({ c }: { c: CalItem }) {
  const col = TONE_COL[c.tone], ev = c.event;
  const label = c.title + (ev && !ev.all_day && ev.start_time ? " " + ev.start_time : "");
  return (
    <span title={label} className={cn("flex h-5 min-w-0 shrink-0 items-center gap-1.5 rounded-lg px-2 text-[11.5px] leading-none font-semibold", c.done && "line-through opacity-60")} style={{ background: mixC(col, 16), color: col }}>
      {c.kind === "event" ? <CalendarDays className="size-3 shrink-0" /> : <i aria-hidden="true" className="size-[7px] shrink-0 rounded-full" style={{ background: col }} />}
      <span className="truncate">{label}</span>
    </span>
  );
}

function Head({ P, small }: { P: CalP; small?: boolean }) {
  const nav = (n: number) => { const ym = addMonths(P.ym, n); P.setYm(ym); };
  const btn = "grid place-items-center rounded-xl bg-muted text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-95";
  const sz = small ? "size-[30px]" : "size-9";
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="flex items-center gap-3">
        {small ? <h2 className="text-[16px] font-bold">{monthTitle(P.ym)}</h2> : (
          <>
            <button type="button" aria-label="Прошлый месяц" onClick={() => nav(-1)} className={cn(btn, sz)}><ChevronLeft className="size-4" /></button>
            <h2 className="text-xl font-bold" aria-live="polite">{monthTitle(P.ym)}</h2>
            <button type="button" aria-label="Следующий месяц" onClick={() => nav(1)} className={cn(btn, sz)}><ChevronRight className="size-4" /></button>
          </>
        )}
      </div>
      {small ? (
        <div className="flex gap-1.5">
          <button type="button" aria-label="Прошлый месяц" onClick={() => nav(-1)} className={cn(btn, sz)}><ChevronLeft className="size-3.5" /></button>
          <button type="button" aria-label="Следующий месяц" onClick={() => nav(1)} className={cn(btn, sz)}><ChevronRight className="size-3.5" /></button>
        </div>
      ) : (
        <ul className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[12.5px] text-muted-foreground">
          {LEGEND.map(([t, n]) => <li key={t} className="flex items-center gap-1.5"><i aria-hidden="true" className="size-2 rounded-full" style={{ background: TONE_COL[t] }} />{n}</li>)}
        </ul>
      )}
    </div>
  );
}

function Grid({ P }: { P: CalP }) {
  const weeks = monthWeeks(P.ym), admin = P.w.me.isAdmin, ref = useRef<HTMLDivElement>(null), [ch, setCh] = useState(0);
  // сколько меток влезает в клетку: высота клетки минус отступы и строка с числом, метка — 20 px и зазор 4
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const calc = () => {
      const pz = el.closest(".pz"); if (pz && getComputedStyle(pz).gridAutoRows === "auto") { setCh(0); return; } // планшет: высота по содержимому, режем по 3
      const h = (el.clientHeight - 8 * (weeks.length - 1)) / weeks.length; setCh(Math.round(h)); };
    calc(); const ro = new ResizeObserver(calc); ro.observe(el);
    return () => ro.disconnect();
  }, [weeks.length]);
  // метка — 20 px и зазор 4; клетка: отступы 16 + строка с числом 24; строка «+N ещё» — ещё 18
  const max = ch ? Math.max(1, Math.floor((ch - 40) / 24)) : 3, keep = ch ? Math.max(1, Math.floor((ch - 58) / 24)) : 2;
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="grid grid-cols-7 gap-2">{WD.map((d, i) => <span key={d} className={cn("text-center text-[12.5px] font-bold text-muted-foreground", i === 6 && "text-minus")}>{d}</span>)}</div>
      <div ref={ref} className="grid min-h-0 flex-1 grid-cols-7 gap-2" style={{ gridTemplateRows: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
        {weeks.flat().map((d, i) => {
          if (!d) return <div key={"x" + i} aria-hidden="true" className="min-h-[84px] rounded-[14px] bg-muted/25" />;
          const items = P.byDay.get(d) || [], isToday = d === P.today, isSel = d === P.sel, over = items.length > max, shown = over ? items.slice(0, keep) : items;
          const select = () => P.setSel(d);
          return (
            <div key={d} role="button" tabIndex={0} aria-pressed={isSel} aria-label={`${+d.slice(8, 10)} ${MONTHS_GEN[+d.slice(5, 7) - 1]}: ${items.length ? dayNote(items) : "пусто"}`}
              onClick={select} onDoubleClick={() => admin && P.onAdd(d)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(); } }}
              className={cn("group relative flex min-h-[84px] @max-[1059px]/main:min-h-[116px] min-w-0 cursor-pointer flex-col gap-1 overflow-hidden rounded-[14px] p-1.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 @min-[1060px]/main:p-2",
                isToday ? "bg-primary/12 ring-2 ring-primary" : isSel ? "bg-primary/8 ring-2 ring-primary/40" : "bg-muted/60 hover:bg-muted")}>
              <div className="flex items-center justify-between gap-1">
                <span className={cn("num grid size-6 place-items-center rounded-full text-[13px] font-extrabold", isToday ? "bg-primary text-primary-foreground" : dow(d) === 6 ? "text-minus" : d < P.today ? "text-muted-foreground" : "")}>{+d.slice(8, 10)}</span>
                {admin && <button type="button" aria-label={`Создать на ${ddmm(d)}`} onClick={(e) => { e.stopPropagation(); P.onAdd(d); }} onDoubleClick={(e) => e.stopPropagation()}
                  className="grid size-6 place-items-center rounded-full text-muted-foreground opacity-0 transition-opacity outline-none group-hover:opacity-100 hover:bg-primary/15 hover:text-primary focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary/50"><Plus className="size-3.5" /></button>}
              </div>
              {shown.map((c) => <Mark key={c.key} c={c} />)}
              {over && <span className="text-[11.5px] font-medium text-muted-foreground">+{items.length - shown.length} ещё</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniCal({ P }: { P: CalP }) {
  const weeks = monthWeeks(P.ym);
  return (
    <div className="glass flex flex-col gap-2 rounded-[22px] p-3.5">
      <Head P={P} small />
      <div className="grid grid-cols-7 gap-0.5">
        {WD.map((d, i) => <span key={d} className={cn("text-center text-[11px] font-bold text-muted-foreground", i === 6 && "text-minus")}>{d}</span>)}
        {weeks.flat().map((d, i) => {
          if (!d) return <span key={"x" + i} aria-hidden="true" />;
          const items = P.byDay.get(d) || [], tones = [...new Set(items.map((c) => c.tone))].slice(0, 3), isSel = d === P.sel, isToday = d === P.today;
          return (
            <button key={d} type="button" aria-pressed={isSel} aria-label={`${+d.slice(8, 10)}: ${items.length ? dayNote(items) : "пусто"}`} onClick={() => P.setSel(d)}
              onDoubleClick={() => P.w.me.isAdmin && P.onAdd(d)}
              className={cn("flex flex-col items-center gap-[3px] rounded-[10px] py-1 text-[13.5px] font-bold outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                isSel ? "bg-primary text-primary-foreground" : isToday ? "ring-2 ring-primary" : dow(d) === 6 ? "text-minus" : "")}>
              <span className="num">{+d.slice(8, 10)}</span>
              <span className="flex h-[5px] gap-0.5">{tones.map((t) => <i key={t} className="size-[5px] rounded-full" style={{ background: isSel ? "currentColor" : TONE_COL[t] }} />)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const Empty = ({ children }: { children: React.ReactNode }) => <p className="py-6 text-center text-[13.5px] text-muted-foreground">{children}</p>;

function EventLine({ e, P }: { e: CalEvent; P: CalP }) {
  const d = e.starts_on < P.today ? P.today : e.starts_on;
  return (
    <div role="button" tabIndex={0} onClick={() => P.onOpen({ key: "e" + e.id, kind: "event", title: e.title, tone: "violet", done: false, time: eventWhen(e), event: e })}
      onKeyDown={(x) => { if (x.key === "Enter" || x.key === " ") { x.preventDefault(); P.onOpen({ key: "e" + e.id, kind: "event", title: e.title, tone: "violet", done: false, time: eventWhen(e), event: e }); } }}
      className="flex cursor-pointer items-center gap-3 rounded-lg border-t border-border/70 py-2 outline-none first:border-t-0 focus-visible:ring-2 focus-visible:ring-primary/40">
      <DateTile day={d} />
      <div className="min-w-0"><b className="block truncate text-[14.5px] font-semibold">{e.title}</b>
        <span className="block truncate text-[12.5px] text-muted-foreground">{[eventWhen(e), scopeWords(e, P.w)].filter(Boolean).join(" · ")}</span></div>
    </div>
  );
}

function DayList({ P, card }: { P: CalP; card?: boolean }) {
  if (!P.dayItems.length) return <Empty>На этот день ничего нет</Empty>;
  const rows = P.dayItems.map((it, i) => <DayRow key={it.key} it={it} w={P.w} today={P.today} day={P.sel} onToggle={P.onToggle} onOpen={P.onOpen} card={card} i={i} />);
  return card ? <div className="flex flex-col gap-2.5">{rows}</div> : <div>{rows}</div>;
}

const EVENTS_OFF = "События появятся после обновления базы";
function Upcoming({ P }: { P: CalP }) {
  const ev = P.upcoming.slice(0, 12);
  if (!P.eventsOk) return <Empty>{EVENTS_OFF}</Empty>;
  return ev.length ? <div>{ev.map((e) => <EventLine key={e.id} e={e} P={P} />)}</div> : <Empty>Ближайших событий нет</Empty>;
}

function Legend({ P }: { P: CalP }) {
  const pt = P.w.me.point || P.point || "Премиум";
  const rows: [React.ReactNode, string][] = [
    [<ScopeChip key="a" s={{ scope: "all", point: null }} w={P.w} />, "видят все сотрудники"],
    [<ScopeChip key="p" s={{ scope: "point", point: pt }} w={P.w} />, "видят только у кого доступ к точке"],
    [<ScopeChip key="h" s={{ scope: "person", point: null, assignee: P.w.me.isAdmin ? "Человек" : "Вы", assignee_email: "" }} w={P.w} />, "видит только этот человек и админы"],
  ];
  return <div className="flex flex-col gap-2.5">{rows.map(([c, t], i) => <div key={i} className="flex items-center gap-2.5"><span className="shrink-0">{c}</span><span className="min-w-0 text-[13px] leading-snug text-muted-foreground">{t}</span></div>)}</div>;
}

/** компьютер и планшет: пазл из календаря и трёх блоков справа */
export function CalendarPuzzle({ P }: { P: CalP }) {
  const title = dayTitle(P.sel, P.today), note = dayNote(P.dayItems);
  return (
    <HintCtx.Provider value={false}>
      <Puzzle>
        <Piece d={[0, 0, 8, 4]} m={[6, 600]}>
          <Head P={P} />
          <Grid P={P} />
        </Piece>
        <Piece d={[8, 0, 4, 2]} m={[3, 330]} title={title} note={note} bridge={{ dir: "v", d: "50%" }}>
          <Scroll><DayList P={P} /></Scroll>
        </Piece>
        <Piece d={[8, 2, 4, 1]} m={[3, 330]} title="Ближайшие события" right={<button type="button" onClick={P.onAllEvents} className="shrink-0 rounded text-[12.5px] font-semibold text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40">все →</button>}>
          <Scroll><Upcoming P={P} /></Scroll>
        </Piece>
        <Piece d={[8, 3, 4, 1]} m={[6, 150]} title="Кому видно">
          <Legend P={P} />
        </Piece>
      </Puzzle>
    </HintCtx.Provider>
  );
}

/** телефон: календарь с точками, список выбранного дня карточками */
export function CalendarPhone({ P }: { P: CalP }) {
  const n = P.dayItems.length;
  return (
    <div className="flex flex-col gap-3">
      <MiniCal P={P} />
      <h2 className="px-1 text-[14px] font-bold">{dayTitle(P.sel, P.today)} <span className="font-normal text-muted-foreground">· {n}</span></h2>
      <DayList P={P} card />
      {!P.eventsOk && <p className="px-1 text-[12.5px] text-muted-foreground">{EVENTS_OFF}</p>}
      {P.eventsOk && P.upcoming.length > 0 && (
        <Card title="Ближайшие события" action={{ label: "все →", onClick: P.onAllEvents }}><div>{P.upcoming.slice(0, 5).map((e) => <EventLine key={e.id} e={e} P={P} />)}</div></Card>
      )}
      <Card title="Кому видно"><Legend P={P} /></Card>
    </div>
  );
}

