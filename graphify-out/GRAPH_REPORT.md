# Graph Report - Kassa  (2026-11-27)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1989 nodes · 7064 edges · 92 communities (79 shown, 13 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 188 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fd8d7446`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Старый сайт: Аналитика (renderAnalytics)
- Новая версия: Аналитика
- Старый сайт: Сверка Billz (bz.js)
- Сборка старого сайта: патчи
- Старый сайт: base.html (base.html.js)
- Новая версия: Сверка (recon/logic.ts)
- Серверные функции Supabase
- Новая версия: Главная
- Старый сайт: base.html (Таблицы)
- Новая версия: Склад Billz
- Старый сайт: Отрисовка (render)
- Старый сайт: План (pl)
- Старый сайт: Заставка с логотипом
- Старый сайт: Отчёт р/с (rs.js)
- Старый сайт: base.html (Разделы: где код в каждой версии)
- Старый сайт: Отрисовка (render) 2
- Новая версия: Отчёт р/с
- Новая версия: Линзы
- Новая версия: Платежи
- Новая версия: Касса
- Новая версия: Продажи
- Старый сайт: Тесты (mk)
- Сборка старого сайта
- Документация (README.md)
- Новая версия: Сверка
- Новая версия: каркас и данные (source.ts)
- Настройки web (devDependencies)
- Новая версия: Пользователи
- Новая версия: Задания
- Новая версия: каркас и данные (App.tsx)
- Новая версия: Аналитика (base.ts)
- Старый сайт: Платежи (pay.js)
- Новая версия: План
- Новая версия: Продажи (DebtsPanel.tsx)
- Новая версия: Продажи (sales/logic.ts)
- Настройки web (plan-vite.config.ts)
- Новая версия: Отчёт р/с (fmt)
- Новая версия: Продажи (SalesPage.tsx)
- Новая версия: Продажи (sales/filter.tsx)
- Новая версия: Склад Billz (stock-billz/demo.ts)
- Настройки web (components.json)
- Старый сайт: Роли и пользователи
- Настройки web (dependencies)
- Скрипты сверок и выгрузок (cost-export.ts)
- Новая версия: Отчёт р/с (ui.tsx)
- Новая версия: Главная (HomePage.tsx)
- Документация (docs)
- Новая версия: Аналитика (AnalyticsPage.tsx)
- Старый сайт: Задания (tasks.js)
- Документация (Разбор проекта «Касса Оптики» — что есть, что участвует, что лишнее)
- Скрипты сверок и выгрузок (plan-parity.ts)
- Новая версия: Касса (Tiles.tsx)
- Скрипты сверок и выгрузок (demoRows)
- Новая версия: План (PlanPage.tsx)
- Новая версия: Касса (kassa/Journal.tsx)
- Настройки web (scripts)
- Настройки web (compilerOptions)
- Скрипты сверок и выгрузок (parity.ts)
- Новая версия: Платежи (Side.tsx)
- UI shadcn (Editor.tsx)
- Скрипты сверок и выгрузок (sales-parity.ts)
- Настройки web (compilerOptions) 2
- Старый сайт: Продажи (renderSales)
- Документация (Касса Оптики — инструкции для Claude)
- Новая версия: Аналитика (analytics/cost.ts)
- Старый сайт: Роли и пользователи (inner.js)
- Старый сайт: Чистка (tidy.js)
- Настройки web (tsconfig.json)
- Новая версия: общие компоненты (RowCards.tsx)
- Старый сайт: base.html (init)
- Новая версия: каркас и данные (access.ts)
- Новая версия: Продажи (Stats.tsx)
- Новая версия: Склад
- Новая версия: каркас и данные (types.ts)
- UI shadcn (Button)
- Документация (Осмотр новой версии (web/) — анимации и вёрстка, 25.11.2026)
- Настройки web (package.json)
- Новая версия: Касса (fmt)
- Новая версия: Аналитика (analytics/demo.ts)
- Новая версия: Продажи (Card)
- Скрипты сверок и выгрузок (analytics-parity.ts)
- Новая версия: Аналитика (xl.ts)
- Новая версия: Главная (WeekChart.tsx)
- Настройки web (react-hook-form)

