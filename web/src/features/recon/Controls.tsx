// Фильтры сверки: период, свои даты, точка, «только расхождения». Выбор запоминается отдельно для каждой сверки.
import { useState } from "react";
import { FilterBar } from "@/components/FilterSheet";
import { Segments } from "@/components/Segments";
import { Switch } from "@/components/ui/switch";
import { Field, FIELD } from "../report/ui";
import { PER, periodOf } from "./logic";

const get = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem("kassa-web.recon." + k); return v == null ? d : (JSON.parse(v) as T); } catch { return d; } };
const set = (k: string, v: unknown) => { try { localStorage.setItem("kassa-web.recon." + k, JSON.stringify(v)); } catch { /* нет хранилища */ } };

export function useFilters(key: string) {
  const [per, setPerS] = useState(() => get(key + ".per", "7d")), [pt, setPtS] = useState(() => get(key + ".pt", "all")), [only, setOnlyS] = useState(() => get(key + ".only", false));
  const [cf, setCf] = useState(""), [ct, setCt] = useState("");
  const [f, t] = periodOf(per, cf, ct);
  return { per, pt, only, f, t, cf: f, ct: t,
    setPer: (v: string) => { setPerS(v); set(key + ".per", v); }, setPt: (v: string) => { setPtS(v); set(key + ".pt", v); }, setOnly: (v: boolean) => { setOnlyS(v); set(key + ".only", v); }, setFrom: setCf, setTo: setCt };
}
export type Filters = ReturnType<typeof useFilters>;

export function Controls({ F, points, children }: { F: Filters; points: string[]; children?: React.ReactNode }) {
  const perName = PER.find((x) => x[0] === F.per)?.[1] ?? "", cnt = (F.per !== "7d" ? 1 : 0) + (F.pt !== "all" ? 1 : 0) + (F.only ? 1 : 0);
  return (
    <FilterBar count={cnt} summary={`${perName} · ${F.pt === "all" ? "все точки" : F.pt}${F.only ? " · только расхождения" : ""}`}>
      <Segments aria-label="Период" items={PER.map(([key, label]) => ({ key, label }))} value={F.per} onChange={(v) => { if (v === "custom") { F.setFrom(F.f); F.setTo(F.t); } F.setPer(v); }} />
      {F.per === "custom" && <div className="flex gap-2"><Field label="С"><input type="date" className={FIELD} value={F.f} max={F.t} onChange={(e) => F.setFrom(e.target.value)} /></Field><Field label="По"><input type="date" className={FIELD} value={F.t} min={F.f} onChange={(e) => F.setTo(e.target.value)} /></Field></div>}
      <Segments aria-label="Точка" items={[{ key: "all", label: "Все точки" }, ...points.map((p) => ({ key: p, label: p }))]} value={F.pt} onChange={F.setPt} />
      <label className="flex items-center gap-2 text-[13.5px]"><Switch checked={F.only} onCheckedChange={F.setOnly} aria-label="Только расхождения" />Только расхождения</label>
      {children}
    </FilterBar>
  );
}
