// Раздел «Задания»: календарь месяца и список заданий и событий. Каждый видит своё: все / его точка / лично он;
// владелец и админ — всё, с фильтрами по точке и исполнителю. Создают и ведут задания только owner/admin,
// продавец и кассир комментируют и сообщают о проблеме.
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, CalendarPlus, CircleAlert, Clock, ListChecks, Plus, TriangleAlert, UserCheck } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterBar } from "@/components/FilterSheet";
import { PageHead } from "@/components/PageHead";
import { Segments } from "@/components/Segments";
import { Chip, Tile, TileLabel, TileSub, TileValue } from "@/components/Tile";
import { DUR, EASE } from "@/lib/motion";
import { useAccess } from "@/lib/access";
import { useIsPhone } from "@/lib/useMedia";
import { RowHCtx } from "@/features/analytics/Puzzle";
import type { Data } from "@/lib/types";
import { pl } from "@/features/pay/logic";
import { addDays, dayList, diffDays, gridRange, itemsByDay, passFilter, upcoming, ymOf, type CalItem } from "./calendar";
import { CalendarPhone, CalendarPuzzle, type CalP } from "./CalendarView";
import { userName, useUsers, useWho } from "./common";
import { EventDetail, TaskDetail } from "./details";
import { EventSheet, TaskSheet } from "./forms";
import { ListView } from "./ListView";
import { FormShell, ProblemForm } from "./parts";
import { TASK_POINTS, errMsg, taskStats, todayTash, useEvents, useTaskActions, useTasks, type Task } from "./logic";

const ROW = "flex flex-col gap-1.5 @min-[1060px]/main:flex-row @min-[1060px]/main:items-end @min-[1060px]/main:justify-between @min-[1060px]/main:gap-3"; // значение и пояснение: на узких плитках друг под другом
const VIEWKEY = "kassa-web.tasks.view";
type View = "cal" | "list";
const readView = (): View => { try { return localStorage.getItem(VIEWKEY) === "list" ? "list" : "cal"; } catch { return "cal"; } };

function Flt({ value, onChange, items, label }: { value: string; onChange: (v: string) => void; items: { key: string; label: string }[]; label: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="h-10 w-auto min-w-[140px] rounded-full border-0 bg-muted/70 px-4 text-[13.5px] font-semibold max-sm:w-full"><SelectValue /></SelectTrigger>
      <SelectContent>{items.map((i) => <SelectItem key={i.key} value={i.key}>{i.label}</SelectItem>)}</SelectContent>
    </Select>
  );
}

