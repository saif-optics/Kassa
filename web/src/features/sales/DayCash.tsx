// Касса дня по точкам: по блоку на точку — оплаты, расходы дня и наличные после расходов.
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/Card";
import { RowCards, type RowColumn } from "@/components/RowCards";
import { useIsPhone } from "@/lib/useMedia";
import { cn } from "@/lib/utils";
import { PAYS, PAYSHORT, WD, dShort, fmt, plural, pointColor, wdIdx, type DayCashRow, type Filter } from "./logic";
import { dayCashBlocks } from "./logic";
import { Note, Pager, usePager } from "./parts";

type Block = ReturnType<typeof dayCashBlocks>[number];
const Pill = ({ kassa }: { kassa: boolean }) => <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap", kassa ? "bg-primary/12 text-primary" : "bg-warn-soft text-warn")}>{kassa ? "Б/Ч в кассу" : "Б/Ч на точке"}</span>;
const Dash = () => <span className="text-muted-foreground">—</span>;

const dateCell = (o: DayCashRow) => <span className="whitespace-nowrap">{dShort(o.d)} <span className="text-xs font-normal text-muted-foreground">{WD[wdIdx(o.d)]}</span></span>;

function BlockView({ b, points, open, toggle }: { b: Block; points: string[]; open: boolean; toggle: () => void }) {
  const pg = usePager(b.rows.length), phone = useIsPhone();
  const sw = <span className="size-2.5 shrink-0 rounded-full" style={{ background: pointColor(b.pt, points) }} />;
  if (!b.rows.length) return (
    <div className="glass-inner flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-2xl px-4 py-3">
      <span className="flex items-center gap-2 font-semibold"><span className="size-4" />{sw}{b.pt}<Pill kassa={b.kassa} /></span>
      <span className="text-[13px] text-muted-foreground">{b.empty === "billz" ? "за период в Billz нет ни одного чека" : "за период продаж нет"}</span>
    </div>);
  const rows = pg.slice(b.rows);
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
    <div className="glass-inner overflow-hidden rounded-2xl">
      <button type="button" data-dc={b.pt} aria-expanded={open} onClick={toggle} className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 text-left outline-none focus-visible:ring-3 focus-visible:ring-primary/30">
        <span className="flex items-center gap-2 font-semibold"><ChevronRight className={cn("size-4 transition-transform", open && "rotate-90")} />{sw}{b.pt}<Pill kassa={b.kassa} /></span>
        <span className="flex flex-wrap gap-x-4 gap-y-0.5 text-[13px] text-muted-foreground">
          <span>{b.rows.length} {plural(b.rows.length, "день", "дня", "дней")}</span>
          <span>выручка <b className="num text-foreground">{fmt(b.tot)}</b></span><span>наличные <b className="num text-foreground">{fmt(b.cash)}</b></span>
          <span>расходы <b className="num text-foreground">−{fmt(b.exp)}</b></span><span>Б/Ч после расходов <b className="num text-foreground">{fmt(b.after)}</b></span></span>
      </button>
      {open && <div className="px-2 pb-3">
        <RowCards rows={rows} rowKey={(o) => o.d} columns={cols} dense footer={<div className="flex flex-wrap gap-x-4 gap-y-1 font-semibold">
          <span>Итого</span>{PAYS.filter((p) => b.pay[p]).map((p) => <span key={p} className="font-normal text-muted-foreground">{PAYSHORT[p] || p} <b className="num text-foreground">{fmt(b.pay[p])}</b></span>)}
          <span className="num">{fmt(b.tot)}</span><span className="num font-normal text-muted-foreground">расходы −{fmt(b.exp)}</span><span className="font-normal text-muted-foreground">Б/Ч после расходов <b className="num text-foreground">{fmt(b.after)}</b></span></div>} />
        <Pager pg={pg} className="px-2" />
      </div>}
    </div>
  );
}

export function DayCash({ rows, points, F, i = 0 }: { rows: DayCashRow[]; points: string[]; F: Filter; i?: number }) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const blocks = dayCashBlocks(rows, points, F);
  const tg = (p: string) => setOpen((s) => { const n = new Set(s); n.has(p) ? n.delete(p) : n.add(p); return n; });
  return (
    <Card title="Касса дня по точкам" i={i}>
      <Note>Отдельная таблица на каждую точку: оплаты, расходы дня и наличные после расходов. Б/Ч Премиума и Яшнабада идёт в кассу, Б/Ч Сергели и C1 остаётся на точке.</Note>
      <div className="grid gap-2.5">
        {blocks.map((b) => <BlockView key={b.pt} b={b} points={points} open={open.has(b.pt)} toggle={() => tg(b.pt)} />)}
        {!rows.length && <p className="text-[13px] text-muted-foreground">За выбранный период нет ни продаж, ни расходов дня.</p>}
      </div>
    </Card>
  );
}
