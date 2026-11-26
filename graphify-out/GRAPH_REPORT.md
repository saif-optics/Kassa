# Graph Report - Kassa  (2026-11-26)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1943 nodes · 6738 edges · 90 communities (77 shown, 13 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 188 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c7bf449c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Старый сайт: Аналитика (renderAnalytics)
- Новая версия: Отчёт р/с
- Старый сайт: Сверка Billz (bz.js)
- Сборка старого сайта: патчи
- Старый сайт: base.html (base.html.js)
- Старый сайт: Фискальные модули (fm.js)
- Серверные функции Supabase
- Новая версия: Главная (home/logic.ts)
- Старый сайт: base.html (Таблицы)
- Новая версия: Склад Billz
- Старый сайт: Отрисовка (render)
- Старый сайт: base.html (init)
- Старый сайт: Заставка с логотипом
- Старый сайт: Отчёт р/с (rs.js)
- Старый сайт: Продажи (renderSales)
- Старый сайт: Отрисовка (render) 2
- Новая версия: Отчёт р/с (report/logic.ts)
- Новая версия: Аналитика
- Новая версия: Платежи
- Новая версия: Касса
- Новая версия: Продажи
- Старый сайт: Тесты (mk)
- Сборка старого сайта
- Документация (README.md)
- Новая версия: Сверка
- Новая версия: Продажи (DayCash.tsx)
- UI shadcn (analytics/filter.tsx)
- Новая версия: Пользователи
- Новая версия: Задания
- Новая версия: каркас и данные (App.tsx)
- Новая версия: каркас и данные (source.ts)
- Старый сайт: Платежи (pay.js)
- Новая версия: План
- Новая версия: Продажи (debts.ts)
- Новая версия: Продажи (SalesPage.tsx)
- Новая версия: каркас и данные (demoRows)
- Новая версия: Сверка (ReconPage.tsx)
- Новая версия: Аналитика (analytics/logic.ts)
- Новая версия: Аналитика (AnFilter.tsx)
- Новая версия: Склад Billz (stock-billz/demo.ts)
- Настройки web (components.json)
- Старый сайт: Роли и пользователи
- Настройки web (dependencies)
- Скрипты сверок и выгрузок (cost-export.ts)
- Новая версия: Отчёт р/с (ui.tsx)
- Новая версия: Главная
- Документация (docs)
- Новая версия: Аналитика (AnalyticsPage.tsx)
- Старый сайт: Задания (tasks.js)
- Документация (Разбор проекта «Касса Оптики» — что есть, что участвует, что лишнее)
- Скрипты сверок и выгрузок (plan-parity.ts)
- Старый сайт: base.html (toLocal)
- Скрипты сверок и выгрузок (report-parity.ts)
- Новая версия: План (PlanPage.tsx)
- Новая версия: каркас и данные (access.ts)
- Старый сайт: Локальные настройки (fillSelects)
- Настройки web (compilerOptions)
- Скрипты сверок и выгрузок (parity.ts)
- Настройки web (ref_node_path)
- UI shadcn (react)
- Скрипты сверок и выгрузок (sales-parity.ts)
- Настройки web (compilerOptions) 2
- Настройки web (package.json)
- Документация (Касса Оптики — инструкции для Claude)
- Новая версия: Аналитика (analytics/cost.ts)
- Старый сайт: Роли и пользователи (inner.js)
- Старый сайт: Чистка (tidy.js)
- Настройки web (tsconfig.json)
- Новая версия: Касса (kassa/Journal.tsx)
- Настройки web (scripts)
- Новая версия: Продажи (sales/filter.tsx)
- Новая версия: План (Charts.tsx)
- Новая версия: Продажи (Calendar.tsx)
- Новая версия: Продажи (Stats.tsx)
- Новая версия: Сверка (recon/demo.ts)
- Документация (Осмотр новой версии (web/) — анимации и вёрстка, 25.11.2026)
- Новая версия: План (PlanSettings)
- Настройки web (xlsx)
- Новая версия: Аналитика (analytics/demo.ts)
- Новая версия: Продажи (Button)
- Скрипты сверок и выгрузок (analytics-parity.ts)
- Новая версия: Аналитика (util.ts)

