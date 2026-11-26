// Строки списка в карточке: сетка колонок, высота 40, разделитель сверху. Колонки: <Rows cols="1fr 120px 120px">.
import { createContext, useContext } from "react";
import { cn } from "@/lib/utils";

const Cols = createContext({ cols: "minmax(0,1fr) 120px 120px", phone: "minmax(0,1fr) auto auto", fill: false });

/** cols — колонки от 640 px, phone — на телефоне; fill — строки делят свободную высоту карточки (бенто) */
export function Rows({ cols = "1fr 120px 120px", phone = "1fr auto auto", fill, className, children }: { cols?: string; phone?: string; fill?: boolean; className?: string; children: React.ReactNode }) {
  const f = (c: string) => c.replace(/^1fr/, "minmax(0,1fr)");
  return <Cols.Provider value={{ cols: f(cols), phone: f(phone), fill: !!fill }}><div className={cn("flex flex-col", fill && "min-h-0 flex-1", className)}>{children}</div></Cols.Provider>;
}

/** строка; bold — итоговая; на телефоне узкие колонки подстраиваются по содержимому */
export function Row({ bold, className, children }: { bold?: boolean; className?: string; children: React.ReactNode }) {
  const { cols, phone, fill } = useContext(Cols);
  return <div style={{ "--cols": cols, "--pcols": phone } as React.CSSProperties}
    className={cn("grid min-h-[46px] min-w-0 items-center gap-3 border-t border-foreground/8 text-[15px] first:border-t-0 max-sm:grid-cols-(--pcols) sm:grid-cols-(--cols)", fill && "min-h-10 flex-1", bold && "font-bold", className)}>{children}</div>;
}

/** ячейка: right — по правому краю, числа жирные; muted — подпись 12 px */
export function RowCell({ right, muted, className, children }: { right?: boolean; muted?: boolean; className?: string; children?: React.ReactNode }) {
  return <span className={cn("num min-w-0", right && "text-right text-base font-bold", muted && "text-[13px] font-normal text-muted-foreground", className)}>{children}</span>;
}

/** название с подписью под ним (товар, платёж, задание) */
export function RowName({ title, sub, dot }: { title: React.ReactNode; sub?: React.ReactNode; dot?: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      {dot && <i className="size-[9px] shrink-0 rounded-full" style={{ background: dot }} />}
      <span className="min-w-0 leading-tight"><span className="block truncate">{title}</span>{sub && <span className="block truncate text-[13px] text-muted-foreground">{sub}</span>}</span>
    </span>
  );
}
