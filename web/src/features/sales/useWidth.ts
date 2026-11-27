// Ширина блока (для графика с прокруткой внутри плитки).
import { useEffect, useRef, useState } from "react";

export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null), [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    setW(el.clientWidth);
    const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/** ширина и высота блока: график занимает всё место блока */
export function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null), [s, setS] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const f = () => setS({ w: el.clientWidth, h: el.clientHeight });
    f();
    const ro = new ResizeObserver(f); ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, s] as const;
}
