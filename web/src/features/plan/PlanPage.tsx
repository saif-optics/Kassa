// Раздел «План»: план месяца, темп по дням, недели, точки и продавцы, настройка плана.
import { useMemo, useState } from "react";
import { FileSpreadsheet, Settings2 } from "lucide-react";
import { toast } from "sonner";
import type { Data } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import { PageHead } from "@/components/PageHead";
import { Segments } from "@/components/Segments";
import { Chip, Tile, TileLabel, TileSub, TileValue } from "@/components/Tile";
import { todayTash } from "../kassa/logic";
import { Bar, BigRing, MiniRing, Spark } from "./parts";
import { DaysChart, WeeksTable } from "./Charts";
import { Points } from "./Points";
import { PlanSettings } from "./Settings";
import { fmt, fmtM, monthTitle, pctF, plCls, plColor, plural, planDayBars, planMonth, planMonths, planPeriod, planPoints, planStatus, planWeeks, sumOf, planEnv } from "./logic";

const TONE = { ok: "plus", mid: "warn", bad: "minus" } as const;

export function PlanPage({ d }: { d: Data }) {
  const today = todayTash(), env = useMemo(() => planEnv(d, today), [d, today]);
  const ms = useMemo(() => planMonths(env), [env]);
  const [sel, setSel] = useState(""), month = sel && ms.includes(sel) ? sel : today.slice(0, 7);
  const { K, total, S } = useMemo(() => planMonth(env, month), [env, month]);
  const [open, setOpen] = useState(() => !planMonth(env, today.slice(0, 7)).total); // форма открыта сразу, если план текущего месяца ещё не задан
  const view = useMemo(() => {
    if (!total || !S) return null;
    const { byD, tgt, bars } = planDayBars(env, K, total);
    return { tgt, bars, weeks: planWeeks(env, K, byD, tgt), points: planPoints(env, K, total), pace: K.done.map((x) => sumOf(K.list.filter((s) => s.date === x))) };
  }, [env, K, total, S]);

  const fcol = S ? plColor(K.past ? S.pct : S.fpct) : "";
  const left = K.left.length;
  const toSettings = () => { setOpen(() => true); setTimeout(() => document.getElementById("plan-settings")?.scrollIntoView({ behavior: "smooth" }), 50); };
  // Excel грузится только по нажатию
  const xlsx = async () => {
    if (!view) return;
    try {
      const X = await import("xlsx");
      const wk = X.utils.json_to_sheet(view.weeks.map((w) => ({ "С": w.from, "По": w.to, "Раб. дней": w.wd, "План": Math.round(w.plan), "Факт": w.fut ? null : Math.round(w.fact), "Разница": w.fut ? null : Math.round(w.diff) })));
      const dy = X.utils.json_to_sheet(view.bars.map((b) => ({ "День": b.d, "Выручка": Math.round(b.v), "Выходной": b.off ? "да" : "" })));
      const pt = X.utils.json_to_sheet(view.points.map((r) => ({ "Точка": r.p, "Продавец": r.seller, "План": Math.round(r.pt), "Факт": Math.round(r.f), "Выполнено, %": r.pt ? Math.round(r.st.pct * 100) : null, "Прогноз, %": r.pt ? Math.round(r.st.fpct * 100) : null, "Чеков": r.n, "Средний чек": Math.round(r.avg) })));
      const wb = X.utils.book_new(); X.utils.book_append_sheet(wb, wk, "Недели"); X.utils.book_append_sheet(wb, dy, "Дни"); X.utils.book_append_sheet(wb, pt, "Точки");
      X.writeFile(wb, `План ${month}.xlsx`); toast.success("Файл скачан");
    } catch (e) { toast.error("Не удалось выгрузить: " + String(e)); }
  };

  return (
    <div className="flex flex-col gap-3.5">
      <PageHead eyebrow="Saif-Optics · план продаж" title="План месяца" sub={planPeriod(K, month)}
        actions={<>
          <Button variant="secondary" size="lg" onClick={toSettings}><Settings2 />Настроить план</Button>
          <Button variant="secondary" size="lg" onClick={xlsx} disabled={!view}><FileSpreadsheet />Выгрузить Excel</Button>
        </>} />
      <Segments aria-label="Месяц" items={ms.map((m) => ({ key: m, label: monthTitle(m) }))} value={month} onChange={setSel} />

      {!total || !S || !view ? (
        <Card i={0} title="План не задан"><p className="text-[13.5px] text-muted-foreground">План на {monthTitle(month).split(" ")[0]} не задан — откройте «Настроить план» внизу и впишите сумму.</p></Card>
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3.5">
            <Tile i={0} className="sm:col-span-2">
              <div className="flex items-center gap-4">
                <BigRing p={S.pct} color={fcol} />
                <div className="flex min-w-0 flex-col gap-1.5">
                  <TileLabel>Продано за месяц</TileLabel>
                  <TileValue count={K.fact} className="text-[28px]" />
                  <TileSub>из {fmt(total)} сум · осталось {fmt(S.need)}</TileSub>
                  <div><Chip tone={TONE[plCls(K.past ? S.pct : S.fpct)]}>{planStatus(K, S)}</Chip></div>
                </div>
              </div>
              <div>
                <Bar v={S.pct} mk={K.past || K.future ? null : S.sched / total} color={fcol} />
                {!K.past && !K.future && <TileSub className="mt-2">Черта — где нужно быть сегодня: {fmt(S.sched)} · {S.gap >= 0 ? "впереди на" : "отставание"} {fmt(Math.abs(S.gap))}</TileSub>}
              </div>
            </Tile>
            <Tile i={1} hero>
              <TileLabel>Нужно в день</TileLabel>
              {K.past ? <TileValue>—</TileValue> : S.needDay <= 0 ? <span><Chip tone="plus" className="px-3 py-1 text-[15px]">план выполнен</Chip></span> : <TileValue count={S.needDay} suffix=" сум" />}
              <TileSub>{K.past ? "месяц закрыт" : `на ${left} ${plural(left, "рабочий день", "рабочих дня", "рабочих дней")} до конца`}</TileSub>
            </Tile>
            <Tile i={2}>
              <TileLabel>Нужно в неделю</TileLabel>
              {K.past ? <TileValue>—</TileValue> : <TileValue count={S.needWeek} suffix=" сум" />}
              <TileSub>6 рабочих дней, пн–сб</TileSub>
            </Tile>
            <Tile i={3} className="xl:col-span-2">
              <TileLabel>Текущий темп</TileLabel>
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1"><TileValue count={S.pace} suffix=" сум" />{K.done.length > 1 && <Spark data={view.pace} color="var(--chart-2)" />}</div>
              <TileSub>в рабочий день · {K.done.length} {plural(K.done.length, "день", "дня", "дней")} прошло</TileSub>
            </Tile>
            <Tile i={4} className="sm:col-span-2 xl:col-span-2">
              <TileLabel>Прогноз на конец месяца</TileLabel>
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1"><TileValue count={S.forecast} suffix=" сум" /><MiniRing p={S.fpct} color={fcol} /></div>
              <TileSub>{pctF(S.fpct)} плана · вилка {fmtM(S.fLo)}–{fmtM(S.fHi)}</TileSub>
            </Tile>
          </div>
          <Card i={5} title="Темп по дням" note="выручка дня и план в день">
            <DaysChart bars={view.bars} tgt={view.tgt} need={!K.past && !K.future ? S.needDay : null} />
            <p className="text-[12.5px] text-muted-foreground">Столбик — выручка дня, пунктир — сколько нужно в день по плану. Воскресенье — выходной.</p>
          </Card>
          <Card i={6} title="По неделям" note="пн–сб">
            <WeeksTable weeks={view.weeks} />
            <p className="text-[12.5px] text-muted-foreground">План недели делится по рабочим дням (пн–сб).</p>
          </Card>
          <section className="flex flex-col gap-3">
            <div><h2 className="text-base font-semibold">Точки и продавцы</h2><p className="mt-0.5 text-[13px] text-muted-foreground">План каждой точки, выполнение, прогноз и показатели продавца.</p></div>
            <Points rows={view.points} K={K} points={env.points} i0={7} />
          </section>
        </>
      )}
      <PlanSettings key={month} i={view ? 8 + view.points.length : 1} d={d} env={env} cfg={env.cfg} month={month} K={K} open={open} setOpen={setOpen} />
    </div>
  );
}
