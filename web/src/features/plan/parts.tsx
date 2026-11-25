// Мелкие элементы «Плана» и «Главной»: подпись, полоса выполнения, кольца, мини-график.
import { motion } from "motion/react";
import { Line, LineChart } from "recharts";
import { DUR, EASE } from "@/lib/motion";

/** полоса выполнения; mk — черта «где нужно быть сегодня» (0..1) */
export function Bar({ v, mk, color, h = 10 }: { v: number; mk?: number | null; color: string; h?: number }) {
  const w = Math.min(100, Math.max(0, v * 100));
  return (
    <div className="relative" style={{ height: h }}>
      <div className="absolute inset-0 overflow-hidden rounded-full bg-muted">
        <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: w + "%" }} transition={{ duration: DUR.land, ease: EASE.expo }} />
      </div>
      {mk != null && <span className="absolute -top-[3px] -bottom-[3px] w-[3px] -translate-x-1/2 rounded-full bg-foreground/70" style={{ left: Math.min(100, Math.max(0, mk * 100)) + "%" }} />}
    </div>
  );
}

/** большое кольцо с процентом внутри */
export function BigRing({ p, color, label = "плана" }: { p: number; color: string; label?: string }) {
  const R = 62, L = 2 * Math.PI * R, v = Math.max(0, Math.min(1, p));
  return (
    <svg viewBox="0 0 150 150" className="size-[132px] shrink-0 sm:size-[150px]" aria-hidden>
      <circle cx="75" cy="75" r={R} fill="none" strokeWidth="14" className="stroke-muted" />
      <motion.circle cx="75" cy="75" r={R} fill="none" strokeWidth="14" strokeLinecap="round" stroke={color} transform="rotate(-90 75 75)"
        initial={{ strokeDasharray: `0 ${L}` }} animate={{ strokeDasharray: `${L * v} ${L}` }} transition={{ duration: DUR.land, ease: EASE.expo }} />
      <text x="75" y="80" textAnchor="middle" fontSize="28" fontWeight="700" className="fill-foreground">{Math.round(p * 100)}%</text>
      <text x="75" y="100" textAnchor="middle" fontSize="11" className="fill-muted-foreground">{label}</text>
    </svg>
  );
}

/** маленькое кольцо для плитки */
export function MiniRing({ p, color }: { p: number; color: string }) {
  const r = 15, c = 2 * Math.PI * r, v = Math.max(0, Math.min(1, p));
  return (
    <svg viewBox="0 0 40 40" className="size-11 shrink-0" aria-hidden>
      <circle cx="20" cy="20" r={r} fill="none" strokeWidth="4.5" className="stroke-muted" />
      <motion.circle cx="20" cy="20" r={r} fill="none" strokeWidth="4.5" strokeLinecap="round" stroke={color} transform="rotate(-90 20 20)"
        initial={{ strokeDasharray: `0 ${c}` }} animate={{ strokeDasharray: `${c * v} ${c}` }} transition={{ duration: DUR.land, ease: EASE.expo }} />
    </svg>
  );
}

/** линия-мини график без осей */
export function Spark({ data, color, w = 64, h = 24 }: { data: number[]; color: string; w?: number; h?: number }) {
  if (data.length < 2) return null;
  return <LineChart width={w} height={h} data={data.map((v) => ({ v }))} margin={{ top: 4, right: 3, bottom: 4, left: 3 }} className="shrink-0"><Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} isAnimationActive /></LineChart>;
}
