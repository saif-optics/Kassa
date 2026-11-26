# Graph Report - Kassa  (2026-11-26)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1943 nodes · 6742 edges · 92 communities (80 shown, 12 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 188 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e9e34a8f`
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
- Новая версия: Главная
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
- UI shadcn (Tiles.tsx)
- Новая версия: Пользователи
- Новая версия: Задания
- Новая версия: каркас и данные (App.tsx)
- Новая версия: каркас и данные (source.ts)
- Старый сайт: Платежи (pay.js)
- Новая версия: План
- Новая версия: Продажи (debts.ts)
- Новая версия: Продажи (SalesPage.tsx)
- Новая версия: каркас и данные (demoRows)
- Новая версия: Сверка (Card)
- Новая версия: Аналитика (analytics/logic.ts)
- Новая версия: Аналитика (analytics/filter.tsx)
- Новая версия: Склад Billz (stock-billz/demo.ts)
- Настройки web (components.json)
- Старый сайт: Роли и пользователи
- Настройки web (dependencies)
- Скрипты сверок и выгрузок (cost-export.ts)
- Новая версия: Отчёт р/с (Segments)
- Новая версия: Главная (HomePage.tsx)
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
- Новая версия: Касса (AddForm.tsx)
- Скрипты сверок и выгрузок (sales-parity.ts)
- Настройки web (compilerOptions) 2
- Настройки web (devDependencies)
- Документация (Касса Оптики — инструкции для Claude)
- Новая версия: Аналитика (analytics/cost.ts)
- Старый сайт: Роли и пользователи (inner.js)
- Старый сайт: Чистка (tidy.js)
- Настройки web (tsconfig.json)
- Новая версия: общие компоненты (RowCards.tsx)
- Настройки web (scripts)
- Новая версия: Склад (файл, маржа)
- Новая версия: Главная (WeekChart.tsx)
- Новая версия: Продажи (Calendar.tsx)
- Новая версия: Продажи (Stats.tsx)
- Новая версия: Сверка (recon/demo.ts)
- Документация (Осмотр новой версии (web/) — анимации и вёрстка, 25.11.2026)
- Новая версия: План (plan/Settings.tsx)
- Настройки web (package.json)
- Новая версия: Аналитика (analytics/demo.ts)
- Новая версия: Продажи (Button)
- Скрипты сверок и выгрузок (analytics-parity.ts)
- UI shadcn (react)
- Новая версия: Аналитика (AnParts.tsx)
- UI shadcn (tabs.tsx)

## God Nodes (most connected - your core abstractions)
1. `Button()` - 86 edges
2. `react` - 76 edges
3. `Card()` - 70 edges
4. `useIsPhone()` - 66 edges
5. `fmt()` - 61 edges
6. `Segments()` - 60 edges
7. `RowCards()` - 48 edges
8. `lucide-react` - 44 edges
9. `buildAnalytics()` - 41 edges
10. `Input()` - 41 edges

## Surprising Connections (you probably didn't know these)
- `Распределение работы (экономия токенов) — решение владельца 06.11.2026` --references--> `rpc()`  [INFERRED]
  CLAUDE.md → web/src/lib/source.ts
- `Движение (один файл правил `web/src/lib/motion.ts`)` --references--> `land()`  [INFERRED]
  docs/superpowers/specs/2026-11-24-new-design-home-design.md → web/src/lib/motion.ts
- `Б. Анимации` --references--> `land()`  [INFERRED]
  docs/ОСМОТР_НОВОЙ_ВЕРСИИ_2026-11-25.md → web/src/lib/motion.ts
- `Разделы: где код в каждой версии` --references--> `renderAnalytics()`  [INFERRED]
  docs/КАРТА_ПРОЕКТА.md → dev/graph-src/base.html.js
- `Разделы: где код в каждой версии` --references--> `renderHome()`  [INFERRED]
  docs/КАРТА_ПРОЕКТА.md → dev/graph-src/base.html.js

## Import Cycles
- None detected.

## Communities (92 total, 12 thin omitted)

### Community 0 - "Старый сайт: Аналитика (renderAnalytics)"
Cohesion: 0.29
Nodes (8): C, lineGaps(), niceStep(), plConf(), plFcast(), plPrevShares(), renderAnalytics(), renderAnPointSeg()

### Community 1 - "Новая версия: Отчёт р/с"
Cohesion: 0.21
Nodes (20): Editor(), FiscalView(), FmState, PointCard(), PrepBanner(), fiscalDayList(), fmAnyOn(), fmCfg (+12 more)

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

### Community 7 - "Новая версия: Главная"
Cohesion: 0.09
Nodes (29): Batch, batchesOf(), BatchItem, batchStats(), curBatch(), docsOf(), normS(), R (+21 more)

