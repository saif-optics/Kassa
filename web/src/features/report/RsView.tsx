// «Отчёт по расчётному счёту»: остаток, поступления и расходы со счёта по дням и месяцам (report/<день>: rsStart, rsEnd, bank[]).
import { useMemo, useState } from "react";
import { Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Card } from "@/components/Card";
import { RowCards, type RowColumn } from "@/components/RowCards";
import { Segments } from "@/components/Segments";
import { Tile, TileLabel, TileSub, TileValue } from "@/components/Tile";
import type { Data } from "@/lib/types";
import { useMutations } from "@/lib/useData";
import { useIsPhone } from "@/lib/useMedia";
import { usePaging } from "./ui";
import { CAT_NAMES, RP_MF, catOf, dShort, fmt, pl, repDocs, rsByMonth, rsCalc, wdOf, type RsDay } from "./logic";

const mn = (m: string) => RP_MF[+m.slice(5, 7) - 1];
const ls = { get: () => { try { return localStorage.getItem("kassa-web.rs.m") || ""; } catch { return ""; } }, set: (v: string) => { try { localStorage.setItem("kassa-web.rs.m", v); } catch { /* нет хранилища */ } } };
const fm1 = (v: number) => (Math.abs(v) >= 1e6 ? (v / 1e6).toFixed(1).replace(".", ",") + " млн" : fmt(v));
const dash = <span className="text-muted-foreground">—</span>;

