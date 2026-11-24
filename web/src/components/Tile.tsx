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
        className={cn("flex min-h-[128px] min-w-0 flex-col justify-between gap-2.5 rounded-[24px] p-4 sm:p-[18px]",
          hero ? "border border-white/25 bg-[linear-gradient(135deg,var(--brand),#0a4f7a_60%,var(--brand-navy))] text-white shadow-[0_14px_36px_rgb(2_110_166/0.32)]" : "glass",
          warn && "ring-2 ring-minus/50", className)}>{children}</motion.div>
    </OnHero.Provider>
  );
}

export function TileLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  const hero = useContext(OnHero);
  return <span className={cn("text-[11px] font-semibold tracking-[.08em] uppercase", hero ? "text-white/80" : "text-muted-foreground", className)}>{children}</span>;
}

/** значение плитки; count — число с досчётом: «sum» — целое с пробелами, «mln» — «1,2 млн» */
export function TileValue({ children, count, format = "sum", suffix, className }: { children?: React.ReactNode; count?: number; format?: "sum" | "mln"; suffix?: string; className?: string }) {
  const v = useCountUp(count ?? 0);
  const fmtOf = (n: number) => (format === "mln" ? fmtM(n) : fmt(n)) + (suffix ?? "");
  const body = count == null ? children : fmtOf(v);
  // длину считаем по конечному значению, чтобы размер не прыгал во время досчёта
  const full = count == null ? children : fmtOf(count);
  const long = typeof full === "string" && full.length > 13;
  return <span className={cn("num max-w-full min-w-0 truncate leading-tight font-bold tracking-[-0.02em] whitespace-nowrap",
    long ? "text-[19px] xl:text-[21px] 2xl:text-[23px]" : "text-[22px] xl:text-[24px] 2xl:text-[26px]", className)}>{body}</span>;
}

export const TileSub = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const hero = useContext(OnHero);
  return <span className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] leading-snug", hero ? "text-white/85" : "text-muted-foreground", className)}>{children}</span>;
};

export type ChipTone = "plus" | "minus" | "warn" | "info" | "muted";
const TONE: Record<ChipTone, string> = { plus: "bg-plus-soft text-plus", minus: "bg-minus-soft text-minus", warn: "bg-warn-soft text-warn", info: "bg-primary/12 text-primary", muted: "bg-muted text-muted-foreground" };
export function Chip({ tone, children, className }: { tone: ChipTone; children: React.ReactNode; className?: string }) {
  const hero = useContext(OnHero);
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11.5px] leading-snug font-semibold", hero ? "bg-white/20 text-white" : TONE[tone], className)}>{children}</span>;
}
