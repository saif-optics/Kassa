// Подробности из календаря: задание (описание, комментарии, статус) и событие (описание, удаление) — лист справа или снизу.
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Chip } from "@/components/Tile";
import { useIsPhone } from "@/lib/useMedia";
import { cn } from "@/lib/utils";
import { Details } from "./parts";
import { ScopeChip, type Who } from "./common";
import { dueWords } from "./common";
import { eventWhen } from "./calendar";
import { KINDS, PRI, ST, errMsg, fmtD, type CalEvent, type Task, type TaskComment, type useTaskActions } from "./logic";

type Actions = ReturnType<typeof useTaskActions>;

function Shell({ open, onClose, title, hint, children }: { open: boolean; onClose: () => void; title: string; hint?: string; children: React.ReactNode }) {
  const phone = useIsPhone();
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side={phone ? "bottom" : "right"} className={cn("glass gap-0 overflow-y-auto p-0", phone ? "max-h-[92dvh] rounded-t-[24px]" : "sm:max-w-md")}>
        <SheetHeader className="border-b border-border p-4"><SheetTitle className="[overflow-wrap:anywhere]">{title}</SheetTitle><SheetDescription>{hint || "Подробности"}</SheetDescription></SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}

export function TaskDetail({ t, comments, w, today, act, onClose }: { t: Task | null; comments: TaskComment[]; w: Who; today: string; act: Actions; onClose: () => void }) {
  const dw = t ? dueWords(t, today) : null;
  return (
    <Shell open={!!t} onClose={onClose} title={t?.title || "Задание"} hint={t ? `${PRI[t.priority]} · ${ST[t.status]}` : undefined}>
      {t && (
        <div className="flex flex-col gap-2 p-4 pb-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <ScopeChip s={t} w={w} />
            {t.due && <Chip tone={dw?.over ? "minus" : "muted"}>{dw?.over ? "Просрочено · " : "Срок "}{fmtD(t.due)}{t.due_time ? " " + t.due_time : ""}</Chip>}
            {t.source === "seller" && <Chip tone="warn">от продавца</Chip>}
          </div>
        </div>
      )}
      {t && <div className="px-4 pb-4"><Details t={t} comments={comments} admin={w.me.isAdmin} act={act} /></div>}
    </Shell>
  );
}

export function EventDetail({ e, w, act, onClose }: { e: CalEvent | null; w: Who; act: Actions; onClose: () => void }) {
  const [ask, setAsk] = useState(false), [busy, setBusy] = useState(false);
  const close = () => { setAsk(false); onClose(); };
  const del = async () => { if (!e || busy) return; setBusy(true); try { await act.removeEvent(e.id); toast.success("Событие удалено"); close(); } catch (x) { toast.error(errMsg(x)); } setBusy(false); };
  const range = e ? (e.ends_on && e.ends_on > e.starts_on ? `${fmtD(e.starts_on)} – ${fmtD(e.ends_on)}` : fmtD(e.starts_on)) : "";
  return (
    <Shell open={!!e} onClose={close} title={e?.title || "Событие"} hint={e ? [range, eventWhen(e)].filter(Boolean).join(" · ") : undefined}>
      {e && (
        <div className="flex flex-col gap-3 p-4 text-[13.5px]">
          <div className="flex flex-wrap items-center gap-1.5"><ScopeChip s={e} w={w} />{e.kind && KINDS[e.kind] && <Chip tone="info">{KINDS[e.kind]}</Chip>}</div>
          {e.body ? <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{e.body}</p> : <p className="text-muted-foreground">Без описания</p>}
          {w.me.isAdmin && (!ask ? (
            <Button type="button" variant="ghost" onClick={() => setAsk(true)} className="h-9 rounded-full text-minus hover:text-minus max-sm:w-full sm:self-start"><Trash2 />Удалить</Button>
          ) : (
            <div role="alert" className="flex flex-col gap-2 rounded-xl bg-minus-soft p-3">
              <span className="text-minus">Удалить событие?</span>
              <div className="flex gap-2">
                <Button type="button" variant="destructive" disabled={busy} onClick={del} className="h-9 flex-1 rounded-full sm:flex-none">Удалить</Button>
                <Button type="button" variant="secondary" onClick={() => setAsk(false)} className="h-9 flex-1 rounded-full sm:flex-none">Отмена</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}
