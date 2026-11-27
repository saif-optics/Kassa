// Раздел «Аналитика»: полоса главных цифр, шесть вкладок-пазлов, фильтр периода; показатели включаются в боковой панели.
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { FileSpreadsheet, Info, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Segments } from "@/components/Segments";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import type { Data } from "@/lib/types";
import { useMutations } from "@/lib/useData";
import { useAccess } from "@/lib/access";
import { fade } from "@/lib/motion";
import { prevList } from "./base";
import { makeCtx } from "./cost";
import { buildAnalytics } from "./logic";
import { ALL_IDS, METRICS, MHINT } from "./texts";
import { analyticsSheets, fname } from "./exports";
import { saveXlsx } from "./xl";
import { useFlt } from "./filter";
import { AnHead } from "./AnFilter";
import { Empty } from "./parts";
import { HintCtx, RowHCtx } from "./Puzzle";
import { Strip } from "./Strip";
import { TabRevenue } from "./TabRevenue";
import { TabGoods } from "./TabGoods";
import { TabCash, TabChecks, TabPoints, TabProfit } from "./TabMore";
import type { TabIn } from "./tabs";
import { dShort, pl } from "./util";

const OFFKEY = "an.hints";
const SELKEY = "an.off";
const TABKEY = "an.tab";
// выбор показателей не-админа хранится только в браузере (настройки в базе пишет админ)
const readSel = (): number[] | null => { try { const v = JSON.parse(localStorage.getItem(SELKEY) || "null"); return Array.isArray(v) ? v.filter((x) => typeof x === "number") : null; } catch { return null; } };
const readHints = () => { try { return localStorage.getItem(OFFKEY) !== "0"; } catch { return true; } };

const TABS = [["rev", "Выручка и темп"], ["pts", "Точки"], ["chk", "Чеки"], ["cash", "Касса и оплаты"], ["goods", "Товары"], ["profit", "Прибыль и скидки"]] as const;
type TabKey = (typeof TABS)[number][0];
const readTab = (): TabKey => { try { const v = localStorage.getItem(TABKEY); return TABS.some(([k]) => k === v) ? (v as TabKey) : "rev"; } catch { return "rev"; } };

