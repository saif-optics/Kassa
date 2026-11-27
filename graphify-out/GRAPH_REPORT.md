# Graph Report - Kassa  (2026-11-28)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 2087 nodes · 7567 edges · 89 communities (77 shown, 12 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 190 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `85560e00`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Старый сайт: Аналитика (renderAnalytics)
- Новая версия: Аналитика
- Старый сайт: Сверка Billz (bz.js)
- Сборка старого сайта: патчи
- Старый сайт: base.html (base.html.js)
- Новая версия: Отчёт р/с (Segments)
- Серверные функции Supabase
- Новая версия: Главная (home/logic.ts)
- Старый сайт: base.html (Таблицы)
- Новая версия: Склад Billz
- Старый сайт: Отрисовка (render)
- Новая версия: Продажи
- Старый сайт: Заставка с логотипом
- Старый сайт: Отчёт р/с (rs.js)
- Старый сайт: Продажи (renderSales)
- Старый сайт: Отрисовка (render) 2
- Новая версия: Отчёт р/с
- Новая версия: Аналитика (TabMore.tsx)
- Новая версия: Платежи
- Новая версия: Сверка
- Старый сайт: Фискальные модули (fm.js)
- Старый сайт: Тесты (mk)
- Сборка старого сайта
- Документация (README.md)
- Новая версия: Сверка (recon/logic.ts)
- Новая версия: каркас и данные (source.ts)
- Новая версия: каркас и данные (demoRows)
- Новая версия: Отчёт р/с (FiscalView.tsx)
- Новая версия: Задания
- Новая версия: каркас и данные (access.ts)
- Новая версия: Аналитика (TabRevenue.tsx)
- Старый сайт: Платежи (pay.js)
- Новая версия: План
- Новая версия: Продажи (DebtsPanel.tsx)
- Новая версия: Продажи (sales/logic.ts)
- Настройки web (package.json)
- Новая версия: Продажи (sales/filter.tsx)
- Новая версия: Продажи (SalesPage.tsx)
- UI shadcn (sheet.tsx)
- Новая версия: Склад Billz (stock-billz/demo.ts)
- Настройки web (components.json)
- Старый сайт: Роли и пользователи
- Настройки web (dependencies)
- Скрипты сверок и выгрузок (cost-export.ts)
- Новая версия: Отчёт р/с (ui.tsx)
- Новая версия: Главная
- Документация (docs)
- Новая версия: Аналитика (LensPage.tsx)
- Старый сайт: Задания (tasks.js)
- Документация (Разбор проекта «Касса Оптики» — что есть, что участвует, что лишнее)
- Скрипты сверок и выгрузок (plan-parity.ts)
- Документация (Осмотр новой версии (web/) — анимации и вёрстка, 25.11.2026)
- Скрипты сверок и выгрузок (report-parity.ts)
- Скрипты сверок и выгрузок (analytics-harness/main.tsx)
- Новая версия: Касса
- Новая версия: Аналитика (layout.ts)
- Настройки web (compilerOptions)
- Скрипты сверок и выгрузок (parity.ts)
- UI shadcn (Editor.tsx)
- Новая версия: Пользователи
- Скрипты сверок и выгрузок (sales-parity.ts)
- Настройки web (compilerOptions) 2
- Старый сайт: base.html (toLocal)
- Документация (Касса Оптики — инструкции для Claude)
- Новая версия: Аналитика (analytics/cost.ts)
- Старый сайт: Роли и пользователи (inner.js)
- Старый сайт: Чистка (tidy.js)
- Настройки web (tsconfig.json)
- Новая версия: общие компоненты (react)
- Старый сайт: base.html (init)
- Настройки web (Login.tsx)
- Новая версия: Продажи (Stats.tsx)
- Новая версия: каркас и данные (App.tsx)
- Настройки web (analytics-vite.config.ts)
- Новая версия: Сверка (recon/demo.ts)
- Новая версия: каркас и данные (useData.ts)
- Старый сайт: Локальные настройки (fillSelects)
- Новая версия: Аналитика (Strip.tsx)
- Новая версия: Аналитика (analytics/demo.ts)
- Новая версия: Продажи (Button)
- Настройки web (scripts)

