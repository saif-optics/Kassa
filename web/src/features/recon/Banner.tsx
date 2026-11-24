// Баннеры раздела «Сверка»: «в подготовке» (стеклянная вставка вместо старых Wip/PrepBanner).
import { Clock } from "lucide-react";

export function Banner({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="glass-inner flex items-start gap-3 rounded-2xl p-3.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-warn-soft text-warn"><Clock className="size-4" /></span>
      <div className="flex min-w-0 flex-col text-[13px] text-muted-foreground">{title && <b className="text-foreground">{title}</b>}<span>{children}</span></div>
    </div>
  );
}