## God Nodes (most connected - your core abstractions)
1. `Button()` - 86 edges
2. `react` - 75 edges
3. `Card()` - 70 edges
4. `useIsPhone()` - 66 edges
5. `fmt()` - 61 edges
6. `Segments()` - 60 edges
7. `RowCards()` - 48 edges
8. `lucide-react` - 44 edges
9. `buildAnalytics()` - 41 edges
10. `Input()` - 41 edges

## Surprising Connections (you probably didn't know these)
- `Движение (один файл правил `web/src/lib/motion.ts`)` --references--> `land()`  [INFERRED]
  docs/superpowers/specs/2026-11-24-new-design-home-design.md → web/src/lib/motion.ts
- `Б. Анимации` --references--> `land()`  [INFERRED]
  docs/ОСМОТР_НОВОЙ_ВЕРСИИ_2026-11-25.md → web/src/lib/motion.ts
- `Распределение работы (экономия токенов) — решение владельца 06.11.2026` --references--> `rpc()`  [INFERRED]
  CLAUDE.md → web/src/lib/source.ts
- `Разделы: где код в каждой версии` --references--> `renderAnalytics()`  [INFERRED]
  docs/КАРТА_ПРОЕКТА.md → dev/graph-src/base.html.js
- `Общее в новой версии (`web/src/`)` --references--> `Segments()`  [INFERRED]
  docs/КАРТА_ПРОЕКТА.md → web/src/components/Segments.tsx

## Import Cycles
- None detected.

## Communities (90 total, 13 thin omitted)

### Community 0 - "Старый сайт: Аналитика (renderAnalytics)"
Cohesion: 0.29
Nodes (8): C, lineGaps(), niceStep(), plConf(), plFcast(), plPrevShares(), renderAnalytics(), renderAnPointSeg()

### Community 1 - "Новая версия: Отчёт р/с"
Cohesion: 0.14
Nodes (40): sonner, Segments(), pl(), Editor(), FiscalView(), FmState, PointCard(), PrepBanner() (+32 more)

### Community 2 - "Старый сайт: Сверка Billz (bz.js)"
Cohesion: 0.14
Nodes (32): bindItems(), bindSeg(), collectState(), dayTable(), flatItems(), get(), itemsPanel(), kassaRows() (+24 more)

### Community 4 - "Старый сайт: base.html (base.html.js)"
Cohesion: 0.05
Nodes (46): apply(), mark(), batchMatcher(), build(), compress(), confirmBtn(), count(), debtsOf() (+38 more)

### Community 5 - "Старый сайт: Фискальные модули (fm.js)"
Cohesion: 0.16
Nodes (22): card(), cfg(), days(), dayStat(), det(), editor(), fiscalDays(), gross() (+14 more)

### Community 6 - "Серверные функции Supabase"
Cohesion: 0.06
Nodes (46): addD(), bz(), catOf(), collectChecks(), collectStock(), collectTransfers(), CORS, costOf() (+38 more)

### Community 7 - "Новая версия: Главная (home/logic.ts)"
Cohesion: 0.09
Nodes (26): Batch, batchesOf(), BatchItem, batchStats(), curBatch(), docsOf(), normS(), R (+18 more)

### Community 8 - "Старый сайт: base.html (Таблицы)"
Cohesion: 0.19
Nodes (15): Где что лежит (таблица `public.docs`: col, id, data jsonb), batches(), closePop(), enhanceDate(), enhanceSelect(), entries(), hook(), openPop() (+7 more)

### Community 9 - "Новая версия: Склад Billz"
Cohesion: 0.10
Nodes (46): Tile(), TileLabel(), TileSub(), fmRcExport(), addD(), BzCheck, bzRefresh(), collectState() (+38 more)

### Community 10 - "Старый сайт: Отрисовка (render)"
Cohesion: 0.20
Nodes (10): article(), cashState(), chk(), kMonths(), lay(), recFor(), recM(), render() (+2 more)

### Community 11 - "Старый сайт: base.html (init)"
Cohesion: 0.14
Nodes (24): applyPreset(), batchStats(), curBatch(), fillMonths(), init(), pl(), plCalc(), plRing() (+16 more)

### Community 12 - "Старый сайт: Заставка с логотипом"
Cohesion: 0.33
Nodes (10): isDark(), logoMarkup(), part(), show(), A(), applyTheme(), destroy(), exit() (+2 more)

