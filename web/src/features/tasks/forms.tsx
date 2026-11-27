// Формы «Задание» и «Событие» (лист справа, на телефоне — снизу): название, описание, срок или дата, «Кому видно». Проверка полей — zod.
import { useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Segments } from "@/components/Segments";
import { useIsPhone } from "@/lib/useMedia";
import { cn } from "@/lib/utils";
import type { UserRow } from "@/features/users/logic";
import { userHint, userName } from "./common";
import { KINDS, MAXLEN, PRI, SCOPE_NAME, TASK_POINTS, errMsg, type NewEvent, type NewTask, type Priority, type Scope } from "./logic";

const DATE = /^\d{4}-\d{2}-\d{2}$/, TIME = /^\d{2}:\d{2}$/;
const date = z.string().refine((v) => !v || DATE.test(v), "Неверная дата");
const time = z.string().refine((v) => !v || TIME.test(v), "Неверное время");
const base = {
  title: z.string().trim().min(1, "Напишите название").max(MAXLEN.title, `Не больше ${MAXLEN.title} знаков`),
  body: z.string().max(MAXLEN.body, `Не больше ${MAXLEN.body} знаков`),
  scope: z.enum(["all", "point", "person"]), point: z.string(), person: z.string(),
};
type Sc = { scope: Scope; point: string; person: string };
const scopeRule = (v: Sc, ctx: z.RefinementCtx) => {
  if (v.scope === "point" && !v.point) ctx.addIssue({ code: "custom", path: ["point"], message: "Выберите точку" });
  if (v.scope === "person" && !v.person) ctx.addIssue({ code: "custom", path: ["person"], message: "Выберите человека" });
};
const taskSchema = z.object({ ...base, priority: z.enum(["low", "normal", "high"]), due: date, time }).superRefine((v, ctx) => {
  scopeRule(v, ctx);
  if (v.time && !v.due) ctx.addIssue({ code: "custom", path: ["time"], message: "Время нужно со сроком — укажите дату" });
});
const eventSchema = z.object({ ...base, kind: z.string(), date: z.string().regex(DATE, "Укажите дату"), allDay: z.boolean(), startTime: time, endDate: date, endTime: time }).superRefine((v, ctx) => {
  scopeRule(v, ctx);
  if (v.endDate && v.endDate < v.date) ctx.addIssue({ code: "custom", path: ["endDate"], message: "Конец раньше начала" });
  if (!v.allDay && v.endTime && !v.startTime) ctx.addIssue({ code: "custom", path: ["endTime"], message: "Сначала время начала" });
  if (!v.allDay && v.startTime && v.endTime && (!v.endDate || v.endDate === v.date) && v.endTime < v.startTime) ctx.addIssue({ code: "custom", path: ["endTime"], message: "Конец раньше начала" });
});

const Field = ({ label, count, error, children, className }: { label: string; count?: string; error?: string; children: ReactNode; className?: string }) => (
  <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
    <div className="flex items-baseline justify-between gap-2"><Label className="text-[12.5px] text-muted-foreground">{label}</Label>{count && <span className="num text-[11px] text-muted-foreground">{count}</span>}</div>
    {children}
    {error && <p role="alert" className="text-[12px] text-minus">{error}</p>}
  </div>
);

function Shell({ open, onClose, title, hint, children }: { open: boolean; onClose: () => void; title: string; hint: string; children: ReactNode }) {
  const phone = useIsPhone();
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side={phone ? "bottom" : "right"} className={cn("glass gap-0 overflow-y-auto p-0", phone ? "max-h-[92dvh] rounded-t-[24px]" : "sm:max-w-md")}>
        <SheetHeader className="border-b border-border p-4"><SheetTitle>{title}</SheetTitle><SheetDescription>{hint}</SheetDescription></SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}

