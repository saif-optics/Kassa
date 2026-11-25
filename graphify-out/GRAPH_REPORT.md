# Graph Report - Kassa  (2026-11-25)

## Corpus Check
- 223 files · ~217,935 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: .css 9, (none) 3)

## Summary
- 2003 nodes · 6796 edges · 99 communities (75 shown, 24 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 176 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c5d59b3e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Старый сайт: графики аналитики и партии
- analytics/cost.ts
- Старый сайт: Сверка Billz (bz.js)
- Сборка старого сайта: патчи patch_*.py
- Старый сайт: Склад, партии, загрузка файлов
- Старый сайт: Фискальные модули (fm.js)
- Серверные функции Supabase: Billz, пользователи
- Новая версия: Сверка и остатки Billz
- Старый сайт: оформление полей и списков
- BzStockView.tsx
- Старый сайт: расчёт кассы (cashState) и статьи
- Старый сайт: Продажи — форма и выбор
- Заставка с логотипом (splash)
- Старый сайт: Отчёт р/с (rs.js)
- Разделы: где код в каждой версии
- Старый сайт: шаблоны и всплывающие окна
- Новая версия: Отчёт р/с и фискальные — расчёты
- Новая версия: Аналитика и Линзы — страницы и графики
- pay/logic.ts
- Новая версия: Касса
- Новая версия: Продажи — расчёты
- Тесты: фейк Supabase
- Документация: dev/README
- Документация: README
- Button
- Новая версия: Продажи — детали, фото, журнал
- UI shadcn: формы и витрина компонентов
- Новая версия: Пользователи
- Новая версия: Задания
- Новая версия: каркас приложения и меню
- source.ts
- Старый сайт: Платежи (pay.js)
- home/logic.ts
- DebtsPanel.tsx
- Новая версия: Продажи — выгрузки и расходы
- Демо-данные и сверка отчёта
- base.ts
- analytics/logic.ts
- FilterBar
- Демо-данные Billz и сверки
- Настройки shadcn
- Старый сайт: Пользователи (users.js)
- Зависимости web (package.json)
- Скрипты: себестоимость и сверка Кассы
- Editor.tsx
- HomePage.tsx
- lucide-react
- Документация: спека нового дизайна
- Старый сайт: касса дня и долги
- Старый сайт: Задания (tasks.js)
- recharts
- Демо-данные Главной и Плана
- package.json
- Новая версия: RowCards и таблицы
- Новая версия: доступ по ролям (access.ts)
- Новая версия: Продажи — календарь
- Настройки TypeScript
- Скрипты: сверка Платежей
- Настройки сборки Vite
- react
- Скрипты: сверка Продаж
- Настройки TypeScript
- Зависимости web (package.json)
- Документация: CLAUDE.md
- useIsPhone
- Старый сайт: роли внутри разделов (inner.js)
- Старый сайт: чистка (tidy.js)
- Настройки TypeScript
- UI: уведомления (sonner)
- Скрипты npm
- Зависимости web
- Зависимости web
- analytics/parts.tsx
- pay/Settings.tsx
- Зависимости web
- sales/filter.tsx
- tasks/parts.tsx
- pl
- analytics/demo.ts
- SaleForm.tsx
- analytics-parity.ts
- DayCash.tsx
- renderMargin
- xl.ts
- nav.ts
- echarts-for-react
- react-admin
- react-dom
- react-hook-form
- tw-animate-css

## God Nodes (most connected - your core abstractions)
1. `Button()` - 91 edges
2. `react` - 84 edges
3. `Card()` - 70 edges
4. `fmt()` - 64 edges
5. `Segments()` - 56 edges
6. `useIsPhone()` - 53 edges
7. `RowCards()` - 48 edges
8. `lucide-react` - 47 edges
9. `Input()` - 41 edges
10. `buildAnalytics()` - 41 edges

## Surprising Connections (you probably didn't know these)
- `Движение (один файл правил `web/src/lib/motion.ts`)` --references--> `land()`  [INFERRED]
  docs/superpowers/specs/2026-11-24-new-design-home-design.md → web/src/lib/motion.ts
- `Распределение работы (экономия токенов) — решение владельца 06.11.2026` --references--> `rpc()`  [INFERRED]
  CLAUDE.md → web/src/lib/source.ts
- `Где что лежит (таблица `public.docs`: col, id, data jsonb)` --references--> `entries()`  [INFERRED]
  CLAUDE.md → dev/graph-src/base.html.js
- `Разделы: где код в каждой версии` --references--> `renderHome()`  [INFERRED]
  docs/КАРТА_ПРОЕКТА.md → dev/graph-src/base.html.js
- `Разделы: где код в каждой версии` --references--> `renderSales()`  [INFERRED]
  docs/КАРТА_ПРОЕКТА.md → dev/graph-src/base.html.js

## Import Cycles
- None detected.

## Communities (99 total, 24 thin omitted)

### Community 0 - "Старый сайт: графики аналитики и партии"
Cohesion: 0.21
Nodes (13): drawStack(), C, lineGaps(), niceStep(), periodLabel(), plCalc(), plConf(), plPrevShares() (+5 more)

### Community 1 - "analytics/cost.ts"
Cohesion: 0.06
Nodes (47): inRange(), Batch, BItem, cache, Ctx, DEF_CATS, DEF_POINTS, FinCfg (+39 more)

### Community 2 - "Старый сайт: Сверка Billz (bz.js)"
Cohesion: 0.14
Nodes (32): bindItems(), bindSeg(), collectState(), dayTable(), flatItems(), get(), itemsPanel(), kassaRows() (+24 more)

### Community 4 - "Старый сайт: Склад, партии, загрузка файлов"
Cohesion: 0.07
Nodes (33): apply(), applyLocal(), mark(), build(), cash(), compress(), del(), finLines() (+25 more)

### Community 5 - "Старый сайт: Фискальные модули (fm.js)"
Cohesion: 0.16
Nodes (22): card(), cfg(), days(), dayStat(), det(), editor(), fiscalDays(), gross() (+14 more)

### Community 6 - "Серверные функции Supabase: Billz, пользователи"
Cohesion: 0.06
Nodes (46): addD(), bz(), catOf(), collectChecks(), collectStock(), collectTransfers(), CORS, costOf() (+38 more)

### Community 7 - "Новая версия: Сверка и остатки Billz"
Cohesion: 0.08
Nodes (69): Segments(), Chip(), Banner(), BillzPanel(), SC, SD, Controls(), Filters (+61 more)

### Community 8 - "Старый сайт: оформление полей и списков"
Cohesion: 0.23
Nodes (12): closePop(), count(), deco(), enhanceDate(), enhanceSelect(), hook(), keyOf(), openPop() (+4 more)

### Community 9 - "BzStockView.tsx"
Cohesion: 0.09
Nodes (45): addD(), BzCheck, bzRefresh(), dS(), fq(), hm(), PER, periodOf() (+37 more)

### Community 10 - "Старый сайт: расчёт кассы (cashState) и статьи"
Cohesion: 0.20
Nodes (10): article(), cashState(), chk(), kMonths(), lay(), recFor(), recM(), render() (+2 more)

### Community 11 - "Старый сайт: Продажи — форма и выбор"
Cohesion: 0.12
Nodes (24): applyPreset(), fillCatSel(), fillMonths(), fillPhPoint(), fillSelects(), init(), lensData(), lensInfo() (+16 more)

### Community 12 - "Заставка с логотипом (splash)"
Cohesion: 0.33
Nodes (10): isDark(), logoMarkup(), part(), show(), A(), applyTheme(), destroy(), exit() (+2 more)

### Community 13 - "Старый сайт: Отчёт р/с (rs.js)"
Cohesion: 0.61
Nodes (7): byMonth(), calc(), chart(), days(), months(), render(), xlsx()

### Community 14 - "Разделы: где код в каждой версии"
Cohesion: 0.21
Nodes (12): Где что лежит (таблица `public.docs`: col, id, data jsonb), askDelete(), batches(), delSale(), entries(), lsSet(), plStore(), renderJournal() (+4 more)

### Community 16 - "Старый сайт: шаблоны и всплывающие окна"
Cohesion: 0.23
Nodes (12): applyTpl(), attach(), pick(), place(), render(), close(), open(), renderTemplates() (+4 more)

### Community 17 - "Новая версия: Отчёт р/с и фискальные — расчёты"
Cohesion: 0.06
Nodes (94): pl(), todayTash(), DayReport(), Editor(), FiscalView(), FmState, PointCard(), PrepBanner() (+86 more)

### Community 18 - "Новая версия: Аналитика и Линзы — страницы и графики"
Cohesion: 0.14
Nodes (44): Page(), AnalyticsPage(), Owner(), readHints(), readSel(), renderW(), WDN, Panel() (+36 more)

### Community 19 - "pay/logic.ts"
Cohesion: 0.16
Nodes (29): addM(), Amount, amountOf(), baseAmount(), debtOf(), dim(), dLong(), dueOf() (+21 more)

### Community 20 - "Новая версия: Касса"
Cohesion: 0.11
Nodes (54): bcDays(), compute(), reserve(), kassaNow(), FormVal, Articles(), DayChart(), Insights() (+46 more)

### Community 21 - "Новая версия: Продажи — расчёты"
Cohesion: 0.11
Nodes (33): addD(), CalDay, calOf(), ctxOf(), dayExpOf(), DEF_CATS, DEF_POINTS, Group (+25 more)

### Community 25 - "Button"
Cohesion: 0.16
Nodes (12): class-variance-authority, cn, Badge(), badgeVariants, Button(), buttonVariants, Calendar(), CalendarDayButton() (+4 more)

### Community 26 - "Новая версия: Продажи — детали, фото, журнал"
Cohesion: 0.13
Nodes (39): Card(), Input(), fmt(), dateCell(), ExpenseBox(), ExpMode, LIST, KLBL (+31 more)

### Community 27 - "UI shadcn: формы и витрина компонентов"
Cohesion: 0.12
Nodes (26): Select(), SelectContent(), SelectItem(), SelectScrollDownButton(), SelectScrollUpButton(), SelectTrigger(), SelectValue(), FilterBar() (+18 more)

### Community 28 - "Новая версия: Пользователи"
Cohesion: 0.12
Nodes (40): SheetHeader(), Switch(), ago(), base, demoRows(), byRoles(), call(), can() (+32 more)

### Community 29 - "Новая версия: Задания"
Cohesion: 0.15
Nodes (22): Skeleton(), HomeExtra, day(), demoStore(), fetchTasks(), MAXLEN, NewTask, PRI (+14 more)

### Community 30 - "Новая версия: каркас приложения и меню"
Cohesion: 0.12
Nodes (27): dark, qc, qs, App(), Clock(), Gate(), KIT(), Loading() (+19 more)

### Community 31 - "source.ts"
Cohesion: 0.26
Nodes (15): addExpenseLimited(), client(), delDoc(), demoTables, limitRows(), listeners, loadData(), loadRows() (+7 more)

### Community 32 - "Старый сайт: Платежи (pay.js)"
Cohesion: 0.14
Nodes (29): addPay(), amountOf(), baseAmount(), cashless(), chip(), closeDrawer(), debtOf(), delItem() (+21 more)

### Community 33 - "home/logic.ts"
Cohesion: 0.06
Nodes (68): homeView(), Batch, batchesOf(), BatchItem, batchStats(), curBatch(), docsOf(), normS() (+60 more)

### Community 34 - "DebtsPanel.tsx"
Cohesion: 0.20
Nodes (13): Debt, DebtPay, DebtsInfo, debtsOf(), isRepay(), num(), Orphan, saleDate() (+5 more)

### Community 35 - "Новая версия: Продажи — выгрузки и расходы"
Cohesion: 0.17
Nodes (26): downloadCsv(), downloadXlsx(), save(), agg, cmpText(), csvOf(), dayCashRows(), discOf() (+18 more)

### Community 36 - "Демо-данные и сверка отчёта"
Cohesion: 0.14
Nodes (16): rows(), OUT, rows(), addD(), bzAll(), OUT, rows(), T (+8 more)

### Community 37 - "base.ts"
Cohesion: 0.20
Nodes (21): AnFilter(), PRESETS, defaultFlt(), Flt, monthOf(), monthRange(), PCOL, pointColor() (+13 more)

### Community 38 - "analytics/logic.ts"
Cohesion: 0.13
Nodes (41): agg, CATCOL, dayList(), expFiltered(), filtered(), matchOf(), PAYCOL, periodTxt() (+33 more)

### Community 39 - "FilterBar"
Cohesion: 0.32
Nodes (8): FilterBar(), Sheet(), SheetContent(), SheetDescription(), SheetOverlay(), SheetPortal(), SheetTitle(), FormShell()

### Community 40 - "Демо-данные Billz и сверки"
Cohesion: 0.12
Nodes (20): B, build(), bzProducts, demoExtra(), iso(), payName(), PRODUCTS, tash() (+12 more)

### Community 41 - "Настройки shadcn"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 42 - "Старый сайт: Пользователи (users.js)"
Cohesion: 0.26
Nodes (19): build(), call(), can(), fieldsHtml(), fillPt(), genPass(), getPerms(), list() (+11 more)

### Community 43 - "Зависимости web (package.json)"
Cohesion: 0.10
Nodes (20): react-day-picker, shadcn, @supabase/supabase-js, @tanstack/react-table, zod, dependencies, class-variance-authority@^0.7.1, cn@^0.5.2 (+12 more)

### Community 44 - "Скрипты: себестоимость и сверка Кассы"
Cohesion: 0.15
Nodes (12): c, d, lastD, P, prods, pstat, sales, skus (+4 more)

### Community 45 - "Editor.tsx"
Cohesion: 0.09
Nodes (25): Tabs(), TabsList(), tabsListVariants, TabsTrigger(), Editor(), F, Field(), fromForm() (+17 more)

### Community 46 - "HomePage.tsx"
Cohesion: 0.10
Nodes (44): Общее в новой версии (`web/src/`), sonner, @tanstack/react-query, dark, Page(), qc, qs, PageHead() (+36 more)

### Community 47 - "lucide-react"
Cohesion: 0.14
Nodes (22): lucide-react, motion, ActionLink, isLink(), bez(), FlowPill(), Cards(), Props (+14 more)

### Community 48 - "Документация: спека нового дизайна"
Cohesion: 0.11
Nodes (18): Варианты движка анимаций, Главная (порядок по важности), Движение (один файл правил `web/src/lib/motion.ts`), Зачем, Новая версия (web/): единый дизайн, движение, адаптация. Главная как эталон, Ограничения, Оставлено исполнителю, Остальные разделы (+10 more)

### Community 49 - "Старый сайт: касса дня и долги"
Cohesion: 0.18
Nodes (12): confirmBtn(), dayCashRows(), debtsOf(), flash(), go(), idle(), periodKey(), periodSheet() (+4 more)

### Community 50 - "Старый сайт: Задания (tasks.js)"
Cohesion: 0.31
Nodes (15): card(), draw(), filtered(), filters(), formAdmin(), formProblem(), kpis(), listHtml() (+7 more)

### Community 52 - "Демо-данные Главной и Плана"
Cohesion: 0.24
Nodes (12): demoAll(), nz(), OUT, planView(), rows(), demoExtra(), FRAMES, LENSES (+4 more)

### Community 54 - "package.json"
Cohesion: 0.13
Nodes (14): date-fns, @hookform/resolvers, react-router, @refinedev/core, @refinedev/react-router, date-fns@^4.4.0, @hookform/resolvers@^7.0.2, react-router@^8.5.1 (+6 more)

### Community 55 - "Новая версия: RowCards и таблицы"
Cohesion: 0.31
Nodes (7): Grid(), Table(), TableBody(), TableCell(), TableHead(), TableHeader(), TableRow()

### Community 56 - "Новая версия: доступ по ролям (access.ts)"
Cohesion: 0.16
Nodes (14): Ctx, DEF, loadAccess(), make(), PERMS, Role, ROLE_LABEL, ROLES (+6 more)

### Community 57 - "Новая версия: Продажи — календарь"
Cohesion: 0.24
Nodes (15): Calendar(), mln(), mlnCell(), mS(), plOff(), Sum(), calDayOf(), calDefaultSel() (+7 more)

### Community 58 - "Настройки TypeScript"
Cohesion: 0.14
Nodes (13): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+5 more)

