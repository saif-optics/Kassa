// Общая панель с заголовком: стекло, справа пояснение или действие. Старый Panel из kit.ts остаётся для других разделов.
import { isValidElement } from "react";
import { motion } from "motion/react";
import { land } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ActionLink = { label: React.ReactNode; onClick: () => void; "aria-label"?: string };
/** действие: кнопка-ссылка {label, onClick} или готовый узел (например, иконка-кнопка) */
const isLink = (a: unknown): a is ActionLink => !!a && typeof a === "object" && !isValidElement(a) && "onClick" in a;

export function Card({ title, note, action, i = 0, className, children }: { title: string; note?: React.ReactNode; action?: ActionLink | React.ReactNode; i?: number; className?: string; children: React.ReactNode }) {
  return (
    <motion.section {...land(i)} className={cn("glass flex h-full min-w-0 flex-col gap-2.5 rounded-3xl p-4 @min-[640px]/main:rounded-[28px] @min-[640px]/main:px-6 @min-[640px]/main:py-[22px]", className)}>
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="shrink-0 text-lg font-bold whitespace-nowrap">{title}</h2>
        {action ? (isLink(action)
          ? <button type="button" onClick={action.onClick} aria-label={action["aria-label"]} className="shrink-0 rounded text-[13px] font-semibold text-primary hover:underline">{action.label}</button>
          : <span className="shrink-0 self-center">{action}</span>)
          : note ? <span className="line-clamp-2 min-w-0 text-right text-sm leading-snug text-muted-foreground sm:line-clamp-1">{note}</span> : null}
      </header>
      {children}
    </motion.section>
  );
}
