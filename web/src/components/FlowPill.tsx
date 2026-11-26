// Подсветка активного пункта: перетекает между кнопками. Контейнер должен быть position: relative,
// у кнопок — атрибут data-key. Передний край идёт быстро (DUR.base), задний догоняет (DUR.slow).
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { cn } from "@/lib/utils";
import { DUR, EASE, useReducedMotion } from "@/lib/motion";

const bez = (e: readonly number[]) => `cubic-bezier(${e.join(",")})`;

export function FlowPill({ containerRef, activeKey, axis, className }: { containerRef: RefObject<HTMLElement | null>; activeKey: string; axis: "y" | "x"; className?: string }) {
  const [pos, setPos] = useState<{ a: number; b: number } | null>(null); // a — начало, b — отступ от конца
  const [anim, setAnim] = useState(false);
  const prev = useRef<number | null>(null), dir = useRef(1), first = useRef(true);
  const reduce = useReducedMotion();

  const measure = () => {
    const c = containerRef.current, el = c?.querySelector<HTMLElement>(`[data-key="${CSS.escape(activeKey)}"]`);
    if (!c || !el) return null;
    const cr = c.getBoundingClientRect(), r = el.getBoundingClientRect();
    return axis === "y" ? { a: r.top - cr.top, b: cr.bottom - r.bottom } : { a: r.left - cr.left, b: cr.right - r.right };
  };
  useLayoutEffect(() => {
    const p = measure();
    if (!p) return;
    if (prev.current != null) dir.current = p.a >= prev.current ? 1 : -1;
    prev.current = p.a;
    setAnim(!first.current && !reduce);
    first.current = false;
    setPos(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, axis, reduce]);
  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const ro = new ResizeObserver(() => { const p = measure(); if (p) { setAnim(false); prev.current = p.a; setPos(p); } });
    ro.observe(c);
    // число кнопок изменилось — пересчитать положение
    const mo = new MutationObserver(() => { const p = measure(); if (p) { setAnim(false); prev.current = p.a; setPos(p); } });
    mo.observe(c, { childList: true });
    return () => { ro.disconnect(); mo.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, axis]);

  if (!pos) return null;
  const [s, e] = axis === "y" ? ["top", "bottom"] : ["left", "right"];
  const fwd = dir.current > 0; // вперёд: передний край — конец (bottom/right)
  const fast = `${DUR.base}s ${bez(EASE.out)}`, slow = `${DUR.slow}s ${bez(EASE.inOut)}`;
  const transition = anim ? (fwd ? `${s} ${slow}, ${e} ${fast}` : `${s} ${fast}, ${e} ${slow}`) : "none";
  const style = axis === "y" ? { top: pos.a, bottom: pos.b, left: 0, right: 0 } : { left: pos.a, right: pos.b, top: 0, bottom: 0 };
  return <span aria-hidden="true" className={cn("pointer-events-none absolute z-0 rounded-full bg-primary/12 ring-1 ring-primary/18", className)} style={{ ...style, transition }} />;
}