## God Nodes (most connected - your core abstractions)
1. `Button()` - 88 edges
2. `react` - 79 edges
3. `Card()` - 70 edges
4. `fmt()` - 67 edges
5. `useIsPhone()` - 65 edges
6. `Segments()` - 63 edges
7. `SalesPage()` - 57 edges
8. `RowCards()` - 48 edges
9. `HomePage()` - 46 edges
10. `lucide-react` - 46 edges

## Surprising Connections (you probably didn't know these)
- `Движение (один файл правил `web/src/lib/motion.ts`)` --references--> `land()`  [INFERRED]
  docs/superpowers/specs/2026-11-24-new-design-home-design.md → web/src/lib/motion.ts
- `Б. Анимации` --references--> `land()`  [INFERRED]
  docs/ОСМОТР_НОВОЙ_ВЕРСИИ_2026-11-25.md → web/src/lib/motion.ts
- `Распределение работы (экономия токенов) — решение владельца 06.11.2026` --references--> `rpc()`  [INFERRED]
  CLAUDE.md → web/src/lib/source.ts
- `Разделы: где код в каждой версии` --references--> `renderAnalytics()`  [INFERRED]
  docs/КАРТА_ПРОЕКТА.md → dev/graph-src/base.html.js
- `Разделы: где код в каждой версии` --references--> `buildAnalytics()`  [INFERRED]
  docs/КАРТА_ПРОЕКТА.md → web/src/features/analytics/logic.ts

## Import Cycles
- None detected.

## Communities (89 total, 12 thin omitted)

### Community 0 - "Старый сайт: Аналитика (renderAnalytics)"
Cohesion: 0.29
Nodes (8): C, lineGaps(), niceStep(), plConf(), plFcast(), plPrevShares(), renderAnalytics(), renderAnPointSeg()

### Community 1 - "Новая версия: Аналитика"
Cohesion: 0.09
Nodes (64): AnHead(), PRESETS, agg, CATCOL, dayList(), expFiltered(), filtered(), Flt (+56 more)

### Community 2 - "Старый сайт: Сверка Billz (bz.js)"
Cohesion: 0.14
Nodes (32): bindItems(), bindSeg(), collectState(), dayTable(), flatItems(), get(), itemsPanel(), kassaRows() (+24 more)

### Community 4 - "Старый сайт: base.html (base.html.js)"
Cohesion: 0.05
Nodes (46): apply(), mark(), batchMatcher(), build(), compress(), confirmBtn(), count(), debtsOf() (+38 more)

### Community 5 - "Новая версия: Отчёт р/с (Segments)"
Cohesion: 0.19
Nodes (20): xlsx, Касса Оптики — новая версия (React), Команды, RowCards(), Segments(), Tile(), TileLabel(), TileSub() (+12 more)

### Community 6 - "Серверные функции Supabase"
Cohesion: 0.06
Nodes (46): addD(), bz(), catOf(), collectChecks(), collectStock(), collectTransfers(), CORS, costOf() (+38 more)

### Community 7 - "Новая версия: Главная (home/logic.ts)"
Cohesion: 0.06
Nodes (35): Batch, batchesOf(), BatchItem, batchStats(), curBatch(), docsOf(), normS(), R (+27 more)

### Community 8 - "Старый сайт: base.html (Таблицы)"
Cohesion: 0.19
Nodes (15): Где что лежит (таблица `public.docs`: col, id, data jsonb), batches(), closePop(), enhanceDate(), enhanceSelect(), entries(), hook(), openPop() (+7 more)

### Community 9 - "Новая версия: Склад Billz"
Cohesion: 0.11
Nodes (35): addD(), BzCheck, dL(), fq(), hm(), PER, periodOf(), sgq() (+27 more)

