// Переходы между разделами: go(раздел, параметры) пишет адрес вида #sales?point=Премиум&day=2026-11-27,
// useHashParams() читает параметры в нужном разделе. Параметры живут только в адресе — раздел сам решает, что с ними делать.
import { useEffect, useState } from "react";

export type Dest = { tab: string; params?: Record<string, string | number | null | undefined> };

/** адрес раздела с параметрами (пустые значения пропускаем) */
export function hashOf(tab: string, params?: Dest["params"]): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params || {})) if (v != null && v !== "") q.set(k, String(v));
  const s = q.toString();
  return s ? `${tab}?${s}` : tab;
}

/** перейти в раздел (с параметрами); наверх страницы */
export function go(tab: string, params?: Dest["params"]) {
  location.hash = hashOf(tab, params);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/** раздел из адреса без параметров */
export const hashTab = () => location.hash.replace("#", "").split("?")[0];
const readParams = () => new URLSearchParams(location.hash.includes("?") ? location.hash.slice(location.hash.indexOf("?") + 1) : "");

/** параметры адреса; обновляются при каждой смене адреса */
export function useHashParams(): URLSearchParams {
  const [p, setP] = useState(readParams);
  useEffect(() => {
    const f = () => setP(readParams());
    f(); window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  return p;
}

/** убрать параметры из адреса, оставив раздел (после того как раздел их применил) */
export function clearHashParams() {
  const t = hashTab();
  if (location.hash.includes("?")) history.replaceState(null, "", `${location.pathname}${location.search}#${t}`);
}

/** свойства «нажимаемого» блока: курсор, клавиатура (Enter/пробел), подпись для чтения с экрана.
 *  Нажатия на вложенные кнопки, ссылки и поля блок не перехватывает. */
export function goProps(dest: Dest | (() => void), label: string) {
  const run = () => (typeof dest === "function" ? dest() : go(dest.tab, dest.params));
  const inner = (e: React.SyntheticEvent) => {
    if (!(e.currentTarget as HTMLElement).contains(e.target as Node)) return true; // событие из портала (лист, окно)
    const hit = (e.target as HTMLElement).closest?.("button, a, input, select, textarea, label");
    return !!hit && hit !== e.currentTarget && (e.currentTarget as HTMLElement).contains(hit);
  };
  return {
    role: "link" as const, tabIndex: 0, "aria-label": `Открыть ${label}`,
    onClick: (e: React.MouseEvent) => { if (inner(e)) return; e.stopPropagation(); run(); },
    onKeyDown: (e: React.KeyboardEvent) => { if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) { e.preventDefault(); e.stopPropagation(); run(); } },
  };
}
