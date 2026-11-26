// Раздел «Сверка»: чеки Billz против записей Кассы по дням и точкам; фискальные модули против Кассы; блок автозагрузки Billz.
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileSpreadsheet, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import { PageHead } from "@/components/PageHead";
import { RowCards, type RowColumn } from "@/components/RowCards";
import { Segments } from "@/components/Segments";
import { Chip, Tile, TileLabel, TileSub, TileValue } from "@/components/Tile";
import { cn } from "@/lib/utils";
import { useIsPhone } from "@/lib/useMedia";
import type { Data } from "@/lib/types";
import { Field, FIELD, saveBook, usePaging } from "../report/ui";
import { Banner } from "./Banner";
import { BillzPanel } from "./BillzPanel";
import { Controls, useFilters, type Filters } from "./Controls";
import { FmRecon, fmRcExport } from "./FmRecon";
import { Dot, dash, ord } from "./parts";
import { AUTO, POINTS, bzQty, bzRefresh, bzSum, collectState, dL, dS, dayTable, dtm, flatItems, fmt, fq, hm, isLens, isRet, kSum, kassaRows, loadChecks, matchDay, pl, sgn, sgq, wd, type BzCheck, type DayRow, type KSale } from "./logic";

const HEAD = {
  bz: ["Saif-Optics · Billz и Касса", "Что, когда и в каком количестве продано по Billz — и сходится ли это с Кассой"],
  fm: ["Saif-Optics · фискальные модули и Касса", "Сколько нала и безнала пробито через фискальные модули — и сходится ли это с продажами Кассы"],
} as const;
const ls = { get: (k: string, d: string) => { try { return localStorage.getItem("kassa-web.recon." + k) ?? d; } catch { return d; } }, set: (k: string, v: string) => { try { localStorage.setItem("kassa-web.recon." + k, v); } catch { /* нет хранилища */ } } };

export function ReconPage({ d }: { d: Data }) {
  const [view, setView] = useState<"bz" | "fm">(() => (ls.get("view", "bz") === "fm" ? "fm" : "bz"));
  const bz = useFilters("bz"), fm = useFilters("fm"), qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const pick = (v: "bz" | "fm") => { setView(v); ls.set("view", v); };
  const refresh = async () => {
    setBusy(true); const r = await bzRefresh(); setBusy(false);
    if (r.ok) toast.success("Данные Billz обновлены"); else toast.error("Billz: не удалось обновить — " + r.error);
    qc.invalidateQueries({ queryKey: ["bz"] }); qc.invalidateQueries({ queryKey: ["kassa-data"] });
  };
  const xlsx = async () => {
    try {
      if (view === "fm") { await fmRcExport(d, fm); toast.success("Файл скачан"); return; }
      const ch = await loadChecks(bz.f, bz.t), pc = ch.filter((c) => bz.pt === "all" || c.point === bz.pt), ks = kassaRows(d, bz.f, bz.t).filter((s) => bz.pt === "all" || s.point === bz.pt);
      await saveBook(`Сверка ${bz.f}—${bz.t}`, [
        ["По дням", dayTable(pc, ks).map((o) => ({ "День": o.d, "Точка": o.p, "Billz чеков": o.bn, "Billz шт": o.bq, "Billz сумма": o.bs, "Касса шт": o.nodet ? null : o.kq, "Касса сумма": o.ks, "Разница сумма": o.ds, "Сходится": o.ok ? "да" : "нет" }))],
        ["Что продалось", flatItems(pc).map((i) => ({ "Когда": dtm(i.t), "Точка": i.p, "Чек": i.num, "Товар": i.n, "Артикул": i.sku, "Категория": i.c, "Кол-во": i.q, "Сумма": i.sum, "Продавец": i.seller }))],
      ]);
      toast.success("Файл скачан");
    } catch (e) { toast.error("Не удалось выгрузить: " + String(e)); }
  };
  return (
    <div className="flex flex-col gap-3.5">
      <PageHead eyebrow={HEAD[view][0]} title="Сверка" sub={HEAD[view][1]} actions={<>
        <Button variant="secondary" size="lg" onClick={xlsx}><FileSpreadsheet />Выгрузить Excel</Button>
        {view === "bz" && <Button size="lg" disabled={busy} onClick={refresh}><RefreshCw className={cn(busy && "animate-spin")} />{busy ? "Загружаю из Billz…" : "Обновить из Billz"}</Button>}
      </>} />
      <Banner>Полностью заработает после инвентаризации Премиума и Яшнабада. Сейчас сверяются только Сергели и C1 — их продажи приходят из Billz.</Banner>
      <Segments aria-label="Сверка" items={[{ key: "bz", label: "Billz ↔ Касса" }, { key: "fm", label: "Фискальные модули ↔ Касса" }]} value={view} onChange={(v) => pick(v as "bz" | "fm")} />
      {view === "fm" ? <FmRecon d={d} F={fm} /> : <>
        <CollectState d={d} />
        <BzRecon d={d} F={bz} />
        <BillzPanel d={d} i={7} />
      </>}
    </div>
  );
}