### Community 59 - "Скрипты: сверка Платежей"
Cohesion: 0.17
Nodes (11): byCol(), ctx, data, db, M0, repDocs, rows, snap() (+3 more)

### Community 60 - "Настройки сборки Vite"
Cohesion: 0.21
Nodes (8): @tailwindcss/vite, vite, @vitejs/plugin-react, @tailwindcss/vite@^4.3.4, vite@^8.3.6, @vitejs/plugin-react@^6.2.1, root, root

### Community 61 - "react"
Cohesion: 0.10
Nodes (15): radix-ui, react, Login(), schema, Checkbox(), Label(), ScrollArea(), ScrollBar() (+7 more)

### Community 62 - "Скрипты: сверка Продаж"
Cohesion: 0.22
Nodes (9): compute(), num0(), OUT, rows(), Scn, T, demoExtra(), iso() (+1 more)

### Community 63 - "Настройки TypeScript"
Cohesion: 0.17
Nodes (11): compilerOptions, allowImportingTsExtensions, lib, module, moduleResolution, noEmit, skipLibCheck, strict (+3 more)

### Community 64 - "Зависимости web (package.json)"
Cohesion: 0.18
Nodes (11): tailwindcss, @types/node, @types/react, @types/react-dom, typescript, devDependencies, tailwindcss@^4.3.4, @types/node@^26.6.6 (+3 more)

