// Раздел «Линзы»: проданные очковые линзы по видам и точкам; маржа по видам и правка цен пары.
import { useMemo, useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHead } from "@/components/PageHead";
import { Card } from "@/components/Card";
import { RowCards, type RowColumn } from "@/components/RowCards";
import type { Data } from "@/lib/types";
import { useMutations } from "@/lib/useData";
import { pointColor } from "../analytics/base";
import { makeCtx } from "../analytics/cost";
import { lensKinds, lensCostView, lensView } from "./logic";
import { lensSheets, fname } from "../analytics/exports";
import { saveXlsx } from "../analytics/xl";
import { useFlt } from "../analytics/filter";
import { LensFilter } from "./LensFilter";
import { BarsC, HBars } from "../analytics/charts";
import { Dim, Empty, Sw } from "../analytics/parts";
import { MetricTile, MiniTile, Panel } from "../analytics/AnParts";
import { fmt, fmtM, pctF, pl } from "../analytics/util";

type G = { k: string; u: number; r: number };

export function LensPage({ d }: { d: Data }) {
  const c = useMemo(() => makeCtx(d), [d]);
  const [F, setF] = useFlt();
  const v = useMemo(() => lensView(c, F), [c, F]);
  const kinds = useMemo(() => lensKinds(c, F), [c, F]);
  const cost = useMemo(() => lensCostView(c, v.rows), [c, v.rows]);
  const xlsx = async () => {
    const sh = lensSheets(c, F); if (!sh) { toast.error("Нет продаж линз за период."); return; }
    try { await saveXlsx(sh, fname(c, F, "linzy", "xlsx")); toast.success("Файл скачан"); } catch (e) { toast.error("Не удалось выгрузить: " + String(e)); }
  };
  let k = 0; const nx = () => Math.min(k++, 14); // сквозной номер посадки сверху вниз (после 14-го — без задержки)
  const U = v.rows.reduce((q, x) => q + (+(x.s.qty || 0)), 0), R = v.rows.reduce((q, x) => q + (+x.s.sum || 0), 0);
  const cols = (title: string, dot?: (k: string) => string): RowColumn<G>[] => [
    { key: "k", title, main: true, cell: (o) => <>{dot && <Sw color={dot(o.k)} />}{o.k}</> },
    { key: "r", title: "Выручка", align: "right", cell: (o) => fmt(o.r) },
    { key: "u", title: "Штук", sub: true, cell: (o) => fmt(o.u) + " шт" },
    { key: "sh", title: "Доля", sub: true, cell: (o) => pctF(U ? o.u / U : 0) },
  ];
  const foot = <span className="text-muted-foreground">Всего: <b className="num text-foreground">{fmt(U)} шт · {fmt(R)} сум</b></span>;
  const big = v.cards.slice(0, 4), rest = v.cards.slice(4);
  const bm: Record<string, G> = {};
  v.rows.forEach((x) => { if (!x.brand) return; const o = bm[x.brand] || (bm[x.brand] = { k: x.brand, u: 0, r: 0 }); o.u += +(x.s.qty || 0); o.r += +x.s.sum || 0; });
  const brands = Object.values(bm).sort((p, q) => q.u - p.u || q.r - p.r); // бренды — как byBrand в logic.ts
  const pts: G[] = v.ptEntries.map(([p, o]) => ({ k: p, u: o.u, r: o.r }));
  return (
    <div className="flex flex-col gap-3.5">
      <PageHead eyebrow="Saif-Optics · проданные очковые линзы и их виды" title="Очковые линзы" sub={v.period}
        actions={<Button variant="secondary" size="lg" onClick={xlsx}><FileSpreadsheet />Выгрузить Excel</Button>} />
      <LensFilter c={c} F={F} set={setF} kinds={kinds} all={v.all} i={nx()} />

      {v.empty ? <Empty>За выбранный период продаж очковых линз нет. Сюда попадают только продажи категории «Очковые линзы». Контактные линзы, растворы и капли сюда не входят.</Empty> : (
        <>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">{big.map((cd) => <MetricTile key={cd.label} c={cd} i={nx()} hintsOn={false} />)}</div>
          {rest.length > 0 && (
            <Card title="Ещё показатели" note={`${rest.length} ${pl(rest.length, "показатель", "показателя", "показателей")}`} i={nx()}>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">{rest.map((cd) => <MiniTile key={cd.label} c={cd} hintsOn={false} />)}</div>
            </Card>
          )}
          <div className="grid gap-3.5 md:grid-cols-2">
            <Panel title="Наши линзы по видам" note="ET, Блок, 4в1, Star, Essilor, Seiko и другие — по количеству" i={nx()} hintsOn={false} className="md:col-span-2"><HBars items={v.kindBars} /></Panel>
            <Panel title="Линзы по дням" note="Сколько штук продано каждый день" i={nx()} hintsOn={false} className="md:col-span-2">
              <BarsC labels={v.byDay.days.map((x) => x.slice(8, 10) + "." + x.slice(5, 7))} vals={v.byDay.vals} color="var(--chart-3)" fmtV={(x) => x + " шт"} lblV={String} h={260} />
            </Panel>
            <Card title="Виды линз" note="по количеству" i={nx()}><RowCards columns={cols("Вид")} rows={v.byKind} rowKey={(o) => o.k} dense footer={foot} /></Card>
            <Card title="Линзы по точкам" i={nx()}><RowCards columns={cols("Точка", (p) => pointColor(c.points, p))} rows={pts} rowKey={(o) => o.k} dense footer={foot} /></Card>
            {brands.length > 0 && <Card title="Бренды" note="по количеству" i={nx()} className="md:col-span-2"><RowCards columns={cols("Бренд")} rows={brands} rowKey={(o) => o.k} dense footer={foot} /></Card>}
          </div>
          {cost && <CostPanel c={c} cost={cost} nx={nx} />}
        </>
      )}
    </div>
  );
}

