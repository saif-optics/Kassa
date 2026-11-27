// Вкладки «Точки», «Чеки», «Касса и оплаты», «Прибыль и скидки»: пазлы на общих деталях (уголки, перемычки).
import { Fragment, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Empty, MBar, Sub } from "./parts";
import { HBars, MiniRing, Spark } from "./charts";
import { Piece, Puzzle, Scroll, type Bridge, type Join, type Tone } from "./Puzzle";
import { layout } from "./layout";
import { kassaNow } from "./logic";
import { digits, wOf, type TabIn } from "./tabs";
import { mln, mn } from "./pace";
import { renderW } from "./widgets";
import { fmt, fmtM, pctF, WD } from "./util";
import { pointColor } from "./base";

const OFF = <Empty>Все показатели этой вкладки выключены. Включите нужные в «Показатели».</Empty>;
type W = NonNullable<ReturnType<TabIn["wid"]>>;
type C = NonNullable<ReturnType<TabIn["card"]>>;

/** подзаголовок виджета — в подсказку значка i (кроме «Прибыль собственнику» без месяца) */
const wi = (w: W) => (w.kind === "owner" && !w.o ? undefined : w.note || undefined);
/** тело виджета: график растягивается на весь блок, таблицы и списки прокручиваются */
function WBody({ T, w, fill, xy }: { T: TabIn; w: W; fill?: boolean; xy?: boolean }) {
  if (fill) return <div className="flex min-h-[220px] min-w-0 flex-1 flex-col @min-[1060px]/main:min-h-0">{renderW(w, T.c.points, T.setPgCat, true)}</div>;
  return <Scroll xy={xy}><div className="flex flex-col gap-2">{renderW(w, T.c.points, T.setPgCat)}</div></Scroll>;
}
/** карточка показателя в блоке: значение, пояснение, при наличии — кольцо или линия */
function CardBody({ c, big }: { c: C; big?: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className={cn("pz-vx min-w-0", c.warn && "text-warn")}>{c.v}</span>
        {c.spark ? <Spark vals={c.spark.vals} color={c.spark.color} /> : c.ring ? <div className={big ? "[&>svg]:size-24" : undefined}><MiniRing p={c.ring.p} color={c.ring.color} /></div> : null}
      </div>
      <span className={cn("pz-s line-clamp-3", c.d.startsWith("▲") && "!text-plus", c.d.startsWith("▼") && "!text-minus")} title={c.d}>{c.d || " "}</span>
    </div>
  );
}
const HBR = { dir: "h" as const, d: "calc(var(--rh) / 2)" };
const VBR = { dir: "v" as const, d: "50%" };
const OFFMSG = "Все показатели этой вкладки выключены. Включите нужные в «Показатели».";
type Lay = ReturnType<typeof layout>;
const joiner = (L: Lay) => (a: string, b: string, j: Join) => (L.keep(a, b) ? j : undefined);
const bridger = (L: Lay, a: string, b: string, br: Bridge) => (L.keep(a, b) ? br : undefined);
const anyOn = (L: Lay, ids: string[]) => ids.some((i) => L.on(i));

