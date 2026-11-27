# Graph Report - Kassa  (2026-11-28)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 2067 nodes · 7502 edges · 85 communities (73 shown, 12 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 190 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a51f513c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Старый сайт: Аналитика (renderAnalytics)
- Новая версия: Аналитика
- Старый сайт: Сверка Billz (bz.js)
- Сборка старого сайта: патчи
- Старый сайт: base.html (base.html.js)
- Новая версия: Сверка (FmRecon.tsx)
- Серверные функции Supabase
- Новая версия: Главная (home/logic.ts)
- Старый сайт: Оформление полей (enhanceSelect)
- Новая версия: Склад Billz
- Старый сайт: Отрисовка (render)
- Новая версия: Продажи
- Старый сайт: Заставка с логотипом
- Старый сайт: Отчёт р/с (rs.js)
- Старый сайт: base.html (Разделы: где код в каждой версии)
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
- Новая версия: Продажи (DayCash.tsx)
- Новая версия: каркас и данные (App.tsx)
- Новая версия: Главная
- Новая версия: Аналитика (TabRevenue.tsx)
- Старый сайт: Платежи (pay.js)
- Новая версия: План
- Новая версия: Продажи (debts.ts)
- Новая версия: Продажи (sales/logic.ts)
- Новая версия: План (plan/Settings.tsx)
- Новая версия: Продажи (sales/Journal.tsx)
- Новая версия: Продажи (SalesPage.tsx)
- Новая версия: Главная (WeekChart.tsx)
- Новая версия: Склад Billz (stock-billz/demo.ts)
- Настройки web (components.json)
- Старый сайт: Роли и пользователи
- Настройки web (package.json)
- Скрипты сверок и выгрузок (cost-export.ts)
- Новая версия: Отчёт р/с (Segments)
- Новая версия: Главная (HomePage.tsx)
- Документация (docs)
- Новая версия: Аналитика (LensPage.tsx)
- Старый сайт: Задания (tasks.js)
- Документация (Разбор проекта «Касса Оптики» — что есть, что участвует, что лишнее)
- Скрипты сверок и выгрузок (plan-parity.ts)
- Документация (Осмотр новой версии (web/) — анимации и вёрстка, 25.11.2026)
- Новая версия: Сверка (report-parity.ts)
- Новая версия: План (PlanPage.tsx)
- Новая версия: Касса
- Старый сайт: План (pl)
- Настройки web (compilerOptions)
- Скрипты сверок и выгрузок (parity.ts)
- UI shadcn (Editor.tsx)
- Новая версия: Пользователи
- Скрипты сверок и выгрузок (sales-parity.ts)
- Настройки web (compilerOptions) 2
- Документация (Касса Оптики — инструкции для Claude)
- Новая версия: Аналитика (analytics/cost.ts)
- Старый сайт: Роли и пользователи (inner.js)
- Старый сайт: Чистка (tidy.js)
- Настройки web (tsconfig.json)
- UI shadcn (RowCards.tsx)
- Старый сайт: base.html (init)
- Новая версия: Продажи (Stats.tsx)
- Новая версия: Аналитика (AnalyticsPage.tsx)
- Настройки web (ref_node_path)
- Новая версия: Аналитика (AnFilter.tsx)
- Старый сайт: Продажи (renderSales)
- Новая версия: Аналитика (analytics/demo.ts)
- Новая версия: Продажи (Button)
- Новая версия: Платежи (Tile.tsx)

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

## Communities (85 total, 12 thin omitted)

### Community 0 - "Старый сайт: Аналитика (renderAnalytics)"
Cohesion: 0.21
Nodes (13): drawStack(), C, lineGaps(), niceStep(), periodLabel(), plCalc(), plConf(), plPrevShares() (+5 more)

### Community 1 - "Новая версия: Аналитика"
Cohesion: 0.10
Nodes (58): agg, Card, CATCOL, dayList(), expFiltered(), filtered(), inRange(), matchOf() (+50 more)

