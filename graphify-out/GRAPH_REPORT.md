# Graph Report - Kassa  (2026-11-25)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1930 nodes · 6658 edges · 82 communities (70 shown, 12 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 187 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a86f8653`
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
- Новая версия: Сверка (ReconPage.tsx)
- Старый сайт: base.html (Таблицы)
- Новая версия: Склад Billz
- Старый сайт: Отрисовка (render)
- Старый сайт: base.html (init)
- Старый сайт: Заставка с логотипом
- Старый сайт: Отчёт р/с (rs.js)
- Старый сайт: Продажи (renderSales)
- Старый сайт: Отрисовка (render) 2
- Новая версия: Отчёт р/с
- Новая версия: Аналитика (AnalyticsPage.tsx)
- Новая версия: Платежи
- Новая версия: Касса
- Новая версия: Продажи (Calendar.tsx)
- Старый сайт: Тесты (mk)
- Сборка старого сайта
- Документация (README.md)
- Новая версия: Сверка
- Новая версия: Продажи
- UI shadcn (Input)
- Новая версия: Пользователи
- Новая версия: Задания
- Новая версия: каркас и данные (App.tsx)
- Новая версия: каркас и данные (source.ts)
- Старый сайт: Платежи (pay.js)
- Новая версия: План
- Новая версия: Продажи (debts.ts)
- Новая версия: Продажи (sales/logic.ts)
- Новая версия: каркас и данные (demoRows)
- Новая версия: Сверка (FmRecon.tsx)
- Новая версия: Аналитика (analytics/logic.ts)
- UI shadcn (sheet.tsx)
- Новая версия: Склад Billz (stock-billz/demo.ts)
- Настройки web (components.json)
- Старый сайт: Роли и пользователи
- Настройки web (dependencies)
- Скрипты сверок и выгрузок (cost-export.ts)
- Новая версия: Отчёт р/с (Segments)
- Новая версия: общие компоненты (HomePage.tsx)
- Документация (docs)
- Новая версия: Аналитика (charts.tsx)
- Старый сайт: Задания (tasks.js)
- Документация (Разбор проекта «Касса Оптики» — что есть, что участвует, что лишнее)
- Скрипты сверок и выгрузок (plan-parity.ts)
- Старый сайт: base.html (toLocal)
- Скрипты сверок и выгрузок (report-parity.ts)
- UI shadcn (RowCards)
- Новая версия: каркас и данные (access.ts)
- Старый сайт: Локальные настройки (fillSelects)
- Настройки web (compilerOptions)
- Скрипты сверок и выгрузок (parity.ts)
- Настройки web (ref_node_path)
- Новая версия: каркас и данные (react)
- Скрипты сверок и выгрузок (sales-parity.ts)
- Настройки web (compilerOptions) 2
- Настройки web (package.json)
- Документация (Касса Оптики — инструкции для Claude)
- Новая версия: Склад (файл, маржа)
- Старый сайт: Роли и пользователи (inner.js)
- Старый сайт: Чистка (tidy.js)
- Настройки web (tsconfig.json)
- Настройки web (scripts)
- Новая версия: Аналитика (analytics/demo.ts)
- Новая версия: Продажи (Card)
- Скрипты сверок и выгрузок (analytics-parity.ts)
- Новая версия: Аналитика (xl.ts)
- Скрипты сверок и выгрузок (plan-harness/main.tsx)

## God Nodes (most connected - your core abstractions)
1. `Button()` - 86 edges
2. `react` - 74 edges
3. `Card()` - 70 edges
4. `fmt()` - 61 edges
5. `Segments()` - 56 edges
6. `useIsPhone()` - 53 edges
7. `RowCards()` - 48 edges
8. `lucide-react` - 43 edges
9. `Input()` - 41 edges
10. `buildAnalytics()` - 41 edges

## Surprising Connections (you probably didn't know these)
- `Распределение работы (экономия токенов) — решение владельца 06.11.2026` --references--> `rpc()`  [INFERRED]
  CLAUDE.md → web/src/lib/source.ts
- `Движение (один файл правил `web/src/lib/motion.ts`)` --references--> `land()`  [INFERRED]
  docs/superpowers/specs/2026-11-24-new-design-home-design.md → web/src/lib/motion.ts
