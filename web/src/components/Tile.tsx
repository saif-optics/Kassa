// Общая плитка итога (стекло или градиент бренда) и её части: подпись, значение, пояснение, пилюля.
import { createContext, useContext } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { land, useCountUp } from "@/lib/motion";
import { fmt } from "@/features/pay/logic";
import { fmtM } from "@/features/plan/logic";

const OnHero = createContext(false);

export function Tile({ i = 0, hero, warn, className, children }: { i?: number; hero?: boolean; warn?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <OnHero.Provider value={!!hero}>
      <motion.div {...land(i)}
        className={cn("flex min-h-32 min-w-0 flex-col justify-between overflow-hidden rounded-[24px] p-4",
          hero ? "border border-white/25 bg-[linear-gradient(135deg,var(--brand),#0a4f7a_60%,var(--brand-navy))] text-white shadow-[0_14px_36px_rgb(2_110_166/0.32)]" : "glass",
          warn && "ring-1 ring-minus/50", className)}>{children}</motion.div>
    </OnHero.Provider>
  );
}

export function TileLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  const hero = useContext(OnHero);
  return <span className={cn("text-xs font-semibold tracking-[.06em] uppercase", hero ? "text-white/80" : "text-muted-foreground", className)}>{children}</span>;
}

/** значение плитки; count — число с досчётом: «sum» — целое с пробелами, «mln» — «1,2 млн» */
export function TileValue({ children, count, format = "sum", suffix, className }: { children?: React.ReactNode; count?: number; format?: "sum" | "mln"; suffix?: string; className?: string }) {
  const v = useCountUp(count ?? 0);
  const fmtOf = (n: number) => (format === "mln" ? fmtM(n) : fmt(n)) + (suffix ?? "");
  const body = count == null ? children : fmtOf(v);
  // длину считаем по конечному значению, чтобы размер не прыгал во время досчёта
  const full = count == null ? children : fmtOf(count);
  const long = typeof full === "string" && full.length > 13;
  return <span className={cn("num block max-w-full min-w-0 font-bold tracking-[-0.01em] whitespace-nowrap", long ? "text-[22px]" : "text-[26px]", "leading-[1.1]", className)}>{body}</span>;
}

export const TileSub = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const hero = useContext(OnHero);
  return <span className={cn("mt-1.5 flex min-w-0 flex-nowrap items-center gap-1.5 text-xs leading-5 [&>span]:min-w-0 [&>span]:truncate", hero ? "text-white/85" : "text-muted-foreground", className)}>{children}</span>;
};

export type ChipTone = "plus" | "minus" | "warn" | "info" | "muted";
const TONE: Record<ChipTone, string> = { plus: "bg-plus-soft text-plus", minus: "bg-minus-soft text-minus", warn: "bg-warn-soft text-warn", info: "bg-primary/12 text-primary", muted: "bg-muted text-muted-foreground" };
export function Chip({ tone, children, className }: { tone: ChipTone; children: React.ReactNode; className?: string }) {
  const hero = useContext(OnHero);
  return <span className={cn("inline-flex h-5 shrink-0 items-center rounded-full px-2 text-[11.5px] font-semibold", hero ? "bg-white/20 text-white" : TONE[tone], className)}>{children}</span>;
}

/** верх плитки: подпись слева, кольцо или искра справа (40 px) */
export const TileTop = ({ children }: { children: React.ReactNode }) => <div className="flex items-start justify-between gap-2">{children}</div>;
/** низ плитки: значение и пояснение под ним */
export const TileBody = ({ children }: { children: React.ReactNode }) => <div className="min-w-0">{children}</div>;
