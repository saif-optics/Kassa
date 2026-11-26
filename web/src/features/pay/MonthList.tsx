// Платежи месяца по неделям (плотная строка 52 px): сумма и «по выписке» правятся на месте, статус — одним нажатием.
// range — дни месяца, которые показывает эта часть списка (на 16 колонках месяц делится на две карточки).
import { AnimatePresence, motion } from "motion/react";
import { Check, RotateCcw, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineNumber } from "@/components/Inline";
import { cn } from "@/lib/utils";
import { useIsPhone } from "@/lib/useMedia";
import type { Data } from "@/lib/types";
import { CATS, MN, MNg, SRC, addM, baseAmount, dLong, dim, fmt, words, wd, type MonthRow } from "./logic";
import { Chip } from "@/components/Tile";
import { CatIcon, StatusChip } from "./parts";
import { DUR, EASE } from "@/lib/motion";

type Props = { d: Data; M: string; T: string; rows: MonthRow[]; open: string | null; setOpen: (id: string | null) => void;
  onPlan: (id: string, v: number | null) => void; onPaid: (r: MonthRow, v: number | null) => void; onToggle: (r: MonthRow) => void; onReset: (id: string) => void; onEdit: (id: string) => void;
  filtered?: boolean; range?: [number, number]; total?: boolean };

// строка платежа: квадрат даты | название | сумма | по выписке | статус
const DENSE = "grid h-[52px] grid-cols-[44px_minmax(0,1fr)_120px_120px_116px] items-center gap-3 border-t border-foreground/8 px-1.5 text-[13.5px]";
// телефон: карточка, как раньше
const PHONE = "grid grid-cols-[46px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-x-2.5 gap-y-1.5 p-2";