### Community 13 - "Старый сайт: Отчёт р/с (rs.js)"
Cohesion: 0.61
Nodes (7): byMonth(), calc(), chart(), days(), months(), render(), xlsx()

### Community 14 - "Старый сайт: Продажи (renderSales)"
Cohesion: 0.18
Nodes (17): askDelete(), dayCashRows(), delSale(), drawStack(), flash(), lsSet(), periodKey(), periodLabel() (+9 more)

### Community 16 - "Старый сайт: Отрисовка (render) 2"
Cohesion: 0.23
Nodes (12): applyTpl(), attach(), pick(), place(), render(), close(), open(), renderTemplates() (+4 more)

### Community 17 - "Новая версия: Отчёт р/с (report/logic.ts)"
Cohesion: 0.09
Nodes (42): todayTash(), kassaRows(), DayReport(), addD(), BankRow, BcItem, Cell, dayExp() (+34 more)

### Community 18 - "Новая версия: Аналитика"
Cohesion: 0.11
Nodes (35): dark, Page(), qc, qs, PageHead(), AnalyticsPage(), readHints(), readSel() (+27 more)

### Community 19 - "Новая версия: Платежи"
Cohesion: 0.06
Nodes (86): lucide-react, motion, InlineNumber(), InlineText(), NumProps, Cards(), Grid(), Props (+78 more)

### Community 20 - "Новая версия: Касса"
Cohesion: 0.18
Nodes (32): kassaNow(), Articles(), DayChart(), Insights(), Split(), KassaPage(), analysis(), article() (+24 more)

### Community 21 - "Новая версия: Продажи"
Cohesion: 0.09
Nodes (42): addD(), calOf(), checkKey(), ctxOf(), DayExp, dayExpOf(), DEF_CATS, DEF_POINTS (+34 more)

### Community 25 - "Новая версия: Сверка"
Cohesion: 0.11
Nodes (30): AUTO, BGroup, BzItem, bzNext(), bzOf(), BZP, bzQty(), bzRun() (+22 more)

### Community 26 - "Новая версия: Продажи (DayCash.tsx)"
Cohesion: 0.16
Nodes (23): Block, BlockView(), Dash(), dateCell(), DayCash(), Pill(), Col(), J (+15 more)

### Community 27 - "UI shadcn (analytics/filter.tsx)"
Cohesion: 0.12
Nodes (29): Select(), SelectContent(), SelectItem(), SelectScrollDownButton(), SelectScrollUpButton(), SelectTrigger(), SelectValue(), Tabs() (+21 more)

### Community 28 - "Новая версия: Пользователи"
Cohesion: 0.11
Nodes (41): SheetHeader(), Switch(), ago(), base, demoRows(), byRoles(), call(), can() (+33 more)

### Community 29 - "Новая версия: Задания"
Cohesion: 0.13
Nodes (37): Textarea(), HomeExtra, day(), demoStore(), errMsg(), fetchTasks(), fmtD(), fmtT() (+29 more)

### Community 30 - "Новая версия: каркас и данные (App.tsx)"
Cohesion: 0.11
Nodes (29): Общее в новой версии (`web/src/`), App(), Clock(), Gate(), KIT(), Loading(), PAGES, qc (+21 more)

### Community 31 - "Новая версия: каркас и данные (source.ts)"
Cohesion: 0.14
Nodes (23): @supabase/supabase-js, @tanstack/react-query, @supabase/supabase-js@^2.119.0, @tanstack/react-query@^5.106.0, addExpenseLimited(), delDoc(), demoTables, isDemo (+15 more)

### Community 32 - "Старый сайт: Платежи (pay.js)"
Cohesion: 0.14
Nodes (29): addPay(), amountOf(), baseAmount(), cashless(), chip(), closeDrawer(), debtOf(), delItem() (+21 more)

### Community 33 - "Новая версия: План"
Cohesion: 0.15
Nodes (28): addD(), checkKey(), defaultCfg(), discOf(), dow(), isContact(), isFrame(), isLens() (+20 more)

### Community 34 - "Новая версия: Продажи (debts.ts)"
Cohesion: 0.31
Nodes (8): Debt, DebtPay, DebtsInfo, debtsOf(), isRepay(), num(), Orphan, saleDate()

