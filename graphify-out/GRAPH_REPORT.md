# Graph Report - Kassa  (2026-11-27)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1987 nodes · 7058 edges · 88 communities (74 shown, 14 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 188 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1937215c`
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
- Новая версия: Главная
- Старый сайт: Оформление полей (enhanceSelect)
- Новая версия: Склад Billz
- Старый сайт: Отрисовка (render)
- Старый сайт: План (pl)
- Старый сайт: Заставка с логотипом
- Старый сайт: Отчёт р/с (rs.js)
- Старый сайт: base.html (Разделы: где код в каждой версии)
- Старый сайт: Отрисовка (render) 2
- Новая версия: Отчёт р/с
- Новая версия: Аналитика (exports.ts)
- Новая версия: Платежи
- Новая версия: Касса
- Новая версия: Продажи
- Старый сайт: Тесты (mk)
- Сборка старого сайта
- Документация (README.md)
- Новая версия: Сверка
- Новая версия: каркас и данные (source.ts)
- Настройки web (package.json)
- Новая версия: Пользователи
- Новая версия: Задания
- Новая версия: каркас и данные (App.tsx)
- Новая версия: Платежи (Editor.tsx)
- Старый сайт: Платежи (pay.js)
- Новая версия: План
- Новая версия: Продажи (DebtsPanel.tsx)
- Новая версия: Продажи (sales/logic.ts)
- Настройки web (ref_node_path)
- Новая версия: общие компоненты (Card)
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
- UI shadcn (button.tsx)
- Скрипты сверок и выгрузок (demoRows)
- Новая версия: План (PlanPage.tsx)
- Новая версия: Аналитика (charts.tsx)
- Настройки web (scripts)
- Настройки web (compilerOptions)
- Скрипты сверок и выгрузок (parity.ts)
- Настройки web (@supabase/supabase-js)
- UI shadcn (analytics/filter.tsx)
- Скрипты сверок и выгрузок (sales-parity.ts)
- Настройки web (compilerOptions) 2
- Старый сайт: Продажи (renderSales)
- Документация (Касса Оптики — инструкции для Claude)
- Новая версия: Аналитика (analytics/cost.ts)
- Старый сайт: Роли и пользователи (inner.js)
- Старый сайт: Чистка (tidy.js)
- Настройки web (tsconfig.json)
- Новая версия: общие компоненты (react)
- Старый сайт: base.html (init)
- Новая версия: Касса (lucide-react)
- Новая версия: Продажи (Stats.tsx)
- Скрипты сверок и выгрузок (plan-harness/main.tsx)
- Новая версия: План (Points.tsx)
- Новая версия: План (plan/Settings.tsx)
- Документация (Осмотр новой версии (web/) — анимации и вёрстка, 25.11.2026)
- Настройки web (shadcn@^4.23.0)
- Новая версия: Аналитика (analytics/demo.ts)
- Новая версия: Продажи (Button)
- Скрипты сверок и выгрузок (analytics-parity.ts)

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

## Communities (88 total, 14 thin omitted)

### Community 0 - "Старый сайт: Аналитика (renderAnalytics)"
Cohesion: 0.21
Nodes (13): drawStack(), C, lineGaps(), niceStep(), periodLabel(), plCalc(), plConf(), plPrevShares() (+5 more)

### Community 1 - "Новая версия: Аналитика"
Cohesion: 0.11
Nodes (47): AnFilter(), PRESETS, CATCOL, filtered(), Flt, matchOf(), monthOf(), monthRange() (+39 more)

### Community 2 - "Старый сайт: Сверка Billz (bz.js)"
Cohesion: 0.14
Nodes (32): bindItems(), bindSeg(), collectState(), dayTable(), flatItems(), get(), itemsPanel(), kassaRows() (+24 more)

### Community 4 - "Старый сайт: base.html (base.html.js)"
Cohesion: 0.06
Nodes (45): apply(), mark(), batchMatcher(), bcDays(), build(), compress(), fillCatSel(), fillPhPoint() (+37 more)

