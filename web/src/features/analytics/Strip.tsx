// Полоса главных цифр над вкладками: выручка, средний чек, валовая прибыль, план, касса. Значения — из тех же карточек, что и раньше.
import { useContext, useMemo, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { goProps, type Dest } from "@/lib/go";
import { monthOf } from "./base";
import { kassaNow } from "./logic";
import { Bar, Chip, HintCtx } from "./Puzzle";
import { hintOf } from "./parts";
import { digits, type TabIn } from "./tabs";
import { mln } from "./pace";
import { MONTHS_FULL } from "./util";

/** «+9%» → «▲ 9%» */
const growth = (v: string) => (v.startsWith("+") ? "▲ " + v.slice(1) : v.startsWith("−") ? "▼ " + v.slice(1) : v);
const growthTone = (t: string) => (t.startsWith("▲") ? "up" : t.startsWith("▼") ? "down" : "warn") as "up" | "down" | "warn";

interface Tile { key: string; def: number; node: (hint: string) => ReactNode; tone?: "b" | "c" | "g"; hint: string; to?: Dest; label?: string }

function Frame({ t, hint, sp, sm, sd }: { t: Tile; hint: string; sp: number; sm: number; sd: number }) {
  return (
    <section {...(t.to ? goProps(t.to, t.label || "раздел") : {})} className={cn("pz-i", t.key !== "rev" && "pz-t", t.to && "cursor-pointer outline-none transition-[translate,box-shadow] hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary/50")} data-tone={t.tone} style={{ "--sp": sp, "--sm": sm, "--sd": sd } as CSSProperties}>
      <div className={cn("pz-in", t.key === "rev" && "justify-center")} title={hint || undefined}>{t.node(hint)}</div>
    </section>
  );
}

export function Strip({ T }: { T: TabIn }) {
  const hintsOn = useContext(HintCtx), { c, F } = T;
  const c1 = T.card(1), c2 = T.card(2), c5 = T.card(5), c9 = T.card(9), c26 = T.card(26), c36 = T.card(36), c37 = T.card(37);
  const k = useMemo(() => (c26 ? kassaNow(c.d) : null), [c26, c.d]);
  const H = (title: string) => (hintsOn ? hintOf(title) : "");
  const tiles: Tile[] = [], per = { from: T.m.r.from, to: T.m.r.to, point: F.point !== "all" ? F.point : undefined };

  if (c1) {
    const mo = monthOf(F), label = mo ? "Выручка · " + MONTHS_FULL[+mo.slice(5, 7) - 1].toLowerCase() : "Выручка за период";
    const g = c2 ? growth(c2.v) : "";
    tiles.push({ key: "rev", def: 4, tone: "b", hint: H(c1.label), to: { tab: "sales", params: per }, label: "продажи за период", node: () => (
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0"><span className="pz-lbl !text-white/90">{label}</span><div className="pz-vh mt-2.5 max-w-full">{c1.v.replace(/ сум$/, "")}</div></div>
        {g && g !== "—" && <div className="flex shrink-0 flex-col items-end gap-1.5" title={c2!.d}><Chip>{g}</Chip><span className="pz-s hidden text-right @min-[1500px]/main:block">к прошлому периоду</span></div>}
      </div>
    ) });
  }
  if (!c1 && c2 && c2.v !== "—") {
    tiles.push({ key: "growth", def: 4, tone: "b", hint: H(c2.label), node: () => (
      <><span className="pz-lbl !text-white/90">{c2.label}</span><div><div className="pz-vh">{growth(c2.v)}</div><div className="pz-s mt-1.5 truncate" title={c2.d}>{c2.d}</div></div></>
    ) });
  }
  if (c9) {
    const ch = /(▲ \d+%|▼ \d+%|≈ 0%)/.exec(c9.d)?.[1];
    tiles.push({ key: "avg", def: 2, hint: H(c9.label), to: { tab: "analytics", params: { tab: "chk" } }, label: "чеки", node: () => (
      <><span className="pz-lbl">Средний чек</span>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1"><span className="pz-v" title={c9.v}>{c9.v.replace(/ сум$/, "")}</span>{ch && <Chip tone={growthTone(ch)} title={c9.d}>{ch.replace(" ", "")}</Chip>}</div></>
    ) });
  }
  if (c36) {
    tiles.push({ key: "gp", def: 2, tone: "g", hint: H(c36.label), to: { tab: "analytics", params: { tab: "profit" } }, label: "прибыль и скидки", node: () => (
      <><span className="pz-lbl !text-white/90">Валовая прибыль</span>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1"><span className="pz-v" title={c36.d}>{digits(c36.v) ? mln(digits(c36.v)) : c36.v}</span>{c37 && c37.v !== "—" && <Chip title="Маржа">{c37.v}</Chip>}</div></>
    ) });
  }
  if (c5) {
    const none = c5.v === "не задан", pf = digits(c5.v), pp = digits(/из ([\d ]+) по плану/.exec(c5.d)?.[1] || ""), pct = pp ? pf / pp : 0;
    tiles.push({ key: "plan", def: 2, tone: "c", hint: H(c5.label), to: { tab: "plan" }, label: "план", node: () => (
      <><span className="pz-lbl !text-white/90">План</span>
        {none ? <span className="pz-v" style={{ fontSize: "clamp(16px,1.4cqw,22px)" }}>План не задан</span> : (
          <div className="min-w-0" title={c5.d}>
            <div className="flex items-baseline justify-between gap-2"><span className="pz-v">{Math.round(pct * 100)}%</span><span className="pz-s truncate">{pp ? <><span className="@max-[1499px]/main:hidden">{mln(pf).replace(" млн", "")} </span>из {mln(pp)}</> : ""}</span></div>
            <Bar v={pct} color="#fff" h={7} className="mt-2 !bg-white/30 max-sm:!h-1.5" />
          </div>
        )}</>
    ) });
  }
  if (c26 && k) {
    const closed = c26.v === "сдана ✓", has = k.actual != null, diff = k.diff;
    tiles.push({ key: "cash", def: 2, hint: H(c26.label), to: { tab: "kassa" }, label: "кассу", node: () => (
      <><span className="pz-lbl">{closed ? c26.label : has ? "Касса сейчас" : "Должно быть на руках"}</span>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1"><span className="pz-v" title={c26.d}>{closed ? c26.v : mln(has ? k.actual! : k.expected)}</span>
          {!closed && has && diff != null && (Math.abs(diff) < 1 ? <Chip tone="up">сходится</Chip> : <Chip tone={diff > 0 ? "warn" : "bad"} title={c26.d}>{diff > 0 ? "+" : "−"}{mln(Math.abs(diff))}{diff < 0 ? " недостача" : ""}</Chip>)}</div></>
    ) });
  }
  if (!tiles.length) return null;

  // ширины: на компьютере 12 колонок делятся между показанными плитками, на телефоне — выручка во всю ширину и пары
  const sum = tiles.reduce((a, t) => a + t.def, 0), sd = tiles.map((t) => t.def);
  for (let i = 0, left = 12 - sum; left > 0; i = (i + 1) % tiles.length, left--) sd[i]++;
  for (let over = sum - 12, g = 0; over > 0 && g < 100; g++) { const i = g % tiles.length; if (sd[i] > 2) { sd[i]--; over--; } }
  const first = tiles[0].key === "rev", n = tiles.length;
  const wide = (i: number) => (first && i === 0) || (n - (first ? 1 : 0)) % 2 === 1 && i === n - 1;
  return (
    <div className="pz-strip">
      {tiles.map((t, i) => <Frame key={t.key} t={t} hint={t.hint} sp={wide(i) ? 2 : 1} sm={wide(i) ? 6 : 3} sd={sd[i]} />)}
    </div>
  );
}

