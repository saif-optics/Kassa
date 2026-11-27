// Общие мелочи «Пользователей» и «Отметок»: аватар-инициалы, цветные точки и чипы, иконка-кнопка с подсказкой, цвет точки.
import { forwardRef } from "react";
import type { LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useData } from "@/lib/useData";
import { PCOL } from "@/features/sales/logic";

const mix = (c: string, p: number) => `color-mix(in srgb, ${c} ${p}%, transparent)`;

/** цвет точки: по порядку точек из настроек (как в Продажах); нет точки («все точки») — нейтральный */
export function usePointCol(extra: string[] = []) {
  const { data } = useData();
  const list = [...(data?.points || [])];
  for (const p of extra) if (!list.includes(p)) list.push(p);
  return (p?: string | null) => (p ? PCOL[(Math.max(0, list.indexOf(p))) % PCOL.length] : "var(--chart-5)");
}

export const Dot = ({ color, className }: { color: string; className?: string }) => <i aria-hidden="true" className={cn("inline-block size-2 shrink-0 rounded-full", className)} style={{ background: color }} />;

/** кружок с инициалами в цвете роли или точки */
export function Avatar({ text, color, size = 40, dim }: { text: string; color: string; size?: number; dim?: boolean }) {
  return (
    <span aria-hidden="true" className={cn("grid shrink-0 place-items-center rounded-full text-[13px] font-extrabold tracking-wide select-none", dim && "opacity-60")}
      style={{ width: size, height: size, background: mix(color, 18), color, boxShadow: `inset 0 0 0 1px ${mix(color, 28)}` }}>{text}</span>
  );
}

/** чип с цветной точкой и тонированным фоном */
export function DotChip({ color, children, className, title }: { color: string; children: React.ReactNode; className?: string; title?: string }) {
  return (
    <span title={title} className={cn("inline-flex h-7 max-w-full shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[12.5px] font-semibold whitespace-nowrap", className)} style={{ background: mix(color, 15), color }}>
      <Dot color={color} /><span className="min-w-0 truncate">{children}</span>
    </span>
  );
}
/** чип точки: нейтральный фон, цветная точка, обычный текст */
export function PointChip({ color, children, className }: { color: string; children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex h-7 max-w-full shrink-0 items-center gap-1.5 rounded-full bg-muted px-2.5 text-[12.5px] font-semibold whitespace-nowrap", className)}><Dot color={color} /><span className="min-w-0 truncate">{children}</span></span>;
}

type IconBtnProps = { icon: LucideIcon; label: string; color?: string; onClick?: () => void; disabled?: boolean; className?: string; size?: number };
/** иконка-кнопка 36 px с подсказкой; color — цвет значка и тонированного фона (по смыслу: жёлтая, коралловая) */
export const IconBtn = forwardRef<HTMLButtonElement, IconBtnProps>(function IconBtn({ icon: Icon, label, color, onClick, disabled, className, size = 36 }, ref) {
  return (
    <Tooltip><TooltipTrigger asChild>
      <button ref={ref} type="button" aria-label={label} disabled={disabled} onClick={onClick}
        className={cn("grid shrink-0 place-items-center rounded-xl border border-border/60 bg-muted/70 text-muted-foreground outline-none transition-[background-color,color,transform] hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-95 disabled:pointer-events-none disabled:opacity-40", className)}
        style={{ width: size, height: size, ...(color ? { color, background: mix(color, 13), borderColor: mix(color, 22) } : {}) }}>
        <Icon className="size-[17px]" strokeWidth={1.9} />
      </button>
    </TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip>
  );
});
