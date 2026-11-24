// «Файлы кассы для Claude» (список загруженных листов) и «Настройки точек, категорий и плана».
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "motion/react";
import { Card } from "@/components/Card";
import { land } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Field, Note, Pager, digits, fmtIn, usePager } from "./parts";
import { dShort, fmt, type SaleX, type Settings } from "./logic";

interface Photo { id: string; name?: string; kind?: string; point?: string; detectedPoint?: string; date?: string; status?: string; salesCount?: number; uploadedAt?: number }
const KLBL: Record<string, string> = { image: "Фото", pdf: "PDF", excel: "Excel", word: "Word", csv: "CSV", text: "Текст" };

/** список файлов с листами; загрузка файлов на новом сайте не подключена — её делает владелец на рабочем сайте */
export function Photos({ rows, sales, i = 0 }: { rows: Record<string, Record<string, unknown>>; sales: SaleX[]; i?: number }) {
  const list: Photo[] = Object.entries(rows).map(([id, v]) => ({ ...(v as object), id } as Photo)).sort((a, b) => (b.uploadedAt || 0) - (a.uploadedAt || 0));
  const pg = usePager(list.length);
  return (
    <Card title="Файлы кассы для Claude" i={i}>
      <Note>Фото, PDF, Excel, Word или CSV с продажами: Z-отчёт, чеки, тетрадь, выгрузка из Billz. Claude выписывает из них продажи и расходы дня — напишите ему в чат «внеси продажи с файлов».</Note>
      <p className="text-[13px] text-warn">Загружать файлы можно на рабочем сайте (владелец или редактор страницы). Здесь виден список и статус обработки.</p>
      {!list.length ? <p className="text-[13px] text-muted-foreground">Файлов пока нет.</p> : <>
        <ul className="grid gap-1.5">{pg.slice(list).map((p) => {
          const byP: Record<string, number> = {}; sales.filter((x) => x.photo === p.id).forEach((x) => (byP[x.point] = (byP[x.point] || 0) + (+x.sum || 0)));
          const ptSum = Object.entries(byP).map(([k, v]) => k + ": " + fmt(v)).join(" · "), pt = p.point || p.detectedPoint || Object.keys(byP).join(", "), done = p.status === "done";
          return (
            <li key={p.id} className="glass-inner flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl px-3 py-2">
              <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold">{KLBL[p.kind || "image"] || "Файл"}</span>
              <span className="min-w-0 flex-1 basis-48"><b className="text-[13.5px]">{pt || "точку определит Claude"} · {dShort(p.date)}</b> <span className="text-[12.5px] text-muted-foreground">{p.name || ""}{ptSum ? " · " + ptSum : ""}</span></span>
              <span className={cn("rounded-full px-2.5 py-0.5 text-[12px] font-semibold", done ? "bg-plus-soft text-plus" : "bg-warn-soft text-warn")}>{done ? `Внесено${p.salesCount ? ": " + p.salesCount + " прод." : ""}` : "Ждёт Claude"}</span>
            </li>);
        })}</ul>
        <Pager pg={pg} /></>}
    </Card>
  );
}

export function SettingsBox({ settings, onSave, i = 0 }: { settings: Settings; onSave: (v: Settings) => Promise<void>; i?: number }) {
  const [open, setOpen] = useState(false), [pts, setPts] = useState(settings.points.join(", ")), [cats, setCats] = useState(settings.cats.join(", ")), [plan, setPlan] = useState(settings.plan ? fmt(settings.plan) : "");
  const [msg, setMsg] = useState("");
  const save = async () => {
    const p = pts.split(",").map((s) => s.trim()).filter(Boolean), c = cats.split(",").map((s) => s.trim()).filter(Boolean);
    if (!p.length || !c.length) { setMsg("Нужна хотя бы одна точка и одна категория"); return; }
    try { await onSave({ points: [...new Set(p)], cats: [...new Set(c)], plan: digits(plan) || 0 }); setMsg("Сохранено"); } catch { setMsg("Не удалось сохранить"); }
    setTimeout(() => setMsg(""), 4000);
  };
  return (
    <motion.section {...land(i)} className="glass min-w-0 rounded-[24px] p-4 sm:p-[18px]">
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2 text-left text-[17px] font-semibold tracking-tight"><ChevronRight className={cn("size-4 transition-transform", open && "rotate-90")} />Настройки точек, категорий и плана</button>
      {open && <div className="mt-4 grid gap-3">
        <Field label="Точки (через запятую)"><Input value={pts} onChange={(e) => setPts(e.target.value)} aria-label="Точки" /></Field>
        <Field label="Категории товаров (через запятую)"><Input value={cats} onChange={(e) => setCats(e.target.value)} aria-label="Категории" /></Field>
        <Field label="План выручки на месяц, сум" className="sm:max-w-xs"><Input inputMode="numeric" value={plan} onChange={(e) => setPlan(fmtIn(e.target.value, fmt))} placeholder="не задан" aria-label="План выручки" className="num" /></Field>
        <div className="flex items-center gap-3"><Button type="button" onClick={save} className="max-sm:h-11 max-sm:w-full">Сохранить настройки</Button><span role="status" className="text-[13px] text-muted-foreground">{msg}</span></div>
      </div>}
    </motion.section>
  );
}