const Pick = ({ value, onChange, items, placeholder, label, error }: { value: string; onChange: (v: string) => void; items: { key: string; label: string; hint?: string }[]; placeholder: string; label: string; error?: string }) => (
  <Field label={label} error={error}>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} aria-invalid={!!error} className="h-10 w-full rounded-lg"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>{items.map((i) => <SelectItem key={i.key} value={i.key}>{i.label}{i.hint && <span className="ml-1.5 text-muted-foreground">· {i.hint}</span>}</SelectItem>)}</SelectContent>
    </Select>
  </Field>
);

/** «Кому видно»: все / точка / человек + выбор точки или человека */
function Whom({ f, users, errors }: { f: ReturnType<typeof useForm<any>>; users: UserRow[]; errors: Record<string, { message?: string } | undefined> }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const scope = f.watch("scope") as Scope;
  const set = (k: string, v: string) => f.setValue(k, v, { shouldValidate: true, shouldDirty: true });
  return (
    <>
      <Field label="Кому видно">
        <Segments size="sm" aria-label="Кому видно" value={scope} onChange={(k) => { set("scope", k); }} items={(Object.keys(SCOPE_NAME) as Scope[]).map((k) => ({ key: k, label: SCOPE_NAME[k] }))} />
        <p className="text-[12px] text-muted-foreground">{scope === "all" ? "Увидят все сотрудники с доступом к заданиям." : scope === "point" ? "Увидят те, у кого доступ к этой точке." : "Увидит только этот человек и админы."}</p>
      </Field>
      {scope === "point" && <Pick label="Точка" value={f.watch("point")} onChange={(v) => set("point", v)} placeholder="Выберите точку" items={TASK_POINTS.map((p) => ({ key: p, label: p }))} error={errors.point?.message} />}
      {scope === "person" && <Pick label="Человек" value={f.watch("person")} onChange={(v) => set("person", v)} placeholder={users.length ? "Выберите человека" : "Список людей недоступен"}
        items={users.map((u) => ({ key: u.email.toLowerCase(), label: userName(u), hint: userHint(u) }))} error={errors.person?.message} />}
    </>
  );
}

const Actions = ({ busy, ok, onClose }: { busy: boolean; ok: string; onClose: () => void }) => (
  <div className="flex gap-2 pt-1">
    <Button type="submit" disabled={busy} className="h-10 flex-1 rounded-full">{ok}</Button>
    <Button type="button" variant="secondary" onClick={onClose} className="h-10 flex-1 rounded-full">Отмена</Button>
  </div>
);

export interface FormEnv { users: UserRow[]; point: string }

/** новое задание (админ) */
export function TaskSheet({ open, onClose, day, env, onSave }: { open: boolean; onClose: () => void; day: string; env: FormEnv; onSave: (v: NewTask) => Promise<void> }) {
  return <Shell open={open} onClose={onClose} title="Новое задание" hint="Срок, важность и кому видно">{open && <TaskForm key={day} day={day} env={env} onSave={onSave} onClose={onClose} />}</Shell>;
}
type TF = z.infer<typeof taskSchema>;
function TaskForm({ day, env, onSave, onClose }: { day: string; env: FormEnv; onSave: (v: NewTask) => Promise<void>; onClose: () => void }) {
  const f = useForm<TF>({ resolver: zodResolver(taskSchema), defaultValues: { title: "", body: "", priority: "normal", due: day, time: "", scope: "point", point: env.point || TASK_POINTS[0], person: "" } });
  const [busy, setBusy] = useState(false), { errors } = f.formState, v = f.watch();
  const submit = f.handleSubmit(async (x) => {
    setBusy(true);
    try { await onSave({ ...x, title: x.title.trim(), body: x.body.trim(), personLabel: userName(env.users.find((u) => u.email.toLowerCase() === x.person)) }); toast.success("Задание создано"); onClose(); } catch (e) { toast.error(errMsg(e)); }
    setBusy(false);
  });
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-3.5 p-4">
      <Field label="Название" count={`${v.title.length}/${MAXLEN.title}`} error={errors.title?.message}><Input {...f.register("title")} maxLength={MAXLEN.title} aria-invalid={!!errors.title} autoFocus className="h-10" /></Field>
      <Field label="Описание" count={`${v.body.length}/${MAXLEN.body}`} error={errors.body?.message}><Textarea {...f.register("body")} maxLength={MAXLEN.body} className="min-h-20 text-[14px]" /></Field>
      <Field label="Важность">
        <Controller control={f.control} name="priority" render={({ field }) => <Segments size="sm" aria-label="Важность" value={field.value} onChange={(k) => field.onChange(k as Priority)} items={(Object.keys(PRI) as Priority[]).map((k) => ({ key: k, label: PRI[k] }))} />} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Срок" error={errors.due?.message}><Input type="date" {...f.register("due")} aria-invalid={!!errors.due} className="h-10" /></Field>
        <Field label="Время (необязательно)" error={errors.time?.message}><Input type="time" {...f.register("time")} aria-invalid={!!errors.time} className="h-10" /></Field>
      </div>
      <Whom f={f as never} users={env.users} errors={errors as never} />
      <Actions busy={busy} ok="Создать" onClose={onClose} />
    </form>
  );
}

