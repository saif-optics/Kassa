// Содержимое виджетов Аналитики (графики, таблицы, прибыль собственнику): общий рисовальщик для блоков пазла.
import { cn } from "@/lib/utils";
import { Segments } from "@/components/Segments";
import { RowCards, type RowColumn } from "@/components/RowCards";
import { pointColor } from "./base";
import type { Widget } from "./logic";
import { BarsC, DonutC, GroupBarsC, HBars, LineC, None, ParetoC, WaterfallC } from "./charts";
import { Dim, MBar, Sub, Sw, Tbl, Td, Th } from "./parts";
import { dShort, fmt, fmtM, pctF, pl } from "./util";

const WDN = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const TAPROW = () => "max-sm:[&>[role=button]]:min-h-10 max-sm:[&>[role=button]]:justify-center";

// ---------- содержимое виджетов ----------
export function renderW(w: Widget, points: string[], setPgCat: (c: string) => void, fill?: boolean): React.ReactNode {
  const F = fill ? ({ h: "fill" } as const) : {};
  switch (w.kind) {
    case "line": return <LineC labels={w.labels} series={w.series} h={fill ? "fill" : undefined} />;
    case "donut": return <DonutC items={w.items} center={w.center} sub={w.sub} />;
    case "groupBars": return <GroupBarsC labels={w.labels} series={w.series} {...F} />;
    case "hbars": return <HBars items={w.items} rank={w.rank} dot={w.dot} cols={w.ids[0] === 38} />;
    case "expenses": return <><Sub>По точкам</Sub><HBars items={w.byPoint} /><Sub>По статьям</Sub><HBars items={w.byArt} /></>;
    case "waterfall": return w.steps ? <WaterfallC steps={w.steps} {...F} /> : <None />;
    case "bars": {
      const signed = w.vk === "signed", qty = w.vk === "qty";
      return <BarsC labels={w.labels} vals={w.vals} colors={w.colors} color={w.color} hl={w.hl}
        fmtV={signed ? (v) => (v < 0 ? "недостача " : "излишек ") + fmt(Math.abs(v)) : qty ? (v) => v + " шт" : fmt}
        lblV={signed ? (v) => (v < 0 ? "−" : "+") + fmtM(Math.abs(v)) : qty ? String : fmtM} h={fill ? "fill" : 260} />;
    }
    case "ranges": {
      if (!w.rows.length) return <None />;
      const mx = Math.max(1, ...w.rows.map((o) => o.avg));
      return (
        <div className="flex flex-col gap-3.5">
          {w.rows.map((o) => (
            <div key={o.k} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3"><span className="min-w-0 truncate text-[13.5px]"><Sw color={o.color} />{o.k}</span><b className="num text-[13.5px]">{fmt(o.avg)}</b></div>
              <div className="relative h-2 rounded-full bg-muted">
                <span className="absolute top-0 h-full rounded-full bg-foreground/15" style={{ left: o.min / mx * 100 + "%", width: Math.max(0.5, (Math.min(o.max, mx) - o.min) / mx * 100) + "%" }} />
                <span className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background" style={{ left: Math.min(100, o.avg / mx * 100) + "%", background: o.color }} />
              </div>
              <div className="text-[12px] text-muted-foreground">{fmt(o.u)} ед. · от {fmt(o.min)} до {fmt(o.max)} · выручка {fmtM(o.r)}</div>
            </div>
          ))}
        </div>
      );
    }
    case "top": {
      if (!w.rows.length) return <None />;
      type R = (typeof w.rows)[number];
      const mx = Math.max(1, ...w.rows.map((o) => o[w.by])), byR = w.by === "r";
      const cols: RowColumn<R>[] = [
        { key: "k", title: "Товар", main: true, cell: (o) => (
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="flex min-w-0 items-center gap-2"><span className={cn("num grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-semibold", w.rows.indexOf(o) < 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{w.rows.indexOf(o) + 1}</span><span className="line-clamp-2 min-w-0 break-words">{o.k}</span></span>
            <span className="block h-1.5 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full" style={{ width: o[w.by] / mx * 100 + "%", background: byR ? "var(--primary)" : "var(--chart-3)" }} /></span>
          </div>) },
        { key: "cat", title: "Категория", hideMobile: true, cell: (o) => <span className="text-muted-foreground">{o.cat || "—"}</span> },
        { key: "v", title: byR ? "Выручка" : "Штук", align: "right", cell: (o) => (byR ? fmt(o.r) : fmt(o.u) + " шт") },
        { key: "a", title: byR ? "Штук" : "Выручка", align: "right", sub: true, cell: (o) => (byR ? fmt(o.u) + " шт" : fmt(o.r)) },
        { key: "p", title: "Ср. цена", align: "right", sub: true, cell: (o) => "ср. " + fmt(o.u ? o.r / o.u : 0) },
        { key: "sh", title: "Доля", align: "right", sub: true, cell: (o) => pctF(w.tot ? o[w.by] / w.tot : 0) },
      ];
      return <RowCards columns={cols} rows={w.rows} rowKey={(o) => o.k} dense rowClass={TAPROW} footer={<span className="text-muted-foreground">Всего за период: <b className="num text-foreground">{fmt(w.tot)}{byR ? " сум" : " шт"}</b></span>} />;
    }
    case "pg": {
      const mxu = Math.max(1, ...w.bands.map((o) => o.u)), best = w.bands[w.best];
      type B = (typeof w.bands)[number];
      const cols: RowColumn<B>[] = [
        { key: "g", title: "Ценовая группа", main: true, cell: (o) => <span>{o.lbl}{w.U && o === best ? <span className="ml-2 rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-semibold text-primary">чаще всего</span> : null}</span> },
        { key: "r", title: "Выручка", align: "right", cell: (o) => (o.r ? fmt(o.r) : <Dim />) },
        { key: "u", title: "Шт", align: "right", sub: true, cell: (o) => (o.u ? fmt(o.u) + " шт" : "") },
        { key: "sh", title: "Доля в штуках", sub: true, cell: (o) => (o.u ? pctF(o.u / w.U) : "") },
        { key: "bar", title: "", hideMobile: true, width: "160px", cell: (o) => <div className="h-2 min-w-[100px] overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-primary" style={{ width: o.u / mxu * 100 + "%" }} /></div> },
        { key: "top", title: "Чаще всего покупают", cell: (o) => <span className="text-[12px] text-muted-foreground">{o.top.map(([k, v]) => <span key={k} className="mr-2 inline-block">{k} <b className="text-foreground">×{v}</b></span>)}{!o.top.length && "—"}</span> },
      ];
      return (
        <>
          <Segments aria-label="Категория" className="mb-3" value={w.cat} onChange={setPgCat} items={[["all", "Все"], ...w.cats.map((x) => [x, x])].map(([key, label]) => ({ key, label }))} />
          {w.U ? <>
            <p className="mb-3 text-[13px] text-muted-foreground">Больше всего покупают в группе <b className="text-foreground">{best.lbl}</b>: {fmt(best.u)} шт ({pctF(best.u / w.U)}) на {fmt(best.r)} сум. Цена — за одну единицу после скидки.</p>
            <RowCards columns={cols} rows={w.bands} rowKey={(o) => o.lbl} dense rowClass={TAPROW} />
          </> : <None />}
        </>
      );
    }
    case "pareto": return <ParetoC items={w.items} />;
    case "lost": {
      type L = (typeof w.rows)[number];
      const cols: RowColumn<L>[] = [
        { key: "k", title: "Товар", main: true, cell: (o) => o.k },
        { key: "r", title: "Было выручки", align: "right", cell: (o) => fmt(o.r) },
        { key: "u", title: "Было ед.", align: "right", sub: true, cell: (o) => fmt(o.u) + " ед." },
        { key: "d", title: "Последняя продажа", align: "right", sub: true, cell: (o) => "посл. " + dShort(o.last) },
      ];
      return w.rows.length
        ? <RowCards columns={cols} rows={w.rows} rowKey={(o) => o.k} dense rowClass={TAPROW} />
        : <p className="text-[13px] text-muted-foreground">Таких товаров нет{w.hist ? "" : ": нужна история продаж до периода"}.</p>;
    }
    case "marginPts": {
      if (!w.has) return <p className="text-[13px] text-muted-foreground">Нет цен покупки.</p>;
      type M = (typeof w.rows)[number];
      const cols: RowColumn<M>[] = [
        { key: "k", title: "Точка", main: true, cell: (o) => <><Sw color={pointColor(points, o.k)} />{o.k}</> },
        { key: "all", title: "Выручка", align: "right", cell: (o) => fmt(o.all) },
        { key: "gp", title: "Прибыль", align: "right", sub: true, cell: (o) => "прибыль " + fmt(o.gp) },
        { key: "m", title: "Маржа", align: "right", sub: true, cell: (o) => (o.m == null ? "" : "маржа " + pctF(o.m)) },
        { key: "rev", title: "Посчитано", align: "right", cell: (o) => fmt(o.rev) },
        { key: "cogs", title: "Себестоимость", align: "right", cell: (o) => fmt(o.cogs) },
        { key: "mb", title: "Маржа, полоса", hideMobile: true, align: "right", cell: (o) => <MBar v={o.m} /> },
        { key: "cov", title: "Покрытие", align: "right", cell: (o) => <span className="text-muted-foreground">{pctF(o.cov)}</span> },
        { key: "tc", title: "Самая прибыльная категория", cell: (o) => (o.tc ? <>{o.tc.k} <span className="text-muted-foreground">· {fmtM(o.tc.gp)} прибыли</span></> : <Dim>нет цен покупки</Dim>) },
      ];
      const T = w.T;
      return (
        <>
          <RowCards columns={cols} rows={w.rows} rowKey={(o) => o.k}
            footer={<span className="flex flex-wrap gap-x-4 gap-y-1"><b>Итого</b><span className="num">выручка {fmt(T.all)}</span><span className="num">посчитано {fmt(T.rev)}</span><span className="num">себестоимость {fmt(T.cogs)}</span><span className="num">прибыль {fmt(T.gp)}</span><span className="num">маржа {pctF(T.rev ? T.gp / T.rev : null)}</span><span className="num">покрытие {pctF(T.all ? T.rev / T.all : 0)}</span></span>} />
          <div className="mt-4"><HBars dot items={w.rows.filter((o) => o.rev).map((o) => ({ label: o.k, value: o.gp, valTxt: fmt(o.gp) + " · " + pctF(o.m), color: pointColor(points, o.k), sub: "прибыль" }))} /></div>
        </>
      );
    }
    case "owner": return <Owner w={w} />;
    case "heat":
      return (
        <>
          <Tbl>
            <thead><tr><Th>Точка</Th>{WDN.map((x) => <Th key={x} r>{x}</Th>)}</tr></thead>
            <tbody>{w.pts.map((p, pi) => (
              <tr key={p}><Td>{p}</Td>{w.avg[pi].map((v, i) => {
                const o = v ? 0.12 + 0.78 * (v / w.hmax) : 0, b = w.best && w.best[pi] === i && v;
                return <td key={i} title={`${p}: в среднем ${fmt(v)} сум`} className="num border-b border-border/60 px-2 py-2 text-center text-[12px]" style={{ background: `color-mix(in srgb, var(--primary) ${Math.round(o * 100)}%, transparent)`, color: o > 0.55 ? "var(--primary-foreground)" : undefined, outline: b ? "2px solid var(--warn)" : undefined, outlineOffset: -2 }}>{v ? fmtM(v) : "—"}</td>;
              })}</tr>))}</tbody>
          </Tbl>
          {w.showBest && w.best && <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[13px]">{w.pts.map((p, pi) => <span key={p}><Sw color={pointColor(points, p)} />{p}: <b>{WDN[w.best![pi]]}</b> · {fmtM(w.avg[pi][w.best![pi]])} в среднем</span>)}</div>}
        </>
      );
    case "text": return <p className="text-[13px] text-muted-foreground">{w.text}</p>;
  }
}

export function Owner({ w }: { w: Extract<Widget, { kind: "owner" }> }) {
  const o = w.o;
  if (!o) return <p className="text-[13px] text-muted-foreground">Считается только за {w.months.length ? w.months.map((m) => ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"][+m.slice(5, 7) - 1]).join(", ") : "месяцы из отчёта"} — по вашему отчёту. Выберите этот месяц в фильтре.</p>;
  const seg = ([["Расходы", o.op, "var(--chart-4)"], ["Кредит", o.credit, "var(--chart-5)"], ["Налог", o.tax, "var(--minus)"], ["Менеджер", o.mgr ? o.mgr.a : 0, "var(--chart-2)"], ["Собственнику", Math.max(0, o.owner), "var(--plus)"]] as [string, number, string][]).filter((x) => x[1] > 0);
  const tot = seg.reduce((x, y) => x + y[1], 0) || 1;
  const ln = (l: string, v: number | null, cls?: string, sub?: string) => <tr key={l} className={cls}><Td>{l}{sub && <small className="mt-0.5 block text-[12px] font-normal text-muted-foreground">{sub}</small>}</Td><Td r className="whitespace-nowrap">{v == null ? "—" : (v < 0 ? "−" : "") + fmt(Math.abs(v))}</Td></tr>;
  const S = "font-semibold bg-muted/50";
  return (
    <>
      {o.gp <= 0 ? <p className="text-[13px] text-muted-foreground">Валовая прибыль не посчитана — нет цен покупки.</p> : (
        <>
          <div className="flex h-3.5 overflow-hidden rounded-full" role="img" aria-label="Куда уходит валовая прибыль">{seg.map(([l, v, col]) => <i key={l} title={`${l}: ${fmt(v)}`} style={{ flex: v / tot, background: col }} />)}</div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">{seg.map(([l, v, col]) => <span key={l}><Sw color={col} />{l} <b>{pctF(v / o.gp)}</b></span>)}{o.owner < 0 && <span className="text-minus">не хватает {fmt(-o.owner)} сум</span>}</div>
        </>
      )}
      <Tbl className="mt-3"><tbody>
        {ln("Выручка", o.rev, "", "все точки")}
        {ln("Себестоимость проданного", o.gp > 0 ? -(o.rev - o.gp) : null, "", o.gp > 0 ? `посчитано по ${pctF(o.cover)} выручки${o.cover < 0.995 ? ", остальное — по средней марже" : ""}` : "нет цен покупки")}
        {ln("Валовая прибыль", o.gp, S)}
        {ln("Расходы", -o.op, "", `${o.n} ${pl(o.n, "строка", "строки", "строк")} из Кассы, резерва и р/с; без закупки товара, вложений в C1 и перемещений`)}
        {o.credit ? ln("Платежи по кредиту", -o.credit, "", "по выписке") : null}
        {o.tp ? ln(`Налог с оборота ${o.tp}%`, -o.tax, "", `с безнала месяца, платится в следующем месяце${o.taxPaid ? ` · в этом месяце уплачено ${fmt(o.taxPaid)} за прошлый` : ""}`) : null}
        {ln("Прибыль до доли менеджера", o.before, S)}
        {o.mgr ? ln(`Доля менеджера ${o.mgr.share}%`, -o.mgr.a, "", `от прибыли ${o.mgr.pts.join(" + ")}: база ${fmt(o.mgr.base)}${o.mgr.adv ? ` · выплачено авансом ${fmt(o.mgr.adv)}` : ""}`) : null}
        {ln("Остаётся собственнику", o.owner, S + " text-plus")}
      </tbody></Tbl>
      {o.top.length > 0 && <details className="mt-3"><summary className="cursor-pointer text-[13px] font-medium">Самые крупные расходы месяца</summary>
        <div className="mt-2 flex flex-col gap-1.5">{o.top.slice(0, 8).map((x, i) => <div key={i} className="flex justify-between gap-3 text-[13px]"><span className="min-w-0">{dShort(x.d)} · <span className="text-muted-foreground">{x.f}</span> {x.n}</span><b className="num shrink-0">{fmt(x.a)}</b></div>)}</div></details>}
      <p className="mt-3 text-[12.5px] text-muted-foreground">Не вошло в прибыль: закупка товара {fmt(o.goods)} (уже в себестоимости), вложения в C1 {fmt(o.inv)}. Деньги считаются по дате оплаты.</p>
    </>
  );
}
