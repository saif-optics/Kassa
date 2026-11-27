// Раздел «Главная»: плитки дня, что требует внимания, точки и 14 дней, разделы по важности, последние продажи.
import { useMemo } from "react";
import { CalendarCheck, Calculator, FileText, ListChecks, Plus, ShoppingBag, Wallet, type LucideIcon } from "lucide-react";
import type { Data } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import { PageHead } from "@/components/PageHead";
import { Chip, Tile, TileBody, TileLabel, TileSub, TileTop, TileValue } from "@/components/Tile";
import { Bento, Item } from "@/components/Grid";
import { Row, RowCell, RowName, Rows } from "@/components/Rows";
import { NAV } from "@/lib/nav";
import { canPerm, canTab, useAccess } from "@/lib/access";
import { fmtD, ST, useTasks } from "../tasks/logic";
import { cn } from "@/lib/utils";
import { todayTash } from "../kassa/logic";
import { MiniRing } from "../plan/parts";
import { pointColor } from "../plan/Points";
import { addD, fmt, fmtM, pctF, planEnv, plural } from "../plan/logic";
import { payOf } from "../sales/logic";
import { addM, dDiff, dLong as dLongP, monthRows } from "../pay/logic";
import { homeData, dateTitle, type AlertIcon } from "./logic";
import { WeekChart } from "./WeekChart";

const GO = (id: string, field?: string) => () => {
  if (field === F_SALE) { try { sessionStorage.setItem("kassa-web.sales.tab", "sale"); } catch { /* без хранилища */ } } // на телефоне открыть вкладку «Продажа»
  location.hash = id; window.scrollTo({ top: 0, behavior: "smooth" });
  // быстрые действия: после перехода — курсор в нужное поле раздела
  if (field) { let n = 0; const t = window.setInterval(() => { const el = document.querySelector<HTMLInputElement>(field); if (el || ++n > 40) { window.clearInterval(t); if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.focus({ preventScroll: true }); } } }, 100); }
};
const F_SALE = 'input[aria-label="Товар"]', F_EXP = 'input[placeholder="Например: Премиум за такси"]', F_CASH = 'input[aria-label="Сколько наличных в кассе"]';

const AL_ICON: Record<AlertIcon, LucideIcon> = { pay: CalendarCheck, report: FileText, sales: ShoppingBag, cash: Wallet, tasks: ListChecks };
const AL_TONE = { minus: "bg-minus-soft text-minus", warn: "bg-warn-soft text-warn", info: "bg-primary/12 text-primary" } as const;
const tint = (c: string) => ({ background: `color-mix(in srgb, ${c} 16%, transparent)`, color: c });
// блоки мозаики: порядок и спаны по ширине контейнера (телефон 2 колонки, от 640 — 6, от 1024 — 12; от 1700 верх другой)
const C = {
  hero: "order-1 col-span-2 row-span-2 @min-[640px]/main:col-span-6 @min-[1600px]/main:col-span-4",
  cash: "order-2 @min-[1024px]/main:order-3 @min-[1600px]/main:order-2 col-span-1 @min-[640px]/main:col-span-3 @min-[1600px]/main:col-span-2",
  month: "order-3 @min-[1024px]/main:order-4 @min-[1600px]/main:order-3 col-span-1 @min-[640px]/main:col-span-3 @min-[1600px]/main:col-span-2",
  rs: "order-4 @min-[1024px]/main:order-5 col-span-1 @min-[640px]/main:col-span-3 @min-[1600px]/main:col-span-2",
  need: "order-5 @min-[1024px]/main:order-6 col-span-1 @min-[640px]/main:col-span-3 @min-[1600px]/main:col-span-2",
  attn: "order-6 col-span-2 row-span-2 @min-[640px]/main:col-span-6 @min-[1024px]/main:order-2 @min-[1600px]/main:order-4 @min-[1600px]/main:col-span-4",
  pts: "order-10 col-span-2 row-span-2 @min-[640px]/main:col-span-6 @min-[1024px]/main:order-11 @min-[1024px]/main:col-span-3",
  week: "order-11 col-span-2 row-span-2 @min-[640px]/main:col-span-6 @min-[1024px]/main:order-10",
  pay: "order-12 col-span-2 row-span-2 @min-[640px]/main:col-span-6 @min-[1024px]/main:col-span-3",
  sales: "order-13 col-span-2 row-span-3 @min-[640px]/main:col-span-6 @min-[1600px]/main:row-span-2",
  sec: "order-14 col-span-2 row-span-3 @min-[640px]/main:col-span-6 @min-[1600px]/main:row-span-2",
};
const sgn = (n: number) => (n >= 0 ? "+" : "−") + fmt(Math.abs(n));

