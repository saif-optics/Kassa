// Тень по краям прокручиваемого ряда: показывает, что содержимое можно листать.
import { useEffect, useState, type RefObject } from "react";
import { cn } from "@/lib/utils";

/** есть ли ещё содержимое слева/справа от видимой области контейнера */
export function useScrollShade(ref: RefObject<HTMLElement | null>) {
  const [s, setS] = useState({ l: false, r: false });
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const upd = () => {
      const l = c.scrollLeft > 2, r = c.scrollLeft + c.clientWidth < c.scrollWidth - 2;
      setS((p) => (p.l === l && p.r === r ? p : { l, r }));
    };
    upd();
    c.addEventListener("scroll", upd, { passive: true });
    const ro = new ResizeObserver(upd), mo = new MutationObserver(upd);
    ro.observe(c); mo.observe(c, { childList: true, subtree: true });
    return () => { c.removeEventListener("scroll", upd); ro.disconnect(); mo.disconnect(); };
  }, [ref]);
  return s;
}

/** два градиента поверх краёв; родитель — relative */
export function Shades({ l, r, className }: { l: boolean; r: boolean; className?: string }) {
  const base = "pointer-events-none absolute inset-y-0 z-20 w-6 transition-opacity duration-200 from-background/90 to-transparent";
  return (
    <>
      <span aria-hidden="true" className={cn(base, "left-0 bg-gradient-to-r", l ? "opacity-100" : "opacity-0", className)} />
      <span aria-hidden="true" className={cn(base, "right-0 bg-gradient-to-l", r ? "opacity-100" : "opacity-0", className)} />
    </>
  );
}

/** есть ли ещё содержимое сверху/снизу от видимой области контейнера */
export function useScrollShadeY(ref: RefObject<HTMLElement | null>) {
  const [s, setS] = useState({ t: false, b: false });
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const upd = () => {
      const t = c.scrollTop > 2, b = c.scrollTop + c.clientHeight < c.scrollHeight - 2;
      setS((p) => (p.t === t && p.b === b ? p : { t, b }));
    };
    upd();
    c.addEventListener("scroll", upd, { passive: true });
    const ro = new ResizeObserver(upd), mo = new MutationObserver(upd);
    ro.observe(c); mo.observe(c, { childList: true, subtree: true });
    return () => { c.removeEventListener("scroll", upd); ro.disconnect(); mo.disconnect(); };
  }, [ref]);
  return s;
}

/** четыре тени по краям прокручиваемого блока; цвет — фон блока (--bg у «куска» пазла), родитель — relative */
export function EdgeShades({ l, r, t, b }: { l?: boolean; r?: boolean; t?: boolean; b?: boolean }) {
  const base = "pointer-events-none absolute z-20 transition-opacity duration-200 from-[var(--bg)] to-transparent";
  return (
    <>
      <span aria-hidden="true" className={cn(base, "inset-y-0 left-0 w-6 bg-gradient-to-r", l ? "opacity-100" : "opacity-0")} />
      <span aria-hidden="true" className={cn(base, "inset-y-0 right-0 w-6 bg-gradient-to-l", r ? "opacity-100" : "opacity-0")} />
      <span aria-hidden="true" className={cn(base, "inset-x-0 top-0 h-6 bg-gradient-to-b", t ? "opacity-100" : "opacity-0")} />
      <span aria-hidden="true" className={cn(base, "inset-x-0 bottom-0 h-6 bg-gradient-to-t", b ? "opacity-100" : "opacity-0")} />
    </>
  );
}
