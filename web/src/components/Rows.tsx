// Строки списка в карточке: сетка колонок, высота 40, разделитель сверху. Колонки: <Rows cols="1fr 120px 120px">.
import { createContext, useContext } from "react";
import { cn } from "@/lib/utils";

const Cols = createContext("minmax(0,1fr) 120px 120px");

export function Rows({ cols = "1fr 120px 120px", className, children }: { cols?: string; className?: string; children: React.ReactNode }) {
  return <Cols.Provider value={cols.replace(/^1fr/, "minmax(0,1fr)")}><div className={cn("flex flex-col", className)}>{children}</div></Cols.Provider>;
}

/** строка; bold — итоговая; на телефоне узкие колонки подстраиваются по содержимому */
export function Row({ bold, className, children }: { bold?: boolean; className?: string; children: React.ReactNode }) {
  const cols = useContext(Cols);
  return <div style={{ "--cols": cols } as React.CSSProperties}
    className={cn("grid h-10 min-w-0 items-center gap-3 border-t border-foreground/8 text-[13.5px] first:border-t-0 max-sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:grid-cols-(--cols)", bold && "font-bold", className)}>{children}</div>;
}

/** ячейка: right — по правому краю, числа жирные; muted — подпись 12 px */
export function RowCell({ right, muted, className, children }: { right?: boolean; muted?: boolean; className?: string; children?: React.ReactNode }) {
  return <span className={cn("num min-w-0", right && "text-right font-semibold", muted && "text-xs font-normal text-muted-foreground", className)}>{children}</span>;
}

/** название с подписью под ним (товар, платёж, задание) */
export function RowName({ title, sub, dot }: { title: React.ReactNode; sub?: React.ReactNode; dot?: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      {dot && <i className="size-2 shrink-0 rounded-full" style={{ background: dot }} />}
      <span className="min-w-0 leading-tight"><span className="block truncate">{title}</span>{sub && <span className="block truncate text-xs text-muted-foreground">{sub}</span>}</span>
    </span>
  );
}
