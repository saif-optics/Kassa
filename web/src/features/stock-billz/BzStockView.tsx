// «Склад» → остатки Billz по местам (Склад / Сергели / C1) со сравнением выгрузок и перемещения между точками.
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/Card";
import { FilterBar } from "@/components/FilterSheet";
import { RowCards, type RowColumn } from "@/components/RowCards";
import { Segments } from "@/components/Segments";
import { Chip, Tile, TileLabel, TileSub, TileValue } from "@/components/Tile";
import { Switch } from "@/components/ui/switch";
import { useIsPhone } from "@/lib/useMedia";
import type { Data } from "@/lib/types";
import { Dash, Field, FIELD, saveBook, usePaging } from "../report/ui";
import { collectState, bzRefresh } from "../recon/logic";
import { phoneFirst } from "../stock/cols";
import { AUTO, PER, PLACES, dL, dS, dtm, fmt, fq, hasUn, hm, loadTransfers, pl, periodOf, placeRows, sgn, sgq, sortItems, stockData, stockLines, sumBy, type Line, type PlaceRow, type Transfer } from "./logic";

const ls = { get: (k: string, d: string) => { try { return localStorage.getItem("kassa-web.bzs." + k) ?? d; } catch { return d; } }, set: (k: string, v: string) => { try { localStorage.setItem("kassa-web.bzs." + k, v); } catch { /* нет хранилища */ } } };

export type Exp = (() => Promise<void>) | null;
export type Reg = React.MutableRefObject<Exp>;
export const bzView = { get: (): "st" | "tr" => (ls.get("view", "st") === "tr" ? "tr" : "st"), set: (v: string) => ls.set("view", v) };

/** обновление данных Billz: кнопка в шапке раздела и статус последней выгрузки */
export function useBzRefresh(d: Data) {
  const qc = useQueryClient(), [busy, setBusy] = useState(false), cs = collectState(d);
  const refresh = async () => {
    setBusy(true); const r = await bzRefresh(); setBusy(false);
    if (r.ok) toast.success("Данные Billz обновлены"); else toast.error("Billz: не удалось обновить — " + r.error);
    qc.invalidateQueries({ queryKey: ["bz"] }); qc.invalidateQueries({ queryKey: ["kassa-data"] });
  };
  return { busy, cs, refresh };
}

const note = (t: React.ReactNode, bad?: boolean) => <p className={"glass rounded-3xl p-6 " + (bad ? "text-minus" : "text-muted-foreground")}>{t}</p>;