### Community 2 - "Старый сайт: Сверка Billz (bz.js)"
Cohesion: 0.14
Nodes (32): bindItems(), bindSeg(), collectState(), dayTable(), flatItems(), get(), itemsPanel(), kassaRows() (+24 more)

### Community 4 - "Старый сайт: base.html (base.html.js)"
Cohesion: 0.06
Nodes (37): apply(), mark(), batchMatcher(), build(), compress(), confirmBtn(), finLines(), go() (+29 more)

### Community 5 - "Новая версия: Сверка (FmRecon.tsx)"
Cohesion: 0.20
Nodes (19): Chip(), Tile(), TileSub(), Banner(), Det(), FmRecon(), FmRow, jump() (+11 more)

### Community 6 - "Серверные функции Supabase"
Cohesion: 0.06
Nodes (46): addD(), bz(), catOf(), collectChecks(), collectStock(), collectTransfers(), CORS, costOf() (+38 more)

### Community 7 - "Новая версия: Главная (home/logic.ts)"
Cohesion: 0.09
Nodes (28): Batch, batchesOf(), BatchItem, batchStats(), curBatch(), docsOf(), normS(), R (+20 more)

### Community 8 - "Старый сайт: Оформление полей (enhanceSelect)"
Cohesion: 0.24
Nodes (11): closePop(), count(), deco(), enhanceDate(), enhanceSelect(), hook(), keyOf(), openPop() (+3 more)

### Community 9 - "Новая версия: Склад Billz"
Cohesion: 0.11
Nodes (34): RowColumn, BzCheck, sgq(), BzStock(), bzView, Exp, ls, note() (+26 more)

### Community 10 - "Старый сайт: Отрисовка (render)"
Cohesion: 0.15
Nodes (13): article(), bcDays(), cashState(), chk(), compute(), kMonths(), lay(), recFor() (+5 more)

### Community 11 - "Новая версия: Продажи"
Cohesion: 0.17
Nodes (29): Cal, CalendarBlock(), ckWord(), DayBlock(), DayList(), mln(), mS(), planOf() (+21 more)

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

### Community 17 - "Новая версия: Отчёт р/с"
Cohesion: 0.06
Nodes (85): todayTash(), DayReport(), Editor(), FiscalView(), FmState, PointCard(), PrepBanner(), addD() (+77 more)

### Community 18 - "Новая версия: Аналитика (TabMore.tsx)"
Cohesion: 0.12
Nodes (45): EdgeShades(), useScrollShade(), useScrollShadeY(), lostCount(), mln(), Empty(), hintOf(), Bar() (+37 more)

### Community 19 - "Новая версия: Платежи"
Cohesion: 0.11
Nodes (45): Cell(), Grid(), TileBody(), TileTop(), addM(), Amount, amountOf(), baseAmount() (+37 more)

### Community 20 - "Новая версия: Сверка"
Cohesion: 0.20
Nodes (24): fmRcExport(), bzQty(), bzSum(), dayTable(), flatItems(), fq(), hm(), isLens() (+16 more)

### Community 21 - "Старый сайт: Фискальные модули (fm.js)"
Cohesion: 0.16
Nodes (22): card(), cfg(), days(), dayStat(), det(), editor(), fiscalDays(), gross() (+14 more)

### Community 25 - "Новая версия: Сверка (recon/logic.ts)"
Cohesion: 0.11
Nodes (30): @tanstack/react-query, BillzPanel(), SC, SD, addD(), AUTO, BGroup, BzItem (+22 more)

### Community 26 - "Новая версия: каркас и данные (source.ts)"
Cohesion: 0.35
Nodes (10): addExpenseLimited(), demoTables, limitRows(), listeners, loadData(), loadRows(), memRows(), rpc() (+2 more)

### Community 27 - "Новая версия: каркас и данные (demoRows)"
Cohesion: 0.23
Nodes (8): demoAll(), OUT, rows(), demoRows(), iso(), rnd(), demoAll(), extras

### Community 28 - "Новая версия: Продажи (DayCash.tsx)"
Cohesion: 0.22
Nodes (12): CashBlock(), CashBlockData, Dash(), dateCell(), KassaChip(), PointTable(), DayCashRow, fmtM() (+4 more)