### Community 10 - "Старый сайт: Отрисовка (render)"
Cohesion: 0.20
Nodes (10): article(), cashState(), chk(), kMonths(), lay(), recFor(), recM(), render() (+2 more)

### Community 11 - "Новая версия: Продажи"
Cohesion: 0.13
Nodes (35): Cols, Row(), RowCell(), Rows(), ByCat(), Cal, CalendarBlock(), ckWord() (+27 more)

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
Cohesion: 0.09
Nodes (39): addD(), BankRow, BcItem, CAT_NAMES, Cell, dayExp(), dFull(), expAmt() (+31 more)

### Community 18 - "Новая версия: Аналитика (TabMore.tsx)"
Cohesion: 0.14
Nodes (44): EdgeShades(), useScrollShadeY(), layout(), lostCount(), mln(), Empty(), Bar(), Bridge (+36 more)

### Community 19 - "Новая версия: Платежи"
Cohesion: 0.09
Nodes (54): Cell(), Grid(), RowName(), ChipTone, TileBody(), addM(), Amount, amountOf() (+46 more)

### Community 20 - "Новая версия: Сверка"
Cohesion: 0.12
Nodes (42): RowColumn, Chip(), Banner(), Controls(), Filters, get(), useFilters(), fmRcExport() (+34 more)

### Community 21 - "Старый сайт: Фискальные модули (fm.js)"
Cohesion: 0.16
Nodes (22): card(), cfg(), days(), dayStat(), det(), editor(), fiscalDays(), gross() (+14 more)

### Community 25 - "Новая версия: Сверка (recon/logic.ts)"
Cohesion: 0.12
Nodes (28): BillzPanel(), SC, SD, AUTO, BGroup, BzItem, bzNext(), bzOf() (+20 more)

### Community 26 - "Новая версия: каркас и данные (source.ts)"
Cohesion: 0.43
Nodes (7): demoTables, limitRows(), listeners, loadData(), loadRows(), memRows(), toData()

### Community 27 - "Новая версия: каркас и данные (demoRows)"
Cohesion: 0.23
Nodes (8): demoAll(), OUT, rows(), demoRows(), iso(), rnd(), demoAll(), extras

### Community 28 - "Новая версия: Отчёт р/с (FiscalView.tsx)"
Cohesion: 0.16
Nodes (32): sonner, pl(), Det(), jump(), DayReport(), Editor(), FiscalView(), FmState (+24 more)

### Community 29 - "Новая версия: Задания"
Cohesion: 0.13
Nodes (36): Textarea(), HomeExtra, day(), demoStore(), errMsg(), fetchTasks(), fmtD(), fmtT() (+28 more)

### Community 30 - "Новая версия: каркас и данные (access.ts)"
Cohesion: 0.14
Nodes (17): Общее в новой версии (`web/src/`), canPerm(), canTab(), Ctx, DEF, loadAccess(), make(), PERMS (+9 more)

### Community 31 - "Новая версия: Аналитика (TabRevenue.tsx)"
Cohesion: 0.15
Nodes (32): Card, AnalyticsModel, plConf(), plPrevShares(), prevMonth(), Widget, fmtShort(), mn() (+24 more)

### Community 32 - "Старый сайт: Платежи (pay.js)"
Cohesion: 0.14
Nodes (29): addPay(), amountOf(), baseAmount(), cashless(), chip(), closeDrawer(), debtOf(), delItem() (+21 more)

### Community 33 - "Новая версия: План"
Cohesion: 0.08
Nodes (62): PageHead(), homeData(), WeekChart(), DaysChart(), Tip(), WeeksTable(), addD(), buildPlanDoc() (+54 more)

### Community 34 - "Новая версия: Продажи (DebtsPanel.tsx)"
Cohesion: 0.21
Nodes (13): Debt, DebtPay, DebtsInfo, debtsOf(), isRepay(), num(), Orphan, saleDate() (+5 more)

