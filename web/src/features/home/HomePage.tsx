// Раздел «Главная»: плитки дня, что требует внимания, точки и 14 дней, разделы по важности, последние продажи.
import { useMemo } from "react";
import { motion } from "motion/react";
import { CalendarCheck, Calculator, ChevronRight, FileText, Plus, ShoppingBag, Wallet, type LucideIcon } from "lucide-react";
import type { Data } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import { PageHead } from "@/components/PageHead";
import { Chip, Tile, TileLabel, TileSub, TileValue } from "@/components/Tile";
import { NAV } from "@/lib/nav";
import { DUR, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { todayTash } from "../kassa/logic";
import { MiniRing, Spark } from "../plan/parts";
import { pointColor } from "../plan/Points";
import { fmt, fmtM, pctF } from "../plan/logic";
import { homeData, dateTitle, type AlertIcon } from "./logic";
import { WeekChart } from "./WeekChart";

const GO = (id: string, field?: string) => () => {
  location.hash = id; window.scrollTo({ top: 0, behavior: "smooth" });
  // быстрые действия: после перехода — курсор в нужное поле раздела
  if (field) { let n = 0; const t = window.setInterval(() => { const el = document.querySelector<HTMLInputElement>(field); if (el || ++n > 40) { window.clearInterval(t); if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.focus({ preventScroll: true }); } } }, 100); }
};
const F_SALE = 'input[aria-label="Товар"]', F_EXP = 'input[placeholder="Например: Премиум за такси"]', F_CASH = 'input[aria-label="Сколько наличных в кассе"]';

const AL_ICON: Record<AlertIcon, LucideIcon> = { pay: CalendarCheck, report: FileText, sales: ShoppingBag, cash: Wallet };
const AL_TONE = { minus: "bg-minus-soft text-minus", warn: "bg-warn-soft text-warn", info: "bg-primary/12 text-primary" } as const;
const tint = (c: string) => ({ background: `color-mix(in srgb, ${c} 16%, transparent)`, color: c });
const sgn = (n: number) => (n >= 0 ? "+" : "−") + fmt(Math.abs(n));

