// Журнал записей: по месяцам, фильтры, факт вместо плана прямо в строке, изменить/удалить.
import { useState } from "react";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/FilterSheet";
import { Fold } from "@/components/Fold";
import { RowCards, type RowColumn } from "@/components/RowCards";
import { Segments } from "@/components/Segments";
import { InlineNumber } from "@/components/Inline";
import { useIsPhone } from "@/lib/useMedia";
import { cn } from "@/lib/utils";
import type { Entry } from "@/lib/types";
import { dShort, fmt, fromRsv, hasFact, isBc, isRsvIn, monthName, tagOf, val } from "./logic";
import { pl } from "../pay/logic";

type F = "all" | "op" | "oth" | "inc" | "rsv";
const FILTERS: [F, string][] = [["all", "Все"], ["op", "Операционные"], ["oth", "Прочие"], ["inc", "Приходы"], ["rsv", "С резерва"]];
const byDate = (a: Entry, b: Entry) => (a.date || "").localeCompare(b.date || "") || (a.createdAt || 0) - (b.createdAt || 0);
const SRC: Record<string, string> = { excel: "Excel", photo: "записка", nal: "расходы с налички", day: "отчёт дня" };

function Pill({ e }: { e: Entry }) {
  const p = (cls: string, t: string, title?: string) => <span title={title} className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap", cls)}>{t}</span>;
  if (isBc(e)) return p("bg-plus-soft text-plus", "приход · Б/Ч дня", "Остаток Б/Ч дня: уже учтён в строке Б/Ч, второй раз не прибавляется");
  if (isRsvIn(e)) return p("bg-warn-soft text-warn", `в резерв · ${e.from === "kassa" ? "из кассы" : "со стороны"}`);
  if (e.type === "inc") return p("bg-plus-soft text-plus", "приход");
  return <span className="inline-flex flex-wrap gap-1">{p(e.cat === "op" ? "bg-primary/12 text-primary" : "bg-warn-soft text-warn", e.cat === "op" ? "операционный" : "прочий")}{fromRsv(e) && p("bg-warn-soft text-warn", "с резерва")}</span>;
}

type Props = { list: Entry[]; M: string; editingId: string | null; onEdit: (e: Entry) => void; onDelete: (id: string) => void; onFact: (e: Entry, v: number | null) => void };