### Community 35 - "Новая версия: Продажи (sales/logic.ts)"
Cohesion: 0.08
Nodes (51): SalesFilter(), agg, calDayOf(), calPay(), checkKey(), csvOf(), ctxOf(), dayCashRows() (+43 more)

### Community 36 - "Настройки web (package.json)"
Cohesion: 0.15
Nodes (17): tailwindcss, tsx, @types/node, @types/react, @types/react-dom, typescript, devDependencies, tailwindcss@^4.3.4 (+9 more)

### Community 37 - "Новая версия: Продажи (sales/filter.tsx)"
Cohesion: 0.20
Nodes (14): Fields(), get(), PRESETS, put(), SalesFilterSheet(), state, sub(), subs (+6 more)

### Community 38 - "Новая версия: Продажи (SalesPage.tsx)"
Cohesion: 0.12
Nodes (29): CashBlock(), CashBlockData, Dash(), dateCell(), KassaChip(), PointTable(), ExpMode, downloadCsv() (+21 more)

### Community 39 - "UI shadcn (sheet.tsx)"
Cohesion: 0.31
Nodes (10): FilterBar(), Sheet(), SheetContent(), SheetDescription(), SheetOverlay(), SheetPortal(), SheetTitle(), Lost() (+2 more)

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
Nodes (21): class-variance-authority, react-dom, recharts, shadcn, @supabase/supabase-js, tw-animate-css, dependencies, class-variance-authority@^0.7.1 (+13 more)

### Community 44 - "Скрипты сверок и выгрузок (cost-export.ts)"
Cohesion: 0.15
Nodes (12): c, d, lastD, P, prods, pstat, sales, skus (+4 more)

### Community 45 - "Новая версия: Отчёт р/с (ui.tsx)"
Cohesion: 0.21
Nodes (8): Head, lsGet(), lsSet(), SIZES, sp(), Tone, TONES, usePaging()

### Community 46 - "Новая версия: Главная"
Cohesion: 0.12
Nodes (22): homeView(), Bento(), R16, S12, S16, S6, TileTop(), AL_ICON (+14 more)

### Community 48 - "Документация (docs)"
Cohesion: 0.11
Nodes (18): Варианты движка анимаций, Главная (порядок по важности), Движение (один файл правил `web/src/lib/motion.ts`), Зачем, Новая версия (web/): единый дизайн, движение, адаптация. Главная как эталон, Ограничения, Оставлено исполнителю, Остальные разделы (+10 more)

### Community 49 - "Новая версия: Аналитика (LensPage.tsx)"
Cohesion: 0.12
Nodes (45): MetricTile(), MiniTile(), Panel(), tone(), useHint(), Bar, BarsC(), box() (+37 more)

### Community 50 - "Старый сайт: Задания (tasks.js)"
Cohesion: 0.31
Nodes (15): card(), draw(), filtered(), filters(), formAdmin(), formProblem(), kpis(), listHtml() (+7 more)

### Community 51 - "Документация (Разбор проекта «Касса Оптики» — что есть, что участвует, что лишнее)"
Cohesion: 0.14
Nodes (13): 1. Из чего состоит проект (пять частей), 3. База и сервер Supabase (`kassa-optiki`), 4. Вне репозитория, но связано с проектом (на этом компьютере), 5. Локальные серверы, 6. Итог: что лишнее и что с этим можно сделать, А. Можно убрать без последствий (сайт и проверки не затрагивает), Б. Под вопросом (нужно ваше решение), В. Трогать нельзя (+5 more)

### Community 52 - "Скрипты сверок и выгрузок (plan-parity.ts)"
Cohesion: 0.24
Nodes (12): demoAll(), nz(), OUT, planView(), rows(), demoExtra(), FRAMES, LENSES (+4 more)

