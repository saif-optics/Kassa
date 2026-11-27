// Свёртка длинных списков: первые 8 строк и кнопка «Ещё N ▾» / «Свернуть ▴». Высота раскрывается плавно,
// состояние запоминается в localStorage по ключу списка. В блоках фиксированной высоты (пазлы Аналитики) не применять.
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { animate } from "motion/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { DUR, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const LS = "kassa-web.fold.";
const read = (id: string) => { try { return localStorage.getItem(LS + id) === "1"; } catch { return false; } };
const write = (id: string, v: boolean) => { try { if (v) localStorage.setItem(LS + id, "1"); else localStorage.removeItem(LS + id); } catch { /* нет хранилища */ } };

type Props<T> = { id: string; rows: T[]; limit?: number; children: (shown: T[]) => ReactNode; className?: string; btnClass?: string };

/** children получает видимые строки; id — ключ списка для localStorage */
export function Fold<T>({ id, rows, limit = 8, children, className, btnClass }: Props<T>) {
  const [open, setOpen] = useState(() => read(id));
  const wrap = useRef<HTMLDivElement>(null), from = useRef<number | null>(null);
  const extra = rows.length - limit, folded = extra > 0, shown = open || !folded ? rows : rows.slice(0, limit);

  const toggle = () => {
    const n = !open;
    from.current = wrap.current ? wrap.current.offsetHeight : null;
    write(id, n); setOpen(n);
  };
  // после перерисовки меряем новую высоту и плавно ведём от старой к ней
  useLayoutEffect(() => {
    const el = wrap.current, h0 = from.current;
    from.current = null;
    if (!el || h0 == null || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const h1 = el.offsetHeight;
    if (Math.abs(h1 - h0) < 2) return;
    el.style.overflow = "hidden";
    const a = animate(el, { height: [h0, h1] }, { duration: DUR.base, ease: EASE.out });
    a.finished.then(() => { el.style.height = ""; el.style.overflow = ""; }, () => { el.style.height = ""; el.style.overflow = ""; });
    return () => { a.stop(); el.style.height = ""; el.style.overflow = ""; };
  }, [open]);

  return (
    <div className={className}>
      <div ref={wrap}>{children(shown)}</div>
      {folded && (
        <button type="button" onClick={toggle} aria-expanded={open}
          className={cn("mt-1 flex h-9 w-full items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold text-primary outline-none transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/40", btnClass)}>
          {open ? <>Свернуть<ChevronUp className="size-4" /></> : <>Ещё {extra}<ChevronDown className="size-4" /></>}
        </button>
      )}
    </div>
  );
}