// ============ Точки ============
export function TabPoints({ T }: { T: TabIn }) {
  const w14 = T.wid(14), w15 = T.wid(15), w16 = T.wid(16), w18 = T.wid(18), w19 = T.wid(19), heat = T.wid(46) || T.wid(47);
  const L = layout([
    { id: "days", r: [0, 0, 7, 2], on: !!w14 }, { id: "rate", r: [7, 0, 5, 2], on: !!w18 }, { id: "share", r: [9, 2, 3, 2], on: !!w15 },
    { id: "perday", r: [7, 2, 2, 2], on: !!w19 }, { id: "now", r: [0, 2, 7, 1], on: !!w16 }, { id: "heat", r: [0, 3, 7, 1], on: !!heat && heat.kind === "heat" && heat.pts.length > 0 },
  ]);
  if (!anyOn(L, ["days", "rate", "share", "perday", "now", "heat"])) return OFF;
  const J = joiner(L);
  return (
    <Puzzle auto={!L.ok} pf jp={false}>
      {w14 && <Piece d={L.rect("days")} m={[6, 340]} f={[2, 300]} title={w14.title} hint={w14.title} info={wi(w14)}><WBody T={T} w={w14} fill /></Piece>}
      {w18 && <Piece d={L.rect("rate")} m={[3, 340]} f={[2, 0]} join={J("rate", "share", "b-top")} title={w18.title} hint={w18.title} info={wi(w18)}><WBody T={T} w={w18} /></Piece>}
      {w15 && <Piece d={L.rect("share")} m={[3, 300]} f={[2, 0]} join={J("rate", "share", "b-sleeve")} title={w15.title} hint={w15.title} info={wi(w15)}><WBody T={T} w={w15} /></Piece>}
      {w19 && <Piece d={L.rect("perday")} m={[3, 300]} f={[2, 0]} title={w19.title} hint={w19.title} info={wi(w19)}><WBody T={T} w={w19} /></Piece>}
      {w16 && w16.kind === "groupBars" && <Piece d={L.rect("now")} m={[6, 240]} f={[2, 0]} title={w16.title} hint={w16.title} info={wi(w16)} className="[&_.pz-in]:!gap-1 [&_.pz-in]:!py-3"><NowThen T={T} w={w16} /></Piece>}
      {heat && heat.kind === "heat" && L.on("heat") && <Piece d={L.rect("heat")} m={[6, 240]} f={[2, 0]} title={heat.title} hint={heat.title} info={wi(heat)} className="[&_.pz-in]:!gap-0.5 [&_.pz-in]:!py-2.5"><HeatC T={T} w={heat} /></Piece>}
    </Puzzle>
  );
}

// ============ Чеки ============
export function TabChecks({ T }: { T: TabIn }) {
  const c35 = T.card(35), w17 = T.wid(17), c7 = T.card(7), c8 = T.card(8), c10 = T.card(10), c11 = T.card(11);
  const L = layout([
    { id: "avgpt", r: [0, 0, 9, 2], on: !!w17 }, { id: "c35", r: [9, 0, 3, 1], on: !!c35 }, { id: "c11", r: [9, 1, 3, 1], on: !!c11 },
    { id: "c7", r: [0, 2, 4, 1], on: !!c7 }, { id: "c8", r: [4, 2, 4, 1], on: !!c8 }, { id: "c10", r: [8, 2, 4, 1], on: !!c10 },
  ]);
  if (!anyOn(L, ["avgpt", "c35", "c11", "c7", "c8", "c10"])) return OFF;
  const tile = (id: string, c: C | undefined, bridge?: Bridge) => c && <Piece key={c.id} d={L.rect(id)} m={[3, 150]} f={[1, 130]} label={c.label} hint={c.label} bridge={bridge}><CardBody c={c} /></Piece>;
  return (
    <Puzzle auto={!L.ok} pf jp={false}>
      {w17 && <Piece d={L.rect("avgpt")} m={[6, 260]} f={[2, 0]} title={w17.title} hint={w17.title} info={wi(w17)}><WBody T={T} w={w17} /></Piece>}
      {tile("c35", c35, bridger(L, "c35", "c11", VBR))}{tile("c11", c11)}
      {tile("c7", c7, bridger(L, "c7", "c8", HBR))}{tile("c8", c8)}{tile("c10", c10)}
    </Puzzle>
  );
}