export function MonthList({ d, M, T, rows, open, setOpen, onPlan, onPaid, onToggle, onReset, onEdit, filtered, range = [1, 31], total = true }: Props) {
  const phone = useIsPhone();
  const weeks = ([[1, 7], [8, 14], [15, 21], [22, 28], [29, 31]] as [number, number][]).filter(([a, b]) => a >= range[0] && b <= range[1]);
  const tot = rows.reduce((s, r) => s + r.am.a, 0), paid = rows.reduce((s, r) => s + Math.min(r.paid, r.am.a || r.paid), 0), left = rows.reduce((s, r) => s + r.left, 0);
  const inRange = rows.filter((r) => { const x = +r.due.slice(8); return x >= range[0] && x <= range[1]; });

  // раскрытие строки: где нашлась оплата, кнопки
  const panel = (r: MonthRow) => {
    const it = r.it;
    return (
      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: DUR.base, ease: EASE.out }} className="overflow-hidden">
        <div className={cn("mb-2 grid gap-4 border-t border-border/70 px-1 pt-3 lg:grid-cols-[1fr_auto]", phone ? "mx-2" : "mr-1.5 ml-14")}>
          <div className="min-w-0">
            <h4 className="mb-1.5 text-[13px] font-semibold">Где нашлась оплата</h4>
            {r.hits.map((h, i) => <div key={i} className="flex justify-between gap-3 border-b border-border py-1.5 text-[13px] last:border-0"><span className="min-w-0 truncate">{dLong(h.d)} · <span className="text-muted-foreground">{h.f}</span> {h.n}</span><b className="num shrink-0 whitespace-nowrap">{fmt(h.a)}</b></div>)}
            {!r.hits.length && <p className="text-[13px] text-muted-foreground">{words(it).length ? `В выписке и Кассе за ${MN[+M.slice(5, 7) - 1].toLowerCase()} строк со словами «${words(it).filter((x) => x[0] !== "-").join("», «")}» нет.` : "Слова для поиска не заданы — отмечайте оплату вручную."}</p>}
            {r.man > 0 && <div className="flex justify-between gap-3 py-1.5 text-[13px]"><span>{r.mk?.date ? dLong(r.mk.date) : ""} · <span className="text-muted-foreground">вручную</span></span><b className="num">{fmt(r.man)}</b></div>}
            {it.auto === "tax" && !r.am.own && <p className="mt-1 text-[13px] text-muted-foreground">{it.pct || 0}% с безнала за {MN[+addM(M, -1).slice(5, 7) - 1].toLowerCase()}: {fmt(r.am.base || 0)} сум.</p>}
            {it.note && <p className="mt-1 text-[13px] text-muted-foreground">{it.note}</p>}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            {(r.st !== "ok" || (r.man > 0 && !r.auto)) && <Button className="max-sm:w-full" onClick={() => onToggle(r)}><Check />{r.st === "ok" ? "Снять отметку" : "Оплачен"}</Button>}
            {r.am.own && <Button variant="outline" className="max-sm:w-full" onClick={() => onReset(it.id)}><RotateCcw />Вернуть сумму {fmt(baseAmount(d, it, M).a)}</Button>}
            <Button variant="outline" className="max-sm:w-full" onClick={() => onEdit(it.id)}><Settings2 />Все настройки</Button>
          </div>
        </div>
      </motion.div>
    );
  };

  // подпись под названием: статья · источник · пометки
  const sub = (r: MonthRow) => {
    const it = r.it;
    return [CATS[it.cat] || CATS.other, SRC[it.src], it.point && it.point !== "Общее" ? it.point : "", r.am.own ? "своя сумма" : r.am.est ? "расчётно" : r.am.usd ? fmt(r.am.usd) + " $" : "",
      it.kind === "plan" ? "разовый" : it.kind === "debt" ? "погашение долга" : ""].filter(Boolean).join(" · ");
  };

  const rowDense = (r: MonthRow) => {
    const it = r.it, sel = open === it.id;
    return (
      <div key={it.id} className={cn("rounded-xl transition-colors", sel && "bg-foreground/5", r.st === "ok" && "opacity-90")}>
        <div className={DENSE}>
          <button type="button" onClick={() => setOpen(sel ? null : it.id)} aria-expanded={sel} aria-label={`${it.name}: подробности`}
            className={cn("flex size-10 flex-col items-center justify-center rounded-xl border border-transparent bg-foreground/6 leading-none outline-none focus-visible:ring-3 focus-visible:ring-primary/30",
              r.due === T && "ring-2 ring-primary", r.st === "late" && "border-minus/50")}>
            <b className="num text-[15px]">{+r.due.slice(8)}</b><small className="mt-0.5 text-[10px] text-muted-foreground">{wd(r.due)}</small>
          </button>
          <button type="button" onClick={() => setOpen(sel ? null : it.id)} aria-expanded={sel} className="flex min-w-0 flex-col text-left leading-snug outline-none">
            <b className="truncate font-semibold">{it.name}</b>
            <small className="truncate text-xs text-muted-foreground">{sub(r)}</small>
          </button>
          <InlineNumber value={r.am.a} label="Сумма за месяц" onSave={(v) => onPlan(it.id, v)} className="text-[13.5px]" />
          <InlineNumber value={r.paid || null} placeholder="—" label="По выписке" onSave={(v) => onPaid(r, v)} className={cn("text-[13.5px]", r.paid > 0 && "text-plus")} />
          <span className="min-w-0"><StatusChip r={r} T={T} dense onClick={() => onToggle(r)} /></span>
        </div>
        <AnimatePresence initial={false}>{sel && panel(r)}</AnimatePresence>
      </div>
    );
  };

  const rowPhone = (r: MonthRow) => {
    const it = r.it, sel = open === it.id;
    return (
      <div key={it.id} className={cn("glass-inner mb-2 rounded-2xl transition-colors", sel && "ring-1 ring-primary/40")}>
        <div className={cn(PHONE, r.st === "ok" && "opacity-90")}>
          <button type="button" onClick={() => setOpen(sel ? null : it.id)} aria-expanded={sel}
            className={cn("row-span-3 flex size-[46px] flex-col items-center justify-center self-start rounded-2xl border border-border bg-background/50 leading-tight outline-none focus-visible:ring-3 focus-visible:ring-primary/30",
              r.due === T && "ring-2 ring-primary", r.st === "late" && "border-minus/50")}>
            <b className="num text-[17px]">{+r.due.slice(8)}</b><small className="text-[10.5px] text-muted-foreground">{wd(r.due)}</small>
          </button>
          <button type="button" onClick={() => setOpen(sel ? null : it.id)} aria-expanded={sel} className="col-span-2 flex min-w-0 items-center gap-2.5 text-left outline-none">
            <CatIcon cat={it.cat} size="sm" />
            <span className="flex min-w-0 flex-col leading-snug"><b className="line-clamp-2 font-semibold">{it.name}</b>
              <small className="line-clamp-2 text-xs text-muted-foreground">{dLong(r.due)} · {sub(r)}</small></span>
          </button>
          <span className="col-start-2 row-start-2 flex flex-col items-start gap-0.5">
            <InlineNumber value={r.am.a} label="Сумма за месяц" onSave={(v) => onPlan(it.id, v)} className="-ml-2 text-left" />
          </span>
          <span className="col-start-3 row-start-2 flex flex-col items-end gap-0.5">
            <InlineNumber value={r.paid || null} placeholder="—" label="По выписке" onSave={(v) => onPaid(r, v)} className={cn(r.st === "ok" && "text-plus")} />
            {r.auto > 0 && <small className="text-[11px] text-muted-foreground">по выписке {fmt(r.auto)}</small>}
          </span>
          <span className="col-span-2 col-start-2 row-start-3"><StatusChip r={r} T={T} onClick={() => onToggle(r)} /></span>
        </div>
        <AnimatePresence initial={false}>{sel && panel(r)}</AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {!phone && <div className={cn(DENSE, "h-7 border-t-0 text-[11px] font-semibold tracking-[.05em] text-muted-foreground uppercase")}>
        <span /><span>Платёж</span><span className="text-right">Сумма</span><span className="text-right">По выписке</span><span>Статус</span>
      </div>}
      {!inRange.length && <p className="px-1.5 py-4 text-[13px] text-muted-foreground">В эти дни платежей нет.</p>}
      {weeks.map(([a, b]) => {
        const L = rows.filter((r) => { const x = +r.due.slice(8); return x >= a && x <= b; }); if (!L.length) return null;
        return (
          <div key={a}>
            <div className="flex items-baseline justify-between gap-3 px-1.5 pt-2.5 pb-1 text-xs font-semibold tracking-[.04em] text-muted-foreground uppercase"><span>{a}–{Math.min(b, dim(M))} {MNg[+M.slice(5, 7) - 1]}</span><span className="num">{fmt(L.reduce((s, r) => s + r.am.a, 0))}{phone ? " сум" : ""}</span></div>
            {L.map((r) => (phone ? rowPhone(r) : rowDense(r)))}
          </div>
        );
      })}
      {total && (phone
        ? <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2.5 border-t border-border px-2 pt-3 font-semibold">
          <span>{filtered ? "Итого по списку" : "Итого за месяц"}</span><span className="num text-right">{fmt(tot)}</span><span className="num pr-2 text-right">{fmt(paid)}</span>
        </div>
        : <div className="grid h-11 grid-cols-[44px_minmax(0,1fr)_120px_120px_116px] items-center gap-3 border-t border-foreground/15 px-1.5 text-[13.5px] font-bold">
          <span /><span>{filtered ? "Итого по списку" : "Итого за месяц"}</span><span className="num text-right">{fmt(tot)}</span><span className="num text-right text-plus">{fmt(paid)}</span>
          <span className="text-xs font-normal text-muted-foreground">{left ? `осталось ${fmt(left)}` : <Chip tone="plus">Всё оплачено</Chip>}</span>
        </div>)}
    </div>
  );
}