### Community 35 - "Новая версия: Продажи (SalesPage.tsx)"
Cohesion: 0.15
Nodes (27): ExpMode, downloadCsv(), downloadXlsx(), save(), cmpText(), csvOf(), dayCashRows(), daysBetween() (+19 more)

### Community 36 - "Новая версия: каркас и данные (demoRows)"
Cohesion: 0.23
Nodes (9): demoAll(), OUT, rows(), demoRows(), iso(), rnd(), demoAll(), extras (+1 more)

### Community 37 - "Новая версия: Сверка (ReconPage.tsx)"
Cohesion: 0.12
Nodes (43): ActionLink, Card(), isLink(), RowCards(), RowColumn, Chip(), ChipTone, OnHero (+35 more)

### Community 38 - "Новая версия: Аналитика (analytics/logic.ts)"
Cohesion: 0.11
Nodes (55): agg, CATCOL, dayList(), expFiltered(), filtered(), inRange(), matchOf(), PAYCOL (+47 more)

### Community 39 - "Новая версия: Аналитика (AnFilter.tsx)"
Cohesion: 0.26
Nodes (15): FilterBar(), Sheet(), SheetDescription(), SheetTitle(), AnFilter(), PRESETS, Flt, monthOf() (+7 more)

### Community 40 - "Новая версия: Склад Billz (stock-billz/demo.ts)"
Cohesion: 0.18
Nodes (11): at(), D, day(), EXTRA, iso(), PTS, ROWS, SKUS (+3 more)

### Community 41 - "Настройки web (components.json)"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 42 - "Старый сайт: Роли и пользователи"
Cohesion: 0.26
Nodes (19): build(), call(), can(), fieldsHtml(), fillPt(), genPass(), getPerms(), list() (+11 more)

### Community 43 - "Настройки web (dependencies)"
Cohesion: 0.10
Nodes (20): @hookform/resolvers, react-dom, react-hook-form, shadcn, tw-animate-css, zod, dependencies, cn@^0.5.2 (+12 more)

### Community 44 - "Скрипты сверок и выгрузок (cost-export.ts)"
Cohesion: 0.15
Nodes (12): c, d, lastD, P, prods, pstat, sales, skus (+4 more)

### Community 45 - "Новая версия: Отчёт р/с (ui.tsx)"
Cohesion: 0.14
Nodes (13): Controls(), get(), useFilters(), PER, Field, Head, lsGet(), lsSet() (+5 more)

### Community 46 - "Новая версия: Главная"
Cohesion: 0.18
Nodes (17): dark, Page(), qc, qs, AL_ICON, AL_TONE, GO(), HomePage() (+9 more)

### Community 48 - "Документация (docs)"
Cohesion: 0.09
Nodes (20): Варианты движка анимаций, Главная (порядок по важности), Движение (один файл правил `web/src/lib/motion.ts`), Зачем, Новая версия (web/): единый дизайн, движение, адаптация. Главная как эталон, Ограничения, Оставлено исполнителю, Остальные разделы (+12 more)

### Community 49 - "Новая версия: Аналитика (AnalyticsPage.tsx)"
Cohesion: 0.15
Nodes (35): Owner(), renderW(), WDN, Bar, Card, BarsC(), DonutC(), GroupBarsC() (+27 more)

### Community 50 - "Старый сайт: Задания (tasks.js)"
Cohesion: 0.31
Nodes (15): card(), draw(), filtered(), filters(), formAdmin(), formProblem(), kpis(), listHtml() (+7 more)

### Community 51 - "Документация (Разбор проекта «Касса Оптики» — что есть, что участвует, что лишнее)"
Cohesion: 0.14
Nodes (13): 1. Из чего состоит проект (пять частей), 3. База и сервер Supabase (`kassa-optiki`), 4. Вне репозитория, но связано с проектом (на этом компьютере), 5. Локальные серверы, 6. Итог: что лишнее и что с этим можно сделать, А. Можно убрать без последствий (сайт и проверки не затрагивает), Б. Под вопросом (нужно ваше решение), В. Трогать нельзя (+5 more)

### Community 52 - "Скрипты сверок и выгрузок (plan-parity.ts)"
Cohesion: 0.20
Nodes (15): demoAll(), homeView(), nz(), OUT, planView(), rows(), demoExtra(), FRAMES (+7 more)

