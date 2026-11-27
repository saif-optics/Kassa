// Раздел «Продажи»: бенто-мозаика — показатели, календарь, итог дня, касса по точкам, форма продажи, график, долги; ниже журнал, таблица по периодам, файлы.
import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import type { Data } from "@/lib/types";
import { useMutations } from "@/lib/useData";
import { canPerm, useAccess } from "@/lib/access";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { PageHead } from "@/components/PageHead";
import { Segments } from "@/components/Segments";
import { Item } from "@/components/Grid";
import { useIsPhone } from "@/lib/useMedia";
import { cn } from "@/lib/utils";
import { Chip, Tile, TileBody, TileLabel, TileSub, TileTop, TileValue, type ChipTone } from "@/components/Tile";
import { PRESETS, SalesFilterSheet, useSalesFilter } from "./filter";
import { CalendarBlock, DayBlock, DayList, useCalendar } from "./Calendar";
import { CashBlock, KassaChip, PointTable } from "./DayCash";
import { DebtsBlock, DebtsTable, useDebts } from "./DebtsPanel";
import { SaleForm, type SaleRec } from "./SaleForm";
import { ExpenseBox, type ExpMode } from "./ExpenseBox";
import { PeriodTable, RevenueChart } from "./Stats";
import { Journal } from "./Journal";
import { Photos, SettingsBox } from "./Extras";
import { downloadCsv, downloadXlsx } from "./files";
import { agg, cmpText, csvOf, ctxOf, addD, dayCashBlocks, dayCashRows, dShort, expFiltered, expVal, filtered, fmt, fmtM, fname, lowerFirst, newId, prevList, rangeOf, sheetsOf, type SaleX, type Settings } from "./logic";

/** дельта к прошлому периоду пилюлей: «▲ 9%»; полный текст — в подсказке, на широком экране hero дописывает «к прошлому» */
function Cmp({ cur, prev, long }: { cur: number; prev: number | null | undefined; long?: boolean }) {
  const t = cmpText(cur, prev);
  if (t.kind === "none" || t.kind === "nodata") return null;
  const tone: ChipTone = t.kind === "up" ? "plus" : t.kind === "down" ? "minus" : "muted";
  return <span title={t.text} className="shrink-0"><Chip tone={tone}>{t.text.replace(" к прошлому периоду", "")}{long && <span className="hidden @min-[1600px]/main:inline">&nbsp;к прошлому</span>}</Chip></span>;
}

type Tab = "overview" | "sale" | "journal";
const TABS = [{ key: "overview", label: "Обзор" }, { key: "sale", label: "Продажа" }, { key: "journal", label: "Журнал" }];

