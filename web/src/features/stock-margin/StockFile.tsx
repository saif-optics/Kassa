// «Склад из файла»: остатки по местам, группы, товары и загрузка файла склада в коллекцию stock (как на рабочем сайте).
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/Card";
import { FilterBar } from "@/components/FilterSheet";
import { RowCards, type RowColumn } from "@/components/RowCards";
import { Segments } from "@/components/Segments";
import { Tile, TileLabel, TileSub, TileValue } from "@/components/Tile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMutations } from "@/lib/useData";
import { useIsPhone } from "@/lib/useMedia";
import type { BItem, Ctx } from "../analytics/cost";
import { dShort, fmt, pctF, today } from "../analytics/util";
import { Field, FIELD } from "../report/ui";
import { phoneFirst } from "../stock/cols";
import { mergeStock, parseSheet, stockSearch, stockView } from "./logic";

const SHOW = 50, MORE = 100;
type Pending = { items: BItem[]; raw: number; file: string; sheet: string };
const dim = <span className="text-muted-foreground">—</span>;
const money = (a?: number) => (+(a || 0) ? fmt(a as number) : "—");

/** pick — сюда кладётся функция «выбрать файл»: её вызывает кнопка в шапке раздела */
export function StockFile({ c, pick }: { c: Ctx; pick: React.MutableRefObject<(() => void) | null> }) {
  const phone = useIsPhone();
  const mu = useMutations();
  const [place, setPlace] = useState("all"), [q, setQ] = useState(""), [lim, setLim] = useState(SHOW);
  const [pend, setPend] = useState<Pending | null>(null), [date, setDate] = useState(today()), [busy, setBusy] = useState(false), [msg, setMsg] = useState<{ t: string; bad?: boolean }>({ t: "" });
  const file = useRef<HTMLInputElement>(null);
  const has = c.stockItems.length > 0;
  const pl0 = place !== "all" && has && !c.stockItems.some((i) => (i.pt || "Без места") === place) ? "all" : place;
  const v = useMemo(() => (has ? stockView(c, pl0) : null), [c, pl0, has]);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    try {
      const X = await import("xlsx"), wb = X.read(await f.arrayBuffer(), { type: "array" });
      let best: { items: BItem[]; err?: string; sheet: string } | null = null;
      wb.SheetNames.forEach((n) => { const r = parseSheet(X as never, wb.Sheets[n], { zero: true }); if (!best || r.items.length > best.items.length) best = Object.assign(r, { sheet: n }); });
      const b = best as { items: BItem[]; err?: string; sheet: string } | null;
      if (!b || !b.items.length) { setMsg({ t: b && b.err ? b.err : "В файле не нашлось товаров.", bad: true }); setPend(null); return; }
      setPend({ items: mergeStock(b.items), raw: b.items.length, file: f.name, sheet: b.sheet }); setMsg({ t: "" });
    } catch { setMsg({ t: "Не удалось прочитать файл. Сохраните его как .xlsx и попробуйте снова.", bad: true }); }
  };
  const save = async () => {
    if (!pend) return; setBusy(true);
    const up = Date.now(), N = 400, parts = Math.ceil(pend.items.length / N), ids: string[] = [];
    try {
      for (let i = 0; i < parts; i++) { const id = "p" + i; ids.push(id); await mu.putDoc("stock", id, { part: i, parts, file: pend.file, date: date || today(), uploadedAt: up, total: pend.items.length, items: pend.items.slice(i * N, (i + 1) * N) }); }
      for (const o of c.stockParts) if (!ids.includes(o.id)) { try { await mu.delDoc("stock", o.id); } catch { /* старая часть не критична */ } }
      setMsg({ t: `Склад сохранён: ${fmt(pend.items.length)} позиций.` }); setPend(null); toast.success("Склад сохранён");
    } catch { setMsg({ t: "Не удалось сохранить склад. Попробуйте ещё раз.", bad: true }); } finally { setBusy(false); }
  };

  pick.current = () => file.current?.click();
  let k = 0; const nx = () => Math.min(k++, 8); // сквозной номер посадки сверху вниз

  const pendCols: RowColumn<BItem>[] = [
    { key: "n", title: "Модель / наименование", main: true, cell: (i) => i.m || i.n || i.s },
    { key: "g", title: "Группа", sub: true, cell: (i) => i.g || i.c || null },
    { key: "q", title: "Кол-во", align: "right", cell: (i) => fmt(+i.q || 0) },
    { key: "s", title: "Артикул", cell: (i) => i.s || "—" },
    { key: "cp", title: "Цена покупки", align: "right", cell: (i) => money(i.cp) },
    { key: "p", title: "Цена продажи", align: "right", cell: (i) => money(i.p) },
  ];
  const importPanel = (
    <Card i={nx()} title="Загрузить склад" note="Excel или CSV">
      <p className="text-[12.5px] text-muted-foreground">Например, выгрузка из Billz: модель или артикул, наименование, группа или категория, количество, цена покупки, цена продажи. Столбцы найдутся по названиям. Если есть столбец «Место» (склад или точка), остатки разделятся по местам. Новая загрузка заменяет предыдущую.</p>
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Дата остатков" className="w-full sm:w-44"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <input ref={file} type="file" hidden accept=".xlsx,.xls,.xlsm,.csv" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
        <Button variant="secondary" size="lg" className="max-sm:w-full" onClick={() => file.current?.click()}>Выбрать файл</Button>
      </div>
      {pend && (
        <div className="flex flex-col gap-3">
          <p className="text-[13px] text-muted-foreground">Файл «{pend.file}», лист «{pend.sheet}»: <b className="text-foreground">{fmt(pend.items.length)} позиций, {fmt(pend.items.reduce((a, i) => a + (+i.q || 0), 0))} шт</b>{pend.raw > pend.items.length ? ` (${fmt(pend.raw)} строк, повторы по точкам сложены)` : ""}. Цена покупки есть у {fmt(pend.items.filter((i) => +(i.cp || 0) > 0).length)} позиций. Первые 6:</p>
          <RowCards columns={phoneFirst(pendCols, "q", phone)} rows={pend.items.slice(0, 6)} rowKey={(i) => String(i.k)} dense />
          <div className="flex gap-2"><Button onClick={save} disabled={busy}>Сохранить склад</Button><Button variant="secondary" onClick={() => { setPend(null); setMsg({ t: "" }); }}>Отмена</Button></div>
        </div>
      )}
      {msg.t && <p role="status" className={cn("text-[13px]", msg.bad ? "text-minus" : "text-plus")}>{msg.t}</p>}
    </Card>
  );

  if (!v) return <><Card i={nx()} title="Склад ещё не загружен"><p className="text-[13.5px] text-muted-foreground">Загрузите Excel ниже или отправьте файл Claude в чат.</p></Card>{importPanel}</>;
  const list = stockSearch(v.sorted, q), showPt = pl0 === "all", shown = list.slice(0, lim).map((it, i) => ({ it, i }));
  const sc = v.pr.reduce((a, o) => a + o.c, 0), sv = v.pr.reduce((a, o) => a + o.v, 0);
  const catSum = (cat?: string) => v.all.filter((i) => !cat || (i.c || "Без категории") === cat).reduce((a, i) => a + (+i.q || 0) * (+(i.p || 0)), 0);
  const fc = q ? 1 : 0;

  type PR = (typeof v.pr)[number]; type GR = (typeof v.groups)[number];
  const prCols: RowColumn<PR>[] = [
    { key: "p", title: "Место", main: true, cell: (o) => o.p },
    { key: "pos", title: "Позиций", sub: true, align: "right", cell: (o) => fmt(o.pos) + " поз." },
    { key: "n", title: "Штук", align: "right", cell: (o) => <b>{fmt(o.n)}</b> },
    { key: "src", title: "Источник", cell: (o) => <span className="text-[12px] text-muted-foreground">{o.src || "—"}</span> },
    { key: "sh", title: "Доля", align: "right", cell: (o) => pctF(v.QA ? o.n / v.QA : 0) },
    { key: "c", title: "Сумма закупки", align: "right", cell: (o) => fmt(o.c) },
    { key: "v", title: "Сумма продажи", align: "right", cell: (o) => fmt(o.v) },
    { key: "mk", title: "Наценка", align: "right", cell: (o) => pctF(o.mk) },
    { key: "s", title: "Продано с " + dShort(v.from), align: "right", cell: (o) => (o.s ? fmt(o.s) : dim) },
  ];
  const catCols: RowColumn<string>[] = [
    { key: "c", title: "Категория", main: true, cell: (cat) => cat },
    ...v.places.map((p): RowColumn<string> => ({ key: "p" + p, title: p + ", шт", align: "right", cell: (cat) => { const x = v.cell(cat, p); return x ? fmt(x) : dim; } })),
    { key: "tot", title: "Всего, шт", align: "right", cell: (cat) => <b>{fmt(v.cell(cat))}</b> },
    { key: "sum", title: "Сумма продажи", align: "right", cell: (cat) => fmt(catSum(cat)) },
  ];
  const grCols: RowColumn<GR>[] = [
    { key: "k", title: "Группа", main: true, cell: (o) => o.k },
    { key: "n", title: "Позиций", sub: true, align: "right", cell: (o) => fmt(o.n) + " поз." },
    { key: "q", title: "Штук", align: "right", cell: (o) => <b>{fmt(o.q)}</b> },
    { key: "vc", title: "Сумма закупки", align: "right", cell: (o) => fmt(o.vc) },
    { key: "vp", title: "Сумма продажи", align: "right", cell: (o) => fmt(o.vp) },
    { key: "mg", title: "Маржа в цене", align: "right", cell: (o) => (o.vp && o.vc ? pctF((o.vp - o.vc) / o.vp) : "—") },
    { key: "s", title: "Продано с " + dShort(v.from), align: "right", cell: (o) => (o.s ? fmt(o.s) : dim) },
  ];
  type IR = { it: BItem; i: number };
  const itCols: RowColumn<IR>[] = [
    { key: "n", title: "Модель / наименование", main: true, cell: ({ it }) => <>{[it.m || it.n || it.s, it.col].filter(Boolean).join(" · ")}{it.note && <small className="block text-[12px] font-normal text-muted-foreground">{it.note}</small>}</> },
    { key: "g", title: "Группа", sub: true, cell: ({ it }) => it.g || it.c || null },
    ...(showPt ? [{ key: "pt", title: "Место", sub: true, cell: ({ it }: IR) => it.pt || null } as RowColumn<IR>] : []),
    { key: "s", title: "Артикул", cell: ({ it }) => <span className="text-[12px] text-muted-foreground">{it.s && it.s !== it.m ? it.s : "—"}</span> },
    { key: "q", title: "Кол-во по файлу", align: "right", cell: ({ it }) => fmt(+it.q || 0) },
    { key: "sd", title: "Продано с " + dShort(v.from), align: "right", cell: ({ it }) => { const x = v.sold.get(it) || 0; return x ? <b>{fmt(x)}</b> : dim; } },
    { key: "now", title: "≈ Сейчас", align: "right", cell: ({ it }) => { const x = (+it.q || 0) - (v.sold.get(it) || 0); return <b className={x < 0 ? "text-minus" : undefined}>{fmt(x)}</b>; } },
    { key: "cp", title: "Цена покупки", align: "right", cell: ({ it }) => money(it.cp) },
    { key: "p", title: "Цена продажи", align: "right", cell: ({ it }) => money(it.p) },
    { key: "mg", title: "Маржа в цене", align: "right", cell: ({ it }) => (+(it.cp || 0) && +(it.p || 0) ? pctF(((it.p as number) - (it.cp as number)) / (it.p as number)) : "—") },
  ];

  return (
    <>
      <Card i={nx()} title="Откуда остатки" note={`${fmt(c.stockItems.length)} позиций`}>
        <p className="text-[13px] leading-snug">Остатки взяты из файла как есть: {v.places.map((p, i) => <span key={p}>{i ? "; " : ""}<b>{p}</b>{v.src[p] ? ` — ${v.src[p]}` : ""}</span>)}. Продажи после этих дат в файле не вычтены, поэтому рядом показано, сколько продано с {dShort(v.from)}, и примерный остаток сейчас. После инвентаризации загрузите точные остатки.</p>
      </Card>
      <Segments aria-label="Место" items={[{ key: "all", label: "Все места" }, ...v.places.map((p) => ({ key: p, label: p }))]} value={pl0} onChange={(p) => { setPlace(p); setLim(SHOW); }} />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3.5">
        {v.cards.map((cd, i) => <Tile key={cd.label} i={nx()} hero={i === 0}><TileLabel>{cd.label}</TileLabel><TileValue>{cd.v}</TileValue><TileSub>{cd.d}</TileSub></Tile>)}
      </div>
      <Card i={nx()} title="По местам" note="склад и точки">
        <p className="text-[12.5px] text-muted-foreground">Склад и каждая точка отдельно. Нажмите место, чтобы видеть только его товары.</p>
        <RowCards columns={phoneFirst(prCols, "n", phone)} rows={v.pr} rowKey={(o) => o.p} onRowClick={(o) => { setPlace(o.p); setLim(SHOW); }} dense
          footer={<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-semibold"><span>Итого</span><span className="num">{fmt(v.QA)} шт · закупка {fmt(sc)} · продажа {fmt(sv)} · наценка {pctF(sc ? (sv - sc) / sc : null)}</span></div>} />
      </Card>
      <Card i={nx()} title="Категории по местам" note="штуки">
        <RowCards columns={phoneFirst(catCols, "tot", phone)} rows={v.cats} rowKey={(x) => x} dense
          footer={<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-semibold"><span>Итого</span><span className="num">{fmt(v.QA)} шт · продажа {fmt(catSum())}</span></div>} />
      </Card>
      <Card i={nx()} title={"По группам" + (pl0 === "all" ? "" : " · " + pl0)} note={`${fmt(v.groups.length)} групп`}>
        <RowCards columns={phoneFirst(grCols, "q", phone)} rows={v.groups} rowKey={(o) => o.k} dense
          footer={<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-semibold"><span>Итого</span><span className="num">{fmt(v.items.length)} поз. · {fmt(v.Q)} шт · закупка {fmt(v.vC)} · продажа {fmt(v.vP)} · маржа {v.vP && v.vC ? pctF((v.vP - v.vC) / v.vP) : "—"}</span></div>} />
      </Card>
      <Card i={nx()} title="Все товары" note={`${fmt(list.length)} из ${fmt(v.items.length)}`}>
        <FilterBar summary={q ? "Поиск: " + q : "Без поиска"} count={fc}>
          <Field label="Поиск" className="sm:w-64"><input className={FIELD} placeholder="Модель, артикул, группа" value={q} onChange={(e) => { setQ(e.target.value); setLim(SHOW); }} /></Field>
        </FilterBar>
        <p className="text-[12.5px] text-muted-foreground">Сначала — те, что продавались с {dShort(v.from)}.</p>
        <RowCards className="max-w-[1400px]" columns={phoneFirst(itCols, "now", phone)} rows={shown} rowKey={(r) => String(r.i)} empty="Ничего не найдено"
          footer={list.length ? <div className="flex flex-wrap items-baseline justify-between gap-x-4 font-semibold"><span>Показано {fmt(shown.length)} из {fmt(list.length)}</span></div> : undefined} />
        {list.length > lim && <div className="text-center"><Button variant="secondary" onClick={() => setLim((x) => x + MORE)}>Показать ещё</Button></div>}
      </Card>
      {importPanel}
    </>
  );
}