### Community 8 - "Старый сайт: base.html (Таблицы)"
Cohesion: 0.19
Nodes (15): Где что лежит (таблица `public.docs`: col, id, data jsonb), batches(), closePop(), enhanceDate(), enhanceSelect(), entries(), hook(), openPop() (+7 more)

### Community 9 - "Новая версия: Склад Billz"
Cohesion: 0.11
Nodes (37): addD(), BzCheck, dL(), fq(), hm(), PER, periodOf(), sgn() (+29 more)

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
Cohesion: 0.07
Nodes (62): sonner, pl(), todayTash(), DayReport(), addD(), BankRow, BcItem, CAT_NAMES (+54 more)

### Community 18 - "Новая версия: Аналитика"
Cohesion: 0.13
Nodes (24): dark, Page(), qc, qs, PageHead(), AnalyticsPage(), wsum(), fname() (+16 more)

### Community 19 - "Новая версия: Платежи"
Cohesion: 0.08
Nodes (66): lucide-react, InlineNumber(), InlineText(), NumProps, Editor(), F, Field(), fromForm() (+58 more)

### Community 20 - "Новая версия: Касса"
Cohesion: 0.12
Nodes (51): bcDays(), compute(), reserve(), kassaNow(), Articles(), DayChart(), Insights(), Split() (+43 more)

### Community 21 - "Новая версия: Продажи"
Cohesion: 0.08
Nodes (51): get(), PRESETS, put(), SalesFilter(), state, sub(), subs, useSalesFilter() (+43 more)

### Community 25 - "Новая версия: Сверка"
Cohesion: 0.10
Nodes (46): Banner(), fmRcExport(), AUTO, BGroup, BzItem, bzNext(), bzOf(), BZP (+38 more)

### Community 26 - "Новая версия: Продажи (DayCash.tsx)"
Cohesion: 0.16
Nodes (22): Block, BlockView(), Dash(), dateCell(), DayCash(), Pill(), Col(), J (+14 more)

### Community 27 - "UI shadcn (Tiles.tsx)"
Cohesion: 0.16
Nodes (21): Select(), SelectContent(), SelectItem(), SelectScrollDownButton(), SelectScrollUpButton(), SelectTrigger(), SelectValue(), FilterBar() (+13 more)

### Community 28 - "Новая версия: Пользователи"
Cohesion: 0.11
Nodes (41): SheetHeader(), Switch(), ago(), base, demoRows(), byRoles(), call(), can() (+33 more)

### Community 29 - "Новая версия: Задания"
Cohesion: 0.13
Nodes (36): Textarea(), HomeExtra, day(), demoStore(), errMsg(), fetchTasks(), fmtD(), fmtT() (+28 more)

### Community 30 - "Новая версия: каркас и данные (App.tsx)"
Cohesion: 0.11
Nodes (28): Общее в новой версии (`web/src/`), App(), Clock(), Gate(), KIT(), Loading(), PAGES, qc (+20 more)

### Community 31 - "Новая версия: каркас и данные (source.ts)"
Cohesion: 0.15
Nodes (22): @tanstack/react-query, @tanstack/react-query@^5.106.0, addExpenseLimited(), delDoc(), demoPoint, demoRole, demoTables, isLimited() (+14 more)

### Community 32 - "Старый сайт: Платежи (pay.js)"
Cohesion: 0.14
Nodes (29): addPay(), amountOf(), baseAmount(), cashless(), chip(), closeDrawer(), debtOf(), delItem() (+21 more)

### Community 33 - "Новая версия: План"
Cohesion: 0.18
Nodes (25): addD(), checkKey(), discOf(), dow(), isContact(), isFrame(), isLens(), monthEnd() (+17 more)

### Community 34 - "Новая версия: Продажи (debts.ts)"
Cohesion: 0.31
Nodes (8): Debt, DebtPay, DebtsInfo, debtsOf(), isRepay(), num(), Orphan, saleDate()

### Community 35 - "Новая версия: Продажи (SalesPage.tsx)"
Cohesion: 0.21
Nodes (15): ExpMode, downloadCsv(), downloadXlsx(), save(), cmpText(), dayCashRows(), expVal(), lowerFirst() (+7 more)

### Community 36 - "Новая версия: каркас и данные (demoRows)"
Cohesion: 0.23
Nodes (9): demoAll(), OUT, rows(), demoRows(), iso(), rnd(), demoAll(), extras (+1 more)

### Community 37 - "Новая версия: Сверка (Card)"
Cohesion: 0.14
Nodes (35): Card(), RowCards(), RowColumn, Chip(), ChipTone, OnHero, Tile(), TileLabel() (+27 more)