### Community 65 - "Документация: CLAUDE.md"
Cohesion: 0.22
Nodes (8): Задания и проблемы по точкам — вкладка «Задания», с 23.11.2026, Карта кода (Graphify), Касса Оптики — инструкции для Claude, Код, Правила работы, Приход сотрудников (Face ID) — папка `smena/`, с 15.11.2026, Распределение работы (экономия токенов) — решение владельца 06.11.2026, Роли доступа (с 16.11.2026, права-переключатели с 17.11.2026)

### Community 66 - "useIsPhone"
Cohesion: 0.15
Nodes (21): xlsx, Касса Оптики — новая версия (React), Команды, RowCards(), RowColumn, WeeksTable(), buildPlanDoc(), DayBar (+13 more)

### Community 68 - "Старый сайт: роли внутри разделов (inner.js)"
Cohesion: 0.33
Nodes (3): ROLE_DENY, roleFull(), roleName()

### Community 69 - "Старый сайт: чистка (tidy.js)"
Cohesion: 0.47
Nodes (3): apply(), keyOf(), scan()

### Community 70 - "Настройки TypeScript"
Cohesion: 0.40
Nodes (4): compilerOptions, paths, files, references

### Community 72 - "Скрипты npm"
Cohesion: 0.50
Nodes (4): scripts, build, dev, preview