### Community 29 - "Новая версия: каркас и данные (App.tsx)"
Cohesion: 0.05
Nodes (76): App(), Clock(), Gate(), KIT(), Loading(), PAGES, qc, Shell() (+68 more)

### Community 30 - "Новая версия: Главная"
Cohesion: 0.22
Nodes (7): COLS, MONTHS, NAMES, PAYS, POINTS, Row, ROWS

### Community 31 - "Новая версия: Аналитика (TabRevenue.tsx)"
Cohesion: 0.17
Nodes (31): plConf(), plOff(), Widget, fmtShort(), mn(), monthPlan(), Need, needPerDay() (+23 more)

### Community 32 - "Старый сайт: Платежи (pay.js)"
Cohesion: 0.14
Nodes (29): addPay(), amountOf(), baseAmount(), cashless(), chip(), closeDrawer(), debtOf(), delItem() (+21 more)

### Community 33 - "Новая версия: План"
Cohesion: 0.15
Nodes (28): addD(), checkKey(), DayBar, defaultCfg(), discOf(), dow(), isContact(), isFrame() (+20 more)

### Community 34 - "Новая версия: Продажи (debts.ts)"
Cohesion: 0.27
Nodes (9): Debt, DebtPay, DebtsInfo, debtsOf(), isRepay(), num(), Orphan, saleDate() (+1 more)

### Community 35 - "Новая версия: Продажи (sales/logic.ts)"
Cohesion: 0.08
Nodes (44): Fields(), get(), PRESETS, put(), SalesFilter(), SalesFilterSheet(), state, sub() (+36 more)

### Community 36 - "Новая версия: План (plan/Settings.tsx)"
Cohesion: 0.39
Nodes (8): buildPlanDoc(), parseAmt(), PlanCalc, PlanCfg, plPrevShares(), comma(), PlanSettings(), Stop()

### Community 37 - "Новая версия: Продажи (sales/Journal.tsx)"
Cohesion: 0.26
Nodes (12): Col(), J, Journal(), Row(), agg, Ctx, discOf(), Filter (+4 more)

### Community 38 - "Новая версия: Продажи (SalesPage.tsx)"
Cohesion: 0.15
Nodes (23): useDebts(), ExpMode, downloadCsv(), downloadXlsx(), save(), cmpText(), csvOf(), dayCashBlocks() (+15 more)

### Community 39 - "Новая версия: Главная (WeekChart.tsx)"
Cohesion: 0.50
Nodes (4): DayBar, WeekChart(), dLong(), planPeriod()

### Community 40 - "Новая версия: Склад Billz (stock-billz/demo.ts)"
Cohesion: 0.18
Nodes (11): at(), D, day(), EXTRA, iso(), PTS, ROWS, SKUS (+3 more)

### Community 41 - "Настройки web (components.json)"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 42 - "Старый сайт: Роли и пользователи"
Cohesion: 0.26
Nodes (19): build(), call(), can(), fieldsHtml(), fillPt(), genPass(), getPerms(), list() (+11 more)

### Community 43 - "Настройки web (package.json)"
Cohesion: 0.06
Nodes (46): class-variance-authority, @hookform/resolvers, react-dom, react-hook-form, shadcn, @supabase/supabase-js, tailwindcss, tsx (+38 more)

### Community 44 - "Скрипты сверок и выгрузок (cost-export.ts)"
Cohesion: 0.15
Nodes (12): c, d, lastD, P, prods, pstat, sales, skus (+4 more)

### Community 45 - "Новая версия: Отчёт р/с (Segments)"
Cohesion: 0.10
Nodes (22): Общее в новой версии (`web/src/`), bez(), FlowPill(), Shades(), SegmentItem, Segments(), KitDemo(), Controls() (+14 more)

### Community 46 - "Новая версия: Главная (HomePage.tsx)"
Cohesion: 0.12
Nodes (26): dark, Page(), qc, qs, homeView(), Bento(), Item(), R16 (+18 more)

