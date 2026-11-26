// «Фискальные модули ↔ Касса»: сколько нала и безнала пробито через модули и сходится ли это с продажами Кассы.
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import { RowCards, type RowColumn } from "@/components/RowCards";
import { Chip, Tile, TileLabel, TileSub, TileValue, type ChipTone } from "@/components/Tile";
import { useIsPhone } from "@/lib/useMedia";
import type { Data } from "@/lib/types";
import { fmAnyOn, fmMod, fmReconRows, type FmStatus } from "../report/logic";
import { saveBook, usePaging } from "../report/ui";
import { pointColor } from "../analytics/base";
import { Banner } from "./Banner";
import { Controls, type Filters } from "./Controls";
import { Dot, dash, ord } from "./parts";
import { dL, dS, fmt, pl, sgn, wd } from "./logic";

const ST: Record<FmStatus, [ChipTone, string]> = { ok: ["plus", "Сходится"], short: ["minus", "Не пробито"], over: ["warn", "В ФМ больше"], nofm: ["warn", "Нет отчёта ФМ"], off: ["muted", "Модуль не подключён"] };

export async function fmRcExport(d: Data, F: Filters) {
  const rows = fmReconRows(d, F.f, F.t, F.pt);
  await saveBook(`Сверка фискальных модулей ${F.f}—${F.t}`, [["Сверка ФМ", rows.map((o) => ({ "День": o.d, "Точка": o.p, "Нал Касса": o.k.c, "Нал ФМ": o.x ? o.x.c : null, "Разница нал": o.dc, "Безнал Касса": o.k.n, "Безнал ФМ": o.x ? o.x.n : null, "Разница безнал": o.dn, "Статус": ST[o.st][1] }))]]);
}

/** перейти в «Отчёт р/с → Фискальные модули» на нужный день и точку */
function jump(day: string, p: string, on: boolean) {
  try { localStorage.setItem("kassa-web.report.view", "fm"); sessionStorage.setItem("kassa-web.report.go", JSON.stringify({ d: day, p, edit: on ? "day" : "mod" })); } catch { /* нет хранилища */ }
  location.hash = "report"; window.scrollTo({ top: 0, behavior: "smooth" });
}

type FmRow = ReturnType<typeof fmReconRows>[number];

export function FmRecon({ d, F }: { d: Data; F: Filters }) {
  const phone = useIsPhone();
  const rows = fmReconRows(d, F.f, F.t, F.pt), bad = rows.filter((o) => o.st !== "ok" && o.st !== "off"), list = F.only ? bad : rows;
  const A = { kc: 0, kn: 0, fc: 0, fn: 0 }; rows.forEach((o) => { if (!o.on) return; A.kc += o.k.c; A.kn += o.k.n; if (o.x) { A.fc += o.x.c; A.fn += o.x.n; } });
  const dc = A.fc - A.kc, dn = A.fn - A.kn, pg = usePaging(list.length, "recon-fm", -1, F.f + F.t + F.pt + F.only);
  let k = 0; const nx = () => Math.min(k++, 8); // сквозной номер посадки сверху вниз
  const dch = (v: number) => <Chip tone={Math.abs(v) < 1 ? "plus" : "minus"}>{"разница " + sgn(v)}</Chip>;
  const dcell = (v: number | null) => (v == null ? dash : Math.abs(v) < 1 ? <span className="text-plus">0</span> : <Chip tone="minus">{sgn(v)}</Chip>);
  const cell = (v: number | undefined, miss: boolean) => (miss ? dash : fmt(v || 0));
  const tn = (o: FmRow) => (o.st === "short" ? ("minus" as const) : o.st === "nofm" || o.st === "over" ? ("warn" as const) : undefined);
  const cols: RowColumn<FmRow>[] = [
    { key: "d", title: "День", main: true, cell: (o) => <><Dot tone={tn(o)} />{dS(o.d)} <span className="ml-1 text-[12px] font-normal text-muted-foreground">{wd(o.d)}</span></> },
    { key: "p", title: "Точка", sub: true, cell: (o) => <><span className="mr-1.5 inline-block size-2 rounded-full align-middle" style={{ background: pointColor(d.points, o.p) }} />{o.p}</> },
    { key: "st", title: "Статус", sub: true, cell: (o) => <Chip tone={ST[o.st][0]}>{ST[o.st][1]}</Chip> },
    { key: "kc", title: "Нал · Касса", align: "right", cell: (o) => fmt(o.k.c) },
    { key: "xc", title: "Нал · ФМ", align: "right", cell: (o) => cell(o.x?.c, !o.x) },
    { key: "dc", title: "Разница нал", align: "right", cell: (o) => dcell(o.dc) },
    { key: "kn", title: "Безнал · Касса", align: "right", cell: (o) => fmt(o.k.n) },
    { key: "xn", title: "Безнал · ФМ", align: "right", cell: (o) => cell(o.x?.n, !o.x) },
    { key: "dn", title: "Разница безнал", align: "right", cell: (o) => dcell(o.dn) },
  ];
  // на телефоне справа в шапке — общая разница по нал и безнал (если модуль внёс гросс)
  if (phone) cols.splice(3, 0, { key: "dt", title: "Разница", align: "right", cell: (o) => (o.dc == null || o.dn == null ? dash : dcell(o.dc + o.dn)) });
  return (
    <>
      {!fmAnyOn(d) && <Banner title="Раздел в подготовке">Фискальные модули пока не подключены, цифры не считаются. Когда подключим выгрузку из Rahmat, модуль точки включается в карточке → «Данные модуля» → «Модуль работает».</Banner>}
      <Controls F={F} points={d.points} />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3.5">
        <Tile i={nx()} hero><TileLabel>Нал · Касса</TileLabel><TileValue count={A.kc} suffix=" сум" /><TileSub>{"ФМ " + fmt(A.fc)}{dch(dc)}</TileSub></Tile>
        <Tile i={nx()}><TileLabel>Безнал · Касса</TileLabel><TileValue count={A.kn} suffix=" сум" /><TileSub>{"ФМ " + fmt(A.fn)}{dch(dn)}</TileSub></Tile>
        <Tile i={nx()}><TileLabel>Не пробито через ФМ</TileLabel><TileValue count={Math.max(0, -dc) + Math.max(0, -dn)} suffix=" сум" /><TileSub>{`нал ${fmt(Math.max(0, -dc))} · безнал ${fmt(Math.max(0, -dn))}`}</TileSub></Tile>
        <Tile i={nx()}><TileLabel>Дни с расхождением</TileLabel><TileValue count={bad.length} /><TileSub>{bad.length ? <Chip tone="minus">смотрите в таблице</Chip> : <Chip tone="plus">всё сходится</Chip>}</TileSub></Tile>
      </div>
      <Card i={nx()} title="По дням и точкам" note="нажмите строку">
        <p className="text-[12.5px] text-muted-foreground">Касса: нал — «Наличные», безнал — терминал и QR. Перечисления на р/с в сверку не входят. Нажмите строку, чтобы увидеть продажи Кассы за день рядом с цифрами модуля. Точка перед датой — красная, если не пробито; оранжевая, если нет отчёта ФМ или в ФМ больше.</p>
        <RowCards columns={ord(cols, "dt", phone)} rows={list.slice(pg.from, pg.to)} rowKey={(o) => o.d + "|" + o.p} rowClass={(o) => (o.st !== "ok" && o.st !== "off" ? "bg-minus-soft/40" : undefined)} empty={F.only ? "Расхождений нет" : "Продаж за период нет"} expand={(o) => <Det d={d} o={o} />}
          footer={list.length ? <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-semibold"><span>Итого по включённым модулям</span>
            <span className="num flex flex-wrap gap-x-4"><span><span className="font-normal text-muted-foreground">Нал, разница </span>{sgn(dc)}</span><span><span className="font-normal text-muted-foreground">Безнал, разница </span>{sgn(dn)}</span></span></div> : undefined} />
        {pg.bar}
      </Card>
    </>
  );
}

