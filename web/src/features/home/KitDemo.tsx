// Демонстрация общих компонентов (Segments, RowCards, FilterBar). Только при ?demo#kit, в меню не входит.
import { useState } from "react";
import { Segments } from "@/components/Segments";
import { RowCards, type RowColumn } from "@/components/RowCards";
import { FilterBar } from "@/components/FilterSheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MONTHS = ["Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь"].map((label, i) => ({ key: String(i), label, badge: i === 5 ? 3 : undefined }));
const POINTS = ["Все точки", "Центр", "Север", "Юг"], PAYS = ["Все способы", "Наличные", "Терминал", "QR/Payme"];
type Row = { id: string; date: string; point: string; name: string; sum: number; pay: string; note: string };
const NAMES = ["Оправа женская", "Линзы месячные", "Очки солнцезащитные", "Футляр", "Раствор для линз"];
const ROWS: Row[] = Array.from({ length: 15 }, (_, i) => ({
  id: "r" + i, date: `${String(24 - (i % 9)).padStart(2, "0")}.11`, point: POINTS[1 + (i % 3)], name: NAMES[i % NAMES.length],
  sum: 40000 + ((i * 7919) % 90) * 1000, pay: PAYS[1 + (i % 3)], note: i % 2 ? "Комментарий к продаже" : "",
}));
const fmt = (n: number) => n.toLocaleString("ru-RU").replace(/ /g, " ");

const COLS: RowColumn<Row>[] = [
  { key: "date", title: "Дата", cell: (r) => r.date, sub: true },
  { key: "point", title: "Точка", cell: (r) => r.point, sub: true },
  { key: "name", title: "Название", cell: (r) => r.name, main: true },
  { key: "sum", title: "Сумма", cell: (r) => fmt(r.sum), align: "right" },
  { key: "pay", title: "Оплата", cell: (r) => r.pay },
];

function Pick({ label, value, onChange, items }: { label: string; value: string; onChange: (v: string) => void; items: string[] }) {
  return (
    <label className="flex flex-col gap-1 text-[12px] text-muted-foreground">{label}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-10 w-full min-w-40 rounded-full bg-background"><SelectValue /></SelectTrigger>
        <SelectContent>{items.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
      </Select>
    </label>
  );
}

export function KitDemo() {
  const [m, setM] = useState("5"), [pt, setPt] = useState(POINTS[0]), [pay, setPay] = useState(PAYS[0]), [kind, setKind] = useState("a");
  const rows = ROWS.filter((r) => (pt === POINTS[0] || r.point === pt) && (pay === PAYS[0] || r.pay === pay));
  const count = (pt !== POINTS[0] ? 1 : 0) + (pay !== PAYS[0] ? 1 : 0);
  return (
    <div className="grid gap-5">
      <h1 className="text-[22px] font-bold">Общие компоненты</h1>
      <Segments aria-label="Месяц" items={MONTHS} value={m} onChange={setM} />
      <Segments aria-label="Вид" size="sm" items={[{ key: "a", label: "Все" }, { key: "b", label: "Приход" }, { key: "c", label: "Расход" }]} value={kind} onChange={setKind} />
      <FilterBar summary={`01.11 — 24.11 · ${pt}`} count={count}>
        <Pick label="Период" value="Ноябрь" onChange={() => {}} items={["Ноябрь"]} />
        <Pick label="Точка" value={pt} onChange={setPt} items={POINTS} />
        <Pick label="Оплата" value={pay} onChange={setPay} items={PAYS} />
      </FilterBar>
      <div className="glass rounded-3xl p-3 sm:p-4">
        <RowCards columns={COLS} rows={rows} rowKey={(r) => r.id} stickyHead
          expand={(r) => <span>{r.note || "Без комментария"} · чек {r.id.slice(1).padStart(4, "0")}</span>}
          footer={<span className="text-muted-foreground">Строк: {rows.length}</span>} empty="Ничего не найдено" />
      </div>
    </div>
  );
}
