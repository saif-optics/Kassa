# Graph Report - Kassa  (2026-11-27)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1962 nodes · 6833 edges · 81 communities (68 shown, 13 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 188 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4aed744b`
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
- Старый сайт: Оформление полей (enhanceSelect)
- Новая версия: Склад Billz
- Старый сайт: Отрисовка (render)
- Старый сайт: base.html (init)
- Старый сайт: Заставка с логотипом
- Старый сайт: Отчёт р/с (rs.js)
- Старый сайт: base.html (Разделы: где код в каждой версии)
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
- Новая версия: Аналитика (charts.tsx)
- Настройки web (package.json)
- Новая версия: Пользователи
- Новая версия: Задания
- Новая версия: каркас и данные (App.tsx)
- Новая версия: каркас и данные (source.ts)
- Старый сайт: Платежи (pay.js)
- Новая версия: План
- Новая версия: Продажи (debts.ts)
- Новая версия: Продажи (SalesPage.tsx)
- Настройки web (ref_node_path)
- Новая версия: общие компоненты (Card)
- Старый сайт: План (pl)
- Новая версия: Аналитика (util.ts)
- Новая версия: Склад Billz (stock-billz/demo.ts)
- Настройки web (components.json)
- Старый сайт: Роли и пользователи
- Настройки web (dependencies)
- Скрипты сверок и выгрузок (cost-export.ts)
- Новая версия: Отчёт р/с (FiscalView.tsx)
- Новая версия: общие компоненты (HomePage.tsx)
- Документация (docs)
- Новая версия: Аналитика (AnalyticsPage.tsx)
- Старый сайт: Задания (tasks.js)
- Документация (Разбор проекта «Касса Оптики» — что есть, что участвует, что лишнее)
- Скрипты сверок и выгрузок (demoRows)
- Старый сайт: Продажи (renderSales)
- Новая версия: Сверка (report-parity.ts)
- Новая версия: План (PlanPage.tsx)
- Новая версия: Сверка (Switch)
- Настройки web (scripts)
- Настройки web (compilerOptions)
- Скрипты сверок и выгрузок (parity.ts)
- Настройки web (recharts)
- Новая версия: Отчёт р/с (Button)
- Скрипты сверок и выгрузок (sales-parity.ts)
- Настройки web (compilerOptions) 2
- Документация (Касса Оптики — инструкции для Claude)
- Новая версия: Аналитика (analytics/cost.ts)
- Старый сайт: Роли и пользователи (inner.js)
- Старый сайт: Чистка (tidy.js)
- Настройки web (tsconfig.json)
- Новая версия: общие компоненты (RowCards.tsx)
- Новая версия: Платежи (motion.ts)
- Документация (Осмотр новой версии (web/) — анимации и вёрстка, 25.11.2026)
- Новая версия: Аналитика (analytics/demo.ts)
- Новая версия: Продажи (web_src_lib_utils_cn)
- Скрипты сверок и выгрузок (analytics-parity.ts)

## God Nodes (most connected - your core abstractions)
1. `Button()` - 84 edges
2. `react` - 77 edges
3. `Card()` - 70 edges
4. `useIsPhone()` - 68 edges
5. `fmt()` - 63 edges
6. `Segments()` - 60 edges
7. `RowCards()` - 48 edges
8. `HomePage()` - 46 edges
9. `lucide-react` - 43 edges
10. `buildAnalytics()` - 41 edges

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

## Communities (81 total, 13 thin omitted)

### Community 0 - "Старый сайт: Аналитика (renderAnalytics)"
Cohesion: 0.21
Nodes (13): drawStack(), C, lineGaps(), niceStep(), periodLabel(), plCalc(), plConf(), plPrevShares() (+5 more)

### Community 1 - "Новая версия: Отчёт р/с"
Cohesion: 0.21
Nodes (19): ChipTone, OnHero, Tile(), TileLabel(), TileSub(), TileValue(), TONE, fmt() (+11 more)

