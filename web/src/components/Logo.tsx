// Логотип Saif-Optics: кольца (как symbol soMark на рабочем сайте) и подпись.
import { useId } from "react";
import { cn } from "@/lib/utils";

export function LogoMark({ className, rings }: { className?: string; rings?: boolean }) {
  const u = useId().replace(/:/g, ""), ring = `r${u}`, side = `s${u}`, shine = `h${u}`;
  return (
    <svg viewBox={rings ? "625 650 680 320" : "495 640 942 340"} aria-hidden="true" focusable="false" className={className}>
      <defs>
        <linearGradient id={ring} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9be8ff" /><stop offset=".45" stopColor="#48bde0" /><stop offset="1" stopColor="#1c8fc0" /></linearGradient>
        <linearGradient id={side} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2e4a66" /><stop offset="1" stopColor="#162838" /></linearGradient>
        <linearGradient id={shine} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".85" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
      </defs>
      {!rings && <path d="M615 687 505 797 615 907Q565 797 615 687Z" fill={`url(#${side})`} />}
      {!rings && <path d="M1317 687 1427 797 1317 907Q1367 797 1317 687Z" fill={`url(#${side})`} />}
      <g fill="none">
        <circle cx="785" cy="810" r="118.5" stroke={`url(#${ring})`} strokeWidth="67" />
        <circle cx="1145" cy="810" r="118.5" stroke={`url(#${ring})`} strokeWidth="67" />
        <circle cx="785" cy="810" r="150" stroke="#fff" strokeOpacity=".55" strokeWidth="3" />
        <circle cx="1145" cy="810" r="150" stroke="#fff" strokeOpacity=".55" strokeWidth="3" />
        <circle cx="785" cy="810" r="87" stroke="#0b4a66" strokeOpacity=".18" strokeWidth="3" />
        <circle cx="1145" cy="810" r="87" stroke="#0b4a66" strokeOpacity=".18" strokeWidth="3" />
        <path d="M680 760A118.5 118.5 0 0 1 790 691.5" stroke={`url(#${shine})`} strokeWidth="20" strokeLinecap="round" />
        <path d="M1040 760A118.5 118.5 0 0 1 1150 691.5" stroke={`url(#${shine})`} strokeWidth="20" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function Brand({ compact, sub = true, className }: { compact?: boolean; sub?: boolean; className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", compact && "w-full justify-center", className)}>
      <LogoMark rings={compact} className={cn("shrink-0", compact ? "logo-glow h-[19px] w-10 overflow-visible" : "h-7 w-[77px]")} />
      {!compact && (
        <span className="flex flex-col leading-tight whitespace-nowrap">
          <b className="text-[13.5px] font-bold tracking-[.04em]">SAIF-OPTICS</b>
          {sub && <small className="text-[10px] tracking-[.08em] text-muted-foreground">КАССА ОПТИКИ</small>}
        </span>
      )}
    </span>
  );
}
