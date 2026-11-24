// Элементы Аналитики на общих компонентах: плитки показателей (крупные и компактные), панель графика с пояснением.
import { useState } from "react";
import { Card } from "@/components/Card";
import { Tile, TileLabel, TileSub, TileValue } from "@/components/Tile";
import { cn } from "@/lib/utils";
import type { Card as MCard } from "./base";
import { MiniRing, Spark } from "./charts";
import { hintOf } from "./parts";

const tone = (d: string) => (d.startsWith("▲") ? "text-plus" : d.startsWith("▼") ? "text-minus" : "");

/** пояснение: всегда показано или по нажатию, если «Пояснения» выключены */
function useHint(title: string, hintsOn: boolean) {
  const [open, setOpen] = useState(false), h = hintOf(title);
  return { h, show: !!h && (hintsOn || open), toggle: !hintsOn && h ? () => setOpen((x) => !x) : undefined };
}

/** крупная плитка показателя; hero — только у главной (выручка) */
export function MetricTile({ c, i, hintsOn }: { c: MCard; i: number; hintsOn: boolean }) {
  const { h, show, toggle } = useHint(c.label, hintsOn), hero = !!c.main;
  return (
    <Tile i={i} hero={hero} warn={c.warn} className={cn(toggle && "cursor-pointer")}>
      <div onClick={toggle} role={toggle ? "button" : undefined} className="flex min-w-0 flex-col gap-1.5">
        <TileLabel>{c.label}</TileLabel>
        {show && <p className={cn("text-[12px] leading-snug", hero ? "text-white/85" : "text-muted-foreground")}>{h}</p>}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <TileValue className={cn(c.warn && "text-warn")}>{c.v}</TileValue>
          {c.spark ? <Spark vals={c.spark.vals} color={c.spark.color} light={hero} /> : c.ring ? <MiniRing p={c.ring.p} color={c.ring.color} light={hero} /> : null}
        </div>
      </div>
      <TileSub className={cn(!hero && tone(c.d))}>{c.d || " "}</TileSub>
    </Tile>
  );
}

/** компактная плитка внутри группы */
export function MiniTile({ c, hintsOn }: { c: MCard; hintsOn: boolean }) {
  const { h, show, toggle } = useHint(c.label, hintsOn);
  return (
    <div onClick={toggle} role={toggle ? "button" : undefined} className={cn("glass-inner flex min-w-0 flex-col gap-1 rounded-2xl p-3", c.warn && "ring-1 ring-warn/50", toggle && "cursor-pointer")}>
      <span className="text-[11px] font-semibold tracking-[.08em] text-muted-foreground uppercase">{c.label}</span>
      {show && <p className="text-[12px] leading-snug text-muted-foreground">{h}</p>}
      <div className="flex items-center justify-between gap-2">
        <span className={cn("num min-w-0 text-[18px] leading-tight font-bold tracking-[-0.01em] break-words", c.warn && "text-warn")}>{c.v}</span>
        {c.spark ? <Spark vals={c.spark.vals} color={c.spark.color} /> : c.ring ? <MiniRing p={c.ring.p} color={c.ring.color} /> : null}
      </div>
      <span className={cn("text-[12px] leading-snug text-muted-foreground", tone(c.d))}>{c.d || " "}</span>
    </div>
  );
}

/** панель графика: короткий заголовок, пояснение и заметка — абзацем в теле */
export function Panel({ title, note, i, hintsOn, className, children }: { title: string; note?: string; i: number; hintsOn: boolean; className?: string; children: React.ReactNode }) {
  const { h, show, toggle } = useHint(title, hintsOn);
  const showNote = note && !(h && hintsOn && !/\d/.test(note));
  return (
    <Card title={title} i={i} className={className} action={toggle ? { label: "Что это?", onClick: toggle } : undefined}>
      {show && <p className="max-w-[72ch] text-[13px] leading-snug text-muted-foreground">{h}</p>}
      {showNote && <p className="text-[13px] leading-snug text-muted-foreground">{note}</p>}
      <div className="min-w-0">{children}</div>
    </Card>
  );
}
