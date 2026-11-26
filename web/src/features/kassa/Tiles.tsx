// Блоки Кассы: большой «на руках / факт / пересчёт + шаги» и «Резерв» с пополнением.
import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Chip, Tile, TileLabel, TileSub, TileValue } from "@/components/Tile";
import type { CashRec } from "@/lib/types";
import { fmtM } from "../plan/logic";
import { fmt, monthName, type Kassa } from "./logic";

const digits = (s: string) => { const v = String(s || "").replace(/[^\d]/g, ""); return v ? parseInt(v, 10) : NaN; };
const when = (at: number) => new Date(at + 5 * 3600e3).toISOString().replace(/^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d).*/, "$3.$2, $4:$5");
const fmtIn = (s: string) => { const v = digits(s); return isNaN(v) ? "" : fmt(v); };

type HeroProps = { c: Kassa; M: string; isLast: boolean; rec: CashRec | null; st: { actual: number; afterExp: number; afterInc: number; afterSales?: number } | null; lastRecNote: string; i?: number;
  onCash: (v: number) => Promise<void>; children?: React.ReactNode };

/** большой блок: «должно быть», факт после пересчёта, поле нового пересчёта; children (расчёт по шагам) — только от 640 px */
export function CashHero({ c, M, isLast, rec, st, lastRecNote, onCash, i = 0, children }: HeroProps) {
  const [cash, setCash] = useState(""), [msg, setMsg] = useState("");
  const diff = st ? c.expected - st.actual : null;
  const kind = diff == null ? (isLast ? "Пересчитайте кассу" : "Не пересчитывали") : diff > 0 ? "Недостача" : diff < 0 ? "Излишек" : "Касса сходится";
  const tone = (diff == null ? "muted" : diff > 0 ? "minus" : diff < 0 ? "warn" : "plus") as "muted" | "minus" | "warn" | "plus";
  const chip = <Chip tone={tone}>{diff ? `${kind.toLowerCase()} ${fmt(Math.abs(diff))}` : kind}</Chip>;
  return (
    <Tile i={i} className="justify-start gap-0 bg-[linear-gradient(160deg,color-mix(in_srgb,var(--brand)_26%,transparent),transparent_62%)]">
      <div className="grid flex-1 content-between gap-y-3 @min-[640px]/main:flex-none @min-[640px]/main:grid-cols-2 @min-[640px]/main:content-start @min-[640px]/main:gap-x-6">
        <div className="flex min-w-0 flex-col gap-1.5 @min-[640px]/main:gap-1.5">
          <TileLabel>{isLast ? "Должно быть на руках" : "Должно быть на конец месяца"}</TileLabel>
          <TileValue count={c.expected} className="text-[40px] @min-[1600px]/main:text-[52px]" />
          <span className="text-sm leading-snug text-muted-foreground @max-[639px]/main:hidden">{!isLast && `${monthName(M).toLowerCase()} · `}операционные {fmt(c.sOp)} · прочие {fmt(c.sOth)} · {c.saved < 0 ? "перерасход" : "сэкономили"} {fmt(Math.abs(c.saved))}</span>
        </div>
        <div className="flex min-w-0 flex-col gap-1.5 @min-[640px]/main:gap-1.5">
          <TileLabel className="@max-[639px]/main:hidden">{isLast ? "Факт после пересчёта" : "Факт на конец месяца"}</TileLabel>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5 @max-[639px]/main:hidden">
            {st ? <TileValue count={st.actual} className="text-[30px] @min-[1600px]/main:text-[38px]" /> : <TileValue className="text-[30px] @min-[1600px]/main:text-[38px]">—</TileValue>}{chip}</div>
          <div className="flex items-center justify-between gap-2 text-sm @min-[640px]/main:hidden"><span>Факт <b className="num text-base">{st ? fmt(st.actual) : "—"}</b></span>{chip}</div>
          <span className="line-clamp-2 text-sm leading-snug text-muted-foreground @max-[639px]/main:hidden">{rec ? <>Пересчёт {when(rec.at)}: {fmt(rec.amount)}{st?.afterExp ? ` · после расходы −${fmt(st.afterExp)}` : ""}{st?.afterInc ? ` · приходы +${fmt(st.afterInc)}` : ""}{st?.afterSales ? ` · продажи наличными +${fmt(st.afterSales)}` : ""}</> : lastRecNote}</span>
          {isLast && <form className="mt-0.5 flex gap-2" onSubmit={async (e) => { e.preventDefault(); const v = digits(cash); if (isNaN(v)) { setMsg("Введите сумму цифрами"); return; } try { await onCash(v); setCash(""); setMsg(""); } catch { setMsg("Не удалось сохранить, попробуйте ещё раз"); } }}>
            <Input value={cash} onChange={(e) => setCash(fmtIn(e.target.value))} inputMode="numeric" placeholder="Новый пересчёт кассы" aria-label="Сколько наличных в кассе" className="num h-10 min-w-0 flex-1 rounded-[14px] px-3.5 text-sm" />
            <Button type="submit" className="h-10 rounded-full px-5 text-sm font-bold">Пересчитал</Button></form>}
          {msg && <small className="text-xs text-minus">{msg}</small>}
        </div>
      </div>
      {children && <div className="mt-2 flex min-h-0 flex-1 flex-col @max-[639px]/main:hidden">{children}</div>}
    </Tile>
  );
}