## God Nodes (most connected - your core abstractions)
1. `Button()` - 88 edges
2. `react` - 75 edges
3. `Card()` - 73 edges
4. `fmt()` - 67 edges
5. `useIsPhone()` - 65 edges
6. `Segments()` - 61 edges
7. `SalesPage()` - 57 edges
8. `RowCards()` - 48 edges
9. `HomePage()` - 46 edges
10. `KassaPage()` - 44 edges

## Surprising Connections (you probably didn't know these)
- `Распределение работы (экономия токенов) — решение владельца 06.11.2026` --references--> `rpc()`  [INFERRED]
  CLAUDE.md → web/src/lib/source.ts
- `Движение (один файл правил `web/src/lib/motion.ts`)` --references--> `land()`  [INFERRED]
  docs/superpowers/specs/2026-11-24-new-design-home-design.md → web/src/lib/motion.ts
- `Б. Анимации` --references--> `land()`  [INFERRED]
  docs/ОСМОТР_НОВОЙ_ВЕРСИИ_2026-11-25.md → web/src/lib/motion.ts
- `Разделы: где код в каждой версии` --references--> `drawStack()`  [INFERRED]
  docs/КАРТА_ПРОЕКТА.md → dev/graph-src/base.html.js
- `Разделы: где код в каждой версии` --references--> `renderAnalytics()`  [INFERRED]
  docs/КАРТА_ПРОЕКТА.md → dev/graph-src/base.html.js

## Import Cycles
- None detected.

## Communities (92 total, 13 thin omitted)

### Community 0 - "Старый сайт: Аналитика (renderAnalytics)"
Cohesion: 0.20
Nodes (14): drawStack(), C, lineGaps(), niceStep(), periodLabel(), plCalc(), plConf(), plPrevShares() (+6 more)

### Community 1 - "Новая версия: Аналитика"
Cohesion: 0.13
Nodes (37): agg, CATCOL, dayList(), expFiltered(), PAYCOL, periodTxt(), prevList(), checkKey() (+29 more)

### Community 2 - "Старый сайт: Сверка Billz (bz.js)"
Cohesion: 0.14
Nodes (32): bindItems(), bindSeg(), collectState(), dayTable(), flatItems(), get(), itemsPanel(), kassaRows() (+24 more)

### Community 4 - "Старый сайт: base.html (base.html.js)"
Cohesion: 0.06
Nodes (38): apply(), mark(), batchMatcher(), bcDays(), build(), compress(), count(), deco() (+30 more)

### Community 5 - "Новая версия: Сверка (recon/logic.ts)"
Cohesion: 0.11
Nodes (27): sonner, @tanstack/react-query, BillzPanel(), SC, SD, AUTO, BGroup, BzItem (+19 more)

### Community 6 - "Серверные функции Supabase"
Cohesion: 0.06
Nodes (46): addD(), bz(), catOf(), collectChecks(), collectStock(), collectTransfers(), CORS, costOf() (+38 more)

### Community 7 - "Новая версия: Главная"
Cohesion: 0.09
Nodes (31): Batch, batchesOf(), BatchItem, batchStats(), curBatch(), docsOf(), normS(), R (+23 more)

### Community 8 - "Старый сайт: base.html (Таблицы)"
Cohesion: 0.20
Nodes (14): Где что лежит (таблица `public.docs`: col, id, data jsonb), batches(), closePop(), enhanceDate(), enhanceSelect(), entries(), hook(), openPop() (+6 more)

### Community 9 - "Новая версия: Склад Billz"
Cohesion: 0.10
Nodes (43): FilterBar(), get(), useFilters(), addD(), BzCheck, dS(), dtm(), fq() (+35 more)

### Community 10 - "Старый сайт: Отрисовка (render)"
Cohesion: 0.20
Nodes (10): article(), cashState(), chk(), kMonths(), lay(), recFor(), recM(), render() (+2 more)

### Community 11 - "Старый сайт: План (pl)"
Cohesion: 0.21
Nodes (13): batchStats(), curBatch(), pl(), plFcast(), plStats(), renderCal(), renderCalDay(), renderHome() (+5 more)

### Community 12 - "Старый сайт: Заставка с логотипом"
Cohesion: 0.33
Nodes (10): isDark(), logoMarkup(), part(), show(), A(), applyTheme(), destroy(), exit() (+2 more)

### Community 13 - "Старый сайт: Отчёт р/с (rs.js)"
Cohesion: 0.61
Nodes (7): byMonth(), calc(), chart(), days(), months(), render(), xlsx()

