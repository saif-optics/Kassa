// «Пазл» Аналитики: сетка непрозрачных блоков с уголками (L-формы) и перемычками между родственными блоками.
// Геометрия и соединения — в index.css (.pz*), здесь только разметка. Ширина — по контейнеру @main:
// от 1060 — 12 колонок и ряды фиксированной высоты, 640–1059 — 6 колонок без соединений, до 640 — 2 колонки.
import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EdgeShades, useScrollShade, useScrollShadeY } from "@/components/ScrollShade";
import { hintOf } from "./parts";

/** подсказки-значки в заголовках блоков: включаются переключателем «Пояснения» */
export const HintCtx = createContext(true);
/** высота ряда пазла на компьютере, px (считает страница по высоте окна); null — по умолчанию из CSS */
export const RowHCtx = createContext<number | null>(null);

export type Tone = "n" | "b" | "c" | "g";
/** вид соединения: a — рукав снизу уже, прижат влево; b — вправо; c — рукав снизу шире верхней части, влево */
export type Join = "a-top" | "a-sleeve" | "b-top" | "b-sleeve" | "c-top" | "c-sleeve";
export interface Bridge { dir: "v" | "h"; d: string; p?: string }

/** сетка вкладки: pf — на телефоне блоки идут потоком (высота по содержимому); auto — часть блоков выключена (авто-раскладка, без соединений); flow — обычный поток для вкладок без пазла; jd/jp — соединения на компьютере/телефоне */
export function Puzzle({ auto, flow, pf, jd = true, jp = true, className, children }: { auto?: boolean; flow?: boolean; pf?: boolean; jd?: boolean; jp?: boolean; className?: string; children: ReactNode }) {
  const on = !auto && !flow, rh = useContext(RowHCtx);
  return <div className={cn("pz", className)} style={rh ? ({ "--rh": rh + "px" } as CSSProperties) : undefined} data-auto={auto || flow ? "" : undefined} data-fp={flow ? "" : undefined} data-pf={pf ? "" : undefined} data-jd={on && jd ? "" : undefined} data-jp={on && jp ? "" : undefined}>{children}</div>;
}

export interface PieceProps {
  /** компьютер: колонка, ряд, ширина, высота (с нуля, в колонках и рядах) */
  d: [number, number, number, number];
  /** телефон: колонка, ряд, ширина, высота (ряд 40 px); без колонки и ряда — авто-размещение */
  p?: [number | undefined, number | undefined, number, number];
  /** компьютер уже 1500: колонка и ширина (если раскладка другая) */
  dn?: [number, number];
  /** планшет: колонок из 6 и минимальная высота */
  m?: [number, number];
  /** вкладки-потоки на телефоне: колонок из 2 и минимальная высота */
  f?: [number, number];
  tone?: Tone; join?: Join; bridge?: Bridge;
  label?: ReactNode; title?: string; note?: ReactNode; hint?: string; right?: ReactNode;
  /** пояснение сверх общего (подзаголовок блока) — показывается в подсказке значка i */
  info?: string;
  /** nh — на телефоне заметку справа не показывать (узкий блок) */
  nh?: boolean;
  /** значение внизу, подпись вверху */
  spread?: boolean;
  className?: string; children?: ReactNode;
}

