// Состояние «Отметок»: вкладка (запоминается), день, точка, период сводки. Живёт в странице — шапка и вкладки читают одно и то же.
import { useState } from "react";
import { todayStr } from "./logic";

export type AttTabKey = "log" | "sum" | "emp" | "pts" | "memo";
export type Per = "week" | "month";
export const ATT_TABS: { key: AttTabKey; label: string }[] = [
  { key: "log", label: "Журнал дня" }, { key: "sum", label: "Сводка" }, { key: "emp", label: "Сотрудники" }, { key: "pts", label: "Точки и киоски" }, { key: "memo", label: "Памятка" },
];
const LS = "kassa-web.att.tab";
const read = (): AttTabKey => { try { const v = localStorage.getItem(LS); return ATT_TABS.some((t) => t.key === v) ? (v as AttTabKey) : "log"; } catch { return "log"; } };

export type AttNav = { tab: AttTabKey; setTab: (t: AttTabKey) => void; day: string; setDay: (d: string) => void; pt: string; setPt: (p: string) => void; per: Per; setPer: (p: Per) => void };

export function useAttNav(): AttNav {
  const [tab, setT] = useState<AttTabKey>(read), [day, setDay] = useState(todayStr), [pt, setPt] = useState(""), [per, setPer] = useState<Per>("week");
  const setTab = (t: AttTabKey) => { setT(t); try { localStorage.setItem(LS, t); } catch { /* нет хранилища */ } };
  return { tab, setTab, day, setDay, pt, setPt, per, setPer };
}