function CollectState({ d }: { d: Data }) {
  const s = collectState(d);
  return <div className="flex flex-wrap items-center gap-2"><Chip tone={s.cls === "err" ? "minus" : s.cls === "ok" ? "plus" : "muted"}>{s.t}</Chip>{s.last && <span className="text-[12.5px] text-muted-foreground">{s.last}</span>}</div>;
}

const iv = { get: (): "list" | "prod" => { try { return localStorage.getItem("kassa-web.recon.iview") === "prod" ? "prod" : "list"; } catch { return "list"; } }, set: (v: string) => { try { localStorage.setItem("kassa-web.recon.iview", v); } catch { /* нет хранилища */ } } };

function BzRecon({ d, F }: { d: Data; F: Filters }) {
  const q = useQuery({ queryKey: ["bz", "checks", F.f, F.t], queryFn: () => loadChecks(F.f, F.t) });
  const ctl = <Controls F={F} points={POINTS} />;
  if (q.isLoading) return <>{ctl}<Card title="Загружаю чеки Billz…"><p className="text-[13.5px] text-muted-foreground">Подождите несколько секунд.</p></Card></>;
  if (q.error) return <>{ctl}<Card title="Не удалось загрузить данные Billz"><p className="text-[13.5px] text-minus">{String((q.error as Error).message || q.error)}</p></Card></>;
  const ch = (q.data || []).filter((c) => POINTS.includes(c.point) && (F.pt === "all" || c.point === F.pt));
  const ks = kassaRows(d, F.f, F.t).filter((s) => F.pt === "all" || s.point === F.pt);
  const days = dayTable(ch, ks), bad = days.filter((x) => !x.ok), list = F.only ? bad : days;
  const B = { n: ch.length, q: ch.reduce((a, c) => a + bzQty(c), 0), s: ch.reduce((a, c) => a + bzSum(c), 0) };
  const K = { q: ks.reduce((a, s) => a + (+(s.qty || 0)), 0), s: ks.reduce((a, s) => a + kSum(s), 0), nodet: ks.some((s) => s.cat === "Без детализации") };
  const diff = K.s - B.s, same = Math.abs(diff) < 1;
  let k = 0; const nx = () => Math.min(k++, 8); // сквозной номер посадки сверху вниз
  return (
    <>
      {ctl}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3.5">
        <Tile i={nx()} hero><TileLabel>Billz · продано</TileLabel><TileValue count={B.s} suffix=" сум" /><TileSub>{`${B.n} ${pl(B.n, "чек", "чека", "чеков")} · ${fq(B.q)} шт`}</TileSub></Tile>
        <Tile i={nx()}><TileLabel>Касса · записано</TileLabel><TileValue count={K.s} suffix=" сум" /><TileSub>{`${fq(K.q)} шт${K.nodet ? " · есть дни без детализации" : ""}`}</TileSub></Tile>
        <Tile i={nx()}><TileLabel>Разница</TileLabel><TileValue>{sgn(diff) + " сум"}</TileValue><TileSub><Chip tone={same ? "plus" : "minus"}>{same ? "сходится" : "расхождение"}</Chip>Касса минус Billz</TileSub></Tile>
        <Tile i={nx()}><TileLabel>Дни с расхождением</TileLabel><TileValue count={bad.length} /><TileSub>{bad.length ? <Chip tone="minus">смотрите в таблице</Chip> : <Chip tone="plus">всё сходится</Chip>}</TileSub></Tile>
      </div>
      <DaysTable i={nx()} list={list} ch={ch} ks={ks} only={F.only} reset={F.f + F.t + F.pt + F.only} />
      <Items i={nx()} ch={ch} reset={F.f + F.t + F.pt} />
    </>
  );
}