### Community 2 - "Старый сайт: Сверка Billz (bz.js)"
Cohesion: 0.14
Nodes (32): bindItems(), bindSeg(), collectState(), dayTable(), flatItems(), get(), itemsPanel(), kassaRows() (+24 more)

### Community 4 - "Старый сайт: base.html (base.html.js)"
Cohesion: 0.06
Nodes (37): apply(), mark(), batchMatcher(), build(), compress(), confirmBtn(), finLines(), go() (+29 more)

### Community 5 - "Старый сайт: Фискальные модули (fm.js)"
Cohesion: 0.16
Nodes (22): card(), cfg(), days(), dayStat(), det(), editor(), fiscalDays(), gross() (+14 more)

### Community 6 - "Серверные функции Supabase"
Cohesion: 0.06
Nodes (46): addD(), bz(), catOf(), collectChecks(), collectStock(), collectTransfers(), CORS, costOf() (+38 more)

### Community 7 - "Новая версия: Главная"
Cohesion: 0.09
Nodes (31): Batch, batchesOf(), BatchItem, batchStats(), curBatch(), docsOf(), normS(), R (+23 more)

### Community 8 - "Старый сайт: Оформление полей (enhanceSelect)"
Cohesion: 0.24
Nodes (11): closePop(), count(), deco(), enhanceDate(), enhanceSelect(), hook(), keyOf(), openPop() (+3 more)

### Community 9 - "Новая версия: Склад Billz"
Cohesion: 0.09
Nodes (40): sonner, @tanstack/react-query, addD(), BzCheck, hm(), PER, periodOf(), sgq() (+32 more)

### Community 10 - "Старый сайт: Отрисовка (render)"
Cohesion: 0.15
Nodes (13): article(), bcDays(), cashState(), chk(), compute(), kMonths(), lay(), recFor() (+5 more)

### Community 11 - "Старый сайт: base.html (init)"
Cohesion: 0.12
Nodes (24): applyPreset(), fillCatSel(), fillMonths(), fillPhPoint(), fillSelects(), init(), lensData(), lensInfo() (+16 more)

### Community 12 - "Старый сайт: Заставка с логотипом"
Cohesion: 0.33
Nodes (10): isDark(), logoMarkup(), part(), show(), A(), applyTheme(), destroy(), exit() (+2 more)

### Community 13 - "Старый сайт: Отчёт р/с (rs.js)"
Cohesion: 0.61
Nodes (7): byMonth(), calc(), chart(), days(), months(), render(), xlsx()

### Community 14 - "Старый сайт: base.html (Разделы: где код в каждой версии)"
Cohesion: 0.14
Nodes (21): Где что лежит (таблица `public.docs`: col, id, data jsonb), applyLocal(), askDelete(), batches(), cash(), del(), delSale(), entries() (+13 more)

### Community 16 - "Старый сайт: Отрисовка (render) 2"
Cohesion: 0.23
Nodes (12): applyTpl(), attach(), pick(), place(), render(), close(), open(), renderTemplates() (+4 more)

### Community 17 - "Новая версия: Отчёт р/с (report/logic.ts)"
Cohesion: 0.09
Nodes (37): addD(), BankRow, BcItem, CAT_NAMES, Cell, dayExp(), expAmt(), expName() (+29 more)

### Community 18 - "Новая версия: Аналитика"
Cohesion: 0.10
Nodes (58): agg, Card, CATCOL, dayList(), expFiltered(), filtered(), inRange(), matchOf() (+50 more)

### Community 19 - "Новая версия: Платежи"
Cohesion: 0.12
Nodes (39): Cell(), Grid(), TileBody(), TileTop(), addM(), Amount, amountOf(), baseAmount() (+31 more)

### Community 20 - "Новая версия: Касса"
Cohesion: 0.11
Nodes (54): kassaNow(), FormVal, Articles(), DayChart(), Insights(), Split(), byDate(), F (+46 more)

### Community 21 - "Новая версия: Продажи"
Cohesion: 0.08
Nodes (51): Calendar(), mln(), mlnCell(), mS(), plOff(), Sum(), calDayOf(), calDefaultSel() (+43 more)

