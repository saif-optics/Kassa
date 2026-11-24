// Настройка платежей: общие суммы, дни, откуда платим, вкл/выкл — меняются прямо в строке.
import { Ellipsis, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/Card";
import { Segments } from "@/components/Segments";
import { RowCards, type RowColumn } from "@/components/RowCards";
import { InlineNumber, InlineText } from "@/components/Inline";
import { useIsPhone } from "@/lib/useMedia";
import { cn } from "@/lib/utils";
import type { Data, PayItem } from "@/lib/types";
import { KINDS, MNg, SRC, isOn, list } from "./logic";
import { CatIcon } from "./parts";

type Props = { d: Data; tab: PayItem["kind"]; setTab: (k: PayItem["kind"]) => void; onChange: (it: PayItem, patch: Partial<PayItem>) => void; onEdit: (id: string) => void; onAdd: (k: PayItem["kind"]) => void; i: number };

// поля внутри строки не должны раскрывать карточку
const Stop = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn("contents", className)} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>{children}</span>
);

export function Settings({ d, tab, setTab, onChange, onEdit, onAdd, i }: Props) {
  const phone = useIsPhone();
  const L = list(d).filter((it) => it.kind === tab).sort((a, b) => Number(a.on === false) - Number(b.on === false) || (a.kind === "plan" ? String(a.date).localeCompare(String(b.date)) : (a.day || 1) - (b.day || 1)));
  const cnt = (k: string) => list(d).filter((it) => it.kind === k).length;
  const cols: RowColumn<PayItem>[] = [
    { key: "name", title: "Платёж", main: true, cell: (it) => <Stop><span className={cn("flex min-w-0 items-center gap-2", !isOn(it) && "opacity-55")}><CatIcon cat={it.cat} size="sm" /><InlineText value={it.name} label="Название" onSave={(name) => onChange(it, { name })} /></span></Stop> },
    { key: "sum", title: tab === "debt" ? "Платёж в месяц" : "Сумма", align: phone ? undefined : "right", sub: phone, cell: (it) => {
      const usd = +(it.usd || 0) > 0, tax = it.auto === "tax";
      return <Stop><span className="flex items-center justify-end gap-1 text-[13px] font-normal whitespace-nowrap text-muted-foreground">
        {tax ? <><InlineNumber raw value={it.pct || 0} label="Процент" onSave={(v) => { if (v != null) onChange(it, { pct: v }); }} className="max-w-16" />% безнала</>
          : usd ? <><InlineNumber value={it.usd} label="Доллары" onSave={(v) => { if (v != null) onChange(it, { usd: v }); }} className="max-w-20" />$ ×<InlineNumber value={it.rate} label="Курс" onSave={(v) => { if (v != null) onChange(it, { rate: v }); }} className="max-w-24" /></>
          : <InlineNumber value={tab === "debt" ? it.amount || null : it.amount} placeholder={tab === "debt" ? "без графика" : "0"} label="Сумма" onSave={(v) => onChange(it, { amount: v ?? 0 })} />}
      </span></Stop>;
    } },
    { key: "day", title: tab === "plan" ? "Дата" : "День", sub: true, cell: (it) => <Stop><span className="inline-flex items-center gap-1">
      {tab === "plan" ? <input type="date" aria-label="Дата" value={it.date || ""} onChange={(e) => e.target.value && onChange(it, { date: e.target.value })} className="rounded-lg border border-transparent bg-transparent px-2 py-1 hover:border-border focus:border-primary focus:outline-none" />
        : <><InlineNumber raw value={it.day || 1} label="День месяца" onSave={(v) => { if (v != null) onChange(it, { day: Math.min(31, Math.max(1, Math.round(v))) }); }} className="max-w-12 text-center" />{it.freq === "year" ? MNg[(it.mon || 1) - 1] : "-го"}</>}
    </span></Stop> },
    { key: "src", title: "Откуда платим", cell: (it) => <Stop><Select value={it.src} onValueChange={(v) => onChange(it, { src: v as PayItem["src"] })}><SelectTrigger size="sm" className="w-28" aria-label="Откуда платим"><SelectValue /></SelectTrigger>
      <SelectContent>{Object.entries(SRC).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select></Stop> },
    { key: "on", title: "Действует", width: "70px", cell: (it) => <Stop><Switch checked={isOn(it)} onCheckedChange={(on) => onChange(it, { on })} aria-label="Платёж действует" /></Stop> },
    { key: "edit", title: phone ? "Остальное" : "", width: "52px", cell: (it) => <Stop><Button variant={phone ? "outline" : "ghost"} size={phone ? "default" : "icon-sm"} className="max-sm:w-full" onClick={() => onEdit(it.id)} aria-label="Все настройки"><Ellipsis />{phone && "Все настройки"}</Button></Stop> },
  ];
  return (
    <Card i={i} title="Настройка платежей" note="правка прямо в строке">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Segments aria-label="Вид платежей" items={KINDS.map(([k, l]) => ({ key: k, label: l, badge: cnt(k) }))} value={tab} onChange={(k) => setTab(k as PayItem["kind"])} />
        <Button className="max-sm:w-full" onClick={() => onAdd(tab)}><Plus />Добавить</Button>
      </div>
      <RowCards columns={cols} rows={L} rowKey={(it) => it.id} empty="Пока пусто." dense />
    </Card>
  );
}