const stChip = (o: DayRow) => o.ok ? <Chip tone="plus">сходится</Chip> : !o.bn ? <Chip tone="warn">нет в Billz</Chip> : !o.kn ? <Chip tone="warn">нет в Кассе</Chip> : <Chip tone="minus">≠</Chip>;

function DaysTable({ i, list, ch, ks, only, reset }: { i: number; list: DayRow[]; ch: BzCheck[]; ks: KSale[]; only: boolean; reset: string }) {
  const phone = useIsPhone(), pg = usePaging(list.length, "recon-days", -1, reset);
  const tn = (o: DayRow) => (o.ok ? undefined : !o.bn || !o.kn ? ("warn" as const) : ("minus" as const));
  const cols: RowColumn<DayRow>[] = [
    { key: "d", title: "День", main: true, cell: (o) => <><Dot tone={tn(o)} />{dS(o.d)} <span className="ml-1 text-[12px] font-normal text-muted-foreground">{wd(o.d)}</span></> },
    { key: "p", title: "Точка", sub: true, cell: (o) => <>{o.p}{AUTO.has(o.p) && <span className="ml-1.5 rounded bg-primary/12 px-1.5 py-0.5 text-[10.5px] font-semibold text-primary">авто</span>}</> },
    { key: "bn", title: "Billz чеков", align: "right", cell: (o) => o.bn || dash },
    { key: "bq", title: "Billz шт", align: "right", cell: (o) => (o.bn ? fq(o.bq) : dash) },
    { key: "bs", title: "Billz сумма", align: "right", cell: (o) => (o.bn ? fmt(o.bs) : dash) },
    { key: "kq", title: "Касса шт", align: "right", cell: (o) => (o.kn ? (o.nodet ? <span title="есть строки без детализации">{dash}</span> : fq(o.kq)) : dash) },
    { key: "ks", title: "Касса сумма", align: "right", cell: (o) => (o.kn ? <>{fmt(o.ks)}{o.debt ? <><br /><span className="text-[12px] text-muted-foreground">в т.ч. долг {fmt(o.debt)}</span></> : null}</> : dash) },
    { key: "dq", title: "Разница шт", align: "right", cell: (o) => (o.dq == null ? dash : Math.abs(o.dq) < 0.01 ? "0" : <b className="text-minus">{sgq(o.dq)}</b>) },
    { key: "ds", title: "Разница сумма", align: "right", cell: (o) => (Math.abs(o.ds) < 1 ? "0" : <Chip tone="minus">{sgn(o.ds)}</Chip>) },
    { key: "st", title: "", sub: true, cell: stChip },
  ];
  const T = list.reduce((a, o) => ({ bs: a.bs + o.bs, ks: a.ks + o.ks, ds: a.ds + o.ds }), { bs: 0, ks: 0, ds: 0 });
  return (
    <Card i={i} title="По дням и точкам" note="нажмите строку">
      <p className="text-[12.5px] text-muted-foreground">Красная точка — суммы не совпали, оранжевая — продажи есть только в одной системе. Нажмите строку, чтобы увидеть чеки Billz и записи Кассы за этот день. В Кассе продажи считаются вместе с отмеченными долгами, погашения долгов не входят. Линзы считаются парами.</p>
      <RowCards className="max-w-[1400px]" columns={ord(cols, "ds", phone)} rows={list.slice(pg.from, pg.to)} rowKey={(o) => o.d + "|" + o.p} rowClass={(o) => (o.ok ? undefined : "bg-minus-soft/40")} empty={only ? "Расхождений нет" : "Продаж за период нет"}
        expand={(o) => <Detail ch={ch.filter((c) => c.d === o.d && c.point === o.p)} ks={ks.filter((s) => s.date === o.d && s.point === o.p)} d={o.d} p={o.p} />}
        footer={list.length ? <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-semibold"><span>Итого за период</span>
          <span className="num flex flex-wrap gap-x-4"><span><span className="font-normal text-muted-foreground">Billz </span>{fmt(T.bs)}</span><span><span className="font-normal text-muted-foreground">Касса </span>{fmt(T.ks)}</span><span><span className="font-normal text-muted-foreground">Разница </span>{sgn(T.ds)}</span></span></div> : undefined} />
      {pg.bar}
    </Card>
  );
}