export function Journal({ list, M, editingId, onEdit, onDelete, onFact }: Props) {
  const phone = useIsPhone();
  const [f, setF] = useState<F>("all"), [open, setOpen] = useState<Set<string>>(new Set([M])), [confirm, setConfirm] = useState<string | null>(null);
  let L = [...list].sort((a, b) => -byDate(a, b));
  if (f === "op") L = L.filter((e) => e.type !== "inc" && e.cat === "op"); if (f === "oth") L = L.filter((e) => e.type !== "inc" && e.cat !== "op");
  if (f === "inc") L = L.filter((e) => e.type === "inc" && !isRsvIn(e)); if (f === "rsv") L = L.filter((e) => isRsvIn(e) || fromRsv(e));
  const byM: Record<string, Entry[]> = {}; L.forEach((e) => { const m = (e.date || "").slice(0, 7) || "—"; (byM[m] ||= []).push(e); });
  const months = Object.keys(byM).sort().reverse();
  const tg = (s: Set<string>, k: string) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; };
  const cur = byM[M] || [];
  const s = cur.filter((e) => !isBc(e)).reduce((a, e) => a + (e.type === "inc" ? 1 : -1) * +(e.amount || 0), 0), sf = cur.filter((e) => !isBc(e)).reduce((a, e) => a + (e.type === "inc" ? 1 : -1) * val(e), 0);
  const sd = cur.reduce((a, e) => a + (e.type !== "inc" && hasFact(e) ? +(e.amount || 0) - (e.fact as number) : 0), 0);
  const del = (id: string) => { if (confirm === id) { onDelete(id); setConfirm(null); } else { setConfirm(id); setTimeout(() => setConfirm((c) => (c === id ? null : c)), 3000); } };

  // факт (правка на месте) и разница с планом
  const fact = (e: Entry) => { const d = hasFact(e) ? +(e.amount || 0) - (e.fact as number) : 0; return e.type !== "inc"
    ? <span className="flex items-center justify-end gap-1" onClick={(ev) => ev.stopPropagation()}><InlineNumber value={hasFact(e) ? (e.fact as number) : null} placeholder={fmt(e.amount || 0)} label={"Фактически потрачено: " + e.name} onSave={(v) => onFact(e, v)} className="max-w-28" />
      {d ? <span className={cn("num text-xs font-semibold", d > 0 ? "text-plus" : "text-minus")}>{d > 0 ? "−" : "+"}{fmt(Math.abs(d))}</span> : null}</span>
    : <span className="text-muted-foreground">—</span>; };
  const actions = (e: Entry) => (
    <span className="flex justify-end gap-0.5" onClick={(ev) => ev.stopPropagation()}><Button variant="ghost" size="icon-sm" aria-label="Изменить" onClick={() => onEdit(e)}><Pencil /></Button>
      <Button variant="ghost" size="icon-sm" aria-label="Удалить" onClick={() => del(e.id)} className={cn(confirm === e.id && "bg-minus-soft text-minus")}>{confirm === e.id ? <span className="px-1 text-[11px] font-semibold">Точно?</span> : <Trash2 />}</Button></span>);
  const cols: RowColumn<Entry>[] = [
    { key: "date", title: "Дата", sub: true, width: "64px", cell: (e) => dShort(e.date) },
    { key: "name", title: "Название", main: true, cell: (e) => <span className={cn(e.id === editingId && "text-primary")}>{e.name}</span> },
    { key: "kind", title: "Вид", sub: true, cell: (e) => <Pill e={e} /> },
    { key: "branch", title: "Точка", sub: true, cell: (e) => e.branch || "—" },
    { key: "sum", title: "Сумма", align: "right", cell: (e) => isBc(e) ? <span className="text-muted-foreground" title="уже учтено в Б/Ч">+{fmt(e.amount || 0)}</span> : (e.type === "inc" ? "+" : "−") + fmt(e.amount || 0) },
    { key: "fact", title: "Факт", align: "right", hideMobile: true, cell: fact },
    { key: "act", title: "", hideMobile: true, width: "84px", cell: actions },
  ];
  const expand = (e: Entry) => (
    <div className="flex flex-col gap-2">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[12.5px]">
        {e.type !== "inc" && <><dt className="text-muted-foreground">Тег</dt><dd className="text-right">{tagOf(e)}</dd></>}
        <dt className="text-muted-foreground">Источник</dt><dd className="text-right">{SRC[e.source || ""] || "вручную"}</dd>
        {phone && e.type !== "inc" && <><dt className="self-center text-muted-foreground">Факт</dt><dd className="flex justify-end">{fact(e)}</dd></>}
      </dl>
      {phone && <div className="flex justify-end">{actions(e)}</div>}
    </div>);
  const label = FILTERS.find((x) => x[0] === f)![1];
  return (
    <div className="flex flex-col gap-3">
      <FilterBar count={f === "all" ? 0 : 1} summary={`${label} · ${L.length} ${pl(L.length, "запись", "записи", "записей")}`}>
        <Segments aria-label="Вид записей" size="sm" value={f} onChange={(v) => setF(v as F)} items={FILTERS.map(([k, l]) => ({ key: k, label: l }))} />
      </FilterBar>
      {!L.length && <p className="text-[13px] text-muted-foreground">Записей нет.</p>}
      <div className="flex flex-col">
        {months.map((m) => { const arr = byM[m], on = open.has(m);
          const exp = arr.filter((e) => e.type !== "inc").reduce((a, e) => a + val(e), 0), inc = arr.filter((e) => e.type === "inc" && !isBc(e)).reduce((a, e) => a + val(e), 0);
          return (
            <div key={m} className="border-b border-border last:border-0">
              <button type="button" onClick={() => setOpen((x) => tg(x, m))} aria-expanded={on} className="flex w-full flex-wrap items-center gap-x-2 gap-y-0.5 py-3 text-left">
                <ChevronRight className={cn("size-4 shrink-0 transition-transform", on && "rotate-90")} /><b>{m === "—" ? "Без даты" : monthName(m)}</b>
                <span className="min-w-0 text-[13px] text-muted-foreground">· {arr.length} {pl(arr.length, "запись", "записи", "записей")} · расходы −{fmt(exp)}{inc ? ` · приходы +${fmt(inc)}` : ""}</span></button>
              {on && <div className="pb-2">
                <Fold id={`kassa.journal.${m}`} rows={arr}>{(shown) => <RowCards columns={cols} rows={shown} rowKey={(e) => e.id} expand={expand} dense />}</Fold>
              </div>}
            </div>); })}
      </div>
      {cur.length > 0 && <div className="flex flex-wrap justify-end gap-x-6 gap-y-1 text-[13.5px]"><span>Итого за {monthName(M).toLowerCase()}:</span><span>по плану <b className="num">{fmt(s)}</b></span><span>по факту <b className="num">{fmt(sf)}</b></span>{sd ? <span className={cn("font-semibold", sd > 0 ? "text-plus" : "text-minus")}>{sd > 0 ? "сэкономили" : "перерасход"} {fmt(Math.abs(sd))}</span> : null}</div>}
    </div>
  );
}
