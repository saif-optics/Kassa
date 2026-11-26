// Пользователи: форма (создание и правка), пароль «один раз», переключатели прав.
import { useState } from "react";
import { Check, Copy, KeyRound, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DEF, MIN_PASS, PERMS, ROLES, defPerms, genPass, permsOf, rolesFor, type Perms, type Role, type UserRow } from "./logic";

export type FormVals = { email: string; password: string; role: Role; point: string; label: string; phone: string; position: string; note: string; perms: Perms };
const ALL = "__all"; // «все точки» в списке (у Radix нельзя пустое значение)

export const emptyForm = (points: string[]): FormVals => ({ email: "", password: genPass(12), role: "seller", point: points[0] || "", label: "", phone: "", position: "", note: "", perms: defPerms("seller") });
export const formOf = (u: UserRow): FormVals => ({ email: u.email, password: "", role: u.role, point: u.point || "", label: u.label || "", phone: u.phone || "", position: u.position || "", note: u.note || "", perms: permsOf(u) });

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={`flex min-w-0 flex-col gap-1.5 ${className || ""}`}><Label className="text-[12px] text-muted-foreground">{label}</Label>{children}</div>;
}

type Props = {
  mode: "create" | "edit"; init: FormVals; points: string[]; me: Role; limited?: boolean; busy?: boolean;
  submitLabel: string; onSubmit: (v: FormVals) => void; extra?: React.ReactNode; onCancel?: () => void;
};

export function UserForm({ mode, init, points, me, limited, busy, submitLabel, onSubmit, extra, onCancel }: Props) {
  const [v, setV] = useState<FormVals>(init);
  const set = <K extends keyof FormVals>(k: K, x: FormVals[K]) => setV((o) => ({ ...o, [k]: x }));
  const adm = v.role === "admin";
  const ps = v.point && !points.includes(v.point) ? [...points, v.point] : points;
  const roles = limited ? [] : rolesFor(me);
  // при смене роли: точка (админу можно «все») и стартовый набор прав
  const onRole = (r: Role) => setV((o) => ({ ...o, role: r, point: r === "admin" ? "" : o.point || points[0] || "", perms: r === "admin" ? permsOf({ role: r, perms: null }) : defPerms(r) }));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!limited && !adm && !v.point) { toast.error("Выберите точку"); return; }
    if (mode === "create") {
      if (!v.email.trim()) { toast.error("Укажите почту"); return; }
      if (v.password.length < MIN_PASS) { toast.error(`Пароль — минимум ${MIN_PASS} знаков`); return; }
    }
    onSubmit(v);
  };
  return (
    <form onSubmit={submit} autoComplete="off" className="flex min-w-0 flex-col gap-3.5">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3">
        {mode === "create" && <>
          <Field label="Логин (почта)"><Input type="email" value={v.email} onChange={(e) => set("email", e.target.value)} autoComplete="off" required /></Field>
          <Field label="Пароль">
            <div className="flex gap-2"><Input type="text" value={v.password} onChange={(e) => set("password", e.target.value)} autoComplete="new-password" minLength={MIN_PASS} required className="min-w-0 flex-1" />
              <Button type="button" variant="secondary" onClick={() => set("password", genPass(12))} aria-label="Сгенерировать пароль"><RefreshCw /><span className="max-sm:hidden">Сгенерировать</span></Button></div>
          </Field>
        </>}
        {!limited && <>
          <Field label="Статус"><Select value={v.role} onValueChange={(r) => onRole(r as Role)}><SelectTrigger className="w-full" aria-label="Статус"><SelectValue /></SelectTrigger>
            <SelectContent>{roles.map((r) => <SelectItem key={r} value={r}>{ROLES[r]}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Точка"><Select value={v.point || ALL} onValueChange={(p) => set("point", p === ALL ? "" : p)}><SelectTrigger className="w-full" aria-label="Точка"><SelectValue /></SelectTrigger>
            <SelectContent>{adm && <SelectItem value={ALL}>Все точки</SelectItem>}{ps.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></Field>
        </>}
        <Field label="Имя"><Input value={v.label} onChange={(e) => set("label", e.target.value)} autoComplete="off" /></Field>
        <Field label="Телефон"><Input type="tel" value={v.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="off" /></Field>
        <Field label="Должность"><Input value={v.position} onChange={(e) => set("position", e.target.value)} autoComplete="off" /></Field>
        <Field label="Заметка"><Input value={v.note} onChange={(e) => set("note", e.target.value)} autoComplete="off" /></Field>
      </div>
      {!limited && (
        <fieldset className="flex flex-col gap-2.5 rounded-2xl border border-border/70 p-3.5">
          <legend className="px-1.5 text-[12px] font-semibold text-muted-foreground">Права</legend>
          {adm ? <p className="text-[13px] text-muted-foreground">Полный доступ</p> : (
            <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {PERMS.map(([k, t]) => (
                <label key={k} className="flex cursor-pointer items-center gap-2.5 text-[13px] leading-snug">
                  <Switch size="sm" checked={!!v.perms[k]} onCheckedChange={(on) => set("perms", { ...v.perms, [k]: on })} aria-label={t} /><span className="min-w-0">{t}</span>
                </label>
              ))}
            </div>
          )}
          {!adm && <button type="button" onClick={() => set("perms", defPerms(v.role))} className="self-start text-[12.5px] font-semibold text-primary hover:underline">Вернуть набор по роли «{ROLES[v.role]}» ({(DEF[v.role] || []).length} из {PERMS.length})</button>}
        </fieldset>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Button type="submit" size="lg" disabled={busy} className="max-sm:w-full">{submitLabel}</Button>
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
      <div className="flex items-center gap-2 text-[13px]"><KeyRound className="size-4 shrink-0 text-primary" /><span className="min-w-0 break-words">Пароль для <b>{email}</b></span></div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input readOnly value={pw} onFocus={(e) => e.target.select()} aria-label="Пароль" className="num min-w-0 flex-1" />
        <Button type="button" variant="secondary" onClick={copy} className="max-sm:w-full">{done ? <Check /> : <Copy />}{done ? "Скопировано" : "Скопировать"}</Button>
        <Button type="button" variant="ghost" onClick={onClose} className="max-sm:w-full">Скрыть</Button>
      </div>
      <small className="text-[12px] text-muted-foreground">Запишите, больше не покажется.</small>
    </div>
  );
}