### Community 14 - "Старый сайт: base.html (Разделы: где код в каждой версии)"
Cohesion: 0.18
Nodes (15): applyLocal(), askDelete(), cash(), del(), delSale(), lsSet(), plStore(), put() (+7 more)

### Community 16 - "Старый сайт: Отрисовка (render) 2"
Cohesion: 0.23
Nodes (12): applyTpl(), attach(), pick(), place(), render(), close(), open(), renderTemplates() (+4 more)

### Community 17 - "Новая версия: Отчёт р/с"
Cohesion: 0.09
Nodes (43): pl(), todayTash(), DayReport(), addD(), BankRow, BcItem, Cell, dayExp() (+35 more)

### Community 18 - "Новая версия: Линзы"
Cohesion: 0.36
Nodes (10): inRange(), isFrame(), isLens(), lensData(), lensInfo(), lensKind(), lensKinds(), lensView() (+2 more)

### Community 19 - "Новая версия: Платежи"
Cohesion: 0.05
Nodes (80): card(), cfg(), days(), dayStat(), det(), editor(), fiscalDays(), gross() (+72 more)

### Community 20 - "Новая версия: Касса"
Cohesion: 0.15
Nodes (28): Item(), kassaNow(), empty(), Insights(), Split(), C, KassaPage(), analysis() (+20 more)

### Community 21 - "Новая версия: Продажи"
Cohesion: 0.24
Nodes (16): Cal, CalendarBlock(), ckWord(), DayBlock(), DayList(), mln(), mS(), planOf() (+8 more)

### Community 25 - "Новая версия: Сверка"
Cohesion: 0.11
Nodes (50): RowCards(), RowColumn, Chip(), ChipTone, OnHero, Tile(), TileLabel(), TileSub() (+42 more)

### Community 26 - "Новая версия: каркас и данные (source.ts)"
Cohesion: 0.24
Nodes (19): addExpenseLimited(), bzSelect(), client(), delDoc(), demoTables, isLimited(), limitRows(), listeners (+11 more)

### Community 27 - "Настройки web (devDependencies)"
Cohesion: 0.15
Nodes (13): tailwindcss, tsx, @types/node, @types/react, @types/react-dom, typescript, devDependencies, tailwindcss@^4.3.4 (+5 more)

### Community 28 - "Новая версия: Пользователи"
Cohesion: 0.11
Nodes (41): SheetHeader(), Switch(), ago(), base, demoRows(), byRoles(), call(), can() (+33 more)

### Community 29 - "Новая версия: Задания"
Cohesion: 0.14
Nodes (33): Textarea(), day(), demoStore(), errMsg(), fetchTasks(), fmtD(), fmtT(), isOverdue() (+25 more)

### Community 30 - "Новая версия: каркас и данные (App.tsx)"
Cohesion: 0.12
Nodes (26): react-dom, react-dom@^19.3.1, App(), Clock(), Gate(), KIT(), Loading(), PAGES (+18 more)

### Community 31 - "Новая версия: Аналитика (base.ts)"
Cohesion: 0.20
Nodes (21): AnFilter(), PRESETS, filtered(), Flt, matchOf(), monthOf(), monthRange(), PCOL (+13 more)

### Community 32 - "Старый сайт: Платежи (pay.js)"
Cohesion: 0.14
Nodes (29): addPay(), amountOf(), baseAmount(), cashless(), chip(), closeDrawer(), debtOf(), delItem() (+21 more)

### Community 33 - "Новая версия: План"
Cohesion: 0.15
Nodes (28): addD(), checkKey(), defaultCfg(), discOf(), dow(), isContact(), isFrame(), isLens() (+20 more)

### Community 34 - "Новая версия: Продажи (DebtsPanel.tsx)"
Cohesion: 0.20
Nodes (14): Debt, DebtPay, DebtsInfo, debtsOf(), isRepay(), num(), Orphan, saleDate() (+6 more)

### Community 35 - "Новая версия: Продажи (sales/logic.ts)"
Cohesion: 0.09
Nodes (42): useCalendar(), addD(), agg, calDayOf(), calDefaultSel(), calOf(), calPay(), checkKey() (+34 more)

### Community 36 - "Настройки web (plan-vite.config.ts)"
Cohesion: 0.24
Nodes (7): @tailwindcss/vite, vite, @vitejs/plugin-react, @tailwindcss/vite@^4.3.4, vite@^8.3.6, @vitejs/plugin-react@^6.2.1, root