function Chart({ L }: { L: RsDay[] }) {
  const rows = L.filter((x) => x.e != null || x.out || x.in);
  if (rows.length < 2) return <p className="text-[13px] text-muted-foreground">Для графика нужно хотя бы два дня с выпиской.</p>;
  const data = rows.map((x) => ({ d: x.d.slice(8), full: dShort(x.d), in: x.in != null && x.in > 0 ? x.in : 0, out: -x.out, e: x.e }));
  return (
    <div className="h-[260px] w-full max-w-full" role="img" aria-label="Движение по счёту">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="d" tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" interval="preserveStartEnd" />
          <YAxis yAxisId="m" tickFormatter={(v) => fm1(Math.abs(v))} width={64} tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
          <YAxis yAxisId="b" orientation="right" hide domain={[0, "dataMax"]} />
          <ReferenceLine yAxisId="m" y={0} stroke="var(--border)" />
          <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12.5 }}
            labelFormatter={(_, p) => (p?.[0]?.payload?.full as string) || ""} formatter={(v, n) => [fmt(Math.abs(+(v as number) || 0)) + " сум", n === "in" ? "Поступило" : n === "out" ? "Списано" : "Остаток вечером"]} />
          <Bar yAxisId="m" dataKey="in" fill="var(--plus)" radius={[4, 4, 0, 0]} maxBarSize={22} />
          <Bar yAxisId="m" dataKey="out" fill="var(--minus)" radius={[0, 0, 4, 4]} maxBarSize={22} />
          <Line yAxisId="b" dataKey="e" type="monotone" stroke="var(--primary)" strokeWidth={2} dot={false} connectNulls />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RsView({ d }: { d: Data }) {
  const mu = useMutations(), phone = useIsPhone();
  const BM = useMemo(() => rsByMonth(d), [d]);
  const [m0, setM] = useState(ls.get);
  const ms = BM.ms;
  const m = m0 === "all" && ms.length > 1 ? "all" : ms.includes(m0) ? m0 : ms[ms.length - 1];
  const C = useMemo(() => rsCalc(d, m), [d, m]);
  const L = useMemo(() => C.days.slice().reverse(), [C]);
  const pg = usePaging(L.length, "rs-days", -1, m);
  let k = 0; const nx = () => k++; // сквозной номер посадки сверху вниз
  if (!ms.length) return <Card i={nx()} title="Выписок по счёту ещё нет"><p className="text-[13.5px] text-muted-foreground">Выписка Анор Банка загружается в базу — остатки и расходы со счёта появятся здесь.</p></Card>;
  const lbl = m === "all" ? "за всё время" : "за " + mn(m).toLowerCase(), per = m === "all" ? "" : " · " + mn(m).toLowerCase();
  const cats = CAT_NAMES.filter((c) => ms.some((x) => BM.rows[x].cat[c])).sort((a, b) => ms.reduce((s, x) => s + (BM.rows[x].cat[b] || 0), 0) - ms.reduce((s, x) => s + (BM.rows[x].cat[a] || 0), 0));
  const tot = (c: string) => ms.reduce((s, x) => s + (BM.rows[x].cat[c] || 0), 0), mx = Math.max(1, ...cats.map(tot));
  const totOut = ms.reduce((s, x) => s + BM.rows[x].out, 0);
  const setCat = async (day: string, idx: number, c: string) => {
    const R = repDocs(d)[day] || {}, bank = (R.bank || []).slice(), vis = bank.filter((b) => +(b.a as number)), it = vis[idx]; if (!it) return;
    bank[bank.indexOf(it)] = { ...it, c };
    try { await mu.putDoc("report", day, { ...R, date: day, bank, updatedAt: Date.now() }); } catch { toast.error("Не сохранилось — проверьте связь"); }
  };
  const pick = (v: string) => { setM(v); ls.set(v); };
  // на телефоне в шапке карточки справа стоит первая правая колонка, поэтому главную цифру ставим первой
  const ord = <T,>(cols: RowColumn<T>[], first: string) => (phone ? [cols[0], ...cols.filter((c) => c.key === first), ...cols.slice(1).filter((c) => c.key !== first)] : cols);

  const catCols: RowColumn<string>[] = [
    { key: "c", title: "Статья", main: true, cell: (c) => c },
    ...ms.map((x): RowColumn<string> => ({ key: "m" + x, title: mn(x), align: "right", cell: (c) => (BM.rows[x].cat[c] ? fmt(BM.rows[x].cat[c]) : dash) })),
    { key: "tot", title: "Итого", align: "right", cell: (c) => <b>{fmt(tot(c))}</b> },
    { key: "bar", title: "", hideMobile: true, width: "112px", cell: (c) => <div className="h-1.5 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-primary/70" style={{ width: `${(tot(c) / mx) * 100}%` }} /></div> },
  ];
  const monCols: RowColumn<string>[] = [
    { key: "m", title: "Месяц", main: true, cell: (x) => mn(x) },
    { key: "s", title: "Остаток на начало", align: "right", cell: (x) => (BM.rows[x].start != null ? fmt(BM.rows[x].start as number) : "—") },
    { key: "i", title: "Поступило", align: "right", cell: (x) => <span className="text-plus">+{fmt(BM.rows[x].in)}</span> },
    { key: "o", title: "Списано", align: "right", cell: (x) => <span className="text-minus">−{fmt(BM.rows[x].out)}</span> },
    { key: "e", title: "Остаток на конец", align: "right", cell: (x) => <b>{BM.rows[x].end != null ? fmt(BM.rows[x].end as number) : "—"}</b> },
  ];
  const dayCols: RowColumn<RsDay>[] = [
    { key: "d", title: "День", main: true, cell: (x) => <>{dShort(x.d)} <span className="ml-1 text-[12px] font-normal text-muted-foreground">{wdOf(x.d)}</span></> },
    { key: "s", title: "Утром", align: "right", cell: (x) => (x.s != null ? fmt(x.s) : "—") },
    { key: "i", title: "Поступило", align: "right", sub: true, cell: (x) => (x.in != null && x.in > 0.5 ? <span className="text-plus">+{fmt(x.in)}</span> : phone ? null : dash) },
    { key: "o", title: "Списано", align: "right", sub: true, cell: (x) => (x.out ? <span className="text-minus">−{fmt(x.out)}</span> : phone ? null : dash) },
    { key: "b", title: "Расходы", hideMobile: true, cell: (x) => <span className="block max-w-64 truncate text-[12.5px] text-muted-foreground">{x.bank.slice(0, 3).map((b) => b.n).join(", ")}{x.bank.length > 3 ? " …" : ""}</span> },
    { key: "e", title: "Вечером", align: "right", cell: (x) => <b>{x.e != null ? fmt(x.e) : "—"}</b> },
  ];
  // раскрытый день: все списания со сменой статьи; назначение платежа — целиком
  const dayOpen = (x: RsDay) => !x.bank.length ? <p className="text-muted-foreground">Списаний в этот день не было.</p> : (
    <ul className="flex flex-col gap-2">
      {x.bank.map((b, i) => (
        <li key={i} className="flex flex-col gap-1.5 border-b border-border/60 pb-2 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <span className="min-w-0 break-words sm:flex-1">{b.n}</span>
          <span className="flex items-center justify-between gap-3 sm:justify-end">
            <select aria-label="Статья расхода" value={catOf(b)} onChange={(e) => setCat(x.d, i, e.target.value)} onClick={(e) => e.stopPropagation()}
              className="h-8 min-w-0 max-w-[60%] rounded-lg border border-input bg-transparent px-2 text-[13px] dark:bg-input/30">{CAT_NAMES.map((c) => <option key={c}>{c}</option>)}</select>
            {b.c ? <span className="text-[12px] text-muted-foreground">вручную</span> : null}
            <b className="num">{fmt(+(b.a as number))}</b>
          </span>
        </li>))}
    </ul>);

  return (
    <div className="flex flex-col gap-3.5">
      <Segments aria-label="Месяц" items={[...ms.map((x) => ({ key: x, label: mn(x) })), ...(ms.length > 1 ? [{ key: "all", label: "Все месяцы" }] : [])]} value={m} onChange={pick} />
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <Tile i={nx()} hero><TileLabel>{"Остаток на " + (C.startD ? dShort(C.startD) : "начало")}</TileLabel>{C.start != null ? <TileValue count={C.start} suffix=" сум" /> : <TileValue>—</TileValue>}<TileSub>утро первого дня с выпиской</TileSub></Tile>
        <Tile i={nx()}><TileLabel>{"Поступило " + lbl}</TileLabel><TileValue className="text-plus">{"+" + fmt(C.in) + " сум"}</TileValue><TileSub>терминал, Payme, перечисления</TileSub></Tile>
        <Tile i={nx()}><TileLabel>{"Списано " + lbl}</TileLabel><TileValue>{"−" + fmt(C.out) + " сум"}</TileValue><TileSub>{`${C.outDays} ${pl(C.outDays, "день", "дня", "дней")} со списаниями`}</TileSub></Tile>
        <Tile i={nx()}><TileLabel>{"Остаток на " + (C.endD ? dShort(C.endD) : "конец")}</TileLabel>{C.end != null ? <TileValue count={C.end} suffix=" сум" /> : <TileValue>—</TileValue>}<TileSub>по последней выписке</TileSub></Tile>
      </div>

      <Card i={nx()} title={"Движение по дням" + per} note="по дням">
        <Chart L={C.days} />
        <p className="text-[12.5px] text-muted-foreground">Зелёное — поступило на счёт, красное — списано, линия — остаток вечером.</p>
      </Card>

      <Card i={nx()} title="Расходы по месяцам" note="по статьям">
        <p className="text-[12.5px] text-muted-foreground">Все списания со счёта по статьям. Статья определяется по названию расхода; поменять её можно в раскрытом дне ниже.</p>
        <RowCards columns={ord(catCols, "tot")} rows={cats} rowKey={(c) => c} dense
          footer={<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-semibold"><span>Итого списано</span>
            <span className="num flex flex-wrap gap-x-4">{ms.map((x) => <span key={x}><span className="font-normal text-muted-foreground">{mn(x)} </span>{fmt(BM.rows[x].out)}</span>)}<span><span className="font-normal text-muted-foreground">Итого </span>{fmt(totOut)}</span></span></div>} />
        <div className="mt-2"><RowCards columns={ord(monCols, "e")} rows={ms} rowKey={(x) => x} dense /></div>
      </Card>

      <Card i={nx()} title={"Расходы по дням" + per} note="нажмите день">
        <p className="text-[12.5px] text-muted-foreground">Нажмите на день, чтобы увидеть все списания, поменять статью или исправить выписку.</p>
        <RowCards columns={ord(dayCols, "e")} rows={L.slice(pg.from, pg.to)} rowKey={(x) => x.d} expand={dayOpen} empty="Нет выписок за период" />
        {pg.bar}
      </Card>
    </div>
  );
}
