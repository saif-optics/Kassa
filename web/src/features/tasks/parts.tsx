// Части раздела «Задания»: карточка задания (раскрывается), оболочка формы (лист снизу / карточка сверху), формы.
import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Card } from "@/components/Card";
import { Segments } from "@/components/Segments";
import { Chip, type ChipTone } from "@/components/Tile";
import { DUR, EASE, land } from "@/lib/motion";
import { useIsPhone } from "@/lib/useMedia";
import { cn } from "@/lib/utils";
import { MAXLEN, PRI, ST, errMsg, fmtD, fmtT, isOverdue, type Priority, type Status, type Task, type TaskComment, type useTaskActions } from "./logic";
import { ScopeChip, type Who } from "./common";

type Actions = ReturnType<typeof useTaskActions>;
const PRI_TONE: Record<Priority, ChipTone> = { high: "minus", normal: "muted", low: "info" };
const ST_TONE: Record<Status, ChipTone> = { new: "warn", work: "info", done: "plus" };
const fail = (e: unknown) => { toast.error(errMsg(e)); };

export function TaskCard({ t, comments, admin, today, open, onToggle, act, i, w }: {
  t: Task; comments: TaskComment[]; admin: boolean; today: string; open: boolean; onToggle: () => void; act: Actions; i: number; w: Who;
}) {
  const od = isOverdue(t, today);
  return (
    <motion.div {...(i < 12 ? land(i) : {})} className="glass-inner min-w-0 rounded-2xl px-3.5 py-3">
      <div role="button" tabIndex={0} aria-expanded={open} onClick={onToggle}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
        className="flex cursor-pointer flex-col gap-1.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
        <div className="flex items-start gap-3">
          <b className="min-w-0 flex-1 text-[14px] leading-snug font-semibold [overflow-wrap:anywhere]">{t.title}</b>
          <ChevronDown aria-hidden="true" className={cn("mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip tone={PRI_TONE[t.priority]}>{PRI[t.priority]}</Chip>
          <Chip tone={ST_TONE[t.status]}>{ST[t.status]}</Chip>
          {t.due && <Chip tone={od ? "minus" : "muted"}>{od ? "Просрочено · " : "Срок "}{fmtD(t.due)}{t.due_time ? " " + t.due_time : ""}</Chip>}
          <ScopeChip s={t} w={w} />
          {t.source === "seller" && <Chip tone="warn">от продавца</Chip>}
          {t.assignee && t.scope !== "person" && <span className="min-w-0 truncate text-[12px] text-muted-foreground">Ответственный: {t.assignee}</span>}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="more" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: DUR.base, ease: EASE.out }} className="overflow-hidden">
            <Details t={t} comments={comments} admin={admin} act={act} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function Details({ t, comments, admin, act }: { t: Task; comments: TaskComment[]; admin: boolean; act: Actions }) {
  const [text, setText] = useState(""), [busy, setBusy] = useState(false), [ask, setAsk] = useState(false);
  const run = async (f: () => Promise<void>) => { if (busy) return; setBusy(true); try { await f(); } catch (e) { fail(e); } setBusy(false); };
  const send = (e: React.FormEvent) => { e.preventDefault(); const b = text.trim(); if (!b) return; run(async () => { await act.comment(t.id, b); setText(""); }); };
  return (
    <div className="mt-2.5 flex flex-col gap-3 border-t border-border/70 pt-2.5 text-[13px]">
      {t.body ? <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{t.body}</p> : <p className="text-muted-foreground">Без описания</p>}
      <p className="text-[12px] text-muted-foreground">Создано {fmtT(t.created_at)}{t.created_label ? " · " + t.created_label : ""}</p>
      <div className="flex flex-col gap-1.5">
        {comments.length ? comments.map((c) => (
          <div key={c.id} className={cn("rounded-xl px-3 py-2", c.kind === "problem" ? "bg-warn-soft" : "bg-background/60 dark:bg-white/5")}>
            <small className={cn("mb-0.5 block text-[11.5px]", c.kind === "problem" ? "font-semibold text-warn" : "text-muted-foreground")}>
              {(c.author_label || (admin ? c.author_email : "") || "") + " · " + fmtT(c.created_at) + (c.kind === "problem" ? " · проблема" : "")}</small>
            <span className="whitespace-pre-wrap [overflow-wrap:anywhere]">{c.body}</span>
          </div>
        )) : <p className="text-[12px] text-muted-foreground">Комментариев пока нет</p>}
      </div>
      <form onSubmit={send} className="flex flex-col gap-2">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={MAXLEN.comment} aria-label="Комментарий" placeholder="Комментарий" className="min-h-16 text-[14px]" />
        <Button type="submit" variant="secondary" disabled={busy || !text.trim()} className="h-10 rounded-full max-sm:w-full sm:self-start"><Send />Отправить</Button>
      </form>
      {admin && (
        <div className="flex flex-col gap-2 border-t border-border/70 pt-2.5">
          <Segments size="sm" aria-label="Статус задания" value={t.status} onChange={(k) => run(() => act.setStatus(t.id, k as Status))}
            items={(Object.keys(ST) as Status[]).map((k) => ({ key: k, label: ST[k] }))} />
          {!ask ? (
            <Button type="button" variant="ghost" onClick={() => setAsk(true)} className="h-9 rounded-full text-minus hover:text-minus max-sm:w-full sm:self-start"><Trash2 />Удалить</Button>
          ) : (
            <div role="alert" className="flex flex-col gap-2 rounded-xl bg-minus-soft p-3">
              <span className="text-minus">Удалить задание вместе с комментариями?</span>
              <div className="flex gap-2">
                <Button type="button" variant="destructive" disabled={busy} onClick={() => run(() => act.remove(t.id))} className="h-9 flex-1 rounded-full sm:flex-none">Удалить</Button>
                <Button type="button" variant="secondary" onClick={() => setAsk(false)} className="h-9 flex-1 rounded-full sm:flex-none">Отмена</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** форма: на телефоне — лист снизу, на компьютере — карточка над списком */
export function FormShell({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const phone = useIsPhone();
  if (phone) return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent side="bottom" showCloseButton={false} className="max-h-[90dvh] gap-0 overflow-y-auto rounded-t-[28px] p-4 pb-5">
        <SheetTitle className="mb-3 text-[16px] font-semibold">{title}</SheetTitle>
        <SheetDescription className="sr-only">{title}</SheetDescription>
        {children}
      </SheetContent>
    </Sheet>
  );
  return open ? <Card title={title} action={{ label: "Закрыть", onClick: onClose }}>{children}</Card> : null;
}

const Field = ({ label, count, children, className }: { label: string; count?: string; children: ReactNode; className?: string }) => (
  <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
    <div className="flex items-baseline justify-between gap-2"><Label className="text-[12.5px] text-muted-foreground">{label}</Label>{count && <span className="num text-[11px] text-muted-foreground">{count}</span>}</div>
    {children}
  </div>
);
const Buttons = ({ busy, ok, onClose }: { busy: boolean; ok: string; onClose: () => void }) => (
  <div className="flex gap-2 sm:col-span-2">
    <Button type="submit" disabled={busy} className="h-10 flex-1 rounded-full sm:flex-none sm:px-6">{ok}</Button>
    <Button type="button" variant="secondary" onClick={onClose} className="h-10 flex-1 rounded-full sm:flex-none sm:px-6">Отмена</Button>
  </div>
);

/** проблема или предложение (ограниченная роль) → rpc tasks_problem */
export function ProblemForm({ onSave, onClose }: { onSave: (title: string, body: string) => Promise<void>; onClose: () => void }) {
  const [title, setTitle] = useState(""), [body, setBody] = useState(""), [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Напишите заголовок"); return; }
    setBusy(true);
    try { await onSave(title.trim(), body.trim()); toast.success("Отправлено"); onClose(); } catch (x) { fail(x); }
    setBusy(false);
  };
  return (
    <form onSubmit={submit} className="grid gap-3">
      <Field label="Заголовок" count={`${title.length}/${MAXLEN.title}`}><Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={MAXLEN.title} required className="h-10" /></Field>
      <Field label="Что случилось или что предлагаете" count={`${body.length}/${MAXLEN.body}`}><Textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={MAXLEN.body} className="min-h-24 text-[14px]" /></Field>
      <Buttons busy={busy} ok="Отправить" onClose={onClose} />
    </form>
  );
}
