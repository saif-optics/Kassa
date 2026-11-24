// Раздел «Продажи»: плитки, календарь, касса дня по точкам, ввод продаж и расходов, статистика, журнал, выгрузка.
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { Data } from "@/lib/types";
import { useMutations } from "@/lib/useData";
import { PageHead } from "@/components/PageHead";
import { Chip, Tile, TileLabel, TileSub, TileValue } from "@/components/Tile";
import { SalesFilter, useSalesFilter } from "./filter";
import { Calendar } from "./Calendar";
import { DayCash } from "./DayCash";
import { Debts } from "./DebtsPanel";
import { SaleForm, type SaleRec } from "./SaleForm";
import { ExpenseBox } from "./ExpenseBox";
import { Stats } from "./Stats";
import { Journal } from "./Journal";
import { Photos, SettingsBox } from "./Extras";
import { downloadCsv, downloadXlsx } from "./files";
import { agg, cmpText, csvOf, ctxOf, dayCashRows, expFiltered, expVal, filtered, fmt, fname, lowerFirst, newId, prevList, sheetsOf, type SaleX, type Settings } from "./logic";

/** дельта к прошлому периоду: рост и падение — пилюлями, остальное — обычным текстом */
function Cmp({ cur, prev }: { cur: number; prev: number | null | undefined }) {
  const t = cmpText(cur, prev);
  if (t.kind === "up") return <Chip tone="plus">{t.text}</Chip>;
  if (t.kind === "down") return <Chip tone="minus">{t.text}</Chip>;
  return <span>{t.text || " "}</span>;
}

export function SalesPage({ d }: { d: Data }) {
  const mu = useMutations(), { F } = useSalesFilter();
  const c = useMemo(() => ctxOf(d), [d]);
  const list = useMemo(() => filtered(c, F), [c, F]);
  const ex = useMemo(() => expFiltered(c, F), [c, F]);
  const a = agg(list), pv = prevList(c, F), pa = pv ? agg(pv.list) : null;
  const expSum = ex.reduce((x, e) => x + expVal(e), 0);
  const rows = useMemo(() => dayCashRows(list, ex, c.settings.points), [list, ex, c.settings.points]);

  const [jDay, setJDay] = useState(""), [editing, setEditing] = useState<SaleX | null>(null), [xmsg, setXmsg] = useState<{ t: string; bad?: boolean } | null>(null);
  const jRef = useRef<HTMLDivElement>(null);
  const resetKey = `${F.from}|${F.to}|${F.point}`;
  useEffect(() => setJDay(""), [resetKey]);
  const say = (t: string, bad?: boolean, ms = 5000) => { setXmsg({ t, bad }); if (t) setTimeout(() => setXmsg((m) => (m && m.t === t ? null : m)), ms); };

  const save = async (id: string | null, rec: SaleRec) => {
    const old = id ? c.sales.find((s) => s.id === id) : null, data: Record<string, unknown> = { ...(old || {}), ...rec }; delete data.id;
    setJDay(String(rec.date));
    await mu.putDoc("sales", id || newId(), data);
    if (id) setEditing(null);
  };
  const remove = (id: string) => { if (editing?.id === id) setEditing(null); mu.delDoc("sales", id).catch(() => say("Не удалось удалить.", true)); };
  const addExp = async (v: { date: string; point: string; name: string; amount: number }) => {
    await mu.putEntry(newId(), { type: "exp", name: `${v.point} за ${lowerFirst(v.name)}`, amount: v.amount, cat: "op", branch: v.point, date: v.date, source: "day", createdAt: Date.now() });
  };
  const csv = () => { const r = csvOf(c, F); if (!r.n) return say("Нет данных за выбранный период.", true); downloadCsv(r.text, fname(c, F, "prodazhi", "csv")); say("Файл сохранён"); };
  const xlsx = async () => {
    if (!list.length) return say("Нет данных за выбранный период.", true);
    say("Готовлю файл…", false, 60000);
    try { const name = fname(c, F, "prodazhi", "xlsx"); await downloadXlsx(sheetsOf(c, F), name); say("Файл сохранён: " + name); } catch { say("Не удалось выгрузить файл.", true); }
  };
  const saveSettings = async (v: Settings) => { await mu.putDoc("settings", "sales", v); toast.success("Настройки сохранены"); };
  const openDay = (day: string) => { setJDay(day); requestAnimationFrame(() => jRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })); };

  // сквозной номер посадки сверху вниз
  let k = 0; const nx = () => k++;
  return (
    <div className="flex flex-col gap-3.5">
      <PageHead eyebrow="Saif-Optics · Премиум · Яшнабад · Сергели · C1" title="Продажи" sub="Выручка, чеки и касса по дням и точкам"
        actions={<Chip tone="info" className="self-center">Сохраняется автоматически</Chip>} />
      <SalesFilter d={d} i={nx()} />
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <Tile i={nx()} hero><TileLabel>Выручка</TileLabel><TileValue count={a.rev} suffix=" сум" /><TileSub><Cmp cur={a.rev} prev={pa && pa.rev} /></TileSub></Tile>
        <Tile i={nx()}><TileLabel>Чеков / позиций</TileLabel><TileValue>{fmt(a.checks)} / {fmt(a.n)}</TileValue><TileSub><Cmp cur={a.checks} prev={pa && pa.checks} /></TileSub></Tile>
        <Tile i={nx()}><TileLabel>Средний чек</TileLabel><TileValue count={a.avg} suffix=" сум" /><TileSub><Cmp cur={a.avg} prev={pa && pa.avg} /></TileSub></Tile>
        <Tile i={nx()}><TileLabel>Б/Ч − расходы дня</TileLabel><TileValue count={a.cash - expSum} suffix=" сум" /><TileSub>наличные {fmt(a.cash)} · расходы {fmt(expSum)}</TileSub></Tile>
      </div>
      <Calendar c={c} F={F} jDay={jDay} onOpenDay={openDay} i={nx()} />
      <DayCash rows={rows} points={c.settings.points} F={F} i={nx()} />
      <Debts sales={c.sales} F={F} i={nx()} />
      <div className="grid gap-3.5 xl:grid-cols-2">
        <SaleForm sales={c.sales} settings={c.settings} editing={editing} onSave={save} onCancel={() => setEditing(null)} i={nx()} />
        <ExpenseBox exp={ex} settings={c.settings} onAdd={addExp} onDelete={(id) => mu.delEntry(id)} i={nx()} />
      </div>
      <Stats c={c} F={F} list={list} resetKey={resetKey} i={nx()} />
      <div ref={jRef} className="scroll-mt-4"><Journal c={c} F={F} list={list} jDay={jDay} setJDay={setJDay} editingId={editing?.id || null} onEdit={setEditing} onDelete={remove} onCsv={csv} onXlsx={xlsx} msg={xmsg} i={nx()} /></div>
      <Photos rows={d.rows.photos || {}} sales={c.sales} i={nx()} />
      <SettingsBox key={c.settings.points.join() + c.settings.cats.join() + c.settings.plan} settings={c.settings} onSave={saveSettings} i={nx()} />
    </div>
  );
}
