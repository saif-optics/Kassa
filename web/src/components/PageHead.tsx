// Шапка страницы: надпись над заголовком, заголовок, дата или пояснение, переключатель рядом (mid), кнопки справа.
/** compact — на телефоне заголовок и кнопки в одной строке (кнопки без растягивания), переключатель под ними на всю ширину */
export function PageHead({ eyebrow, title, sub, mid, actions, compact }: { eyebrow?: string; title: string; sub?: React.ReactNode; mid?: React.ReactNode; actions?: React.ReactNode; compact?: boolean }) {
  return (
    <header className={"flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4" + (compact ? " max-sm:flex-row max-sm:flex-wrap max-sm:items-start" : "")}>
      <div className={"min-w-0" + (compact ? " max-sm:flex-1" : "")}>
        {eyebrow && <div className="text-[13px] font-semibold tracking-[.06em] text-muted-foreground uppercase">{eyebrow}</div>}
        <h1 className="mt-1 text-[30px] leading-[1.1] font-extrabold tracking-[-0.02em]">{title}</h1>
        {sub && <p className="mt-1.5 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {mid && <div className={"min-w-0 max-w-full sm:pb-0.5" + (compact ? " max-sm:order-last max-sm:basis-full" : "")}>{mid}</div>}
      {actions && <div className={"flex flex-wrap gap-2 sm:ml-auto" + (compact ? " max-sm:flex-nowrap max-sm:pt-1" : " max-sm:[&>*]:flex-1 max-sm:[&>*]:justify-center")}>{actions}</div>}
    </header>
  );
}
