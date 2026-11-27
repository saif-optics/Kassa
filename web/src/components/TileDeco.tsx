// Оформление плиток по смыслу: цветная иконка в квадрате, мягкое свечение из правого верхнего угла, мини-график под числом.
// Цвета — только переменные темы (палитра в index.css).
import { useId } from "react";
import type { LucideIcon } from "lucide-react";

export type Tone = "brand" | "plus" | "minus" | "warn" | "info" | "muted";
/** цвет по смыслу: бренд, успех, внимание, предупреждение, категории, нейтраль */
export const TONE_VAR: Record<Tone, string> = { brand: "var(--primary)", plus: "var(--plus)", minus: "var(--minus)", warn: "var(--warn)", info: "var(--chart-2)", muted: "var(--chart-5)" };

/** иконка в квадрате 40 px: фон — цвет 16%; на телефоне меньше (36 px) */
export function IconBox({ icon: Icon, tone = "brand", className = "" }: { icon: LucideIcon; tone?: Tone; className?: string }) {
  return (
    <span aria-hidden="true" className={"grid size-9 shrink-0 place-items-center rounded-xl @min-[640px]/main:size-10 @min-[640px]/main:rounded-[13px] " + className}
      style={{ background: `color-mix(in srgb, ${TONE_VAR[tone]} 16%, transparent)`, color: TONE_VAR[tone] }}>
      <Icon className="size-[18px] @min-[640px]/main:size-5" strokeWidth={1.9} />
    </span>
  );
}

/** свечение цвета смысла: radial из правого верхнего угла, 20% */
export const Glow = ({ tone }: { tone: Tone }) => (
  <i aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ background: `radial-gradient(circle at 100% 0%, color-mix(in srgb, ${TONE_VAR[tone]} 20%, transparent), transparent 62%)` }} />
);

/** мини-график: площадь с градиентом и линия, на всю ширину у нижнего края плитки */
export function SparkArea({ data, tone = "brand", color }: { data: number[]; tone?: Tone; color?: string }) {
  const id = "sp" + useId().replace(/:/g, "");
  if (data.length < 2) return null;
  const c = color || TONE_VAR[tone], mx = Math.max(...data), mn = Math.min(...data), span = mx - mn || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * 100, 34 - ((v - mn) / span) * 28] as const);
  const line = pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  return (
    <svg aria-hidden="true" viewBox="0 0 100 40" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[46%] w-full">
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c} stopOpacity=".32" /><stop offset="1" stopColor={c} stopOpacity="0" /></linearGradient></defs>
      <polygon points={`0,40 ${line} 100,40`} fill={`url(#${id})`} />
      <polyline points={line} fill="none" stroke={c} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