### Community 25 - "Новая версия: Сверка"
Cohesion: 0.09
Nodes (60): Chip(), Banner(), Filters, Det(), fmRcExport(), FmRecon(), FmRow, jump() (+52 more)

### Community 26 - "Новая версия: Аналитика (charts.tsx)"
Cohesion: 0.33
Nodes (18): renderW(), Bar, BarsC(), DonutC(), GroupBarsC(), HBars(), lbl(), Legend() (+10 more)

### Community 27 - "Настройки web (package.json)"
Cohesion: 0.15
Nodes (17): tailwindcss, tsx, @types/node, @types/react, @types/react-dom, typescript, devDependencies, tailwindcss@^4.3.4 (+9 more)

### Community 28 - "Новая версия: Пользователи"
Cohesion: 0.05
Nodes (83): FilterBar(), Select(), SelectContent(), SelectItem(), SelectScrollDownButton(), SelectScrollUpButton(), SelectTrigger(), SelectValue() (+75 more)

### Community 29 - "Новая версия: Задания"
Cohesion: 0.13
Nodes (35): Textarea(), HomeExtra, day(), demoStore(), errMsg(), fetchTasks(), fmtD(), fmtT() (+27 more)

### Community 30 - "Новая версия: каркас и данные (App.tsx)"
Cohesion: 0.08
Nodes (40): Общее в новой версии (`web/src/`), Clock(), Gate(), KIT(), Loading(), PAGES, qc, Shell() (+32 more)

### Community 31 - "Новая версия: каркас и данные (source.ts)"
Cohesion: 0.11
Nodes (32): react-dom, @supabase/supabase-js, react-dom@^19.3.1, dark, Page(), qc, qs, App() (+24 more)

### Community 32 - "Старый сайт: Платежи (pay.js)"
Cohesion: 0.14
Nodes (29): addPay(), amountOf(), baseAmount(), cashless(), chip(), closeDrawer(), debtOf(), delItem() (+21 more)

### Community 33 - "Новая версия: План"
Cohesion: 0.12
Nodes (31): addD(), buildPlanDoc(), DayBar, defaultCfg(), discOf(), dow(), isFrame(), monthEnd() (+23 more)

### Community 34 - "Новая версия: Продажи (debts.ts)"
Cohesion: 0.31
Nodes (8): Debt, DebtPay, DebtsInfo, debtsOf(), isRepay(), num(), Orphan, saleDate()

### Community 35 - "Новая версия: Продажи (SalesPage.tsx)"
Cohesion: 0.10
Nodes (43): ExpMode, downloadCsv(), downloadXlsx(), save(), get(), PRESETS, put(), SalesFilter() (+35 more)

### Community 36 - "Настройки web (ref_node_path)"
Cohesion: 0.21
Nodes (8): @tailwindcss/vite, vite, @vitejs/plugin-react, @tailwindcss/vite@^4.3.4, vite@^8.3.6, @vitejs/plugin-react@^6.2.1, root, root

### Community 37 - "Новая версия: общие компоненты (Card)"
Cohesion: 0.12
Nodes (29): xlsx, ActionLink, Card(), isLink(), InlineNumber(), InlineText(), NumProps, RowCards() (+21 more)

### Community 38 - "Старый сайт: План (pl)"
Cohesion: 0.21
Nodes (13): batchStats(), curBatch(), pl(), plFcast(), plStats(), renderCal(), renderCalDay(), renderHome() (+5 more)

### Community 39 - "Новая версия: Аналитика (util.ts)"
Cohesion: 0.15
Nodes (19): AnFilter(), PRESETS, Flt, monthOf(), monthRange(), pointColor(), presetRange(), PRESETS (+11 more)

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
Cohesion: 0.09
Nodes (22): class-variance-authority, @hookform/resolvers, react-hook-form, shadcn, tw-animate-css, zod, dependencies, class-variance-authority@^0.7.1 (+14 more)

### Community 44 - "Скрипты сверок и выгрузок (cost-export.ts)"
Cohesion: 0.15
Nodes (12): c, d, lastD, P, prods, pstat, sales, skus (+4 more)

