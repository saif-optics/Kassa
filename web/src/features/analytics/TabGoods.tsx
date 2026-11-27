// Вкладка «Товары»: пазл 12×4 — уголок «Категории» + «Средняя цена», топ-10 с перемычкой, ABC, «Перестали продаваться», ценовые группы.
import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Sel } from "@/features/sales/parts";
import { cn } from "@/lib/utils";
import { Empty } from "./parts";
import { Bar, FitCols, Piece, Puzzle, Scroll } from "./Puzzle";
import { BAR_BEST, wOf, type TabIn } from "./tabs";
import { lostCount, mln } from "./pace";
import { renderW } from "./widgets";
import { fmt, pctF, pl } from "./util";

const PURPLE = "var(--chart-2)";
const lbl = (s: string) => (s === "—" ? "Без категории" : s);

export function TabGoods({ T }: { T: TabIn }) {
  const d28 = wOf(T, 28, "donut"), h29 = wOf(T, 29, "hbars"), rng = wOf(T, 30, "ranges"), tr = wOf(T, 31, "top"), tq = wOf(T, 32, "top"), abc = wOf(T, 33, "pareto"), lost = wOf(T, 34, "lost"), pg = wOf(T, 58, "pg");
  const nLost = lost ? lostCount(T.c, T.F, T.m.list, T.m.r) : 0;
  const flags = [!!(d28 || h29), !!rng, !!tr, !!tq, !!abc, !!lost, !!pg];
  if (!flags.some(Boolean)) return <Empty>Все показатели этой вкладки выключены. Включите нужные в «Показатели».</Empty>;
  const auto = !flags.every(Boolean);
  const cats = d28 ? d28.items.map((i) => ({ label: i.label, value: i.value, color: i.color })) : h29 ? h29.items.map((i) => ({ label: i.label, value: i.value, color: i.color || "var(--chart-1)" })) : [];
  return (
    <Puzzle auto={auto} pf jd jp={false}>
      {(d28 || h29) && <Piece d={[0, 0, 4, 3]} m={[3, 560]} f={[2, 0]} join="c-top" title="Категории" note="выручка · доля" hint={d28 ? "Выручка по категориям" : "Доля категорий"}>
        <Cats items={cats} center={d28?.center} sub={d28?.sub} />
      </Piece>}
      {rng && <Piece d={[0, 3, 6, 1]} m={[6, 190]} f={[2, 0]} join="c-sleeve" title="Средняя цена по категориям" note="за единицу"><AvgPrice w={rng} /></Piece>}
      {tr && <Piece d={[4, 0, 4, 3]} m={[3, 560]} f={[2, 0]} title="Топ-10 по выручке" hint="Топ-10 товаров по выручке" note={"всего " + mln(tr.tot)}
        bridge={tq ? { dir: "h", d: "calc(var(--rh) + var(--pg) / 2)" } : undefined}><Top w={tr} /></Piece>}
      {tq && <Piece d={[8, 0, 4, 2]} m={[3, 560]} f={[2, 0]} title="Топ-10 по количеству" hint="Топ-10 товаров по количеству" note={<span className="@max-[1499px]/main:hidden">{"всего " + fmt(tq.tot) + " шт"}</span>}><Top w={tq} two /></Piece>}
      {abc && <Piece d={[8, 2, 2, 1]} m={[3, 170]} f={[1, 170]} title="ABC-анализ" hint="ABC-анализ товаров" note={<span className="@max-[1499px]/main:hidden">{`${abc.items.length} ${pl(abc.items.length, "товар", "товара", "товаров")}`}</span>} spread><Abc w={abc} /></Piece>}
      {lost && <Piece d={[10, 2, 2, 1]} m={[3, 170]} f={[1, 170]} tone={nLost ? "c" : "n"} label="Перестали продаваться" hint="Перестали продаваться" spread><Lost T={T} w={lost} n={nLost} /></Piece>}
      {pg && <Piece d={[6, 3, 6, 1]} m={[6, 230]} f={[2, 0]} title="Ценовые группы" hint="Самые продаваемые по ценовым группам"
        right={<Sel label="Категория" value={pg.cat} onChange={T.setPgCat} className="h-7 w-auto min-w-28 gap-2 rounded-full px-3 text-[12.5px]" options={[{ v: "all", l: "Все категории" }, ...pg.cats]} />}><Bands w={pg} /></Piece>}
    </Puzzle>
  );
}

