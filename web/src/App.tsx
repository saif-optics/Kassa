// Новая версия Кассы: вход, оболочка (панель разделов, верхняя строка, тема) и раздел «Платежи».
// Остальные разделы пока открываются на рабочем сайте — переносим по одному.
import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { ChevronsLeft, ChevronsRight, LogOut, MoreHorizontal, Moon, Sun, type LucideIcon } from "lucide-react";
import { Toaster } from "sonner";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Brand } from "@/components/Logo";
import { FlowPill } from "@/components/FlowPill";
import { DUR, fade } from "@/lib/motion";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { getSession, isDemo, onAuth, signOut } from "@/lib/source";
import { AccessProvider, canTab, loadAccess, ROLE_LABEL, useAccess } from "@/lib/access";
import { TasksPage } from "@/features/tasks/TasksPage";
import { UsersPage } from "@/features/users/UsersPage";
import { useData } from "@/lib/useData";
import { Login } from "@/components/Login";
import { useIsPhone } from "@/lib/useMedia";
import { PayPage } from "@/features/pay/PayPage";
import { KassaPage } from "@/features/kassa/KassaPage";
import { HomePage } from "@/features/home/HomePage";
import { PlanPage } from "@/features/plan/PlanPage";
import { SalesPage } from "@/features/sales/SalesPage";
import { AnalyticsPage } from "@/features/analytics/AnalyticsPage";
import { LensPage } from "@/features/lens/LensPage";
import { ReportPage } from "@/features/report/ReportPage";
import { ReconPage } from "@/features/recon/ReconPage";
import { KitDemo } from "@/features/home/KitDemo";
import { StockPage } from "@/features/stock/StockPage";
import type { Data } from "@/lib/types";

// витрина общих компонентов — только в демо-режиме: ?demo#kit
const KIT = () => isDemo && location.hash === "#kit";
const PAGES: Record<string, (p: { d: Data }) => React.ReactNode> = { home: HomePage, kassa: KassaPage, report: ReportPage, pay: PayPage, sales: SalesPage, recon: ReconPage, analytics: AnalyticsPage, plan: PlanPage, lens: LensPage, batch: StockPage, tasks: TasksPage, users: UsersPage };
// ширина страницы: true — «данные», не шире 2000px; false — «сводка», не шире 1600px; всё по центру
const WIDE: Record<string, boolean> = { home: false, pay: false, plan: false, kassa: false, tasks: false, users: false, sales: true, report: true, recon: true, analytics: true, lens: true, batch: true };

const qc = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } } });

// нижнее меню телефона: первые четыре раздела, остальные — в «Ещё» (если разделов не больше пяти — все в панели)

function useTheme() {
  const sys = () => matchMedia("(prefers-color-scheme: dark)").matches;
  const [dark, setDark] = useState(() => { try { const v = localStorage.getItem("kassa-web.theme"); return v ? v === "dark" : sys(); } catch { return sys(); } });
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);
  return { dark, toggle: () => setDark((x) => { try { localStorage.setItem("kassa-web.theme", !x ? "dark" : "light"); } catch { /* нет хранилища */ } return !x; }) };
}
// сайдбар: свёрнут/развёрнут; без выбора пользователя на 640–1279px свёрнут
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
// недоступный по правам раздел — первый доступный («Главная» открыта всем)
function useTab(allowed: string[]) {
  const get = () => { const h = location.hash.replace("#", ""); return allowed.includes(h) ? h : allowed[0] || "home"; };
  const [t, setT] = useState(get);
  useEffect(() => { const f = () => setT(get()); f(); window.addEventListener("hashchange", f); return () => window.removeEventListener("hashchange", f); }, [allowed.join()]); // eslint-disable-line react-hooks/exhaustive-deps
  return [t, (x: string) => { location.hash = x; window.scrollTo({ top: 0, behavior: "smooth" }); }] as const;
}

