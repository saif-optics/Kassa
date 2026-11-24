// Общая панель с заголовком: стекло, справа пояснение или кнопка-ссылка. Старый Panel из kit.ts остаётся для других разделов.
import { motion } from "motion/react";
import { land } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function Card({ title, note, action, i = 0, className, children }: { title: string; note?: React.ReactNode; action?: { label: string; onClick: () => void }; i?: number; className?: string; children: React.ReactNode }) {
  return (
    <motion.section {...land(i)} className={cn("glass flex min-w-0 flex-col gap-3 rounded-[24px] p-4 sm:p-[18px]", className)}>
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="shrink-0 text-base font-semibold whitespace-nowrap">{title}</h2>
        {action ? <button type="button" onClick={action.onClick} className="shrink-0 rounded text-[12.5px] font-semibold text-primary hover:underline">{action.label}</button>
          : note ? <span className="min-w-0 truncate text-right text-xs text-muted-foreground">{note}</span> : null}
      </header>
      {children}
    </motion.section>
  );
}