### Community 76 - "analytics/parts.tsx"
Cohesion: 0.18
Nodes (16): MetricTile(), MiniTile(), tone(), useHint(), Card, MiniRing(), Spark(), hintOf() (+8 more)

### Community 77 - "pay/Settings.tsx"
Cohesion: 0.18
Nodes (16): InlineNumber(), InlineText(), NumProps, KINDS, MNg, num(), SRC, wd (+8 more)

### Community 79 - "sales/filter.tsx"
Cohesion: 0.16
Nodes (17): get(), PRESETS, put(), SalesFilter(), state, sub(), subs, useSalesFilter() (+9 more)

### Community 80 - "tasks/parts.tsx"
Cohesion: 0.24
Nodes (15): Textarea(), errMsg(), fmtD(), fmtT(), isOverdue(), Actions, Buttons(), Details() (+7 more)

### Community 85 - "pl"
Cohesion: 0.21
Nodes (13): batchStats(), curBatch(), pl(), plFcast(), plStats(), renderCal(), renderCalDay(), renderHome() (+5 more)

### Community 86 - "analytics/demo.ts"
Cohesion: 0.25
Nodes (9): demoAll(), demoExtra(), FRAMES, iso(), LENS, OTHER, PAYS, rnd() (+1 more)

### Community 87 - "SaleForm.tsx"
Cohesion: 0.29
Nodes (10): lensKind(), normPay(), normS(), PAYS, Settings, todayTash(), empty(), SaleForm() (+2 more)

