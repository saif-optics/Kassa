// Выручка за 14 дней: столбики, подписи дней 12 px, воскресенья красным, лучший день светлее.
import { motion } from "motion/react";
import { DUR, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { DayBar } from "./logic";
import { dLong, fmt } from "../plan/logic";

export function WeekChart({ bars }: { bars: DayBar[] }) {
  const mx = Math.max(1, ...bars.map((b) => b.v));
  return (
    <div role="img" aria-label="Выручка по дням за 14 дней" className="flex flex-col gap-2.5">
      <div className="grid h-[120px] grid-cols-14 items-end gap-1.5 pt-1.5 @min-[640px]/main:gap-2">
        {bars.map((b) => (
          <motion.i key={b.d} title={`${dLong(b.d)} · ${fmt(b.v)} сум`} className="block rounded-t-md rounded-b-[2px]"
            style={{ background: b.best ? "var(--primary)" : "var(--chart-1)", opacity: b.best ? 1 : b.sun || !b.v ? 0.3 : 0.6 }}
            initial={{ height: 0 }} animate={{ height: Math.max(3, (b.v / mx) * 100) + "%" }} transition={{ duration: DUR.slow, ease: EASE.out }} />
        ))}
      </div>
      <div className="grid grid-cols-14 gap-1.5 text-center text-xs text-muted-foreground @min-[640px]/main:gap-2">
        {bars.map((b) => <span key={b.d} className={cn(b.sun && "text-minus", b.best && "font-semibold text-foreground")}>{b.n}</span>)}
      </div>
    </div>
  );
}
