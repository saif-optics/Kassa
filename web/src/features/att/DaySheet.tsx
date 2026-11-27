// Окно «день сотрудника»: все отметки за день с фото-проверкой, процентом совпадения, устройством и местом на карте.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { MapPin, Monitor, Smartphone } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DUR, EASE } from "@/lib/motion";
import { useIsPhone } from "@/lib/useMedia";
import { cn } from "@/lib/utils";
import { Avatar, DotChip } from "@/features/users/common";
import { initials } from "@/features/users/logic";
import { dayLabel, deviceKind, fmtMin, hm, loadPhotos, pct, type AttEvent, type Shift } from "./logic";

type Props = { open: boolean; onClose: () => void; name: string; color: string; point: string; shift: Shift | null; start: string };

export function DaySheet({ open, onClose, name, color, point, shift, start }: Props) {
  const phone = useIsPhone();
  const evs = shift?.evs || [];
  const ids = evs.map((e) => e.id);
  const ph = useQuery({ queryKey: ["att-photo", ids.join(",")], queryFn: () => loadPhotos(ids), enabled: open && ids.length > 0, staleTime: 5 * 60_000 });
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side={phone ? "bottom" : "right"} className={cn("glass gap-0 overflow-y-auto p-0", phone ? "max-h-[92dvh] rounded-t-[24px]" : "sm:max-w-md")}>
        <SheetHeader className="flex-row items-center gap-3 border-b border-border p-4 pr-12">
          <Avatar text={initials(name)} color={color} size={44} />
          <div className="min-w-0"><SheetTitle className="truncate">{name}</SheetTitle><SheetDescription>{shift ? dayLabel(shift.day) : ""} · {point} · начало в {start}{shift && shift.late > 0 ? ` · опоздание ${fmtMin(shift.late)}` : ""}</SheetDescription></div>
        </SheetHeader>
        <div className="flex flex-col gap-2.5 p-4">
          {evs.map((e) => <EventRow key={e.id} e={e} photo={ph.data?.[String(e.id)]} loading={ph.isLoading} />)}
          {!evs.length && <p className="text-[13.5px] text-muted-foreground">Отметок нет.</p>}
          <p className="text-[12px] leading-snug text-muted-foreground">Совпадение лица — насколько камера уверена, что это именно он (чем выше, тем увереннее). Фото снимает киоск в момент отметки.</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function EventRow({ e, photo, loading }: { e: AttEvent; photo?: string; loading: boolean }) {
  const [map, setMap] = useState(false), [big, setBig] = useState(false);
  const p = pct(e.score), dev = deviceKind(e.device), In = e.kind === "in", Dev = dev?.kind === "phone" ? Smartphone : Monitor;
  const la = e.lat != null ? +e.lat : null, ln = e.lng != null ? +e.lng : null;
  return (
    <div className="glass-inner flex flex-col gap-2 rounded-2xl p-3">
      <div className="flex items-center gap-3">
        <button type="button" disabled={!photo} onClick={() => setBig((b) => !b)} aria-label="Увеличить фото" className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
          {photo ? <img src={photo} alt="" className="size-full object-cover" /> : <span className="px-1 text-center text-[10.5px] leading-tight text-muted-foreground">{loading ? "…" : "нет фото"}</span>}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><span className="num text-[17px] font-extrabold">{hm(e.ts)}</span><DotChip color={In ? "var(--plus)" : "var(--chart-2)"}>{In ? "Пришёл" : "Ушёл"}</DotChip></div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12.5px] text-muted-foreground">
            {dev && <span className="flex items-center gap-1"><Dev className="size-3.5" />{dev.label}</span>}
            {la != null && ln != null && <button type="button" onClick={() => setMap((m) => !m)} aria-expanded={map} className="flex items-center gap-1 rounded font-semibold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-primary/40"><MapPin className="size-3.5" />{map ? "скрыть карту" : "на карте"}</button>}
          </div>
        </div>
        {p != null && <DotChip color={p >= 65 ? "var(--plus)" : "var(--warn)"} title="Совпадение лица">{p}%</DotChip>}
      </div>
      <AnimatePresence initial={false}>
        {big && photo && <motion.img key="big" src={photo} alt="Фото отметки" initial={{ height: 0, opacity: 0 }} animate={{ height: 260, opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: DUR.base, ease: EASE.out }} className="w-full rounded-xl object-contain" />}
        {map && la != null && ln != null && (
          <motion.div key="map" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: DUR.base, ease: EASE.out }} className="overflow-hidden">
            <iframe title="Карта" loading="lazy" className="h-48 w-full rounded-xl border-0" src={`https://www.openstreetmap.org/export/embed.html?bbox=${ln - 0.004},${la - 0.0025},${ln + 0.004},${la + 0.0025}&layer=mapnik&marker=${la},${ln}`} />
            <a href={`https://maps.google.com/?q=${la},${ln}`} target="_blank" rel="noopener noreferrer" className="mt-1.5 block text-[12.5px] font-semibold text-primary hover:underline">Открыть в Google Maps · точность ±{Math.round(e.acc || 0)} м</a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