type Cost = NonNullable<ReturnType<typeof lensCostView>>;
type Rule = Cost["rules"][number];

function CostPanel({ c, cost, nx }: { c: ReturnType<typeof makeCtx>; cost: Cost; nx: () => number }) {
  const mu = useMutations();
  const [edit, setEdit] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);
  const val = (i: number, pair: number | null | undefined) => (i in edit ? edit[i] : pair && pair > 0 ? fmt(pair) : "");
  const save = async () => {
    const nr = cost.rules.map((r, i) => { const t = (i in edit ? edit[i] : "").replace(/\D/g, ""); return Object.assign({}, r, { pair: i in edit ? (t ? +t : null) : r.pair == null ? null : r.pair }); });
    setBusy(true);
    try { await mu.putDoc("settings", "lensCost", Object.assign({}, c.lensCfg, { rules: nr, updatedAt: Date.now() })); setEdit({}); toast.success("Цены пары сохранены"); }
    catch { toast.error("Не удалось сохранить"); } finally { setBusy(false); }
  };
  type L = (typeof cost.list)[number];
  const cols: RowColumn<L>[] = [
    { key: "k", title: "Вид", main: true, cell: (o) => o.k },
    { key: "gp", title: "Прибыль", align: "right", cell: (o) => (o.has ? fmt(o.kr - o.c) : <Dim>нет цены</Dim>) },
    { key: "u", title: "Пар", sub: true, cell: (o) => fmt(o.u) + " пар" },
    { key: "r", title: "Выручка", sub: true, cell: (o) => "выручка " + fmt(o.r) },
    { key: "c", title: "Себестоимость", sub: true, cell: (o) => (o.has ? "себест. " + fmt(o.c) : "") },
    { key: "m", title: "Маржа", sub: true, cell: (o) => (o.has && o.kr ? "маржа " + pctF((o.kr - o.c) / o.kr) : "") },
  ];
  const rcols: RowColumn<Rule & { i: number }>[] = [
    { key: "k", title: "Вид", main: true, cell: (r) => r.k },
    { key: "p", title: "Цена пары, сум", align: "right", cell: (r) => (
      <Input inputMode="numeric" value={val(r.i, r.pair)} placeholder="нет цены" aria-label={"Цена пары: " + r.k} className="num ml-auto h-8 w-36 max-w-full text-right" onChange={(e) => { const t = e.target.value.replace(/\D/g, ""); setEdit((x) => ({ ...x, [r.i]: t ? fmt(+t) : "" })); }} />) },
    { key: "s", title: "Откуда цена", sub: true, cell: (r) => r.src || "" },
  ];
  return (
    <>
      <Card title="Маржа по видам линз" note="предварительно" i={nx()}>
        <p className="text-[13px] leading-snug text-muted-foreground">Расчёт ещё идёт: себестоимость линз сверяется с документами поставщиков. Цена пары с НДС. Сергели — по журналу точки (расход «за линзы» дня делится на проданные пары). «≈ по цене» — вид в продаже не указан, определён по цене продажи пары.</p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <MiniTile hintsOn={false} c={{ id: 0, label: "Прибыль с линз", v: fmt(cost.gp) + " сум", d: `выручка ${fmtM(cost.revC)} − себестоимость ${fmtM(cost.cogs)}` }} />
          <MiniTile hintsOn={false} c={{ id: 0, label: "Маржа на линзах", v: cost.margin, d: `посчитано по ${cost.cover} выручки с линз` }} />
        </div>
        <RowCards columns={cols} rows={cost.list} rowKey={(o) => o.k} dense />
      </Card>
      <Card title="Цены пары по видам" note="можно поправить" i={nx()}>
        <RowCards columns={rcols} rows={cost.rules.map((r, i) => Object.assign({ i }, r))} rowKey={(r) => r.k + r.i} dense />
        <div><Button onClick={save} disabled={busy}>Сохранить цены</Button></div>
      </Card>
    </>
  );
}