### Community 53 - "Старый сайт: base.html (toLocal)"
Cohesion: 0.24
Nodes (10): applyLocal(), cash(), del(), lsGet(), put(), putSale(), saveFact(), showMsg() (+2 more)

### Community 54 - "Скрипты сверок и выгрузок (report-parity.ts)"
Cohesion: 0.27
Nodes (8): addD(), bzAll(), OUT, rows(), T, bzChecks, demoExtra(), iso()

### Community 55 - "Новая версия: План (PlanPage.tsx)"
Cohesion: 0.19
Nodes (20): WeeksTable(), monthTitle(), PlanCalc, planDayBars(), planMonths(), planPeriod(), planStatus(), plCls() (+12 more)

### Community 56 - "Новая версия: каркас и данные (access.ts)"
Cohesion: 0.18
Nodes (13): Ctx, DEF, loadAccess(), make(), PERMS, Role, ROLE_LABEL, ROLES (+5 more)

### Community 57 - "Старый сайт: Локальные настройки (fillSelects)"
Cohesion: 0.29
Nodes (8): fillCatSel(), fillPhPoint(), fillSelects(), lensData(), lensInfo(), lensKind(), startEditSale(), syncFormParts()

### Community 58 - "Настройки web (compilerOptions)"
Cohesion: 0.14
Nodes (13): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+5 more)

### Community 59 - "Скрипты сверок и выгрузок (parity.ts)"
Cohesion: 0.17
Nodes (11): byCol(), ctx, data, db, M0, repDocs, rows, snap() (+3 more)

### Community 60 - "Настройки web (ref_node_path)"
Cohesion: 0.21
Nodes (8): @tailwindcss/vite, vite, @vitejs/plugin-react, @tailwindcss/vite@^4.3.4, vite@^8.3.6, @vitejs/plugin-react@^6.2.1, root, root

### Community 61 - "UI shadcn (react)"
Cohesion: 0.11
Nodes (22): class-variance-authority, cn, radix-ui, react, class-variance-authority@^0.7.1, Login(), schema, buttonVariants (+14 more)

### Community 62 - "Скрипты сверок и выгрузок (sales-parity.ts)"
Cohesion: 0.22
Nodes (9): compute(), num0(), OUT, rows(), Scn, T, demoExtra(), iso() (+1 more)

### Community 63 - "Настройки web (compilerOptions) 2"
Cohesion: 0.17
Nodes (11): compilerOptions, allowImportingTsExtensions, lib, module, moduleResolution, noEmit, skipLibCheck, strict (+3 more)

### Community 64 - "Настройки web (package.json)"
Cohesion: 0.15
Nodes (17): tailwindcss, tsx, @types/node, @types/react, @types/react-dom, typescript, devDependencies, tailwindcss@^4.3.4 (+9 more)

### Community 65 - "Документация (Касса Оптики — инструкции для Claude)"
Cohesion: 0.10
Nodes (17): Задания и проблемы по точкам — вкладка «Задания», с 23.11.2026, Карта кода (Graphify), Касса Оптики — инструкции для Claude, Код, Правила работы, Приход сотрудников (Face ID) — папка `smena/`, с 15.11.2026, Распределение работы (экономия токенов) — решение владельца 06.11.2026, Роли доступа (с 16.11.2026, права-переключатели с 17.11.2026) (+9 more)

### Community 66 - "Новая версия: Аналитика (analytics/cost.ts)"
Cohesion: 0.07
Nodes (42): Batch, BItem, cache, Ctx, DEF_CATS, DEF_POINTS, FinCfg, isContact() (+34 more)

### Community 68 - "Старый сайт: Роли и пользователи (inner.js)"
Cohesion: 0.33
Nodes (3): ROLE_DENY, roleFull(), roleName()

### Community 69 - "Старый сайт: Чистка (tidy.js)"
Cohesion: 0.47
Nodes (3): apply(), keyOf(), scan()

### Community 70 - "Настройки web (tsconfig.json)"
Cohesion: 0.40
Nodes (4): compilerOptions, paths, files, references

### Community 71 - "Новая версия: Касса (kassa/Journal.tsx)"
Cohesion: 0.21
Nodes (19): bcDays(), compute(), reserve(), byDate(), F, FILTERS, Journal(), Pill() (+11 more)

### Community 72 - "Настройки web (scripts)"
Cohesion: 0.50
Nodes (4): scripts, build, dev, preview

