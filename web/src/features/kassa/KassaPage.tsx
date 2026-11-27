// Раздел «Касса»: бенто-мозаика — большой блок (на руках, факт, пересчёт, шаги), статьи, журнал, график, форма, резерв, доли.
import { useEffect, useMemo, useRef, useState } from "react";
import { FileSpreadsheet, Plus, Receipt } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import { PageHead } from "@/components/PageHead";
import { Segments } from "@/components/Segments";
import { Item } from "@/components/Grid";
import { Tile, TileLabel, TileSub, TileValue } from "@/components/Tile";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import type { Data, Entry } from "@/lib/types";
import { useMutations } from "@/lib/useData";
import { fmtM } from "../plan/logic";
import { pl } from "../pay/logic";
import { analysis, cashState, compute, fmt, kAll, kMonths, lastM, monthName, newId, recFor, recM, reserve, todayTash } from "./logic";
import { CashHero, ReserveTile } from "./Tiles";
import { Steps } from "./Steps";
import { AddForm, type FormVal } from "./AddForm";
import { Journal } from "./Journal";
import { JournalMini, monthList } from "./JournalMini";
import { Articles, ArticlesMore, DayChart, Insights, Split } from "./Analysis";

const FORM_HINT = "Нажмите на шаблон, чтобы заполнить форму, поправьте сумму и дату, затем «Добавить». Итог и недостача пересчитаются сразу.";

// Мозаика: 2 колонки на телефоне, 6 от 640, 12 от 1024; ряд 118+ / 120 / 126 от 1600, зазор 16. До 1600 большой блок на ряд выше (5), чтобы шаги влезли. Порядок блоков: телефон / планшет / ПК.
const GRID = "grid grid-flow-dense grid-cols-2 auto-rows-[minmax(118px,auto)] gap-2.5 @min-[640px]/main:grid-cols-6 @min-[640px]/main:auto-rows-[120px] @min-[640px]/main:gap-4 @min-[1024px]/main:grid-cols-12 @min-[1600px]/main:auto-rows-[126px]";
const C = {
  hero: "order-1 col-span-2 row-span-2 @min-[640px]/main:col-span-6 @min-[640px]/main:row-span-5 @min-[1024px]/main:col-span-7 @min-[1600px]/main:col-span-6",
  reserve: "order-2 col-span-1 @min-[640px]/main:col-span-3 @min-[1024px]/main:order-6",
  spend: "order-3 col-span-1 @min-[640px]/main:hidden",
  split: "hidden @min-[640px]/main:order-3 @min-[640px]/main:block @min-[640px]/main:col-span-3 @min-[1024px]/main:order-7",
  steps: "order-4 col-span-2 row-span-3 @min-[640px]/main:hidden",
  add: "order-5 col-span-2 @min-[640px]/main:hidden",
  arts: "order-6 col-span-2 row-span-2 @min-[640px]/main:order-4 @min-[640px]/main:col-span-6 @min-[1024px]/main:order-2 @min-[1024px]/main:col-span-5 @min-[1600px]/main:col-span-3 @min-[1600px]/main:row-span-5",
  journal: "order-7 col-span-2 row-span-2 @min-[640px]/main:col-span-6 @min-[1024px]/main:order-3 @min-[1024px]/main:col-span-5 @min-[1024px]/main:row-span-3 @min-[1600px]/main:col-span-3 @min-[1600px]/main:row-span-5",
  chart: "hidden @min-[640px]/main:order-5 @min-[640px]/main:block @min-[640px]/main:col-span-6 @min-[640px]/main:row-span-2 @min-[1024px]/main:order-4",
  form: "hidden @min-[640px]/main:order-6 @min-[640px]/main:block @min-[640px]/main:col-span-6 @min-[640px]/main:row-span-3 @min-[1024px]/main:order-5",
};