### Community 53 - "Документация (Осмотр новой версии (web/) — анимации и вёрстка, 25.11.2026)"
Cohesion: 0.29
Nodes (6): А. Видно сразу, Б. Анимации, В. Телефон (iPhone 15/16 Pro Max), Г. Ноутбук и ПК, Осмотр новой версии (web/) — анимации и вёрстка, 25.11.2026, Что сделано правильно (не трогать)

### Community 54 - "Скрипты сверок и выгрузок (report-parity.ts)"
Cohesion: 0.27
Nodes (8): addD(), bzAll(), OUT, rows(), T, bzChecks, demoExtra(), iso()

### Community 55 - "Скрипты сверок и выгрузок (analytics-harness/main.tsx)"
Cohesion: 0.19
Nodes (10): dark, Page(), qc, qs, dark, Page(), qc, qs (+2 more)

### Community 56 - "Новая версия: Касса"
Cohesion: 0.10
Nodes (64): bcDays(), compute(), reserve(), Item(), kassaNow(), Articles(), ArticlesMore(), DayChart() (+56 more)

### Community 57 - "Новая версия: Аналитика (layout.ts)"
Cohesion: 0.24
Nodes (9): TABS, Cell, inside(), Lay, LItem, overlap(), Rect, solve() (+1 more)

### Community 58 - "Настройки web (compilerOptions)"
Cohesion: 0.14
Nodes (13): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+5 more)

### Community 59 - "Скрипты сверок и выгрузок (parity.ts)"
Cohesion: 0.17
Nodes (11): byCol(), ctx, data, db, M0, repDocs, rows, snap() (+3 more)

### Community 60 - "UI shadcn (Editor.tsx)"
Cohesion: 0.08
Nodes (52): radix-ui, InlineNumber(), InlineText(), Checkbox(), Label(), Select(), SelectContent(), SelectItem() (+44 more)

### Community 61 - "Новая версия: Пользователи"
Cohesion: 0.12
Nodes (40): SheetHeader(), Switch(), ago(), base, demoRows(), byRoles(), call(), can() (+32 more)

### Community 62 - "Скрипты сверок и выгрузок (sales-parity.ts)"
Cohesion: 0.22
Nodes (9): compute(), num0(), OUT, rows(), Scn, T, demoExtra(), iso() (+1 more)

### Community 63 - "Настройки web (compilerOptions) 2"
Cohesion: 0.17
Nodes (11): compilerOptions, allowImportingTsExtensions, lib, module, moduleResolution, noEmit, skipLibCheck, strict (+3 more)

### Community 64 - "Старый сайт: base.html (toLocal)"
Cohesion: 0.24
Nodes (10): applyLocal(), cash(), del(), lsGet(), put(), putSale(), saveFact(), showMsg() (+2 more)

### Community 65 - "Документация (Касса Оптики — инструкции для Claude)"
Cohesion: 0.10
Nodes (17): Задания и проблемы по точкам — вкладка «Задания», с 23.11.2026, Карта кода (Graphify), Касса Оптики — инструкции для Claude, Код, Правила работы, Приход сотрудников (Face ID) — папка `smena/`, с 15.11.2026, Распределение работы (экономия токенов) — решение владельца 06.11.2026, Роли доступа (с 16.11.2026, права-переключатели с 17.11.2026) (+9 more)

### Community 66 - "Новая версия: Аналитика (analytics/cost.ts)"
Cohesion: 0.05
Nodes (54): F(), grpPick(), M0, norm(), normM(), OUT, prevM, R() (+46 more)

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
Cohesion: 0.09
Nodes (35): cn, lucide-react, motion, react, ActionLink, isLink(), NumProps, Cards() (+27 more)

### Community 72 - "Старый сайт: base.html (init)"
Cohesion: 0.14
Nodes (24): applyPreset(), batchStats(), curBatch(), fillMonths(), init(), pl(), plCalc(), plRing() (+16 more)

### Community 74 - "Настройки web (Login.tsx)"
Cohesion: 0.22
Nodes (9): @hookform/resolvers, react-hook-form, zod, @hookform/resolvers@^7.0.2, react-hook-form@^7.91.0, zod@^4.6.7, Login(), schema (+1 more)

