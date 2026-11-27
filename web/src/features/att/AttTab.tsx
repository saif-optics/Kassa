// Мини-раздел «Отметки»: вкладки (Журнал дня, Сводка, Сотрудники, Точки и киоски, Памятка) и действия шапки — дата ‹ › и точка.
import { motion } from "motion/react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Segments } from "@/components/Segments";
import { fade } from "@/lib/motion";
import { Dot, usePointCol } from "@/features/users/common";
import { Journal } from "./Journal";
import { Kiosks } from "./Kiosks";
import { Memo } from "./Memo";
import { Staff } from "./Staff";
import { Summary } from "./Summary";
import { useAttRefs } from "./hooks";
import { addDays, dayLabel, periodOf, shiftPeriod, todayStr } from "./logic";
import { ATT_TABS, type AttNav, type AttTabKey } from "./nav";

const ALL = "__all";

/** выбор точки в шапке */
function PointPick({ nav }: { nav: AttNav }) {
  const refs = useAttRefs(), points = (refs.data?.points || []).map((p) => p.point);
  const col = usePointCol(points);
  return (
    <Select value={nav.pt || ALL} onValueChange={(p) => nav.setPt(p === ALL ? "" : p)}>
      <SelectTrigger aria-label="Точка" className="h-10 min-w-[150px] rounded-full bg-muted/60 px-4 font-semibold"><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value={ALL}><Dot color="var(--chart-5)" />Все точки</SelectItem>{points.map((p) => <SelectItem key={p} value={p}><Dot color={col(p)} />{p}</SelectItem>)}</SelectContent>
    </Select>
  );
}

const navBtn = "h-10 w-10 shrink-0 rounded-full bg-muted/60 p-0";

/** действия шапки для текущей вкладки «Отметок» */
export function AttActions({ nav }: { nav: AttNav }) {
  const { tab, day, setDay, per, setPer } = nav, today = todayStr();
  if (tab === "memo" || tab === "pts") return null;
  if (tab === "emp") return <PointPick nav={nav} />;
  const sum = tab === "sum", p = periodOf(day, per);
  const label = sum ? p.label : dayLabel(day);
  const prev = () => setDay(sum ? shiftPeriod(day, per, -1) : addDays(day, -1));
  const next = () => setDay(sum ? shiftPeriod(day, per, 1) : addDays(day, 1));
  const lock = sum ? p.to >= today : day >= today;
  return (
    <>
      {sum && <Segments items={[{ key: "week", label: "Неделя" }, { key: "month", label: "Месяц" }]} value={per} onChange={(k) => setPer(k as "week" | "month")} aria-label="Период" />}
      <div className="flex items-center gap-1.5">
        <Button type="button" variant="ghost" size="icon" className={navBtn} onClick={prev} aria-label={sum ? "Предыдущий период" : "Предыдущий день"}><ChevronLeft /></Button>
        <label className="relative inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-muted/60 px-4 text-[13.5px] font-semibold whitespace-nowrap focus-within:ring-2 focus-within:ring-primary/50">
          <CalendarDays className="size-4 text-muted-foreground" /><span className="num">{label}</span>
          <input type="date" value={day} max={today} aria-label="Выбрать дату" onChange={(e) => e.target.value && setDay(e.target.value)} onClick={(e) => { try { e.currentTarget.showPicker(); } catch { /* не поддерживается */ } }} className="absolute inset-0 cursor-pointer opacity-0" />
        </label>
        <Button type="button" variant="ghost" size="icon" className={navBtn} onClick={next} disabled={lock} aria-label={sum ? "Следующий период" : "Следующий день"}><ChevronRight /></Button>
      </div>
      <PointPick nav={nav} />
    </>
  );
}

export function AttTab({ nav, live, wide }: { nav: AttNav; live: boolean; wide: boolean }) {
  const { tab, setTab, day, pt, per } = nav;
  return (
    <div className="flex flex-col gap-3.5">
      <Segments items={ATT_TABS} value={tab} onChange={(k) => setTab(k as AttTabKey)} aria-label="Отметки" />
      <motion.div key={tab} {...fade}>
        {tab === "log" && <Journal day={day} pt={pt} live={live} wide={wide} />}
        {tab === "sum" && <Summary day={day} per={per} pt={pt} />}
        {tab === "emp" && <Staff pt={pt} />}
        {tab === "pts" && <Kiosks />}
        {tab === "memo" && <Memo />}
      </motion.div>
    </div>
  );
}
