// «Склад»: остатки Billz и перемещения (stock-billz) + склад из файла (stock-margin).
import { useMemo } from "react";
import { FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Data } from "@/lib/types";
import { BzStockView } from "../stock-billz/BzStockView";
import { StockFile } from "../stock-margin/StockFile";
import { makeCtx } from "../analytics/cost";
import { stockSheets } from "../analytics/exports";
import { saveXlsx } from "../analytics/xl";
import { dLong, fmt } from "../analytics/util";

export function StockPage({ d }: { d: Data }) {
  const c = useMemo(() => makeCtx(d), [d]), meta = c.stockMeta;
  const xlsx = async () => {
    try {
      const sh = stockSheets(c); if (!sh) { toast.error("Склад ещё не загружен."); return; }
      await saveXlsx(sh, "sklad_" + (meta?.date || "") + ".xlsx"); toast.success("Файл скачан");
    } catch (e) { toast.error("Не удалось выгрузить: " + String(e)); }
  };
  return (
    <div className="flex flex-col gap-5">
      <BzStockView d={d} />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Saif-Optics · товары и цены покупки</div>
          <h2 className="text-[28px] leading-tight font-bold tracking-tight">Склад из файла</h2>
          <p className="text-[14px] text-muted-foreground">{meta ? `Склад загружен ${dLong(meta.date)} из «${meta.file || "файла"}»: ${fmt(c.stockItems.length)} позиций` : "Склад ещё не загружен"}</p>
        </div>
        <Button variant="secondary" size="lg" onClick={xlsx}><FileSpreadsheet />Выгрузить Excel</Button>
      </header>
      <StockFile c={c} />
    </div>
  );
}