### Community 37 - "Новая версия: Отчёт р/с (fmt)"
Cohesion: 0.13
Nodes (40): Segments(), KitDemo(), dLong(), fmt(), Editor(), FiscalView(), FmState, PointCard() (+32 more)

### Community 38 - "Новая версия: Продажи (SalesPage.tsx)"
Cohesion: 0.11
Nodes (32): CashBlock(), CashBlockData, Dash(), dateCell(), KassaChip(), PointTable(), downloadCsv(), downloadXlsx() (+24 more)

### Community 39 - "Новая версия: Продажи (sales/filter.tsx)"
Cohesion: 0.18
Nodes (20): Fields(), get(), put(), SalesFilter(), state, subs, useSalesFilter(), ctxOf() (+12 more)

### Community 40 - "Новая версия: Склад Billz (stock-billz/demo.ts)"
Cohesion: 0.12
Nodes (21): B, build(), bzChecks, bzProducts, demoExtra(), iso(), payName(), PRODUCTS (+13 more)

### Community 41 - "Настройки web (components.json)"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 42 - "Старый сайт: Роли и пользователи"
Cohesion: 0.26
Nodes (19): build(), call(), can(), fieldsHtml(), fillPt(), genPass(), getPerms(), list() (+11 more)

### Community 43 - "Настройки web (dependencies)"
Cohesion: 0.12
Nodes (17): class-variance-authority, @hookform/resolvers, @supabase/supabase-js, zod, dependencies, class-variance-authority@^0.7.1, cn@^0.5.2, @hookform/resolvers@^7.0.2 (+9 more)

### Community 44 - "Скрипты сверок и выгрузок (cost-export.ts)"
Cohesion: 0.12
Nodes (13): root, c, d, lastD, P, prods, pstat, sales (+5 more)

### Community 45 - "Новая версия: Отчёт р/с (ui.tsx)"
Cohesion: 0.21
Nodes (8): Head, lsGet(), lsSet(), SIZES, sp(), Tone, TONES, usePaging()

### Community 46 - "Новая версия: Главная (HomePage.tsx)"
Cohesion: 0.14
Nodes (22): Общее в новой версии (`web/src/`), dark, Page(), qc, qs, Bento(), PageHead(), AL_ICON (+14 more)

### Community 48 - "Документация (docs)"
Cohesion: 0.09
Nodes (20): Варианты движка анимаций, Главная (порядок по важности), Движение (один файл правил `web/src/lib/motion.ts`), Зачем, Новая версия (web/): единый дизайн, движение, адаптация. Главная как эталон, Ограничения, Оставлено исполнителю, Остальные разделы (+12 more)

### Community 49 - "Новая версия: Аналитика (AnalyticsPage.tsx)"
Cohesion: 0.09
Nodes (64): motion, dark, Page(), qc, qs, AnalyticsPage(), Owner(), readHints() (+56 more)

### Community 50 - "Старый сайт: Задания (tasks.js)"
Cohesion: 0.31
Nodes (15): card(), draw(), filtered(), filters(), formAdmin(), formProblem(), kpis(), listHtml() (+7 more)

### Community 51 - "Документация (Разбор проекта «Касса Оптики» — что есть, что участвует, что лишнее)"
Cohesion: 0.14
Nodes (13): 1. Из чего состоит проект (пять частей), 3. База и сервер Supabase (`kassa-optiki`), 4. Вне репозитория, но связано с проектом (на этом компьютере), 5. Локальные серверы, 6. Итог: что лишнее и что с этим можно сделать, А. Можно убрать без последствий (сайт и проверки не затрагивает), Б. Под вопросом (нужно ваше решение), В. Трогать нельзя (+5 more)

### Community 52 - "Скрипты сверок и выгрузок (plan-parity.ts)"
Cohesion: 0.20
Nodes (15): demoAll(), homeView(), nz(), OUT, planView(), rows(), demoExtra(), FRAMES (+7 more)

### Community 53 - "Новая версия: Касса (Tiles.tsx)"
Cohesion: 0.30
Nodes (15): Sheet(), SheetContent(), SheetDescription(), SheetTitle(), monthName(), CashHero(), digits(), fmtIn() (+7 more)

