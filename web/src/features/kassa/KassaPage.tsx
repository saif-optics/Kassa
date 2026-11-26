// Раздел «Касса»: месяцы, плитки, расчёт по шагам, форма расхода, анализ, журнал, Б/Ч по дням.
import { useEffect, useMemo, useRef, useState } from "react";
import { FileSpreadsheet, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import { PageHead } from "@/components/PageHead";
import { Segments } from "@/components/Segments";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useIsPhone } from "@/lib/useMedia";
import type { Data, Entry } from "@/lib/types";
import { useMutations } from "@/lib/useData";
import { analysis, cashState, compute, fmt, kAll, kMonths, lastM, monthName, newId, recFor, recM, reserve, todayTash } from "./logic";
import { Tiles } from "./Tiles";
import { Steps } from "./Steps";
import { AddForm, type FormVal } from "./AddForm";
import { Journal } from "./Journal";
import { Articles, DayChart, Insights, Split } from "./Analysis";

const FORM_HINT = "Нажмите на шаблон, чтобы заполнить форму, поправьте сумму и дату, затем «Добавить». Итог и недостача пересчитаются сразу.";

export function KassaPage({ d, focus }: { d: Data; focus?: "expense" | "cash" | null }) {
  const ms = useMemo(() => kMonths(d), [d]), LM = lastM(d);
  const [sel, setSel] = useState(""), M = sel && ms.includes(sel) ? sel : LM, isLast = M === LM;
  const [editing, setEditing] = useState<Entry | null>(null), [fk, setFk] = useState(0);
  const formRef = useRef<HTMLDivElement>(null);
  const phone = useIsPhone(), [sheet, setSheet] = useState(false); // на телефоне форма расхода — в листе снизу
  const mu = useMutations();
  const c = useMemo(() => compute(d, M), [d, M]);
  const rec = useMemo(() => recFor(d, M), [d, M]), st = rec ? cashState(d, rec, M) : null;
  const rsv = useMemo(() => reserve(d, isLast ? null : M), [d, M, isLast]);
  const a = useMemo(() => analysis(d, M, c), [d, M, c]);
  const hasCash = !!d.cash && typeof d.cash.amount === "number", cm = hasCash ? recM(d, { amount: d.cash!.amount, at: +d.cash!.updatedAt || 0, month: d.cash!.month }) : "";
  const lastRecNote = isLast && hasCash && cm !== M ? `в этом месяце ещё не пересчитывали · последний пересчёт ${fmt(d.cash!.amount)} — за ${monthName(cm).toLowerCase()}` : isLast ? "ещё не пересчитывали" : "в этом месяце кассу не пересчитывали";
  useEffect(() => { if (focus === "expense") { if (phone) setSheet(true); else { formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); setFk(Date.now()); } } }, [focus]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (v: FormVal) => {
    const e: Omit<Entry, "id"> = { type: v.type, name: v.name, amount: v.amount, cat: v.type === "inc" ? "" : v.cat, branch: v.branch, date: v.date || "" };
    if (v.type !== "inc") { e.fund = v.fund || ""; e.tag = v.tag || ""; }
    if (editing) { const { id, ...old } = editing; await mu.putEntry(id, { ...old, ...e }); setEditing(null); }
    else await mu.putEntry(newId(), { ...e, source: "manual", createdAt: Date.now() });
    if (phone) { setSheet(false); toast.success(editing ? "Запись обновлена" : (v.type === "inc" ? "Приход" : "Расход") + " добавлен: " + fmt(v.amount) + " сум"); }
    if (v.saveTpl && !d.templates.some((t) => t.name.toLowerCase() === v.name.toLowerCase() && (t.type || "exp") === v.type))
      await mu.putTemplate(newId(), { type: v.type, name: v.name, amount: v.amount, cat: e.cat, branch: e.branch, order: 50, ...(v.type !== "inc" ? { fund: e.fund, tag: e.tag } : {}) });
  };
  const onFact = (e: Entry, v: number | null) => { const { id, ...next } = e; if (v == null || v === +(e.amount || 0)) delete next.fact; else next.fact = v;
    if ((typeof e.fact === "number" ? e.fact : null) === (typeof next.fact === "number" ? next.fact : null)) return; mu.putEntry(id, next).catch(() => toast.error("Не удалось сохранить факт")); };
  const xlsx = async () => {
    try {
      const X = await import("xlsx");
      const sum = [["Б/Ч Премиум", c.bcP], ["Б/Ч Яшнабад", c.bcY], ["Б/Ч всего", c.bcT], ["+ Приходы", c.sInc], ["− Операционные расходы", -c.sOp], ["− Прочие расходы", -c.sOth],
        ["Должно быть на руках", c.expected], ["Фактическая наличка", st ? st.actual : null], ["Излишек / недостача", st ? st.actual - c.expected : null], ["Сэкономлено против плана", c.saved]];
      const wb = X.utils.book_new(); X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet([["Показатель", "Сумма"], ...sum]), "Итог");
      X.utils.book_append_sheet(wb, X.utils.json_to_sheet(c.days.map((x) => ({ "Дата": x.d, "Премиум": x.p, "Яшнабад": x.y, "C1": x.c, "Источник": x.src }))), "Б/Ч по дням");
      X.utils.book_append_sheet(wb, X.utils.json_to_sheet([...c.op, ...c.oth, ...c.inc, ...c.rsvExp].map((e) => ({ "Дата": e.date, "Название": e.name, "Вид": e.type === "inc" ? "приход" : e.cat === "op" ? "операционный" : "прочий", "Точка": e.branch, "Сумма": e.amount, "Факт": e.fact ?? null }))), "Записи");
      X.writeFile(wb, `Касса ${monthName(M)}.xlsx`); toast.success("Файл скачан");
    } catch (e) { toast.error("Не удалось выгрузить: " + String(e)); }
  };

  const hint = (t: string) => <p className="-mt-1 text-[12.5px] leading-snug text-muted-foreground">{t}</p>;
  return (
    <div className="flex flex-col gap-3.5">
      <PageHead eyebrow="Saif-Optics · наличные (Б/Ч) · Премиум и Яшнабад" title="Касса" sub="Б/Ч Премиума и Яшнабада + приходы − расходы дня − прочие расходы"
        actions={<Button variant="secondary" size="lg" onClick={xlsx}><FileSpreadsheet />Выгрузить Excel</Button>} />
      {ms.length > 1 && <Segments aria-label="Месяц" items={ms.map((m) => ({ key: m, label: monthName(m) }))} value={M} onChange={setSel} />}
      <Tiles c={c} M={M} isLast={isLast} rec={rec} st={st} lastRecNote={lastRecNote} rsv={rsv} i0={0}
        onCash={(v) => mu.saveCash(v, compute(d, LM).expected, LM, newId()).then(() => { toast.success("Пересчёт сохранён"); })}
        onReserve={(v, from) => mu.putEntry(newId(), { type: "inc", kind: "rsv", from, name: from === "kassa" ? "Пополнение резерва из кассы" : "Пополнение резерва со стороны", amount: v, cat: "", branch: "Общее", date: todayTash(), source: "manual", createdAt: Date.now() }).then(() => { toast.success("Резерв пополнен"); })} />
      {isLast && !phone && <div ref={formRef}><Card i={4} title={editing ? "Изменить запись" : "Добавить расход"}>
        {hint(FORM_HINT)}
        <AddForm templates={d.templates} editing={editing} reserveBal={reserve(d).bal} onSubmit={submit} onCancel={() => { setEditing(null); setSheet(false); }} focusKey={fk}
          onDelTpl={(id) => mu.delTemplate(id).catch(() => toast.error("Не удалось удалить шаблон"))} /></Card></div>}
      {isLast && phone && <>
        <Button size="lg" className="h-11 w-full" onClick={() => setSheet(true)}><Plus />Добавить расход</Button>
        <Sheet open={sheet} onOpenChange={(o) => { setSheet(o); if (!o) setEditing(null); }}>
          <SheetContent side="bottom" className="max-h-[85dvh] gap-3 overflow-y-auto rounded-t-[28px] p-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            <SheetTitle>{editing ? "Изменить запись" : "Добавить расход"}</SheetTitle>
            <SheetDescription className="text-[12.5px] leading-snug">{FORM_HINT}</SheetDescription>
            <AddForm templates={d.templates} editing={editing} reserveBal={reserve(d).bal} onSubmit={submit} onCancel={() => { setEditing(null); setSheet(false); }} focusKey={fk}
          onDelTpl={(id) => mu.delTemplate(id).catch(() => toast.error("Не удалось удалить шаблон"))} />
          </SheetContent>
        </Sheet>
      </>}
      <div className="grid gap-3.5 xl:grid-cols-2">
        <Card i={5} title="Расчёт по шагам">{hint("Нажмите шаг, чтобы увидеть записи.")}<Steps c={c} rsvBal={reserve(d, isLast ? null : M).bal} /></Card>
        <div className="flex min-w-0 flex-col gap-3.5">
          <Card i={6} title="Операционные и прочие"><Split c={c} /></Card>
          <Card i={7} title="Выводы"><Insights items={a.insights} /></Card>
        </div>
      </div>
      <div className="grid gap-3.5 xl:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card i={8} title="Б/Ч по дням">{hint("Наличные продаж Премиума и Яшнабада за каждый день месяца.")}<DayChart days={c.days} /></Card>
        <Card i={9} title="Расходы с Б/Ч по статьям"><Articles a={a} /></Card>
      </div>
      <Card i={10} title="Журнал записей">
        {hint("Факт — нажмите на сумму, если потратили не столько, сколько планировали.")}
        <Journal list={kAll(d)} M={M} editingId={editing?.id || null} onFact={onFact}
          onEdit={(e) => { setEditing(e); setSel(LM); if (phone) setSheet(true); else requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })); }}
          onDelete={(id) => { if (editing?.id === id) setEditing(null); mu.delEntry(id).then(() => toast.success("Запись удалена")).catch(() => toast.error("Не удалось удалить")); }} />
      </Card>
    </div>
  );
}
