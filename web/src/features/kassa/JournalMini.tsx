// Журнал записей в блоке бенто: последние 6 записей месяца, внизу итог; полный журнал с фильтрами — ниже сетки.
import { Row, RowCell, RowName, Rows } from "@/components/Rows";
import { cn } from "@/lib/utils";
import type { Entry } from "@/lib/types";
import { pl } from "../pay/logic";
import { dShort, fmt, fromRsv, isBc, isRsvIn, monthName } from "./logic";

const byDate = (a: Entry, b: Entry) => (a.date || "").localeCompare(b.date || "") || (a.createdAt || 0) - (b.createdAt || 0);
const kindOf = (e: Entry) => isRsvIn(e) ? "в резерв" : e.type === "inc" ? "приход" : fromRsv(e) ? "с резерва" : e.cat === "op" ? "операционный" : "прочий";
/** записи месяца без справочных остатков Б/Ч дня (они уже в строке Б/Ч) */
export const monthList = (list: Entry[], M: string) => list.filter((e) => (e.date || "").slice(0, 7) === M && !isBc(e));

export function JournalMini({ list, M }: { list: Entry[]; M: string }) {
  const cur = monthList(list, M), L = [...cur].sort((a, b) => -byDate(a, b)).slice(0, 6);
  const sum = cur.reduce((a, e) => a + (e.type === "inc" ? 1 : -1) * +(e.amount || 0), 0);
  if (!L.length) return <p className="py-6 text-center text-muted-foreground">Записей за месяц нет</p>;
  return (
    <Rows cols="1fr 110px" phone="1fr auto" className="min-h-0 flex-1">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {L.map((e, j) => (
          <Row key={e.id} className={cn("@max-[1599px]/main:min-h-10", j > 2 && "@max-[639px]/main:hidden")}>
            <RowName title={e.name} sub={`${dShort(e.date)} · ${kindOf(e)}`} />
            <RowCell right className={cn(fromRsv(e) && "font-semibold text-muted-foreground", e.type === "inc" && "text-plus")}>{(e.type === "inc" ? "+" : "−") + fmt(e.amount || 0)}</RowCell>
          </Row>))}
      </div>
      <Row bold className="mt-auto flex-none border-foreground/20"><span className="truncate">{monthName(M).split(" ")[0]} · {cur.length} {pl(cur.length, "запись", "записи", "записей")}</span><RowCell right>{(sum < 0 ? "−" : "+") + fmt(Math.abs(sum))}</RowCell></Row>
    </Rows>
  );
}