### Community 88 - "analytics-parity.ts"
Cohesion: 0.22
Nodes (8): F(), grpPick(), M0, OUT, prevM, R(), SCEN, T

### Community 89 - "DayCash.tsx"
Cohesion: 0.33
Nodes (8): Block, BlockView(), Dash(), DayCash(), Pill(), dayCashBlocks(), DayCashRow, PAYSHORT

### Community 91 - "renderMargin"
Cohesion: 0.29
Nodes (7): batchMatcher(), marginData(), mGroup(), renderMargin(), renderStockList(), renderStockTab(), stockSold()

### Community 92 - "xl.ts"
Cohesion: 0.50
Nodes (3): FMT, XCol, XSheet

## Knowledge Gaps
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Разделы: где код в каждой версии` connect `Разделы: где код в каждой версии` to `Старый сайт: графики аналитики и партии`, `home/logic.ts`, `analytics/cost.ts`, `analytics/logic.ts`, `Новая версия: Сверка и остатки Billz`, `Документация: спека нового дизайна`, `Старый сайт: касса дня и долги`, `Новая версия: Аналитика и Линзы — страницы и графики`, `pay/logic.ts`, `Новая версия: Отчёт р/с и фискальные — расчёты`, `pl`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Segments()` (e.g. with `Общее в новой версии (`web/src/`)` and `Касса Оптики — новая версия (React)`) actually correct?**
  _`Segments()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `analytics/cost.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06428571428571428 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `Новая версия: Сверка и остатки Billz`, `BzStockView.tsx`, `Новая версия: Отчёт р/с и фискальные — расчёты`, `Новая версия: Аналитика и Линзы — страницы и графики`, `pay/logic.ts`, `Новая версия: Касса`, `Button`, `Новая версия: Продажи — детали, фото, журнал`, `UI shadcn: формы и витрина компонентов`, `Новая версия: Пользователи`, `Новая версия: Задания`, `Новая версия: каркас приложения и меню`, `Новая версия: Продажи — выгрузки и расходы`, `base.ts`, `FilterBar`, `Зависимости web (package.json)`, `Editor.tsx`, `HomePage.tsx`, `lucide-react`, `UI shadcn: выпадающие меню`, `package.json`, `Новая версия: RowCards и таблицы`, `Новая версия: доступ по ролям (access.ts)`, `Новая версия: Продажи — календарь`, `useIsPhone`, `UI shadcn: карточки`, `analytics/parts.tsx`, `pay/Settings.tsx`, `sales/filter.tsx`, `tasks/parts.tsx`, `SaleForm.tsx`, `DayCash.tsx`, `popover.tsx`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Should `Старый сайт: Сверка Billz (bz.js)` be split into smaller, more focused modules?**
  _Cohesion score 0.14453781512605043 - nodes in this community are weakly interconnected._
- **Why does `isOn()` connect `pay/logic.ts` to `pay/Settings.tsx`, `Старый сайт: Фискальные модули (fm.js)`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Should `Сборка старого сайта: патчи patch_*.py` be split into smaller, more focused modules?**
  _Cohesion score 0.053763440860215055 - nodes in this community are weakly interconnected._