// Пользователи: форма (создание и правка), пароль «один раз», переключатели прав.
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, KeyRound, Minus, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DUR, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Dot, DotChip, usePointCol } from "./common";
import { DEF, MIN_PASS, PERMS, ROLES, ROLE_VAR, defPerms, genPass, permsOf, rolesFor, type Perms, type Role, type UserRow } from "./logic";

export type FormVals = { email: string; password: string; role: Role; point: string; label: string; phone: string; position: string; note: string; perms: Perms };
const ALL = "__all"; // «все точки» в списке (у Radix нельзя пустое значение)

export const emptyForm = (points: string[]): FormVals => ({ email: "", password: genPass(12), role: "seller", point: points[0] || "", label: "", phone: "", position: "", note: "", perms: defPerms("seller") });
export const formOf = (u: UserRow): FormVals => ({ email: u.email, password: "", role: u.role, point: u.point || "", label: u.label || "", phone: u.phone || "", position: u.position || "", note: u.note || "", perms: permsOf(u) });

function Field({ label, error, children, className }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <Label className="text-[12.5px] font-semibold text-muted-foreground">{label}</Label>
      {children}
      <AnimatePresence initial={false}>
        {error && <motion.p key="e" role="alert" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: DUR.fast, ease: EASE.out }} className="overflow-hidden text-[12.5px] text-minus">{error}</motion.p>}
      </AnimatePresence>
    </div>
  );
}

type Props = {
  mode: "create" | "edit"; init: FormVals; points: string[]; me: Role; limited?: boolean; busy?: boolean;
  submitLabel: string; onSubmit: (v: FormVals) => void; extra?: React.ReactNode; onCancel?: () => void;
};
type Errs = Partial<Record<"email" | "password" | "point", string>>;