export function Piece({ d, dn, p, m, f, tone = "n", join, bridge, label, title, note, hint, info, right, spread, nh, className, children }: PieceProps) {
  const hintsOn = useContext(HintCtx), [open, setOpen] = useState(false);
  const h = hintsOn ? [hintOf(hint || title || (typeof label === "string" ? label : "")), info].filter(Boolean).join("\n") : "";
  const st = {
    "--x": d[0], "--y": d[1], "--w": d[2], "--h": d[3], "--xn": dn?.[0], "--wn": dn?.[1],
    "--px": p?.[0] != null ? p[0] + 1 : undefined, "--py": p?.[1] != null ? p[1] + 1 : undefined, "--pw": p?.[2] ?? f?.[0], "--ph": p?.[3],
    "--mw": m?.[0], "--mh": m ? m[1] + "px" : undefined, "--pmh": f ? f[1] + "px" : undefined,
  } as CSSProperties;
  return (
    <section className={cn("pz-i", spread && "pz-t", className)} data-tone={tone === "n" ? undefined : tone} data-j={join} style={st}>
      <div className="pz-in">
        {(label || title || note || right) && (
          <div className="flex min-w-0 items-baseline justify-between gap-3">
            <div className="flex min-w-0 items-center gap-1.5">
              {label ? <span className="pz-lbl">{label}</span> : title ? <h3 className="pz-h line-clamp-2">{title}</h3> : null}
              {h && <button type="button" aria-label="Что это?" aria-expanded={open} title={h} onClick={() => setOpen((x) => !x)} className="grid size-5 shrink-0 place-items-center rounded-full text-muted-foreground opacity-70 outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-primary/50">{open ? <X className="size-3.5" /> : <Info className="size-3.5" />}</button>}
            </div>
            {right ?? (note ? <span className={cn("pz-s min-w-0 truncate text-right", nh && "@max-[1499px]/main:hidden")}>{note}</span> : null)}
          </div>
        )}
        {children}
        {open && h && <div className="absolute inset-0 z-30 overflow-auto bg-[var(--bg)] p-4 text-[13.5px] leading-snug @min-[640px]/main:p-6"><b className="mb-1.5 block text-[15px]">{title || hint || (typeof label === "string" ? label : "")}</b><span className="whitespace-pre-line">{h}</span><button type="button" onClick={() => setOpen(false)} className="mt-3 block text-[13px] font-semibold underline">Понятно</button></div>}
      </div>
      {bridge && <span aria-hidden="true" className={cn("pz-br", bridge.dir === "v" ? "pz-brv" : "pz-brh")} style={{ "--bd": bridge.d, "--bp": bridge.p ?? bridge.d } as CSSProperties}><i /><i /><i /><i /></span>}
    </section>
  );
}

/** прокручиваемое тело блока фиксированной высоты: по краям — тени, раскладка не едет при любом числе строк */
export function Scroll({ x, xy, className, children }: { x?: boolean; xy?: boolean; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null), sx = useScrollShade(ref), sy = useScrollShadeY(ref);
  return (
    <div className={cn("relative min-h-0 flex-1", className)}>
      <div ref={ref} className={cn("pz-body h-full min-h-0", x ? "overflow-x-auto overflow-y-hidden" : xy ? "pz-ys overflow-auto" : "pz-ys overflow-y-auto overflow-x-hidden")}>{children}</div>
      <EdgeShades l={(x || xy) && sx.l} r={(x || xy) && sx.r} t={!x && sy.t} b={!x && sy.b} />
    </div>
  );
}

/** полоска доли */
export function Bar({ v, color = "var(--piece-blue)", h = 7, className }: { v: number; color?: string; h?: number; className?: string }) {
  return <div className={cn("overflow-hidden rounded-full bg-muted", className)} style={{ height: h }}><i className="block h-full rounded-full" style={{ width: Math.max(0, Math.min(1, v)) * 100 + "%", background: color }} /></div>;
}

/** чип роста/значения: «▲ 9%» */
export function Chip({ children, tone = "plain", title }: { children: ReactNode; tone?: "plain" | "up" | "down" | "warn" | "bad"; title?: string }) {
  const c = { plain: "bg-white/20 text-white", up: "bg-plus-soft text-plus", down: "bg-minus-soft text-minus", warn: "bg-warn-soft text-warn", bad: "bg-minus-soft text-minus" }[tone];
  return <span title={title} className={cn("num inline-flex h-[24px] shrink-0 items-center rounded-full px-2.5 text-[12px] font-semibold whitespace-nowrap @min-[640px]/main:h-[26px] @min-[640px]/main:px-[11px] @min-[640px]/main:text-[13px]", c)}>{children}</span>;
}

/** колонки по горизонтали: помещаются только целые (не уже min px), остальные — прокруткой с «примагничиванием» */
export function FitCols({ count, min, gap, wrap, className, children }: { count: number; min: number; gap: number; wrap?: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null), [n, setN] = useState(Math.max(1, count));
  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const upd = () => setN(Math.max(1, Math.min(count, Math.floor((el.clientWidth + gap) / (min + gap)))));
    upd();
    const ro = new ResizeObserver(upd); ro.observe(el);
    return () => ro.disconnect();
  }, [count, min, gap]);
  return (
    <Scroll x className={wrap}>
      <div ref={ref} className={cn("grid h-full grid-flow-col snap-x snap-mandatory", className)} style={{ gap, gridAutoColumns: `calc((100% - ${(n - 1) * gap}px) / ${n})` }}>{children}</div>
    </Scroll>
  );
}