- `Разделы: где код в каждой версии` --references--> `renderAnalytics()`  [INFERRED]
  docs/КАРТА_ПРОЕКТА.md → dev/graph-src/base.html.js
- `Разделы: где код в каждой версии` --references--> `lensView()`  [INFERRED]
  docs/КАРТА_ПРОЕКТА.md → web/src/features/lens/logic.ts
- `Разделы: где код в каждой версии` --references--> `renderHome()`  [INFERRED]
  docs/КАРТА_ПРОЕКТА.md → dev/graph-src/base.html.js

## Import Cycles
- None detected.

## Communities (82 total, 12 thin omitted)

### Community 0 - "Старый сайт: Аналитика (renderAnalytics)"
Cohesion: 0.29
Nodes (8): C, lineGaps(), niceStep(), plConf(), plFcast(), plPrevShares(), renderAnalytics(), renderAnPointSeg()

### Community 1 - "Новая версия: Аналитика"
Cohesion: 0.10
Nodes (30): Batch, cache, DEF_CATS, DEF_POINTS, FinCfg, isContact(), isFrame(), isLens() (+22 more)

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

### Community 7 - "Новая версия: Сверка (ReconPage.tsx)"
Cohesion: 0.18
Nodes (25): bzQty(), bzSum(), collectState(), DayRow, dayTable(), dtm(), flatItems(), hm() (+17 more)

### Community 8 - "Старый сайт: base.html (Таблицы)"
Cohesion: 0.19
Nodes (15): Где что лежит (таблица `public.docs`: col, id, data jsonb), batches(), closePop(), enhanceDate(), enhanceSelect(), entries(), hook(), openPop() (+7 more)

### Community 9 - "Новая версия: Склад Billz"
Cohesion: 0.11
Nodes (35): RowColumn, BzCheck, fq(), sgq(), BzStock(), BzTransfers(), bzView, Exp (+27 more)

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
Nodes (77): Switch(), pl(), todayTash(), DayReport(), Editor(), FiscalView(), FmState, PointCard() (+69 more)

### Community 18 - "Новая версия: Аналитика (AnalyticsPage.tsx)"
Cohesion: 0.11
Nodes (46): dark, Page(), qc, qs, AnalyticsPage(), Owner(), readHints(), readSel() (+38 more)

### Community 19 - "Новая версия: Платежи"
Cohesion: 0.09
Nodes (59): InlineNumber(), InlineText(), NumProps, Button(), Editor(), F, Field(), fromForm() (+51 more)

### Community 20 - "Новая версия: Касса"
Cohesion: 0.10
Nodes (60): bcDays(), compute(), reserve(), Checkbox(), kassaNow(), AddForm(), digits(), empty() (+52 more)

### Community 21 - "Новая версия: Продажи (Calendar.tsx)"
Cohesion: 0.14
Nodes (28): Calendar(), mln(), mlnCell(), mS(), plOff(), Sum(), addD(), calDayOf() (+20 more)

### Community 25 - "Новая версия: Сверка"
Cohesion: 0.13
Nodes (24): @tanstack/react-query, SC, SD, addD(), AUTO, BGroup, BzItem, bzNext() (+16 more)

### Community 26 - "Новая версия: Продажи"
Cohesion: 0.11
Nodes (33): fmt(), fmt2(), Block, BlockView(), Dash(), dateCell(), DayCash(), Pill() (+25 more)

### Community 27 - "UI shadcn (Input)"
Cohesion: 0.10
Nodes (39): FilterBar(), Input(), Select(), SelectContent(), SelectItem(), SelectScrollDownButton(), SelectScrollUpButton(), SelectTrigger() (+31 more)

### Community 28 - "Новая версия: Пользователи"
Cohesion: 0.12
Nodes (39): SheetHeader(), ago(), base, demoRows(), byRoles(), call(), can(), DEF (+31 more)

### Community 29 - "Новая версия: Задания"
Cohesion: 0.13
Nodes (36): Label(), Textarea(), HomeExtra, day(), demoStore(), errMsg(), fetchTasks(), fmtD() (+28 more)

