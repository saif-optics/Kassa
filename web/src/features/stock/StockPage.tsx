// «Склад»: остатки Billz и перемещения (stock-billz) + склад из файла (stock-margin).
import { useMemo, useRef, useState } from "react";
import { FileSpreadsheet, RefreshCw, Upload } from "lucide-react";
import { toast } from "sonner";
import { PageHead } from "@/components/PageHead";
import { Segments } from "@/components/Segments";
import { Chip } from "@/components/Tile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Data } from "@/lib/types";
import { Wip } from "../report/parts";
import { BzStock, BzTransfers, bzView, useBzRefresh, type Exp } from "../stock-billz/BzStockView";
import { StockFile } from "../stock-margin/StockFile";
import { makeCtx } from "../analytics/cost";
import { stockSheets } from "../analytics/exports";
import { saveXlsx } from "../analytics/xl";
import { dLong, fmt } from "../analytics/util";

type View = "st" | "tr" | "file";
const VIEWS = [{ key: "st", label: "Остатки Billz" }, { key: "tr", label: "Перемещения" }, { key: "file", label: "Склад из файла" }];
const LS = "kassa-web.stock.view";

export function StockPage({ d }: { d: Data }) {
  const c = useMemo(() => makeCtx(d), [d]), meta = c.stockMeta;
  const [view, setViewS] = useState<View>(() => { try { return localStorage.getItem(LS) === "file" ? "file" : bzView.get(); } catch { return "st"; } });
  const setView = (v: string) => { setViewS(v as View); try { localStorage.setItem(LS, v); } catch { /* нет хранилища */ } if (v !== "file") bzView.set(v); };
  const reg = useRef<Exp>(null), pick = useRef<(() => void) | null>(null); // выгрузка открытого вида Billz и выбор файла склада
  const { busy, cs, refresh } = useBzRefresh(d);
  const xlsx = async () => {
    try {
      const sh = stockSheets(c); if (!sh) { toast.error("Склад ещё не загружен."); return; }
      await saveXlsx(sh, "sklad_" + (meta?.date || "") + ".xlsx"); toast.success("Файл скачан");
    } catch (e) { toast.error("Не удалось выгрузить: " + String(e)); }
  };
  const bzXlsx = () => (reg.current ? reg.current() : Promise.reject(new Error("нечего выгружать"))).then(() => toast.success("Файл скачан")).catch((e) => toast.error("Не удалось выгрузить: " + String(e)));
  const file = view === "file";
  return (
    <div className="flex flex-col gap-3.5">
      <PageHead eyebrow={file ? "Saif-Optics · товары и цены покупки" : "Saif-Optics · данные Billz"} title="Склад"
        sub={file ? (meta ? `Загружен ${dLong(meta.date)} из «${meta.file || "файла"}»: ${fmt(c.stockItems.length)} позиций` : "Склад ещё не загружен") : "Что лежит на складе и точках по Billz, что продали, привезли и увезли"}
        actions={file ? <>
          <Button variant="secondary" size="lg" onClick={() => pick.current?.()}><Upload />Загрузить файл</Button>
          <Button variant="secondary" size="lg" onClick={xlsx}><FileSpreadsheet />Выгрузить Excel</Button></> : <>
          <Button variant="secondary" size="lg" disabled={busy} onClick={refresh}><RefreshCw className={cn(busy && "animate-spin")} />{busy ? "Загружаю из Billz…" : "Обновить из Billz"}</Button>
          <Button variant="secondary" size="lg" onClick={bzXlsx}><FileSpreadsheet />Выгрузить Excel</Button></>} />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Segments aria-label="Вид" items={VIEWS} value={view} onChange={setView} />
        {!file && <span className="flex min-w-0 flex-wrap items-center gap-2 text-[12.5px] text-muted-foreground"><Chip tone={cs.cls === "err" ? "minus" : cs.cls === "ok" ? "plus" : "warn"}>{cs.t}</Chip>{cs.last}</span>}
      </div>
      {!file && <Wip>Полностью заработает после инвентаризации Премиума и Яшнабада. Сейчас считаются остатки Склада, Сергели и C1.</Wip>}
      {view === "st" && <BzStock reg={reg} />}
      {view === "tr" && <BzTransfers reg={reg} />}
      {file && <StockFile c={c} pick={pick} />}
    </div>
  );
}
