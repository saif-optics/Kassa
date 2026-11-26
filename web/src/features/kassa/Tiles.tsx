// Четыре плитки Кассы: должно быть, факт (с пересчётом), недостача/излишек, резерв (с пополнением).
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Chip, Tile, TileLabel, TileSub, TileValue } from "@/components/Tile";
import type { CashRec } from "@/lib/types";
import { fmt, monthName, type Kassa } from "./logic";

const digits = (s: string) => { const v = String(s || "").replace(/[^\d]/g, ""); return v ? parseInt(v, 10) : NaN; };
const when = (at: number) => new Date(at + 5 * 3600e3).toISOString().replace(/^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d).*/, "$3.$2, $4:$5");

type Props = { c: Kassa; M: string; isLast: boolean; rec: CashRec | null; st: { actual: number; afterExp: number; afterInc: number; afterSales?: number } | null; lastRecNote: string; i0?: number;
  rsv: { bal: number; inn: number; out: number; n: number; mIn: number; mOut: number }; onCash: (v: number) => Promise<void>; onReserve: (v: number, from: "kassa" | "out") => Promise<void> };

export function Tiles({ c, M, isLast, rec, st, lastRecNote, rsv, onCash, onReserve, i0 = 0 }: Props) {
  const [cash, setCash] = useState(""), [rv, setRv] = useState(""), [from, setFrom] = useState<"kassa" | "out">("kassa"), [msg, setMsg] = useState(""), [rmsg, setRmsg] = useState("");
  const diff = st ? c.expected - st.actual : null;
  const fmtIn = (s: string) => { const v = digits(s); return isNaN(v) ? "" : fmt(v); };
  const kind = diff == null ? (isLast ? "Пересчитайте кассу" : "Не пересчитывали") : diff > 0 ? "Недостача" : diff < 0 ? "Излишек" : "Касса сходится";
  const tone = (diff == null ? "muted" : diff > 0 ? "minus" : diff < 0 ? "warn" : "plus") as "muted" | "minus" | "warn" | "plus";
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3.5">
      <Tile i={i0} hero>
        <TileLabel>{isLast ? "Должно быть на руках" : `Должно быть на конец месяца · ${monthName(M).toLowerCase()}`}</TileLabel>
        <TileValue count={c.expected} suffix=" сум" />
        <TileSub>{!isLast && "месяц закрыт · "}расходы: операционные {fmt(c.sOp)} · прочие {fmt(c.sOth)}{c.saved ? ` · ${c.saved > 0 ? "сэкономили" : "перерасход"} ${fmt(Math.abs(c.saved))}` : ""}</TileSub>
      </Tile>
      <Tile i={i0 + 1}>
        <div className="flex flex-col gap-1">
          <TileLabel>{isLast ? "Фактическая наличка сейчас" : "Фактическая наличка на конец месяца"}</TileLabel>
          {st ? <TileValue count={st.actual} suffix=" сум" /> : <TileValue>—</TileValue>}
          <TileSub>{rec ? <>Пересчёт {when(rec.at)}: {fmt(rec.amount)}{st?.afterExp ? ` · после него расходы −${fmt(st.afterExp)}` : ""}{st?.afterInc ? ` · приходы +${fmt(st.afterInc)}` : ""}{st?.afterSales ? ` · продажи наличными +${fmt(st.afterSales)}` : ""}</> : lastRecNote}</TileSub>
        </div>
        {isLast && <form className="flex flex-col gap-2 sm:flex-row" onSubmit={async (e) => { e.preventDefault(); const v = digits(cash); if (isNaN(v)) { setMsg("Введите сумму цифрами"); return; } try { await onCash(v); setCash(""); setMsg(""); } catch { setMsg("Не удалось сохранить, попробуйте ещё раз"); } }}>
          <Input value={cash} onChange={(e) => setCash(fmtIn(e.target.value))} inputMode="numeric" placeholder="Новый пересчёт кассы" aria-label="Сколько наличных в кассе" className="num w-full min-w-0 sm:flex-1" />
          <Button type="submit" className="max-sm:w-full">Пересчитал</Button></form>}
        {msg && <small className="text-xs text-minus">{msg}</small>}
      </Tile>
      <Tile i={i0 + 2}>
        <div className="flex flex-col gap-1">
          <TileLabel>Недостача / излишек</TileLabel>
          {diff == null ? <TileValue>—</TileValue> : <TileValue count={Math.abs(diff)} suffix=" сум" />}
          <TileSub><Chip tone={tone}>{kind}</Chip></TileSub>
        </div>
        <TileSub>{isLast ? "Новые расходы уменьшают и «должно быть», и фактическую наличку, поэтому разница не меняется" : "По последнему пересчёту кассы за этот месяц"}</TileSub>
      </Tile>
      <Tile i={i0 + 3}>
        <div className="flex flex-col gap-1">
          <TileLabel>Резерв</TileLabel>
          <TileValue count={rsv.bal} suffix=" сум" />
          <TileSub>{!isLast ? (rsv.mIn || rsv.mOut ? `на конец месяца · за месяц пополнено ${fmt(rsv.mIn)} · потрачено ${fmt(rsv.mOut)}` : rsv.n ? "на конец месяца · в этом месяце движений не было" : "в этом месяце резерва ещё не было")
            : rsv.n ? `пополнено ${fmt(rsv.inn)} · потрачено ${fmt(rsv.out)}` : "резерва пока нет — пополните его ниже"}</TileSub>
        </div>
        {isLast && <form className="flex flex-col gap-2" onSubmit={async (e) => { e.preventDefault(); const v = digits(rv); if (isNaN(v) || v <= 0) { setRmsg("Введите сумму пополнения цифрами"); return; } try { await onReserve(v, from); setRv(""); setRmsg(""); } catch { setRmsg("Не удалось сохранить, попробуйте ещё раз"); } }}>
          <Input value={rv} onChange={(e) => setRv(fmtIn(e.target.value))} inputMode="numeric" placeholder="Сумма пополнения" aria-label="Сумма пополнения резерва" className="num w-full" />
          <div className="flex flex-wrap gap-2"><Select value={from} onValueChange={(x) => setFrom(x as "kassa" | "out")}><SelectTrigger className="min-w-[8.5rem] shrink-0" aria-label="Откуда пополнение"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="kassa">из кассы</SelectItem><SelectItem value="out">со стороны</SelectItem></SelectContent></Select><Button type="submit">Пополнить</Button></div>
        </form>}
        {rmsg && <small className="text-xs text-minus">{rmsg}</small>}
      </Tile>
    </div>
  );
}
