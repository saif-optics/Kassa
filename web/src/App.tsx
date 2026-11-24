// Новая версия Кассы: вход, оболочка (панель разделов, верхняя строка, тема) и раздел «Платежи».
// Остальные разделы пока открываются на рабочем сайте — переносим по одному.
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { BarChart3, CalendarCheck, FileText, Glasses, ChevronsLeft, ChevronsRight, Home, LogOut, Moon, Package, Scale, ShoppingBag, Sun, Target, Wallet, type LucideIcon } from "lucide-react";
import { Toaster } from "sonner";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getSession, isDemo, onAuth, signOut } from "@/lib/source";
import { useData } from "@/lib/useData";
import { Login } from "@/components/Login";
import { PayPage } from "@/features/pay/PayPage";
import { KassaPage } from "@/features/kassa/KassaPage";
import { HomePage } from "@/features/home/HomePage";
import { PlanPage } from "@/features/plan/PlanPage";
import { SalesPage } from "@/features/sales/SalesPage";
import { AnalyticsPage } from "@/features/analytics/AnalyticsPage";
import { LensPage } from "@/features/lens/LensPage";
import { ReportPage } from "@/features/report/ReportPage";
import { ReconPage } from "@/features/recon/ReconPage";
import { StockPage } from "@/features/stock/StockPage";
import type { Data } from "@/lib/types";

const PAGES: Record<string, (p: { d: Data }) => React.ReactNode> = { home: HomePage, kassa: KassaPage, report: ReportPage, pay: PayPage, sales: SalesPage, recon: ReconPage, analytics: AnalyticsPage, plan: PlanPage, lens: LensPage, batch: StockPage };
// ширина страницы: true — «данные», на всю ширину; false — «сводка», не шире 1600px по центру
const WIDE: Record<string, boolean> = { home: false, pay: false, plan: false, kassa: false, sales: true, report: true, recon: true, analytics: true, lens: true, batch: true };

const qc = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } } });
const NAV: { id: string; label: string; icon: LucideIcon; ready?: boolean }[] = [
  { id: "home", label: "Главная", icon: Home, ready: true }, { id: "kassa", label: "Касса", icon: Wallet, ready: true }, { id: "report", label: "Отчёт р/с", icon: FileText, ready: true },
  { id: "pay", label: "Платежи", icon: CalendarCheck, ready: true }, { id: "sales", label: "Продажи", icon: ShoppingBag, ready: true }, { id: "recon", label: "Сверка", icon: Scale, ready: true },
  { id: "analytics", label: "Аналитика", icon: BarChart3, ready: true }, { id: "plan", label: "План", icon: Target, ready: true }, { id: "lens", label: "Линзы", icon: Glasses, ready: true }, { id: "batch", label: "Склад", icon: Package, ready: true },
];

function useTheme() {
  const sys = () => matchMedia("(prefers-color-scheme: dark)").matches;
  const [dark, setDark] = useState(() => { try { const v = localStorage.getItem("kassa-web.theme"); return v ? v === "dark" : sys(); } catch { return sys(); } });
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);
  return { dark, toggle: () => setDark((x) => { try { localStorage.setItem("kassa-web.theme", !x ? "dark" : "light"); } catch { /* нет хранилища */ } return !x; }) };
}
// сайдбар: свёрнут/развёрнут; без выбора пользователя на 1024–1279px свёрнут
function useSidebar() {
  const narrow = () => matchMedia("(max-width: 1279px)").matches;
  const [pref, setPref] = useState<string | null>(() => { try { return localStorage.getItem("kassa-web.sidebar"); } catch { return null; } });
  const [nar, setNar] = useState(narrow);
  useEffect(() => { const m = matchMedia("(max-width: 1279px)"), f = () => setNar(m.matches); m.addEventListener("change", f); return () => m.removeEventListener("change", f); }, []);
  const min = pref ? pref === "min" : nar;
  return { min, toggle: () => { const v = min ? "max" : "min"; setPref(v); try { localStorage.setItem("kassa-web.sidebar", v); } catch { /* нет хранилища */ } } };
}
function Clock() {
  const [n, setN] = useState(Date.now()); useEffect(() => { const id = setInterval(() => setN(Date.now()), 15000); return () => clearInterval(id); }, []);
  const d = new Date(n + 5 * 3600e3), W = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"], M = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  return <span className="glass hidden flex-col justify-center rounded-full px-4 py-1 leading-tight md:flex"><b className="num text-[13px]">{String(d.getUTCHours()).padStart(2, "0")}:{String(d.getUTCMinutes()).padStart(2, "0")}</b><small className="text-[10.5px] text-muted-foreground">{W[d.getUTCDay()]}, {d.getUTCDate()} {M[d.getUTCMonth()]}</small></span>;
}

// раздел — из адреса (#kassa, #pay); неготовые разделы открываются на рабочем сайте
const READY = NAV.filter((n) => n.ready).map((n) => n.id);
function useTab() {
  const get = () => { const h = location.hash.replace("#", ""); return READY.includes(h) ? h : "home"; };
  const [t, setT] = useState(get);
  useEffect(() => { const f = () => setT(get()); window.addEventListener("hashchange", f); return () => window.removeEventListener("hashchange", f); }, []);
  return [t, (x: string) => { location.hash = x; window.scrollTo({ top: 0, behavior: "smooth" }); }] as const;
}

