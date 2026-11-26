// Раздел «Платежи»: месяц, плитки, список по неделям, боковые карточки, настройка и панель редактирования.
import { useMemo, useState } from "react";
import { FileSpreadsheet, Plus, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import { PageHead } from "@/components/PageHead";
import { Segments } from "@/components/Segments";
import { Chip, Tile, TileLabel, TileSub, TileValue } from "@/components/Tile";
import type { Data, PayItem } from "@/lib/types";
import { useMutations } from "@/lib/useData";
import { MN, MNg, addM, baseAmount, dLong, debtOf, isOn, list, mName, monthRows, pl, todayTash, totals, type MonthRow } from "./logic";
import { MonthList } from "./MonthList";
import { Ring } from "./parts";
import { ByCat, Debts, Soon } from "./Side";
import { Settings } from "./Settings";
import { Editor } from "./Editor";

const ls = { get: (k: string, d: string) => { try { return localStorage.getItem("kassa-web.pay." + k) ?? d; } catch { return d; } }, set: (k: string, v: string) => { try { localStorage.setItem("kassa-web.pay." + k, v); } catch { /* нет хранилища */ } } };

export function PayPage({ d }: { d: Data }) {
  const T = todayTash();
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
  // месяцы для переключателя: пять назад и два вперёд от сегодняшнего, плюс выбранный
  const lo = M < addM(T.slice(0, 7), -5) ? M : addM(T.slice(0, 7), -5), hi = M > addM(T.slice(0, 7), 2) ? M : addM(T.slice(0, 7), 2);
  const months: string[] = []; for (let x = lo; x <= hi; x = addM(x, 1)) months.push(x);
  const toSettings = () => document.getElementById("pay-settings")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="flex flex-col gap-3.5">
      <PageHead eyebrow="Saif-Optics · обязательные платежи" title="Платежи" sub="Кредит, аренда, налоги, зарплаты и долги — что уже оплачено и что впереди"
        actions={<>
          <Button variant="secondary" size="lg" onClick={toSettings}><Settings2 />Настройки</Button>
          <Button variant="secondary" size="lg" onClick={xlsx}><FileSpreadsheet />Выгрузить Excel</Button>
          <Button size="lg" onClick={() => addNew(tab)}><Plus />Добавить платёж</Button>
        </>} />

      <Segments aria-label="Месяц" items={months.map((x) => ({ key: x, label: mName(x) }))} value={M} onChange={go} />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3.5">
        <Tile i={0} hero>
          <TileLabel>Платежи за {mi}</TileLabel>
          <TileValue count={t.tot} suffix=" сум" />
          <TileSub>{rows.length} {pl(rows.length, "платёж", "платежа", "платежей")}</TileSub>
        </Tile>
        <Tile i={1}>
          <TileLabel>Оплачено</TileLabel>
          <TileValue count={t.paid} suffix=" сум" className="text-plus" />
          <div className="flex items-center justify-between gap-3"><TileSub>{t.okN} из {rows.length}</TileSub><Ring p={t.tot ? t.paid / t.tot : 0} className="size-9" /></div>
        </Tile>
        <Tile i={2}>
          <TileLabel>Осталось оплатить</TileLabel>
          <TileValue count={t.left} suffix=" сум" />
          <TileSub>{next ? `ближайший — ${dLong(next.due)}, ${next.it.name}` : "всё оплачено"}</TileSub>
        </Tile>
        <Tile i={3} warn={t.late > 0}>
          <TileLabel>Просрочено</TileLabel>
          {t.late ? <TileValue count={lateSum} suffix=" сум" className="text-minus" /> : <TileValue>—</TileValue>}
          <TileSub>{t.late ? <Chip tone="minus">{t.late} {pl(t.late, "платёж", "платежа", "платежей")}</Chip> : "просрочек нет"}</TileSub>
        </Tile>
      </div>

      <div className="grid items-start gap-3.5 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
        <div id="pay-main" className="min-w-0 scroll-mt-4"><Card i={4} title={`Платежи · ${mi}`} note={`${shown.length} ${pl(shown.length, "платёж", "платежа", "платежей")}`} action={{ label: "+ Платёж", onClick: () => addNew("fixed") }}>
          <p className="text-[12.5px] leading-snug text-muted-foreground">Сумма — нажмите, чтобы поставить другую только на этот месяц. «Оплачено» — поправить, сколько уже заплатили. Статус — отметить оплату одним нажатием.</p>
          <Segments size="sm" aria-label="Вид списка" value={view} onChange={(k) => setView(k as typeof view)}
            items={[{ key: "all", label: "Все" }, { key: "late", label: "Просроченные", badge: t.late }, { key: "ok", label: "Оплаченные", badge: t.okN }]} />
          {shown.length ? <MonthList d={d} M={M} T={T} rows={shown} filtered={view !== "all"} open={open} setOpen={setOpen} onPlan={onPlan} onPaid={onPaid} onToggle={onToggle}
            onReset={(id) => run(mu.putMark(id, M, { plan: null }), "Вернула общую сумму")} onEdit={setEdit} />
            : rows.length ? <p className="glass-inner rounded-2xl p-5 text-[13.5px] text-muted-foreground">В этом виде платежей нет.</p>
            : <p className="glass-inner rounded-2xl p-5 text-[13.5px] text-muted-foreground">В {MNg[+M.slice(5, 7) - 1].replace(/я$/, "е").replace(/а$/, "е")} платежей нет. Добавьте кредит, аренду, налоги и зарплаты — они будут появляться каждый месяц сами.</p>}
        </Card></div>
        <aside className="flex min-w-0 flex-col gap-3.5">
          {M === T.slice(0, 7) && <Soon i={5} rows={rows} T={T} onOpen={(id) => { setView("all"); setOpen(id); document.getElementById("pay-main")?.scrollIntoView({ behavior: "smooth" }); }} />}
          <Debts i={6} debts={debts} onEdit={setEdit} onAdd={() => addNew("debt")} />
          <ByCat i={7} rows={rows} />
        </aside>
      </div>

      <div id="pay-settings" className="scroll-mt-4"><Settings i={8} d={d} tab={tab} setTab={(k) => { setTab(k); ls.set("tab", k); }} onChange={onChange} onEdit={setEdit} onAdd={addNew} /></div>
      <Editor d={d} M={M} open={edit} newKind={newKind} onClose={() => setEdit(null)}
        onSave={(id, it) => mu.putItem(id, it).then(() => { toast.success("Сохранено"); }).catch((e) => { err(e); throw e; })}
        onDelete={(id) => mu.delItem(id).then(() => { toast.success("Платёж удалён"); }).catch(err)} />
    </div>
  );
}
