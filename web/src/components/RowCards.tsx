// Таблица, которая на телефоне становится карточками. main/sub/первая правая колонка — в шапке карточки,
// остальное — в раскрывающейся части (подпись/значение) и expand.
import { Fragment, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DUR, EASE, land } from "@/lib/motion";
import { useIsPhone } from "@/lib/useMedia";

export type RowColumn<T> = { key: string; title: ReactNode; cell: (row: T) => ReactNode; align?: "right"; main?: boolean; sub?: boolean; hideMobile?: boolean; width?: string };

type Props<T> = {
  columns: RowColumn<T>[]; rows: T[]; rowKey: (row: T) => string; expand?: (row: T) => ReactNode; onRowClick?: (row: T) => void;
  empty?: ReactNode; stickyHead?: boolean; dense?: boolean; footer?: ReactNode; className?: string;
  rowClass?: (row: T) => string | undefined;         // подсветка строки/карточки
  expandedKey?: string | null;                        // раскрытая строка снаружи (управляемый режим)
  onExpandChange?: (key: string | null) => void;
  selectedKey?: string | null;                        // выбранная строка: подсветка на ≥ 640 (aria-selected)
};

const LAND_MAX = 12; // анимируем посадку только первых строк

export function RowCards<T>(p: Props<T>) {
  const phone = useIsPhone();
  if (!p.rows.length) return <div className="rounded-2xl px-4 py-8 text-center text-[13.5px] text-muted-foreground">{p.empty ?? "Нет данных"}</div>;
  return phone ? <Cards {...p} /> : <Grid {...p} />;
}

// раскрытие: своё состояние, а если передан expandedKey или onExpandChange — управляет внешний код
function useOpenKey(p: { expandedKey?: string | null; onExpandChange?: (key: string | null) => void }) {
  const [own, setOwn] = useState<string | null>(null);
  const open = p.expandedKey !== undefined ? p.expandedKey : own;
  const toggle = (k: string) => { const n = open === k ? null : k; setOwn(n); p.onExpandChange?.(n); };
  return [open, toggle] as const;
}

function Grid<T>({ columns, rows, rowKey, expand, onRowClick, stickyHead, dense, footer, className, rowClass, selectedKey, ...ex }: Props<T>) {
  const [open, toggle] = useOpenKey(ex);
  const click = (r: T, k: string) => { if (expand) toggle(k); onRowClick?.(r); };
  const act = !!(expand || onRowClick), py = dense ? "py-1.5" : "py-2.5";
  return (
    <div className={cn("overflow-x-auto", className)}>
      <Table>
        <TableHeader className={cn(stickyHead && "sticky top-0 z-10 bg-card")}>
          <TableRow>
            {columns.map((c) => <TableHead key={c.key} style={{ width: c.width }} className={cn("text-[12px] font-semibold text-muted-foreground", c.align === "right" && "text-right")}>{c.title}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => {
            const k = rowKey(r), on = open === k;
            return (
              <Fragment key={k}>
                <TableRow className={cn(act && "cursor-pointer", rowClass?.(r), selectedKey === k && "bg-primary/10 hover:bg-primary/15")} aria-selected={selectedKey != null ? selectedKey === k : undefined} data-state={on ? "selected" : undefined} tabIndex={act ? 0 : undefined} aria-expanded={expand ? on : undefined}
                  onClick={() => click(r, k)} onKeyDown={act ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); click(r, k); } } : undefined}>
                  {columns.map((c) => <TableCell key={c.key} className={cn(py, "num", c.align === "right" && "text-right", c.main && "font-semibold")}>{c.cell(r)}</TableCell>)}
                </TableRow>
                {expand && on && <TableRow className="hover:bg-transparent"><TableCell colSpan={columns.length} className="bg-muted/40 text-[13px]">{expand(r)}</TableCell></TableRow>}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
      {footer && <div className="px-2 pt-3 text-[13px]">{footer}</div>}
    </div>
  );
}

function Cards<T>({ columns, rows, rowKey, expand, onRowClick, dense, footer, className, rowClass, ...ex }: Props<T>) {
  const [open, toggle] = useOpenKey(ex);
  const main = columns.filter((c) => c.main), right = columns.find((c) => c.align === "right"), sub = columns.filter((c) => c.sub);
  const used = new Set([...main, ...sub, ...(right ? [right] : [])].map((c) => c.key));
  const more = columns.filter((c) => !used.has(c.key) && !c.hideMobile);
  return (
    <div className={cn("flex flex-col", dense ? "gap-1.5" : "gap-2", className)}>
      {rows.map((r, i) => { const k = rowKey(r); return <RowCard key={k} i={i} row={r} main={main} right={right} sub={sub} more={more} expand={expand} onRowClick={onRowClick} dense={dense} open={open === k} onToggle={() => toggle(k)} className={rowClass?.(r)} />; })}
      {footer && <div className="px-1 pt-1 text-[13px]">{footer}</div>}
    </div>
  );
}

function RowCard<T>({ i, row, main, right, sub, more, expand, onRowClick, dense, open, onToggle, className }: {
  open: boolean; onToggle: () => void; className?: string; i: number; row: T; main: RowColumn<T>[]; right?: RowColumn<T>; sub: RowColumn<T>[]; more: RowColumn<T>[]; expand?: (row: T) => ReactNode; onRowClick?: (row: T) => void; dense?: boolean;
}) {
  const subs = sub.map((c) => ({ k: c.key, v: c.cell(row) })).filter((x) => x.v != null && x.v !== "" && x.v !== false);
  const canOpen = !!expand || more.length > 0, act = canOpen || !!onRowClick;
  const toggle = () => { if (canOpen) onToggle(); onRowClick?.(row); };
  const anim = i < LAND_MAX ? land(i) : {};
  return (
    <motion.div {...anim} className={cn("glass-inner rounded-2xl px-3.5", dense ? "py-2" : "py-3", className)}>
      <div role={act ? "button" : undefined} tabIndex={act ? 0 : undefined} aria-expanded={canOpen ? open : undefined}
        onClick={toggle} onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && act) { e.preventDefault(); toggle(); } }}
        className={cn("flex flex-col gap-1 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/40", act && "cursor-pointer")}>
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1 text-[14px] leading-snug font-semibold">{main.map((c) => <Fragment key={c.key}>{c.cell(row)} </Fragment>)}</div>
          {right && <div className="num shrink-0 text-[14px] leading-snug font-semibold">{right.cell(row)}</div>}
          {canOpen && <ChevronDown aria-hidden="true" className={cn("mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />}
        </div>
        {subs.length > 0 && <div className="flex flex-wrap items-center gap-x-1.5 text-[12px] leading-snug text-muted-foreground">
          {subs.map((x, j) => <Fragment key={x.k}>{j > 0 && <span aria-hidden="true">·</span>}<span className="num">{x.v}</span></Fragment>)}
        </div>}
      </div>
      <AnimatePresence initial={false}>
        {open && canOpen && (
          <motion.div key="more" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: DUR.base, ease: EASE.out }} className="overflow-hidden">
            <div className="mt-2.5 flex flex-col gap-2 border-t border-border/70 pt-2.5">
              {more.length > 0 && <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[12px]">
                {more.map((c) => <Fragment key={c.key}><dt className="text-muted-foreground">{c.title}</dt><dd className="num text-right">{c.cell(row)}</dd></Fragment>)}
              </dl>}
              {expand && <div className="text-[12.5px]">{expand(row)}</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
