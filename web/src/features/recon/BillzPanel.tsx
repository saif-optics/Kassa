// «Billz → Касса»: каждый день в 20:00 чеки и остатки Сергели и C1 загружаются сами. Статус, сверка по дням, склад и кнопка «Обновить сейчас».
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import { RowCards, type RowColumn } from "@/components/RowCards";
import { Segments } from "@/components/Segments";
import { Chip } from "@/components/Tile";
import { cn } from "@/lib/utils";
import { useIsPhone } from "@/lib/useMedia";
import type { Data } from "@/lib/types";
import { ord } from "./parts";
import { BZP, bzNext, bzOf, bzRun, bzState, dS, fmt, pl } from "./logic";

type SC = { d: string; billz: number; kassa: number; ok: boolean };
type SD = { n: string; s: string; prev: number; sold: number; exp: number; now: number; d: number; k: string };

export function BillzPanel({ d, i = 0 }: { d: Data; i?: number }) {
  const qc = useQueryClient(), phone = useIsPhone();
  const [p, setP] = useState("Сергели"), [busy, setBusy] = useState<Record<string, boolean>>({});
  const s = bzOf(d, p), st = bzState(d, p), last = s && (s.ok ? s : s.lastOk), b = !!busy[p];
  const sc: SC[] = last?.salesCheck || [], att = last?.attention || [], sk = last?.stock || null, sl = last?.sales || null;
  const run = async () => {
    setBusy((x) => ({ ...x, [p]: true }));
    const r = await bzRun(p);
    setBusy((x) => ({ ...x, [p]: false }));
    if (r && r.ok === false) toast.error(`Billz ${p}: ${r.error}`); else toast.success(`Billz ${p}: загрузка выполнена`);
    qc.invalidateQueries({ queryKey: ["bz"] }); qc.invalidateQueries({ queryKey: ["kassa-data"] });
  };
  const scCols: RowColumn<SC>[] = [
    { key: "d", title: "День", main: true, cell: (x) => dS(x.d) },
    { key: "b", title: "Billz", align: "right", cell: (x) => fmt(x.billz) },
    { key: "k", title: "Касса", align: "right", cell: (x) => fmt(x.kassa) },
    { key: "ok", title: "", sub: true, cell: (x) => (x.ok ? <Chip tone="plus">сходится</Chip> : <Chip tone="minus">{"≠ " + fmt(x.kassa - x.billz)}</Chip>) },
  ];
  const dfCols: RowColumn<SD>[] = [
    { key: "n", title: "Товар", main: true, cell: (x) => x.n },
    { key: "s", title: "Артикул", sub: true, cell: (x) => x.s },
    { key: "pv", title: "Было", align: "right", cell: (x) => fmt(x.prev) },
    { key: "sd", title: "Продано", align: "right", cell: (x) => fmt(x.sold) },
    { key: "ex", title: "Должно", align: "right", cell: (x) => fmt(x.exp) },
    { key: "nw", title: "В Billz", align: "right", cell: (x) => fmt(x.now) },
    { key: "df", title: "Разница", align: "right", cell: (x) => <Chip tone={x.d > 0 ? "plus" : "minus"}>{(x.d > 0 ? "+" : "") + fmt(x.d)}</Chip> },
  ];
  const stTone = st.cls === "ok" ? "plus" : st.cls === "warn" ? "warn" : st.cls === "err" ? "minus" : "info";
  return (
    <Card i={i} title="Billz → Касса" note="автозагрузка в 20:00"
      >
      <p className="text-[12.5px] text-muted-foreground">Каждый день в 20:00 сами загружаются чеки и остатки Сергели и C1. Следующая загрузка {p}: {bzNext(p)}.</p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segments aria-label="Точка" items={Object.keys(BZP).map((k) => ({ key: k, label: <span className="flex items-center"><i className={cn("mr-2 inline-block size-2 rounded-full", { ok: "bg-plus", warn: "bg-warn", err: "bg-minus", wait: "bg-muted-foreground/60" }[bzState(d, k).cls])} />{k}</span> }))} value={p} onChange={setP} />
        <Button disabled={b} onClick={run}><RefreshCw className={cn(b && "animate-spin")} />{b ? "Загружаю…" : "Обновить сейчас"}</Button>
      </div>
      <div><Chip tone={stTone} className="max-w-full whitespace-normal py-1 text-[12.5px]">{st.t}</Chip></div>
      {last && (
        <div className="grid min-w-0 gap-5 lg:grid-cols-[1fr_1.4fr]">
          <div className="min-w-0">
            <b>Продажи</b>
            <p className="text-[13px] text-muted-foreground">{sl && sl.checks ? `добавлено ${sl.checks} ${pl(sl.checks, "чек", "чека", "чеков")}, оплачено ${fmt(sl.sum)} сум` : "новых чеков не было"}{sl?.debts?.length ? ` · долги: ${sl.debts.map((x) => dS(x.d) + " " + fmt(x.debt)).join(", ")}` : ""}</p>
            <div className="mt-2"><RowCards dense columns={scCols} rows={sc.slice(-7).reverse()} rowKey={(x) => x.d} empty="Продаж за неделю нет" /></div>
            <p className="mt-1.5 text-[12.5px] text-muted-foreground">В «Кассе» учитываются продажи вместе с отмеченными долгами.</p>
          </div>
          <div className="min-w-0">
            <b>Склад</b>
            <p className="text-[13px] text-muted-foreground">{sk ? `${fmt(sk.items)} позиций, ${fmt(sk.qty)} шт по Billz` : "—"}{sk?.baseline ? " · первый снимок, сверка начнётся со следующей загрузки" : sk ? ` · расхождений: ${sk.diffCount || 0}` : ""}</p>
            {sk?.diffs?.length ? <>
              <div className="mt-2"><RowCards dense columns={ord(dfCols, "df", phone)} rows={sk.diffs.slice(0, 30).map((x, j) => ({ ...x, k: String(j) }))} rowKey={(x) => x.k} /></div>
              <p className="mt-1.5 text-[12.5px] text-muted-foreground">Плюс — товар пришёл (перемещение, поставка). Минус — ушёл без продажи в Кассе (перемещение, списание, недостача).</p></>
              : sk && !sk.baseline ? <p className="mt-2 text-[13px] text-muted-foreground">Остатки сходятся с продажами ✓</p> : null}
          </div>
        </div>)}
      {att.length > 0 && <div className="rounded-2xl bg-warn-soft px-3 py-2 text-[13px] font-semibold text-warn">Требует внимания: {att.join("; ")}</div>}
    </Card>
  );
}