// кнопка боковой панели: Tooltip всегда на месте (подсказка только в свёрнутом виде), чтобы фокус не терялся
function SideBtn({ min, label, icon: Icon, on, current, expanded, onClick }: { min: boolean; label: string; icon: LucideIcon; on?: boolean; current?: boolean; expanded?: boolean; onClick: () => void }) {
  return (
    <Tooltip><TooltipTrigger asChild>
      <button type="button" aria-label={label} aria-current={current ? "page" : undefined} aria-expanded={expanded} onClick={onClick}
        className={cn("flex h-11 w-full items-center gap-3 rounded-full px-3 text-left text-[14px] font-medium whitespace-nowrap transition outline-none focus-visible:ring-2 focus-visible:ring-primary/40", on ? "bg-popover text-primary shadow-md" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
        <Icon className="size-5 shrink-0" strokeWidth={1.8} /><span className={cn(min && "hidden")}>{label}</span>
      </button>
    </TooltipTrigger><TooltipContent side="right" hidden={!min}>{label}</TooltipContent></Tooltip>
  );
}

function Shell({ email }: { email: string }) {
  const { dark, toggle } = useTheme();
  const q = useData();
  const [tab, go] = useTab();
  const sb = useSidebar();
  return (
    <div className="min-h-dvh">
      {/* панель разделов: на телефоне — снизу */}
      <nav aria-label="Разделы" className="glass fixed inset-x-3 bottom-3 z-30 flex justify-around gap-1 overflow-x-auto rounded-[30px] p-2 lg:hidden">
        {NAV.map((n) => {
          const on = n.id === tab;
          return (
            <button key={n.id} type="button" aria-current={on ? "page" : undefined} aria-label={n.label} onClick={() => go(n.id)}>
              <span className={cn("grid size-11 shrink-0 place-items-center rounded-full transition", on ? "bg-popover text-primary shadow-md" : "text-muted-foreground hover:bg-muted hover:text-foreground")}><n.icon className="size-5" strokeWidth={1.8} /></span>
            </button>
          );
        })}
      </nav>
      {/* боковая панель на компьютере */}
      <aside aria-label="Разделы" className={cn("glass fixed inset-y-0 left-0 z-30 hidden flex-col overflow-x-hidden overflow-y-auto rounded-none border-y-0 border-l-0 py-4 transition-[width] duration-200 lg:flex", sb.min ? "w-16" : "w-64")}>
        <div className="mb-3 flex h-11 items-center gap-3 px-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-primary text-[11px] font-black text-white shadow-lg">SO</div>
          <b className={cn("text-[15px] whitespace-nowrap", sb.min && "hidden")}>Saif-Optics</b>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV.map((n) => <SideBtn key={n.id} min={sb.min} label={n.label} icon={n.icon} on={n.id === tab} current={n.id === tab} onClick={() => go(n.id)} />)}
        </nav>
        <div className="mt-3 flex flex-col gap-1 px-3">
          <SideBtn key="theme" min={sb.min} label={dark ? "Светлая тема" : "Тёмная тема"} icon={dark ? Sun : Moon} onClick={toggle} />
          <SideBtn key="fold" min={sb.min} label={sb.min ? "Развернуть панель" : "Свернуть панель"} icon={sb.min ? ChevronsRight : ChevronsLeft} expanded={!sb.min} onClick={sb.toggle} />
        </div>
      </aside>
      <div className={cn("transition-[padding] duration-200", sb.min ? "lg:pl-16" : "lg:pl-64")}>
      <div className={cn("mx-auto px-4 @container/main pt-5 pb-28 sm:px-6 lg:px-8 lg:pb-10 2xl:px-10", !WIDE[tab] && "max-w-[1600px]")}>
        <div className="mb-6 flex min-h-11 items-center gap-2.5">
          <span className="glass flex items-center gap-2 rounded-full px-4 py-2.5 text-[13.5px]"><b>Saif-Optics</b><span className="text-muted-foreground">›</span><span className="text-muted-foreground">{NAV.find((n) => n.id === tab)?.label}</span></span>
          <div className="ml-auto flex items-center gap-2">
            <Clock />
            <Button variant="secondary" size="icon-lg" className="glass rounded-full lg:hidden" onClick={toggle} aria-label="Сменить тему">{dark ? <Sun /> : <Moon />}</Button>
            <span className="glass hidden items-center gap-2 rounded-full py-1 pr-1 pl-4 text-[13px] sm:flex"><i className="size-2 rounded-full bg-plus" />{email}
              <Button variant="ghost" size="sm" className="rounded-full" onClick={() => { signOut(); qc.clear(); }}><LogOut />Выйти</Button></span>
          </div>
        </div>
        <AnimatePresence mode="wait">
          {q.isLoading ? (
            <motion.div key="load" exit={{ opacity: 0 }} className="grid gap-4"><Skeleton className="h-24 rounded-3xl" /><div className="grid gap-4 sm:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-3xl" />)}</div><Skeleton className="h-96 rounded-3xl" /></motion.div>
          ) : q.error ? (
            <motion.p key="err" className="glass rounded-3xl p-6 text-minus">Не удалось загрузить данные: {String((q.error as Error).message || q.error)}</motion.p>
          ) : q.data ? (
            <motion.div key={tab} initial={{ opacity: 0, y: 8, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(6px)" }} transition={{ duration: 0.35 }}>{(() => { const P = PAGES[tab] || KassaPage; return <P d={q.data} />; })()}</motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      </div>
      <Toaster theme={dark ? "dark" : "light"} position="bottom-right" richColors />
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => { getSession().then(setSession); return onAuth(setSession); }, []);
  return (
    <QueryClientProvider client={qc}>
      <TooltipProvider delayDuration={150}>
        {session === undefined ? null : session ? <Shell email={isDemo ? "демо-данные" : session.user.email || ""} /> : <Login />}
      </TooltipProvider>
    </QueryClientProvider>
  );
}