### Community 5 - "Старый сайт: Фискальные модули (fm.js)"
Cohesion: 0.16
Nodes (23): card(), cfg(), days(), dayStat(), det(), editor(), fiscalDays(), gross() (+15 more)

### Community 6 - "Серверные функции Supabase"
Cohesion: 0.06
Nodes (46): addD(), bz(), catOf(), collectChecks(), collectStock(), collectTransfers(), CORS, costOf() (+38 more)

### Community 7 - "Новая версия: Главная"
Cohesion: 0.09
Nodes (25): Batch, batchesOf(), BatchItem, batchStats(), curBatch(), docsOf(), normS(), R (+17 more)

### Community 8 - "Старый сайт: Оформление полей (enhanceSelect)"
Cohesion: 0.23
Nodes (12): closePop(), count(), deco(), enhanceDate(), enhanceSelect(), hook(), keyOf(), openPop() (+4 more)

### Community 9 - "Новая версия: Склад Billz"
Cohesion: 0.12
Nodes (33): Det(), jump(), BzCheck, dL(), dS(), hm(), PER, Dash() (+25 more)

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
Cohesion: 0.14
Nodes (20): Где что лежит (таблица `public.docs`: col, id, data jsonb), applyLocal(), askDelete(), batches(), cash(), del(), delSale(), entries() (+12 more)

### Community 16 - "Старый сайт: Отрисовка (render) 2"
Cohesion: 0.23
Nodes (12): applyTpl(), attach(), pick(), place(), render(), close(), open(), renderTemplates() (+4 more)

### Community 17 - "Новая версия: Отчёт р/с"
Cohesion: 0.07
Nodes (75): xlsx, pl(), todayTash(), DayReport(), Editor(), FiscalView(), FmState, PointCard() (+67 more)

### Community 18 - "Новая версия: Аналитика (exports.ts)"
Cohesion: 0.15
Nodes (28): agg, dayList(), expFiltered(), inRange(), periodTxt(), checkKey(), discOf(), isContact() (+20 more)

### Community 19 - "Новая версия: Платежи"
Cohesion: 0.10
Nodes (45): Cell(), Grid(), Chip(), ChipTone, OnHero, TileBody(), TileTop(), TONE (+37 more)

### Community 20 - "Новая версия: Касса"
Cohesion: 0.07
Nodes (83): compute(), reserve(), Item(), R16, S12, S16, S6, Cols (+75 more)

### Community 21 - "Новая версия: Продажи"
Cohesion: 0.25
Nodes (19): Cal, CalendarBlock(), ckWord(), DayBlock(), DayList(), mln(), mS(), planOf() (+11 more)

### Community 25 - "Новая версия: Сверка"
Cohesion: 0.08
Nodes (63): Banner(), BillzPanel(), Filters, get(), useFilters(), fmRcExport(), FmRow, ST (+55 more)

### Community 26 - "Новая версия: каркас и данные (source.ts)"
Cohesion: 0.13
Nodes (28): Ctx, DEF, loadAccess(), make(), PERMS, Role, ROLE_LABEL, ROLES (+20 more)

### Community 27 - "Настройки web (package.json)"
Cohesion: 0.13
Nodes (19): tailwindcss, tsx, tw-animate-css, @types/node, @types/react, @types/react-dom, typescript, tw-animate-css@^1.4.0 (+11 more)

### Community 28 - "Новая версия: Пользователи"
Cohesion: 0.12
Nodes (40): SheetHeader(), ago(), base, demoRows(), byRoles(), call(), can(), DEF (+32 more)

### Community 29 - "Новая версия: Задания"
Cohesion: 0.13
Nodes (35): Textarea(), HomeExtra, day(), demoStore(), errMsg(), fetchTasks(), fmtD(), fmtT() (+27 more)

