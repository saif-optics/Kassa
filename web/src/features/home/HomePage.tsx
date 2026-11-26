// Раздел «Главная»: плитки дня, что требует внимания, точки и 14 дней, разделы по важности, последние продажи.
import { useMemo } from "react";
import { CalendarCheck, Calculator, FileText, ListChecks, Plus, ShoppingBag, Wallet, type LucideIcon } from "lucide-react";
import type { Data } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import { PageHead } from "@/components/PageHead";
import { Chip, Tile, TileBody, TileLabel, TileSub, TileTop, TileValue } from "@/components/Tile";
import { Cell, Grid } from "@/components/Grid";
import { Row, RowCell, RowName, Rows } from "@/components/Rows";
import { NAV } from "@/lib/nav";
import { canPerm, canTab, useAccess } from "@/lib/access";
import { fmtD, ST, useTasks } from "../tasks/logic";
import { cn } from "@/lib/utils";
import { todayTash } from "../kassa/logic";
import { MiniRing, Spark } from "../plan/parts";
import { pointColor } from "../plan/Points";
import { addD, fmt, fmtM, pctF, plural } from "../plan/logic";
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
  // сквозной номер посадки по порядку чтения
  let k = 0; const nx = () => Math.min(k++, 8);
  const planCol = t.plan.fpct == null ? "var(--primary)" : t.plan.fpct >= 1 ? "var(--plus)" : t.plan.fpct >= 0.85 ? "var(--warn)" : "var(--minus)";
  return (
    <div className="flex flex-col gap-4">
      <PageHead eyebrow="Касса оптики" title="Главная" sub={dateTitle(today)} actions={<>
        {canTab(a, "sales") && <Button size="lg" onClick={GO("sales", F_SALE)}><Plus />Продажа</Button>}
        {canTab(a, "kassa") && <Button size="lg" variant="secondary" onClick={GO("kassa", F_EXP)}><Plus />Расход</Button>}
        {canTab(a, "kassa") && <Button size="lg" variant="secondary" onClick={GO("kassa", F_CASH)}><Calculator />Пересчитать кассу</Button>}
      </>} />

      <Grid>
        {seeSales && <>
          <Cell s={3} span={3} wide={2}><Tile i={nx()} hero>
            <TileTop><TileLabel>Выручка {h.lbl}</TileLabel><Spark data={t.today.spark} color="#fff" w={44} h={20} /></TileTop>
            <TileBody><TileValue count={t.today.value} />
              <TileSub><span>{t.today.checks} чек.{t.today.points ? ` · ${t.today.points} тчк` : ""}</span>
                {t.today.deltaPct != null && <Chip tone={t.today.deltaPct >= 0 ? "plus" : "minus"}>{(t.today.deltaPct >= 0 ? "+" : "−") + Math.abs(t.today.deltaPct)}%</Chip>}
                {h.lastDay !== today && <span>продаж сегодня нет</span>}</TileSub></TileBody>
          </Tile></Cell>
          {adm && <Cell s={3} span={3} wide={2}><Tile i={nx()} warn={t.cash.diff != null && t.cash.diff <= -1000}>
            <TileLabel>{t.cash.fact ? "Наличные в кассе" : "Должно быть на руках"}</TileLabel>
            <TileBody><TileValue count={t.cash.value} />
              <TileSub>{t.cash.fact && <Chip tone={t.cash.ok ? "plus" : t.cash.diff! < 0 ? "minus" : "warn"}>{t.cash.diffLabel}</Chip>}
                <span className="max-[1699px]/main:inline hidden">{t.cash.at ? "пересчёт " + t.cash.at : "касса не пересчитана"}</span></TileSub></TileBody>
          </Tile></Cell>}
          <Cell s={3} span={3} wide={2}><Tile i={nx()}>
            <TileTop><TileLabel>Выручка за месяц</TileLabel>{t.plan.pct != null && <span className="-mt-1 -mr-1"><MiniRing p={t.plan.pct} color={planCol} /></span>}</TileTop>
            <TileBody><TileValue count={t.plan.value} format="mln" />
              <TileSub>{t.plan.pct != null ? <span>{pctF(t.plan.pct)} плана</span> : <span>план месяца не задан</span>}
                {(t.plan.needPerDay ?? 0) > 0 && <Chip tone="warn">{fmtM(t.plan.needPerDay ?? 0)} в день</Chip>}</TileSub></TileBody>
          </Tile></Cell>
          {adm && <Cell s={3} span={3} wide={2}><Tile i={nx()}>
            <TileLabel>Расчётный счёт</TileLabel>
            <TileBody>{t.rs.value != null ? <TileValue count={t.rs.value} /> : <TileValue>—</TileValue>}
              <TileSub>{t.rs.delta != null && <span className="max-[1699px]/main:inline hidden">{sgn(t.rs.delta)} за день</span>}
                {t.rs.nextPay ? <Chip tone="warn" className="min-w-0 shrink"><span className="truncate">{t.rs.nextPay.name} · {t.rs.nextPay.days <= 0 ? "сегодня" : `через ${t.rs.nextPay.days} дн.`}</span></Chip>
                  : t.rs.value == null ? <span>выписки пока нет</span> : <span>платежей впереди нет</span>}</TileSub></TileBody>
          </Tile></Cell>}
        </>}

        {(h.alerts.length > 0 || (adm && todo.length > 0)) && <Cell s={6} span={7} wide={8} rows={2}>
          <Card title="Требует внимания" note={h.alerts.length ? `${h.alerts.length} ${plural(h.alerts.length, "пункт", "пункта", "пунктов")}` : "всё в порядке"} i={nx()}>
            <div className="grid grid-cols-1 gap-2 @min-[640px]/main:grid-cols-2">
              {h.alerts.map((a, j) => { const I = AL_ICON[a.icon]; return (
                <button key={j} type="button" onClick={GO(a.go.tab, a.go.field)} className="glass-inner flex min-w-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent">
                  <span className={cn("grid size-[30px] shrink-0 place-items-center rounded-[9px]", AL_TONE[a.tone])}><I className="size-4" strokeWidth={1.9} /></span>
                  <span className="min-w-0 flex-1"><b className="block truncate text-[13.5px] font-semibold">{a.title}</b><span className="block truncate text-xs text-muted-foreground">{a.sub}</span></span>
                </button>); })}
            </div>
            {todo.length > 0 && <div className="mt-1.5 hidden flex-col gap-2.5 @min-[1700px]/main:flex">
              <header className="flex items-baseline justify-between gap-3"><h2 className="text-base font-semibold">Задания на сегодня</h2>
                <button type="button" onClick={GO("tasks")} className="text-[12.5px] font-semibold text-primary hover:underline">Все задания</button></header>
              <Rows cols="1fr 92px">
                {todo.map((x) => { const over = !!x.due && x.due.slice(0, 10) < today;
                  return (<Row key={x.id}>
                    <RowName title={x.title} sub={`${x.point} · ${over ? `просрочено ${dDiff(x.due!.slice(0, 10), today)} дн.` : x.due ? "до " + fmtD(x.due.slice(0, 10)).slice(0, 5) : "без срока"}`} />
                    <Chip tone={over ? "minus" : x.status === "work" ? "info" : "warn"} className="justify-self-end">{over ? "просрочено" : ST[x.status].toLowerCase()}</Chip>
                  </Row>); })}
              </Rows>
            </div>}
          </Card>
        </Cell>}

        {seeSales && <>
          <Cell s={6} span={5} wide={4}>
            <Card title="Точки сегодня" note={h.pts.length ? "выручка" : undefined} i={nx()}>
              {h.pts.length ? (
                <Rows>
                  {h.pts.map((o) => (
                    <Row key={o.p}>
                      <RowName dot={pointColor(d.points, o.p)} title={o.p} sub={o.checks + (o.seller ? " · " + o.seller : "")} />
                      <RowCell right muted>{o.planPct ? `${o.planPct} плана` : ""}</RowCell>
                      <RowCell right>{fmt(o.r)}</RowCell>
                    </Row>
                  ))}
                  <Row bold><span>{h.ptTotalLabel}</span><span /><RowCell right>{fmt(adm ? h.dayRev : h.ptDayRev)}</RowCell></Row>
                </Rows>
              ) : <p className="py-6 text-center text-muted-foreground">Продаж пока нет</p>}
            </Card>
          </Cell>
          <Cell s={6} span={7} wide={4}>
            <Card title="Выручка за 14 дней" i={nx()}
              note={<>{"7 дн. " + fmtM(h.week.sum)}{h.week.delta != null && <span className={cn("ml-1.5 rounded-full px-2 py-0.5 text-[11.5px] font-semibold", h.week.delta >= 0 ? "bg-plus-soft text-plus" : "bg-minus-soft text-minus")}>{(h.week.delta >= 0 ? "+" : "−") + Math.abs(h.week.delta)}%</span>}</>}>
              <WeekChart bars={h.week.bars} />
            </Card>
          </Cell>
        </>}

        {canTab(a, "sales") && <Cell s={6} span={5} wide={5} last>
          <Card title="Последние продажи" action={{ label: "Все продажи", onClick: GO("sales") }} i={nx()}>
            {h.last.length ? (
              <Rows cols="1fr 86px 110px">
                {h.last.slice(0, 5).map((s) => (
                  <Row key={s.id}>
                    <RowName dot={pointColor(d.points, s.point)} title={s.product} sub={`${s.when} · ${s.point}`} />
                    {s.pay ? <Chip tone={s.pay === "QR/Payme" ? "info" : "muted"} className="justify-self-start">{s.pay}</Chip> : <span />}
                    <RowCell right>{fmt(s.sum)}</RowCell>
                  </Row>
                ))}
              </Rows>
            ) : <p className="py-6 text-center text-muted-foreground">Продаж пока нет</p>}
          </Card>
        </Cell>}

        <Cell s={6} span={12} wide={6}>
          <Card title="Разделы" note="по важности" i={nx()}>
            <div className="grid grid-cols-2 gap-2 @min-[640px]/main:grid-cols-3 @min-[1024px]/main:grid-cols-6 @min-[1700px]/main:grid-cols-3">
              {h.sections.filter((s) => canTab(a, s.id)).map((s) => { const n = nav[s.id], I = n.icon; return (
                <button key={s.id} type="button" onClick={GO(s.id)}
                  className="glass-inner relative flex min-w-0 items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[.98]">
                  <span className="grid size-7 shrink-0 place-items-center rounded-[9px]" style={tint(n.color)}><I className="size-4" strokeWidth={1.9} /></span>
                  <span className="min-w-0 flex-1"><b className="block truncate text-[13.5px] font-semibold">{n.label}</b><span className="block truncate text-xs text-muted-foreground max-sm:line-clamp-2 max-sm:whitespace-normal">{s.line}</span></span>
                  {s.badge > 0 && <span className="num grid min-w-5 shrink-0 place-items-center rounded-full bg-minus px-1.5 text-xs leading-5 font-bold text-white">{s.badge}</span>}
                </button>); })}
            </div>
          </Card>
        </Cell>

        {adm && week.rows.length > 0 && <Cell s={6} span={12} wide={5} wideOnly>
          <Card title="Платежи на неделю" action={{ label: "Все платежи", onClick: GO("pay") }} i={nx()}>
            <Rows cols="1fr 110px 120px">
              {week.rows.map((r) => { const late = r.due < today;
                return (<Row key={r.it.id + r.due}>
                  <RowName title={r.it.name} sub={dLongP(r.due) + (late ? " · просрочено" : "")} />
                  <Chip tone={late ? "minus" : "warn"} className="justify-self-start">{late ? "просрочено" : r.due === today ? "сегодня" : "скоро"}</Chip>
                  <RowCell right>{fmt(r.left || r.am.a)}</RowCell>
                </Row>); })}
              <Row bold><span>Нужно{week.more ? ` (ещё ${week.more})` : ""}</span><span /><RowCell right>{fmt(week.sum)}</RowCell></Row>
            </Rows>
          </Card>
        </Cell>}
      </Grid>
    </div>
  );
}