// кнопка боковой панели: Tooltip всегда на месте (подсказка только в свёрнутом виде), чтобы фокус не терялся
function SideBtn({ min, label, icon: Icon, on, current, expanded, k, onClick }: { k?: string; min: boolean; label: string; icon: LucideIcon; on?: boolean; current?: boolean; expanded?: boolean; onClick: () => void }) {
  return (
    <Tooltip><TooltipTrigger asChild>
      <button type="button" data-key={k} aria-label={label} aria-current={current ? "page" : undefined} aria-expanded={expanded} onClick={onClick}
        className={cn("relative z-10 flex h-11 w-full items-center gap-3 rounded-full bg-transparent px-3 text-left text-[14px] font-medium whitespace-nowrap transition outline-none focus-visible:ring-2 focus-visible:ring-primary/40", on ? "text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
        <Icon className="size-5 shrink-0" strokeWidth={1.8} /><span className={cn(min && "hidden")}>{label}</span>
      </button>
    </TooltipTrigger><TooltipContent side="right" hidden={!min}>{label}</TooltipContent></Tooltip>
  );
}

function Shell({ email }: { email: string }) {
  const { dark, toggle } = useTheme();
  const q = useData();
  const access = useAccess();
  const nav = NAV.filter((n) => n.ready && canTab(access, n.id));
  const [tab, go] = useTab(nav.map((n) => n.id));
  const sb = useSidebar(), phone = useIsPhone();
  const [more, setMore] = useState(false);
  const sideRef = useRef<HTMLElement>(null), botRef = useRef<HTMLElement>(null);
  const MAIN = nav.length <= 5 ? nav : nav.slice(0, 4), REST = nav.slice(MAIN.length);
  const inMain = MAIN.some((n) => n.id === tab), botKey = inMain ? tab : "more";
  const role = access.role === "owner" || access.role === "admin" ? "" : ROLE_LABEL[access.role] + (access.point ? " · " + access.point : "");
  return (
    <div className="min-h-dvh">
      {/* панель разделов: на телефоне — снизу, равные колонки */}
      <nav ref={botRef} aria-label="Разделы" style={{ gridTemplateColumns: `repeat(${MAIN.length + (REST.length ? 1 : 0)}, minmax(0, 1fr))` }} className="glass fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 grid rounded-[30px] p-1.5 sm:hidden">
        <FlowPill containerRef={botRef} activeKey={botKey} axis="x" className="inset-y-1.5" />
        {MAIN.map((n) => (
          <button key={n.id} type="button" data-key={n.id} aria-current={n.id === tab ? "page" : undefined} onClick={() => go(n.id)}
            className={cn("relative z-10 flex h-[52px] flex-col items-center justify-center gap-0.5 rounded-full bg-transparent text-[10.5px] font-medium transition", n.id === tab ? "text-primary" : "text-muted-foreground")}>
            <n.icon className="size-5" strokeWidth={1.8} />{n.label}
          </button>
        ))}
        {REST.length > 0 && <button type="button" data-key="more" aria-expanded={more} onClick={() => setMore(true)}
          className={cn("relative z-10 flex h-[52px] flex-col items-center justify-center gap-0.5 rounded-full bg-transparent text-[10.5px] font-medium transition", !inMain ? "text-primary" : "text-muted-foreground")}>
          <MoreHorizontal className="size-5" strokeWidth={1.8} />Ещё
        </button>}
      </nav>
      <Sheet open={more} onOpenChange={setMore}>
        <SheetContent side="bottom" showCloseButton={false} className="max-h-[85dvh] overflow-y-auto rounded-t-[28px] p-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:hidden">
          <SheetTitle className="sr-only">Разделы</SheetTitle>
          <div className="grid gap-1">
            {REST.map((n) => (
              <button key={n.id} type="button" aria-current={n.id === tab ? "page" : undefined} onClick={() => { go(n.id); setMore(false); }}
                className={cn("flex h-12 items-center gap-3 rounded-full px-4 text-left text-[15px] font-medium", n.id === tab ? "bg-primary/12 text-primary" : "text-foreground hover:bg-muted")}>
                <n.icon className="size-5" strokeWidth={1.8} />{n.label}
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2 border-t pt-3 text-[13px]">
            <i className="size-2 shrink-0 rounded-full bg-plus" /><span className="min-w-0 flex-1 truncate">{email}</span>
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => { setMore(false); signOut(); qc.clear(); }}><LogOut />Выйти</Button>
          </div>
        </SheetContent>
      </Sheet>
      {/* боковая панель на компьютере */}
      <aside aria-label="Разделы" className={cn("glass fixed inset-y-0 left-0 z-30 hidden flex-col overflow-x-hidden overflow-y-auto rounded-none border-y-0 border-l-0 py-4 transition-[width] duration-(--dur-base) ease-(--ease-out) sm:flex", sb.min ? "w-16" : "w-64")}>
        <div className="mb-3 flex h-11 items-center gap-3 px-3">
          <Brand compact={sb.min} />
        </div>
        <nav ref={sideRef} className="relative mx-3 flex flex-1 flex-col gap-1">
          <FlowPill containerRef={sideRef} activeKey={tab} axis="y" />
          {nav.map((n) => <SideBtn key={n.id} k={n.id} min={sb.min} label={n.label} icon={n.icon} on={n.id === tab} current={n.id === tab} onClick={() => go(n.id)} />)}
        </nav>
        <div className="mt-3 flex flex-col gap-1 px-3">
          <SideBtn key="theme" min={sb.min} label={dark ? "Светлая тема" : "Тёмная тема"} icon={dark ? Sun : Moon} onClick={toggle} />
          <SideBtn key="fold" min={sb.min} label={sb.min ? "Развернуть панель" : "Свернуть панель"} icon={sb.min ? ChevronsRight : ChevronsLeft} expanded={!sb.min} onClick={sb.toggle} />
        </div>
      </aside>
      <div className={cn("transition-[padding] duration-(--dur-base) ease-(--ease-out)", sb.min ? "sm:pl-16" : "sm:pl-64")}>
      <div className={cn("mx-auto px-4 @container/main pt-5 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:px-6 sm:pb-10 xl:px-9", WIDE[tab] ? "max-w-[2000px]" : "max-w-[1600px]")}>
        <div className="mb-6 flex min-h-11 items-center gap-2.5">
          <span className="glass flex items-center rounded-full px-4 py-2 sm:hidden"><Brand sub={false} /></span>
          <span className="glass hidden items-center gap-2 rounded-full px-4 py-2.5 text-[13.5px] sm:flex"><b>Saif-Optics</b><span className="text-muted-foreground">›</span><span className="text-muted-foreground">{NAV.find((n) => n.id === tab)?.label}</span></span>
          {role && <span className="glass hidden items-center rounded-full px-3 py-2.5 text-[12.5px] text-muted-foreground md:flex">{role}</span>}
          <div className="ml-auto flex items-center gap-2">
            <Clock />
            <Button variant="secondary" size="icon-lg" className="glass rounded-full" onClick={toggle} aria-label="Сменить тему">{dark ? <Sun /> : <Moon />}</Button>
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
            <motion.div key={tab} {...fade} exit={{ opacity: 0, transition: { duration: DUR.fast } }}>{KIT() ? <KitDemo /> : (() => { const P = PAGES[tab] || KassaPage; return <P d={q.data} />; })()}</motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      </div>
      <Toaster theme={dark ? "dark" : "light"} position={phone ? "top-center" : "bottom-right"} richColors />
    </div>
  );
}

const Loading = () => (
  <div className="mx-auto grid max-w-[1600px] gap-4 px-4 pt-5 sm:px-6 xl:px-9"><Skeleton className="h-24 rounded-3xl" /><div className="grid gap-4 sm:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-3xl" />)}</div><Skeleton className="h-96 rounded-3xl" /></div>
);

// после входа: узнаём права; нет доступа — экран с кнопкой «Выйти»
function Gate({ email }: { email: string }) {
  const q = useQuery({ queryKey: ["kassa-access", email], queryFn: () => loadAccess(email), staleTime: Infinity, retry: false });
  if (q.isLoading) return <Loading />;
  if (!q.data) return (
    <div className="grid min-h-dvh place-items-center p-4">
      <div className="glass flex max-w-md flex-col items-center gap-4 rounded-[28px] p-8 text-center">
        <Brand />
        <p className="text-[15px]">У {email} нет доступа к кассе. Попросите владельца добавить эту почту.</p>
        <Button className="rounded-full" onClick={() => { signOut(); qc.clear(); }}><LogOut />Выйти</Button>
      </div>
    </div>
  );
  return <AccessProvider value={q.data}><Shell email={isDemo ? "демо-данные" : email} /></AccessProvider>;
}

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  // при смене пользователя (выход, вход под другим) кэш данных и прав очищается, чтобы не показать чужое
  const lastEmail = useRef<string>("");
  const apply = (s: Session | null) => { const e = s?.user?.email || ""; if (e !== lastEmail.current) { lastEmail.current = e; qc.clear(); } setSession(s); };
  useEffect(() => { getSession().then(apply); return onAuth(apply); }, []);
  return (
    <QueryClientProvider client={qc}>
      <TooltipProvider delayDuration={150}>
        {session === undefined ? null : session ? <Gate email={session.user.email || ""} /> : <Login />}
      </TooltipProvider>
    </QueryClientProvider>
  );
}