### Community 30 - "Новая версия: каркас и данные (App.tsx)"
Cohesion: 0.11
Nodes (29): App(), Clock(), Gate(), KIT(), Loading(), PAGES, qc, Shell() (+21 more)

### Community 31 - "Новая версия: Платежи (Editor.tsx)"
Cohesion: 0.16
Nodes (21): InlineNumber(), InlineText(), NumProps, Switch(), Editor(), F, Field(), fromForm() (+13 more)

### Community 32 - "Старый сайт: Платежи (pay.js)"
Cohesion: 0.14
Nodes (29): addPay(), amountOf(), baseAmount(), cashless(), chip(), closeDrawer(), debtOf(), delItem() (+21 more)

### Community 33 - "Новая версия: План"
Cohesion: 0.16
Nodes (28): barLabel(), homeData(), addD(), checkKey(), defaultCfg(), discOf(), dow(), isContact() (+20 more)

### Community 34 - "Новая версия: Продажи (DebtsPanel.tsx)"
Cohesion: 0.19
Nodes (15): Debt, DebtPay, DebtsInfo, debtsOf(), isRepay(), num(), Orphan, saleDate() (+7 more)

### Community 35 - "Новая версия: Продажи (sales/logic.ts)"
Cohesion: 0.08
Nodes (41): agg, calDayOf(), calOf(), calPay(), checkKey(), csvOf(), ctxOf(), dayExpOf() (+33 more)

### Community 36 - "Настройки web (ref_node_path)"
Cohesion: 0.21
Nodes (8): @tailwindcss/vite, vite, @vitejs/plugin-react, @tailwindcss/vite@^4.3.4, vite@^8.3.6, @vitejs/plugin-react@^6.2.1, root, root

### Community 37 - "Новая версия: общие компоненты (Card)"
Cohesion: 0.10
Nodes (42): sonner, @tanstack/react-query, Card(), RowCards(), RowColumn, SegmentItem, Segments(), Tile() (+34 more)

### Community 38 - "Новая версия: Продажи (SalesPage.tsx)"
Cohesion: 0.11
Nodes (32): CashBlock(), CashBlockData, Dash(), dateCell(), KassaChip(), PointTable(), ExpMode, downloadCsv() (+24 more)

### Community 39 - "Новая версия: Продажи (sales/filter.tsx)"
Cohesion: 0.16
Nodes (24): Fields(), get(), put(), SalesFilter(), state, sub(), subs, useSalesFilter() (+16 more)

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
Nodes (23): class-variance-authority, cn, @hookform/resolvers, react-hook-form, zod, dependencies, class-variance-authority@^0.7.1, cn@^0.5.2 (+15 more)

### Community 44 - "Скрипты сверок и выгрузок (cost-export.ts)"
Cohesion: 0.15
Nodes (12): c, d, lastD, P, prods, pstat, sales, skus (+4 more)

### Community 45 - "Новая версия: Отчёт р/с (ui.tsx)"
Cohesion: 0.19
Nodes (8): Head, lsGet(), lsSet(), SIZES, sp(), Tone, TONES, usePaging()

### Community 46 - "Новая версия: Главная (HomePage.tsx)"
Cohesion: 0.18
Nodes (19): Общее в новой версии (`web/src/`), Bento(), PageHead(), AL_ICON, AL_TONE, C, GO(), HeroLine() (+11 more)

### Community 48 - "Документация (docs)"
Cohesion: 0.09
Nodes (20): Варианты движка анимаций, Главная (порядок по важности), Движение (один файл правил `web/src/lib/motion.ts`), Зачем, Новая версия (web/): единый дизайн, движение, адаптация. Главная как эталон, Ограничения, Оставлено исполнителю, Остальные разделы (+12 more)

### Community 49 - "Новая версия: Аналитика (AnalyticsPage.tsx)"
Cohesion: 0.10
Nodes (49): motion, dark, Page(), qc, qs, AnalyticsPage(), Owner(), readHints() (+41 more)