export function UserForm({ mode, init, points, me, limited, busy, submitLabel, onSubmit, extra, onCancel }: Props) {
  const [v, setV] = useState<FormVals>(init);
  const [errs, setErrs] = useState<Errs>({}), [noteOpen, setNoteOpen] = useState(!!init.note);
  const col = usePointCol(points);
  const set = <K extends keyof FormVals>(k: K, x: FormVals[K]) => { setV((o) => ({ ...o, [k]: x })); if (k in errs) setErrs((e) => ({ ...e, [k]: undefined })); };
  const adm = v.role === "admin";
  const ps = v.point && !points.includes(v.point) ? [...points, v.point] : points;
  const roles = limited ? [] : rolesFor(me);
  // при смене роли: точка (админу можно «все») и стартовый набор прав
  const onRole = (r: Role) => setV((o) => ({ ...o, role: r, point: r === "admin" ? "" : o.point || points[0] || "", perms: r === "admin" ? permsOf({ role: r, perms: null }) : defPerms(r) }));
  const check = (): Errs => {
    const e: Errs = {};
    if (!limited && !adm && !v.point) e.point = "Выберите точку";
    if (mode === "create") {
      const m = v.email.trim();
      if (!m) e.email = "Укажите почту"; else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m)) e.email = "Почта написана неверно";
      if (v.password.length < MIN_PASS) e.password = `Пароль — минимум ${MIN_PASS} знаков`;
    }
    return e;
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er = check(); setErrs(er);
    if (Object.keys(er).length) return;
    onSubmit(v);
  };
  return (
    <form onSubmit={submit} autoComplete="off" noValidate className="flex min-w-0 flex-col gap-3.5">
      {mode === "create" && <>
        <Field label="Логин (почта)" error={errs.email}><Input type="email" inputMode="email" placeholder="name@example.com" value={v.email} onChange={(e) => set("email", e.target.value)} autoComplete="off" aria-invalid={!!errs.email} /></Field>
        <Field label="Пароль" error={errs.password}>
          <div className="flex gap-2"><Input type="text" value={v.password} onChange={(e) => set("password", e.target.value)} autoComplete="new-password" aria-invalid={!!errs.password} className="num min-w-0 flex-1" />
            <Button type="button" variant="secondary" onClick={() => set("password", genPass(12))} aria-label="Сгенерировать пароль"><RefreshCw /><span className="max-[420px]:hidden">Сгенерировать</span></Button></div>
        </Field>
      </>}
      {!limited && <>
        <Field label="Статус">
          <div role="radiogroup" aria-label="Статус" className="flex flex-wrap gap-1.5">
            {roles.map((r) => {
              const on = v.role === r;
              return (
                <button key={r} type="button" role="radio" aria-checked={on} onClick={() => onRole(r)}
                  className={cn("rounded-full outline-none transition-[box-shadow,opacity] focus-visible:ring-2 focus-visible:ring-primary/50", on ? "opacity-100" : "opacity-60 hover:opacity-100")}
                  style={{ boxShadow: on ? `0 0 0 1.5px ${ROLE_VAR[r]}` : "none" }}>
                  <DotChip color={ROLE_VAR[r]} className="h-8 px-3 text-[13px]">{ROLES[r]}</DotChip>
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Точка" error={errs.point}>
          <Select value={v.point || ALL} onValueChange={(p) => set("point", p === ALL ? "" : p)}>
            <SelectTrigger className="w-full" aria-label="Точка" aria-invalid={!!errs.point}><SelectValue /></SelectTrigger>
            <SelectContent>
              {adm && <SelectItem value={ALL}><Dot color="var(--chart-5)" />Все точки</SelectItem>}
              {ps.map((p) => <SelectItem key={p} value={p}><Dot color={col(p)} />{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </>}
      <div className="grid grid-cols-1 gap-3.5 min-[420px]:grid-cols-2">
        <Field label="Имя"><Input placeholder="Имя Фамилия" value={v.label} onChange={(e) => set("label", e.target.value)} autoComplete="off" /></Field>
        <Field label="Телефон"><Input type="tel" inputMode="tel" placeholder="+998" value={v.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="off" /></Field>
      </div>
      <Field label="Должность"><Input placeholder="Кассир, мастер…" value={v.position} onChange={(e) => set("position", e.target.value)} autoComplete="off" /></Field>
      <div className="flex flex-col gap-1.5">
        <button type="button" aria-expanded={noteOpen} onClick={() => setNoteOpen((o) => !o)} className="flex w-fit items-center gap-1.5 rounded text-[12.5px] font-semibold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-primary/40">
          {noteOpen ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}Заметка{!noteOpen && v.note ? " · есть" : ""}
        </button>
        <AnimatePresence initial={false}>
          {noteOpen && <motion.div key="n" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: DUR.base, ease: EASE.out }} className="overflow-hidden">
            <Textarea rows={2} value={v.note} onChange={(e) => set("note", e.target.value)} placeholder="Для себя: смены, отпуск…" className="min-h-0" />
          </motion.div>}
        </AnimatePresence>
      </div>
      {!limited && (
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-[12.5px] font-semibold text-muted-foreground">
            <span>Права{adm ? " · полный доступ" : <> · набор «{ROLES[v.role]}», можно менять</>}</span>
            {!adm && <button type="button" onClick={() => set("perms", defPerms(v.role))} className="rounded font-semibold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-primary/40">Вернуть набор ({(DEF[v.role] || []).length} из {PERMS.length})</button>}
          </div>
          {!adm && (
            <div className="grid grid-cols-1 gap-x-6 gap-y-2.5 min-[480px]:grid-cols-2">
              {PERMS.map(([k, t]) => (
                <label key={k} className="flex cursor-pointer items-center justify-between gap-3 text-[13.5px] leading-snug">
                  <span className="min-w-0">{t}</span>
                  <Switch size="sm" checked={!!v.perms[k]} onCheckedChange={(on) => set("perms", { ...v.perms, [k]: on })} aria-label={t} />
                </label>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Button type="submit" size="lg" disabled={busy} className="h-11 flex-1 max-sm:w-full">{mode === "create" && <Plus />}{submitLabel}</Button>
        {onCancel && <Button type="button" variant="ghost" size="lg" onClick={onCancel} className="max-sm:w-full">Отмена</Button>}
        {extra}
      </div>
    </form>
  );
}

/** новый пароль: виден один раз, копируется кнопкой */
export function PassOnce({ email, pw, onClose }: { email: string; pw: string; onClose: () => void }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(pw); setDone(true); setTimeout(() => setDone(false), 2000); } catch { toast.error("Не удалось скопировать — выделите пароль вручную"); }
  };
  return (
    <div role="status" className="glass-inner flex flex-col gap-2 rounded-2xl p-3.5">
      <div className="flex items-center gap-2 text-[13px]"><KeyRound className="size-4 shrink-0 text-warn" /><span className="min-w-0 break-words">Пароль для <b>{email}</b></span></div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input readOnly value={pw} onFocus={(e) => e.target.select()} aria-label="Пароль" className="num min-w-0 flex-1" />
        <Button type="button" variant="secondary" onClick={copy} className="max-sm:w-full">{done ? <Check /> : <Copy />}{done ? "Скопировано" : "Скопировать"}</Button>
        <Button type="button" variant="ghost" onClick={onClose} className="max-sm:w-full">Скрыть</Button>
      </div>
      <small className="text-[12px] text-muted-foreground">Запишите, больше не покажется.</small>
    </div>
  );
}
