// Сегментный переключатель (месяцы, периоды, виды): активный сегмент подсвечивает пилюля FlowPill.
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/motion";
import { FlowPill } from "@/components/FlowPill";

export type SegmentItem = { key: string; label: ReactNode; badge?: number };

export function Segments({ items, value, onChange, size = "md", className, "aria-label": aria }: {
  items: SegmentItem[]; value: string; onChange: (key: string) => void; size?: "sm" | "md"; className?: string; "aria-label"?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion(), first = useRef(true);
  // активная кнопка — в видимую область (при первом показе не двигаем страницу)
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    ref.current?.querySelector<HTMLElement>(`[data-key="${CSS.escape(value)}"]`)?.scrollIntoView({ inline: "nearest", block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [value, reduce]);
  const onKey = (e: KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const i = items.findIndex((x) => x.key === value), n = items[(i + d + items.length) % items.length];
    if (!n) return;
    onChange(n.key);
    requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>(`[data-key="${CSS.escape(n.key)}"]`)?.focus({ preventScroll: true }));
  };
  return (
    <div ref={ref} role="tablist" aria-label={aria} onKeyDown={onKey}
      className={cn("relative inline-flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-border bg-muted/60 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}>
      <FlowPill containerRef={ref} activeKey={value} axis="x" className="bg-popover shadow-sm ring-1 ring-border dark:bg-white/12 dark:ring-primary/30" />
      {items.map((it) => {
        const on = it.key === value;
        return (
          <button key={it.key} type="button" role="tab" data-key={it.key} aria-selected={on} aria-current={on ? "true" : undefined} tabIndex={on ? 0 : -1} onClick={() => onChange(it.key)}
            className={cn("relative z-10 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-transparent px-3.5 text-[13.5px] font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 aria-[current]:text-foreground", size === "sm" ? "h-8" : "h-9")}>
            {it.label}
            {it.badge != null && it.badge > 0 && <span className="num rounded-full bg-primary/15 px-1.5 text-[11px] leading-[18px] font-semibold text-primary">{it.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}