// Мозаика: 2 колонки на телефоне, 6 от 640, 12 от 1024; ряд 120 (126 от 1600), зазор 16 (10 на телефоне).
const GRID = "grid grid-flow-dense grid-cols-2 auto-rows-[minmax(118px,auto)] gap-2.5 @min-[640px]/main:grid-cols-6 @min-[640px]/main:auto-rows-[120px] @min-[640px]/main:gap-4 @min-[1024px]/main:grid-cols-12 @min-[1600px]/main:auto-rows-[126px]";
const C = {
  rev: "col-span-2 row-span-2 @min-[640px]/main:col-span-3 @min-[640px]/main:row-span-1",
  checks: "hidden @min-[640px]/main:block @min-[640px]/main:col-span-3",
  avg: "hidden @min-[640px]/main:block @min-[640px]/main:col-span-3",
  cash: "col-span-1 @min-[640px]/main:col-span-3",
  debtTile: "col-span-1 @min-[640px]/main:hidden",
  cal: "hidden @min-[1024px]/main:block @min-[1024px]/main:col-span-7 @min-[1024px]/main:row-span-4 @min-[1600px]/main:col-span-6",
  day: "col-span-2 row-span-3 @min-[640px]/main:col-span-6 @min-[640px]/main:row-span-4 @min-[1024px]/main:col-span-5 @min-[1024px]/main:row-span-4 @min-[1600px]/main:col-span-3",
  list: "col-span-2 row-span-3 @min-[640px]/main:col-span-6 @min-[640px]/main:row-span-4 @min-[1024px]/main:hidden",
  pts: "col-span-2 row-span-3 @min-[640px]/main:col-span-6 @min-[1600px]/main:col-span-3 @min-[1600px]/main:row-span-4",
  ptsTall: "@min-[1024px]/main:row-span-4",
  form: "col-span-2 @min-[640px]/main:col-span-6 @min-[640px]/main:row-span-3",
  formTall: "@min-[640px]/main:row-span-4",
  chart: "col-span-2 row-span-3 @min-[640px]/main:col-span-6 @min-[640px]/main:row-span-2 @min-[1024px]/main:row-span-3 @min-[1600px]/main:col-span-3",
  debts: "hidden @min-[640px]/main:block @min-[640px]/main:col-span-6 @min-[640px]/main:row-span-2 @min-[1024px]/main:row-span-3 @min-[1600px]/main:col-span-3",
  tallBig: "@min-[1600px]/main:row-span-4",
};
/** подпись под значением: разные тексты для телефона, средней и широкой ширины */
const SUBC = "mt-1 leading-5 ";
const SUB = { phone: "@min-[640px]/main:hidden", mid: "hidden @min-[640px]/main:flex @min-[1600px]/main:hidden", full: "hidden @min-[1600px]/main:flex" };
/** размеры значений: 30 на телефоне, 38 от 640, 32 на средней ширине (плитка узкая), 38 от 1600 */
const VAL = "@min-[1024px]/main:text-[32px] @min-[1600px]/main:text-[38px]";

/** боковой лист: на телефоне снизу, на компьютере справа */
function Panel({ open, onClose, title, desc, wide, children }: { open: boolean; onClose: () => void; title: string; desc: string; wide?: boolean; children: React.ReactNode }) {
  const phone = useIsPhone();
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side={phone ? "bottom" : "right"} className={cn("gap-3 p-5", phone ? "max-h-[88dvh] rounded-t-[28px] p-4" : wide ? "data-[side=right]:sm:max-w-3xl" : "data-[side=right]:sm:max-w-xl")}>
        <SheetTitle className="pr-10 text-lg font-bold">{title}</SheetTitle>
        <SheetDescription className="text-[13px] leading-snug">{desc}</SheetDescription>
        <div className="min-h-0 flex-1 overflow-y-auto pb-1">{open && children}</div>
      </SheetContent>
    </Sheet>
  );
}

