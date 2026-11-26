// Анализ расходов месяца и Б/Ч по дням (Recharts) — содержимое блоков бенто Кассы.
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Row, RowCell, RowName, Rows } from "@/components/Rows";
import { TileLabel } from "@/components/Tile";
import { fmtM } from "../plan/logic";
import { pl } from "../pay/logic";
import { cn } from "@/lib/utils";
import { dShort, fmt, type BcDay, type Kassa, analysis } from "./logic";

/** «Операционные и прочие»: одна полоса долей и две подписи с суммами */
export function Split({ c }: { c: Kassa }) {
  const tot = c.sOp + c.sOth || 1;
  const leg = (cls: string, n: string, cnt: number, v: number) => <span title={`${cnt} зап. · ${fmt(v)}`} className="flex min-w-0 items-center gap-1.5 whitespace-nowrap"><i className={cn("size-2.5 shrink-0 rounded-full", cls)} />{n} <b className="num">{fmtM(v)}</b></span>;
  return (
    <>
      <TileLabel>Операционные и прочие</TileLabel>
      <div>
        <div className="flex h-2.5 overflow-hidden rounded-full bg-muted"><i className="block bg-primary" style={{ width: `${(c.sOp / tot) * 100}%` }} /><i className="block bg-warn" style={{ width: `${(c.sOth / tot) * 100}%` }} /></div>
        <div className="mt-2 flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-sm">{leg("bg-primary", "Операционные", c.op.length, c.sOp)}{leg("bg-warn", "Прочие", c.oth.length, c.sOth)}</div>
      </div>
    </>
  );
}

const MAXA = 6;
/** «Расходы с Б/Ч по статьям»: до 6 статей с полосой доли, внизу итог; список прокручивается внутри блока */
export function Articles({ a }: { a: ReturnType<typeof analysis> }) {
  if (!a.arts.length) return <p className="py-6 text-center text-muted-foreground">Нет мелких расходов</p>;
  const max = a.arts[0][1].v || 1, L = a.arts.slice(0, MAXA);
  return (
    <Rows cols="1fr 110px" phone="1fr auto" className="min-h-0 flex-1">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {L.map(([k, o], j) => (
          <Row key={k} className={cn("@max-[1599px]/main:min-h-9", j > 2 && "@max-[639px]/main:hidden")}>
            <div className="min-w-0 py-1"><RowName title={<>{k}<span className="text-muted-foreground @min-[1600px]/main:hidden"> · {o.n} {pl(o.n, "раз", "раза", "раз")}</span></>} sub={<span className="@max-[1599px]/main:hidden">{o.n} {pl(o.n, "раз", "раза", "раз")}</span>} />
              <span className="mt-1 block h-1.5 overflow-hidden @max-[1599px]/main:mt-0.5 @max-[1599px]/main:h-1 rounded-full bg-muted"><i className={cn("block h-full rounded-full", o.cat === "op" ? "bg-primary" : "bg-warn")} style={{ width: `${(o.v / max) * 100}%` }} /></span></div>
            <RowCell right>{fmt(o.v)}</RowCell>
          </Row>))}
        {L.length < MAXA && <div className="mt-3 border-t border-foreground/8 pt-3 @max-[1599px]/main:hidden"><ArticlesMore a={a} /></div>}
      </div>
      <Row bold className="mt-auto flex-none border-foreground/20"><span>Итого с Б/Ч{a.arts.length > MAXA ? ` · ещё ${a.arts.length - MAXA}` : ""}</span><RowCell right>{fmt(a.sSmall)}</RowCell></Row>
    </Rows>
  );
}

/** «По точкам» и «По дням» — остальное из анализа статей */
export function ArticlesMore({ a }: { a: ReturnType<typeof analysis> }) {
  return (
    <div className="flex flex-col gap-1 text-[13.5px]">
      <h4 className="font-semibold">По точкам</h4>
      {a.byPoint.map(([k, v]) => <div key={k} className="flex justify-between"><span>{k}</span><span className="num">{fmt(v)} · {Math.round((v / (a.sSmall || 1)) * 100)}%</span></div>)}
      {a.byDay.length > 0 && <><h4 className="mt-2 font-semibold">По дням</h4>
        <div className="flex justify-between"><span>Самый затратный день</span><span className="num">{dShort(a.byDay[0][0])} · {fmt(a.byDay[0][1])}</span></div>
        <div className="flex justify-between"><span>В среднем за день с расходами</span><span className="num">{fmt(a.sSmall / (a.ndays || 1))}</span></div>
        <div className="flex justify-between"><span>Дней с расходами</span><span className="num">{a.ndays}</span></div></>}
    </div>
  );
}

export function Insights({ items }: { items: string[] }) {
  const md = (t: string) => t.split(/\*\*(.+?)\*\*/g).map((x, i) => (i % 2 ? <b key={i}>{x}</b> : x));
  return <ul className="flex list-disc flex-col gap-2 pl-5 text-[13.5px] leading-relaxed">{(items.length ? items : ["Добавьте расходы, чтобы увидеть выводы."]).map((t, i) => <li key={i}>{md(t)}</li>)}</ul>;
}

/** столбики Б/Ч по дням; fill — занять всю высоту блока */
export function DayChart({ days, fill }: { days: BcDay[]; fill?: boolean }) {
  const data = days.map((d) => ({ d: dShort(d.d), Премиум: d.p, Яшнабад: d.y, C1: d.c || 0 }));
  if (!data.length) return <p className="py-6 text-center text-muted-foreground">В этом месяце продаж наличными ещё нет.</p>;
  const hasC = days.some((d) => d.c); // C1 в кассе выключена, серию показываем только если есть данные
  return (
    <div className={fill ? "min-h-0 flex-1" : "h-[340px]"}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -6, right: 4, top: 12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="d" fontSize={12} interval="preserveStartEnd" minTickGap={8} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" />
          <YAxis width={60} fontSize={12} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" tickFormatter={(v) => String(+(v / 1e6).toFixed(1)).replace(".", ",") + " млн"} />
          <Tooltip cursor={{ fill: "var(--muted)" }} formatter={(v) => fmt(Number(v))} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" }} />
          <Bar dataKey="Премиум" stackId="a" fill="var(--chart-1)" /><Bar dataKey="Яшнабад" stackId="a" fill="var(--chart-2)" radius={hasC ? 0 : [6, 6, 0, 0]} />{hasC && <Bar dataKey="C1" stackId="a" fill="var(--chart-4)" radius={[6, 6, 0, 0]} />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
