// «Сотрудники»: список с лицом и статусом, добавить, изменить, отключить, снять или переснять лицо камерой.
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { Pencil, Plus, Power, ScanFace, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card } from "@/components/Card";
import { Fold } from "@/components/Fold";
import { Chip } from "@/components/Tile";
import { DUR, EASE, land } from "@/lib/motion";
import { useIsPhone, useMedia } from "@/lib/useMedia";
import { cn } from "@/lib/utils";
import { pl } from "@/features/pay/logic";
import { Avatar, Dot, DotChip, IconBtn, PointChip, usePointCol } from "@/features/users/common";
import { initials } from "@/features/users/logic";
import { FaceCapture } from "./FaceCapture";
import { useAttRefs } from "./hooks";
import { addEmp, updateEmp, type AttEmp } from "./logic";

const ECOLS = "grid-cols-[minmax(0,1.6fr)_140px_minmax(0,1.2fr)_120px_136px]";

export function FaceChip({ n }: { n: number }) {
  if (!n) return <Chip tone="warn">не снято</Chip>;
  if (n < 3) return <Chip tone="warn">{n} {pl(n, "снимок", "снимка", "снимков")} · мало, переснимите</Chip>;
  return <Chip tone="plus">{n} {pl(n, "снимок", "снимка", "снимков")}</Chip>;
}

type Face = { emp: AttEmp | null; add?: { name: string; point: string } };

export function Staff({ pt }: { pt: string }) {
  const phone = useIsPhone(), cards = useMedia("(max-width: 1023px)");
  const qc = useQueryClient();
  const refs = useAttRefs();
  const points = refs.data?.points || [], emps = refs.data?.emps || [];
  const col = usePointCol(points.map((p) => p.point));
  const [form, setForm] = useState<{ emp: AttEmp | null } | null>(null), [face, setFace] = useState<Face | null>(null), [busy, setBusy] = useState(false);

  const act = async (f: () => Promise<void>, ok: string): Promise<boolean> => {
    setBusy(true);
    try { await f(); await qc.invalidateQueries({ queryKey: ["att-refs"] }); toast.success(ok); return true; }
    catch (e) { toast.error(e instanceof Error ? e.message : "Не удалось сохранить"); return false; }
    finally { setBusy(false); }
  };
  const list = emps.filter((e) => !pt || e.point === pt).sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name, "ru"));
  const toggle = (e: AttEmp) => { void act(() => updateEmp(e.id, { active: !e.active }), e.active ? "Сотрудник отключён" : "Сотрудник включён"); };
  const faceDone = async (d: number[][]) => {
    const f = face; setFace(null);
    if (!f) return;
    if (f.emp) { const id = f.emp.id; await act(() => updateEmp(id, { descriptors: d }), "Лицо снято"); }
    else if (f.add) { const a = f.add; await act(() => addEmp({ ...a, descriptors: d }), "Сотрудник добавлен"); }
  };

  const faceBtn = (e: AttEmp) => <IconBtn icon={ScanFace} label={e.descriptors?.length ? "Переснять лицо" : "Снять лицо"} color={e.descriptors?.length ? undefined : "var(--primary)"} disabled={busy} onClick={() => setFace({ emp: e })} />;
  const btns = (e: AttEmp, grid?: boolean) => (
    <div className={cn("flex items-center gap-1.5", grid ? "grid grid-cols-3 [&>*]:!w-full" : "justify-end")}>
      {faceBtn(e)}<IconBtn icon={Pencil} label="Изменить" onClick={() => setForm({ emp: e })} /><IconBtn icon={Power} label={e.active ? "Отключить" : "Включить"} color={e.active ? undefined : "var(--plus)"} disabled={busy} onClick={() => toggle(e)} />
    </div>
  );

  return (
    <>
      <Card i={0} title="Сотрудники" note={cards ? undefined : "точка работы, лицо и статус"}
        action={<Button size="sm" onClick={() => setForm({ emp: null })}><UserPlus />Добавить сотрудника</Button>}>
        {refs.isError && <p className="px-1 py-6 text-[13.5px] text-minus">{refs.error instanceof Error ? refs.error.message : "Не удалось загрузить"}</p>}
        {refs.isLoading && <p className="px-1 py-6 text-[13.5px] text-muted-foreground">Загрузка…</p>}
        {!refs.isLoading && !refs.isError && !list.length && <p className="px-4 py-10 text-center text-[13.5px] text-muted-foreground">{emps.length ? "На этой точке сотрудников нет." : "Пока нет сотрудников. Добавьте первого."}</p>}
        {list.length > 0 && !cards && (
          <div role="table" aria-label="Сотрудники">
            <div role="row" className={cn("grid items-center gap-x-3 px-2 pb-2 text-[11.5px] font-semibold tracking-[.06em] text-muted-foreground uppercase", ECOLS)}>
              <span className="pl-[52px]">Сотрудник</span><span>Точка работы</span><span>Лицо</span><span>Статус</span><span className="text-right">Действия</span>
            </div>
            <Fold id="att.staff" rows={list} limit={12}>{(shown) => <div>{shown.map((e, i) => (
              <motion.div key={e.id} {...land(Math.min(i, 6))} role="row" className={cn("grid items-center gap-x-3 border-t border-border/60 px-2 py-2 text-[13.5px]", ECOLS)}>
                <div className={cn("flex min-w-0 items-center gap-3", !e.active && "opacity-55")}><Avatar text={initials(e.name)} color={col(e.point)} /><span className="min-w-0 font-bold">{e.name}</span></div>
                <div className={cn(!e.active && "opacity-55")}><PointChip color={col(e.point)}>{e.point}</PointChip></div>
                <div className={cn(!e.active && "opacity-55")}><FaceChip n={e.descriptors?.length || 0} /></div>
                <div><DotChip color={e.active ? "var(--plus)" : "var(--chart-5)"}>{e.active ? "работает" : "отключён"}</DotChip></div>
                {btns(e)}
              </motion.div>))}</div>}</Fold>
          </div>
        )}
        {list.length > 0 && cards && (
          <Fold id="att.staff" rows={list} limit={8} className="flex flex-col gap-2">{(shown) => <div className="flex flex-col gap-2">{shown.map((e, i) => (
            <motion.div key={e.id} {...land(Math.min(i, 5))} className="glass-inner flex flex-col gap-3 rounded-[20px] p-3.5">
              <div className={cn("flex items-center gap-3", !e.active && "opacity-55")}><Avatar text={initials(e.name)} color={col(e.point)} size={46} />
                <div className="min-w-0 flex-1"><div className="text-[15.5px] leading-tight font-bold">{e.name}</div><div className="mt-1 flex items-center gap-1.5 text-[12.5px] text-muted-foreground"><Dot color={col(e.point)} />{e.point}{e.active ? "" : " · отключён"}</div></div></div>
              <FaceChip n={e.descriptors?.length || 0} />
              {btns(e, true)}
            </motion.div>))}</div>}</Fold>
        )}
      </Card>

      <EmpSheet key={form?.emp?.id || "new"} open={!!form} emp={form?.emp || null} points={points.map((p) => p.point)} busy={busy} phone={phone} col={col}
        onClose={() => setForm(null)}
        onSave={async (v) => { if (form?.emp) { const id = form.emp.id; if (await act(() => updateEmp(id, v), "Сохранено")) setForm(null); } else if (await act(() => addEmp({ ...v, descriptors: [] }), "Сотрудник добавлен")) setForm(null); }}
        onFace={(v) => { setForm(null); setFace({ emp: null, add: v }); }} />
      <FaceCapture open={!!face} name={face?.emp?.name || face?.add?.name || ""} onClose={() => setFace(null)} onDone={(d) => void faceDone(d)} />
    </>
  );
}

