// Элементы раздела «Отчёт р/с»: поле суммы, строка дней, значок.
import { useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { wdOf } from "./logic";

const STAT: Record<string, string> = { ok: "bg-plus", part: "bg-warn", none: "bg-border" };
/** строка дней месяца: число, день недели и точка статуса (внесено / частично / нет) */
export function DayChips({ days, value, onPick, stat, title, label }: { days: string[]; value: string; onPick: (d: string) => void; stat: (d: string) => string; title: (d: string) => string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const b = ref.current?.querySelector<HTMLElement>('[aria-pressed="true"]'), box = ref.current; if (b && box) box.scrollLeft = Math.max(0, b.offsetLeft - box.offsetLeft - (box.clientWidth - b.offsetWidth) / 2); }, [value, days.length]);
  return (
    <div ref={ref} role="group" aria-label={label} className="-mx-1 flex max-w-full gap-1.5 overflow-x-auto px-1 pt-1 pb-2">
      {days.map((x) => (
        <button key={x} type="button" aria-pressed={x === value} title={title(x)} onClick={() => onPick(x)}
          className={cn("relative flex w-12 shrink-0 flex-col items-center rounded-xl border px-1 pt-1.5 pb-2.5 transition", x === value ? "border-primary bg-accent text-accent-foreground" : "border-border bg-card/60 hover:bg-muted")}>
          <small className="text-[10.5px] text-muted-foreground">{wdOf(x)}</small><b className="num text-[16px] leading-tight">{+x.slice(8)}</b>
          <i className={cn("absolute bottom-1 size-1.5 rounded-full", STAT[stat(x)] || STAT.none)} />
        </button>))}
    </div>
  );
}


/** значок «авто» / «вручную» у заголовка панели */
export function Badge({ auto, children }: { auto?: boolean; children?: React.ReactNode }) {
  return <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", auto ? "bg-primary/12 text-primary" : "bg-warn-soft text-warn")}>{children ?? (auto ? "Авто" : "Вручную")}</span>;
}

/** плашка «Раздел в доработке» — как на рабочем сайте */
export function Wip({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass flex items-start gap-3 rounded-[22px] p-4"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-warn-soft text-warn"><Clock className="size-5" /></span>
      <div className="flex flex-col"><b>Раздел в доработке</b><span className="text-[13px] text-muted-foreground">{children}</span></div></div>
  );
}
