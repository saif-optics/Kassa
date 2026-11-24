// Раздел «Отчёт р/с»: отчёт по расчётному счёту (+ Excel «Отчёт оптика») и фискальные модули.
import { useEffect, useRef, useState } from "react";
import { FileSpreadsheet, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/Card";
import { PageHead } from "@/components/PageHead";
import { Segments } from "@/components/Segments";
import { Button } from "@/components/ui/button";
import type { Data } from "@/lib/types";
import { useMutations } from "@/lib/useData";
import { DayReport } from "./DayReport";
import { FiscalView, type FmState } from "./FiscalView";
import { RsView } from "./RsView";
import { saveBook } from "./ui";
import { CAT_NAMES, RP_MF, catOf, fmCfg, fmDays, fmIsOn, parseRahmat, pl, rsByMonth, rsDays, todayTash, type FmDay } from "./logic";

const HEAD = {
  rs: ["Saif-Optics · расчётный счёт", "Отчёт по расчётному счёту", "Остаток, поступления и расходы со счёта — по дням и месяцам"],
  fm: ["Saif-Optics · фискальные модули", "Фискальные модули", "Гросс нал и безнал по кассам точек — за день и за всё время"],
} as const;
const ls = { get: (k: string, d: string) => { try { return localStorage.getItem("kassa-web.report." + k) ?? d; } catch { return d; } }, set: (k: string, v: string) => { try { localStorage.setItem("kassa-web.report." + k, v); } catch { /* нет хранилища */ } } };

export function ReportPage({ d }: { d: Data }) {
  const [view, setView] = useState<"rs" | "fm">(() => (ls.get("view", "rs") === "fm" ? "fm" : "rs"));
  const [fm, setFm] = useState<FmState>({ m: "", d: "", open: null, edit: null });
  const file = useRef<HTMLInputElement>(null), mu = useMutations(), T = todayTash();
  // переход из «Сверки → Фискальные модули ↔ Касса»: открыть нужный день и точку
  useEffect(() => {
    try { const v = sessionStorage.getItem("kassa-web.report.go"); if (!v) return; sessionStorage.removeItem("kassa-web.report.go"); const g = JSON.parse(v) as { d: string; p: string; edit: "day" | "mod" };
      setView("fm"); setFm({ m: g.d.slice(0, 7), d: g.d, open: g.p, edit: g.edit }); } catch { /* нет хранилища */ }
  }, []);
  const [e1, t, p] = HEAD[view];
  const patchFm = (x: Partial<FmState>) => setFm((f) => ({ ...f, ...x }));
  const pickView = (v: "rs" | "fm") => { setView(v); ls.set("view", v); };

  const addFm = () => {
    const P = d.points.filter((x) => fmIsOn(d, x)), days = fmDays(d);
    patchFm({ d: T, m: T.slice(0, 7), open: P.find((x) => !days[T]?.pts?.[x]) || P[0] || d.points[0], edit: null });
  };
  const importRahmat = async (f: File) => {
    try {
      const { acc, n, unknown } = await parseRahmat(await f.arrayBuffer(), f.name, fmCfg(d).mods);
      // модули, которые ещё не включены, не трогаем — раздел пока в подготовке
      const off = new Set<string>(), ds = Object.keys(acc).sort(); let saved = 0;
      for (const day of ds) {
        const pts: NonNullable<FmDay["pts"]> = {};
        Object.entries(acc[day]).forEach(([pt, v]) => { if (fmIsOn(d, pt)) { pts[pt] = v; saved += v.k; } else off.add(pt); });
        if (Object.keys(pts).length) { const cur = { date: day, pts: {}, ...(fmDays(d)[day] || {}) } as FmDay; cur.pts = { ...cur.pts, ...pts }; cur.updatedAt = Date.now(); await mu.putDoc("fiscal", day, cur); }
      }
      if (!n) { toast.error(unknown.length ? "Чеки есть, но модуль не привязан к точке: " + unknown.join(", ") : "В файле не нашлось чеков продаж"); return; }
      if (saved) toast.success(`Загружено ${saved} ${pl(saved, "чек", "чека", "чеков")}${off.size ? ` · выключенные модули пропущены: ${[...off].join(", ")}` : ""}`);
      else toast.error(`В файле ${n} ${pl(n, "чек", "чека", "чеков")} (${[...off].join(", ")}), но модули выключены — ничего не записано`);
      if (saved) patchFm({ d: ds[ds.length - 1], m: ds[ds.length - 1].slice(0, 7) });
    } catch (e) { toast.error("Не удалось прочитать файл: " + (e instanceof Error ? e.message : String(e))); }
  };
  const xlsx = async () => {
    try {
      const BM = rsByMonth(d), all = rsDays(d), cats = CAT_NAMES.filter((c) => BM.ms.some((m) => BM.rows[m].cat[c])), mn = (m: string) => RP_MF[+m.slice(5, 7) - 1];
      await saveBook("Отчёт по расчётному счёту", [
        ["По месяцам", [["Месяц", "Остаток на начало", "Поступило", "Списано", "Остаток на конец"], ...BM.ms.map((m) => { const r = BM.rows[m]; return [mn(m) + " " + m.slice(0, 4), r.start, Math.round(r.in), Math.round(r.out), r.end]; })]],
        ["Статьи", [["Статья", ...BM.ms.map(mn), "Итого"], ...cats.map((c) => [c, ...BM.ms.map((m) => Math.round(BM.rows[m].cat[c] || 0)), Math.round(BM.ms.reduce((s, m) => s + (BM.rows[m].cat[c] || 0), 0))])]],
        ["По дням", [["День", "Утром", "Поступило", "Списано", "Вечером"], ...all.map((x) => [x.d, x.s, x.in == null ? null : Math.round(x.in), Math.round(x.out), x.e])]],
        ["Расходы", [["День", "Расход", "Статья", "Сумма"], ...all.flatMap((x) => x.bank.map((b) => [x.d, b.n, catOf(b), +(b.a as number)]))]],
      ]);
      toast.success("Файл скачан");
    } catch (e) { toast.error("Не удалось выгрузить: " + String(e)); }
  };

  return (
    <div className="flex flex-col gap-3.5">
      <PageHead eyebrow={e1} title={t} sub={p}
        actions={view === "rs" ? <Button variant="secondary" size="lg" onClick={xlsx}><FileSpreadsheet />Выгрузить Excel</Button> : <>
          <Button variant="secondary" size="lg" onClick={() => file.current?.click()}><Upload />Загрузить отчёт Rahmat</Button>
          <Button size="lg" onClick={addFm}><Plus />Внести гросс за день</Button>
          <input ref={file} type="file" accept=".zip,.xlsx,.xls" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) importRahmat(f); }} /></>} />
      <Segments aria-label="Вид отчёта" items={[{ key: "rs", label: "Расчётный счёт" }, { key: "fm", label: "Фискальные модули" }]} value={view} onChange={(v) => pickView(v as "rs" | "fm")} />

      {view === "fm" ? <FiscalView d={d} F={fm} setF={patchFm} /> : <>
        <RsView d={d} />
        <Card i={7}title="Отчёт оптика" note="Excel по дням">
          <DayReport d={d} />
        </Card>
      </>}
    </div>
  );
}