// ============ Касса и оплаты ============
export function TabCash({ T }: { T: TabIn }) {
  const c26 = T.card(26), c21 = T.card(21), c24 = T.card(24), w20 = T.wid(20), w22 = T.wid(22), w23 = wOf(T, 23, "expenses"), w25 = T.wid(25), w27 = T.wid(27);
  const k = useMemo(() => (c26 ? kassaNow(T.c.d) : null), [c26, T.c.d]);
  const L = layout([
    { id: "wf", r: [0, 0, 7, 2], on: !!w25 }, { id: "kassa", r: [0, 2, 4, 1], on: !!c26 }, { id: "diff", r: [4, 2, 3, 1], on: !!c26 }, { id: "pay", r: [7, 0, 5, 2], on: !!w22 },
    { id: "cash", r: [9, 2, 3, 1], on: !!c21 }, { id: "exp", r: [7, 2, 2, 1], on: !!c24 }, { id: "bych", r: [0, 3, 4, 1], on: !!w20 }, { id: "exps", r: [4, 3, 5, 1], on: !!w23 }, { id: "recount", r: [9, 3, 3, 1], on: !!w27 },
  ]);
  if (!anyOn(L, ["wf", "kassa", "diff", "pay", "cash", "exp", "bych", "exps", "recount"])) return OFF;
  const J = joiner(L);
  const closed = c26?.v === "сдана ✓", has = !!k && k.actual != null, diff = k?.diff ?? null;
  return (
    <Puzzle auto={!L.ok} pf jp={false}>
      {w25 && <Piece d={L.rect("wf")} m={[6, 320]} f={[2, 280]} join={J("wf", "kassa", "a-top")} title={w25.title} hint={w25.title} info={wi(w25)}><WBody T={T} w={w25} fill /></Piece>}
      {c26 && k && <Piece d={L.rect("kassa")} m={[3, 150]} f={[1, 150]} join={J("wf", "kassa", "a-sleeve")} bridge={bridger(L, "kassa", "diff", HBR)} label={closed ? c26.label : has ? "Касса за месяц" : "Должно быть на руках"} hint={c26.label} spread>
        <div className="min-w-0" title={c26.d}><div className="pz-v">{closed ? c26.v : mln(k.expected)}</div>
          <div className="pz-s mt-1.5 truncate">{closed ? c26.d : has ? `должно быть · факт ${mln(k.actual!)}` : "пересчитайте кассу на вкладке «Касса»"}</div></div>
      </Piece>}
      {c26 && k && <Piece d={L.rect("diff")} m={[3, 150]} f={[1, 150]} label={diff != null && diff < 0 ? "Недостача" : "Излишек / недостача"} hint={c26.label} spread>
        {has && diff != null
          ? <div className="min-w-0" title={c26.d}><div className={cn("pz-v", diff < 0 ? "text-minus" : diff > 0 ? "text-warn" : "text-plus")}>{diff > 0 ? "+" : diff < 0 ? "−" : ""}{mln(Math.abs(diff))}</div><div className="pz-s mt-1.5 truncate">{Math.abs(diff) < 1 ? "касса сходится" : diff < 0 ? "не хватает в кассе" : "лишнее в кассе"}</div></div>
          : <div className="min-w-0"><div className="pz-v">—</div><div className="pz-s mt-1.5 truncate">{closed ? "месяц закрыт" : "ещё не считали"}</div></div>}
      </Piece>}
      {w22 && w22.kind === "donut" && <Piece d={L.rect("pay")} m={[3, 320]} f={[2, 0]} join={J("pay", "cash", "b-top")} title={w22.title} hint={w22.title} info={wi(w22)}><BigDonut w={w22} /></Piece>}
      {c21 && <Piece d={L.rect("cash")} m={[3, 150]} f={[1, 150]} join={J("pay", "cash", "b-sleeve")} label={c21.label} hint={c21.label}><CardBody c={c21} /></Piece>}
      {c24 && <Piece d={L.rect("exp")} m={[3, 150]} f={[1, 150]} label={c24.label} hint={c24.label}><CardBody c={c24} /></Piece>}
      {w20 && <Piece d={L.rect("bych")} m={[3, 220]} f={[2, 0]} title={w20.title} hint={w20.title} info={wi(w20)}><WBody T={T} w={w20} /></Piece>}
      {w23 && <Piece d={L.rect("exps")} m={[6, 220]} f={[2, 0]} title={w23.title} hint={w23.title} info={wi(w23)} note={`всего ${fmt(w23.total)}`}>
        <Scroll><div className="grid gap-x-8 @min-[640px]/main:grid-cols-2"><div><Sub>По точкам</Sub><HBars items={w23.byPoint} dot /></div><div><Sub>По статьям</Sub><HBars items={w23.byArt} /></div></div></Scroll>
      </Piece>}
      {w27 && <Piece d={L.rect("recount")} m={[3, 220]} f={[2, 220]} title={w27.title} hint={w27.title} info={wi(w27)}><WBody T={T} w={w27} fill /></Piece>}
    </Puzzle>
  );
}