### Community 54 - "Скрипты сверок и выгрузок (demoRows)"
Cohesion: 0.15
Nodes (16): demoAll(), OUT, rows(), addD(), bzAll(), OUT, rows(), T (+8 more)

### Community 55 - "Новая версия: План (PlanPage.tsx)"
Cohesion: 0.19
Nodes (23): recharts, DaysChart(), Tip(), WeeksTable(), DayBar, fmt(), fmtM(), pctF() (+15 more)

### Community 56 - "Новая версия: Касса (kassa/Journal.tsx)"
Cohesion: 0.21
Nodes (21): compute(), reserve(), byDate(), F, FILTERS, Journal(), Pill(), Props (+13 more)

### Community 57 - "Настройки web (scripts)"
Cohesion: 0.50
Nodes (4): scripts, build, dev, preview

### Community 58 - "Настройки web (compilerOptions)"
Cohesion: 0.14
Nodes (13): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+5 more)

### Community 59 - "Скрипты сверок и выгрузок (parity.ts)"
Cohesion: 0.17
Nodes (11): byCol(), ctx, data, db, M0, repDocs, rows, snap() (+3 more)

### Community 60 - "Новая версия: Платежи (Side.tsx)"
Cohesion: 0.36
Nodes (12): Cols, Row(), RowCell(), RowName(), Rows(), Articles(), ByCat(), DebtRow (+4 more)

### Community 61 - "UI shadcn (Editor.tsx)"
Cohesion: 0.09
Nodes (40): Checkbox(), Select(), SelectContent(), SelectItem(), SelectScrollDownButton(), SelectScrollUpButton(), SelectTrigger(), SelectValue() (+32 more)

### Community 62 - "Скрипты сверок и выгрузок (sales-parity.ts)"
Cohesion: 0.22
Nodes (9): compute(), num0(), OUT, rows(), Scn, T, demoExtra(), iso() (+1 more)

### Community 63 - "Настройки web (compilerOptions) 2"
Cohesion: 0.17
Nodes (11): compilerOptions, allowImportingTsExtensions, lib, module, moduleResolution, noEmit, skipLibCheck, strict (+3 more)

### Community 64 - "Старый сайт: Продажи (renderSales)"
Cohesion: 0.18
Nodes (12): confirmBtn(), dayCashRows(), debtsOf(), flash(), go(), idle(), periodKey(), periodSheet() (+4 more)

### Community 65 - "Документация (Касса Оптики — инструкции для Claude)"
Cohesion: 0.10
Nodes (17): Задания и проблемы по точкам — вкладка «Задания», с 23.11.2026, Карта кода (Graphify), Касса Оптики — инструкции для Claude, Код, Правила работы, Приход сотрудников (Face ID) — папка `smena/`, с 15.11.2026, Распределение работы (экономия токенов) — решение владельца 06.11.2026, Роли доступа (с 16.11.2026, права-переключатели с 17.11.2026) (+9 more)

### Community 66 - "Новая версия: Аналитика (analytics/cost.ts)"
Cohesion: 0.07
Nodes (44): Card, Batch, BItem, cache, Ctx, DEF_CATS, DEF_POINTS, FinCfg (+36 more)

### Community 68 - "Старый сайт: Роли и пользователи (inner.js)"
Cohesion: 0.33
Nodes (3): ROLE_DENY, roleFull(), roleName()

### Community 69 - "Старый сайт: Чистка (tidy.js)"
Cohesion: 0.47
Nodes (3): apply(), keyOf(), scan()

### Community 70 - "Настройки web (tsconfig.json)"
Cohesion: 0.40
Nodes (4): compilerOptions, paths, files, references

### Community 71 - "Новая версия: общие компоненты (RowCards.tsx)"
Cohesion: 0.17
Nodes (16): bez(), FlowPill(), Cards(), Grid(), Props, RowCard(), useOpenKey(), Shades() (+8 more)

### Community 72 - "Старый сайт: base.html (init)"
Cohesion: 0.12
Nodes (24): applyPreset(), fillCatSel(), fillMonths(), fillPhPoint(), fillSelects(), init(), lensData(), lensInfo() (+16 more)

### Community 74 - "Новая версия: каркас и данные (access.ts)"
Cohesion: 0.18
Nodes (13): Ctx, DEF, loadAccess(), make(), PERMS, Role, ROLE_LABEL, ROLES (+5 more)

