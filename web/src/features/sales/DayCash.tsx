// Касса по точкам: блок мозаики (точка, чип «Б/Ч в кассу», Б/Ч после расходов) и таблица по дням выбранной точки — в листе.
import { Card } from "@/components/Card";
import { Chip } from "@/components/Tile";
import { RowCards, type RowColumn } from "@/components/RowCards";
import { useIsPhone } from "@/lib/useMedia";
import { cn } from "@/lib/utils";
import { PAYS, PAYSHORT, WD, dShort, fmt, fmtM, plural, pointColor, wdIdx, type DayCashRow } from "./logic";
import { dayCashBlocks } from "./logic";
import { Pager, usePager } from "./parts";

export type CashBlockData = ReturnType<typeof dayCashBlocks>[number];
export const KassaChip = ({ kassa, className }: { kassa: boolean; className?: string }) => <Chip tone={kassa ? "info" : "warn"} className={className}>{kassa ? "Б/Ч в кассу" : "на точке"}</Chip>;
const Dash = () => <span className="text-muted-foreground">—</span>;
const dateCell = (o: DayCashRow) => <span className="whitespace-nowrap">{dShort(o.d)} <span className="text-xs font-normal text-muted-foreground">{WD[wdIdx(o.d)]}</span></span>;

/** блок «Касса по точкам»: нажатие на точку открывает её таблицу по дням */
export function CashBlock({ blocks, points, onOpen, i = 0 }: { blocks: CashBlockData[]; points: string[]; onOpen: (pt: string) => void; i?: number }) {
  const inKassa = blocks.filter((b) => b.kassa).reduce((x, b) => x + b.after, 0);
  return (
    <Card title="Касса по точкам" note="за период · нажмите на точку" i={i} className="gap-0">
      {blocks.map((b, k) => (
        <button key={b.pt} type="button" data-dc={b.pt} onClick={() => onOpen(b.pt)}
          className={cn("grid min-h-[68px] w-full flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-foreground/8 py-1.5 text-left outline-none first:border-t-0 hover:bg-foreground/4 focus-visible:ring-3 focus-visible:ring-primary/30", k === 0 && "border-t-0")}>
          <span className="flex min-w-0 items-start gap-2.5">
            <i className="mt-1.5 size-[9px] shrink-0 rounded-full" style={{ background: pointColor(b.pt, points) }} />
            <span className="min-w-0 leading-snug">
              <span className="flex flex-wrap items-center gap-x-2 text-[15px]"><b className="font-semibold">{b.pt}</b><KassaChip kassa={b.kassa} className="h-5 px-2 text-xs" /></span>
              {b.rows.length ? <>
                <span className="hidden text-[13px] text-muted-foreground @min-[640px]/main:block">{b.rows.length} {plural(b.rows.length, "день", "дня", "дней")} · выручка <span className="num">{fmt(b.tot)}</span><br />наличные <span className="num">{fmt(b.cash)}</span> · расходы <span className="num">−{fmt(b.exp)}</span></span>
                <span className="block text-[13px] text-muted-foreground @min-[640px]/main:hidden">выручка {fmtM(b.tot)} · наличные {fmtM(b.cash)} · расходы −{fmtM(b.exp)}</span></>
                : <span className="block text-[13px] text-muted-foreground">{b.empty === "billz" ? "за период в Billz нет ни одного чека" : "за период продаж нет"}</span>}
            </span>
          </span>
          <span className="text-right leading-tight"><span className="block text-[13px] text-muted-foreground">Б/Ч после</span><b className="num text-base">{fmt(b.after)}</b></span>
        </button>))}
      {!blocks.length && <p className="text-[13px] text-muted-foreground">За выбранный период нет ни продаж, ни расходов дня.</p>}
      <div className="mt-auto flex min-h-[46px] items-center justify-between gap-3 border-t border-foreground/20 text-[15px] font-bold"><span>Б/Ч в кассу за период</span><span className="num text-base">{fmt(inKassa)}</span></div>
    </Card>
  );
}

/** таблица точки по дням: оплаты, расходы, Б/Ч после расходов (в листе) */
export function PointTable({ b }: { b: CashBlockData }) {
  const pg = usePager(b.rows.length), phone = useIsPhone();
  if (!b.rows.length) return <p className="text-[13px] text-muted-foreground">{b.empty === "billz" ? "за период в Billz нет ни одного чека" : "за период продаж нет"}</p>;
  const cols: RowColumn<DayCashRow>[] = phone
    // телефон: заголовок карточки — дата и итог, остальное раскрывается
    ? [{ key: "d", title: "Дата", main: true, cell: dateCell },
      { key: "tot", title: "Итого", align: "right", cell: (o) => fmt(o.tot) },
      { key: "after", title: "Б/Ч после расходов", sub: true, cell: (o) => "Б/Ч " + fmt(o.after) },
      ...PAYS.map((p): RowColumn<DayCashRow> => ({ key: p, title: p, cell: (o) => (o.pay[p] ? fmt(o.pay[p]) : "—") })),
      { key: "exp", title: "Расходы дня", cell: (o) => (o.exp ? "−" + fmt(o.exp) : "—") }]
    : [{ key: "d", title: "Дата", main: true, cell: dateCell },
      ...PAYS.map((p): RowColumn<DayCashRow> => ({ key: p, title: p, align: "right", cell: (o) => (o.pay[p] ? fmt(o.pay[p]) : <Dash />) })),
      { key: "tot", title: "Итого", align: "right", cell: (o) => <b>{fmt(o.tot)}</b> },
      { key: "exp", title: "Расходы дня", align: "right", cell: (o) => (o.exp ? <span className="text-minus">−{fmt(o.exp)}</span> : <Dash />) },
      { key: "after", title: "Б/Ч после расходов", align: "right", cell: (o) => <b>{fmt(o.after)}</b> }];
  return (
    <div>
      <RowCards rows={pg.slice(b.rows)} rowKey={(o) => o.d} columns={cols} dense footer={<div className="flex flex-wrap gap-x-4 gap-y-1 font-semibold">
        <span>Итого</span>{PAYS.filter((p) => b.pay[p]).map((p) => <span key={p} className="font-normal text-muted-foreground">{PAYSHORT[p] || p} <b className="num text-foreground">{fmt(b.pay[p])}</b></span>)}
        <span className="num">{fmt(b.tot)}</span><span className="num font-normal text-muted-foreground">расходы −{fmt(b.exp)}</span><span className="font-normal text-muted-foreground">Б/Ч после расходов <b className="num text-foreground">{fmt(b.after)}</b></span></div>} />
      <Pager pg={pg} />
    </div>
  );
}
