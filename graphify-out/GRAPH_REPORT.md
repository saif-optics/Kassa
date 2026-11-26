# Graph Report - Kassa  (2026-11-27)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1972 nodes · 6939 edges · 85 communities (72 shown, 13 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 188 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `266ab548`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Старый сайт: Аналитика (renderAnalytics)
- Новая версия: Аналитика
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
- Новая версия: Отчёт р/с
- Новая версия: Аналитика (exports.ts)
- Новая версия: Платежи
- Новая версия: Касса
- Новая версия: Продажи (Calendar.tsx)
- Старый сайт: Тесты (mk)
- Сборка старого сайта
- Документация (README.md)
- Новая версия: Сверка
- Новая версия: каркас и данные (access.ts)
- Настройки web (devDependencies)
- Новая версия: Пользователи
- Новая версия: Задания
- Новая версия: каркас и данные (App.tsx)
- Новая версия: каркас и данные (source.ts)
- Старый сайт: Платежи (pay.js)
- Новая версия: План
- Новая версия: Продажи
- Новая версия: Продажи (sales/logic.ts)
- Настройки web (plan-vite.config.ts)
- Новая версия: Сверка (recon/logic.ts)
- Новая версия: Продажи (SaleForm.tsx)
- Новая версия: Аналитика (base.ts)
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
- Новая версия: каркас и данные (demoRows)
- Новая версия: Сверка (report-parity.ts)
- Новая версия: План (PlanPage.tsx)
- Новая версия: Сверка (FmRecon.tsx)
- Настройки web (scripts)
- Настройки web (compilerOptions)
- Скрипты сверок и выгрузок (parity.ts)
- Настройки web (package.json)
- UI shadcn (Button)
- Скрипты сверок и выгрузок (sales-parity.ts)
- Настройки web (compilerOptions) 2
- Скрипты сверок и выгрузок (useData.ts)
- Документация (Касса Оптики — инструкции для Claude)
- Новая версия: Аналитика (analytics/cost.ts)
- Старый сайт: Роли и пользователи (inner.js)
- Старый сайт: Чистка (tidy.js)
- Настройки web (tsconfig.json)
- Новая версия: общие компоненты (Segments)
- Старый сайт: base.html (toLocal)
- Старый сайт: Локальные настройки (fillSelects)
- Новая версия: Задания (tasks/demo.ts)
- Настройки web (react-dom)
- Документация (Осмотр новой версии (web/) — анимации и вёрстка, 25.11.2026)
- Новая версия: Аналитика (analytics/demo.ts)
- Новая версия: Продажи (Card)
- Скрипты сверок и выгрузок (analytics-parity.ts)

## God Nodes (most connected - your core abstractions)
1. `Button()` - 83 edges
2. `react` - 76 edges
3. `Card()` - 70 edges
4. `useIsPhone()` - 64 edges
5. `fmt()` - 63 edges
6. `Segments()` - 60 edges
7. `RowCards()` - 48 edges
8. `HomePage()` - 46 edges
9. `KassaPage()` - 44 edges
10. `lucide-react` - 44 edges

## Surprising Connections (you probably didn't know these)
- `Распределение работы (экономия токенов) — решение владельца 06.11.2026` --references--> `rpc()`  [INFERRED]
  CLAUDE.md → web/src/lib/source.ts
- `Движение (один файл правил `web/src/lib/motion.ts`)` --references--> `land()`  [INFERRED]
  docs/superpowers/specs/2026-11-24-new-design-home-design.md → web/src/lib/motion.ts
- `Б. Анимации` --references--> `land()`  [INFERRED]
  docs/ОСМОТР_НОВОЙ_ВЕРСИИ_2026-11-25.md → web/src/lib/motion.ts
- `Разделы: где код в каждой версии` --references--> `renderAnalytics()`  [INFERRED]
  docs/КАРТА_ПРОЕКТА.md → dev/graph-src/base.html.js
- `Разделы: где код в каждой версии` --references--> `buildAnalytics()`  [INFERRED]
  docs/КАРТА_ПРОЕКТА.md → web/src/features/analytics/logic.ts

## Import Cycles
- None detected.

## Communities (85 total, 13 thin omitted)