### Community 45 - "Новая версия: Отчёт р/с (FiscalView.tsx)"
Cohesion: 0.12
Nodes (35): SegmentItem, Segments(), pl(), Editor(), FiscalView(), FmState, PointCard(), PrepBanner() (+27 more)

### Community 46 - "Новая версия: общие компоненты (HomePage.tsx)"
Cohesion: 0.11
Nodes (33): Bento(), Item(), R16, S12, S16, S6, Cols, Row() (+25 more)

### Community 48 - "Документация (docs)"
Cohesion: 0.09
Nodes (20): Варианты движка анимаций, Главная (порядок по важности), Движение (один файл правил `web/src/lib/motion.ts`), Зачем, Новая версия (web/): единый дизайн, движение, адаптация. Главная как эталон, Ограничения, Оставлено исполнителю, Остальные разделы (+12 more)

### Community 49 - "Новая версия: Аналитика (AnalyticsPage.tsx)"
Cohesion: 0.10
Nodes (48): dark, Page(), qc, qs, PageHead(), AnalyticsPage(), Owner(), readHints() (+40 more)

### Community 50 - "Старый сайт: Задания (tasks.js)"
Cohesion: 0.31
Nodes (15): card(), draw(), filtered(), filters(), formAdmin(), formProblem(), kpis(), listHtml() (+7 more)

### Community 51 - "Документация (Разбор проекта «Касса Оптики» — что есть, что участвует, что лишнее)"
Cohesion: 0.14
Nodes (13): 1. Из чего состоит проект (пять частей), 3. База и сервер Supabase (`kassa-optiki`), 4. Вне репозитория, но связано с проектом (на этом компьютере), 5. Локальные серверы, 6. Итог: что лишнее и что с этим можно сделать, А. Можно убрать без последствий (сайт и проверки не затрагивает), Б. Под вопросом (нужно ваше решение), В. Трогать нельзя (+5 more)

### Community 52 - "Скрипты сверок и выгрузок (demoRows)"
Cohesion: 0.12
Nodes (24): demoAll(), OUT, rows(), demoAll(), homeView(), nz(), OUT, planView() (+16 more)

### Community 53 - "Старый сайт: Продажи (renderSales)"
Cohesion: 0.25
Nodes (9): dayCashRows(), debtsOf(), flash(), periodKey(), periodSheet(), periodsIn(), prevList(), renderDebts() (+1 more)

### Community 54 - "Новая версия: Сверка (report-parity.ts)"
Cohesion: 0.18
Nodes (15): addD(), bzAll(), OUT, rows(), T, B, build(), bzChecks (+7 more)

### Community 55 - "Новая версия: План (PlanPage.tsx)"
Cohesion: 0.18
Nodes (25): DaysChart(), Tip(), WeeksTable(), dLong(), fmt(), fmtM(), pctF(), planMonths() (+17 more)

### Community 56 - "Новая версия: Сверка (Switch)"
Cohesion: 0.39
Nodes (5): Switch(), Controls(), get(), useFilters(), Field

### Community 57 - "Настройки web (scripts)"
Cohesion: 0.50
Nodes (4): scripts, build, dev, preview

### Community 58 - "Настройки web (compilerOptions)"
Cohesion: 0.14
Nodes (13): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+5 more)

### Community 59 - "Скрипты сверок и выгрузок (parity.ts)"
Cohesion: 0.17
Nodes (11): byCol(), ctx, data, db, M0, repDocs, rows, snap() (+3 more)

### Community 61 - "Новая версия: Отчёт р/с (Button)"
Cohesion: 0.12
Nodes (27): cn, lucide-react, radix-ui, react, schema, Button(), buttonVariants, Checkbox() (+19 more)

### Community 62 - "Скрипты сверок и выгрузок (sales-parity.ts)"
Cohesion: 0.22
Nodes (9): compute(), num0(), OUT, rows(), Scn, T, demoExtra(), iso() (+1 more)

### Community 63 - "Настройки web (compilerOptions) 2"
Cohesion: 0.17
Nodes (11): compilerOptions, allowImportingTsExtensions, lib, module, moduleResolution, noEmit, skipLibCheck, strict (+3 more)

