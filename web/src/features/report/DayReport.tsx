// «Отчёт оптика»: выгрузка Excel — отдельный лист на каждый день, всех дней или выбранных.
import { useMemo, useState } from "react";
import { CalendarCheck, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Data } from "@/lib/types";
import { Panel } from "@/components/kit";
import { saveBlob } from "./ui";
import { RP_MF, dFull, dShort, monthLabel, pl, rpAllDays, todayTash, wdOf } from "./logic";

export function DayReport({ d }: { d: Data }) {
  const T = todayTash();
  const [pickOpen, setPickOpen] = useState(false), [sel, setSel] = useState<Set<string> | null>(null);
  const [msg, setMsg] = useState<{ t: string; bad?: boolean } | null>(null), [busy, setBusy] = useState(false);
  const all = useMemo(() => rpAllDays(d, T), [d, T]);
  const ms2 = [...new Set(all.map((x) => x.slice(0, 7)))], month = ms2[ms2.length - 1] || "";

  const exportList = async (list: string[], allMode: boolean) => {
    if (!list.length) { setMsg({ t: "Не выбрано ни одного дня.", bad: true }); return; }
    setBusy(true); setMsg({ t: "Собираю файл…" });
    try {
      const { buildOpticDays } = await import("./optic-xlsx"), x = await buildOpticDays(d, list, T);
      saveBlob(`Отчёт оптика ${allMode ? "(все дни) " : ""}${dShort(x.first)}–${dFull(x.last)}.xlsx`, x.buf);
      setMsg({ t: `Файл сохранён: ${x.count} ${pl(x.count, "лист", "листа", "листов")}` });
    } catch (e) { setMsg({ t: e instanceof Error && e.message === "load" ? "Не загрузился модуль Excel. Проверьте интернет и повторите." : "Не удалось собрать файл.", bad: true }); }
    finally { setBusy(false); }
  };
  const picked = sel ?? new Set(all.filter((x) => x.startsWith(month)));

  return (
    <div className="flex flex-col gap-4" id="rs-day-report">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="min-w-[15rem] flex-1 text-[13.5px] text-muted-foreground">Файл «Отчёт оптика»: отдельный лист на каждый день, новые дни сверху, формулы «с начала месяца» и «за месяц» как в вашем файле.</p>
        <div className="flex flex-col items-end gap-1">
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={() => setPickOpen((v) => !v)} aria-expanded={pickOpen}><CalendarCheck />Выбрать дни</Button>
            <Button disabled={!all.length || busy} onClick={() => exportList(all, true)}><Download />Скачать все дни</Button>
          </div>
          <span className="text-[12px] text-muted-foreground">{all.length ? `${ms2.length > 1 ? RP_MF[+ms2[0].slice(5, 7) - 1].toLowerCase() + " – " + RP_MF[+ms2[ms2.length - 1].slice(5, 7) - 1].toLowerCase() + " " + ms2[ms2.length - 1].slice(0, 4) : monthLabel(ms2[0])} · ${all.length} ${pl(all.length, "лист", "листа", "листов")}` : ""}</span>
          <span role="status" className={cn("min-h-4 text-[12.5px]", msg?.bad ? "text-minus" : "text-plus")}>{msg?.t || ""}</span>
        </div>
      </div>

      {pickOpen && (
        <Panel title="Какие дни выгрузить" note="Нажимайте на дни, чтобы включить или убрать их из файла. «С начала месяца» и «за месяц» в файле всё равно считаются по всем дням месяца."
          action={<Button variant="ghost" size="icon" aria-label="Закрыть" onClick={() => setPickOpen(false)}><X /></Button>}>
          <div className="flex flex-col gap-3">
            {[...new Set(all.map((x) => x.slice(0, 7)))].reverse().map((m) => { const ds = all.filter((x) => x.startsWith(m)), on = ds.filter((x) => picked.has(x)).length;
              const setMany = (v: boolean) => { const n = new Set(picked); ds.forEach((x) => (v ? n.add(x) : n.delete(x))); setSel(n); };
              return (
                <div key={m} className="glass-inner rounded-2xl p-3">
                  <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1"><b>{monthLabel(m)}</b><span className="text-[12.5px] text-muted-foreground">{on} из {ds.length}</span><span className="flex-1" />
                    <button type="button" className="text-[12.5px] text-primary" onClick={() => setMany(true)}>весь месяц</button><button type="button" className="text-[12.5px] text-primary" onClick={() => setMany(false)}>убрать месяц</button></div>
                  <div className="flex flex-wrap gap-1.5">{ds.map((x) => (
                    <button key={x} type="button" aria-pressed={picked.has(x)} title={dFull(x)} onClick={() => { const n = new Set(picked); n.has(x) ? n.delete(x) : n.add(x); setSel(n); }}
                      className={cn("flex w-11 flex-col items-center rounded-lg border py-1 transition", picked.has(x) ? "border-primary bg-accent text-accent-foreground" : "border-border opacity-60 hover:opacity-100")}>
                      <b className="num text-[14px] leading-tight">{+x.slice(8)}</b><small className="text-[10px] text-muted-foreground">{wdOf(x)}</small></button>))}</div>
                </div>); })}
            {!all.length && <p className="text-[13px] text-muted-foreground">Дней с продажами пока нет</p>}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[13px]">{picked.size ? <>Выбрано: <b>{picked.size} {pl(picked.size, "день", "дня", "дней")}</b> · в файле будет {picked.size} {pl(picked.size, "лист", "листа", "листов")}</> : "Ничего не выбрано"}</span>
            <div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => setSel(new Set())}>Снять все</Button><Button variant="secondary" onClick={() => setSel(new Set(all))}>Выбрать все</Button>
              <Button disabled={!picked.size || busy} onClick={() => exportList([...picked], false)}><Download />Скачать выбранные</Button></div>
          </div>
        </Panel>
      )}
    </div>
  );
}
