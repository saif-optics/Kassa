// Вид «Список»: задания группами — просрочено, сегодня, скоро, без срока, выполнено; внизу ближайшие события.
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FilterBar } from "@/components/FilterSheet";
import { Fold } from "@/components/Fold";
import { Segments } from "@/components/Segments";
import { cn } from "@/lib/utils";
import { TONE_COL, isOver, upcoming, type Tone } from "./calendar";
import { DateTile, scopeWords, type Who } from "./common";
import { eventWhen } from "./calendar";
import { PRI, type CalEvent, type Priority, type Task, type TaskComment, type useTaskActions } from "./logic";
import { TaskCard } from "./parts";

const GROUPS: { key: string; title: string; tone: Tone }[] = [
  { key: "over", title: "Просрочено", tone: "coral" }, { key: "today", title: "Сегодня", tone: "brand" }, { key: "soon", title: "Скоро", tone: "violet" },
  { key: "none", title: "Без срока", tone: "muted" }, { key: "done", title: "Выполнено", tone: "green" },
];

export function ListView({ tasks, events, eventsOk, comments, w, today, act, onOpenEvent }: {
  tasks: Task[]; events: CalEvent[]; eventsOk: boolean; comments: TaskComment[]; w: Who; today: string; act: ReturnType<typeof useTaskActions>; onOpenEvent: (e: CalEvent) => void;
}) {
  const [pri, setPri] = useState("all"), [text, setText] = useState(""), [openId, setOpenId] = useState<string | null>(null);
  const byTask = useMemo(() => { const m = new Map<string, TaskComment[]>(); comments.forEach((c) => m.set(c.task_id, [...(m.get(c.task_id) || []), c])); return m; }, [comments]);
  const list = useMemo(() => {
    const s = text.trim().toLowerCase();
    return tasks.filter((t) => (pri === "all" || t.priority === pri) && (!s || (t.title + " " + t.body + " " + (t.assignee || "")).toLowerCase().includes(s)));
  }, [tasks, pri, text]);
  const groups = useMemo(() => {
    const g = (k: string) => {
      const pick = (t: Task) => (t.status === "done" ? "done" : isOver(t, today) ? "over" : !t.due ? "none" : t.due === today ? "today" : "soon");
      const rows = list.filter((t) => pick(t) === k);
      const key = (t: Task) => (t.due || "9999") + (t.due_time || "99");
      return k === "done" ? rows.sort((a, b) => String(b.done_at).localeCompare(String(a.done_at))) : k === "none" ? rows : rows.sort((a, b) => key(a).localeCompare(key(b)));
    };
    return GROUPS.map((x) => ({ ...x, rows: g(x.key) })).filter((x) => x.rows.length);
  }, [list, today]);
  const ev = useMemo(() => upcoming(events, today), [events, today]);
  const on = (pri !== "all" ? 1 : 0) + (text.trim() ? 1 : 0);

  return (
    <div className="flex flex-col gap-3.5">
      <FilterBar count={on} summary={`${list.length} ${list.length === 1 ? "задание" : "заданий"}`}>
        <Segments size="sm" aria-label="Важность" value={pri} onChange={setPri} items={[{ key: "all", label: "Любая" }, ...(Object.keys(PRI) as Priority[]).map((p) => ({ key: p, label: PRI[p] }))]} />
        <div className="relative min-w-0 sm:w-64">
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder="Поиск по тексту" aria-label="Поиск" className="h-9 rounded-full pl-9" />
        </div>
      </FilterBar>
      {!groups.length && <div className="glass rounded-3xl px-4 py-8 text-center text-[13.5px] text-muted-foreground">{tasks.length ? "По фильтрам ничего не найдено" : w.me.isAdmin ? "Заданий пока нет. Нажмите «Задание»" : "Для вас заданий нет. Если что-то не так — нажмите «Сообщить о проблеме»"}</div>}
      {groups.map((g) => (
        <section key={g.key} aria-label={g.title} className="flex flex-col gap-2">
          <h2 className="flex items-center gap-2 px-1 text-[14px] font-bold"><i aria-hidden="true" className="size-2.5 rounded-full" style={{ background: TONE_COL[g.tone] }} />{g.title}<span className="num text-[13px] font-semibold text-muted-foreground">· {g.rows.length}</span></h2>
          <Fold id={`tasks.${g.key}`} rows={g.rows} className="flex flex-col gap-2">
            {(sh) => <div className="flex flex-col gap-2">{sh.map((t, j) => <TaskCard key={t.id} t={t} i={j} w={w} comments={byTask.get(t.id) || []} admin={w.me.isAdmin} today={today} open={openId === t.id} onToggle={() => setOpenId(openId === t.id ? null : t.id)} act={act} />)}</div>}
          </Fold>
        </section>
      ))}
      <section aria-label="События" className="flex flex-col gap-2">
        <h2 className="flex items-center gap-2 px-1 text-[14px] font-bold"><i aria-hidden="true" className="size-2.5 rounded-full" style={{ background: TONE_COL.violet }} />События<span className="num text-[13px] font-semibold text-muted-foreground">· {eventsOk ? ev.length : 0}</span></h2>
        {!eventsOk ? <p className="px-1 text-[13px] text-muted-foreground">События появятся после обновления базы</p>
          : !ev.length ? <p className="px-1 text-[13px] text-muted-foreground">Ближайших событий нет</p>
          : <Fold id="tasks.events" rows={ev} className="flex flex-col gap-2">
            {(sh) => <div className="flex flex-col gap-2">{sh.map((e) => (
              <button key={e.id} type="button" onClick={() => onOpenEvent(e)} className={cn("glass-inner flex min-w-0 items-center gap-3 rounded-2xl px-3.5 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/40")}>
                <DateTile day={e.starts_on < today ? today : e.starts_on} />
                <span className="min-w-0"><b className="block truncate text-[14px] font-semibold">{e.title}</b><span className="block truncate text-[12.5px] text-muted-foreground">{[eventWhen(e), scopeWords(e, w)].filter(Boolean).join(" · ")}</span></span>
              </button>))}</div>}
          </Fold>}
      </section>
    </div>
  );
}
