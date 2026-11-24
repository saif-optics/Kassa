// Общие мелочи «Склада»: порядок колонок для карточек на телефоне.
import type { RowColumn } from "@/components/RowCards";

/** на телефоне справа в шапке карточки стоит первая правая колонка — главную цифру (key = first) ставим первой */
export function phoneFirst<T>(cols: RowColumn<T>[], first: string, phone: boolean): RowColumn<T>[] {
  if (!phone) return cols;
  const m = cols.filter((c) => c.main), rest = cols.filter((c) => !c.main);
  return [...m, ...rest.filter((c) => c.key === first), ...rest.filter((c) => c.key !== first)];
}
