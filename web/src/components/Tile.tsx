// Общая плитка итога (стекло или градиент бренда) и её части: подпись, значение, пояснение, пилюля.
import { createContext, useContext } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { land, useCountUp } from "@/lib/motion";
import { fmt } from "@/features/pay/logic";
import { fmtM } from "@/features/plan/logic";
import { goProps, type Dest } from "@/lib/go";
import { Glow, IconBox, SparkArea, type Tone } from "./TileDeco";
import type { LucideIcon } from "lucide-react";

const OnHero = createContext(false);
const HasIcon = createContext(false);

/** to + label — плитка-ссылка: курсор, подъём при наведении, Enter, подпись «Открыть …» */
/** icon + tone — цветная иконка в квадрате справа вверху; glow — свечение цвета смысла (статусные плитки); spark — мини-график под числом */
export function Tile({ i = 0, hero, heroColor, warn, className, children, to, label, icon, tone = "brand", glow, spark }: { i?: number; hero?: boolean; heroColor?: string; warn?: boolean; className?: string; children: React.ReactNode; to?: Dest | (() => void); label?: string; icon?: LucideIcon; tone?: Tone; glow?: Tone | null; spark?: number[] }) {
  return (
    <OnHero.Provider value={!!hero}><HasIcon.Provider value={!!icon && !hero}>
      <motion.div {...land(i)} {...(to ? { ...goProps(to, label || "раздел"), whileHover: { y: -2 } } : {})}
        style={hero && heroColor ? { background: `linear-gradient(135deg, ${heroColor}, color-mix(in srgb, ${heroColor} 62%, #000))`, boxShadow: `0 14px 36px color-mix(in srgb, ${heroColor} 32%, transparent)` } : undefined}
        className={cn("isolate flex h-full relative min-h-[118px] min-w-0 flex-col justify-between overflow-hidden rounded-3xl p-4 @min-[640px]/main:rounded-[28px] @min-[640px]/main:px-6 @min-[640px]/main:py-4 @min-[1600px]/main:py-[22px]",
          hero ? "border border-white/25 bg-[linear-gradient(135deg,var(--brand),#0a4f7a_60%,var(--brand-navy))] text-white shadow-[0_14px_36px_rgb(2_110_166/0.32)]" : "glass",
          to && "cursor-pointer outline-none transition-shadow hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary/50",
          warn && "ring-1 ring-minus/50", className)}>
        {glow && !hero && <Glow tone={glow} />}{spark && <SparkArea data={spark} tone={hero ? "muted" : tone} color={hero ? "rgb(255 255 255 / .38)" : undefined} />}
        {icon && !hero && <span className="absolute top-3.5 right-3.5 @min-[640px]/main:top-4 @min-[640px]/main:right-5"><IconBox icon={icon} tone={tone} /></span>}
        {icon && hero && <span className="absolute max-[639px]:hidden top-3.5 right-3.5 @min-[640px]/main:top-4 @min-[640px]/main:right-5"><span aria-hidden="true" className="grid size-9 place-items-center rounded-xl bg-white/20 text-white @min-[640px]/main:size-10 @min-[640px]/main:rounded-[13px]">{(() => { const I = icon; return <I className="size-[18px] @min-[640px]/main:size-5" strokeWidth={1.9} />; })()}</span></span>}
        {children}</motion.div>
    </HasIcon.Provider></OnHero.Provider>
  );
}

export function TileLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  const hero = useContext(OnHero), icon = useContext(HasIcon);
  return <span className={cn("text-[13px] font-semibold tracking-[.06em] uppercase", icon && "pr-11 @min-[640px]/main:pr-12", hero ? "text-white/80" : "text-muted-foreground", className)}>{children}</span>;
}

/** значение плитки; count — число с досчётом: «sum» — целое с пробелами, «mln» — «1,2 млн» */
export function TileValue({ children, count, format = "sum", suffix, compact, className }: { children?: React.ReactNode; count?: number; format?: "sum" | "mln"; suffix?: string; compact?: boolean; className?: string }) {
  const hero = useContext(OnHero);
  const v = useCountUp(count ?? 0);
  const fmtOf = (n: number) => (format === "mln" ? fmtM(n) : fmt(n)) + (suffix ?? "");
  const body = count == null ? children : fmtOf(v);
  // длину считаем по конечному значению, чтобы размер не прыгал во время досчёта
  const full = count == null ? children : fmtOf(count);
  const long = typeof full === "string" && full.length > 13;
  const size = hero ? "text-[40px] @min-[640px]/main:text-[52px]" : long ? "text-[26px] @min-[640px]/main:text-[30px]" : "text-[30px] @min-[640px]/main:text-[38px]";
  const cls = cn(size, "num block max-w-full min-w-0 font-extrabold tracking-[-0.02em] whitespace-nowrap leading-none", className);
  // compact: на телефоне короткая запись «52,9 млн», от 640 px полная
  if (compact && count != null) return <>
    <span className={cn(cls, "@min-[640px]/main:hidden")}>{fmtM(v)}</span>
    <span className={cn(cls, "hidden @min-[640px]/main:block")}>{body}</span>
  </>;
  return <span className={cls}>{body}</span>;
}

export const TileSub = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const hero = useContext(OnHero);
  return <span className={cn("mt-1.5 flex min-w-0 flex-nowrap items-center gap-2 text-[13px] leading-6 @min-[640px]/main:text-sm [&>span]:min-w-0 [&>span]:truncate", hero ? "text-white/85" : "text-muted-foreground", className)}>{children}</span>;
};

export type ChipTone = "plus" | "minus" | "warn" | "info" | "muted";
const TONE: Record<ChipTone, string> = { plus: "bg-plus-soft text-plus", minus: "bg-minus-soft text-minus", warn: "bg-warn-soft text-warn", info: "bg-primary/12 text-primary", muted: "bg-muted text-muted-foreground" };
export function Chip({ tone, children, className }: { tone: ChipTone; children: React.ReactNode; className?: string }) {
  const hero = useContext(OnHero);
  return <span className={cn("inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-[12.5px] font-semibold", hero ? "bg-white/20 text-white" : TONE[tone], className)}>{children}</span>;
}

/** верх плитки: подпись слева, кольцо или искра справа (40 px) */
export const TileTop = ({ children }: { children: React.ReactNode }) => <div className="flex items-start justify-between gap-2">{children}</div>;
/** низ плитки: значение и пояснение под ним */
export const TileBody = ({ children }: { children: React.ReactNode }) => <div className="min-w-0">{children}</div>;