### Community 75 - "Новая версия: Продажи (Stats.tsx)"
Cohesion: 0.26
Nodes (13): dLong(), Group, periodLabel(), statsOf(), StF, wdIdx(), Dash(), GROUPS (+5 more)

### Community 76 - "Новая версия: Склад"
Cohesion: 0.21
Nodes (9): STAT, Wip(), bzView, Exp, useBzRefresh(), StockPage(), View, VIEWS (+1 more)

### Community 77 - "Новая версия: каркас и данные (types.ts)"
Cohesion: 0.22
Nodes (8): DayExp, BankDay, BcDoc, CashRec, Entry, PayCat, PayKind, PaySrc

### Community 78 - "UI shadcn (Button)"
Cohesion: 0.14
Nodes (19): cn, lucide-react, radix-ui, react, Login(), schema, Button(), buttonVariants (+11 more)

### Community 79 - "Документация (Осмотр новой версии (web/) — анимации и вёрстка, 25.11.2026)"
Cohesion: 0.29
Nodes (6): А. Видно сразу, Б. Анимации, В. Телефон (iPhone 15/16 Pro Max), Г. Ноутбук и ПК, Осмотр новой версии (web/) — анимации и вёрстка, 25.11.2026, Что сделано правильно (не трогать)

### Community 80 - "Настройки web (package.json)"
Cohesion: 0.18
Nodes (10): shadcn, tw-animate-css, xlsx, shadcn@^4.23.0, tw-animate-css@^1.4.0, xlsx@https://cdn.sheetjs.com/xlsx-0.20.3/x..., name, private (+2 more)

### Community 85 - "Новая версия: Касса (fmt)"
Cohesion: 0.54
Nodes (7): ArticlesMore(), DayChart(), dShort(), fmt(), byDate(), Items(), Steps()

### Community 86 - "Новая версия: Аналитика (analytics/demo.ts)"
Cohesion: 0.24
Nodes (9): rows(), demoExtra(), FRAMES, iso(), LENS, OTHER, PAYS, rnd() (+1 more)

### Community 87 - "Новая версия: Продажи (Card)"
Cohesion: 0.12
Nodes (40): ActionLink, Card(), isLink(), Input(), ExpenseBox(), ExpMode, LIST, Wrap() (+32 more)

### Community 88 - "Скрипты сверок и выгрузок (analytics-parity.ts)"
Cohesion: 0.21
Nodes (11): F(), grpPick(), M0, norm(), normM(), OUT, prevM, R() (+3 more)

### Community 89 - "Новая версия: Аналитика (xl.ts)"
Cohesion: 0.40
Nodes (3): FMT, XCol, XSheet

### Community 90 - "Новая версия: Главная (WeekChart.tsx)"
Cohesion: 0.50
Nodes (4): DayBar, WeekChart(), dLong(), planPeriod()

## Knowledge Gaps
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Разделы: где код в каждой версии` connect `Старый сайт: base.html (Разделы: где код в каждой версии)` to `Старый сайт: Аналитика (renderAnalytics)`, `Старый сайт: Продажи (renderSales)`, `Новая версия: Аналитика`, `Новая версия: Аналитика (analytics/cost.ts)`, `Новая версия: Главная`, `Старый сайт: base.html (Таблицы)`, `Старый сайт: План (pl)`, `Новая версия: Отчёт р/с (ui.tsx)`, `Новая версия: Главная (HomePage.tsx)`, `Документация (docs)`, `Новая версия: Отчёт р/с`, `Новая версия: Линзы`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Should `Новая версия: Аналитика` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Why does `Касса Оптики — инструкции для Claude` connect `Документация (Касса Оптики — инструкции для Claude)` to `Старый сайт: base.html (Таблицы)`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Should `Старый сайт: Сверка Billz (bz.js)` be split into smaller, more focused modules?**
  _Cohesion score 0.14453781512605043 - nodes in this community are weakly interconnected._
- **Why does `main()` connect `Документация (Касса Оптики — инструкции для Claude)` to `Скрипты сверок и выгрузок (os)`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `Сборка старого сайта: патчи` be split into smaller, more focused modules?**
  _Cohesion score 0.09475806451612903 - nodes in this community are weakly interconnected._
- **Should `Старый сайт: base.html (base.html.js)` be split into smaller, more focused modules?**
  _Cohesion score 0.06108597285067873 - nodes in this community are weakly interconnected._