type RsvProps = { M: string; isLast: boolean; i?: number; rsv: { bal: number; inn: number; out: number; n: number; mIn: number; mOut: number }; onReserve: (v: number, from: "kassa" | "out") => Promise<void> };

/** «Резерв»: от 1600 px пополнение в одну строку, уже — по нажатию на блок открывается лист */
export function ReserveTile({ M, isLast, rsv, onReserve, i = 0 }: RsvProps) {
  const [rv, setRv] = useState(""), [from, setFrom] = useState<"kassa" | "out">("kassa"), [rmsg, setRmsg] = useState(""), [sheet, setSheet] = useState(false);
  const sub = !isLast ? (rsv.mIn || rsv.mOut ? `на конец месяца · пополнено ${fmtM(rsv.mIn)} · потрачено ${fmtM(rsv.mOut)}` : rsv.n ? "на конец месяца · движений не было" : `резерва в ${monthName(M).toLowerCase()} не было`)
    : rsv.n ? `пополнено ${fmtM(rsv.inn)} · потрачено ${fmtM(rsv.out)}` : "резерва пока нет";
  const subS = !isLast ? sub : rsv.n ? `пополнено ${fmtM(rsv.inn)}` : sub; // уже 1600 px строка короче, полная — в подсказке
  const submit = async (e: React.FormEvent) => { e.preventDefault(); const v = digits(rv); if (isNaN(v) || v <= 0) { setRmsg("Введите сумму пополнения цифрами"); return; }
    try { await onReserve(v, from); setRv(""); setRmsg(""); setSheet(false); } catch { setRmsg("Не удалось сохранить, попробуйте ещё раз"); } };
  const src = from === "kassa" ? "из кассы" : "со стороны";
  return (
    <Tile i={i}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="flex shrink-0 items-baseline gap-1.5 whitespace-nowrap"><TileLabel>Резерв</TileLabel>
          {isLast && <button type="button" onClick={() => setFrom(from === "kassa" ? "out" : "kassa")} title="Откуда пополнение: нажмите, чтобы сменить" className="hidden items-center gap-0.5 text-[13px] font-semibold text-primary @min-[1600px]/main:inline-flex">· {src}<ChevronsUpDown className="size-3" /></button>}</span>
        <span className="hidden min-w-0 truncate text-[13px] text-muted-foreground @min-[1600px]/main:inline">{sub}</span>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <TileValue count={rsv.bal} format="mln" className="shrink-0" />
          {isLast && <form className="hidden min-w-0 flex-1 gap-2 @min-[1600px]/main:flex" onSubmit={submit}>
            <Input value={rv} onChange={(e) => setRv(fmtIn(e.target.value))} inputMode="numeric" placeholder="Сумма" aria-label="Сумма пополнения резерва" className="num h-[38px] min-w-0 flex-1 rounded-[14px] px-3 text-sm" />
            <Button type="submit" className="h-[38px] shrink-0 rounded-full px-3.5 text-sm font-bold">Пополнить</Button></form>}
        </div>
        <TileSub className="@min-[1600px]/main:hidden"><span title={sub}>{subS}</span></TileSub>
        {rmsg && <small className="hidden text-xs text-minus @min-[1600px]/main:block">{rmsg}</small>}
      </div>
      {isLast && <button type="button" aria-label="Пополнить резерв" onClick={() => setSheet(true)} className="absolute inset-0 rounded-[inherit] @min-[1600px]/main:hidden" />}
      <Sheet open={sheet} onOpenChange={setSheet}>
        <SheetContent side="bottom" className="gap-3 rounded-t-[28px] p-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:mx-auto sm:max-w-md">
          <SheetTitle>Пополнить резерв</SheetTitle>
          <SheetDescription className="text-[13px]">Сейчас в резерве {fmt(rsv.bal)} сум.</SheetDescription>
          <form className="flex flex-col gap-2" onSubmit={submit}>
            <Input value={rv} onChange={(e) => setRv(fmtIn(e.target.value))} inputMode="numeric" placeholder="Сумма пополнения" aria-label="Сумма пополнения резерва" className="num h-10 w-full text-base" />
            <div className="flex gap-2"><Select value={from} onValueChange={(x) => setFrom(x as "kassa" | "out")}><SelectTrigger className="h-10 min-w-[8.5rem]" aria-label="Откуда пополнение"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="kassa">из кассы</SelectItem><SelectItem value="out">со стороны</SelectItem></SelectContent></Select><Button type="submit" className="h-10 flex-1">Пополнить</Button></div>
            {rmsg && <small className="text-xs text-minus">{rmsg}</small>}
          </form>
        </SheetContent>
      </Sheet>
    </Tile>
  );
}