export function BzStock({ reg }: { reg: Reg }) {
  const phone = useIsPhone();
  const [sd, setSd] = useState(""), [cmp, setCmp] = useState(""), [pt, setPtS] = useState(() => ls.get("pt", "all")), [cat, setCat] = useState("all"), [qy, setQ] = useState(""), [only, setOnly] = useState(false);
  const setPt = (v: string) => { setPtS(v); ls.set("pt", v); };
  const q = useQuery({ queryKey: ["bz", "stock", sd, cmp], queryFn: () => stockData(sd, cmp) });
  const D = q.data?.D || null, lines = D ? stockLines(D) : [];
  const s = qy.trim().toLowerCase(), L = lines.filter((l) => (pt === "all" || l.p === pt) && (cat === "all" || l.c === cat) && (!s || (l.n + " " + l.s).toLowerCase().includes(s)));
  const items = sortItems(L, only), pg = usePaging(items.length, "bz-stock", -1, (D?.cur.d || "") + pt + cat + qy + only);
  // выгрузка в Excel — то, что видно в таблице «Товары»
  useEffect(() => { reg.current = D ? async () => { await saveBook("Остатки Billz " + D.cur.d, [["Лист1", items.map((l) => ({ "Место": l.p, "Товар": l.n, "Артикул": l.s, "Категория": l.c, "Цена": l.price, "Было": l.was, "Продано": l.sold, "Пришло": l.tin, "Ушло": l.tout, "Сейчас": l.now, "Расхождение": l.un }))]]); } : null; return () => { reg.current = null; }; });
  let k = 0; const nx = () => Math.min(k++, 8); // сквозной номер посадки сверху вниз
  if (q.isLoading) return note("Загружаю остатки Billz…");
  if (q.error) return note("Не удалось загрузить остатки: " + String((q.error as Error).message || q.error), true);
  if (!D) return note("Остатков Billz ещё нет — нажмите «Обновить из Billz».");
  const cats = [...new Set(lines.map((l) => l.c).filter(Boolean))].sort();
  const Q = sumBy(L, (l) => l.now), V = sumBy(L, (l) => l.now * l.price), C = sumBy(L, (l) => l.now * l.cp), unN = L.filter(hasUn), dl = sumBy(L, (l) => l.delta);
  const cmpTxt = D.cmp ? `с ${dS(D.cmp.d)} ${hm(D.cmp.at)}` : "";
  const places = pt === "all" ? placeRows(lines, cat) : [];
  const fc = (sd ? 1 : 0) + (cmp ? 1 : 0) + (cat !== "all" ? 1 : 0) + (qy ? 1 : 0) + (only ? 1 : 0);
  const summary = [dL(D.cur.d), cat !== "all" ? cat : "", qy, only ? "с движением" : ""].filter(Boolean).join(" · ");

  const placeCols: RowColumn<PlaceRow>[] = [
    { key: "p", title: "Место", main: true, cell: (o) => <>{o.p}{AUTO.has(o.p) && <span className="ml-1.5 align-middle"><Chip tone="info">в Кассе</Chip></span>}</> },
    { key: "pos", title: "Позиций", align: "right", sub: true, cell: (o) => fmt(o.pos) + " поз." },
    { key: "q", title: "Штук", align: "right", cell: (o) => <b>{fmt(o.q)}</b> },
    { key: "v", title: "В розничных ценах", align: "right", cell: (o) => fmt(o.v) },
    { key: "d", title: "Изменение", align: "right", cell: (o) => (D.cmp ? sgq(o.d) : "—") },
    { key: "s", title: "Продано", align: "right", cell: (o) => (D.cmp ? fq(o.s) : "—") },
    { key: "i", title: "Пришло", align: "right", cell: (o) => (D.cmp ? fq(o.i) : "—") },
    { key: "o", title: "Ушло", align: "right", cell: (o) => (D.cmp ? fq(o.o) : "—") },
    { key: "u", title: "Без объяснения", align: "right", cell: (o) => (D.cmp ? (o.un ? <><b className="text-minus">{sgq(o.u)}</b> <span className="text-[12px] text-muted-foreground">{o.un} поз.</span></> : <span className="text-plus">0 ✓</span>) : "—") },
  ];
  const lineCols: RowColumn<Line>[] = [
    { key: "n", title: "Товар", main: true, cell: (l) => <>{l.n}<span className="block text-[12px] font-normal text-muted-foreground">{l.s}</span></> },
    { key: "c", title: "Категория", sub: true, cell: (l) => l.c || null },
    ...(pt === "all" ? [{ key: "p", title: "Место", sub: true, cell: (l: Line) => l.p } as RowColumn<Line>] : []),
    { key: "price", title: "Цена", align: "right", cell: (l) => (l.price > 1 ? fmt(l.price) : "—") },
    { key: "was", title: "Было", align: "right", cell: (l) => (l.was == null ? "—" : fq(l.was)) },
    { key: "sold", title: "Продано", align: "right", cell: (l) => (l.sold ? fq(l.sold) : <Dash />) },
    { key: "tin", title: "Пришло", align: "right", cell: (l) => (l.tin ? <span className="text-plus">+{fq(l.tin)}</span> : <Dash />) },
    { key: "tout", title: "Ушло", align: "right", cell: (l) => (l.tout ? <span className="text-minus">−{fq(l.tout)}</span> : <Dash />) },
    { key: "now", title: "Сейчас", align: "right", cell: (l) => <b>{fq(l.now)}</b> },
    { key: "un", title: "Расхождение", align: "right", sub: true, cell: (l) => (l.un == null ? (phone ? null : "—") : hasUn(l) ? <Chip tone="minus">{sgq(l.un)}</Chip> : phone ? null : <span className="text-plus">✓</span>) },
  ];

  return (
    <>
      <div className="flex flex-col gap-3">
        <Segments aria-label="Место" items={[{ key: "all", label: "Все места" }, ...PLACES.map((p) => ({ key: p, label: p }))]} value={pt} onChange={setPt} />
        <FilterBar summary={summary} count={fc}>
          <Field label="Остатки на"><select className={FIELD} value={D.cur.d} onChange={(e) => { setSd(e.target.value); setCmp(""); }}>{D.dates.slice().reverse().map((x) => <option key={x.d} value={x.d}>{dL(x.d)} · {hm(x.at)}</option>)}</select></Field>
          <Field label="Сравнить с"><select className={FIELD} value={D.cmp && q.data?.cmp ? D.cmp.d : ""} onChange={(e) => setCmp(e.target.value)}>
            <option value="">{D.dates.length > 1 ? "предыдущей выгрузкой" : "—"}</option>{D.dates.filter((x) => x.d < D.cur.d).reverse().map((x) => <option key={x.d} value={x.d}>{dL(x.d)}</option>)}</select></Field>
          <Field label="Категория"><select className={FIELD} value={cat} onChange={(e) => setCat(e.target.value)}><option value="all">Все</option>{cats.map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Поиск" className="sm:w-56"><input className={FIELD} placeholder="Товар или артикул" value={qy} onChange={(e) => setQ(e.target.value)} /></Field>
          <label className="flex h-9 items-center gap-2 text-[13.5px]"><Switch checked={only} onCheckedChange={setOnly} aria-label="Только с движением или расхождением" />Только с движением или расхождением</label>
        </FilterBar>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3.5">
        <Tile i={nx()} hero><TileLabel>{pt === "all" ? "Всего на остатке" : "Остаток · " + pt}</TileLabel><TileValue count={Q} suffix=" шт" /><TileSub>{`${L.filter((l) => l.now).length} позиций · ${dL(D.cur.d)} ${hm(D.cur.at)}`}</TileSub></Tile>
        <Tile i={nx()}><TileLabel>В розничных ценах</TileLabel><TileValue count={V} suffix=" сум" /><TileSub>{C ? `закупка ≈ ${fmt(C)} сум` : "закупочные цены Billz не отдаёт"}</TileSub></Tile>
        <Tile i={nx()}><TileLabel>{"Изменение " + cmpTxt}</TileLabel><TileValue className={D.cmp && dl >= 0 ? "text-plus" : undefined}>{D.cmp ? sgn(dl) + " шт" : "—"}</TileValue>
          <TileSub>{D.cmp ? `продано ${fq(sumBy(L, (l) => l.sold))} · пришло ${fq(sumBy(L, (l) => l.tin))} · ушло ${fq(sumBy(L, (l) => l.tout))}` : "история копится с первой выгрузки"}</TileSub></Tile>
        <Tile i={nx()}><TileLabel>Без объяснения</TileLabel><TileValue className={D.cmp && !unN.length ? "text-plus" : undefined}>{D.cmp ? String(unN.length) : "—"}</TileValue>
          <TileSub>{D.cmp ? (unN.length ? "позиций: изменилось без продажи и перемещения" : "всё объяснено продажами и перемещениями ✓") : ""}</TileSub></Tile>
      </div>
      {pt === "all" && (
        <Card i={nx()} title="По местам" note="нажмите место">
          <p className="text-[12.5px] text-muted-foreground">Было − продано + пришло − ушло = должно быть. Если в Billz другое число — строка отмечена. Продажи берутся из чеков Billz, движение — из перемещений Billz.</p>
          <RowCards columns={phoneFirst(placeCols, "q", phone)} rows={places} rowKey={(o) => o.p} onRowClick={(o) => setPt(o.p)} dense />
        </Card>)}
      <Card i={nx()} title="Товары" note={`${fmt(items.length)} ${pl(items.length, "строка", "строки", "строк")}`}>
        <p className="text-[12.5px] text-muted-foreground">Сначала — с расхождением, затем с движением. Нажмите строку на телефоне, чтобы увидеть детали.</p>
        <RowCards className="max-w-[1400px]" columns={phoneFirst(lineCols, "now", phone)} rows={items.slice(pg.from, pg.to)} rowKey={(l) => l.p + l.s} empty="Нет позиций под фильтр"
          footer={items.length ? <div className="flex flex-wrap items-baseline justify-between gap-x-4 font-semibold"><span>Итого по фильтру</span><span className="num">{fmt(Q)} шт · {fmt(V)} сум</span></div> : undefined} />
        {pg.bar}
      </Card>
    </>
  );
}

export function BzTransfers({ reg }: { reg: Reg }) {
  const phone = useIsPhone();
  const [per, setPerS] = useState(() => ls.get("tper", "month")), [cf, setCf] = useState(""), [ct, setCt] = useState(""), [pt, setPt] = useState("all");
  const [f, t] = per === "all" ? ["2000-01-01", "2999-12-31"] : periodOf(per, cf, ct);
  const q = useQuery({ queryKey: ["bz", "transfers"], queryFn: loadTransfers });
  const L: Transfer[] = (q.data || []).filter((x) => x.d >= f && x.d <= t && (pt === "all" || x.from_point === pt || x.to_point === pt));
  const pg = usePaging(L.length, "bz-transfers", -1, f + t + pt);
  useEffect(() => { reg.current = async () => { const rows: Record<string, unknown>[] = []; L.forEach((x) => (x.items || []).forEach((i) => rows.push({ "Дата": dtm(x.accepted || x.created), "№": x.num, "Откуда": x.from_point, "Куда": x.to_point, "Статус": x.status, "Товар": i.n, "Артикул": i.sku, "Отправлено": i.sent, "Принято": i.arr, "Цена": i.price }))); if (!rows.length) throw new Error("нечего выгружать"); await saveBook("Перемещения Billz", [["Лист1", rows]]); }; return () => { reg.current = null; }; });
  let k = 0; const nx = () => Math.min(k++, 8);
  const sent = L.reduce((a, x) => a + (+(x.sent || 0)), 0), arr = L.reduce((a, x) => a + (+(x.arrived || 0)), 0), way = L.filter((x) => x.status === "в пути"), bad = L.filter((x) => x.status === "принят" && +(x.sent || 0) !== +(x.arrived || 0));
  const periods = [...PER.filter((p) => p[0] !== "today" && p[0] !== "yday"), ["all", "Все"]] as [string, string][];
  const diff = (x: Transfer) => x.status === "принят" && +(x.sent || 0) !== +(x.arrived || 0);
  const cols: RowColumn<Transfer>[] = [
    { key: "r", title: "Откуда → куда", main: true, cell: (x) => <>{x.from_point} → {x.to_point}</> },
    { key: "d", title: "Дата", sub: true, cell: (x) => dtm(x.accepted || x.created) },
    { key: "n", title: "№", sub: true, cell: (x) => "№ " + x.num },
    { key: "st", title: "Статус", sub: true, cell: (x) => (x.status === "принят" ? <span className="text-plus">принят</span> : x.status === "в пути" ? <Chip tone="warn">в пути</Chip> : <span className="text-muted-foreground">черновик</span>) },
    { key: "sent", title: "Отправлено", align: "right", cell: (x) => <b>{fmt(x.sent || 0)}</b> },
    { key: "arr", title: "Принято", align: "right", cell: (x) => (diff(x) ? <b className="text-minus">{fmt(x.arrived || 0)}</b> : fmt(x.arrived || 0)) },
    { key: "ret", title: "В розничных ценах", align: "right", cell: (x) => fmt(x.retail || 0) },
    { key: "by", title: "Кто", cell: (x) => <span className="text-[12.5px] text-muted-foreground">{x.by_name || "—"}</span> },
  ];
  // раскрытое перемещение: товары с отправленным и принятым количеством
  const open = (x: Transfer) => (x.items || []).length ? (
    <ul className="flex flex-col gap-2">
      {(x.items || []).map((i, j) => (
        <li key={j} className="flex items-start justify-between gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0">
          <span className="min-w-0 break-words">{i.n}<span className="block text-[12px] text-muted-foreground">{i.sku}</span></span>
          <span className={"num shrink-0 text-right " + (x.status === "принят" && +(i.sent || 0) !== +(i.arr || 0) ? "text-minus" : "")}>{fq(i.sent)} → {fq(i.arr)}{i.price ? <span className="block text-[12px] text-muted-foreground">{fmt(i.price)}</span> : null}</span>
        </li>))}
    </ul>) : <p className="text-muted-foreground">Товаров нет</p>;

  return (
    <>
      <div className="flex flex-col gap-3">
        <Segments aria-label="Период" items={periods.map(([key, label]) => ({ key, label }))} value={per} onChange={(v) => { if (v === "custom") { setCf(f); setCt(t); } setPerS(v); ls.set("tper", v); }} />
        <FilterBar summary={`${dS(f)} — ${dS(t)}${pt !== "all" ? " · " + pt : ""}`} count={pt !== "all" ? 1 : 0}>
          {per === "custom" && <><Field label="С"><input type="date" className={FIELD} value={f} max={t} onChange={(e) => setCf(e.target.value)} /></Field><Field label="По"><input type="date" className={FIELD} value={t} min={f} onChange={(e) => setCt(e.target.value)} /></Field></>}
          <Field label="Место"><select className={FIELD} value={pt} onChange={(e) => setPt(e.target.value)}><option value="all">Все места</option>{PLACES.map((p) => <option key={p}>{p}</option>)}</select></Field>
        </FilterBar>
      </div>
      {q.isLoading ? note("Загружаю перемещения…") : q.error ? note("Не удалось загрузить перемещения: " + String((q.error as Error).message || q.error), true) : <>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3.5">
          <Tile i={nx()} hero><TileLabel>Перемещений</TileLabel><TileValue count={L.length} /><TileSub>{`${dS(f)} — ${dS(t)}`}</TileSub></Tile>
          <Tile i={nx()}><TileLabel>Отправлено</TileLabel><TileValue count={sent} suffix=" шт" /><TileSub>{`принято ${fmt(arr)} шт`}</TileSub></Tile>
          <Tile i={nx()}><TileLabel>В пути</TileLabel><TileValue count={way.length} /><TileSub>{way.length ? "ещё не приняты на точке" : "всё принято"}</TileSub></Tile>
          <Tile i={nx()}><TileLabel>С расхождением</TileLabel><TileValue count={bad.length} className={bad.length ? undefined : "text-plus"} /><TileSub>{bad.length ? "принято не столько, сколько отправлено" : "отправлено = принято ✓"}</TileSub></Tile>
        </div>
        <Card i={nx()} title="Перемещения между точками" note="нажмите строку">
          <p className="text-[12.5px] text-muted-foreground">Из Billz, обновляются каждый день. Нажмите строку, чтобы увидеть товары.</p>
          <RowCards columns={phoneFirst(cols, "sent", phone)} rows={L.slice(pg.from, pg.to)} rowKey={(x) => x.id} expand={open} empty="Перемещений за период нет" />
          {pg.bar}
        </Card></>}
    </>
  );
}
