// График «Темп по дням» (Recharts) и таблица «По неделям».
import { Bar as RBar, BarChart, CartesianGrid, Cell, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { RowCards, type RowColumn } from "@/components/RowCards";
import { DUR } from "@/lib/motion";
import { useIsPhone } from "@/lib/useMedia";
import { Bar } from "./parts";
import { dLong, dShort, fmt, fmtM, type DayBar, type WeekRow } from "./logic";

function Tip({ active, payload }: { active?: boolean; payload?: { payload: DayBar }[] }) {
  const b = active && payload?.[0]?.payload; if (!b) return null;
  return <div className="glass rounded-xl px-3 py-2 text-xs"><b>{dLong(b.d)}</b><div className="num mt-0.5">{b.off ? "выходной" : fmt(b.v) + " сум"}</div></div>;
}

export function DaysChart({ bars, tgt, need }: { bars: DayBar[]; tgt: number; need: number | null }) {
  const phone = useIsPhone();
  const top = Math.max(tgt * 1.25, ...bars.map((b) => b.v), 1);
  return (
    <div className="h-[280px] w-full" role="img" aria-label="Выручка по дням и план">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={bars} margin={{ top: 16, right: 6, left: 0, bottom: 0 }} barCategoryGap="22%">
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 4" />
          {bars.filter((b) => b.off).map((b) => <ReferenceArea key={b.d} x1={b.d} x2={b.d} fill="var(--muted)" fillOpacity={0.7} ifOverflow="visible" />)}
          <XAxis dataKey="d" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={phone ? 22 : 10} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(d: string) => String(+d.slice(8))} />
          <YAxis domain={[0, top]} width={phone ? 44 : 56} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v: number) => fmtM(v).replace(" ", " ")} tickCount={5} />
          <Tooltip content={<Tip />} cursor={{ fill: "var(--muted)", opacity: 0.5 }} />
          <ReferenceLine y={tgt} stroke="var(--foreground)" strokeDasharray="5 5" strokeOpacity={0.6} label={{ value: `план в день ${fmtM(tgt)}`, position: "insideTopRight", fontSize: phone ? 10 : 11, fill: "var(--foreground)" }} />
          {need != null && need > tgt && <ReferenceLine y={Math.min(top, need)} stroke="var(--minus)" strokeDasharray="2 4" label={{ value: `нужно теперь ${fmtM(need)}`, position: "insideTopLeft", fontSize: phone ? 10 : 11, fill: "var(--minus)" }} />}
          <RBar dataKey="v" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={DUR.land * 1000}>
            {bars.map((b) => <Cell key={b.d} fill={b.ok ? "var(--plus)" : "var(--primary)"} />)}
          </RBar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WeeksTable({ weeks }: { weeks: WeekRow[] }) {
  const phone = useIsPhone();
  const cols: RowColumn<WeekRow>[] = [
    { key: "w", title: "Неделя", main: true, cell: (w) => <span className="whitespace-nowrap">{dShort(w.from)} — {dShort(w.to)}{w.cur && <span className="ml-1.5 text-[12px] font-medium text-primary">сейчас</span>}</span> },
    { key: "wd", title: "Раб. дней", hideMobile: true, align: phone ? undefined : "right", cell: (w) => w.wd },
    { key: "plan", title: "План", align: phone ? undefined : "right", sub: phone, cell: (w) => (phone ? "план " : "") + fmt(w.plan) },
    { key: "fact", title: "Факт", align: phone ? undefined : "right", sub: phone, cell: (w) => w.fut ? (phone ? "ещё не было" : "—") : (phone ? "факт " : "") + fmt(w.fact) },
    { key: "diff", title: "Разница", align: "right", cell: (w) => <span className={w.fut ? "text-muted-foreground" : w.diff >= 0 ? "text-plus" : "text-minus"}>{w.fut ? "—" : (w.diff >= 0 ? "+" : "") + fmt(w.diff)}</span> },
    { key: "bar", title: "", hideMobile: true, width: "130px", cell: (w) => <Bar v={w.ratio} color={w.plan && w.fact >= w.plan ? "var(--plus)" : "var(--primary)"} h={8} /> },
  ];
  const plan = weeks.reduce((a, w) => a + w.plan, 0), fact = weeks.reduce((a, w) => a + (w.fut ? 0 : w.fact), 0);
  return (
    <RowCards columns={cols} rows={weeks} rowKey={(w) => w.from} dense
      footer={<div className="flex flex-wrap justify-between gap-x-4 gap-y-1 font-semibold"><span>Итого</span><span className="num">план {fmt(plan)} · факт {fmt(fact)}</span></div>} />
  );
}