### Community 48 - "Документация (docs)"
Cohesion: 0.11
Nodes (18): Варианты движка анимаций, Главная (порядок по важности), Движение (один файл правил `web/src/lib/motion.ts`), Зачем, Новая версия (web/): единый дизайн, движение, адаптация. Главная как эталон, Ограничения, Оставлено исполнителю, Остальные разделы (+10 more)

### Community 49 - "Новая версия: Аналитика (LensPage.tsx)"
Cohesion: 0.13
Nodes (43): MetricTile(), MiniTile(), Panel(), tone(), useHint(), Bar, BarsC(), box() (+35 more)

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

### Community 54 - "Новая версия: Сверка (report-parity.ts)"
Cohesion: 0.16
Nodes (17): addD(), bzAll(), OUT, rows(), T, B, build(), bzChecks (+9 more)

### Community 55 - "Новая версия: План (PlanPage.tsx)"
Cohesion: 0.18
Nodes (25): recharts, DaysChart(), Tip(), WeeksTable(), dShort(), fmt(), fmtM(), monthTitle() (+17 more)

### Community 56 - "Новая версия: Касса"
Cohesion: 0.05
Nodes (109): FilterBar(), PageHead(), Cols, Row(), RowCell(), RowName(), Rows(), TileLabel() (+101 more)

### Community 57 - "Старый сайт: План (pl)"
Cohesion: 0.21
Nodes (13): batchStats(), curBatch(), pl(), plFcast(), plStats(), renderCal(), renderCalDay(), renderHome() (+5 more)

### Community 58 - "Настройки web (compilerOptions)"
Cohesion: 0.14
Nodes (13): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+5 more)

### Community 59 - "Скрипты сверок и выгрузок (parity.ts)"
Cohesion: 0.17
Nodes (11): byCol(), ctx, data, db, M0, repDocs, rows, snap() (+3 more)

### Community 60 - "UI shadcn (Editor.tsx)"
Cohesion: 0.12
Nodes (36): InlineNumber(), InlineText(), NumProps, Select(), SelectContent(), SelectItem(), SelectScrollDownButton(), SelectScrollUpButton() (+28 more)

### Community 61 - "Новая версия: Пользователи"
Cohesion: 0.12
Nodes (29): cn, lucide-react, radix-ui, react, Login(), schema, buttonVariants, Checkbox() (+21 more)

### Community 62 - "Скрипты сверок и выгрузок (sales-parity.ts)"
Cohesion: 0.24
Nodes (9): compute(), num0(), OUT, rows(), Scn, T, demoExtra(), iso() (+1 more)

### Community 63 - "Настройки web (compilerOptions) 2"
Cohesion: 0.17
Nodes (11): compilerOptions, allowImportingTsExtensions, lib, module, moduleResolution, noEmit, skipLibCheck, strict (+3 more)

### Community 65 - "Документация (Касса Оптики — инструкции для Claude)"
Cohesion: 0.10
Nodes (17): Задания и проблемы по точкам — вкладка «Задания», с 23.11.2026, Карта кода (Graphify), Касса Оптики — инструкции для Claude, Код, Правила работы, Приход сотрудников (Face ID) — папка `smena/`, с 15.11.2026, Распределение работы (экономия токенов) — решение владельца 06.11.2026, Роли доступа (с 16.11.2026, права-переключатели с 17.11.2026) (+9 more)

### Community 66 - "Новая версия: Аналитика (analytics/cost.ts)"
Cohesion: 0.06
Nodes (50): xlsx, F(), grpPick(), M0, norm(), normM(), OUT, prevM (+42 more)

### Community 68 - "Старый сайт: Роли и пользователи (inner.js)"
Cohesion: 0.33
Nodes (3): ROLE_DENY, roleFull(), roleName()

### Community 69 - "Старый сайт: Чистка (tidy.js)"
Cohesion: 0.47
Nodes (3): apply(), keyOf(), scan()

### Community 70 - "Настройки web (tsconfig.json)"
Cohesion: 0.40
Nodes (4): compilerOptions, paths, files, references