// ---------- категории: кольцо и список ----------
function Cats({ items, center, sub }: { items: { label: string; value: number; color: string }[]; center?: string; sub?: string }) {
  const it = items.filter((i) => i.value > 0), tot = it.reduce((a, i) => a + i.value, 0) || 1;
  const C = 452.4; let off = 0;
  const [num, ...unit] = (center || mln(tot)).split(" ");
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex shrink-0 justify-center py-1">
        <svg viewBox="0 0 190 190" role="img" aria-label="Доли категорий" className="aspect-square h-[var(--ring,160px)] max-h-[176px] max-w-full" style={{ ["--ring" as string]: "calc(var(--rh) - 4px)" }}>
          {it.map((i, k) => { const L = (i.value / tot) * C, d = Math.max(L - 2, 1.5), o = off; off += L; return <circle key={k} cx="95" cy="95" r="72" fill="none" stroke={i.color} strokeWidth="26" strokeDasharray={`${d.toFixed(1)} ${(C - d).toFixed(1)}`} strokeDashoffset={(-o).toFixed(1)} transform="rotate(-90 95 95)"><title>{lbl(i.label)}: {fmt(i.value)}</title></circle>; })}
          <text x="95" y="92" textAnchor="middle" fill="var(--foreground)" fontSize="30" fontWeight="800">{num}</text>
          <text x="95" y="114" textAnchor="middle" fill="var(--muted-foreground)" fontSize="13">{unit.join(" ") || sub || ""}{unit.length && sub ? " · " + sub : ""}</text>
        </svg>
      </div>
      <Scroll>
        {it.map((i, k) => (
          <div key={k} className="grid min-h-9 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-t border-border text-[14px] first:border-t-0">
            <span className="flex min-w-0 items-center gap-2.5"><i className="size-2.5 shrink-0 rounded-full" style={{ background: i.color }} /><span className="truncate">{lbl(i.label)}</span></span>
            <b className="num text-[15px]">{mln(i.value)}</b>
            <span className="num pz-s w-10 text-right">{pctF(i.value / tot)}</span>
          </div>
        ))}
      </Scroll>
    </div>
  );
}

// ---------- средняя цена по категориям ----------
function AvgPrice({ w }: { w: NonNullable<ReturnType<typeof wOf<"ranges">>> }) {
  if (!w.rows.length) return <p className="pz-s">Нет данных за период</p>;
  const mx = Math.max(1, ...w.rows.map((o) => o.avg));
  return (
    <FitCols count={w.rows.length} min={130} gap={22} className="items-end">
        {w.rows.map((o) => (
          <div key={o.k} className="min-w-0" title={`${o.k}: ${fmt(o.u)} ед., от ${fmt(o.min)} до ${fmt(o.max)}, выручка ${mln(o.r)}`}>
            <div className="pz-s truncate">{o.k}</div>
            <div className="num my-1.5 text-[clamp(20px,1.7cqw,28px)] leading-none font-extrabold">{mln(o.avg)}</div>
            <Bar v={o.avg / mx} color={o.color} />
          </div>
        ))}
    </FitCols>
  );
}

// ---------- топ-10 ----------
function Top({ w, two }: { w: NonNullable<ReturnType<typeof wOf<"top">>>; two?: boolean }) {
  if (!w.rows.length) return <p className="pz-s">Нет данных за период</p>;
  const byR = w.by === "r", mx = Math.max(1, ...w.rows.map((o) => o[w.by]));
  const row = (o: (typeof w.rows)[number], i: number) => (
    <div key={o.k} title={`${o.k}${o.cat ? " · " + o.cat : ""}: ${fmt(o.r)} сум, ${fmt(o.u)} шт, ср. цена ${fmt(o.u ? o.r / o.u : 0)}, доля ${pctF(w.tot ? o[w.by] / w.tot : 0)}`}
      className={cn("grid min-h-9 flex-1 grid-cols-[26px_minmax(0,1fr)_auto] items-center gap-3 border-t border-border text-[14.5px] first:border-t-0", !two && "min-h-10")}>
      <span className="num grid size-[26px] place-items-center rounded-full bg-muted text-[12.5px] font-bold" style={i === 0 && !two ? { background: "var(--chart-4)", color: "#2a2000" } : undefined}>{i + 1}</span>
      <span className="min-w-0"><span className="block truncate">{o.k}</span>{byR && <Bar v={o[w.by] / mx} h={4} className="mt-1" color="var(--piece-blue)" />}</span>
      <b className="num text-[15.5px]">{byR ? mln(o.r) : fmt(o.u)}</b>
    </div>
  );
  if (!two) return <Scroll><div className="flex min-h-full flex-col">{w.rows.map(row)}</div></Scroll>;
  const half = Math.ceil(w.rows.length / 2);
  return (
    <Scroll>
      <div className="grid min-h-full grid-cols-1 gap-x-[22px] @min-[1500px]/main:grid-cols-2">
        <div className="flex flex-col">{w.rows.slice(0, half).map((o, i) => row(o, i))}</div>
        <div className="flex flex-col">{w.rows.slice(half).map((o, i) => row(o, i + half))}</div>
      </div>
    </Scroll>
  );
}

