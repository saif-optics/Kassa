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
    <motion.section {...land(i)} className={cn("glass flex min-w-0 flex-col gap-3 rounded-[24px] p-4 sm:p-[18px]", className)}>
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="shrink-0 text-base font-semibold whitespace-nowrap">{title}</h2>
        {action ? (isLink(action)
          ? <button type="button" onClick={action.onClick} aria-label={action["aria-label"]} className="shrink-0 rounded text-[12.5px] font-semibold text-primary hover:underline">{action.label}</button>
          : <span className="shrink-0 self-center">{action}</span>)
          : note ? <span className="line-clamp-2 min-w-0 text-right text-xs leading-snug text-muted-foreground sm:line-clamp-1">{note}</span> : null}
      </header>
      {children}
    </motion.section>
  );
}