### Community 71 - "UI shadcn (RowCards.tsx)"
Cohesion: 0.20
Nodes (14): Касса Оптики — новая версия (React), Команды, Cards(), Grid(), Props, RowCard(), RowCards(), useOpenKey() (+6 more)

### Community 72 - "Старый сайт: base.html (init)"
Cohesion: 0.12
Nodes (24): applyPreset(), fillCatSel(), fillMonths(), fillPhPoint(), fillSelects(), init(), lensData(), lensInfo() (+16 more)

### Community 75 - "Новая версия: Продажи (Stats.tsx)"
Cohesion: 0.20
Nodes (18): checkKey(), dLong(), Group, periodKey(), periodLabel(), periodSheet(), periodsIn(), periodTxt() (+10 more)

### Community 76 - "Новая версия: Аналитика (AnalyticsPage.tsx)"
Cohesion: 0.09
Nodes (31): sonner, dark, Page(), qc, qs, AnalyticsPage(), readHints(), readSel() (+23 more)

### Community 77 - "Настройки web (ref_node_path)"
Cohesion: 0.21
Nodes (8): @tailwindcss/vite, vite, @vitejs/plugin-react, @tailwindcss/vite@^4.3.4, vite@^8.3.6, @vitejs/plugin-react@^6.2.1, root, root

### Community 79 - "Новая версия: Аналитика (AnFilter.tsx)"
Cohesion: 0.36
Nodes (10): AnHead(), PRESETS, Flt, monthOf(), monthRange(), pointColor(), presetRange(), MONTHS_FULL (+2 more)

### Community 80 - "Старый сайт: Продажи (renderSales)"
Cohesion: 0.25
Nodes (9): dayCashRows(), debtsOf(), flash(), periodKey(), periodSheet(), periodsIn(), prevList(), renderDebts() (+1 more)

### Community 86 - "Новая версия: Аналитика (analytics/demo.ts)"
Cohesion: 0.24
Nodes (9): rows(), demoExtra(), FRAMES, iso(), LENS, OTHER, PAYS, rnd() (+1 more)

### Community 87 - "Новая версия: Продажи (Button)"
Cohesion: 0.14
Nodes (37): ActionLink, Card(), isLink(), Button(), fmt(), Dash(), DebtsBlock(), DebtsTable() (+29 more)

### Community 90 - "Новая версия: Платежи (Tile.tsx)"
Cohesion: 0.17
Nodes (15): motion, motion@^14.9.1, ChipTone, OnHero, TONE, Status, ICONS, Kpi() (+7 more)

## Knowledge Gaps
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Касса Оптики — инструкции для Claude` connect `Документация (Касса Оптики — инструкции для Claude)` to `Старый сайт: base.html (Разделы: где код в каждой версии)`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Should `Новая версия: Аналитика` be split into smaller, more focused modules?**
  _Cohesion score 0.10023310023310024 - nodes in this community are weakly interconnected._
- **Why does `main()` connect `Документация (Касса Оптики — инструкции для Claude)` to `Скрипты сверок и выгрузок (os)`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Should `Старый сайт: Сверка Billz (bz.js)` be split into smaller, more focused modules?**
  _Cohesion score 0.14453781512605043 - nodes in this community are weakly interconnected._
- **Why does `Разделы: где код в каждой версии` connect `Старый сайт: base.html (Разделы: где код в каждой версии)` to `Старый сайт: Аналитика (renderAnalytics)`, `Новая версия: Аналитика`, `Новая версия: Аналитика (analytics/cost.ts)`, `Новая версия: Отчёт р/с (Segments)`, `Новая версия: Главная (HomePage.tsx)`, `Документация (docs)`, `Старый сайт: Продажи (renderSales)`, `Новая версия: Отчёт р/с`, `Новая версия: Платежи`, `Старый сайт: План (pl)`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Should `Сборка старого сайта: патчи` be split into smaller, more focused modules?**
  _Cohesion score 0.09475806451612903 - nodes in this community are weakly interconnected._
- **Should `Старый сайт: base.html (base.html.js)` be split into smaller, more focused modules?**
  _Cohesion score 0.06274509803921569 - nodes in this community are weakly interconnected._