### Community 0 - "Старый сайт: Аналитика (renderAnalytics)"
Cohesion: 0.29
Nodes (8): C, lineGaps(), niceStep(), plConf(), plFcast(), plPrevShares(), renderAnalytics(), renderAnPointSeg()

### Community 1 - "Новая версия: Аналитика"
Cohesion: 0.13
Nodes (29): CATCOL, matchOf(), PAYCOL, prevList(), PAYS, buildAnalytics(), cmp(), FinLine (+21 more)

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
Nodes (28): Batch, batchesOf(), BatchItem, batchStats(), curBatch(), docsOf(), normS(), R (+20 more)

### Community 8 - "Старый сайт: base.html (Таблицы)"
Cohesion: 0.19
Nodes (15): Где что лежит (таблица `public.docs`: col, id, data jsonb), batches(), closePop(), enhanceDate(), enhanceSelect(), entries(), hook(), openPop() (+7 more)

### Community 9 - "Новая версия: Склад Billz"
Cohesion: 0.10
Nodes (40): BzCheck, dS(), hm(), Wip(), Dash(), Field, saveBook(), BzStock() (+32 more)

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

### Community 17 - "Новая версия: Отчёт р/с"
Cohesion: 0.07
Nodes (80): pl(), todayTash(), DayReport(), Editor(), FiscalView(), FmState, PointCard(), PrepBanner() (+72 more)

### Community 18 - "Новая версия: Аналитика (exports.ts)"
Cohesion: 0.13
Nodes (31): agg, Card, dayList(), expFiltered(), filtered(), inRange(), periodTxt(), checkKey() (+23 more)

### Community 19 - "Новая версия: Платежи"
Cohesion: 0.08
Nodes (61): motion, Cell(), Grid(), Chip(), ChipTone, OnHero, TileBody(), TileSub() (+53 more)

### Community 20 - "Новая версия: Касса"
Cohesion: 0.07
Nodes (81): bcDays(), compute(), reserve(), Item(), Cols, Row(), RowCell(), RowName() (+73 more)

### Community 21 - "Новая версия: Продажи (Calendar.tsx)"
Cohesion: 0.14
Nodes (29): Calendar(), mln(), mlnCell(), mS(), plOff(), Sum(), addD(), calDefaultSel() (+21 more)

### Community 25 - "Новая версия: Сверка"
Cohesion: 0.15
Nodes (33): Banner(), Controls(), fmRcExport(), FmRecon(), bzQty(), bzSum(), collectState(), dayTable() (+25 more)

### Community 26 - "Новая версия: каркас и данные (access.ts)"
Cohesion: 0.12
Nodes (19): Общее в новой версии (`web/src/`), bez(), FlowPill(), canPerm(), canTab(), Ctx, DEF, loadAccess() (+11 more)

### Community 27 - "Настройки web (devDependencies)"
Cohesion: 0.15
Nodes (13): tailwindcss, tsx, @types/node, @types/react, @types/react-dom, typescript, devDependencies, tailwindcss@^4.3.4 (+5 more)

### Community 28 - "Новая версия: Пользователи"
Cohesion: 0.07
Nodes (59): FilterBar(), Sheet(), SheetContent(), SheetDescription(), SheetHeader(), SheetOverlay(), SheetPortal(), SheetTitle() (+51 more)

### Community 29 - "Новая версия: Задания"
Cohesion: 0.15
Nodes (30): Skeleton(), Textarea(), errMsg(), fmtD(), fmtT(), isOverdue(), MAXLEN, NewTask (+22 more)

### Community 30 - "Новая версия: каркас и данные (App.tsx)"
Cohesion: 0.12
Nodes (26): App(), Clock(), Gate(), KIT(), Loading(), PAGES, qc, Shell() (+18 more)

### Community 31 - "Новая версия: каркас и данные (source.ts)"
Cohesion: 0.29
Nodes (14): addExpenseLimited(), bzSelect(), client(), delDoc(), demoTables, isLimited(), limitRows(), listeners (+6 more)

### Community 32 - "Старый сайт: Платежи (pay.js)"
Cohesion: 0.14
Nodes (29): addPay(), amountOf(), baseAmount(), cashless(), chip(), closeDrawer(), debtOf(), delItem() (+21 more)