function Det({ d, o }: { d: Data; o: FmRow }) {
  const by: Record<string, { s: (typeof o.k.rows)[number]; v: number }[]> = {};
  o.k.rows.forEach((s) => { const parts: [string, number][] = s.pay === "Смешанная" && s.pays ? Object.entries(s.pays) : [[s.pay, +s.sum || 0]]; parts.forEach(([pay, v]) => { (by[pay] ||= []).push({ s, v: +v || 0 }); }); });
  const m = fmMod(d, o.p), x = o.x;
  return (
    <div className="grid min-w-0 items-start gap-5 md:grid-cols-2">
      <div><h3 className="mb-2 text-[14.5px] font-semibold">Касса · {o.p} · {dL(o.d)}</h3>
        {Object.entries(by).map(([pay, L]) => (
          <div key={pay} className="mb-2"><h4 className="text-[13px] font-semibold">{pay} <span className="font-normal text-muted-foreground">{L.length} {pl(L.length, "запись", "записи", "записей")} · {fmt(L.reduce((a, b) => a + b.v, 0))}</span></h4>
            {L.map(({ s, v }, i) => <div key={i} className="flex justify-between gap-3 py-0.5 text-[13px]"><span>{s.check ? <span className="text-muted-foreground">чек {s.check} </span> : null}{s.product || s.cat || ""}</span><b className="num font-medium">{fmt(v)}</b></div>)}</div>))}
        {!o.k.rows.length && <p className="text-[13px] text-muted-foreground">Продаж в Кассе нет.</p>}</div>
      <div><h3 className="mb-2 text-[14.5px] font-semibold">Фискальный модуль{m?.fm ? <span className="font-normal text-muted-foreground"> · {m.fm}</span> : null}</h3>
        {!o.on ? <p className="text-[13px] text-muted-foreground">Для этой точки модуль не подключён — добавьте его в «Отчёт р/с → Фискальные модули».</p>
          : x ? <>{([["Нал", fmt(x.c)], ["Безнал", fmt(x.n)], ["Чеков", x.k ? String(x.k) : "—"]] as const).map(([l, v]) => <div key={l} className="flex justify-between py-0.5 text-[13px]"><span>{l}</span><b className="num font-medium">{v}</b></div>)}</>
            : <p className="text-[13px] text-muted-foreground">Гросс за этот день ещё не внесён.</p>}
        <Button variant="secondary" className="mt-3 max-w-full whitespace-normal" onClick={() => jump(o.d, o.p, o.on)}>{x ? "Открыть день" : "Внести гросс"} в «Фискальных модулях»</Button></div>
    </div>
  );
}