### Community 30 - "Новая версия: каркас и данные (App.tsx)"
Cohesion: 0.11
Nodes (31): Общее в новой версии (`web/src/`), App(), Clock(), Gate(), KIT(), Loading(), PAGES, qc (+23 more)

### Community 31 - "Новая версия: каркас и данные (source.ts)"
Cohesion: 0.18
Nodes (21): @supabase/supabase-js, @supabase/supabase-js@^2.119.0, addExpenseLimited(), bzSelect(), client(), delDoc(), demoTables, getSession() (+13 more)

### Community 32 - "Старый сайт: Платежи (pay.js)"
Cohesion: 0.14
Nodes (29): addPay(), amountOf(), baseAmount(), cashless(), chip(), closeDrawer(), debtOf(), delItem() (+21 more)

### Community 33 - "Новая версия: План"
Cohesion: 0.05
Nodes (95): recharts, Batch, batchesOf(), BatchItem, batchStats(), curBatch(), docsOf(), normS() (+87 more)

### Community 34 - "Новая версия: Продажи (debts.ts)"
Cohesion: 0.27
Nodes (9): Debt, DebtPay, DebtsInfo, debtsOf(), isRepay(), num(), Orphan, saleDate() (+1 more)

### Community 35 - "Новая версия: Продажи (sales/logic.ts)"
Cohesion: 0.08
Nodes (63): xlsx, xlsx@https://cdn.sheetjs.com/xlsx-0.20.3/x..., downloadCsv(), downloadXlsx(), save(), get(), PRESETS, put() (+55 more)

### Community 36 - "Новая версия: каркас и данные (demoRows)"
Cohesion: 0.26
Nodes (7): OUT, rows(), demoRows(), iso(), rnd(), demoAll(), extras

### Community 37 - "Новая версия: Сверка (FmRecon.tsx)"
Cohesion: 0.16
Nodes (23): Chip(), Banner(), BillzPanel(), Det(), fmRcExport(), FmRecon(), FmRow, jump() (+15 more)

### Community 38 - "Новая версия: Аналитика (analytics/logic.ts)"
Cohesion: 0.12
Nodes (47): agg, CATCOL, dayList(), expFiltered(), filtered(), inRange(), matchOf(), PAYCOL (+39 more)

### Community 39 - "UI shadcn (sheet.tsx)"
Cohesion: 0.27
Nodes (7): Sheet(), SheetContent(), SheetDescription(), SheetOverlay(), SheetPortal(), SheetTitle(), FormShell()

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
Cohesion: 0.11
Nodes (18): class-variance-authority, shadcn, tw-animate-css, dependencies, class-variance-authority@^0.7.1, cn@^0.5.2, @hookform/resolvers@^7.0.2, lucide-react@^1.69.0 (+10 more)

### Community 44 - "Скрипты сверок и выгрузок (cost-export.ts)"
Cohesion: 0.15
Nodes (12): c, d, lastD, P, prods, pstat, sales, skus (+4 more)

### Community 45 - "Новая версия: Отчёт р/с (Segments)"
Cohesion: 0.10
Nodes (19): Касса Оптики — новая версия (React), Команды, Segments(), Controls(), Filters, get(), useFilters(), PER (+11 more)

### Community 46 - "Новая версия: общие компоненты (HomePage.tsx)"
Cohesion: 0.11
Nodes (30): ActionLink, SegmentItem, ChipTone, OnHero, Tile(), TileLabel(), TileSub(), TileValue() (+22 more)

### Community 48 - "Документация (docs)"
Cohesion: 0.11
Nodes (18): Варианты движка анимаций, Главная (порядок по важности), Движение (один файл правил `web/src/lib/motion.ts`), Зачем, Новая версия (web/): единый дизайн, движение, адаптация. Главная как эталон, Ограничения, Оставлено исполнителю, Остальные разделы (+10 more)

### Community 49 - "Новая версия: Аналитика (charts.tsx)"
Cohesion: 0.30
Nodes (17): Bar, BarsC(), DonutC(), GroupBarsC(), HBars(), lbl(), Legend(), LineC() (+9 more)

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
Cohesion: 0.31
Nodes (7): addD(), bzAll(), OUT, rows(), T, demoExtra(), iso()