export function HomePage({ d }: { d: Data }) {
  const today = todayTash();
  const h = useMemo(() => homeData(d, today), [d, today]);
  const mx = Math.max(1, ...h.pts.map((o) => o.r));
  const t = h.tiles, nav = Object.fromEntries(NAV.map((n) => [n.id, n]));
  // сквозной номер посадки по порядку чтения
  let k = 0; const nx = () => k++;
  const planCol = t.plan.fpct == null ? "var(--primary)" : t.plan.fpct >= 1 ? "var(--plus)" : t.plan.fpct >= 0.85 ? "var(--warn)" : "var(--minus)";
  return (
    <div className="flex flex-col gap-3.5">
      <PageHead eyebrow="Касса оптики" title="Главная" sub={dateTitle(today)} actions={<>
        <Button size="lg" onClick={GO("sales", F_SALE)}><Plus />Продажа</Button>
        <Button size="lg" variant="secondary" onClick={GO("kassa", F_EXP)}><Plus />Расход</Button>
        <Button size="lg" variant="secondary" onClick={GO("kassa", F_CASH)}><Calculator />Пересчитать кассу</Button>
      </>} />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <Tile i={nx()} hero>
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1"><TileLabel>Выручка {h.lbl}</TileLabel><Spark data={t.today.spark} color="#fff" w={64} h={24} /></div>
          <TileValue count={t.today.value} suffix=" сум" />
          <TileSub><span>{t.today.checks} чек.{t.today.points ? ` · точек ${t.today.points}` : ""}</span>
            {t.today.deltaPct != null && <Chip tone={t.today.deltaPct >= 0 ? "plus" : "minus"}>{(t.today.deltaPct >= 0 ? "+" : "−") + Math.abs(t.today.deltaPct)}% к среднему дню</Chip>}
            {h.lastDay !== today && <span>сегодня продаж ещё нет</span>}</TileSub>
        </Tile>
        <Tile i={nx()} warn={t.cash.diff != null && t.cash.diff <= -1000}>
          <TileLabel>{t.cash.fact ? "Наличные в кассе" : "Должно быть на руках"}</TileLabel>
          <TileValue count={t.cash.value} suffix=" сум" />
          <TileSub>{t.cash.fact && <Chip tone={t.cash.ok ? "plus" : t.cash.diff! < 0 ? "minus" : "warn"}>{t.cash.diffLabel}</Chip>}
            <span>{t.cash.at ? "пересчёт " + t.cash.at : "касса ещё не пересчитана"}</span></TileSub>
        </Tile>
        <Tile i={nx()}>
          <TileLabel>Выручка за месяц</TileLabel>
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1"><TileValue count={t.plan.value} format="mln" />{t.plan.pct != null && <MiniRing p={t.plan.pct} color={planCol} />}</div>
          <TileSub>{t.plan.pct != null ? <span>{pctF(t.plan.pct)} плана</span> : <span>план месяца не задан</span>}
            {(t.plan.needPerDay ?? 0) > 0 && <Chip tone="warn">нужно {fmtM(t.plan.needPerDay ?? 0)} в день</Chip>}
            {(t.plan.needPerDay ?? 0) > 0 && <span>осталось {t.plan.daysLeft} раб. дн.</span>}</TileSub>
        </Tile>
        <Tile i={nx()}>
          <TileLabel>Расчётный счёт</TileLabel>
          {t.rs.value != null ? <TileValue count={t.rs.value} suffix=" сум" /> : <TileValue>—</TileValue>}
          <TileSub>{t.rs.delta != null && <span>{sgn(t.rs.delta)} за день</span>}
            {t.rs.nextPay ? <Chip tone="warn" className="max-w-full"><span className="truncate">{t.rs.nextPay.name} · {t.rs.nextPay.days <= 0 ? "сегодня" : `через ${t.rs.nextPay.days} дн.`}</span></Chip>
              : t.rs.value == null ? <span>выписки пока нет</span> : <span>платежей впереди нет</span>}</TileSub>
        </Tile>
      </div>

      {h.alerts.length > 0 && (
        <Card title="Требует внимания" note={`${h.alerts.length} ${h.alerts.length === 1 ? "пункт" : h.alerts.length < 5 ? "пункта" : "пунктов"}`} i={nx()}>
          <div className="grid gap-2 sm:grid-cols-2">
            {h.alerts.map((a, j) => { const I = AL_ICON[a.icon]; return (
              <button key={j} type="button" onClick={GO(a.go.tab, a.go.field)} className="glass-inner flex min-w-0 items-center gap-3 rounded-2xl p-2.5 text-left transition-colors hover:bg-accent">
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-[10px]", AL_TONE[a.tone])}><I className="size-[18px]" strokeWidth={1.9} /></span>
                <span className="min-w-0 flex-1"><b className="block truncate text-[13.5px] font-semibold">{a.title}</b><span className="line-clamp-2 text-xs text-muted-foreground sm:line-clamp-1">{a.sub}</span></span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </button>); })}
          </div>
        </Card>
      )}

      <div className="grid gap-3.5 lg:grid-cols-2">
        <Card title="Точки сегодня" note={h.ptNote} i={nx()}>
          {h.pts.length ? (
            <div className="flex flex-col gap-3.5">
              {h.pts.map((o) => (
                <div key={o.p} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2"><i className="size-2.5 shrink-0 rounded-full" style={{ background: pointColor(d.points, o.p) }} /><b className="truncate text-sm">{o.p}</b><span className="truncate text-xs text-muted-foreground">{o.checks}{o.seller ? " · " + o.seller : ""}</span></span>
                    <b className="num shrink-0 text-sm">{fmt(o.r)}</b>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div className="h-full rounded-full" style={{ background: pointColor(d.points, o.p) }} initial={{ width: 0 }} animate={{ width: Math.min(100, (o.r / mx) * 100) + "%" }} transition={{ duration: DUR.land, ease: EASE.expo }} />
                  </div>
                  <span className="text-xs text-muted-foreground">за месяц {fmt(o.month)}{o.planPct ? ` · ${o.planPct} плана точки` : ""}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-border pt-3"><b>{h.ptTotalLabel}</b><b className="num">{fmt(h.dayRev)}</b></div>
            </div>
          ) : <p className="py-6 text-center text-muted-foreground">Продаж пока нет</p>}
        </Card>
        <Card title="Выручка за 14 дней" i={nx()}
          note={<>{"7 дн. " + fmtM(h.week.sum)}{h.week.delta != null && <span className={cn("ml-1.5 rounded-full px-2 py-0.5 text-[11.5px] font-semibold", h.week.delta >= 0 ? "bg-plus-soft text-plus" : "bg-minus-soft text-minus")}>{(h.week.delta >= 0 ? "+" : "−") + Math.abs(h.week.delta)}%</span>}</>}>
          <WeekChart bars={h.week.bars} />
          <p className="text-xs text-muted-foreground">подписи в млн сум · лучший день выделен</p>
        </Card>
      </div>

      <Card title="Разделы" note="по важности" i={nx()}>
        <div className={cn("grid grid-cols-2 gap-2.5 lg:grid-cols-3", h.sections.length <= 9 ? "xl:grid-cols-3" : "xl:grid-cols-4")}>
          {h.sections.map((s) => { const n = nav[s.id], I = n.icon; return (
            <button key={s.id} type="button" onClick={GO(s.id)}
              className="glass-inner relative flex min-w-0 flex-col gap-2 rounded-2xl p-3 text-left transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[.98] sm:flex-row sm:items-center sm:gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl" style={tint(n.color)}><I className="size-5" strokeWidth={1.9} /></span>
              <span className="min-w-0 flex-1"><b className="block truncate text-sm font-semibold">{n.label}</b><span className="line-clamp-2 text-xs text-muted-foreground sm:line-clamp-1">{s.line}</span></span>
              {s.badge > 0 && <span className="num absolute top-2 right-2 grid min-w-5 place-items-center rounded-full bg-minus px-1.5 text-[11px] leading-5 font-bold text-white sm:static sm:shrink-0">{s.badge}</span>}
            </button>); })}
        </div>
      </Card>

      <Card title="Последние продажи" action={{ label: "Все продажи", onClick: GO("sales") }} i={nx()}>
        {h.last.length ? (
          <div className="flex flex-col">
            {h.last.map((s) => (
              <div key={s.id} className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0">
                <i className="size-2.5 shrink-0 rounded-full" style={{ background: pointColor(d.points, s.point) }} />
                <div className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{s.product}</span><span className="block truncate text-xs text-muted-foreground">{s.when} · {s.point}</span></div>
                {s.pay && <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{s.pay}</span>}
                <b className="num shrink-0 text-sm">{fmt(s.sum)}</b>
              </div>
            ))}
          </div>
        ) : <p className="py-6 text-center text-muted-foreground">Продаж пока нет</p>}
      </Card>
    </div>
  );
}
