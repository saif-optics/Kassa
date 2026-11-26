// Правила движения: тайминги пилюли навигации — 0,36 с (передний край) и 0,55 с (задний),
// «посадка» карточек — 0,8 с с шагом 0,06 с между соседними.
import { useEffect, useState } from "react";

export { useReducedMotion } from "motion/react";

export const DUR = { fast: 0.2, base: 0.36, slow: 0.55, land: 0.8 } as const;
export const EASE = { out: [0.215, 0.61, 0.355, 1], inOut: [0.645, 0.045, 0.355, 1], expo: [0.16, 1, 0.3, 1] } as const;
export const STAGGER = 0.06;

// появление с посадкой: i — номер в ряду (потолок 8 — задержка не больше 0,48 с), delay — общая задержка
export const land = (i = 0, delay = 0) => ({
  initial: { opacity: 0, y: 26, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: DUR.land, ease: EASE.expo, delay: delay + Math.min(i, 8) * STAGGER },
});

export const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: DUR.fast } };

// число плавно «набегает» до value; без движения при reduced-motion и в скрытой вкладке
export function useCountUp(value: number, ms = 600) {
  const [v, setV] = useState(value);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || document.hidden) { setV(value); return; }
    const from = v, t0 = performance.now();
    let id = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - p, 3);
      setV(from + (value - from) * e);
      if (p < 1) id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, ms]);
  return v;
}