export function AnalyticsPage({ d }: { d: Data }) {
  const c = useMemo(() => makeCtx(d), [d]);
  const mu = useMutations();
  const [F, setF] = useFlt();
  const [pgCat, setPgCat] = useState("Оправы");
  const [hintsOn, setHints] = useState(readHints);
  const [pickOpen, setPickOpen] = useState(false);
  const [tab, setTabS] = useState<TabKey>(readTab);
  const adm = useAccess().isAdmin;
  const [loc, setLoc] = useState<number[] | null>(null), [own, setOwn] = useState<number[] | null>(readSel);
  const off = loc ?? (adm ? c.analyticsOff : own) ?? [];
  const sel = useMemo(() => new Set(ALL_IDS.filter((i) => !off.includes(i))), [off]);
  const m = useMemo(() => buildAnalytics(c, F, (id) => sel.has(id), pgCat), [c, F, sel, pgCat]);

  // высота ряда пазла от высоты окна: четыре ряда помещаются на экран (150–200 px); при прокрутке не пересчитываем
  const bodyRef = useRef<HTMLDivElement>(null), rootRef = useRef<HTMLDivElement>(null), [rh, setRh] = useState<number | null>(null);
  useEffect(() => {
    const calc = () => {
      const el = bodyRef.current; if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      setRh(Math.round(Math.max(150, Math.min(184, (window.innerHeight - top - 40 - 3 * 14) / 4))));
    };
    calc();
    window.addEventListener("resize", calc);
    const ro = new ResizeObserver(calc); if (rootRef.current) ro.observe(rootRef.current);
    return () => { window.removeEventListener("resize", calc); ro.disconnect(); };
  }, [tab, m.empty, sel.size]);
  const setTab = (k: string) => { setTabS(k as TabKey); try { localStorage.setItem(TABKEY, k); } catch { /* нет хранилища */ } };
  const saveSel = async (next: Set<number>) => {
    const o = ALL_IDS.filter((i) => !next.has(i));
    if (!adm) { setOwn(o); try { localStorage.setItem(SELKEY, JSON.stringify(o)); } catch { /* нет хранилища */ } return; }
    setLoc(o);
    try { await mu.putDoc("settings", "analytics3", { off: o }); } catch { toast.error("Не удалось сохранить выбор показателей"); } finally { setLoc(null); }
  };
  const toggleHints = (v: boolean) => { setHints(v); try { localStorage.setItem(OFFKEY, v ? "1" : "0"); } catch { /* нет хранилища */ } };
  const xlsx = async () => {
    const sh = analyticsSheets(c, F); if (!sh) { toast.error("Нет данных за выбранный период."); return; }
    try { await saveXlsx(sh, fname(c, F, "analitika", "xlsx")); toast.success("Файл скачан"); } catch (e) { toast.error("Не удалось выгрузить: " + String(e)); }
  };

  const pv = prevList(c, F);
  const sub = m.empty ? undefined : `${dShort(m.r.from)}–${dShort(m.r.to)} · ${m.r.days} дн. · ` + (pv ? `к ${dShort(pv.from)}–${dShort(pv.to)}` : "без сравнения");
  const tip = (label: string, node: ReactNode) => <Tooltip><TooltipTrigger asChild>{node}</TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip>;
  const actions = (
    <>
      {tip("Показатели", <Button variant="secondary" size="icon-lg" className="size-10 rounded-full" aria-label="Показатели" onClick={() => setPickOpen(true)}><SlidersHorizontal /></Button>)}
      {tip(hintsOn ? "Пояснения включены" : "Пояснения выключены", <Button variant="secondary" size="icon-lg" className={"size-10 rounded-full " + (hintsOn ? "bg-primary/15 text-primary" : "")} aria-label="Пояснения" aria-pressed={hintsOn} onClick={() => toggleHints(!hintsOn)}><Info /></Button>)}
      {tip("Выгрузить Excel", <Button variant="secondary" size="icon-lg" className="size-10 rounded-full" aria-label="Выгрузить Excel" onClick={xlsx}><FileSpreadsheet /></Button>)}
    </>
  );

  const T: TabIn = { c, F, m, on: (id) => sel.has(id), card: (id) => m.cards.find((x) => x.id === id), wid: (id) => m.widgets.find((w) => w.ids.includes(id)), pgCat, setPgCat };

  const picker = (
    <Sheet open={pickOpen} onOpenChange={setPickOpen}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto p-5 sm:max-w-lg">
        <SheetTitle className="text-[17px] font-bold">Показатели</SheetTitle>
        <SheetDescription className="mb-4 text-[13px]">Включено {sel.size} из {ALL_IDS.length}. Выключенный показатель не рисуется; если во вкладке что-то выключено, блоки встают в обычную сетку без соединений.</SheetDescription>
        <div className="flex flex-col gap-5">
          {METRICS.map(([g, items]) => (
            <div key={g}>
              <div className="mb-2 text-[11px] font-semibold tracking-[.08em] text-muted-foreground uppercase">{g}</div>
              <div className="grid gap-y-2.5">
                {items.map(([id, nm]) => (
                  <label key={id} className="flex cursor-pointer items-start gap-3">
                    <Switch checked={sel.has(id)} onCheckedChange={(v) => { const s = new Set(sel); if (v) s.add(id); else s.delete(id); saveSel(s); }} aria-label={nm} className="mt-0.5" />
                    <span className="min-w-0 text-[13.5px] leading-snug">{nm}{MHINT[id] && <small className="block text-[12px] text-muted-foreground">{MHINT[id]}</small>}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-2 pb-2">
            <Button variant="secondary" onClick={() => saveSel(new Set(ALL_IDS))}>Включить все</Button>
            <Button variant="secondary" onClick={() => saveSel(new Set())}>Выключить все</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <HintCtx.Provider value={hintsOn}>
      <RowHCtx.Provider value={rh}>
      <div ref={rootRef} className="flex flex-col gap-3.5">
        <AnHead c={c} F={F} set={setF} sub={sub} actions={actions} />
        {picker}
        {m.empty ? <Empty>Для аналитики нужны продажи за выбранный период. Внесите их на вкладке «Продажи».</Empty>
          : !sel.size ? <Empty>Все показатели выключены. Включите нужные в «Показатели».</Empty>
          : (
            <>
              <Strip T={T} />
              <Segments aria-label="Вкладки аналитики" items={TABS.map(([key, label]) => ({ key, label }))} value={tab} onChange={setTab} />
              <motion.div ref={bodyRef} key={tab} {...fade}>
                {tab === "rev" ? <TabRevenue T={T} /> : tab === "goods" ? <TabGoods T={T} /> : tab === "pts" ? <TabPoints T={T} /> : tab === "chk" ? <TabChecks T={T} /> : tab === "cash" ? <TabCash T={T} /> : <TabProfit T={T} />}
              </motion.div>
            </>
          )}
      </div>
      </RowHCtx.Provider>
    </HintCtx.Provider>
  );
}
