// Вкладка «Выручка и темп»: пазл 12×4 — два уголка (график по дням + недели, дни недели + лучший день), коралловая пара с перемычкой.
import { Empty } from "./parts";
import { plOff } from "./logic";
import { layout } from "./layout";
import { Bar, FitCols, Piece, Puzzle, Scroll, type Join } from "./Puzzle";
import { BAR, BAR_BEST, BAR_LIVE, BAR_OFF, digits, wOf, type TabIn } from "./tabs";
import { dayList } from "./base";
import { mln, mn, needPerDay, planPath, unitOf, weekSpans } from "./pace";
import { dShort, fmt, MONTHS, niceStep, today, WD, wdIdx } from "./util";
import { cn } from "@/lib/utils";

const TXT_BEST = "color-mix(in srgb, var(--piece-blue) 60%, var(--foreground))";
const CUM = "var(--chart-4)";
const axis = (v: number, div: number) => { const x = v / div; return Number.isInteger(x) ? String(x) : x.toFixed(1).replace(".", ","); };
const dayTxt = (d: string) => dShort(d) + " · " + WD[wdIdx(d)].toLowerCase();

export function TabRevenue({ T }: { T: TabIn }) {
  const { c, F, m } = T;
  const chart = !!(T.wid(1) || T.wid(6)), c4 = T.card(4), c3 = T.card(3), c12 = T.card(12), c13 = T.card(13);
  const need = T.on(5) ? needPerDay(c, F, m.r) : null;
  const L = layout([
    { id: "chart", r: [0, 0, 7, 3], on: chart }, { id: "weeks", r: [0, 3, 4, 1], on: !!T.wid(44) }, { id: "dow", r: [7, 0, 5, 2], on: !!T.wid(43) },
    { id: "best", r: [9, 2, 3, 1], on: !!c12 }, { id: "fc", r: [7, 2, 2, 1], on: !!c4 }, { id: "need", r: [6, 3, 2, 1], on: !!need },
    { id: "avg", r: [4, 3, 2, 1], on: !!c3 }, { id: "nos", r: [8, 3, 1, 1], rn: [8, 3, 2, 1], on: !!c13 }, { id: "months", r: [9, 3, 3, 1], rn: [10, 3, 2, 1], on: !!T.wid(45) },
  ]);
  const ids = ["chart", "weeks", "dow", "best", "fc", "need", "avg", "nos", "months"], some = ids.some((i) => L.on(i)), all = ids.every((i) => L.on(i));
  const J = (a: string, b: string, j: Join) => (L.keep(a, b) ? j : undefined);
  const D = (id: string) => ({ d: L.rect(id), dn: L.narrow(id) });
  if (!some) return <Empty>Все показатели этой вкладки выключены. Включите нужные в «Показатели».</Empty>;
  const auto = !L.ok;
  const days = dayList(m.r);
  const w1 = wOf(T, 1, "line"), w6 = wOf(T, 6, "line");
  const cumDiff = (a: number[]) => a.map((v, i) => v - (a[i - 1] || 0));
  const vals = w1 ? w1.series[0].vals : w6 ? cumDiff(w6.series[0].vals) : [];

  // лучший и слабый день (слабый — среди дней с продажами, как в карточке)
  const pos = vals.map((v, i) => ({ v, d: days[i] })).filter((x) => x.v > 0).sort((a, b) => b.v - a.v);
  const best = pos[0], worst = pos[pos.length - 1];

  return (
    <Puzzle auto={auto} pf={!all} jd jp>
      {chart && <Piece {...D("chart")} p={[0, 0, 2, 6]} f={[2, 250]} m={[6, 340]} join={J("chart", "weeks", "a-top")} title="Выручка по дням"
        right={<ChartLegend plan={T.on(5) ? planPath(c, F, days) : null} hasCum={!!w6} hasPrev={!!w1?.series[1]} best={best} />}>
        <RevChart T={T} days={days} vals={vals} />
      </Piece>}
      {T.wid(44) && <Piece {...D("weeks")} p={[0, 6, 1, 4]} f={[1, 190]} m={[6, 190]} join={J("chart", "weeks", "a-sleeve")} title="По неделям" nh note={unitOf(Math.max(1, ...wOf(T, 44, "bars")!.vals)).note}>
        <Weeks T={T} />
      </Piece>}
      {T.wid(43) && <Piece {...D("dow")} p={[0, 10, 2, 4]} f={[2, 200]} m={[6, 290]} join={J("dow", "best", "b-top")} title="По дням недели" note="средняя выручка дня">
        <DayOfWeek T={T} />
      </Piece>}
      {c12 && <Piece {...D("best")} p={[1, 14, 1, 2]} f={[1, 90]} m={[3, 150]} join={J("dow", "best", "b-sleeve")} label={<>Лучший<span className="@max-[639px]/main:hidden"> и слабый</span> день</>} hint={c12.label} spread>
        {best ? <>
          <div className="@min-[640px]/main:hidden">
            <div className="pz-v">{mln(best.v)}</div>
            <div className="pz-s mt-1">{dayTxt(best.d)}{worst && worst !== best ? ` · слабый ${dShort(worst.d)}` : ""}</div>
          </div>
          <div className="flex min-w-0 flex-col gap-2.5 @max-[639px]/main:hidden">
            <div className="flex items-center justify-between gap-3"><span className="pz-v" style={{ fontSize: "clamp(22px,2cqw,34px)" }}>{mln(best.v)}</span><span className="pz-s">{dayTxt(best.d)}</span></div>
            {worst && worst !== best && <div className="flex items-center justify-between gap-3"><span className="num text-[clamp(16px,1.3cqw,22px)] font-bold">{mln(worst.v)}</span><span className="pz-s">{dayTxt(worst.d)}</span></div>}
          </div>
        </> : c12 ? <div className="min-w-0" title={c12.d}><div className="pz-v">{digits(c12.v) ? mln(digits(c12.v)) : c12.v}</div><div className="pz-s mt-1.5 line-clamp-2">{c12.d}</div></div> : <span className="pz-v">—</span>}
      </Piece>}
      {c4 && <Piece {...D("fc")} p={[1, 6, 1, 2]} f={[1, 100]} m={[3, 150]} tone={need?.done ? "g" : "c"} label={c4.label.startsWith("Прогноз") ? <>Прогноз<span className="@max-[639px]/main:hidden"> месяца</span></> : c4.label} hint={c4.label} spread
        bridge={need && need.mode === "need" && L.keep("fc", "need") ? { dir: "v", d: "calc((100% - var(--pg)) / 4)", p: "50%" } : undefined}>
        <Forecast T={T} plan={need?.plan || 0} />
      </Piece>}
      {need && <Piece {...D("need")} p={[1, 8, 1, 2]} f={[1, 100]} m={[3, 150]} tone={need.done ? "g" : need.mode === "need" ? "c" : "n"} label={need.done ? "План выполнен" : <>{need.mode === "need" ? "Нужно в " : "Выручка на "}<span className="@max-[639px]/main:hidden">рабочий</span><span className="@min-[640px]/main:hidden">раб.</span> день</>} hint={need.mode === "need" ? "Нужно в рабочий день" : need.label} spread>
        <div className="min-w-0"><div className="pz-v">{need.v == null ? "—" : (need.done ? "+" : "") + mln(need.v)}</div><div className="pz-s mt-1.5 truncate" title={need.sub}>{need.sub}</div></div>
      </Piece>}
      {c3 && <Piece {...D("avg")} p={[0, 14, 1, 2]} f={[1, 90]} m={[3, 150]} label={<>В среднем<span className="@max-[639px]/main:hidden"> за день</span></>} hint={c3.label} spread>
        <div className="min-w-0"><div className="pz-v">{mln(digits(c3.v))}</div><div className="pz-s mt-1.5 truncate" title={c3.d}>{c3.d}</div></div>
      </Piece>}
      {c13 && <Piece {...D("nos")} p={[0, 16, 1, 3]} f={[1, 130]} m={[3, 150]} label="Без продаж" hint={c13.label} spread>
        <div className="min-w-0"><div className="pz-v">{c13.v}</div><div className="pz-s mt-1.5 line-clamp-2" title={c13.d}>{c13.v === "0" ? "каждый день были продажи" : c13.d.replace(/…$/, "")}</div></div>
      </Piece>}
      {T.wid(45) && <Piece {...D("months")} p={[1, 16, 1, 3]} f={[1, 130]} m={[6, 170]} title="По месяцам" nh note={unitOf(Math.max(1, ...wOf(T, 45, "bars")!.vals)).note}>
        <Months T={T} />
      </Piece>}
    </Puzzle>
  );
}

