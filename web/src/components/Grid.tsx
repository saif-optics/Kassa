// Сетка страницы по ширине контейнера контента (@container/main): 1 колонка до 640, 6 до 1023, 12 до 1699, 16 от 1700.
// Классы перечислены явно, чтобы Tailwind 4 их увидел при сборке.
import { cn } from "@/lib/utils";

export const Grid = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("grid grid-cols-1 items-start gap-4 @min-[640px]/main:grid-cols-6 @min-[1024px]/main:grid-cols-12 @min-[1700px]/main:grid-cols-16", className)}>{children}</div>
);

// карты «число колонок → класс»
const S6: Record<number, string> = { 3: "@min-[640px]/main:col-span-3", 6: "@min-[640px]/main:col-span-6" };
const S12: Record<number, string> = {
  2: "@min-[1024px]/main:col-span-2", 3: "@min-[1024px]/main:col-span-3", 4: "@min-[1024px]/main:col-span-4", 5: "@min-[1024px]/main:col-span-5",
  6: "@min-[1024px]/main:col-span-6", 7: "@min-[1024px]/main:col-span-7", 8: "@min-[1024px]/main:col-span-8", 12: "@min-[1024px]/main:col-span-12",
};
const S16: Record<number, string> = {
  2: "@min-[1700px]/main:col-span-2", 4: "@min-[1700px]/main:col-span-4", 5: "@min-[1700px]/main:col-span-5", 6: "@min-[1700px]/main:col-span-6",
  8: "@min-[1700px]/main:col-span-8", 16: "@min-[1700px]/main:col-span-16",
};
const R16: Record<number, string> = { 2: "@min-[1700px]/main:row-span-2" };

/** ячейка сетки: s — колонок на 6, span — на 12, wide — на 16; rows — высота в рядах на 16; wideOnly — показывать только от 1700 */
export function Cell({ s = 6, span = 12, wide = span, rows, wideOnly, last, className, children }: {
  s?: 3 | 6; span?: number; wide?: number; rows?: 2; wideOnly?: boolean; last?: boolean; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={cn("min-w-0", S6[s], S12[span], S16[wide], rows && R16[rows], wideOnly && "hidden @min-[1700px]/main:block",
      last && "@max-[639px]/main:order-last", className)}>{children}</div>
  );
}
