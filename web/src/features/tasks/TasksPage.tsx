// Раздел «Задания»: задания и проблемы по точкам. Админ создаёт и ведёт задания, продавец и кассир видят свою точку,
// комментируют и сообщают о проблеме.
import { useMemo, useState } from "react";
import { Plus, Search, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterBar } from "@/components/FilterSheet";
import { PageHead } from "@/components/PageHead";
import { Segments } from "@/components/Segments";
import { Tile, TileLabel, TileSub, TileValue } from "@/components/Tile";
import { useAccess } from "@/lib/access";
import type { Data } from "@/lib/types";
import { pointColor } from "../plan/Points";
import { PRI, ST, TASK_POINTS, errMsg, taskStats, todayTash, useTaskActions, useTasks, type Priority, type Task, type TaskComment } from "./logic";
import { FormShell, NewTaskForm, ProblemForm, TaskCard } from "./parts";

export function TasksPage({ d }: { d: Data }) {
  const a = useAccess(), admin = a.isAdmin, today = todayTash();
  const q = useTasks(a), act = useTaskActions(a);
  const points = admin ? TASK_POINTS : a.point ? [a.point] : TASK_POINTS;
  const [point, setPoint] = useState("all"), [status, setStatus] = useState("open"), [pri, setPri] = useState("all"), [text, setText] = useState(""), [showDone, setShowDone] = useState(false);
  const [form, setForm] = useState(false), [openId, setOpenId] = useState<string | null>(null);
  const all = q.data?.tasks;
  const scoped = useMemo(() => (all || []).filter((t) => point === "all" || t.point === point), [all, point]);
  const st = taskStats(scoped, today);
  const list = useMemo(() => {
    const s = text.trim().toLowerCase();
    return scoped.filter((t) => {
      if (status === "open" ? t.status === "done" && !showDone : t.status !== status) return false;
      if (pri !== "all" && t.priority !== pri) return false;
      return !s || (t.title + " " + t.body + " " + (t.assignee || "")).toLowerCase().includes(s);
    });
  }, [scoped, status, pri, text, showDone]);
  const groups = useMemo(() => {
    if (point !== "all" || !admin) return [{ p: "", rows: list }];
    return TASK_POINTS.map((p) => ({ p, rows: list.filter((t) => t.point === p) })).filter((g) => g.rows.length);
  }, [list, point, admin]);
  const byTask = useMemo(() => { const m = new Map<string, TaskComment[]>(); (q.data?.comments || []).forEach((c) => m.set(c.task_id, [...(m.get(c.task_id) || []), c])); return m; }, [q.data]);

  let k = 0; const nx = () => Math.min(k++, 8);
  const filtersOn = (status !== "open" ? 1 : 0) + (pri !== "all" ? 1 : 0) + (text.trim() ? 1 : 0) + (showDone ? 1 : 0);
  const dot = (p: string) => <i className="size-2.5 shrink-0 rounded-full" style={{ background: pointColor(d.points, p) }} />;
  const emptyText = (all?.length ?? 0) > 0 ? "По фильтрам ничего не найдено" : admin ? "Заданий пока нет. Нажмите «Новое задание»" : "Для вашей точки заданий нет. Если что-то не так — нажмите «Сообщить о проблеме»";

  return (
    <div className="flex flex-col gap-3.5">
      <PageHead eyebrow="Касса оптики" title="Задания" sub="Задания и проблемы по точкам" actions={admin
        ? <Button size="lg" onClick={() => setForm((x) => !x)}><Plus />Новое задание</Button>
        : <Button size="lg" onClick={() => setForm((x) => !x)}><TriangleAlert />Сообщить о проблеме</Button>} />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <Tile i={nx()} hero>
          <TileLabel>Открыто</TileLabel>
          <TileValue count={st.open} format="sum" />
          <TileSub><span>новых {st.news} · в работе {st.work}</span></TileSub>
        </Tile>
        <Tile i={nx()} warn={st.overdue > 0}>
          <TileLabel>Просрочено</TileLabel>
          <TileValue count={st.overdue} className={st.overdue ? "text-minus" : undefined} />
          <TileSub><span>срок вышел, не сделано</span></TileSub>
        </Tile>
        <Tile i={nx()}>
          <TileLabel>От продавцов</TileLabel>
          <TileValue count={st.sellers} />
          <TileSub><span>новые, ждут ответа</span></TileSub>
        </Tile>
        <Tile i={nx()}>
          <TileLabel>Сделано за 14 дней</TileLabel>
          <TileValue count={st.done14} />
          <TileSub><span>закрытые задания</span></TileSub>
        </Tile>
      </div>

      <FormShell open={form} title={admin ? "Новое задание" : "Сообщить о проблеме"} onClose={() => setForm(false)}>
        {admin ? <NewTaskForm point={point === "all" ? "" : point} onSave={act.create} onClose={() => setForm(false)} />
          : <ProblemForm onSave={act.problem} onClose={() => setForm(false)} />}
      </FormShell>

      <div className="flex flex-col gap-3">
        {points.length > 1 && <Segments aria-label="Точка" value={point} onChange={setPoint}
          items={[{ key: "all", label: "Все" }, ...points.map((p) => ({ key: p, label: <span className="flex items-center gap-1.5">{dot(p)}{p}</span> }))]} />}
        <FilterBar count={filtersOn} summary={`${list.length} ${list.length === 1 ? "задание" : "заданий"}`}>
          <Segments size="sm" aria-label="Статус" value={status} onChange={setStatus}
            items={[{ key: "open", label: "Открытые" }, ...(Object.keys(ST) as (keyof typeof ST)[]).map((s) => ({ key: s, label: ST[s] }))]} />
          <Segments size="sm" aria-label="Срочность" value={pri} onChange={setPri}
            items={[{ key: "all", label: "Любая" }, ...(Object.keys(PRI) as Priority[]).map((p) => ({ key: p, label: PRI[p] }))]} />
          <div className="relative min-w-0 sm:w-64">
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder="Поиск по тексту" aria-label="Поиск" className="h-9 rounded-full pl-9" />
          </div>
          <label className="flex h-9 items-center gap-2 text-[13.5px] text-muted-foreground"><Switch checked={showDone} onCheckedChange={setShowDone} aria-label="Показать сделанные" />Показать сделанные</label>
        </FilterBar>
      </div>

      {q.isLoading ? <div className="grid gap-2"><Skeleton className="h-20 rounded-2xl" /><Skeleton className="h-20 rounded-2xl" /><Skeleton className="h-20 rounded-2xl" /></div>
        : q.error ? <p role="alert" className="glass rounded-3xl p-6 text-minus">Не удалось загрузить задания: {errMsg(q.error)}<Button variant="secondary" className="mt-3 block rounded-full" onClick={() => q.refetch()}>Повторить</Button></p>
        : !list.length ? <div className="glass rounded-3xl px-4 py-8 text-center text-[13.5px] text-muted-foreground">{emptyText}</div>
        : <div className="flex flex-col gap-4">
          {groups.map((g) => (
            <section key={g.p || "one"} aria-label={g.p || "Задания"} className="flex flex-col gap-2">
              {g.p && <h2 className="flex items-center gap-2 px-1 text-[13px] font-semibold">{dot(g.p)}{g.p}<span className="num font-normal text-muted-foreground">{g.rows.length}</span></h2>}
              {g.rows.map((t: Task, j) => <TaskCard key={t.id} t={t} i={j} comments={byTask.get(t.id) || []} admin={admin} today={today} open={openId === t.id} onToggle={() => setOpenId(openId === t.id ? null : t.id)} act={act} />)}
            </section>
          ))}
        </div>}
    </div>
  );
}
