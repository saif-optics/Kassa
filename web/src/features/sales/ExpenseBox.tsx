// «Расход дня»: форма (запись в Кассу с источником «day»), расходы за период по точкам, последние и полный список.
import { useState } from "react";
import { ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/Card";
import { RowCards, type RowColumn } from "@/components/RowCards";
import { useIsPhone } from "@/lib/useMedia";
import { cn } from "@/lib/utils";
import { Field, Note, Pager, Sel, digits, fmtIn, usePager } from "./parts";
import { KASSA_POINTS, dShort, expTitle, expVal, fmt, pointColor, todayTash, type DayExp, type Settings } from "./logic";

const LIST = ["Такси", "Доставка", "Доставка линз", "Мастер", "Линзы", "Вода", "Моющие средства", "Хоз. нужды"];

/** full — обычная форма и удаление; simple — продавец (название, сумма, дата; своя точка); view — только список */
export type ExpMode = "full" | "simple" | "view";

export function ExpenseBox({ exp, settings, onAdd, onDelete, mode = "full", onAddSimple, canDelete = () => true, dates, i = 0 }: { i?: number; exp: DayExp[]; settings: Settings; onAdd: (v: { date: string; point: string; name: string; amount: number }) => Promise<void>; onDelete: (id: string) => Promise<void>;
  mode?: ExpMode; onAddSimple?: (v: { date: string; name: string; amount: number }) => Promise<void>; canDelete?: (e: DayExp) => boolean; dates?: { min: string; max: string } }) {
  const phone = useIsPhone();
  const [date, setDate] = useState(todayTash()), [point, setPoint] = useState(settings.points[0]), [name, setName] = useState(""), [amount, setAmount] = useState("");
  const [msg, setMsg] = useState<{ t: string; bad?: boolean } | null>(null), [busy, setBusy] = useState(false), [openList, setOpenList] = useState(false), [confirm, setConfirm] = useState<string | null>(null);
  const all = [...exp].sort((x, y) => (y.date || "").localeCompare(x.date || "") || (y.createdAt || 0) - (x.createdAt || 0));
  const sum = all.reduce((x, e) => x + expVal(e), 0), pg = usePager(all.length);
  const bp: Record<string, number> = {}; all.forEach((e) => (bp[e.branch as string] = (bp[e.branch as string] || 0) + expVal(e)));
  const mx = Math.max(1, ...Object.values(bp));
  const say = (t: string, bad?: boolean) => { setMsg({ t, bad }); setTimeout(() => setMsg(null), 5000); };
  const pt = settings.points.includes(point) ? point : settings.points[0];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim(), a = digits(amount);
    if (!n) return say("Впишите статью расхода.", true);
    if (!a) return say("Укажите сумму.", true);
    setBusy(true);
    try { if (mode === "simple" && onAddSimple) await onAddSimple({ date: date || todayTash(), name: n, amount: a }); else await onAdd({ date: date || todayTash(), point: pt, name: n, amount: a }); setName(""); setAmount(""); say(`Расход добавлен${KASSA_POINTS.includes(pt) ? " и учтён в кассе" : ""}`); }
    catch (er) { say(er instanceof Error && er.message ? er.message : "Не удалось сохранить расход.", true); } finally { setBusy(false); }
  };
  const del = (id: string) => {
    if (confirm !== id) { setConfirm(id); setTimeout(() => setConfirm((c) => (c === id ? null : c)), 3000); return; }
    setConfirm(null); onDelete(id).catch(() => say("Не удалось удалить.", true));
  };

  const canDel = mode === "full";
  const delBtn = (e: DayExp, wide?: boolean) => !canDel || !canDelete(e) ? null : (
    <Button type="button" variant={wide ? "secondary" : "ghost"} size={wide ? "default" : "icon-sm"} aria-label={"Удалить расход " + expTitle(e)} onClick={() => del(e.id)} className={cn(wide && "w-full", confirm === e.id && "bg-minus-soft text-minus")}>
      {confirm === e.id ? <span className="px-1 text-[12px] font-semibold">Точно?</span> : wide ? <><Trash2 />Удалить</> : <Trash2 />}</Button>);
  // телефон: название и сумма в карточке, дата · точка под ними, удаление — в раскрытой части
  const cols: RowColumn<DayExp>[] = [
    { key: "date", title: "Дата", sub: true, cell: (e) => dShort(e.date) },
    { key: "branch", title: "Точка", sub: true, cell: (e) => e.branch as string },
    { key: "name", title: "Статья", main: true, cell: (e) => <span className="block max-w-48 truncate max-sm:max-w-none" title={expTitle(e)}>{expTitle(e)}</span> },
    { key: "sum", title: "Сумма", align: "right", cell: (e) => fmt(expVal(e)) },
    ...(canDel ? [{ key: "del", title: "", hideMobile: true, width: "3rem", cell: (e) => <span className="flex justify-end">{delBtn(e)}</span> } as RowColumn<DayExp>] : []),
  ];
  return (
    <Card title="Расход дня" i={i}>
      {mode !== "view" && <><Note>Такси, доставка, мастер, вода и т.п. Расходы Премиума и Яшнабада сразу попадают в кассу.</Note>
      <form onSubmit={submit} autoComplete="off" className="grid gap-3 sm:grid-cols-2">
        <Field label="Дата"><Input type="date" value={date} min={dates?.min} max={dates?.max} onChange={(e) => setDate(e.target.value)} aria-label="Дата расхода" className="num" /></Field>
        {mode === "full" && settings.points.length > 1 && <Field label="Точка"><Sel label="Точка расхода" value={pt} onChange={setPoint} options={settings.points} /></Field>}
        <Field label="Статья" className="sm:col-span-2"><Input list="sales-dx" value={name} onChange={(e) => setName(e.target.value)} placeholder="Такси" aria-label="Статья расхода" /></Field>
        <datalist id="sales-dx">{LIST.map((n) => <option key={n} value={n} />)}</datalist>
        <Field label="Сумма, сум" className="sm:col-span-2"><Input inputMode="numeric" value={amount} onChange={(e) => setAmount(fmtIn(e.target.value, fmt))} placeholder="50 000" aria-label="Сумма расхода" className="num" /></Field>
        <div className="flex flex-wrap items-center gap-2 sm:col-span-2"><Button type="submit" disabled={busy} className="max-sm:h-11 max-sm:w-full">Добавить расход</Button><span role="status" className={cn("text-[13px]", msg?.bad ? "text-minus" : "text-plus")}>{msg?.t}</span></div>
      </form></>}
      {all.length > 0 && !openList && <div className="grid gap-3">
        <h3 className="text-[13px] font-semibold text-muted-foreground">Расходы за период по точкам</h3>
        <div className="grid gap-2">{Object.entries(bp).sort((a, b) => b[1] - a[1]).map(([k, x]) => (
          <div key={k} className="grid gap-1"><div className="flex items-center justify-between gap-2 text-[13.5px]"><span className="flex min-w-0 items-center gap-2"><i className="size-2.5 shrink-0 rounded-full" style={{ background: pointColor(k, settings.points) }} /><span className="truncate">{k}</span></span><b className="num">{fmt(x)}</b></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted"><i className="block h-full rounded-full" style={{ width: x / mx * 100 + "%", background: pointColor(k, settings.points) }} /></div></div>))}</div>
        <h3 className="mt-1 text-[13px] font-semibold text-muted-foreground">Последние расходы</h3>
        <div className="grid gap-1">{all.slice(0, 4).map((e) => <div key={e.id} className="flex items-baseline justify-between gap-3 text-[13.5px]"><span className="min-w-0 truncate">{dShort(e.date)} · {expTitle(e)} <span className="text-xs text-muted-foreground">{e.branch}</span></span><span className="num shrink-0">−{fmt(expVal(e))}</span></div>)}</div>
      </div>}
      <Button type="button" variant="secondary" className="h-auto min-h-8 w-full max-sm:min-h-11 whitespace-normal py-1.5" disabled={!all.length} onClick={() => setOpenList((o) => !o)}>
        {all.length ? <><ChevronRight className={cn("transition-transform", openList && "rotate-90")} />{openList ? "Свернуть список расходов" : `Показать расходы за период (${all.length}) · −${fmt(sum)} сум`}</> : "Расходов дня за период нет"}</Button>
      {openList && all.length > 0 && <div>
        <RowCards rows={pg.slice(all)} rowKey={(e) => e.id} columns={cols} expand={phone && canDel ? (e) => delBtn(e, true) : undefined} />        <Pager pg={pg} /></div>}
    </Card>
  );
}