### Community 50 - "Старый сайт: Задания (tasks.js)"
Cohesion: 0.31
Nodes (15): card(), draw(), filtered(), filters(), formAdmin(), formProblem(), kpis(), listHtml() (+7 more)

### Community 51 - "Документация (Разбор проекта «Касса Оптики» — что есть, что участвует, что лишнее)"
Cohesion: 0.14
Nodes (13): 1. Из чего состоит проект (пять частей), 3. База и сервер Supabase (`kassa-optiki`), 4. Вне репозитория, но связано с проектом (на этом компьютере), 5. Локальные серверы, 6. Итог: что лишнее и что с этим можно сделать, А. Можно убрать без последствий (сайт и проверки не затрагивает), Б. Под вопросом (нужно ваше решение), В. Трогать нельзя (+5 more)

### Community 52 - "Скрипты сверок и выгрузок (plan-parity.ts)"
Cohesion: 0.21
Nodes (14): demoAll(), homeView(), nz(), OUT, planView(), rows(), demoExtra(), FRAMES (+6 more)

### Community 53 - "UI shadcn (button.tsx)"
Cohesion: 0.20
Nodes (17): radix-ui, FilterBar(), buttonVariants, Sheet(), SheetContent(), SheetDescription(), SheetOverlay(), SheetPortal() (+9 more)

### Community 54 - "Скрипты сверок и выгрузок (demoRows)"
Cohesion: 0.11
Nodes (24): OUT, rows(), addD(), bzAll(), OUT, rows(), T, B (+16 more)

### Community 55 - "Новая версия: План (PlanPage.tsx)"
Cohesion: 0.18
Nodes (23): recharts, DaysChart(), Tip(), WeeksTable(), DayBar, dLong(), dShort(), fmtM() (+15 more)

### Community 56 - "Новая версия: Аналитика (charts.tsx)"
Cohesion: 0.33
Nodes (18): renderW(), Bar, BarsC(), DonutC(), GroupBarsC(), HBars(), lbl(), Legend() (+10 more)

### Community 57 - "Настройки web (scripts)"
Cohesion: 0.50
Nodes (4): scripts, build, dev, preview

### Community 58 - "Настройки web (compilerOptions)"
Cohesion: 0.14
Nodes (13): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+5 more)

### Community 59 - "Скрипты сверок и выгрузок (parity.ts)"
Cohesion: 0.17
Nodes (11): byCol(), ctx, data, db, M0, repDocs, rows, snap() (+3 more)

### Community 61 - "UI shadcn (analytics/filter.tsx)"
Cohesion: 0.12
Nodes (26): Select(), SelectContent(), SelectItem(), SelectScrollDownButton(), SelectScrollUpButton(), SelectTrigger(), SelectValue(), Tabs() (+18 more)

### Community 62 - "Скрипты сверок и выгрузок (sales-parity.ts)"
Cohesion: 0.24
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
Cohesion: 0.08
Nodes (34): Batch, BItem, cache, Ctx, DEF_CATS, DEF_POINTS, FinCfg, ItemRule (+26 more)

### Community 68 - "Старый сайт: Роли и пользователи (inner.js)"
Cohesion: 0.33
Nodes (3): ROLE_DENY, roleFull(), roleName()

### Community 69 - "Старый сайт: Чистка (tidy.js)"
Cohesion: 0.47
Nodes (3): apply(), keyOf(), scan()

### Community 70 - "Настройки web (tsconfig.json)"
Cohesion: 0.40
Nodes (4): compilerOptions, paths, files, references

### Community 71 - "Новая версия: общие компоненты (react)"
Cohesion: 0.23
Nodes (14): react, Cards(), Grid(), Props, RowCard(), useOpenKey(), Shades(), useScrollShade() (+6 more)

### Community 72 - "Старый сайт: base.html (init)"
Cohesion: 0.20
Nodes (14): applyPreset(), fillMonths(), init(), lsGet(), phMsg(), putSale(), renderAll(), renderAnPointSeg() (+6 more)

