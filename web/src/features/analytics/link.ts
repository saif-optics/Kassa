// Ссылки из Аналитики в другие разделы: период берётся из страницы (провайдер в AnalyticsPage), точка — из строки.
import { createContext, useContext } from "react";
import type { Dest } from "@/lib/go";

export interface Period { from: string; to: string; point?: string }
export const PeriodCtx = createContext<Period | null>(null);

/** адрес «Продажи» с периодом страницы (и точкой строки, если есть); null — период неизвестен, ссылки не рисуем */
export function useSalesDest(): ((point?: string) => Dest | null) {
  const p = useContext(PeriodCtx);
  return (point) => (p ? { tab: "sales", params: { from: p.from, to: p.to, point: point || p.point } } : null);
}