function Detail({ ch, ks, d, p }: { ch: BzCheck[]; ks: KSale[]; d: string; p: string }) {
  const { G, B } = matchDay(ch, ks);
  const items = (c: BzCheck) => (c.items || []).filter((i) => !i.ret || isRet(c.type)).map((i, k) => {
    const q = isLens(i.c) ? ((+(i.q || 0)) || +(i.rq || 0)) / 2 : (+(i.q || 0)) || +(i.rq || 0);
    return <div key={k} className="text-left">{i.n} <span className="text-[12px] text-muted-foreground">{i.sku}</span> × {fq(q)}{isLens(i.c) ? " пар" : ""} — {fmt(i.sum || 0)}{i.disc ? <span className="text-[12px] text-muted-foreground"> (скидка {fmt(i.disc)})</span> : null}</div>;
  });
  type BR = (typeof B)[number] & { k: string };
  type GR = (typeof G)[number];
  const bc: RowColumn<BR>[] = [
    { key: "t", title: "Время", main: true, cell: (b) => <><Dot tone={b.m ? undefined : "minus"} />{hm(b.c.t)}</> },
    { key: "n", title: "Чек", sub: true, cell: (b) => <>№ {String(b.c.num).slice(-3)}{b.c.type ? " · " + b.c.type : ""}</> },
    { key: "i", title: "Товары", cell: (b) => <div className="flex flex-col gap-0.5">{items(b.c)}</div> },
    { key: "s", title: "Сумма", align: "right", cell: (b) => <><b>{fmt(b.sum)}</b>{+(b.c.debt || 0) ? <><br /><span className="text-minus">долг {fmt(b.c.debt || 0)}</span></> : null}</> },
    { key: "pay", title: "Оплата", cell: (b) => <span className="text-[12.5px] text-muted-foreground">{(b.c.pays || []).map((x, k) => <div key={k}>{x.n} {fmt(x.s)}</div>)}</span> },
    { key: "st", title: "", sub: true, cell: (b) => (b.m ? <Chip tone="plus">есть в Кассе</Chip> : <Chip tone="minus">нет в Кассе</Chip>) },
  ];
  const gc: RowColumn<GR>[] = [
    { key: "c", title: "Чек", main: true, cell: (g) => <><Dot tone={g.m ? undefined : "minus"} />№ {g.check || "—"}</> },
    { key: "r", title: "Записи", cell: (g) => <div className="flex flex-col gap-0.5">{g.rows.map((s, i) => <div key={i} className="text-left">{s.product || s.cat} × {fq(s.qty)} — {fmt(kSum(s))}{+(s.debt || 0) ? <span className="text-minus"> (долг {fmt(s.debt || 0)})</span> : null}<span className="text-[12px] text-muted-foreground"> · {s.pay || ""}</span></div>)}</div> },
    { key: "s", title: "Сумма", align: "right", cell: (g) => <b>{fmt(g.sum)}</b> },
    { key: "st", title: "", sub: true, cell: (g) => (g.m ? <Chip tone="plus">есть в Billz</Chip> : <Chip tone="minus">нет в Billz</Chip>) },
  ];
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="grid min-w-0 gap-4">
        <div className="min-w-0"><h3 className="mb-1 text-[14.5px] font-semibold">Billz · {p} · {dL(d)}</h3>
          <RowCards dense columns={bc} rows={B.map((b, j) => ({ ...b, k: String(j) }))} rowKey={(b) => b.k} empty="Чеков в Billz нет" /></div>
        <div className="min-w-0"><h3 className="mb-1 text-[14.5px] font-semibold">Касса · {p} · {dL(d)}</h3>
          <RowCards dense columns={gc} rows={G} rowKey={(g) => g.k} empty="Записей в Кассе нет" /></div>
      </div>
      <p className="text-[12.5px] text-muted-foreground">Чеки сопоставляются по номеру из Billz (для автозагрузки), иначе по одинаковой сумме. Красным — то, чему не нашлась пара.</p>
    </div>
  );
}

type Flat = ReturnType<typeof flatItems>[number] & { k: string };
type Prod = { n: string; sku: string; c?: string; q: number; s: number; pts: Record<string, number>; last: string; k: string };

