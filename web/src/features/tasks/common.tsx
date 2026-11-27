// Общие мелочи «Заданий»: список людей, чип «кому видно», строка дня (задание или событие), цветные метки.
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Access } from "@/lib/access";
import { Avatar, PointChip, usePointCol } from "@/features/users/common";
import { ROLES, initials, listUsers, type UserRow } from "@/features/users/logic";
import { MON_SHORT, TONE_COL, diffDays, lc, type CalItem, type Scoped, type Tone } from "./calendar";
import { type CalEvent, type Task } from "./logic";

export const mixC = (c: string, p: number) => `color-mix(in srgb, ${c} ${p}%, transparent)`;
const VIOLET = "var(--chart-2)";

/** люди для выбора и подписей: только владелец и админ (список — RPC access_list); остальным — пусто */
export function useUsers(a: Access) {
  const q = useQuery({ queryKey: ["kassa-users"], queryFn: listUsers, enabled: a.isAdmin, staleTime: 30_000, retry: false });
  return useMemo(() => (q.data || []).filter((u) => u.active), [q.data]);
}
export const userName = (u?: UserRow | null) => (u ? u.label || u.email.split("@")[0] : "");
export const userHint = (u: UserRow) => [u.point || "все точки", ROLES[u.role]].join(" · ");

export interface Who { me: Access; users: UserRow[]; col: (p?: string | null) => string }
export function useWho(a: Access, users: UserRow[]): Who {
  const col = usePointCol();
  return { me: a, users, col };
}
/** подпись человека: «Вы», имя из списка, текст исполнителя или начало почты */
export function personName(w: Who, s: Scoped & { assignee?: string | null }) {
  const em = lc(s.assignee_email);
  if (em && em === lc(w.me.email)) return "Вы";
  if (!em) return s.assignee || "Человек";
  return userName(w.users.find((u) => lc(u.email) === em)) || s.assignee || (w.me.isAdmin ? em.split("@")[0] : "Вы");
}

/** кому видно: все — иконка, точка — цветной кружок, человек — аватар с инициалами */
export function ScopeChip({ s, w, className }: { s: Scoped & { assignee?: string | null }; w: Who; className?: string }) {
  if (s.scope === "all") return <span className={cn("inline-flex h-6 shrink-0 items-center gap-1 rounded-full bg-primary/12 px-2 text-[12px] font-semibold text-primary", className)}><Users className="size-3.5" />Все</span>;
  if (s.scope === "point") return <PointChip color={w.col(s.point)} className={cn("h-6 text-[12px]", className)}>{s.point || "Точка"}</PointChip>;
  const n = personName(w, s);
  return <span className={cn("inline-flex h-6 max-w-full shrink-0 items-center gap-1.5 rounded-full py-0 pr-2.5 pl-0.5 text-[12px] font-semibold", className)} style={{ background: mixC(VIOLET, 15), color: VIOLET }}>
    <Avatar text={initials(n).slice(0, 1)} color={VIOLET} size={20} /><span className="min-w-0 truncate">{n}</span></span>;
}
/** то же словами, для строки события: «все точки», «Премиум», «Мадина» */
export const scopeWords = (s: Scoped & { assignee?: string | null }, w: Who) => (s.scope === "all" ? "все точки" : s.scope === "point" ? s.point || "точка" : personName(w, s));

/** кружок-галочка у задания: админ жмёт — сделано; остальные видят состояние */
export function Check22({ done, can, label, onClick }: { done: boolean; can: boolean; label: string; onClick?: () => void }) {
  const cls = cn("grid size-[22px] shrink-0 place-items-center rounded-[7px] transition-colors", done ? "bg-plus text-[#04202b]" : "shadow-[inset_0_0_0_2px_var(--border)]");
  const body = done ? <Check className="size-3.5" strokeWidth={3} /> : null;
  if (!can) return <span aria-hidden="true" className={cn(cls, !done && "opacity-60")}>{body}</span>;
  return <button type="button" role="checkbox" aria-checked={done} aria-label={label} onClick={(e) => { e.stopPropagation(); onClick?.(); }}
    className={cn(cls, "cursor-pointer outline-none hover:shadow-[inset_0_0_0_2px_var(--primary)] focus-visible:ring-2 focus-visible:ring-primary/50", done && "hover:opacity-85")}>{body}</button>;
}

/** плитка даты у события: число и месяц */
export function DateTile({ day, className }: { day: string; className?: string }) {
  return <span className={cn("grid w-[52px] shrink-0 place-items-center rounded-xl py-1.5 leading-none", className)} style={{ background: mixC(VIOLET, 16), color: VIOLET }}>
    <b className="num text-[16px]">{+day.slice(8, 10)}</b><span className="mt-1 text-[11px] font-semibold">{MON_SHORT[+day.slice(5, 7) - 1]}</span></span>;
}

/** срок словами: «просрочено 2 дн.» коралловым, «до 20:00», «до 05.12» */
export function dueWords(t: Task, today: string): { text: string; over: boolean } {
  if (t.status !== "done" && t.due && t.due < today) { const n = diffDays(today, t.due); return { text: `просрочено ${n} дн.`, over: true }; }
  if (t.due_time) return { text: "до " + t.due_time, over: false };
  if (t.due && t.due !== today) return { text: "до " + t.due.slice(8, 10) + "." + t.due.slice(5, 7), over: false };
  return { text: t.due ? "в течение дня" : "", over: false };
}

/** строка списка дня: задание с галочкой и полоской важности или событие с плиткой даты */
export function DayRow({ it, w, today, day, onToggle, onOpen, card, i = 0 }: { it: CalItem; w: Who; today: string; day: string; onToggle: (t: Task) => void; onOpen: (it: CalItem) => void; card?: boolean; i?: number }) {
  void i;
  const wrap = cn("flex min-w-0 items-center gap-3", card ? "glass rounded-[22px] px-4 py-3.5" : "border-t border-border/70 py-2.5 first:border-t-0");
  const open = (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(it); } };
  if (it.kind === "event" && it.event) {
    const e: CalEvent = it.event, d = e.starts_on < day ? day : e.starts_on;
    return (
      <div role="button" tabIndex={0} onClick={() => onOpen(it)} onKeyDown={open} className={cn(wrap, "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40")}>
        <DateTile day={d} />
        <div className="min-w-0 flex-1"><b className="block truncate text-[14.5px] font-semibold">{e.title}</b>
          <span className="block truncate text-[12.5px] text-muted-foreground">{[it.time, scopeWords(e, w)].filter(Boolean).join(" · ")}</span></div>
      </div>
    );
  }
  const t = it.task as Task, dw = dueWords(t, today), tone: Tone = it.tone, done = t.status === "done";
  return (
    <div className={wrap}>
      <Check22 done={done} can={w.me.isAdmin} label={done ? "Вернуть в работу" : "Отметить выполненным"} onClick={() => onToggle(t)} />
      <span aria-hidden="true" className="w-1 self-stretch rounded-full" style={{ background: TONE_COL[tone] }} />
      <div role="button" tabIndex={0} onClick={() => onOpen(it)} onKeyDown={open} className="min-w-0 flex-1 cursor-pointer rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
        <b className={cn("block truncate text-[14.5px] font-semibold", done && "text-muted-foreground line-through")}>{t.title}</b>
        <span className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <ScopeChip s={t} w={w} />
          {dw.text && <span className={cn("text-[12.5px]", dw.over ? "font-semibold text-minus" : "text-muted-foreground")}>{dw.text}</span>}
        </span>
      </div>
    </div>
  );
}