export function HomePage({ d }: { d: Data }) {
  const today = todayTash();
  const a = useAccess(), adm = a.isAdmin, seeSales = canPerm(a, "sales_view"); // без права на продажи выручку не показываем
  const tq = useTasks(a); // нет данных заданий (нет права или ошибка) — Главная просто без них
  const h = useMemo(() => homeData(d, today, { tasks: tq.data?.tasks, comments: tq.data?.comments, access: a }), [d, today, tq.data, a]);
  // «Задания на сегодня» (просроченные и ближайшие) и «Платежи на неделю» (просрочено и до 7 дней) — из тех же данных, что в разделах
  const todo = useMemo(() => (tq.data?.tasks || []).filter((t) => t.status !== "done").sort((x, y) => (x.due || "9").localeCompare(y.due || "9")).slice(0, 3), [tq.data]);
  const week = useMemo(() => {
    const m = today.slice(0, 7), end = addD(today, 7);
    const rows = [addM(m, -2), addM(m, -1), m, addM(m, 1)].flatMap((M) => monthRows(d, M, today))
      .filter((r) => r.st !== "ok" && r.left > 0 && r.due <= end).sort((x, y) => x.due.localeCompare(y.due));
    return { rows: rows.slice(0, 4), more: Math.max(0, rows.length - 4), sum: rows.reduce((s, r) => s + (r.left || r.am.a), 0) };
  }, [d, today]);
  const t = h.tiles, nav = Object.fromEntries(NAV.map((n) => [n.id, n]));
  const planCol = t.plan.fpct == null ? "var(--primary)" : t.plan.fpct >= 1 ? "var(--plus)" : t.plan.fpct >= 0.85 ? "var(--warn)" : "var(--minus)";
  // сквозной номер посадки по порядку чтения
  let k = 0; const nx = () => Math.min(k++, 8);
  // способы оплаты последнего дня для строки под выручкой
  const dayPay = useMemo(() => { const o: Record<string, number> = {}; planEnv(d, today).sales.filter((x) => x.date === h.lastDay).forEach((x) => Object.entries(payOf(x as Parameters<typeof payOf>[0])).forEach(([n, v]) => (o[n] = (o[n] || 0) + v))); return o; }, [d, today, h.lastDay]);
  // суммы справа в пунктах «Требует внимания»: просрочка по платежам и разница кассы
  const lateSum = useMemo(() => [addM(today.slice(0, 7), -2), addM(today.slice(0, 7), -1), today.slice(0, 7)].flatMap((M) => monthRows(d, M, today))
    .filter((r) => (r.st === "late" || r.st === "part") && r.due < today && r.left > 0).reduce((s, r) => s + (r.left || r.am.a), 0), [d, today]);
  const alertSum = (a: { icon: AlertIcon }) => a.icon === "pay" && lateSum ? fmtM(lateSum) : a.icon === "cash" && t.cash.diff != null && Math.abs(t.cash.diff) >= 1000 ? sgn(t.cash.diff) : "";
  const chk = (n: number) => `${n} ${plural(n, "чек", "чека", "чеков")}`;
  const secs = h.sections.filter((s) => canTab(a, s.id));
  const nTodo = h.alerts.length >= 2 ? 1 : 3 - h.alerts.length;
  return (
    <div className="flex flex-col gap-4">
      <PageHead eyebrow="Касса оптики" title="Главная" sub={dateTitle(today)} actions={<>
        {canTab(a, "sales") && <Button size="lg" onClick={GO("sales", F_SALE)}><Plus />Продажа</Button>}
        {canTab(a, "kassa") && <Button size="lg" variant="secondary" onClick={GO("kassa", F_EXP)}><Plus />Расход</Button>}
        {canTab(a, "kassa") && <Button size="lg" variant="secondary" onClick={GO("kassa", F_CASH)}><Calculator />Пересчитать кассу</Button>}
      </>} />

      <Bento>
        {seeSales && <>
          <Item c={C.hero}><Tile i={nx()} hero to={canTab(a, "sales") ? { tab: "sales", params: { day: h.lastDay } } : undefined} label={`продажи за ${h.lbl}`}>
            <TileTop><TileLabel>Выручка {h.lbl}</TileLabel>
              {t.today.deltaPct != null && <Chip tone="plus">{(t.today.deltaPct >= 0 ? "+" : "−") + Math.abs(t.today.deltaPct)}%<span className="ml-1 max-[639px]:hidden">к среднему</span></Chip>}</TileTop>
            <HeroLine data={t.today.spark} />
            <TileBody><TileValue count={t.today.value} />
              <div className="mt-2.5 flex flex-wrap gap-x-3.5 text-[13px] text-white/85 @min-[640px]/main:text-[15px]">
                <span>{chk(t.today.checks)}{t.today.points ? ` · ${t.today.points} ${plural(t.today.points, "точка", "точки", "точек")}` : ""}</span>
                {dayPay["Наличные"] > 0 && <span>нал {fmtM(dayPay["Наличные"])}</span>}
                {dayPay["Терминал"] > 0 && <span className="max-[639px]:hidden">терминал {fmtM(dayPay["Терминал"])}</span>}
                {dayPay["QR/Payme"] > 0 && <span className="max-[639px]:hidden">QR {fmtM(dayPay["QR/Payme"])}</span>}
                {h.lastDay !== today && <span className="max-[639px]:hidden">продаж сегодня нет</span>}
              </div></TileBody>
          </Tile></Item>
          {adm && <Item c={C.cash}><Tile i={nx()} warn={t.cash.diff != null && t.cash.diff <= -1000} to={{ tab: "kassa" }} label="кассу">
            <TileLabel>{t.cash.fact ? "Наличные в кассе" : "Должно быть на руках"}</TileLabel>
            <TileBody><TileValue count={t.cash.value} compact />
              <TileSub>{t.cash.fact ? <Chip tone={t.cash.ok ? "plus" : t.cash.diff! < 0 ? "minus" : "warn"}>{t.cash.diffLabel}</Chip> : <span>касса не пересчитана</span>}</TileSub></TileBody>
          </Tile></Item>}
          <Item c={C.month}><Tile i={nx()}>
            <TileTop><TileLabel className="pr-11">Выручка за месяц</TileLabel>{t.plan.pct != null && <span className="absolute top-3.5 right-4 @min-[640px]/main:top-[18px] @min-[640px]/main:right-5 [&>svg]:size-11"><MiniRing p={t.plan.pct} color={planCol} /></span>}</TileTop>
            <TileBody><TileValue count={t.plan.value} format="mln" />
              <TileSub>{t.plan.pct != null ? <span>{pctF(t.plan.pct)} плана{h.plan.S && !h.plan.K.past ? ` · ${fmtM(h.plan.S.pace)} в день` : ""}</span> : <span>план месяца не задан</span>}</TileSub></TileBody>
          </Tile></Item>
          {adm && <Item c={C.rs}><Tile i={nx()} to={{ tab: "report" }} label="отчёт по расчётному счёту">
            <TileLabel>Расчётный счёт</TileLabel>
            <TileBody>{t.rs.value != null ? <TileValue count={t.rs.value} compact /> : <TileValue>—</TileValue>}
              <TileSub>{t.rs.nextPay ? <Chip tone="warn" className="min-w-0 shrink"><span className="truncate">{t.rs.nextPay.name} · {t.rs.nextPay.days <= 0 ? "сегодня" : `${t.rs.nextPay.days} дн.`}</span></Chip>
                : t.rs.value == null ? <span>выписки пока нет</span> : <span>платежей впереди нет</span>}</TileSub></TileBody>
          </Tile></Item>}
          <Item c={C.need}><Tile i={nx()} to={canTab(a, "plan") ? { tab: "plan" } : undefined} label="план">
            <TileLabel>Нужно в день</TileLabel>
            <TileBody>{t.plan.needPerDay != null ? <TileValue count={t.plan.needPerDay} compact /> : <TileValue>—</TileValue>}
              <TileSub><span>{t.plan.needPerDay != null ? `до плана ${t.plan.daysLeft} раб. дн.` : t.plan.planTotal ? "месяц закрыт" : "план месяца не задан"}</span></TileSub></TileBody>
          </Tile></Item>
        </>}

        <Item c={C.attn}>
          <Card title="Требует внимания" note={h.alerts.length ? `${h.alerts.length} ${plural(h.alerts.length, "пункт", "пункта", "пунктов")}` : "всё в порядке"} i={nx()} className="gap-2 overflow-hidden @min-[1600px]/main:gap-3">
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
              {h.alerts.length === 0 && <div className="glass-inner rounded-[18px] px-3.5 py-3 text-[15px] text-muted-foreground">Ничего срочного нет</div>}
              {h.alerts.map((a, j) => { const I = AL_ICON[a.icon], sum = alertSum(a); return (
                <button key={j} type="button" onClick={GO(a.go.tab, a.go.field)} className={cn("glass-inner flex min-w-0 shrink-0 items-center gap-3 rounded-[18px] px-3.5 py-1.5 text-left transition-colors @min-[1600px]/main:py-2.5 hover:bg-accent", j > 1 && "@min-[640px]/main:hidden")}>
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", AL_TONE[a.tone])}><I className="size-[18px]" strokeWidth={1.9} /></span>
                  <span className="min-w-0 flex-1"><b className="block truncate text-[15px] font-bold">{a.title}</b><span className="block truncate text-sm text-muted-foreground">{a.sub}</span></span>
                  {sum && <span className={cn("num hidden shrink-0 text-lg font-extrabold @min-[640px]/main:block", a.tone === "minus" ? "text-minus" : a.tone === "warn" ? "text-warn" : "text-primary")}>{sum}</span>}
                </button>); })}
            </div>
            {adm && <div className="hidden shrink-0 flex-col gap-1 @min-[1024px]/main:flex">
              <header className="flex items-baseline justify-between gap-3"><h3 className="text-base font-bold">Задания на сегодня</h3>
                <button type="button" onClick={GO("tasks")} className="text-[13px] font-semibold text-primary hover:underline">Все задания</button></header>
              <Rows cols="1fr 110px" phone="1fr auto">
                {todo.length === 0 ? <Row className="min-h-10"><RowName title="Открытых заданий нет" sub="новых 0 · в работе 0" /><Chip tone="plus" className="justify-self-end">чисто</Chip></Row>
                  : todo.slice(0, nTodo).map((x) => { const over = !!x.due && x.due.slice(0, 10) < today;
                    return (<Row key={x.id} className="min-h-10">
                      <RowName title={x.title} sub={`${x.point} · ${over ? `просрочено ${dDiff(x.due!.slice(0, 10), today)} дн.` : x.due ? "до " + fmtD(x.due.slice(0, 10)).slice(0, 5) : "без срока"}`} />
                      <Chip tone={over ? "minus" : x.status === "work" ? "info" : "warn"} className="justify-self-end">{over ? "просрочено" : ST[x.status].toLowerCase()}</Chip>
                    </Row>); })}
              </Rows>
            </div>}
          </Card>
        </Item>

        {seeSales && <>
          <Item c={C.pts}>
            <Card title={`Точки ${h.lbl}`} note={h.pts.length ? "выручка" : undefined} i={nx()} className="gap-1.5">
              {h.pts.length ? (
                <Rows cols="1fr auto" phone="1fr auto" fill>
                  {h.pts.map((o) => (
                    <Row key={o.p}>
                      <RowName dot={pointColor(d.points, o.p)} title={o.p} sub={o.checks + (o.seller ? " · " + o.seller : "") + (o.planPct ? ` · ${o.planPct} плана` : "")} />
                      <RowCell right>{fmt(o.r)}</RowCell>
                    </Row>
                  ))}
                  <Row bold className="mt-auto flex-none border-foreground/20"><span>{h.ptTotalLabel}</span><RowCell right>{fmt(adm ? h.dayRev : h.ptDayRev)}</RowCell></Row>
                </Rows>
              ) : <p className="py-6 text-center text-muted-foreground">Продаж пока нет</p>}
            </Card>
          </Item>
          <Item c={C.week}>
            <Card title="Выручка за 14 дней" i={nx()}
              note={<span className="inline-flex items-center gap-2">{"7 дн. " + fmtM(h.week.sum)}{h.week.delta != null && <Chip tone={h.week.delta >= 0 ? "plus" : "minus"}>{(h.week.delta >= 0 ? "+" : "−") + Math.abs(h.week.delta)}%</Chip>}</span>}>
              <WeekChart bars={h.week.bars} />
            </Card>
          </Item>
        </>}

        {adm && <Item c={C.pay}>
          <Card title="Платежи на неделю" action={{ label: "Все", onClick: GO("pay") }} i={nx()} className="gap-1.5">
            {week.rows.length ? (
              <Rows cols="1fr auto" phone="1fr auto" fill>
                {week.rows.map((r) => { const late = r.due < today;
                  return (<Row key={r.it.id + r.due}>
                    <RowName title={r.it.name} sub={dLongP(r.due) + (late ? " · просрочено" : "")} />
                    <RowCell right className={late ? "text-minus" : undefined}>{fmt(r.left || r.am.a)}</RowCell>
                  </Row>); })}
                <Row bold className="mt-auto flex-none border-foreground/20"><span>Нужно{week.more ? ` · ещё ${week.more}` : ""}</span><RowCell right>{fmt(week.sum)}</RowCell></Row>
              </Rows>
            ) : <p className="py-6 text-center text-muted-foreground">Платежей на неделю нет</p>}
          </Card>
        </Item>}

        {canTab(a, "sales") && <Item c={C.sales}>
          <Card title="Последние продажи" action={{ label: "Все продажи", onClick: GO("sales") }} i={nx()} className="gap-1.5">
            {h.last.length ? (
              <Rows cols="1fr 96px auto" phone="1fr auto" fill className="@min-[1600px]/main:grid @min-[1600px]/main:auto-rows-fr @min-[1600px]/main:grid-cols-2 @min-[1600px]/main:gap-x-7">
                {h.last.map((s, j) => (
                  <Row key={s.id} className={cn("@min-[1600px]/main:min-h-0", j === 0 && "border-t-0", j === 1 && "@min-[1600px]/main:border-t-0", j > 4 && "@max-[1699px]/main:hidden")}>
                    <RowName dot={pointColor(d.points, s.point)} title={s.product} sub={<>{s.when} · {s.point}{s.pay && <span className="sm:hidden"> · {s.pay.toLowerCase()}</span>}</>} />
                    {s.pay ? <Chip tone={s.pay === "QR/Payme" ? "info" : "muted"} className="justify-self-start max-sm:hidden">{s.pay}</Chip> : <span className="max-sm:hidden" />}
                    <RowCell right>{fmt(s.sum)}</RowCell>
                  </Row>
                ))}
              </Rows>
            ) : <p className="py-6 text-center text-muted-foreground">Продаж пока нет</p>}
          </Card>
        </Item>}

        <Item c={C.sec}>
          <Card title="Разделы" note="по важности" i={nx()} className="gap-2.5">
            <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-2 gap-2 @min-[640px]/main:grid-cols-4 @min-[640px]/main:gap-2.5 @min-[1024px]/main:grid-cols-3 @min-[1600px]/main:grid-cols-5">
              {secs.map((s, j) => { const n = nav[s.id], I = n.icon; return (
                <button key={s.id} type="button" onClick={GO(s.id)}
                  className={cn("glass-inner relative flex min-w-0 items-center gap-2.5 rounded-[18px] px-3 py-2 text-left transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[.98] @min-[640px]/main:px-3.5 @min-[1600px]/main:gap-2 @min-[1600px]/main:px-2.5", j > 7 && "max-[639px]:hidden")}>
                  <span className="grid size-8 shrink-0 place-items-center rounded-[10px]" style={tint(n.color)}><I className="size-[18px]" strokeWidth={1.9} /></span>
                  <span className="min-w-0 flex-1"><b className="block truncate text-[15px] font-bold">{n.label}</b><span className="line-clamp-2 text-[13px] leading-tight text-muted-foreground @min-[640px]/main:text-sm">{s.line}</span></span>
                  {s.badge > 0 && <span className="num absolute top-1.5 right-1.5 grid min-w-5 place-items-center rounded-full bg-minus px-1.5 text-xs leading-5 font-bold text-white">{s.badge}</span>}
                </button>); })}
            </div>
          </Card>
        </Item>
      </Bento>
    </div>
  );
}

/** линия-искра на всю ширину hero: 14 дней, толщина линии не масштабируется */
function HeroLine({ data }: { data: number[] }) {
  if (data.length < 2) return <span />;
  const mx = Math.max(1, ...data), pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${36 - (v / mx) * 32}`).join(" ");
  return <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden className="my-2 min-h-8 w-full flex-1"><polyline points={pts} fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity=".9" /></svg>;
}