### Community 33 - "Новая версия: План"
Cohesion: 0.15
Nodes (26): addD(), checkKey(), defaultCfg(), discOf(), dow(), isContact(), isFrame(), isLens() (+18 more)

### Community 34 - "Новая версия: Продажи"
Cohesion: 0.31
Nodes (8): Debt, DebtPay, DebtsInfo, debtsOf(), isRepay(), num(), Orphan, saleDate()

### Community 35 - "Новая версия: Продажи (sales/logic.ts)"
Cohesion: 0.07
Nodes (69): xlsx, xlsx@https://cdn.sheetjs.com/xlsx-0.20.3/x..., downloadCsv(), downloadXlsx(), save(), get(), PRESETS, put() (+61 more)

### Community 36 - "Настройки web (plan-vite.config.ts)"
Cohesion: 0.24
Nodes (7): @tailwindcss/vite, vite, @vitejs/plugin-react, @tailwindcss/vite@^4.3.4, vite@^8.3.6, @vitejs/plugin-react@^6.2.1, root

### Community 37 - "Новая версия: Сверка (recon/logic.ts)"
Cohesion: 0.12
Nodes (26): RowColumn, BillzPanel(), SC, SD, AUTO, BGroup, BzItem, bzNext() (+18 more)

### Community 38 - "Новая версия: Продажи (SaleForm.tsx)"
Cohesion: 0.26
Nodes (14): KLBL, Photo, SettingsBox(), normPay(), normS(), SaleX, todayTash(), digits() (+6 more)

### Community 39 - "Новая версия: Аналитика (base.ts)"
Cohesion: 0.18
Nodes (24): Tabs(), TabsList(), tabsListVariants, TabsTrigger(), AnFilter(), PRESETS, defaultFlt(), Flt (+16 more)

### Community 40 - "Новая версия: Склад Billz (stock-billz/demo.ts)"
Cohesion: 0.15
Nodes (13): bzProducts, at(), D, day(), EXTRA, iso(), PTS, ROWS (+5 more)

### Community 41 - "Настройки web (components.json)"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 42 - "Старый сайт: Роли и пользователи"
Cohesion: 0.26
Nodes (19): build(), call(), can(), fieldsHtml(), fillPt(), genPass(), getPerms(), list() (+11 more)

### Community 43 - "Настройки web (dependencies)"
Cohesion: 0.12
Nodes (17): class-variance-authority, @hookform/resolvers, shadcn, zod, dependencies, class-variance-authority@^0.7.1, cn@^0.5.2, @hookform/resolvers@^7.0.2 (+9 more)

### Community 44 - "Скрипты сверок и выгрузок (cost-export.ts)"
Cohesion: 0.12
Nodes (13): root, c, d, lastD, P, prods, pstat, sales (+5 more)

### Community 45 - "Новая версия: Отчёт р/с (ui.tsx)"
Cohesion: 0.21
Nodes (8): Head, lsGet(), lsSet(), SIZES, sp(), Tone, TONES, usePaging()

### Community 46 - "Новая версия: Главная"
Cohesion: 0.10
Nodes (30): dark, Page(), qc, qs, Bento(), R16, S12, S16 (+22 more)

### Community 48 - "Документация (docs)"
Cohesion: 0.09
Nodes (20): Варианты движка анимаций, Главная (порядок по важности), Движение (один файл правил `web/src/lib/motion.ts`), Зачем, Новая версия (web/): единый дизайн, движение, адаптация. Главная как эталон, Ограничения, Оставлено исполнителю, Остальные разделы (+12 more)

### Community 49 - "Новая версия: Аналитика (AnalyticsPage.tsx)"
Cohesion: 0.10
Nodes (58): AnalyticsPage(), Owner(), readHints(), readSel(), renderW(), WDN, wsum(), MetricTile() (+50 more)

### Community 50 - "Старый сайт: Задания (tasks.js)"
Cohesion: 0.31
Nodes (15): card(), draw(), filtered(), filters(), formAdmin(), formProblem(), kpis(), listHtml() (+7 more)