### Community 75 - "Новая версия: Продажи (Stats.tsx)"
Cohesion: 0.19
Nodes (13): dShort(), Filter, Group, periodLabel(), StF, WD, Dash(), GROUPS (+5 more)

### Community 76 - "Новая версия: каркас и данные (App.tsx)"
Cohesion: 0.09
Nodes (41): App(), Clock(), Gate(), KIT(), Loading(), PAGES, qc, Shell() (+33 more)

### Community 77 - "Настройки web (analytics-vite.config.ts)"
Cohesion: 0.21
Nodes (8): @tailwindcss/vite, vite, @vitejs/plugin-react, @tailwindcss/vite@^4.3.4, vite@^8.3.6, @vitejs/plugin-react@^6.2.1, root, root

### Community 78 - "Новая версия: Сверка (recon/demo.ts)"
Cohesion: 0.31
Nodes (9): B, build(), bzProducts, demoExtra(), iso(), payName(), PRODUCTS, tash() (+1 more)

### Community 79 - "Новая версия: каркас и данные (useData.ts)"
Cohesion: 0.42
Nodes (8): @tanstack/react-query, addExpenseLimited(), delDoc(), isLimited(), rpc(), setDoc(), KEY, useMutations()

### Community 80 - "Старый сайт: Локальные настройки (fillSelects)"
Cohesion: 0.29
Nodes (8): fillCatSel(), fillPhPoint(), fillSelects(), lensData(), lensInfo(), lensKind(), startEditSale(), syncFormParts()

### Community 85 - "Новая версия: Аналитика (Strip.tsx)"
Cohesion: 0.43
Nodes (7): hintOf(), Chip(), Frame(), growth(), growthTone(), Strip(), Tile

### Community 86 - "Новая версия: Аналитика (analytics/demo.ts)"
Cohesion: 0.24
Nodes (9): rows(), demoExtra(), FRAMES, iso(), LENS, OTHER, PAYS, rnd() (+1 more)

### Community 87 - "Новая версия: Продажи (Button)"
Cohesion: 0.17
Nodes (34): Card(), Button(), buttonVariants, Input(), fmt(), ExpenseBox(), LIST, Wrap() (+26 more)

### Community 88 - "Настройки web (scripts)"
Cohesion: 0.50
Nodes (4): scripts, build, dev, preview

## Knowledge Gaps
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Разделы: где код в каждой версии` connect `Старый сайт: Продажи (renderSales)` to `Старый сайт: Аналитика (renderAnalytics)`, `Новая версия: Аналитика`, `Новая версия: План`, `Новая версия: Аналитика (analytics/cost.ts)`, `Старый сайт: base.html (Таблицы)`, `Старый сайт: base.html (init)`, `Новая версия: Отчёт р/с (ui.tsx)`, `Новая версия: Главная`, `Документация (docs)`, `Новая версия: Отчёт р/с`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Should `Новая версия: Аналитика` be split into smaller, more focused modules?**
  _Cohesion score 0.0912280701754386 - nodes in this community are weakly interconnected._
- **Why does `Касса Оптики — инструкции для Claude` connect `Документация (Касса Оптики — инструкции для Claude)` to `Старый сайт: base.html (Таблицы)`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Should `Старый сайт: Сверка Billz (bz.js)` be split into smaller, more focused modules?**
  _Cohesion score 0.14453781512605043 - nodes in this community are weakly interconnected._
- **Why does `main()` connect `Документация (Касса Оптики — инструкции для Claude)` to `Скрипты сверок и выгрузок (os)`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Should `Сборка старого сайта: патчи` be split into smaller, more focused modules?**
  _Cohesion score 0.09475806451612903 - nodes in this community are weakly interconnected._
- **Should `Старый сайт: base.html (base.html.js)` be split into smaller, more focused modules?**
  _Cohesion score 0.05423728813559322 - nodes in this community are weakly interconnected._