### Community 38 - "Новая версия: Аналитика (analytics/logic.ts)"
Cohesion: 0.12
Nodes (48): agg, CATCOL, dayList(), expFiltered(), filtered(), matchOf(), PAYCOL, PCOL (+40 more)

### Community 39 - "Новая версия: Аналитика (analytics/filter.tsx)"
Cohesion: 0.30
Nodes (12): AnFilter(), PRESETS, Flt, monthOf(), monthRange(), pointColor(), presetRange(), Lbl() (+4 more)

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
Cohesion: 0.11
Nodes (18): class-variance-authority, react-hook-form, @supabase/supabase-js, tw-animate-css, zod, dependencies, class-variance-authority@^0.7.1, cn@^0.5.2 (+10 more)

### Community 44 - "Скрипты сверок и выгрузок (cost-export.ts)"
Cohesion: 0.15
Nodes (12): c, d, lastD, P, prods, pstat, sales, skus (+4 more)

### Community 45 - "Новая версия: Отчёт р/с (Segments)"
Cohesion: 0.15
Nodes (14): Segments(), Controls(), Filters, get(), useFilters(), Field, Head, lsGet() (+6 more)

### Community 46 - "Новая версия: Главная (HomePage.tsx)"
Cohesion: 0.16
Nodes (17): recharts, dark, Page(), qc, qs, AL_ICON, AL_TONE, GO() (+9 more)

### Community 48 - "Документация (docs)"
Cohesion: 0.09
Nodes (20): Варианты движка анимаций, Главная (порядок по важности), Движение (один файл правил `web/src/lib/motion.ts`), Зачем, Новая версия (web/): единый дизайн, движение, адаптация. Главная как эталон, Ограничения, Оставлено исполнителю, Остальные разделы (+12 more)

### Community 49 - "Новая версия: Аналитика (AnalyticsPage.tsx)"
Cohesion: 0.14
Nodes (36): Owner(), readHints(), readSel(), renderW(), WDN, Bar, BarsC(), DonutC() (+28 more)

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
Cohesion: 0.21
Nodes (21): DaysChart(), Tip(), WeeksTable(), DayBar, fmt(), fmtM(), pctF(), planMonths() (+13 more)

### Community 56 - "Новая версия: каркас и данные (access.ts)"
Cohesion: 0.19
Nodes (12): Ctx, DEF, loadAccess(), make(), PERMS, Role, ROLE_LABEL, ROLES (+4 more)

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

### Community 61 - "Новая версия: Касса (AddForm.tsx)"
Cohesion: 0.20
Nodes (13): Login(), schema, Checkbox(), Label(), AddForm(), digits(), empty(), FormVal (+5 more)

### Community 62 - "Скрипты сверок и выгрузок (sales-parity.ts)"
Cohesion: 0.22
Nodes (9): compute(), num0(), OUT, rows(), Scn, T, demoExtra(), iso() (+1 more)

### Community 63 - "Настройки web (compilerOptions) 2"
Cohesion: 0.17
Nodes (11): compilerOptions, allowImportingTsExtensions, lib, module, moduleResolution, noEmit, skipLibCheck, strict (+3 more)

### Community 64 - "Настройки web (devDependencies)"
Cohesion: 0.15
Nodes (13): tailwindcss, tsx, @types/node, @types/react, @types/react-dom, typescript, devDependencies, tailwindcss@^4.3.4 (+5 more)

### Community 65 - "Документация (Касса Оптики — инструкции для Claude)"
Cohesion: 0.10
Nodes (17): Задания и проблемы по точкам — вкладка «Задания», с 23.11.2026, Карта кода (Graphify), Касса Оптики — инструкции для Claude, Код, Правила работы, Приход сотрудников (Face ID) — папка `smena/`, с 15.11.2026, Распределение работы (экономия токенов) — решение владельца 06.11.2026, Роли доступа (с 16.11.2026, права-переключатели с 17.11.2026) (+9 more)

### Community 66 - "Новая версия: Аналитика (analytics/cost.ts)"
Cohesion: 0.09
Nodes (34): inRange(), Batch, cache, Ctx, DEF_CATS, DEF_POINTS, FinCfg, isContact() (+26 more)

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

### Community 72 - "Настройки web (scripts)"
Cohesion: 0.50
Nodes (4): scripts, build, dev, preview

### Community 74 - "Новая версия: Склад (файл, маржа)"
Cohesion: 0.16
Nodes (19): BItem, NODET, unitPrice(), sum(), phoneFirst(), COLRULES, mapHeader(), marginData() (+11 more)

### Community 75 - "Новая версия: Главная (WeekChart.tsx)"
Cohesion: 0.48
Nodes (6): DayBar, narrow(), Tick(), Tip(), WeekChart(), dLong()