// ---------- ABC ----------
function Abc({ w }: { w: NonNullable<ReturnType<typeof wOf<"pareto">>> }) {
  const cls = (a: "A" | "B" | "C") => w.items.filter((x) => x.abc === a);
  const tot = w.items.reduce((s, x) => s + x.r, 0) || 1, share = (a: "A" | "B" | "C") => cls(a).reduce((s, x) => s + x.r, 0) / tot;
  const parts: ["A" | "B" | "C", string][] = [["A", "var(--piece-blue)"], ["B", BAR_BEST], ["C", "var(--muted-foreground)"]];
  return (
    <>
      <div className="flex h-[18px] gap-[3px] overflow-hidden rounded-full" role="img" aria-label="Доли классов A, B, C по выручке">
        {parts.map(([a, col]) => <i key={a} className="block h-full" style={{ flex: Math.max(share(a), 0.004), background: col }} />)}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {parts.map(([a]) => <span key={a} className="pz-s num leading-tight"><b className="block text-[clamp(16px,1.3cqw,19px)] text-foreground">{cls(a).length}</b>{a} · {pctF(share(a))}</span>)}
      </div>
    </>
  );
}

// ---------- перестали продаваться ----------
function Lost({ T, w, n }: { T: TabIn; w: NonNullable<ReturnType<typeof wOf<"lost">>>; n: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="min-w-0">
        <div className="flex items-baseline gap-2"><span className="pz-v" style={{ fontSize: "clamp(28px,2.4cqw,40px)" }}>{n}</span><span className="pz-s">{pl(n, "товар", "товара", "товаров")}</span></div>
        <div className="pz-s mt-1.5 leading-snug">{n === 0 ? "все товары продаются" : <>были за 30 дней до периода, в периоде нет</>}{n > 0 && w.rows.length ? <> · <button type="button" onClick={() => setOpen(true)} className="font-bold text-white underline">список →</button></> : n === 0 && !w.hist ? " (нужна история продаж до периода)" : ""}</div>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full gap-0 overflow-y-auto p-5 sm:max-w-xl">
          <SheetTitle className="text-[17px] font-bold">Перестали продаваться</SheetTitle>
          <SheetDescription className="mb-3 text-[13px]">Продавались за 30 дней до периода, а в периоде — ни разу{n > w.rows.length ? ` · показаны ${w.rows.length} с наибольшей выручкой из ${n}` : ""}</SheetDescription>
          {renderW(w, T.c.points, T.setPgCat)}
        </SheetContent>
      </Sheet>
    </>
  );
}

// ---------- ценовые группы ----------
function Bands({ w }: { w: NonNullable<ReturnType<typeof wOf<"pg">>> }) {
  if (!w.U) return <p className="pz-s">Нет продаж в этой категории за период</p>;
  const mx = Math.max(1, ...w.bands.map((o) => o.u)), best = w.bands[w.best];
  return (
    <FitCols count={w.bands.length} min={130} gap={22} className="items-end">
        {w.bands.map((o) => (
          <div key={o.lbl} className="min-w-0" title={o.top.length ? "Чаще всего покупают: " + o.top.map(([k, v]) => `${k} ×${v}`).join(", ") : undefined}>
            <div className="pz-s flex items-center gap-1.5 truncate">{o.lbl}{o === best && <span className="rounded-full bg-primary/15 px-1.5 text-[10.5px] font-semibold text-primary">чаще</span>}</div>
            <div className="num my-1 text-[clamp(20px,1.7cqw,28px)] leading-none font-extrabold">{o.r ? mln(o.r) : "—"}</div>
            <div className="pz-s mb-1.5">{o.u ? `${fmt(o.u)} шт · ${pctF(o.u / w.U)}` : "нет продаж"}</div>
            <Bar v={o.u / mx} color={PURPLE} />
          </div>
        ))}
    </FitCols>
  );
}