### Community 51 - "Документация (Разбор проекта «Касса Оптики» — что есть, что участвует, что лишнее)"
Cohesion: 0.14
Nodes (13): 1. Из чего состоит проект (пять частей), 3. База и сервер Supabase (`kassa-optiki`), 4. Вне репозитория, но связано с проектом (на этом компьютере), 5. Локальные серверы, 6. Итог: что лишнее и что с этим можно сделать, А. Можно убрать без последствий (сайт и проверки не затрагивает), Б. Под вопросом (нужно ваше решение), В. Трогать нельзя (+5 more)

### Community 52 - "Скрипты сверок и выгрузок (plan-parity.ts)"
Cohesion: 0.20
Nodes (15): demoAll(), homeView(), nz(), OUT, planView(), rows(), demoExtra(), FRAMES (+7 more)

### Community 53 - "Новая версия: каркас и данные (demoRows)"
Cohesion: 0.23
Nodes (8): demoAll(), OUT, rows(), demoRows(), iso(), rnd(), demoAll(), extras

### Community 54 - "Новая версия: Сверка (report-parity.ts)"
Cohesion: 0.18
Nodes (15): addD(), bzAll(), OUT, rows(), T, B, build(), bzChecks (+7 more)

### Community 55 - "Новая версия: План (PlanPage.tsx)"
Cohesion: 0.17
Nodes (24): recharts, todayTash(), DaysChart(), Tip(), WeeksTable(), DayBar, dLong(), fmtM() (+16 more)

### Community 56 - "Новая версия: Сверка (FmRecon.tsx)"
Cohesion: 0.17
Nodes (13): Filters, get(), useFilters(), Det(), FmRow, jump(), ST, addD() (+5 more)

### Community 57 - "Настройки web (scripts)"
Cohesion: 0.50
Nodes (4): scripts, build, dev, preview

### Community 58 - "Настройки web (compilerOptions)"
Cohesion: 0.14
Nodes (13): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+5 more)

### Community 59 - "Скрипты сверок и выгрузок (parity.ts)"
Cohesion: 0.17
Nodes (11): byCol(), ctx, data, db, M0, repDocs, rows, snap() (+3 more)

### Community 60 - "Настройки web (package.json)"
Cohesion: 0.18
Nodes (10): react-hook-form, @supabase/supabase-js, tw-animate-css, react-hook-form@^7.91.0, @supabase/supabase-js@^2.119.0, tw-animate-css@^1.4.0, name, private (+2 more)

### Community 61 - "UI shadcn (Button)"
Cohesion: 0.09
Nodes (47): cn, lucide-react, radix-ui, react, InlineNumber(), InlineText(), NumProps, Login() (+39 more)

### Community 62 - "Скрипты сверок и выгрузок (sales-parity.ts)"
Cohesion: 0.24
Nodes (9): compute(), num0(), OUT, rows(), Scn, T, demoExtra(), iso() (+1 more)

### Community 63 - "Настройки web (compilerOptions) 2"
Cohesion: 0.17
Nodes (11): compilerOptions, allowImportingTsExtensions, lib, module, moduleResolution, noEmit, skipLibCheck, strict (+3 more)

### Community 64 - "Скрипты сверок и выгрузок (useData.ts)"
Cohesion: 0.27
Nodes (9): sonner, @tanstack/react-query, dark, Page(), qc, qs, subscribe(), KEY (+1 more)

### Community 65 - "Документация (Касса Оптики — инструкции для Claude)"
Cohesion: 0.10
Nodes (17): Задания и проблемы по точкам — вкладка «Задания», с 23.11.2026, Карта кода (Graphify), Касса Оптики — инструкции для Claude, Код, Правила работы, Приход сотрудников (Face ID) — папка `smena/`, с 15.11.2026, Распределение работы (экономия токенов) — решение владельца 06.11.2026, Роли доступа (с 16.11.2026, права-переключатели с 17.11.2026) (+9 more)

### Community 66 - "Новая версия: Аналитика (analytics/cost.ts)"
Cohesion: 0.08
Nodes (42): Batch, BItem, cache, Ctx, DEF_CATS, DEF_POINTS, discOf(), FinCfg (+34 more)