### Community 76 - "Новая версия: Продажи (Calendar.tsx)"
Cohesion: 0.14
Nodes (28): Calendar(), mln(), mlnCell(), mS(), plOff(), Sum(), addD(), calDayOf() (+20 more)

### Community 77 - "Новая версия: Продажи (Stats.tsx)"
Cohesion: 0.23
Nodes (13): fmtM(), Group, niceStep(), periodKey(), periodLabel(), periodsIn(), statsOf(), StF (+5 more)

### Community 78 - "Новая версия: Сверка (recon/demo.ts)"
Cohesion: 0.31
Nodes (9): B, build(), bzProducts, demoExtra(), iso(), payName(), PRODUCTS, tash() (+1 more)

### Community 79 - "Документация (Осмотр новой версии (web/) — анимации и вёрстка, 25.11.2026)"
Cohesion: 0.29
Nodes (6): А. Видно сразу, Б. Анимации, В. Телефон (iPhone 15/16 Pro Max), Г. Ноутбук и ПК, Осмотр новой версии (web/) — анимации и вёрстка, 25.11.2026, Что сделано правильно (не трогать)

### Community 80 - "Новая версия: План (plan/Settings.tsx)"
Cohesion: 0.27
Nodes (10): buildPlanDoc(), defaultCfg(), parseAmt(), PlanCalc, PlanCfg, planEnv, readPlanCfg(), comma() (+2 more)

### Community 85 - "Настройки web (package.json)"
Cohesion: 0.15
Nodes (12): @hookform/resolvers, react-dom, shadcn, xlsx, @hookform/resolvers@^7.0.2, react-dom@^19.3.1, shadcn@^4.23.0, xlsx@https://cdn.sheetjs.com/xlsx-0.20.3/x... (+4 more)

### Community 86 - "Новая версия: Аналитика (analytics/demo.ts)"
Cohesion: 0.24
Nodes (9): rows(), demoExtra(), FRAMES, iso(), LENS, OTHER, PAYS, rnd() (+1 more)

### Community 87 - "Новая версия: Продажи (Button)"
Cohesion: 0.17
Nodes (26): ActionLink, isLink(), Button(), Input(), ExpenseBox(), LIST, KLBL, Photo (+18 more)

### Community 88 - "Скрипты сверок и выгрузок (analytics-parity.ts)"
Cohesion: 0.21
Nodes (11): F(), grpPick(), M0, norm(), normM(), OUT, prevM, R() (+3 more)

### Community 89 - "UI shadcn (react)"
Cohesion: 0.20
Nodes (12): cn, radix-ui, react, FilterBar(), buttonVariants, Sheet(), SheetContent(), SheetDescription() (+4 more)

### Community 90 - "Новая версия: Аналитика (AnParts.tsx)"
Cohesion: 0.22
Nodes (17): motion, MetricTile(), MiniTile(), Panel(), tone(), useHint(), Card, MiniRing() (+9 more)

### Community 91 - "UI shadcn (tabs.tsx)"
Cohesion: 0.43
Nodes (6): Tabs(), TabsList(), tabsListVariants, TabsTrigger(), Seg(), Seg()

## Knowledge Gaps
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Разделы: где код в каждой версии` connect `Старый сайт: Продажи (renderSales)` to `Старый сайт: Аналитика (renderAnalytics)`, `Новая версия: Аналитика (analytics/cost.ts)`, `Новая версия: Аналитика (analytics/logic.ts)`, `Новая версия: Главная`, `Старый сайт: base.html (Таблицы)`, `Старый сайт: base.html (init)`, `Новая версия: Отчёт р/с (Segments)`, `Документация (docs)`, `Новая версия: Отчёт р/с (report/logic.ts)`, `Новая версия: Платежи`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Should `Старый сайт: Сверка Billz (bz.js)` be split into smaller, more focused modules?**
  _Cohesion score 0.14453781512605043 - nodes in this community are weakly interconnected._
- **Why does `Касса Оптики — инструкции для Claude` connect `Документация (Касса Оптики — инструкции для Claude)` to `Старый сайт: base.html (Таблицы)`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Should `Сборка старого сайта: патчи` be split into smaller, more focused modules?**
  _Cohesion score 0.09475806451612903 - nodes in this community are weakly interconnected._
- **Why does `main()` connect `Документация (Касса Оптики — инструкции для Claude)` to `Скрипты сверок и выгрузок (os)`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `Старый сайт: base.html (base.html.js)` be split into smaller, more focused modules?**
  _Cohesion score 0.05423728813559322 - nodes in this community are weakly interconnected._
- **Should `Серверные функции Supabase` be split into smaller, more focused modules?**
  _Cohesion score 0.061495457721872815 - nodes in this community are weakly interconnected._