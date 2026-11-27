// Общие типы и помощники вкладок «пазла» Аналитики.
import type { Card, Flt } from "./base";
import type { Ctx } from "./cost";
import type { AnalyticsModel, Widget } from "./logic";

export interface TabIn {
  c: Ctx; F: Flt; m: AnalyticsModel; on: (id: number) => boolean;
  card: (id: number) => Card | undefined; wid: (id: number) => Widget | undefined;
  pgCat: string; setPgCat: (c: string) => void;
}
/** виджет нужного вида по номеру показателя */
export function wOf<K extends Widget["kind"]>(T: TabIn, id: number, kind: K): Extract<Widget, { kind: K }> | undefined {
  const w = T.wid(id);
  return w && w.kind === kind ? (w as Extract<Widget, { kind: K }>) : undefined;
}
/** число из готовой строки карточки («283 000 000 сум» → 283000000) */
export const digits = (s: string) => { const t = s.replace(/[^\d]/g, ""); return t ? +t : 0; };

/** цвета столбиков: обычный, лучший, пустой/воскресенье, «идёт» (штриховка) */
export const BAR = "var(--piece-blue)";
export const BAR_BEST = "color-mix(in srgb, var(--piece-blue) 55%, white)";
export const BAR_OFF = "color-mix(in srgb, var(--foreground) 16%, transparent)";
export const BAR_LIVE = "repeating-linear-gradient(45deg, var(--piece-blue) 0 6px, color-mix(in srgb, var(--piece-blue) 78%, black) 6px 12px)";
