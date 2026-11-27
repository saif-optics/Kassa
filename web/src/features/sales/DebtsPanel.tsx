// Долги: блок мозаики (до 4 строк) и полная таблица в листе — возникшие в периоде и все ещё открытые старые: продажа, оплачено, долг, погашения, статус.
import { Card } from "@/components/Card";
import { Fold } from "@/components/Fold";
import { Chip } from "@/components/Tile";
import { Row, RowCell, RowName, Rows } from "@/components/Rows";
import { RowCards, type RowColumn } from "@/components/RowCards";
import { useIsPhone } from "@/lib/useMedia";
import { cn } from "@/lib/utils";
import { dShort, fmt, type Filter, type SaleX } from "./logic";
import { debtsOf, type DebtsInfo } from "./debts";
import { Note } from "./parts";

const Dash = () => <span className="text-muted-foreground">—</span>;

/** строка таблицы: долг по продаже или погашение без продажи */
interface TRow { key: string; date: string; old?: boolean; point: string; product: string; full?: number; paid?: number; debt?: number; repaid: number; repayDates: string; closedAt?: string; rest?: number; orphan?: boolean }

export const useDebts = (sales: SaleX[], F: Filter) => debtsOf(sales, F.from, F.to, F.point);

/** блок «Долги»: открытые с суммой красным, закрытые с чипом «закрыт дд.мм» */
export function DebtsBlock({ r, onAll, i = 0 }: { r: DebtsInfo; onAll: () => void; i?: number }) {
  const open = r.rows.filter((d) => !d.closedAt).sort((a, b) => a.date.localeCompare(b.date));
  const closed = r.rows.filter((d) => d.closedAt).sort((a, b) => (b.closedAt || "").localeCompare(a.closedAt || ""));
  const list = [...open, ...closed].slice(0, 4), empty = !r.rows.length && !r.orphans.length;
  return (
    <Card title="Долги" to={onAll} label="список долгов" note={empty ? "долгов нет" : <>открыто <span className="num">{r.openCount}</span> · <span className="num">{fmt(r.openSum)}</span></>} i={i} className="gap-1">
      {list.length ? (
        <Rows cols="1fr auto" phone="1fr auto">
          {list.map((d, k) => (
            <Row key={d.key} className={cn("min-h-[50px]", k > 2 && "@max-[1023px]/main:hidden")}>
              <RowName title={d.product} sub={`${dShort(d.date)}${d.old ? " · старый" : ""} · ${d.point}`} />
              {d.closedAt ? <Chip tone="plus">закрыт {dShort(d.closedAt)}</Chip> : <RowCell right className="text-minus">{fmt(d.rest)}</RowCell>}
            </Row>))}
        </Rows>) : <p className="py-3 text-[15px] text-muted-foreground">{empty ? "За период долгов нет." : "Есть только погашения без продажи — они в полной таблице."}</p>}
      <p className="mt-auto text-[13px] leading-snug text-muted-foreground">Из пометок «долг … не записан» и их погашений. <button type="button" onClick={onAll} className="font-semibold text-primary hover:underline">Все долги и погашения</button></p>
    </Card>
  );
}

/** полная таблица долгов (в листе) */
export function DebtsTable({ r }: { r: DebtsInfo }) {
  const phone = useIsPhone(), empty = !r.rows.length && !r.orphans.length;
  const rows: TRow[] = [
    ...r.rows.map((d): TRow => ({ key: d.key, date: d.date, old: d.old, point: d.point, product: d.product, full: d.full, paid: d.paid, debt: d.debt, repaid: d.repaid, repayDates: d.pays.map((p) => dShort(p.date)).join(", "), closedAt: d.closedAt || undefined, rest: d.rest })),
    ...r.orphans.map((o): TRow => ({ key: o.id, date: o.date, point: o.point, product: o.product, repaid: o.sum, repayDates: "", orphan: true })),
  ];
  // на телефоне числовые колонки уходят в раскрывающуюся часть, справа остаётся только статус
  const al = phone ? undefined : "right" as const;
  const num = (v?: number) => (v == null ? <Dash /> : fmt(v));
  const cols: RowColumn<TRow>[] = [
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
    <div className="grid gap-2.5">
      <Note>Долги из пометок «долг … не записан» и их погашения. «Старый» — продажа раньше выбранного периода.</Note>
      <p className="text-[13px] text-muted-foreground">{empty ? "Долгов нет" : <>Открыто: <b className="num text-foreground">{r.openCount}</b> на сумму <b className="num text-foreground">{fmt(r.openSum)}</b> · Закрыто за период: <b className="num text-foreground">{r.closedCount}</b></>}</p>
      {!empty && <Fold id="sales.debts" rows={rows}>{(shown) => <RowCards rows={shown} rowKey={(d) => d.key} columns={cols} />}</Fold>}
    </div>
  );
}
