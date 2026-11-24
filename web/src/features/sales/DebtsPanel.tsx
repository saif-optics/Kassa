// Долги: возникшие в периоде и все ещё открытые старые — продажа, оплачено, долг, погашения и статус.
import { Card } from "@/components/Card";
import { RowCards, type RowColumn } from "@/components/RowCards";
import { useIsPhone } from "@/lib/useMedia";
import { dShort, fmt, type Filter, type SaleX } from "./logic";
import { debtsOf } from "./debts";
import { Note } from "./parts";

const Dash = () => <span className="text-muted-foreground">—</span>;

/** строка таблицы: долг по продаже или погашение без продажи */
interface Row { key: string; date: string; old?: boolean; point: string; product: string; full?: number; paid?: number; debt?: number; repaid: number; repayDates: string; closedAt?: string; rest?: number; orphan?: boolean }

export function Debts({ sales, F, i = 0 }: { sales: SaleX[]; F: Filter; i?: number }) {
  const phone = useIsPhone();
  const r = debtsOf(sales, F.from, F.to, F.point), empty = !r.rows.length && !r.orphans.length;
  const rows: Row[] = [
    ...r.rows.map((d): Row => ({ key: d.key, date: d.date, old: d.old, point: d.point, product: d.product, full: d.full, paid: d.paid, debt: d.debt, repaid: d.repaid, repayDates: d.pays.map((p) => dShort(p.date)).join(", "), closedAt: d.closedAt || undefined, rest: d.rest })),
    ...r.orphans.map((o): Row => ({ key: o.id, date: o.date, point: o.point, product: o.product, repaid: o.sum, repayDates: "", orphan: true })),
  ];
  // на телефоне числовые колонки уходят в раскрывающуюся часть, справа остаётся только статус
  const al = phone ? undefined : "right" as const;
  const num = (v?: number) => (v == null ? <Dash /> : fmt(v));
  const cols: RowColumn<Row>[] = [
    { key: "date", title: "Дата продажи", sub: true, cell: (d) => <>{dShort(d.date)}{d.old && <small className="ml-1 text-muted-foreground">старый</small>}</> },
    { key: "point", title: "Точка", sub: true, cell: (d) => d.point },
    { key: "product", title: "Товар", main: true, cell: (d) => d.product },
    { key: "full", title: "Чек", align: al, cell: (d) => num(d.full) },
    { key: "paid", title: "Оплачено при продаже", align: al, cell: (d) => num(d.paid) },
    { key: "debt", title: "Долг", align: al, cell: (d) => (d.debt == null ? <Dash /> : <b>{fmt(d.debt)}</b>) },
    { key: "repaid", title: "Погашено", align: al, cell: (d) => (d.repaid ? <>{fmt(d.repaid)} {d.repayDates && <small className="text-muted-foreground">{d.repayDates}</small>}</> : <Dash />) },
    { key: "status", title: "Статус", align: "right", cell: (d) => (d.orphan ? <span className="text-[12px] font-normal text-muted-foreground">погашение без продажи</span>
      : d.closedAt ? <span className="font-semibold whitespace-nowrap text-plus">закрыт {dShort(d.closedAt)}</span> : <span className="font-semibold whitespace-nowrap text-minus">остаток {fmt(d.rest || 0)}</span>) },
  ];
  return (
    <Card title="Долги" i={i}>
      <Note>Долги из пометок «долг … не записан» и их погашения. «Старый» — продажа раньше выбранного периода.</Note>
      <p className="text-[13px] text-muted-foreground">{empty ? "Долгов нет" : <>Открыто: <b className="num text-foreground">{r.openCount}</b> на сумму <b className="num text-foreground">{fmt(r.openSum)}</b> · Закрыто за период: <b className="num text-foreground">{r.closedCount}</b></>}</p>
      {!empty && <RowCards rows={rows} rowKey={(d) => d.key} columns={cols} />}
    </Card>
  );
}