// ---------- график «Выручка по дням» ----------
function ChartLegend({ plan, hasCum, hasPrev, best }: { plan: ReturnType<typeof planPath>; hasCum: boolean; hasPrev: boolean; best?: { v: number; d: string } }) {
  const it = "inline-flex items-center gap-1.5 whitespace-nowrap";
  return (
    <>
      <span className="pz-s hidden items-center gap-4 @min-[1500px]/main:flex">
        <span className={it}><i className="size-2.5 rounded-[3px]" style={{ background: BAR }} />день</span>
        {hasCum && <span className={it}><i className="h-1 w-4 rounded-full" style={{ background: CUM }} />нарастающий итог</span>}
        {plan && <span className={it}><i className="h-0 w-4 border-t-2 border-dashed border-foreground/60" />путь к плану {mln(plan.total)}</span>}
        {hasPrev && <span className={it}><i className="h-0.5 w-3 bg-muted-foreground" />прошлый период</span>}
        <span className={it}><i className="size-2.5 rounded-[3px]" style={{ background: BAR_OFF }} />выходной</span>
      </span>
      {best && <span className="pz-s truncate @min-[1500px]/main:hidden">лучший {dShort(best.d)} · {mn(best.v)}</span>}
    </>
  );
}

function RevChart({ T, days, vals }: { T: TabIn; days: string[]; vals: number[] }) {
  const { c, F } = T, N = days.length;
  const w1 = wOf(T, 1, "line"), w6 = wOf(T, 6, "line"), td = today();
  const prevDay = w1?.series[1]?.vals, cum = w6?.series[0].vals, prevCum = w6?.series[1]?.vals;
  const plan = T.on(5) ? planPath(c, F, days) : null;
  const mx = Math.max(1, ...vals), TOP = mx * 1.15, step = niceStep(TOP / 3), u = unitOf(TOP), ticks: number[] = []; for (let v = 0; v <= TOP; v += step) ticks.push(v);
  const bi = vals.indexOf(Math.max(...vals)), hasBest = vals[bi] > 0;
  const last = Math.max(0, Math.min(N - 1, days.indexOf(td) >= 0 ? days.indexOf(td) : days.filter((d) => d <= td).length - 1));
  // линии: своя шкала, общая для нарастающего итога, плана и прошлого периода
  const LMAX = Math.max(1, ...(cum ? cum.slice(0, last + 1) : [0]), ...(plan ? plan.vals : [0]), ...(prevCum || [0])) * 1.04;
  const X = (i: number) => ((i + 0.5) / N) * 100, Y = (v: number) => 100 - (v / LMAX) * 100;
  const pts = (a: number[], to: number) => a.slice(0, to + 1).map((v, i) => `${X(i).toFixed(2)},${Y(v).toFixed(2)}`).join(" ");
  const multi = days[0]?.slice(0, 7) !== days[N - 1]?.slice(0, 7);
  const tstep = N <= 12 ? 1 : N <= 31 ? 3 : Math.ceil(N / 9);
  const gap = N > 45 ? "gap-px" : "gap-[3px] @min-[640px]/main:gap-2";
  const cols = { gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` };
  const endV = cum ? cum[last] : 0;
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[0_minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto] @min-[640px]/main:grid-cols-[52px_minmax(0,1fr)] @min-[640px]/main:gap-x-3">
      <div className="pz-s num relative col-start-1 row-start-1 @max-[639px]/main:hidden">
        {ticks.map((v, k) => <span key={k} className="absolute right-0 -translate-y-1/2 whitespace-nowrap" style={{ top: 100 - (v / TOP) * 100 + "%" }}>{axis(v, u.div)}{k === ticks.length - 1 ? " " + (u.div === 1e6 ? "млн" : "тыс") : ""}</span>)}
      </div>
      <div className="relative col-start-2 row-start-1 min-h-0">
        {ticks.map((v, k) => <i key={k} aria-hidden="true" className="absolute inset-x-0 border-t border-border" style={{ top: 100 - (v / TOP) * 100 + "%" }} />)}
        <div className={cn("grid h-full items-end", gap)} style={cols}>
          {vals.map((v, i) => {
            const off = plOff(c, days[i]) || v <= 0, live = days[i] === td, hi = hasBest && i === bi;
            return (
              <i key={i} title={`${dShort(days[i])}: ${fmt(v)} сум`} className={cn("relative block", N > 45 ? "rounded-t-[2px]" : "rounded-t-[7px] rounded-b-[2px]")}
                style={{ height: Math.max(v > 0 ? 1 : 3, (v / TOP) * 100) + "%", background: live ? BAR_LIVE : hi ? BAR_BEST : off ? BAR_OFF : BAR }}>
                {hi && <b className="num absolute bottom-[calc(100%+4px)] left-1/2 -translate-x-1/2 text-[12.5px] whitespace-nowrap italic">{u.f(v)}</b>}
                {prevDay && prevDay[i] > 0 && <s title={`прошлый период: ${fmt(prevDay[i])} сум`} className="absolute inset-x-[-1px] h-0.5 bg-muted-foreground no-underline" style={{ bottom: Math.min(100, (prevDay[i] / TOP) * 100) + "%" }} />}
              </i>
            );
          })}
        </div>
        {(cum || plan) && (
          <svg className="pointer-events-none absolute inset-0 size-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {prevCum && <polyline points={pts(prevCum, N - 1)} fill="none" stroke="var(--muted-foreground)" strokeOpacity=".55" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 2 }} />}
            {plan && <polyline points={pts(plan.vals, N - 1)} fill="none" stroke="var(--foreground)" strokeOpacity=".5" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 1.5 }} />}
            {cum && <polyline points={pts(cum, last)} fill="none" stroke={CUM} strokeLinejoin="round" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 3 }} />}
          </svg>
        )}
        {cum && endV > 0 && <span className="num pointer-events-none absolute z-10 rounded-full px-2 py-[2px] text-[11.5px] font-bold whitespace-nowrap text-black @min-[640px]/main:text-[12.5px] @max-[639px]/main:hidden" style={{ left: X(last) + "%", top: `max(26px, calc(${Y(endV)}% - 10px))`, transform: "translate(-100%,-100%)", background: CUM }}>{mln(endV)}{plan ? ` · ${Math.round((endV / plan.total) * 100)}%` : ""}</span>}
      </div>
      <div className={cn("pz-s num col-start-2 row-start-2 mt-1.5 grid", gap)} style={cols}>
        {days.map((d, i) => {
          const hi = hasBest && i === bi, show = hi || (i % tstep === 0 && Math.abs(i - bi) > 2);
          return <span key={i} className={cn("flex justify-center whitespace-nowrap", hi && "font-bold text-foreground")}>{show ? <>{multi ? dShort(d) : d.slice(8)}{hi && <span className="@max-[639px]/main:hidden"> · лучший</span>}</> : null}</span>;
        })}
      </div>
    </div>
  );
}

// ---------- прогноз ----------
function Forecast({ T, plan }: { T: TabIn; plan: number }) {
  const c4 = T.card(4)!, v = mln(digits(c4.v));
  const rng = /скорее всего (.+?) · (.*)$/.exec(c4.d);
  const l1 = rng ? "вилка " + rng[1].replace(/ (млн|тыс)(?=–)/, "") : c4.d;
  return <div className="min-w-0" title={c4.d}><div className="pz-v">{v}</div><div className="pz-s mt-1.5 truncate">{l1}</div>{rng && plan > 0 && <div className="pz-s truncate">план {mln(plan)}</div>}</div>;
}

// ---------- недели ----------
function Weeks({ T }: { T: TabIn }) {
  const w = wOf(T, 44, "bars")!, sp = weekSpans(T.m.r);
  const all = w.vals.map((v, i) => ({ v, label: sp.length === w.vals.length ? sp[i].label : w.labels[i], live: sp.length === w.vals.length && sp[i].live }));
  const mx = Math.max(1, ...w.vals), bi0 = w.vals.indexOf(Math.max(...w.vals)), u = unitOf(mx);
  const items = all.filter((o) => o.v > 0), bi = items.indexOf(all[bi0]);
  return (
    <>
      <FitCols count={items.length} min={84} gap={20} wrap="@max-[639px]/main:hidden" className="items-end">
        {items.map((o, i) => (
          <div key={i} className="min-w-0"><div className="num text-[26px] leading-none font-extrabold" style={{ color: i === bi ? TXT_BEST : undefined }}>{u.f(o.v)}</div>
            <Bar v={o.v / mx} color={o.live ? BAR_LIVE : i === bi ? BAR_BEST : BAR} className="mt-2 mb-1.5" /><div className="pz-s flex items-center gap-1.5 whitespace-nowrap">{o.label}{o.live && <i title="неделя идёт" className="size-1.5 rounded-full bg-[var(--piece-blue)]" />}</div></div>
        ))}
      </FitCols>
      <Scroll className="hidden @max-[639px]/main:block">
        {items.map((o, i) => <div key={i} className="flex min-h-9 items-center justify-between gap-3 border-t border-border text-[13px] first:border-t-0"><span className="flex items-center gap-1.5">{o.label}{o.live && <i title="неделя идёт" className="size-1.5 rounded-full bg-[var(--piece-blue)]" />}</span><b className="num text-[15px]" style={{ color: i === bi ? TXT_BEST : undefined }}>{u.f(o.v)}</b></div>)}
      </Scroll>
    </>
  );
}

// ---------- по дням недели ----------
function DayOfWeek({ T }: { T: TabIn }) {
  const w = wOf(T, 43, "bars")!, mx = Math.max(1, ...w.vals), bi = w.vals.indexOf(Math.max(...w.vals)), u = unitOf(mx);
  return (
    <div className="grid min-h-0 flex-1 grid-cols-7 gap-2 @min-[640px]/main:gap-3.5">
      {w.vals.map((v, i) => {
        const off = v < mx * 0.08;
        return (
          <div key={i} className="flex min-h-0 min-w-0 flex-col gap-1.5 text-center">
            <b className="num text-[12.5px] @min-[640px]/main:text-[16px]" style={{ color: i === bi ? TXT_BEST : undefined }}>{u.f(v)}</b>
            <div className="flex min-h-0 flex-1 items-end"><i className="block w-full rounded-t-[6px] @min-[640px]/main:rounded-t-[10px]" title={`${fmt(v)} сум в среднем`} style={{ height: Math.max(3, (v / mx) * 100) + "%", background: i === bi ? BAR_BEST : off ? BAR_OFF : BAR }} /></div>
            <span className={cn("pz-s", i === bi && "font-bold text-foreground")}>{WD[i].toLowerCase()}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---------- по месяцам ----------
function Months({ T }: { T: TabIn }) {
  const w = wOf(T, 45, "bars")!, mx = Math.max(1, ...w.vals), bi = w.vals.indexOf(Math.max(...w.vals)), u = unitOf(mx), td = today();
  const cur = MONTHS[+td.slice(5, 7) - 1] + " " + td.slice(0, 4), toTd = T.m.r.to >= td;
  const years = new Set(w.labels.map((l) => l.slice(-4))).size > 1;
  const items = w.vals.map((v, i) => ({ v, name: years ? w.labels[i] : w.labels[i].replace(/ \d{4}$/, ""), live: toTd && w.labels[i] === cur }));
  return (
    <>
      <FitCols count={items.length} min={64} gap={16} wrap="@max-[639px]/main:hidden">
          {items.map((o, i) => (
            <div key={i} className="flex min-h-0 min-w-0 flex-col gap-1.5">
              <div className="flex min-h-0 flex-1 items-end"><i className="block w-full rounded-t-lg rounded-b-[3px]" style={{ height: Math.max(4, (o.v / mx) * 100) + "%", background: o.live ? BAR_LIVE : i === bi ? BAR_BEST : BAR }} /></div>
              <b className="num text-[clamp(16px,1.3cqw,22px)] leading-none" style={{ color: i === bi ? TXT_BEST : undefined }}>{u.f(o.v)}</b>
              <span className="pz-s whitespace-nowrap">{o.name}{o.live ? " · идёт" : ""}</span>
            </div>
          ))}
      </FitCols>
      <Scroll className="hidden @max-[639px]/main:block">
        {items.map((o, i) => <div key={i} className="flex min-h-8 items-center justify-between gap-3 border-t border-border text-[13px] first:border-t-0"><span>{o.name}{o.live ? " · идёт" : ""}</span><b className="num text-[15px]" style={{ color: i === bi ? TXT_BEST : undefined }}>{u.f(o.v)}</b></div>)}
      </Scroll>
    </>
  );
}
