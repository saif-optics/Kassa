// Фильтры: на компьютере — обычная строка, на телефоне — одна кнопка «Фильтры» и выдвижной лист снизу.
import { useState, type ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useIsPhone } from "@/lib/useMedia";

export function FilterBar({ summary, children, count }: { summary: ReactNode; children: ReactNode; count?: number }) {
  const phone = useIsPhone();
  const [open, setOpen] = useState(false);
  if (!phone) return <div className="flex flex-wrap items-end gap-3">{children}</div>;
  return (
    <>
      <div className="flex items-center gap-3">
        <Button type="button" variant="secondary" className="h-10 shrink-0 gap-2 rounded-full px-4" onClick={() => setOpen(true)}>
          <SlidersHorizontal className="size-4" />Фильтры
          {!!count && <span className="num rounded-full bg-primary px-1.5 text-[11px] leading-[18px] font-semibold text-primary-foreground">{count}</span>}
        </Button>
        <span className="min-w-0 flex-1 line-clamp-2 text-right text-[12.5px] text-muted-foreground">{summary}</span>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" showCloseButton={false} className="max-h-[85dvh] gap-0 rounded-t-[28px] p-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <SheetTitle className="mb-3 text-[16px] font-semibold">Фильтры</SheetTitle>
          <SheetDescription className="sr-only">Выбор периода, точки и других условий</SheetDescription>
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-1 [&>*]:w-full">{children}</div>
          <Button type="button" className="mt-4 h-11 w-full rounded-full" onClick={() => setOpen(false)}>Готово</Button>
        </SheetContent>
      </Sheet>
    </>
  );
}
