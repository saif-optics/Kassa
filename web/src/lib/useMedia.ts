// Подписка на media query; useIsPhone — экран уже 640px (карточки вместо таблиц, фильтры в листе).
import { useEffect, useState } from "react";

export function useMedia(query: string) {
  const [v, setV] = useState(() => typeof matchMedia === "function" && matchMedia(query).matches);
  useEffect(() => {
    const m = matchMedia(query), f = () => setV(m.matches);
    f();
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, [query]);
  return v;
}

export const useIsPhone = () => useMedia("(max-width: 639px)");
