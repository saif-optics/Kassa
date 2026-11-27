// «Точки и киоски»: время начала работы, код и ссылка киоска (копировать), новый код, новая точка.
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, Eye, EyeOff, KeyRound, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/Card";
import { DUR, EASE, land } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Avatar, IconBtn, usePointCol } from "@/features/users/common";
import { initials } from "@/features/users/logic";
import { useAttRefs } from "./hooks";
import { KIOSK_URL, addPoint, newCode, updatePoint, type AttPoint } from "./logic";

export function Kiosks() {
  const qc = useQueryClient();
  const refs = useAttRefs();
  const points = refs.data?.points || [];
  const col = usePointCol(points.map((p) => p.point));
  const [name, setName] = useState(""), [time, setTime] = useState("10:00"), [err, setErr] = useState(""), [busy, setBusy] = useState(false);

  const act = async (f: () => Promise<void>, ok: string): Promise<boolean> => {
    setBusy(true);
    try { await f(); await qc.invalidateQueries({ queryKey: ["att-refs"] }); toast.success(ok); return true; }
    catch (e) { toast.error(e instanceof Error ? e.message : "Не удалось сохранить"); return false; }
    finally { setBusy(false); }
  };
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = name.trim();
    if (!p) { setErr("Укажите название точки"); return; }
    if (points.some((x) => x.point.toLowerCase() === p.toLowerCase())) { setErr("Такая точка уже есть"); return; }
    if (await act(() => addPoint({ point: p, start_time: time || "10:00" }), "Точка добавлена")) { setName(""); setErr(""); }
  };

  return (
    <div className="flex flex-col gap-3.5">
      <Card i={0} title="Точки и киоски" note="время начала работы и ссылка для компьютера точки">
        {refs.isError && <p className="px-1 py-6 text-[13.5px] text-minus">{refs.error instanceof Error ? refs.error.message : "Не удалось загрузить"}</p>}
        {refs.isLoading && <p className="px-1 py-6 text-[13.5px] text-muted-foreground">Загрузка…</p>}
        <div className="flex flex-col">
          {points.map((p, i) => <PointRow key={p.point} p={p} i={i} color={col(p.point)} busy={busy} act={act} />)}
        </div>
        {!refs.isLoading && !points.length && !refs.isError && <p className="px-4 py-8 text-center text-[13.5px] text-muted-foreground">Точек пока нет. Добавьте первую ниже.</p>}
      </Card>
      <Card i={1} title="Новая точка">
        <form onSubmit={add} noValidate className="flex flex-col gap-2.5">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input value={name} onChange={(e) => { setName(e.target.value); setErr(""); }} placeholder="Название точки" autoComplete="off" aria-invalid={!!err} className="min-w-0 flex-1" aria-label="Название точки" />
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} aria-label="Начало работы" className="num sm:w-32" />
            <Button type="submit" size="lg" disabled={busy}><Plus />Добавить точку</Button>
          </div>
          <AnimatePresence initial={false}>{err && <motion.p key="e" role="alert" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: DUR.fast, ease: EASE.out }} className="overflow-hidden text-[12.5px] text-minus">{err}</motion.p>}</AnimatePresence>
          <p className="text-[12.5px] leading-snug text-muted-foreground">На компьютере точки откройте ссылку киоска в Chrome — точка запомнится. Код можно ввести и вручную.</p>
        </form>
      </Card>
    </div>
  );
}

function PointRow({ p, i, color, busy, act }: { p: AttPoint; i: number; color: string; busy: boolean; act: (f: () => Promise<void>, ok: string) => Promise<boolean> }) {
  const [show, setShow] = useState(false), [copied, setCopied] = useState(false), [ask, setAsk] = useState(false);
  const [t, setT] = useState((p.start_time || "10:00").slice(0, 5));
  const link = `${KIOSK_URL}?code=${p.code}`;
  const commit = () => { if (t && t !== (p.start_time || "10:00").slice(0, 5)) void act(() => updatePoint(p.point, { start_time: t }), "Время начала сохранено"); };
  const copy = async () => { try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { toast.error("Не удалось скопировать — выделите ссылку вручную"); } };
  return (
    <motion.div {...land(Math.min(i, 5))} className="flex flex-col gap-2.5 border-t border-border/60 px-1 py-3 first:border-t-0">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
        <div className="flex min-w-[170px] items-center gap-3"><Avatar text={initials(p.point)} color={color} /><span className="font-bold">{p.point}</span></div>
        <label className="flex items-center gap-2 text-[13px] text-muted-foreground">Начало работы
          <Input type="time" value={t} onChange={(e) => setT(e.target.value)} onBlur={commit} aria-label={`Начало работы: ${p.point}`} className="num h-9 w-32 text-foreground" /></label>
        <div className="flex min-w-0 items-center gap-1.5 text-[13px]"><span className="text-muted-foreground">Код</span>
          <code className="num rounded-lg bg-muted px-2 py-1 font-semibold tracking-wider">{show ? p.code : "••••••••"}</code>
          <IconBtn icon={show ? EyeOff : Eye} label={show ? "Скрыть код" : "Показать код"} size={32} onClick={() => setShow((s) => !s)} /></div>
        <div className="flex items-center gap-1.5 sm:ml-auto">
          <Button type="button" variant="secondary" size="sm" onClick={copy}>{copied ? <Check /> : <Copy />}{copied ? "Скопировано" : "Копировать ссылку"}</Button>
          <IconBtn icon={KeyRound} label="Новый код" color="var(--warn)" size={32} disabled={busy} onClick={() => setAsk(true)} />
        </div>
      </div>
      {show && <p className="min-w-0 truncate text-[12px] text-muted-foreground" title={link}>{link}</p>}
      <AnimatePresence initial={false}>
        {ask && (
          <motion.div key="ask" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: DUR.base, ease: EASE.out }} className="overflow-hidden">
            <div className={cn("flex flex-col gap-2 sm:flex-row sm:items-center")}>
              <span className="text-[13px] font-medium text-minus sm:flex-1">Старая ссылка перестанет работать. Выпустить новый код?</span>
              <Button type="button" size="sm" disabled={busy} onClick={async () => { if (await act(() => updatePoint(p.point, { code: newCode() }), "Новый код выпущен")) setAsk(false); }}>Да, выпустить</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setAsk(false)}>Отмена</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