function Items({ i, ch, reset }: { i: number; ch: BzCheck[]; reset: string }) {
  const phone = useIsPhone();
  const [view, setV] = useState<"list" | "prod">(iv.get), [qy, setQ] = useState("");
  const all = flatItems(ch), s = qy.trim().toLowerCase(), L = all.filter((x) => !s || (x.n + " " + x.sku).toLowerCase().includes(s));
  const prod = (() => {
    const m = new Map<string, Prod>();
    L.forEach((x) => { const k = x.sku || x.n; let o = m.get(k); if (!o) m.set(k, (o = { n: x.n, sku: x.sku, c: x.c, q: 0, s: 0, pts: {}, last: "", k })); o.q += x.q; o.s += x.sum; o.pts[x.p] = (o.pts[x.p] || 0) + x.q; if (!o.last || x.t > o.last) o.last = x.t; });
    return [...m.values()].sort((a, b) => b.q - a.q || b.s - a.s);
  })();
  const flat: Flat[] = L.slice().sort((a, b) => String(b.t).localeCompare(String(a.t))).map((x, j) => ({ ...x, k: String(j) }));
  const total = view === "prod" ? prod.length : flat.length;
  const pg = usePaging(total, "recon-items-" + view, -1, reset + qy);
  const pc: RowColumn<Prod>[] = [
    { key: "n", title: "Товар", main: true, cell: (o) => o.n },
    { key: "sku", title: "Артикул", sub: true, cell: (o) => o.sku },
    { key: "c", title: "Категория", cell: (o) => <span className="text-[12.5px] text-muted-foreground">{o.c}</span> },
    ...POINTS.map((p): RowColumn<Prod> => ({ key: "p" + p, title: p, align: "right", cell: (o) => (o.pts[p] ? fq(o.pts[p]) : dash) })),
    { key: "q", title: "Всего, шт", align: "right", cell: (o) => <b>{fq(o.q)}</b> },
    { key: "s", title: "Сумма", align: "right", cell: (o) => fmt(o.s) },
    { key: "l", title: "Последняя продажа", align: "right", cell: (o) => dtm(o.last) },
  ];
  const lc: RowColumn<Flat>[] = [
    { key: "t", title: "Когда", sub: true, cell: (x) => dtm(x.t) },
    { key: "p", title: "Точка", sub: true, cell: (x) => x.p },
    { key: "num", title: "Чек", cell: (x) => <>{String(x.num).slice(-3)}{isRet(x.type) && <span className="ml-1 text-minus">возврат</span>}</> },
    { key: "n", title: "Товар", main: true, cell: (x) => <>{x.n}<br /><span className="text-[12px] font-normal text-muted-foreground">{x.sku} · {x.c}</span></> },
    { key: "q", title: "Кол-во", align: "right", cell: (x) => fq(x.q) },
    { key: "s", title: "Сумма", align: "right", cell: (x) => fmt(x.sum) },
    { key: "sl", title: "Продавец", cell: (x) => <span className="text-[12.5px] text-muted-foreground">{x.seller || ""}</span> },
  ];
  return (
    <Card i={i} title="Что продалось по Billz" note={view === "prod" ? `${prod.length} ${pl(prod.length, "товар", "товара", "товаров")}` : `${flat.length} ${pl(flat.length, "строка", "строки", "строк")}`}>
      <p className="text-[12.5px] text-muted-foreground">{view === "prod" ? `${fq(L.reduce((a, x) => a + x.q, 0))} шт по товарам (линзы — в штуках линз)` : "Строки из чеков Billz за период."}</p>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Segments aria-label="Вид" items={[{ key: "list", label: "По чекам" }, { key: "prod", label: "По товарам" }]} value={view} onChange={(v) => { setV(v as "list" | "prod"); iv.set(v); }} />
        <Field label="Поиск" className="w-full sm:w-52"><input className={FIELD} placeholder="Товар или артикул" value={qy} onChange={(e) => setQ(e.target.value)} /></Field>
      </div>
      {view === "prod"
        ? <RowCards dense columns={ord(pc, "q", phone)} rows={prod.slice(pg.from, pg.to)} rowKey={(o) => o.k} empty="Нет продаж" />
        : <RowCards dense columns={ord(lc, "s", phone)} rows={flat.slice(pg.from, pg.to)} rowKey={(x) => x.k} empty="Нет продаж" />}
      {pg.bar}
    </Card>
  );
}