### Community 65 - "Документация (Касса Оптики — инструкции для Claude)"
Cohesion: 0.10
Nodes (17): Задания и проблемы по точкам — вкладка «Задания», с 23.11.2026, Карта кода (Graphify), Касса Оптики — инструкции для Claude, Код, Правила работы, Приход сотрудников (Face ID) — папка `smena/`, с 15.11.2026, Распределение работы (экономия токенов) — решение владельца 06.11.2026, Роли доступа (с 16.11.2026, права-переключатели с 17.11.2026) (+9 more)

### Community 66 - "Новая версия: Аналитика (analytics/cost.ts)"
Cohesion: 0.08
Nodes (32): Batch, BItem, cache, Ctx, DEF_CATS, DEF_POINTS, FinCfg, isContact() (+24 more)

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
Cohesion: 0.24
Nodes (13): Cards(), Grid(), Props, RowCard(), useOpenKey(), Shades(), useScrollShade(), Table() (+5 more)

### Community 75 - "Новая версия: Платежи (motion.ts)"
Cohesion: 0.19
Nodes (12): motion, DayBar, dDiff(), Status, ICONS, Kpi(), ST, StatusChip() (+4 more)

### Community 79 - "Документация (Осмотр новой версии (web/) — анимации и вёрстка, 25.11.2026)"
Cohesion: 0.29
Nodes (6): А. Видно сразу, Б. Анимации, В. Телефон (iPhone 15/16 Pro Max), Г. Ноутбук и ПК, Осмотр новой версии (web/) — анимации и вёрстка, 25.11.2026, Что сделано правильно (не трогать)

### Community 86 - "Новая версия: Аналитика (analytics/demo.ts)"
Cohesion: 0.24
Nodes (9): rows(), demoExtra(), FRAMES, iso(), LENS, OTHER, PAYS, rnd() (+1 more)

### Community 87 - "Новая версия: Продажи (web_src_lib_utils_cn)"
Cohesion: 0.08
Nodes (58): Block, BlockView(), Dash(), dateCell(), DayCash(), Pill(), ExpenseBox(), LIST (+50 more)

### Community 88 - "Скрипты сверок и выгрузок (analytics-parity.ts)"
Cohesion: 0.21
Nodes (11): F(), grpPick(), M0, norm(), normM(), OUT, prevM, R() (+3 more)

## Knowledge Gaps
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Разделы: где код в каждой версии` connect `Старый сайт: base.html (Разделы: где код в каждой версии)` to `Старый сайт: Аналитика (renderAnalytics)`, `Новая версия: Аналитика (analytics/cost.ts)`, `Старый сайт: План (pl)`, `Новая версия: Главная`, `Новая версия: Отчёт р/с (FiscalView.tsx)`, `Документация (docs)`, `Новая версия: Отчёт р/с (report/logic.ts)`, `Новая версия: Аналитика`, `Новая версия: Платежи`, `Старый сайт: Продажи (renderSales)`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Should `Старый сайт: Сверка Billz (bz.js)` be split into smaller, more focused modules?**
  _Cohesion score 0.14453781512605043 - nodes in this community are weakly interconnected._
- **Why does `Касса Оптики — инструкции для Claude` connect `Документация (Касса Оптики — инструкции для Claude)` to `Старый сайт: base.html (Разделы: где код в каждой версии)`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Should `Сборка старого сайта: патчи` be split into smaller, more focused modules?**
  _Cohesion score 0.09475806451612903 - nodes in this community are weakly interconnected._
- **Why does `main()` connect `Документация (Касса Оптики — инструкции для Claude)` to `Скрипты сверок и выгрузок (os)`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `Старый сайт: base.html (base.html.js)` be split into smaller, more focused modules?**
  _Cohesion score 0.06274509803921569 - nodes in this community are weakly interconnected._
- **Should `Серверные функции Supabase` be split into smaller, more focused modules?**
  _Cohesion score 0.061495457721872815 - nodes in this community are weakly interconnected._