### Community 74 - "Новая версия: Продажи (sales/filter.tsx)"
Cohesion: 0.21
Nodes (15): get(), PRESETS, put(), SalesFilter(), state, sub(), subs, useSalesFilter() (+7 more)

### Community 75 - "Новая версия: План (Charts.tsx)"
Cohesion: 0.22
Nodes (12): recharts, DayBar, narrow(), Tick(), Tip(), WeekChart(), DaysChart(), Tip() (+4 more)

### Community 76 - "Новая версия: Продажи (Calendar.tsx)"
Cohesion: 0.29
Nodes (12): Calendar(), mln(), mlnCell(), mS(), plOff(), Sum(), calDayOf(), calDefaultSel() (+4 more)

### Community 77 - "Новая версия: Продажи (Stats.tsx)"
Cohesion: 0.22
Nodes (11): Ctx, Filter, fmtM(), Group, niceStep(), StF, WD, Dash() (+3 more)

### Community 78 - "Новая версия: Сверка (recon/demo.ts)"
Cohesion: 0.31
Nodes (9): B, build(), bzProducts, demoExtra(), iso(), payName(), PRODUCTS, tash() (+1 more)

### Community 79 - "Документация (Осмотр новой версии (web/) — анимации и вёрстка, 25.11.2026)"
Cohesion: 0.29
Nodes (6): А. Видно сразу, Б. Анимации, В. Телефон (iPhone 15/16 Pro Max), Г. Ноутбук и ПК, Осмотр новой версии (web/) — анимации и вёрстка, 25.11.2026, Что сделано правильно (не трогать)

### Community 80 - "Новая версия: План (PlanSettings)"
Cohesion: 0.50
Nodes (5): buildPlanDoc(), parseAmt(), comma(), PlanSettings(), Stop()

### Community 86 - "Новая версия: Аналитика (analytics/demo.ts)"
Cohesion: 0.24
Nodes (9): rows(), demoExtra(), FRAMES, iso(), LENS, OTHER, PAYS, rnd() (+1 more)

### Community 87 - "Новая версия: Продажи (Button)"
Cohesion: 0.20
Nodes (24): Button(), Input(), ExpenseBox(), LIST, KLBL, Photo, Photos(), SettingsBox() (+16 more)

### Community 88 - "Скрипты сверок и выгрузок (analytics-parity.ts)"
Cohesion: 0.20
Nodes (10): F(), grpPick(), M0, OUT, prevM, R(), SCEN, T (+2 more)

### Community 92 - "Новая версия: Аналитика (util.ts)"
Cohesion: 0.18
Nodes (6): MONTHS, reEsc(), WD, FMT, XCol, XSheet

## Knowledge Gaps
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Разделы: где код в каждой версии` connect `Старый сайт: Продажи (renderSales)` to `Старый сайт: Аналитика (renderAnalytics)`, `Новая версия: Отчёт р/с`, `Новая версия: Аналитика (analytics/cost.ts)`, `Новая версия: Аналитика (analytics/logic.ts)`, `Старый сайт: base.html (Таблицы)`, `Старый сайт: base.html (init)`, `Новая версия: Отчёт р/с (ui.tsx)`, `Новая версия: Главная`, `Документация (docs)`, `Новая версия: Платежи`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Should `Новая версия: Отчёт р/с` be split into smaller, more focused modules?**
  _Cohesion score 0.13953488372093023 - nodes in this community are weakly interconnected._
- **Why does `Касса Оптики — инструкции для Claude` connect `Документация (Касса Оптики — инструкции для Claude)` to `Старый сайт: base.html (Таблицы)`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Should `Старый сайт: Сверка Billz (bz.js)` be split into smaller, more focused modules?**
  _Cohesion score 0.14453781512605043 - nodes in this community are weakly interconnected._
- **Why does `main()` connect `Документация (Касса Оптики — инструкции для Claude)` to `Скрипты сверок и выгрузок (os)`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `Сборка старого сайта: патчи` be split into smaller, more focused modules?**
  _Cohesion score 0.09475806451612903 - nodes in this community are weakly interconnected._
- **Should `Старый сайт: base.html (base.html.js)` be split into smaller, more focused modules?**
  _Cohesion score 0.05423728813559322 - nodes in this community are weakly interconnected._