### Community 74 - "Новая версия: Касса (lucide-react)"
Cohesion: 0.26
Nodes (10): lucide-react, Checkbox(), AddForm(), digits(), empty(), FormVal, FState, Props (+2 more)

### Community 75 - "Новая версия: Продажи (Stats.tsx)"
Cohesion: 0.22
Nodes (9): Ctx, Filter, Group, StF, Dash(), GROUPS, NOFILT, RevenueChart() (+1 more)

### Community 76 - "Скрипты сверок и выгрузок (plan-harness/main.tsx)"
Cohesion: 0.25
Nodes (6): react-dom, react-dom@^19.3.1, dark, Page(), qc, qs

### Community 77 - "Новая версия: План (Points.tsx)"
Cohesion: 0.33
Nodes (8): pctF(), PlanCalc, plColor(), PointRow, Cell(), PCOL, pointColor(), Points()

### Community 78 - "Новая версия: План (plan/Settings.tsx)"
Cohesion: 0.52
Nodes (6): buildPlanDoc(), parseAmt(), PlanCfg, comma(), PlanSettings(), Stop()

### Community 79 - "Документация (Осмотр новой версии (web/) — анимации и вёрстка, 25.11.2026)"
Cohesion: 0.29
Nodes (6): А. Видно сразу, Б. Анимации, В. Телефон (iPhone 15/16 Pro Max), Г. Ноутбук и ПК, Осмотр новой версии (web/) — анимации и вёрстка, 25.11.2026, Что сделано правильно (не трогать)

### Community 86 - "Новая версия: Аналитика (analytics/demo.ts)"
Cohesion: 0.23
Nodes (10): demoAll(), rows(), demoExtra(), FRAMES, iso(), LENS, OTHER, PAYS (+2 more)

### Community 87 - "Новая версия: Продажи (Button)"
Cohesion: 0.14
Nodes (36): ActionLink, isLink(), Button(), Input(), ExpenseBox(), LIST, Wrap(), KLBL (+28 more)

### Community 88 - "Скрипты сверок и выгрузок (analytics-parity.ts)"
Cohesion: 0.21
Nodes (11): F(), grpPick(), M0, norm(), normM(), OUT, prevM, R() (+3 more)

## Knowledge Gaps
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Разделы: где код в каждой версии` connect `Старый сайт: base.html (Разделы: где код в каждой версии)` to `Старый сайт: Аналитика (renderAnalytics)`, `Старый сайт: Продажи (renderSales)`, `Новая версия: Аналитика`, `Новая версия: План`, `Новая версия: Аналитика (analytics/cost.ts)`, `Старый сайт: План (pl)`, `Новая версия: Отчёт р/с (ui.tsx)`, `Новая версия: Главная (HomePage.tsx)`, `Документация (docs)`, `Новая версия: Отчёт р/с`, `Новая версия: Аналитика (exports.ts)`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Should `Новая версия: Аналитика` be split into smaller, more focused modules?**
  _Cohesion score 0.1063973063973064 - nodes in this community are weakly interconnected._
- **Why does `Касса Оптики — инструкции для Claude` connect `Документация (Касса Оптики — инструкции для Claude)` to `Старый сайт: base.html (Разделы: где код в каждой версии)`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Should `Старый сайт: Сверка Billz (bz.js)` be split into smaller, more focused modules?**
  _Cohesion score 0.14453781512605043 - nodes in this community are weakly interconnected._
- **Why does `main()` connect `Документация (Касса Оптики — инструкции для Claude)` to `Скрипты сверок и выгрузок (os)`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Should `Сборка старого сайта: патчи` be split into smaller, more focused modules?**
  _Cohesion score 0.09475806451612903 - nodes in this community are weakly interconnected._
- **Should `Старый сайт: base.html (base.html.js)` be split into smaller, more focused modules?**
  _Cohesion score 0.056107539450613676 - nodes in this community are weakly interconnected._