type SheetProps = { open: boolean; emp: AttEmp | null; points: string[]; busy: boolean; phone: boolean; col: (p?: string | null) => string; onClose: () => void; onSave: (v: { name: string; point: string }) => void; onFace: (v: { name: string; point: string }) => void };

function EmpSheet({ open, emp, points, busy, phone, col, onClose, onSave, onFace }: SheetProps) {
  const [name, setName] = useState(emp?.name || ""), [point, setPoint] = useState(emp?.point || points[0] || ""), [err, setErr] = useState("");
  const ps = point && !points.includes(point) ? [...points, point] : points;
  const check = (): { name: string; point: string } | null => {
    const n = name.trim();
    if (!n) { setErr("Укажите имя"); return null; }
    if (!point) { setErr("Сначала добавьте точку"); return null; }
    return { name: n, point };
  };
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side={phone ? "bottom" : "right"} className={cn("glass gap-0 overflow-y-auto p-0", phone ? "max-h-[92dvh] rounded-t-[24px]" : "sm:max-w-md")}>
        <SheetHeader className="border-b border-border p-4 pr-12"><SheetTitle>{emp ? "Изменить сотрудника" : "Новый сотрудник"}</SheetTitle>
          <SheetDescription>{emp ? emp.name : "Лицо можно снять позже — пока оно не снято, киоск сотрудника не узнает"}</SheetDescription></SheetHeader>
        <form className="flex flex-col gap-3.5 p-4" noValidate onSubmit={(e) => { e.preventDefault(); const v = check(); if (v) onSave(v); }}>
          <div className="flex flex-col gap-1.5"><Label className="text-[12.5px] font-semibold text-muted-foreground">Имя и фамилия</Label>
            <Input value={name} onChange={(e) => { setName(e.target.value); setErr(""); }} placeholder="Имя Фамилия" autoComplete="off" aria-invalid={!!err} /></div>
          <div className="flex flex-col gap-1.5"><Label className="text-[12.5px] font-semibold text-muted-foreground">Точка работы</Label>
            <Select value={point} onValueChange={(p) => { setPoint(p); setErr(""); }}><SelectTrigger className="w-full" aria-label="Точка работы"><SelectValue placeholder="Выберите точку" /></SelectTrigger>
              <SelectContent>{ps.map((p) => <SelectItem key={p} value={p}><Dot color={col(p)} />{p}</SelectItem>)}</SelectContent></Select></div>
          <AnimatePresence initial={false}>{err && <motion.p key="e" role="alert" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: DUR.fast, ease: EASE.out }} className="overflow-hidden text-[12.5px] text-minus">{err}</motion.p>}</AnimatePresence>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" size="lg" disabled={busy} className="h-11 flex-1">{emp ? "Сохранить" : <><Plus />Добавить</>}</Button>
            {!emp && <Button type="button" size="lg" variant="secondary" disabled={busy} className="h-11" onClick={() => { const v = check(); if (v) onFace(v); }}><ScanFace />Добавить и снять лицо</Button>}
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