// ============ Прибыль и скидки ============
export function TabProfit({ T }: { T: TabIn }) {
  const w38 = T.wid(38), c37 = T.card(37), c36 = T.card(36), w59 = wOf(T, 59, "owner"), c40 = T.card(40), c41 = T.card(41), c42 = T.card(42), w39 = T.wid(39);
  // собственник есть, только если за месяц есть отчёт; без него — своя раскладка
  const hasOwner = !!w59 && !!w59.o;
  const L = layout(hasOwner
    ? [{ id: "mcat", r: [0, 0, 7, 2], on: !!w38 }, { id: "marg", r: [0, 2, 3, 1], on: !!c37 }, { id: "gp", r: [3, 2, 4, 1], on: !!c36 }, { id: "owner", r: [7, 0, 5, 3], on: true },
      { id: "c40", r: [0, 3, 3, 1], on: !!c40 }, { id: "c41", r: [3, 3, 2, 1], on: !!c41 }, { id: "c42", r: [5, 3, 2, 1], on: !!c42 }, { id: "mpts", r: [7, 3, 5, 1], on: !!w39 }]
    : [{ id: "mcat", r: [0, 0, 8, 2], on: !!w38 }, { id: "gp", r: [8, 0, 4, 1], on: !!c36 }, { id: "marg", r: [8, 1, 4, 1], on: !!c37 },
      { id: "c40", r: [0, 2, 4, 1], on: !!c40 }, { id: "c41", r: [4, 2, 4, 1], on: !!c41 }, { id: "c42", r: [8, 2, 4, 1], on: !!c42 }, { id: "mpts", r: [0, 3, 12, 1], on: !!w39 }]);
  if (!anyOn(L, ["mcat", "marg", "gp", "c40", "c41", "c42", "mpts"]) && !hasOwner) return OFF;
  const J = joiner(L);
  const tile = (id: string, c: C | undefined, o: { bridge?: Bridge; join?: Join; tone?: Tone } = {}) => c && <Piece key={c.id} d={L.rect(id)} m={[3, 150]} f={[1, 130]} tone={o.tone} join={o.join} label={c.label} hint={c.label} bridge={o.bridge}><CardBody c={c} /></Piece>;
  return (
    <Puzzle auto={!L.ok} pf jp={false}>
      {w38 && <Piece d={L.rect("mcat")} m={[6, 340]} f={[2, 0]} join={hasOwner ? J("mcat", "marg", "a-top") : undefined} title={w38.title} hint={w38.title} info={wi(w38)}><MarginCats T={T} w={w38} /></Piece>}
      {tile("marg", c37, hasOwner ? { join: J("mcat", "marg", "a-sleeve") } : { bridge: undefined })}
      {c36 && <Piece d={L.rect("gp")} m={[3, 150]} f={[2, 130]} tone="g" label={c36.label} hint={c36.label} bridge={!hasOwner ? bridger(L, "gp", "marg", VBR) : undefined}>
        <div className="flex flex-1 flex-col justify-center gap-1.5 min-w-0" title={c36.d}><div className="pz-vx">{digits(c36.v) ? mln(digits(c36.v)) : c36.v}</div><div className="pz-s line-clamp-2">{c36.d}</div></div>
      </Piece>}
      {hasOwner && w59 && <Piece d={L.rect("owner")} m={[6, 480]} f={[2, 0]} title={w59.title} hint={w59.title} info={wi(w59)}><WBody T={T} w={w59} /></Piece>}
      {tile("c40", c40, { bridge: bridger(L, "c40", "c41", HBR) })}{tile("c41", c41, { bridge: bridger(L, "c41", "c42", HBR) })}{tile("c42", c42)}
      {w39 && w39.kind === "marginPts" && <Piece d={L.rect("mpts")} m={[6, 260]} f={[2, 0]} title={w39.title} hint={w39.title} info={wi(w39)} note={`итого ${mln(w39.T.all)} · прибыль ${mln(w39.T.gp)} · маржа ${pctF(w39.T.rev ? w39.T.gp / w39.T.rev : null)} · покрытие ${pctF(w39.T.all ? w39.T.rev / w39.T.all : 0)}`} className="[&_.pz-in]:!gap-1 [&_.pz-in]:!py-2.5"><MarginPts T={T} w={w39} /></Piece>}
    </Puzzle>
  );
}