export function SalesPage({ d }: { d: Data }) {
  const phone = useIsPhone();
  // на телефоне раздел разбит на три вкладки; остальные остаются в DOM (скрыты), чтобы не терять состояние форм
  const [tab, setTabS] = useState<Tab>(() => { try { const v = sessionStorage.getItem("kassa-web.sales.tab"); return v === "sale" || v === "journal" ? v : "overview"; } catch { return "overview"; } });
  const setTab = (t: string) => { setTabS(t as Tab); try { sessionStorage.setItem("kassa-web.sales.tab", t); } catch { /* без хранилища */ } };
  const vis = (t: Tab) => (phone && tab !== t ? "hidden" : "");
  const sec = (t: Tab) => cn("flex flex-col gap-4", vis(t));
  const mu = useMutations(), { F, setPreset } = useSalesFilter(), access = useAccess();
  const c = useMemo(() => ctxOf(d), [d]);
  // ограниченная роль (кассир, продавец, гость): права по переключателям, только своя точка, даты сегодня/вчера — как проверяет сервер
  const lim = !access.isAdmin, today = c.today, yest = addD(today, -1);
  const canWrite = canPerm(access, "sales_write"), canEditAny = canPerm(access, "sales_edit");
  const canEditSale = (s: SaleX) => !lim || (canEditAny && !s.id.startsWith("bz") && s.date >= yest && s.date <= today);
  const expMode: ExpMode | null = !lim || canPerm(access, "exp_edit") ? "full" : canPerm(access, "exp_add") ? "simple" : canPerm(access, "exp_view") ? "view" : null;
  const formSettings = useMemo(() => (lim && access.point ? { ...c.settings, points: [access.point] } : c.settings), [lim, access.point, c.settings]);
  const canDeleteExp = (e: { date?: string }) => !lim || ((e.date || "") >= yest && (e.date || "") <= today);
  const list = useMemo(() => filtered(c, F), [c, F]);
  const ex = useMemo(() => expFiltered(c, F), [c, F]);
  const a = agg(list), pv = prevList(c, F), pa = pv ? agg(pv.list) : null;
  const expSum = ex.reduce((x, e) => x + expVal(e), 0);
  const rows = useMemo(() => dayCashRows(list, ex, c.settings.points), [list, ex, c.settings.points]);
  const blocks = useMemo(() => dayCashBlocks(rows, c.settings.points, F), [rows, c.settings.points, F]);
  const dr = useDebts(c.sales, F), r = rangeOf(F, list, today);

  const [jDay, setJDay] = useState(""), [editing, setEditing] = useState<SaleX | null>(null), [xmsg, setXmsg] = useState<{ t: string; bad?: boolean } | null>(null);
  const [tall, setTall] = useState(false), [fOpen, setFOpen] = useState(false), [eOpen, setEOpen] = useState(false), [dOpen, setDOpen] = useState(false), [pt, setPt] = useState<string | null>(null);
  const jRef = useRef<HTMLDivElement>(null);
  const cal = useCalendar(c, F, jDay);
  const resetKey = `${F.from}|${F.to}|${F.point}`;
  useEffect(() => setJDay(""), [resetKey]);
  const say = (t: string, bad?: boolean, ms = 5000) => { setXmsg({ t, bad }); if (t) setTimeout(() => setXmsg((m) => (m && m.t === t ? null : m)), ms); };

  const save = async (id: string | null, rec: SaleRec) => {
    if (lim && (id ? !canEditAny : !canWrite)) throw new Error("Нет права менять продажи");
    const old = id ? c.sales.find((s) => s.id === id) : null, data: Record<string, unknown> = { ...(old || {}), ...rec }; delete data.id;
    setJDay(String(rec.date));
    await mu.putDoc("sales", id || newId(), data);
    if (id) setEditing(null);
  };
  const remove = (id: string) => { if (lim && !canEditAny) return; if (editing?.id === id) setEditing(null); mu.delDoc("sales", id).catch(() => say("Не удалось удалить.", true)); };
  const addExp = async (v: { date: string; point: string; name: string; amount: number }) => {
    await mu.putEntry(newId(), { type: "exp", name: `${v.point} за ${lowerFirst(v.name)}`, amount: v.amount, cat: "op", branch: v.point, date: v.date, source: "day", createdAt: Date.now() });
  };
  const addExpSimple = (v: { date: string; name: string; amount: number }) => mu.addExpenseLimited(v.name, v.amount, v.date);
  const csv = () => { const x = csvOf(c, F); if (!x.n) return say("Нет данных за выбранный период.", true); downloadCsv(x.text, fname(c, F, "prodazhi", "csv")); say("Файл сохранён"); };
  const xlsx = async () => {
    if (!list.length) return say("Нет данных за выбранный период.", true);
    say("Готовлю файл…", false, 60000);
    try { const name = fname(c, F, "prodazhi", "xlsx"); await downloadXlsx(sheetsOf(c, F), name); say("Файл сохранён: " + name); } catch { say("Не удалось выгрузить файл.", true); }
  };
  const saveSettings = async (v: Settings) => {
    if (lim) throw new Error("Настройки меняет владелец");
    await mu.putDoc("settings", "sales", v); toast.success("Настройки сохранены"); };
  const openDay = (day: string) => { setJDay(day); if (phone) setTab("journal"); requestAnimationFrame(() => jRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })); };
  const showForm = !lim || canWrite || (editing && canEditAny);
  // «+ Продажа»: курсор в поле «Товар» (на телефоне сначала вкладка «Продажа»)
  const focusSale = () => {
    if (phone && tab !== "sale") setTab("sale");
    let n = 0; const t = window.setInterval(() => {
      const el = document.querySelector<HTMLInputElement>('input[aria-label="Товар"]');
      if ((el && el.offsetParent !== null) || ++n > 20) { window.clearInterval(t); if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.focus({ preventScroll: true }); } }
    }, 100);
  };

  const expProps = { exp: ex, settings: formSettings, mode: expMode || "view", onAdd: addExp, onAddSimple: addExpSimple, onDelete: (id: string) => mu.delEntry(id), canDelete: canDeleteExp,
    dates: lim ? { min: expMode === "simple" ? addD(today, -2) : yest, max: today } : undefined } as const;
  const openPt = blocks.find((b) => b.pt === pt);
  const sub = <>{dShort(F.from || r.from)} — {dShort(F.to || r.to)} · {F.point === "all" ? "все точки" : F.point} · {F.cat === "all" ? "все категории" : F.cat} · <button type="button" onClick={() => setFOpen(true)} className="font-semibold text-primary hover:underline">фильтры</button></>;
  const periods = <Segments aria-label="Период" items={PRESETS.map(([key, label]) => ({ key, label }))} value={F.preset === "custom" ? "" : F.preset} onChange={setPreset} />;

  // сквозной номер посадки сверху вниз
  let k = 0; const nx = () => k++;
  return (
    <div className="flex flex-col gap-4">
      <PageHead title="Продажи" sub={sub}
        actions={phone ? undefined : <>{periods}{showForm && <Button size="lg" className="h-10 rounded-full px-5 text-[15px]" onClick={focusSale}><Plus />Продажа</Button>}</>} />
      {phone && <Segments aria-label="Раздел продаж" items={TABS} value={tab} onChange={setTab} className="w-full [&>div]:w-full [&_button]:flex-1" />}
      {phone && tab === "overview" && <div className="flex items-center gap-2"><Segments aria-label="Период" className="min-w-0 flex-1 [&>div]:w-full" items={PRESETS.map(([key, label]) => ({ key, label }))} value={F.preset === "custom" ? "" : F.preset} onChange={setPreset} />
        <Button type="button" variant="secondary" className="h-10 shrink-0 gap-1.5 rounded-full px-3.5" onClick={() => setFOpen(true)}><SlidersHorizontal className="size-4" />Фильтры</Button></div>}

      <div className={GRID}>
        <Item k="rev" c={cn(C.rev, vis("overview"))}>
          <Tile i={nx()} hero>
            <TileTop><TileLabel>Выручка за период</TileLabel><Cmp cur={a.rev} prev={pa && pa.rev} long /></TileTop>
            <TileBody><TileValue count={a.rev} className="@min-[640px]/main:text-[40px] @min-[1024px]/main:text-[32px] @min-[1600px]/main:text-[44px]" />
              <TileSub className={cn("flex-wrap", SUB.phone)}>{fmt(a.checks)} чеков · {fmt(a.n)} позиций · средний {fmt(a.avg)}</TileSub></TileBody>
          </Tile>
        </Item>
        <Item k="checks" c={C.checks}>
          <Tile i={nx()}><TileTop><TileLabel>Чеков / позиций</TileLabel><Cmp cur={a.checks} prev={pa && pa.checks} /></TileTop><TileValue className={VAL}>{fmt(a.checks)} / {fmt(a.n)}</TileValue></Tile>
        </Item>
        <Item k="avg" c={C.avg}>
          <Tile i={nx()}><TileTop><TileLabel>Средний чек</TileLabel><Cmp cur={a.avg} prev={pa && pa.avg} /></TileTop><TileValue count={a.avg} className={VAL} /></Tile>
        </Item>
        <Item k="cash" c={cn(C.cash, vis("overview"))}>
          <Tile i={nx()}><TileLabel>Б/Ч − расходы дня</TileLabel>
            <TileBody><TileValue count={a.cash - expSum} compact className={VAL} />
              <TileSub className={SUBC + SUB.phone}>расходы {fmtM(expSum)}</TileSub>
              <TileSub className={SUBC + SUB.mid}>наличные {fmtM(a.cash).replace(" млн", "")} · расходы {fmtM(expSum)}</TileSub>
              <TileSub className={SUBC + SUB.full}>наличные {fmt(a.cash)} · расходы {fmt(expSum)}</TileSub></TileBody></Tile>
        </Item>
        <Item k="debtTile" c={cn(C.debtTile, vis("overview"))}>
          <button type="button" onClick={() => setDOpen(true)} className="block h-full w-full rounded-3xl text-left outline-none focus-visible:ring-3 focus-visible:ring-primary/40" aria-label="Открыть долги">
            <Tile i={nx()}><TileLabel>Долги</TileLabel><TileBody><TileValue count={dr.openSum} format="mln" className={dr.openSum ? "text-minus" : ""} /><TileSub>открыто {dr.openCount}</TileSub></TileBody></Tile>
          </button>
        </Item>

        <Item k="cal" c={cn(C.cal, vis("overview"))}><CalendarBlock c={c} cal={cal} i={nx()} /></Item>
        <Item k="day" c={cn(C.day, vis("overview"))}><DayBlock c={c} F={F} cal={cal} onOpenDay={openDay} i={nx()} /></Item>
        <Item k="list" c={cn(C.list, vis("overview"))}><DayList c={c} cal={cal} i={nx()} /></Item>
        <Item k="pts" c={cn(C.pts, tall && C.ptsTall, vis("overview"))}><CashBlock blocks={blocks} points={c.settings.points} onOpen={setPt} i={nx()} /></Item>
        {showForm && <Item k="form" c={cn(C.form, tall && C.formTall, vis("sale"))}>
          <SaleForm sales={c.sales} settings={formSettings} editing={editing} onSave={save} onCancel={() => setEditing(null)} dates={lim ? { min: yest, max: today } : undefined} onTall={setTall} i={nx()}
            extra={expMode && !phone && <Button type="button" variant="secondary" className="h-9 rounded-full px-5 text-[15px]" onClick={() => setEOpen(true)}>{expMode === "view" ? "Расходы дня" : "Расход дня"}</Button>} />
        </Item>}
        <Item k="chart" c={cn(C.chart, tall && C.tallBig, vis("overview"))}><RevenueChart c={c} F={F} list={list} i={nx()} /></Item>
        <Item k="debts" c={cn(C.debts, tall && C.tallBig)}><DebtsBlock r={dr} onAll={() => setDOpen(true)} i={nx()} /></Item>
        {expMode && phone && tab === "sale" && <Item k="exp" c="col-span-2"><ExpenseBox {...expProps} i={nx()} /></Item>}
      </div>

      <div ref={jRef} className="scroll-mt-4"><div className={sec("journal")}>
        <PeriodTable c={c} F={F} list={list} resetKey={resetKey} i={nx()} />
        <Journal c={c} F={F} list={list} jDay={jDay} setJDay={setJDay} editingId={editing?.id || null} onEdit={setEditing} onDelete={remove} onCsv={csv} onXlsx={xlsx} msg={xmsg} canEdit={canEditSale} i={nx()} />
        {!lim && <Photos rows={d.rows.photos || {}} sales={c.sales} i={nx()} />}
        {!lim && <SettingsBox key={c.settings.points.join() + c.settings.cats.join() + c.settings.plan} settings={c.settings} onSave={saveSettings} i={nx()} />}
      </div></div>

      <SalesFilterSheet d={d} open={fOpen} onOpenChange={setFOpen} />
      <Panel open={eOpen && !phone} onClose={() => setEOpen(false)} title="Расход дня" desc="Такси, доставка, мастер, вода и т.п. Расходы Премиума и Яшнабада сразу попадают в кассу."><ExpenseBox {...expProps} bare i={0} /></Panel>
      <Panel open={dOpen} onClose={() => setDOpen(false)} title="Долги" desc="Возникшие в периоде и все ещё открытые старые долги" wide><DebtsTable r={dr} /></Panel>
      <Panel open={!!openPt} onClose={() => setPt(null)} title={openPt ? `Касса: ${openPt.pt}` : ""} desc="Оплаты, расходы дня и наличные после расходов по дням" wide>
        {openPt && <><div className="mb-3"><KassaChip kassa={openPt.kassa} /></div><PointTable b={openPt} /></>}</Panel>
    </div>
  );
}