export function TasksPage(_: { d: Data }) {
  const a = useAccess(), admin = a.isAdmin, today = todayTash(), phone = useIsPhone();
  const [view, setViewS] = useState<View>(readView), [ym, setYmS] = useState(ymOf(today)), [sel, setSel] = useState(today);
  const [filt, setFilt] = useState({ point: "all", user: "all" });
  const [taskForm, setTaskForm] = useState<string | null>(null), [eventForm, setEventForm] = useState<string | null>(null), [problem, setProblem] = useState(false);
  const [openTask, setOpenTask] = useState<string | null>(null), [openEvent, setOpenEvent] = useState<string | null>(null);

  const g = useMemo(() => gridRange(ym), [ym]);
  const ew = useMemo(() => {
    const from = g.from < today ? g.from : today, to = g.to > addDays(today, 60) ? g.to : addDays(today, 60);
    return diffDays(to, from) > 400 ? g : { from, to };
  }, [g, today]);
  const q = useTasks(a, g), eq = useEvents(a, ew), act = useTaskActions(a);
  const users = useUsers(a), w = useWho(a, users);
  const eventsOk = eq.data?.ok ?? true;

  // фильтры админа; остальные уже получили от базы только своё
  const lite = useMemo(() => users.map((u) => ({ email: u.email, point: u.point })), [users]);
  const on = admin && (filt.point !== "all" || filt.user !== "all");
  const tasks = useMemo(() => (q.data?.tasks || []).filter((t) => !on || passFilter(t, filt, lite)), [q.data, on, filt, lite]);
  const events = useMemo(() => (eq.data?.events || []).filter((e) => !on || passFilter(e, filt, lite)), [eq.data, on, filt, lite]);
  const comments = q.data?.comments || [];

  const st = taskStats(tasks, today);
  const byDay = useMemo(() => itemsByDay(tasks, events, g.from, g.to, today), [tasks, events, g, today]);
  const dayItems = useMemo(() => dayList(tasks, events, sel, today), [tasks, events, sel, today]);
  const soon = useMemo(() => upcoming(events, today), [events, today]);

  const setView = (k: string) => { setViewS(k as View); try { localStorage.setItem(VIEWKEY, k); } catch { /* нет хранилища */ } };
  const setYm = (m: string) => { setYmS(m); setSel(m === ymOf(today) ? today : m + "-01"); };
  const toggle = async (t: Task) => { try { await act.setStatus(t.id, t.status === "done" ? "new" : "done"); } catch (e) { toast.error(errMsg(e)); } };
  const open = (it: CalItem) => { if (it.kind === "event" && it.event) setOpenEvent(it.event.id); else if (it.task) setOpenTask(it.task.id); };
  const tOpen = (q.data?.tasks || []).find((t) => t.id === openTask) || null, eOpen = (eq.data?.events || []).find((e) => e.id === openEvent) || null;

  // высота ряда пазла от высоты окна, как в Аналитике: четыре ряда помещаются на экран (150–200 px)
  const bodyRef = useRef<HTMLDivElement>(null), rootRef = useRef<HTMLDivElement>(null), [rh, setRh] = useState<number | null>(null);
  useEffect(() => {
    const calc = () => { const el = bodyRef.current; if (!el) return; const top = el.getBoundingClientRect().top + window.scrollY; setRh(Math.round(Math.max(150, Math.min(200, (window.innerHeight - top - 40 - 3 * 14) / 4)))); };
    calc(); window.addEventListener("resize", calc);
    const ro = new ResizeObserver(calc); if (rootRef.current) ro.observe(rootRef.current);
    return () => { window.removeEventListener("resize", calc); ro.disconnect(); };
  }, [view, phone, q.isLoading]);

  const P: CalP = { ym, setYm, sel, setSel, today, byDay, dayItems, upcoming: soon, w, eventsOk, onToggle: toggle, onOpen: open, onAdd: (day) => setTaskForm(day), onAllEvents: () => setView("list"), point: filt.point !== "all" ? filt.point : a.point || "" };
  const env = { users, point: P.point };

  const pointItems = [{ key: "all", label: "Все точки" }, ...TASK_POINTS.map((p) => ({ key: p, label: p }))];
  const userItems = [{ key: "all", label: "Все исполнители" }, ...users.map((u) => ({ key: u.email, label: userName(u) }))];
  const filters = admin ? <>
    <Flt label="Точка" value={filt.point} onChange={(v) => setFilt((f) => ({ ...f, point: v }))} items={pointItems} />
    <Flt label="Исполнитель" value={filt.user} onChange={(v) => setFilt((f) => ({ ...f, user: v }))} items={userItems} />
  </> : null;
  const violet = "bg-[color-mix(in_srgb,var(--chart-2)_16%,transparent)] text-chart-2 hover:bg-[color-mix(in_srgb,var(--chart-2)_24%,transparent)]";
  const evTitle = eventsOk ? "Новое событие" : "События появятся после обновления базы";

  const actions = admin ? (phone ? <>
    <Button variant="secondary" size="icon-lg" className={`size-10 rounded-full ${violet}`} aria-label="Новое событие" title={evTitle} disabled={!eventsOk} onClick={() => setEventForm(sel)}><CalendarPlus /></Button>
    <Button size="icon-lg" className="size-10 rounded-full" aria-label="Новое задание" onClick={() => setTaskForm(sel)}><Plus /></Button>
  </> : <>
    {filters}
    <Button variant="secondary" size="lg" className={`h-10 rounded-full px-4 ${violet}`} title={evTitle} disabled={!eventsOk} onClick={() => setEventForm(sel)}><CalendarDays />Событие</Button>
    <Button size="lg" className="h-10 rounded-full px-4" onClick={() => setTaskForm(sel)}><Plus />Задание</Button>
  </>) : (
    phone ? <Button size="icon-lg" className="size-10 rounded-full" aria-label="Сообщить о проблеме" onClick={() => setProblem((x) => !x)}><TriangleAlert /></Button>
      : <Button size="lg" className="h-10 rounded-full px-4" onClick={() => setProblem((x) => !x)}><TriangleAlert />Сообщить о проблеме</Button>);

  const sub = admin ? "задачи, сроки и события по точкам" : a.point ? `${a.point} · ваши и общие` : "ваши и общие задания";
  const mid = <Segments aria-label="Вид" value={view} onChange={setView} className={phone ? "w-full [&>div]:w-full [&_button]:flex-1 [&_button]:justify-center" : undefined}
    items={[{ key: "cal", label: <><CalendarDays className="size-4" />Календарь</> }, { key: "list", label: <><ListChecks className="size-4" />Список</> }]} />;

  let k = 0; const nx = () => Math.min(k++, 8);
  const names = st.overNames.slice(0, 2).join(", ") + (st.overNames.length > 2 ? "…" : "");
  const body = q.isLoading ? <div className="grid gap-3"><Skeleton className="h-[420px] rounded-3xl" /></div>
    : q.error ? <p role="alert" className="glass rounded-3xl p-6 text-minus">Не удалось загрузить задания: {errMsg(q.error)}<Button variant="secondary" className="mt-3 block rounded-full" onClick={() => q.refetch()}>Повторить</Button></p>
    : view === "list" ? <ListView tasks={tasks} events={events} eventsOk={eventsOk} comments={comments} w={w} today={today} act={act} onOpenEvent={(e) => setOpenEvent(e.id)} />
    : phone ? <CalendarPhone P={P} />
    : <div ref={bodyRef}><RowHCtx.Provider value={rh}><CalendarPuzzle P={P} /></RowHCtx.Provider></div>;

  return (
    <div ref={rootRef} className="flex flex-col gap-3.5">
      <PageHead compact title="Задания" sub={sub} mid={mid} actions={actions} />
      {admin && phone && <FilterBar count={+(filt.point !== "all") + +(filt.user !== "all")} summary={`${tasks.length} ${pl(tasks.length, "задание", "задания", "заданий")}`}>{filters}</FilterBar>}

      <div className="grid grid-cols-2 gap-3.5 @min-[640px]/main:grid-cols-4">
        {!phone && <Tile i={nx()} hero icon={CalendarDays}>
          <TileLabel>Открыто</TileLabel>
          <div className={ROW}><TileValue count={st.open} /><TileSub className="mt-0"><span>{st.news} {pl(st.news, "новое", "новых", "новых")} · {st.work} в работе</span></TileSub></div>
        </Tile>}
        <Tile i={nx()} icon={CircleAlert} tone="minus" glow="minus" warn={st.overdue > 0}>
          <TileLabel>Просрочено</TileLabel>
          <div className={ROW}><TileValue count={st.overdue} className={st.overdue ? "text-minus" : undefined} />
            {!phone && <TileSub className="mt-0 min-w-0"><span>{st.overdue ? names : "всё в срок"}</span></TileSub>}</div>
        </Tile>
        <Tile i={nx()} icon={Clock} tone="warn" glow="warn">
          <TileLabel>Срок сегодня</TileLabel>
          <div className={ROW}><TileValue count={st.dueToday} />
            <TileSub className="mt-0">{st.dueTodayHigh ? <Chip tone="warn">{st.dueTodayHigh} {pl(st.dueTodayHigh, "важное", "важных", "важных")}</Chip> : <span>{st.dueToday ? "ничего срочного" : "на сегодня пусто"}</span>}</TileSub></div>
        </Tile>
        {!phone && <Tile i={nx()} icon={UserCheck} tone="plus" glow="plus">
          <TileLabel>Выполнено за неделю</TileLabel>
          <div className={ROW}><TileValue count={st.doneWeek} /><TileSub className="mt-0"><span>из {st.base} · {st.pct}%</span></TileSub></div>
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1.5 bg-muted"><motion.i className="block h-full bg-plus" initial={{ width: 0 }} animate={{ width: `${Math.min(100, st.pct)}%` }} transition={{ duration: DUR.slow, ease: EASE.out }} /></span>
        </Tile>}
      </div>

      {!admin && <FormShell open={problem} title="Сообщить о проблеме" onClose={() => setProblem(false)}><ProblemForm onSave={act.problem} onClose={() => setProblem(false)} /></FormShell>}
      {body}

      <TaskSheet open={taskForm !== null} onClose={() => setTaskForm(null)} day={taskForm || today} env={env} onSave={act.create} />
      <EventSheet open={eventForm !== null} onClose={() => setEventForm(null)} day={eventForm || today} env={env} onSave={act.createEvent} />
      <TaskDetail t={tOpen} comments={comments.filter((c) => c.task_id === openTask)} w={w} today={today} act={act} onClose={() => setOpenTask(null)} />
      <EventDetail e={eOpen} w={w} act={act} onClose={() => setOpenEvent(null)} />
    </div>
  );
}