// ---------- «Точки: сейчас и раньше»: строка на точку, две полосы и суммы ----------
function NowThen({ T, w }: { T: TabIn; w: Extract<W, { kind: "groupBars" }> }) {
  const cur = w.series[0], prev = w.series[1];
  const mx = Math.max(1, ...cur.vals, ...(prev ? prev.vals : [0]));
  return (
    <Scroll>
      <div className="flex min-h-full flex-col justify-evenly gap-1">
        {w.labels.map((l, i) => (
          <div key={l} className="grid grid-cols-[minmax(64px,7rem)_minmax(0,1fr)_auto] items-center gap-3 leading-none">
            <span className="flex min-w-0 items-center gap-2 text-[13px]"><i className="size-2.5 shrink-0 rounded-full" style={{ background: pointColor(T.c.points, l) }} /><span className="truncate">{l}</span></span>
            <span className="flex flex-col gap-[3px]" title={`${l}: сейчас ${fmt(cur.vals[i])}${prev ? `, раньше ${fmt(prev.vals[i])}` : ""}`}>
              <i className="block h-[7px] rounded-full" style={{ width: Math.max(1, (cur.vals[i] / mx) * 100) + "%", background: pointColor(T.c.points, l) }} />
              {prev && <i className="block h-[5px] rounded-full bg-muted-foreground/45" style={{ width: Math.max(1, (prev.vals[i] / mx) * 100) + "%" }} />}
            </span>
            <span className="num text-right text-[13px] leading-tight font-bold whitespace-nowrap">{mln(cur.vals[i])}{prev && <span className="pz-s ml-2 font-normal">было {mln(prev.vals[i])}</span>}</span>
          </div>
        ))}
      </div>
    </Scroll>
  );
}

// ---------- тепловая карта точка × день недели: все точки без прокрутки ----------
function HeatC({ T, w }: { T: TabIn; w: Extract<W, { kind: "heat" }> }) {
  return (
    <Scroll>
      <div className="grid h-full gap-[2px]" style={{ gridTemplateColumns: "minmax(56px,7rem) repeat(7, minmax(0, 1fr))", gridTemplateRows: `14px repeat(${w.pts.length}, minmax(16px, 32px))`, alignContent: "start" }}>
        <span /> {WD.map((d) => <span key={d} className="pz-s self-end text-center !text-[11px] leading-none">{d}</span>)}
        {w.pts.map((p, pi) => (
          <Fragment key={p}>
            <span className="flex min-w-0 items-center gap-2 text-[12.5px]"><i className="size-2 shrink-0 rounded-full" style={{ background: pointColor(T.c.points, p) }} /><span className="truncate">{p}</span></span>
            {w.avg[pi].map((v, i) => {
              const o = v ? 0.12 + 0.78 * (v / w.hmax) : 0, b = w.best && w.best[pi] === i && v;
              return <span key={i} title={`${p}: в среднем ${fmt(v)} сум`} className="num grid place-items-center rounded-md text-[11.5px]" style={{ background: `color-mix(in srgb, var(--primary) ${Math.round(o * 100)}%, var(--muted))`, color: o > 0.55 ? "var(--primary-foreground)" : undefined, outline: b ? "2px solid var(--warn)" : undefined, outlineOffset: -2 }}>{v ? <><span className="@max-[639px]/main:hidden">{fmtM(v)}</span><span className="@min-[640px]/main:hidden">{mn(v)}</span></> : "—"}</span>;
            })}
          </Fragment>
        ))}
      </div>
    </Scroll>
  );
}

