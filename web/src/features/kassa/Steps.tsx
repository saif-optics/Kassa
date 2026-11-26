// Расчёт по шагам: Б/Ч → приходы → операционные → прочие → в резерв → расходы из резерва → должно быть.
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DUR, EASE } from "@/lib/motion";
import type { Entry } from "@/lib/types";
import { dShort, fmt, val, type Kassa } from "./logic";
import { pl } from "../pay/logic";

const byDate = (a: Entry, b: Entry) => (a.date || "").localeCompare(b.date || "") || (a.createdAt || 0) - (b.createdAt || 0);
const Items = ({ arr }: { arr: Entry[] }) => (
  <ul className="mt-1 mb-2 flex flex-col">{[...arr].sort(byDate).map((e) => (
    <li key={e.id} className="flex justify-between gap-3 border-b border-border py-1.5 text-[13px] last:border-0"><span className="min-w-0 truncate">{dShort(e.date)} · {e.name}</span>
      <span className="num whitespace-nowrap">{typeof e.fact === "number" && e.fact !== +(e.amount || 0) ? <><s className="text-muted-foreground">{fmt(e.amount || 0)}</s> {fmt(e.fact)}</> : fmt(val(e))}</span></li>))}</ul>
);

/** title — заголовок «Расчёт по шагам» внутри блока (большой блок Кассы); без него заголовок рисует внешняя Card.
 *  Список шагов прокручивается внутри блока, итог прижат к низу, высота блока не меняется. */
export function Steps({ c, rsvBal, title }: { c: Kassa; rsvBal: number; title?: boolean }) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const tog = (k: string) => setOpen((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const last = c.days.length ? c.days[c.days.length - 1].d : "", nX = c.days.filter((d) => d.src === "Excel").length, nS = c.days.length - nX;
  type S = { k: string; sign: string; tone: string; title: string; sub: string; amt: string; n: number; body: React.ReactNode };
  const steps: S[] = [];
  steps.push({ k: "bc", sign: "=", tone: "bg-primary/15 text-primary", title: `Б/Ч ${c.bcC ? "Премиума, Яшнабада и C1" : "Премиума и Яшнабада"}${c.days.length ? " с " + dShort(c.days[0].d) : ""}${last ? " по " + dShort(last) : ""}`,
    sub: `Премиум ${fmt(c.bcP)} + Яшнабад ${fmt(c.bcY)}${c.bcC ? ` + C1 ${fmt(c.bcC)}` : ""}${nS ? ` · из продаж: ${nS} дн.` : ""}${nX ? ` · из отчёта: ${nX} дн.` : ""}`, amt: fmt(c.bcT), n: c.days.length,
    body: <ul className="mt-1 mb-2 flex flex-col">{c.days.map((d) => <li key={d.d} className="flex justify-between gap-3 border-b border-border py-1.5 text-[13px] last:border-0"><span className="min-w-0 truncate">{dShort(d.d)} · Премиум {fmt(d.p)} · Яшнабад {fmt(d.y)}{d.c ? ` · C1 ${fmt(d.c)}` : ""} <span className="text-muted-foreground">({d.src === "Excel" ? "отчёт" : "продажи"})</span></span><span className="num">{fmt(d.p + d.y + (d.c || 0))}</span></li>)}</ul> });
  steps.push({ k: "inc", sign: "+", tone: "bg-plus-soft text-plus", title: "Приходы", sub: c.inc.length ? "добавлено к Б/Ч" : "пока нет", amt: "+" + fmt(c.sInc), n: c.inc.length, body: <Items arr={c.inc} /> });
  steps.push({ k: "op", sign: "−", tone: "bg-primary/12 text-primary", title: "Операционные расходы", sub: "расходы дня", amt: "−" + fmt(c.sOp), n: c.op.length, body: <Items arr={c.op} /> });
  steps.push({ k: "oth", sign: "−", tone: "bg-warn-soft text-warn", title: "Прочие расходы", sub: "поставщики, бухгалтер, мастера", amt: "−" + fmt(c.sOth), n: c.oth.length, body: <Items arr={c.oth} /> });
  if (c.rsvMove.length) steps.push({ k: "rsv", sign: "−", tone: "bg-warn-soft text-warn", title: "Переведено в резерв", sub: "из кассы в резерв", amt: "−" + fmt(c.sRsvMove), n: c.rsvMove.length, body: <Items arr={c.rsvMove} /> });
  steps.push({ k: "rsvx", sign: "·", tone: "bg-muted text-muted-foreground", title: "Расходы из резерва", sub: (c.rsvExp.length ? "оплачены резервом, касса не меняется" : "в этом месяце не было") + " · в резерве " + fmt(rsvBal), amt: "−" + fmt(c.sRsvExp), n: c.rsvExp.length, body: <Items arr={c.rsvExp} /> });
  const GR = "grid-cols-[28px_minmax(0,1fr)_auto] gap-2.5 @min-[640px]/main:grid-cols-[34px_minmax(0,1fr)_auto] @min-[640px]/main:gap-3";
  const CIRC = "grid size-[26px] place-items-center rounded-full text-[13px] font-bold @min-[640px]/main:size-[30px] @min-[640px]/main:text-[15px]";
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {title && <div className="mb-1 flex items-baseline justify-between gap-3"><span className="text-lg font-bold">Расчёт по шагам</span><span className="truncate text-sm text-muted-foreground">нажмите шаг, чтобы увидеть записи</span></div>}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {steps.map((s, j) => { const on = open.has(s.k) && s.n > 0; return (
          <div key={s.k} className={cn("border-border", j > 0 && "border-t")}>
            <button type="button" disabled={!s.n} onClick={() => tog(s.k)} aria-expanded={on} className={cn("grid min-h-[44px] w-full items-center py-1 text-left disabled:cursor-default @min-[640px]/main:min-h-[44px]", GR)}>
              <span className={cn(CIRC, s.tone)}>{s.sign}</span>
              <span className="min-w-0 leading-tight"><b className="flex items-center gap-1 text-sm font-semibold @min-[640px]/main:text-[15px]"><span className="truncate">{s.title}</span>{s.n > 0 && <ChevronRight className={cn("size-4 shrink-0 transition-transform", on && "rotate-90")} />}</b>
                <span className="block truncate text-xs text-muted-foreground @min-[640px]/main:text-[12.5px]">{s.sub}{s.n > 0 && ` · ${s.n} ${pl(s.n, "запись", "записи", "записей")}`}</span></span>
              <b className="num text-[15px] @min-[640px]/main:text-[17px]">{s.amt}</b>
            </button>
            <AnimatePresence initial={false}>{on && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: DUR.base, ease: EASE.out }} className="overflow-hidden pl-[38px] @min-[640px]/main:pl-[46px]">{s.body}</motion.div>}</AnimatePresence>
          </div>); })}
      </div>
      <div className={cn("grid shrink-0 items-center border-t border-foreground/20 pt-2", GR)}>
        <span className={cn(CIRC, "bg-primary text-white")}>=</span>
        <b className="truncate text-[15px] font-extrabold @min-[640px]/main:text-[17px]">Должно быть наличными</b>
        <b className="num text-[17px] @min-[640px]/main:text-[22px]">{fmt(c.expected)}</b></div>
    </div>
  );
}
