// Боковые карточки: ближайшие 7 дней, долги, суммы по статьям. compact — вариант 128 px для ряда плиток на 16 колонках.
import { motion } from "motion/react";
import { Card } from "@/components/Card";
import { Row, RowCell, RowName, Rows } from "@/components/Rows";
import { cn } from "@/lib/utils";
import type { PayItem } from "@/lib/types";
import { CATS, dDiff, dLong, fmt, type MonthRow } from "./logic";
import { fmtM } from "../plan/logic";
import { DUR, EASE } from "@/lib/motion";

const dotCls = (r: MonthRow) => (r.st === "late" ? "bg-minus" : r.st === "today" || r.st === "part" ? "bg-warn" : "bg-muted-foreground");
const short = (iso: string) => dLong(iso).replace(/(\d+ \S{3})\S*/, "$1");

export function Soon({ rows, T, onOpen, i, compact }: { rows: MonthRow[]; T: string; onOpen: (id: string) => void; i: number; compact?: boolean }) {
  const L = rows.filter((r) => r.st !== "ok" && (r.due < T || dDiff(T, r.due) <= 7));
  const need = L.reduce((s, r) => s + r.left, 0), note = L.length ? `нужно ${fmtM(need)}` : undefined;
  if (compact) {
    return (
      <Card i={i} title="Ближайшие 7 дней" note={note} className="h-32 gap-1 overflow-hidden py-3.5">
        {L.length ? <Rows cols="1fr 120px">{L.slice(0, 2).map((r) => (
          <Row key={r.it.id} className="h-[30px]">
            <button type="button" onClick={() => onOpen(r.it.id)} className="flex min-w-0 items-center gap-2 text-left outline-none hover:underline">
              <i className={cn("size-2 shrink-0 rounded-full", dotCls(r))} />
              <span className="truncate">{r.it.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{short(r.due)}{r.st === "late" ? " · просрочено" : ""}</span>
            </button>
            <RowCell right>{fmt(r.left)}</RowCell>
          </Row>))}</Rows>
          : <p className="text-[13px] text-muted-foreground">На неделю вперёд всё оплачено.</p>}
      </Card>
    );
  }
  return (
    <Card i={i} title="Ближайшие 7 дней" note={note}>
      {L.length ? <Rows cols="1fr 120px">{L.map((r) => (
        <Row key={r.it.id}>
          <button type="button" onClick={() => onOpen(r.it.id)} className="min-w-0 text-left outline-none hover:underline">
            <RowName dot={r.st === "late" ? "var(--minus)" : r.st === "today" || r.st === "part" ? "var(--warn)" : "var(--muted-foreground)"} title={r.it.name} sub={dLong(r.due) + (r.st === "late" ? " · просрочено" : "")} />
          </button>
          <RowCell right>{fmt(r.left)}</RowCell>
        </Row>))}</Rows>
        : <p className="text-[13px] text-muted-foreground">На неделю вперёд всё оплачено.</p>}
    </Card>
  );
}

export type DebtRow = { it: PayItem; total: number; paid: number; left: number | null; pct: number | null };
const Bar = ({ p }: { p: number }) => (
  <span className="block h-1.5 overflow-hidden rounded-full bg-muted"><motion.i initial={{ width: 0 }} animate={{ width: `${p * 100}%` }} transition={{ duration: DUR.slow, ease: EASE.out }} className="block h-full rounded-full bg-primary" /></span>
);

export function Debts({ debts, onEdit, onAdd, i, compact }: { debts: DebtRow[]; onEdit: (id: string) => void; onAdd: () => void; i: number; compact?: boolean }) {
  const act = { label: "+ Долг", onClick: onAdd };
  if (compact) {
    return (
      <Card i={i} title="Долги" action={act} className="h-32 gap-1.5 overflow-hidden py-3.5">
        {debts.slice(0, 2).map((d) => (
          <button key={d.it.id} type="button" onClick={() => onEdit(d.it.id)} className="flex flex-col gap-1 text-left outline-none hover:brightness-110">
            <span className="flex justify-between gap-2 text-[13px]"><span className="truncate">{d.it.name}</span>
              <span className="num shrink-0 font-semibold">{d.left == null ? "без суммы" : fmt(d.left)}{d.total > 0 && <small className="font-normal text-muted-foreground"> · {Math.round((d.pct || 0) * 100)}%</small>}</span></span>
            <Bar p={d.total > 0 ? d.pct || 0 : 0} />
          </button>
        ))}
        {!debts.length && <p className="text-[13px] text-muted-foreground">Долгов нет.</p>}
      </Card>
    );
  }
  return (
    <Card i={i} title="Долги" action={act}>
      <div className="flex flex-col gap-2.5">
        {debts.map((d) => (
          <button key={d.it.id} type="button" onClick={() => onEdit(d.it.id)} className="flex flex-col gap-1.5 text-left outline-none hover:brightness-110">
            <span className="flex justify-between gap-2 text-[13.5px]"><span className="truncate">{d.it.name}</span><span className="num font-semibold whitespace-nowrap">{d.left == null ? "сумма не указана" : fmt(d.left)}</span></span>
            {d.total > 0 && <Bar p={d.pct || 0} />}
            <small className="text-xs text-muted-foreground">погашено {fmt(d.paid)}{d.total ? ` из ${fmt(d.total)} · ${Math.round((d.pct || 0) * 100)}%` : ""}</small>
          </button>
        ))}
        {!debts.length && <p className="text-[13px] text-muted-foreground">Долгов нет.</p>}
      </div>
    </Card>
  );
}

/** по статьям; onSettings — внизу блок-ссылка «Настройка платежей» (на 16 колонках) */
export function ByCat({ rows, i, onSettings, settingsNote }: { rows: MonthRow[]; i: number; onSettings?: () => void; settingsNote?: string }) {
  const by: Record<string, number> = {}; rows.forEach((r) => (by[r.it.cat || "other"] = (by[r.it.cat || "other"] || 0) + r.am.a));
  const E = Object.entries(by).sort((a, b) => b[1] - a[1]), mx = Math.max(1, ...E.map((e) => e[1]));
  if (!E.length) return null;
  return (
    <Card i={i} title="По статьям">
      <Rows cols="84px 1fr 120px">{E.map(([k, v]) => (
        <Row key={k} className="h-[34px] max-sm:grid-cols-[84px_minmax(0,1fr)_auto]">
          <span className="truncate text-foreground/80">{CATS[k] || CATS.other}</span>
          <span className="block h-1.5 overflow-hidden rounded-full bg-muted"><motion.i initial={{ width: 0 }} animate={{ width: `${(v / mx) * 100}%` }} transition={{ duration: DUR.slow, ease: EASE.out }} className="block h-full rounded-full bg-primary" /></span>
          <RowCell right>{fmt(v)}</RowCell>
        </Row>))}</Rows>
      {onSettings && <button type="button" onClick={onSettings} className="mt-1 border-t border-foreground/15 pt-2.5 text-left outline-none hover:brightness-110">
        <span className="block text-base font-semibold">Настройка платежей</span>
        {settingsNote && <span className="mt-1 block text-xs text-muted-foreground">{settingsNote}</span>}
      </button>}
    </Card>
  );
}
