// Раздел «Платежи»: месяц, плитки, список по неделям, боковые карточки, настройка и панель редактирования.
import { useMemo, useState } from "react";
import { FileSpreadsheet, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import { PageHead } from "@/components/PageHead";
import { Segments } from "@/components/Segments";
import { Chip, Tile, TileBody, TileLabel, TileSub, TileTop, TileValue } from "@/components/Tile";
import { Cell, Grid } from "@/components/Grid";
import { useWidth } from "../sales/useWidth";
import { useIsPhone } from "@/lib/useMedia";
import type { Data, PayItem } from "@/lib/types";
import { useMutations } from "@/lib/useData";
import { MN, MNg, addM, baseAmount, dDiff, dLong, debtOf, dim, fmt, isOn, list, mName, monthRows, pl, todayTash, totals, type MonthRow } from "./logic";
import { MonthList } from "./MonthList";
import { Ring } from "./parts";
import { ByCat, Debts, Soon } from "./Side";
import { Settings } from "./Settings";
import { Editor } from "./Editor";

const ls = { get: (k: string, d: string) => { try { return localStorage.getItem("kassa-web.pay." + k) ?? d; } catch { return d; } }, set: (k: string, v: string) => { try { localStorage.setItem("kassa-web.pay." + k, v); } catch { /* нет хранилища */ } } };

export function PayPage({ d }: { d: Data }) {
  const T = todayTash(), [ref, w] = useWidth<HTMLDivElement>(), wide = w >= 1700, phone = useIsPhone();
  const [M, setM] = useState(() => ls.get("m", "") || T.slice(0, 7));
  const [view, setView] = useState<"all" | "late" | "ok">("all");
  const [open, setOpen] = useState<string | null>(null);
  const [edit, setEdit] = useState<string | null>(null), [newKind, setNewKind] = useState<PayItem["kind"]>("fixed");
  const [tab, setTab] = useState<PayItem["kind"]>(() => (ls.get("tab", "fixed") as PayItem["kind"]));
  const mu = useMutations();
  const rows = useMemo(() => monthRows(d, M, T), [d, M, T]);
  const t = totals(rows), next = rows.find((r) => r.st !== "ok" && r.due >= T);
  const debts = useMemo(() => list(d).filter((it) => it.kind === "debt" && isOn(it)).map((it) => ({ it, ...debtOf(d, it, T) })), [d, T]);
  const dLeft = debts.reduce((s, x) => s + (x.left || 0), 0);
  const go = (m: string) => { setM(m); ls.set("m", m === T.slice(0, 7) ? "" : m); setOpen(null); };
  const err = (e: unknown): void => { toast.error("Не удалось сохранить: " + (e instanceof Error ? e.message : String(e))); };
  const run = (p: Promise<void>, ok?: string): Promise<void> => p.then(() => { if (ok) toast.success(ok); }).catch(err);

  const onPlan = (id: string, v: number | null) => { const it = d.items[id]; const base = baseAmount(d, it, M).a;
    run(mu.putMark(id, M, { plan: v == null || Math.round(v) === base ? null : Math.round(v) }), v == null ? "Сумма месяца сброшена" : `Сумма на ${MN[+M.slice(5, 7) - 1].toLowerCase()} сохранена`); };
  const onPaid = (r: MonthRow, v: number | null) => { const man = v == null ? null : Math.max(0, Math.round(v) - r.auto);
    run(mu.putMark(r.it.id, M, { amount: man || null, date: M === T.slice(0, 7) ? T : r.due }), "Оплата сохранена"); };
  const onToggle = (r: MonthRow) => {
    if (r.st === "ok" && r.auto && !r.man) { setOpen(r.it.id); return; }
    const un = r.st === "ok" && r.man > 0;
    run(mu.putMark(r.it.id, M, un ? { amount: null } : { amount: Math.max(0, r.am.a - r.auto) || r.am.a, date: M === T.slice(0, 7) ? T : r.due }), un ? "Отметка снята" : "Оплата отмечена");
  };
  const onChange = (it: PayItem, patch: Partial<PayItem>) => run(mu.putItem(it.id, { ...it, ...patch }));
  const addNew = (k: PayItem["kind"]) => { setNewKind(k); setEdit("new"); };
  // Excel грузится только по нажатию — сайт остаётся лёгким
  const xlsx = async () => {
    try {
      const X = await import("xlsx");
      const ST: Record<string, string> = { ok: "Оплачено", part: "Частично", late: "Просрочено", today: "Сегодня", soon: "Впереди" };
      const ws = X.utils.json_to_sheet(rows.map((r) => ({ "День": r.due, "Платёж": r.it.name, "Откуда": r.it.src, "Точка": r.it.point || "", "Сумма": r.am.a, "Оплачено": r.paid, "Осталось": r.left, "Статус": ST[r.st] })));
      const ws2 = X.utils.json_to_sheet(debts.map((x) => ({ "Долг": x.it.name, "Всего": x.total || null, "Погашено": x.paid, "Осталось": x.left })));
      const wb = X.utils.book_new(); X.utils.book_append_sheet(wb, ws, "Платежи " + M); X.utils.book_append_sheet(wb, ws2, "Долги");
      X.writeFile(wb, `Платежи ${mName(M)}.xlsx`); toast.success("Файл скачан");
    } catch (e) { toast.error("Не удалось выгрузить: " + String(e)); }
  };

  const mi = MN[+M.slice(5, 7) - 1].toLowerCase();
  const lateSum = rows.filter((r) => r.st === "late").reduce((s, r) => s + r.left, 0);
  const shown = view === "late" ? rows.filter((r) => r.st === "late") : view === "ok" ? rows.filter((r) => r.st === "ok") : rows;
  // месяцы для переключателя: пять назад и два вперёд от сегодняшнего, плюс выбранный (ряд прокручивается)
  const lo = M < addM(T.slice(0, 7), -5) ? M : addM(T.slice(0, 7), -5), hi = M > addM(T.slice(0, 7), 2) ? M : addM(T.slice(0, 7), 2);
  const months: string[] = []; for (let x = lo; x <= hi; x = addM(x, 1)) months.push(x);
  const toSettings = () => document.getElementById("pay-settings")?.scrollIntoView({ behavior: "smooth" });

  const cur = M === T.slice(0, 7);
  const lateDays = Math.max(0, ...rows.filter((r) => r.st === "late").map((r) => dDiff(r.due, T)));
  const toEnd = dDiff(T, M + "-" + String(dim(M)));
  const onOpen = (id: string) => { setView("all"); setOpen(id); document.getElementById("pay-main")?.scrollIntoView({ behavior: "smooth" }); };
  const soon = <Soon i={4} rows={rows} T={T} onOpen={onOpen} compact={wide} />;
  const debtsCard = <Debts i={5} debts={debts} onEdit={setEdit} onAdd={() => addNew("debt")} compact={wide} />;
  const sumIn = (a: number, b: number) => shown.filter((r) => { const x = +r.due.slice(8); return x >= a && x <= b; }).reduce((s, r) => s + r.am.a, 0);
  const listCard = (n: number, range: [number, number], title: string, head: React.ReactNode, total: boolean) => (
    <Card i={n} title={title} action={phone ? undefined : head}>
      {phone && <div className="min-w-0">{head}</div>}
      <MonthList d={d} M={M} T={T} rows={shown} filtered={view !== "all"} range={range} total={total} open={open} setOpen={setOpen} onPlan={onPlan} onPaid={onPaid} onToggle={onToggle}
        onReset={(id) => run(mu.putMark(id, M, { plan: null }), "Вернула общую сумму")} onEdit={setEdit} />
    </Card>
  );
  const filter = (
    <Segments size="sm" aria-label="Вид списка" value={view} onChange={(k) => setView(k as typeof view)}
      items={[{ key: "all", label: "Все" }, { key: "late", label: "Просроченные", badge: t.late }, { key: "ok", label: "Оплаченные", badge: t.okN }]} />
  );
  const empty = rows.length ? <p className="glass-inner rounded-2xl p-5 text-[13.5px] text-muted-foreground">В этом виде платежей нет.</p>
    : <p className="glass-inner rounded-2xl p-5 text-[13.5px] text-muted-foreground">В {MNg[+M.slice(5, 7) - 1].replace(/я$/, "е").replace(/а$/, "е")} платежей нет. Добавьте кредит, аренду, налоги и зарплаты — они будут появляться каждый месяц сами.</p>;
  const kindN = (k: string) => list(d).filter((it) => it.kind === k).length;
  const setNote = `${kindN("fixed")} постоянных · ${kindN("plan")} разовых · правка прямо в строке`;
  const mid = Math.min(14, dim(M));

  return (
    <div ref={ref} className="flex flex-col gap-4">
      <PageHead eyebrow="Обязательные платежи" title="Платежи" sub="Кредит, аренда, налоги, зарплаты и долги"
        actions={<>
          <Segments aria-label="Месяц" items={months.map((x) => ({ key: x, label: mName(x) }))} value={M} onChange={go} />
          <Button variant="secondary" size="lg" onClick={xlsx} aria-label="Выгрузить Excel"><FileSpreadsheet /><span className="sm:hidden">Excel</span></Button>
          <Button size="lg" onClick={() => addNew(tab)}><Plus />Платёж</Button>
        </>} />

      <Grid>
        <Cell s={3} span={3} wide={2}><Tile i={0} hero>
          <TileTop><TileLabel>Платежи за {mi}</TileLabel></TileTop>
          <TileBody><TileValue count={t.tot} /><TileSub>{rows.length} {pl(rows.length, "платёж", "платежа", "платежей")}</TileSub></TileBody>
        </Tile></Cell>
        <Cell s={3} span={3} wide={2}><Tile i={1}>
          <TileTop><TileLabel>Оплачено</TileLabel><Ring p={t.tot ? t.paid / t.tot : 0} className="-mt-1 -mr-1 size-10" /></TileTop>
          <TileBody><TileValue count={t.paid} className="text-plus" /><TileSub>{t.okN} из {rows.length}</TileSub></TileBody>
        </Tile></Cell>
        <Cell s={3} span={3} wide={2}><Tile i={2}>
          <TileTop><TileLabel>Осталось оплатить</TileLabel></TileTop>
          <TileBody><TileValue count={t.left} /><TileSub>{!t.left ? "всё оплачено" : cur && toEnd >= 0 ? `до конца месяца ${toEnd} ${pl(toEnd, "день", "дня", "дней")}` : next ? `ближайший — ${dLong(next.due)}` : "срок прошёл"}</TileSub></TileBody>
        </Tile></Cell>
        <Cell s={3} span={3} wide={2}><Tile i={3} warn={t.late > 0}>
          <TileTop><TileLabel>Просрочено</TileLabel></TileTop>
          <TileBody>{t.late ? <TileValue count={lateSum} className="text-minus" /> : <TileValue>—</TileValue>}
            <TileSub>{t.late ? <Chip tone="minus">{t.late} {pl(t.late, "платёж", "платежа", "платежей")} · {lateDays} {pl(lateDays, "день", "дня", "дней")}</Chip> : "просрочек нет"}</TileSub></TileBody>
        </Tile></Cell>
        {wide && cur && <Cell span={4} wide={4}>{soon}</Cell>}
        {wide && <Cell span={4} wide={cur ? 4 : 8}>{debtsCard}</Cell>}

        {wide ? <>
          <Cell wide={6}><div id="pay-main" className="scroll-mt-4">{listCard(6, [1, mid], `Платежи · 1–${mid} ${MNg[+M.slice(5, 7) - 1]}`, <span className="flex items-center gap-3">{filter}<span className="num text-xs text-muted-foreground">{fmt(sumIn(1, mid))}</span></span>, false)}</div></Cell>
          <Cell wide={6}>{listCard(7, [mid + 1, 31], `Платежи · ${mid + 1}–${dim(M)} ${MNg[+M.slice(5, 7) - 1]}`, <span className="num text-xs text-muted-foreground">{fmt(sumIn(mid + 1, 31))}</span>, true)}</Cell>
          <Cell wide={4}><ByCat i={8} rows={rows} onSettings={toSettings} settingsNote={setNote} /></Cell>
        </> : <>
          <Cell s={6} span={8}><div id="pay-main" className="scroll-mt-4">
            {shown.length ? listCard(6, [1, 31], `Платежи · ${mi}`, filter, true) : <Card i={6} title={`Платежи · ${mi}`} action={phone ? undefined : filter}>{phone && filter}{empty}</Card>}
          </div></Cell>
          <Cell s={6} span={4}><div className="flex min-w-0 flex-col gap-4">
            {cur && soon}
            {debtsCard}
            <ByCat i={8} rows={rows} />
          </div></Cell>
        </>}
      </Grid>

      <div id="pay-settings" className="scroll-mt-4"><Settings i={9} d={d} tab={tab} setTab={(k) => { setTab(k); ls.set("tab", k); }} onChange={onChange} onEdit={setEdit} onAdd={addNew} /></div>
      <Editor d={d} M={M} open={edit} newKind={newKind} onClose={() => setEdit(null)}
        onSave={(id, it) => mu.putItem(id, it).then(() => { toast.success("Сохранено"); }).catch((e) => { err(e); throw e; })}
        onDelete={(id) => mu.delItem(id).then(() => { toast.success("Платёж удалён"); }).catch(err)} />
    </div>
  );
}