### Community 55 - "UI shadcn (RowCards)"
Cohesion: 0.27
Nodes (12): Cards(), Grid(), Props, RowCard(), RowCards(), useOpenKey(), Table(), TableBody() (+4 more)

### Community 56 - "Новая версия: каркас и данные (access.ts)"
Cohesion: 0.16
Nodes (14): Ctx, DEF, loadAccess(), make(), PERMS, Role, ROLE_LABEL, ROLES (+6 more)

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

### Community 61 - "Новая версия: каркас и данные (react)"
Cohesion: 0.10
Nodes (23): cn, @hookform/resolvers, lucide-react, motion, radix-ui, react, react-hook-form, sonner (+15 more)

### Community 62 - "Скрипты сверок и выгрузок (sales-parity.ts)"
Cohesion: 0.24
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

### Community 66 - "Новая версия: Склад (файл, маржа)"
Cohesion: 0.13
Nodes (24): BItem, Ctx, makeCtx(), NODET, one(), unitPrice(), dShort(), reEsc() (+16 more)

### Community 68 - "Старый сайт: Роли и пользователи (inner.js)"
Cohesion: 0.33
Nodes (3): ROLE_DENY, roleFull(), roleName()

### Community 69 - "Старый сайт: Чистка (tidy.js)"
Cohesion: 0.47
Nodes (3): apply(), keyOf(), scan()

### Community 70 - "Настройки web (tsconfig.json)"
Cohesion: 0.40
Nodes (4): compilerOptions, paths, files, references

### Community 72 - "Настройки web (scripts)"
Cohesion: 0.50
Nodes (4): scripts, build, dev, preview

### Community 86 - "Новая версия: Аналитика (analytics/demo.ts)"
Cohesion: 0.23
Nodes (10): demoAll(), rows(), demoExtra(), FRAMES, iso(), LENS, OTHER, PAYS (+2 more)

### Community 87 - "Новая версия: Продажи (Card)"
Cohesion: 0.14
Nodes (31): Card(), isLink(), Dash(), Debts(), Row, ExpenseBox(), ExpMode, LIST (+23 more)

### Community 88 - "Скрипты сверок и выгрузок (analytics-parity.ts)"
Cohesion: 0.20
Nodes (10): F(), grpPick(), M0, OUT, prevM, R(), SCEN, T (+2 more)

### Community 92 - "Новая версия: Аналитика (xl.ts)"
Cohesion: 0.40
Nodes (3): FMT, XCol, XSheet

### Community 96 - "Скрипты сверок и выгрузок (plan-harness/main.tsx)"
Cohesion: 0.24
Nodes (7): react-dom, react-dom@^19.3.1, dark, Page(), qc, qs, useData()

## Knowledge Gaps
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Разделы: где код в каждой версии` connect `Старый сайт: Продажи (renderSales)` to `Старый сайт: Аналитика (renderAnalytics)`, `Новая версия: План`, `Новая версия: Склад (файл, маржа)`, `Новая версия: Аналитика`, `Новая версия: Аналитика (analytics/logic.ts)`, `Старый сайт: base.html (Таблицы)`, `Старый сайт: base.html (init)`, `Новая версия: Отчёт р/с (Segments)`, `Документация (docs)`, `Новая версия: Отчёт р/с`, `Новая версия: Платежи`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Segments()` (e.g. with `Общее в новой версии (`web/src/`)` and `Касса Оптики — новая версия (React)`) actually correct?**
  _`Segments()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Новая версия: Аналитика` be split into smaller, more focused modules?**
  _Cohesion score 0.09879032258064516 - nodes in this community are weakly interconnected._
- **Why does `Касса Оптики — инструкции для Claude` connect `Документация (Касса Оптики — инструкции для Claude)` to `Старый сайт: base.html (Таблицы)`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Should `Старый сайт: Сверка Billz (bz.js)` be split into smaller, more focused modules?**
  _Cohesion score 0.14453781512605043 - nodes in this community are weakly interconnected._
- **Why does `main()` connect `Документация (Касса Оптики — инструкции для Claude)` to `Скрипты сверок и выгрузок (os)`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Should `Сборка старого сайта: патчи` be split into smaller, more focused modules?**
  _Cohesion score 0.09475806451612903 - nodes in this community are weakly interconnected._