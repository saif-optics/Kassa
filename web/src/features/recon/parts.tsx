// Общие мелочи раздела «Сверка»: прочерк, подсветка строки с расхождением, порядок колонок на телефоне.
import { cn } from "@/lib/utils";
import type { RowColumn } from "@/components/RowCards";

export const dash = <span className="text-muted-foreground">—</span>;

/** цветная точка перед датой: строка с расхождением (minus) или с продажей только в одной системе (warn) */
export function Dot({ tone }: { tone?: "minus" | "warn" }) {
  return tone ? <i aria-hidden="true" className={cn("mr-1.5 inline-block size-2 rounded-full align-middle", tone === "minus" ? "bg-minus" : "bg-warn")} /> : null;
}

/** на телефоне в шапке карточки справа стоит первая правая колонка — главную цифру ставим первой */
export const ord = <T,>(cols: RowColumn<T>[], first: string, phone: boolean) => (phone ? [cols[0], ...cols.filter((c) => c.key === first), ...cols.slice(1).filter((c) => c.key !== first)] : cols);