### Community 68 - "Старый сайт: Роли и пользователи (inner.js)"
Cohesion: 0.33
Nodes (3): ROLE_DENY, roleFull(), roleName()

### Community 69 - "Старый сайт: Чистка (tidy.js)"
Cohesion: 0.47
Nodes (3): apply(), keyOf(), scan()

### Community 70 - "Настройки web (tsconfig.json)"
Cohesion: 0.40
Nodes (4): compilerOptions, paths, files, references

### Community 71 - "Новая версия: общие компоненты (Segments)"
Cohesion: 0.20
Nodes (15): Cards(), Grid(), Props, RowCard(), useOpenKey(), Shades(), useScrollShade(), SegmentItem (+7 more)

### Community 72 - "Старый сайт: base.html (toLocal)"
Cohesion: 0.24
Nodes (10): applyLocal(), cash(), del(), lsGet(), put(), putSale(), saveFact(), showMsg() (+2 more)

### Community 74 - "Старый сайт: Локальные настройки (fillSelects)"
Cohesion: 0.29
Nodes (8): fillCatSel(), fillPhPoint(), fillSelects(), lensData(), lensInfo(), lensKind(), startEditSale(), syncFormParts()

### Community 75 - "Новая версия: Задания (tasks/demo.ts)"
Cohesion: 0.32
Nodes (7): HomeExtra, day(), demoStore(), fetchTasks(), Task, TaskComment, Access

### Community 79 - "Документация (Осмотр новой версии (web/) — анимации и вёрстка, 25.11.2026)"
Cohesion: 0.29
Nodes (6): А. Видно сразу, Б. Анимации, В. Телефон (iPhone 15/16 Pro Max), Г. Ноутбук и ПК, Осмотр новой версии (web/) — анимации и вёрстка, 25.11.2026, Что сделано правильно (не трогать)

### Community 86 - "Новая версия: Аналитика (analytics/demo.ts)"
Cohesion: 0.24
Nodes (9): rows(), demoExtra(), FRAMES, iso(), LENS, OTHER, PAYS, rnd() (+1 more)

### Community 87 - "Новая версия: Продажи (Card)"
Cohesion: 0.10
Nodes (48): ActionLink, Card(), isLink(), RowCards(), fmt(), Block, BlockView(), Dash() (+40 more)

### Community 88 - "Скрипты сверок и выгрузок (analytics-parity.ts)"
Cohesion: 0.22
Nodes (10): F(), grpPick(), M0, norm(), normM(), OUT, prevM, R() (+2 more)

## Knowledge Gaps
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Разделы: где код в каждой версии` connect `Старый сайт: Продажи (renderSales)` to `Старый сайт: Аналитика (renderAnalytics)`, `Новая версия: Аналитика`, `Новая версия: Аналитика (analytics/cost.ts)`, `Новая версия: Главная (home/logic.ts)`, `Старый сайт: base.html (Таблицы)`, `Старый сайт: base.html (init)`, `Новая версия: Отчёт р/с (ui.tsx)`, `Документация (docs)`, `Новая версия: Отчёт р/с`, `Новая версия: Аналитика (exports.ts)`, `Новая версия: Платежи`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Should `Новая версия: Аналитика` be split into smaller, more focused modules?**
  _Cohesion score 0.1265597147950089 - nodes in this community are weakly interconnected._
- **Why does `Касса Оптики — инструкции для Claude` connect `Документация (Касса Оптики — инструкции для Claude)` to `Старый сайт: base.html (Таблицы)`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Should `Старый сайт: Сверка Billz (bz.js)` be split into smaller, more focused modules?**
  _Cohesion score 0.14453781512605043 - nodes in this community are weakly interconnected._
- **Why does `main()` connect `Документация (Касса Оптики — инструкции для Claude)` to `Скрипты сверок и выгрузок (os)`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Should `Сборка старого сайта: патчи` be split into smaller, more focused modules?**
  _Cohesion score 0.09475806451612903 - nodes in this community are weakly interconnected._
- **Should `Старый сайт: base.html (base.html.js)` be split into smaller, more focused modules?**
  _Cohesion score 0.05423728813559322 - nodes in this community are weakly interconnected._