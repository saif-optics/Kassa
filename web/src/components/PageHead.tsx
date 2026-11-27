// Шапка страницы: надпись над заголовком, заголовок, дата или пояснение, кнопки справа.
export function PageHead({ eyebrow, title, sub, actions }: { eyebrow?: string; title: string; sub?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
      <div className="min-w-0">
        {eyebrow && <div className="text-[13px] font-semibold tracking-[.06em] text-muted-foreground uppercase">{eyebrow}</div>}
        <h1 className="mt-1 text-[30px] leading-[1.1] font-extrabold tracking-[-0.02em]">{title}</h1>
        {sub && <p className="mt-1.5 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2 max-sm:[&>*]:flex-1 max-sm:[&>*]:justify-center">{actions}</div>}
    </header>
  );
}