// ---------- способы оплаты: крупное кольцо и легенда справа ----------
function BigDonut({ w }: { w: Extract<W, { kind: "donut" }> }) {
  const it = w.items.filter((i) => i.value > 0), tot = it.reduce((a, i) => a + i.value, 0) || 1, C = 452.4;
  let off = 0;
  const [num, ...unit] = w.center.split(" ");
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 @min-[640px]/main:flex-row @min-[640px]/main:gap-10">
      <svg viewBox="0 0 190 190" role="img" aria-label="Доли способов оплаты" className="aspect-square h-[190px] shrink-0 @min-[1060px]/main:h-[min(78%,300px)]">
        {it.map((i, k) => { const L = (i.value / tot) * C, d = Math.max(L - 2, 1.5), o = off; off += L; return <circle key={k} cx="95" cy="95" r="72" fill="none" stroke={i.color} strokeWidth="26" strokeDasharray={`${d.toFixed(1)} ${(C - d).toFixed(1)}`} strokeDashoffset={(-o).toFixed(1)} transform="rotate(-90 95 95)"><title>{i.label}: {fmt(i.value)}</title></circle>; })}
        <text x="95" y="92" textAnchor="middle" fill="var(--foreground)" fontSize="30" fontWeight="800">{num}</text>
        <text x="95" y="114" textAnchor="middle" fill="var(--muted-foreground)" fontSize="13">{unit.join(" ")}{w.sub ? " · " + w.sub : ""}</text>
      </svg>
      <div className="flex w-full min-w-0 max-w-md flex-col justify-center gap-3.5 @min-[640px]/main:w-auto @min-[640px]/main:flex-1">
        {it.map((i) => (
          <div key={i.label} className="flex items-center justify-between gap-4 text-[15px]">
            <span className="flex min-w-0 items-center gap-2.5"><i className="size-3 shrink-0 rounded-[4px]" style={{ background: i.color }} /><span className="truncate">{i.label}</span></span>
            <span className="num shrink-0 text-[16px] font-bold">{mln(i.value)} <span className="pz-s font-normal">· {Math.round((i.value / tot) * 100)}%</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- «Маржа по категориям»: строки распределены по высоте блока ----------
function MarginCats({ T, w }: { T: TabIn; w: W }) {
  if (w.kind !== "hbars") return <WBody T={T} w={w} />;
  const items = w.items, mx = Math.max(1, ...items.map((i) => Math.abs(i.value)));
  const cols = items.length > 6 ? 3 : items.length > 3 ? 2 : 1;
  return (
    <Scroll>
      <div className="grid h-full grid-cols-1 gap-x-8 @min-[640px]/main:[grid-template-columns:repeat(min(var(--mc),2),minmax(0,1fr))] @min-[1500px]/main:[grid-template-columns:repeat(var(--mc),minmax(0,1fr))]" style={{ ["--mc" as string]: cols, gridAutoFlow: "row", gridAutoRows: "minmax(40px, 64px)", alignContent: "space-evenly" }}>
        {items.map((i, k) => (
          <div key={i.label + k} className="flex min-w-0 flex-col justify-center gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="flex min-w-0 items-baseline gap-2 text-[15px]"><span className="truncate">{i.label}</span>{i.sub && <span className="pz-s shrink-0">{i.sub}</span>}</span>
              <b className="num shrink-0 text-[16px]">{i.valTxt ?? fmt(i.value)}</b>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full" style={{ width: Math.max(0, i.value) / mx * 100 + "%", background: i.color || "var(--primary)" }} /></div>
          </div>
        ))}
      </div>
    </Scroll>
  );
}

// ---------- «Маржа по точкам»: Точка · Выручка · Прибыль · Маржа · Покрытие, без прокрутки вбок ----------
function MarginPts({ T, w }: { T: TabIn; w: Extract<W, { kind: "marginPts" }> }) {
  if (!w.has) return <p className="pz-s">Нет цен покупки.</p>;
  const row = (k: string, all: number, gp: number, m: number | null, cov: number, tip: string, bold?: boolean) => (
    <div key={k} title={tip} className={cn("grid min-h-[22px] grid-cols-[minmax(70px,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(86px,1.2fr)] items-center gap-x-3 border-t border-border text-[13px] first:border-t-0 @min-[640px]/main:grid-cols-[minmax(70px,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(110px,1.4fr)_44px]", bold && "font-bold")}>
      <span className="flex min-w-0 items-center gap-2">{!bold && <i className="size-2 shrink-0 rounded-full" style={{ background: pointColor(T.c.points, k) }} />}<span className="truncate">{k}</span></span>
      <span className="num text-right">{mln(all)}</span>
      <span className="num text-right">{mln(gp)}</span>
      <MBar v={m} w={56} />
      <span className="num pz-s hidden text-right @min-[640px]/main:block">{pctF(cov)}</span>
    </div>
  );
  const head = (
    <div className="pz-s grid grid-cols-[minmax(70px,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(86px,1.2fr)] gap-x-3 pb-1 !text-[11px] tracking-wide uppercase @min-[640px]/main:grid-cols-[minmax(70px,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(110px,1.4fr)_44px]">
      <span>Точка</span><span className="text-right">Выручка</span><span className="text-right">Прибыль</span><span className="text-right">Маржа</span><span className="hidden text-right @min-[640px]/main:block">Покрытие</span>
    </div>
  );
  const tip = (o: (typeof w.rows)[number]) => `посчитано ${fmt(o.rev)} · себестоимость ${fmt(o.cogs)} · выручка ${fmt(o.all)} · прибыль ${fmt(o.gp)}${o.tc ? " · самая прибыльная категория: " + o.tc.k + " (" + mln(o.tc.gp) + ")" : ""}`;
  return (
    <Scroll>
      {head}
      {w.rows.map((o) => row(o.k, o.all, o.gp, o.m, o.cov, tip(o)))}
    </Scroll>
  );
}