/** новое событие (админ) */
export function EventSheet({ open, onClose, day, env, onSave }: { open: boolean; onClose: () => void; day: string; env: FormEnv; onSave: (v: NewEvent) => Promise<void> }) {
  return <Shell open={open} onClose={onClose} title="Новое событие" hint="Собрание, поставка, зарплата и другое">{open && <EventForm key={day} day={day} env={env} onSave={onSave} onClose={onClose} />}</Shell>;
}
type EF = z.infer<typeof eventSchema>;
function EventForm({ day, env, onSave, onClose }: { day: string; env: FormEnv; onSave: (v: NewEvent) => Promise<void>; onClose: () => void }) {
  const f = useForm<EF>({ resolver: zodResolver(eventSchema), defaultValues: { title: "", body: "", kind: "meeting", date: day, allDay: false, startTime: "", endDate: "", endTime: "", scope: "all", point: env.point || TASK_POINTS[0], person: "" } });
  const [busy, setBusy] = useState(false), { errors } = f.formState, v = f.watch();
  const submit = f.handleSubmit(async (x) => {
    setBusy(true);
    try { await onSave({ ...x, title: x.title.trim(), body: x.body.trim() }); toast.success("Событие создано"); onClose(); } catch (e) { toast.error(errMsg(e)); }
    setBusy(false);
  });
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-3.5 p-4">
      <Field label="Название" count={`${v.title.length}/${MAXLEN.title}`} error={errors.title?.message}><Input {...f.register("title")} maxLength={MAXLEN.title} aria-invalid={!!errors.title} autoFocus className="h-10" /></Field>
      <Field label="Описание" count={`${v.body.length}/${MAXLEN.body}`} error={errors.body?.message}><Textarea {...f.register("body")} maxLength={MAXLEN.body} className="min-h-16 text-[14px]" /></Field>
      <Field label="Что за событие">
        <Controller control={f.control} name="kind" render={({ field }) => <Segments size="sm" aria-label="Вид события" value={field.value} onChange={field.onChange} items={Object.entries(KINDS).map(([key, label]) => ({ key, label }))} />} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Дата" error={errors.date?.message}><Input type="date" {...f.register("date")} aria-invalid={!!errors.date} className="h-10" /></Field>
        <Field label="Конец (дата)" error={errors.endDate?.message}><Input type="date" {...f.register("endDate")} min={v.date} aria-invalid={!!errors.endDate} className="h-10" /></Field>
      </div>
      <label className="flex items-center gap-2.5 text-[13.5px]"><Controller control={f.control} name="allDay" render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Весь день" />} />Весь день</label>
      {!v.allDay && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Начало" error={errors.startTime?.message}><Input type="time" {...f.register("startTime")} aria-invalid={!!errors.startTime} className="h-10" /></Field>
          <Field label="Конец (время)" error={errors.endTime?.message}><Input type="time" {...f.register("endTime")} aria-invalid={!!errors.endTime} className="h-10" /></Field>
        </div>
      )}
      <Whom f={f as never} users={env.users} errors={errors as never} />
      <Actions busy={busy} ok="Создать" onClose={onClose} />
    </form>
  );
}