export function KassaPage({ d, focus }: { d: Data; focus?: "expense" | "cash" | null }) {
  const ms = useMemo(() => kMonths(d), [d]), LM = lastM(d);
  const [sel, setSel] = useState(""), M = sel && ms.includes(sel) ? sel : LM, isLast = M === LM;
  const [editing, setEditing] = useState<Entry | null>(null), [fk, setFk] = useState(0);
  const formRef = useRef<HTMLDivElement>(null), jRef = useRef<HTMLDivElement>(null);
  const [sheet, setSheet] = useState(false), [jOpen, setJOpen] = useState(false), [iOpen, setIOpen] = useState(false); // на телефоне форма расхода — в листе снизу
  const mu = useMutations();
  const c = useMemo(() => compute(d, M), [d, M]);
  const rec = useMemo(() => recFor(d, M), [d, M]), st = rec ? cashState(d, rec, M) : null;
  const rsv = useMemo(() => reserve(d, isLast ? null : M), [d, M, isLast]);
  const a = useMemo(() => analysis(d, M, c), [d, M, c]);
  const all = useMemo(() => kAll(d), [d]), nRec = useMemo(() => monthList(all, M).length, [all, M]);
  const hasCash = !!d.cash && typeof d.cash.amount === "number", cm = hasCash ? recM(d, { amount: d.cash!.amount, at: +d.cash!.updatedAt || 0, month: d.cash!.month }) : "";
  const lastRecNote = isLast && hasCash && cm !== M ? `в этом месяце ещё не пересчитывали · последний пересчёт ${fmt(d.cash!.amount)} — за ${monthName(cm).toLowerCase()}` : isLast ? "ещё не пересчитывали" : "в этом месяце кассу не пересчитывали";
  // форма в блоке есть от 640 px; уже — она спрятана, и вместо неё открывается лист
  const formShown = () => !!formRef.current && formRef.current.offsetParent !== null;
  useEffect(() => { if (focus === "expense") { if (!formShown()) setSheet(true); else { formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); setFk(Date.now()); } } }, [focus]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (v: FormVal) => {
    const e: Omit<Entry, "id"> = { type: v.type, name: v.name, amount: v.amount, cat: v.type === "inc" ? "" : v.cat, branch: v.branch, date: v.date || "" };
    if (v.type !== "inc") { e.fund = v.fund || ""; e.tag = v.tag || ""; }
    if (editing) { const { id, ...old } = editing; await mu.putEntry(id, { ...old, ...e }); setEditing(null); }
    else await mu.putEntry(newId(), { ...e, source: "manual", createdAt: Date.now() });
    if (sheet) { setSheet(false); toast.success(editing ? "Запись обновлена" : (v.type === "inc" ? "Приход" : "Расход") + " добавлен: " + fmt(v.amount) + " сум"); }
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
  const openJournal = () => { setJOpen(true); requestAnimationFrame(() => jRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })); };
  const delTpl = (id: string) => mu.delTemplate(id).catch(() => toast.error("Не удалось удалить шаблон"));
  const cancel = () => { setEditing(null); setSheet(false); };
  const hint = (t: string) => <p className="-mt-1 text-[12.5px] leading-snug text-muted-foreground">{t}</p>;
  const legend = <span className="inline-flex items-center gap-3"><span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-[3px]" style={{ background: "var(--chart-1)" }} />Премиум</span><span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-[3px]" style={{ background: "var(--chart-2)" }} />Яшнабад</span></span>;
  const reserveBal = reserve(d).bal;
  return (
    <div className="flex flex-col gap-4">
      <PageHead title="Касса" sub={`Наличные Премиума, Яшнабада и C1 · ${monthName(M).toLowerCase()}`}
        actions={<>
          {ms.length > 1 && <Segments aria-label="Месяц" items={ms.map((m) => ({ key: m, label: monthName(m).split(" ")[0] }))} value={M} onChange={setSel} />}
          <Button variant="secondary" size="lg" onClick={xlsx}><FileSpreadsheet />Выгрузить Excel</Button></>} />

      <div className={GRID}>
        <Item c={C.hero}>
          <CashHero c={c} M={M} isLast={isLast} rec={rec} st={st} lastRecNote={lastRecNote} i={0}
            onCash={(v) => mu.saveCash(v, compute(d, LM).expected, LM, newId()).then(() => { toast.success("Пересчёт сохранён"); })}>
            <Steps c={c} rsvBal={reserve(d, isLast ? null : M).bal} title />
          </CashHero>
        </Item>
        <Item c={C.arts}>
          <Card title="Расходы с Б/Ч" note="по статьям" i={1} className="gap-1.5" to={{ tab: "sales", params: { sec: "exp" } }} label="расходы дня в продажах"><Articles a={a} /></Card>
        </Item>
        <Item c={C.journal}>
          <Card title="Журнал записей" action={{ label: `Все ${nRec}`, onClick: openJournal }} i={2} className="gap-1.5"><JournalMini list={all} M={M} /></Card>
        </Item>
        <Item c={C.chart}>
          <Card title="Б/Ч по дням" note={legend} i={3}><DayChart days={c.days} fill /></Card>
        </Item>
        <Item c={C.form}>
          <div ref={formRef} className="h-full min-h-0">
            {isLast ? (
              <Card title={editing ? "Изменить запись" : "Добавить расход"} note="шаблон заполняет форму, итог пересчитывается сразу" i={4} className="gap-2.5">
                <AddForm bento templates={d.templates} editing={editing} reserveBal={reserveBal} onSubmit={submit} onCancel={cancel} focusKey={fk} onDelTpl={delTpl} />
              </Card>
            ) : (
              <Card title="Выводы" note={monthName(M).toLowerCase()} i={4} className="gap-2.5">
                <div className="min-h-0 flex-1 overflow-y-auto"><Insights items={a.insights} /><div className="mt-3"><ArticlesMore a={a} /></div></div>
              </Card>
            )}
          </div>
        </Item>
        <Item c={C.reserve}>
          <ReserveTile M={M} isLast={isLast} rsv={rsv} i={5}
            onReserve={(v, from) => mu.putEntry(newId(), { type: "inc", kind: "rsv", from, name: from === "kassa" ? "Пополнение резерва из кассы" : "Пополнение резерва со стороны", amount: v, cat: "", branch: "Общее", date: todayTash(), source: "manual", createdAt: Date.now() }).then(() => { toast.success("Резерв пополнен"); })} />
        </Item>
        <Item c={C.split}><Tile i={6}><Split c={c} /></Tile></Item>

        <Item c={C.spend}>
          <Tile i={5} to={{ tab: "sales", params: { sec: "exp" } }} label="расходы дня в продажах" icon={Receipt} tone="warn"><TileLabel>Расходы с Б/Ч</TileLabel><div className="min-w-0"><TileValue count={a.sSmall} format="mln" /><TileSub><span>прочие {fmtM(c.sOth)}</span></TileSub></div></Tile>
        </Item>
        <Item c={C.steps}>
          <Card title="Расчёт по шагам" note="нажмите шаг" i={6}><Steps c={c} rsvBal={reserve(d, isLast ? null : M).bal} /></Card>
        </Item>
        {isLast && <Item c={C.add}>
          <div className="glass flex items-center justify-center rounded-3xl p-3"><Button size="lg" className="h-[46px] w-full" onClick={() => setSheet(true)}><Plus />Добавить расход</Button></div>
        </Item>}
      </div>

      <Sheet open={sheet} onOpenChange={(o) => { setSheet(o); if (!o) setEditing(null); }}>
        <SheetContent side="bottom" className="max-h-[85dvh] gap-3 overflow-y-auto rounded-t-[28px] p-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <SheetTitle>{editing ? "Изменить запись" : "Добавить расход"}</SheetTitle>
          <SheetDescription className="text-[12.5px] leading-snug">{FORM_HINT}</SheetDescription>
          {sheet && <AddForm templates={d.templates} editing={editing} reserveBal={reserveBal} onSubmit={submit} onCancel={cancel} focusKey={fk} onDelTpl={delTpl} />}
        </SheetContent>
      </Sheet>

      <div ref={jRef} className="scroll-mt-4"><Card title="Журнал записей" i={7}
        action={{ label: jOpen ? "Свернуть" : `Показать все ${nRec} ${pl(nRec, "запись", "записи", "записей")}`, onClick: () => setJOpen(!jOpen) }}>
        {jOpen && <>{hint("Факт — нажмите на сумму, если потратили не столько, сколько планировали.")}
          <Journal list={all} M={M} editingId={editing?.id || null} onFact={onFact}
            onEdit={(e) => { setEditing(e); setSel(LM); if (!formShown()) setSheet(true); else requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })); }}
            onDelete={(id) => { if (editing?.id === id) setEditing(null); mu.delEntry(id).then(() => toast.success("Запись удалена")).catch(() => toast.error("Не удалось удалить")); }} /></>}
      </Card></div>
      {isLast && <Card title="Выводы" i={8} action={{ label: iOpen ? "Свернуть" : "Показать", onClick: () => setIOpen(!iOpen) }}>
        {iOpen && <div className="grid gap-6 @min-[1024px]/main:grid-cols-2"><Insights items={a.insights} /><ArticlesMore a={a} /></div>}
      </Card>}
    </div>
  );
}
