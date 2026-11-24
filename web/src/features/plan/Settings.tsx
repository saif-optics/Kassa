// «Настроить план»: сумма месяца, доли точек, продавцы. Сохраняет settings/plan в том же формате, что рабочий сайт.
import { useState } from "react";
import { Save, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/Card";
import { RowCards, type RowColumn } from "@/components/RowCards";
import { cn } from "@/lib/utils";
import type { Data } from "@/lib/types";
import { useMutations } from "@/lib/useData";
import { useIsPhone } from "@/lib/useMedia";
import { buildPlanDoc, fmt, parseAmt, plPrevShares, type PlanCalc, type PlanCfg, type PlanEnv } from "./logic";
import { DUR } from "@/lib/motion";

const comma = (v: number | undefined) => String(v ?? 0).replace(".", ",");

// поля внутри строки не должны раскрывать карточку
const Stop = ({ children }: { children: React.ReactNode }) => (
  <span className="contents" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>{children}</span>
);

export function PlanSettings({ i = 0, d, env, cfg, month, K, open, setOpen }: { i?: number; d: Data; env: PlanEnv; cfg: PlanCfg; month: string; K: PlanCalc; open: boolean; setOpen: (f: (o: boolean) => boolean) => void }) {
  const mu = useMutations(), phone = useIsPhone();
  const [total, setTotal] = useState(K.c.total ? fmt(K.c.total) : "");
  const [sh, setSh] = useState<Record<string, string>>(() => Object.fromEntries(env.points.map((p) => [p, comma(K.shares[p])])));
  const [sel, setSel] = useState<Record<string, string>>(() => Object.fromEntries(env.points.map((p) => [p, cfg.sellers[p] || ""])));
  const [msg, setMsg] = useState<{ t: string; bad?: boolean }>({ t: "" });
  const [busy, setBusy] = useState(false);

  const fillAuto = () => { const a = plPrevShares(env, month); setSh(Object.fromEntries(env.points.map((p) => [p, comma(a[p])]))); setMsg({ t: "Доли подставлены — нажмите «Сохранить план»" }); };
  const sumShares = env.points.reduce((a, p) => a + (parseFloat(String(sh[p] ?? "").replace(",", ".")) || 0), 0);
  const save = async () => {
    const r = buildPlanDoc((d.rows.settings || {}).plan as Record<string, unknown> | undefined, cfg, month, total, sh, sel);
    if (!r.ok) { setMsg({ t: r.msg, bad: true }); return; }
    setBusy(true);
    try { await mu.putDoc("settings", "plan", r.doc); setMsg({ t: "Сохранено" }); toast.success("План сохранён"); }
    catch { setMsg({ t: "Не удалось сохранить", bad: true }); toast.error("Не удалось сохранить план"); }
    finally { setBusy(false); }
  };

  const cols: RowColumn<string>[] = [
    { key: "p", title: "Точка", main: true, cell: (p) => p },
    { key: "s", title: "Продавец", sub: phone, cell: (p) => <Stop><Input value={sel[p] ?? ""} placeholder="Имя продавца" aria-label={p + " · продавец"} className="h-8 w-44 sm:w-60" onChange={(e) => setSel((s) => ({ ...s, [p]: e.target.value }))} /></Stop> },
    { key: "h", title: "Доля, %", align: "right", width: "120px", cell: (p) => <Stop><Input value={sh[p] ?? ""} inputMode="decimal" aria-label={p + " · доля, %"} className="num ml-auto h-8 w-20 text-right" onChange={(e) => setSh((s) => ({ ...s, [p]: e.target.value }))} /></Stop> },
  ];

  return (
    <div id="plan-settings" className="scroll-mt-4">
      <Card i={i} title="Настроить план" note="сумма месяца, доли, продавцы" action={{ label: open ? "Свернуть" : "Развернуть", onClick: () => setOpen((o) => !o) }}>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: DUR.base }} className="overflow-hidden">
              <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); void save(); }}>
                <div className="grid gap-1.5 sm:max-w-sm">
                  <Label htmlFor="plTotal">План месяца, сум</Label>
                  <Input id="plTotal" value={total} inputMode="numeric" autoComplete="off" className="num" onChange={(e) => { const v = parseAmt(e.target.value); setTotal(isNaN(v) ? "" : fmt(v)); }} />
                </div>
                <RowCards columns={cols} rows={env.points} rowKey={(p) => p} dense
                  footer={<div className="flex justify-between gap-3 font-semibold"><span>Сумма долей</span><span className="num">{String(Math.round(sumShares * 10) / 10).replace(".", ",")}%</span></div>} />
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  <Button type="submit" disabled={busy} className="max-sm:w-full"><Save />Сохранить план</Button>
                  <Button type="button" variant="secondary" onClick={fillAuto} className="max-sm:w-full"><Wand2 />Доли по прошлому месяцу</Button>
                  <span role="status" className={cn("text-[13px]", msg.bad ? "text-minus" : "text-plus")}>{msg.t}</span>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
