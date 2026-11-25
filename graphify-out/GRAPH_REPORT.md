# Graph Report - Kassa  (2026-11-25)

## Corpus Check
- 222 files · ~216,783 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: .css 9, (none) 3)

## Summary
- 1995 nodes · 6763 edges · 85 communities (65 shown, 20 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 150 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c31d0eaf`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- renderAnalytics
- analytics/logic.ts
- bz.js
- os
- base.html.js
- fm.js
- billz-sync/index.ts
- ReconPage.tsx
- enhanceSelect
- renderJournal
- render
- init
- show
- rs.js
- lsSet
- render
- report/logic.ts
- AnalyticsPage.tsx
- Button
- kassa/logic.ts
- sales/logic.ts
- mk
- dev/README.md
- README.md
- react
- Card
- AddForm.tsx
- UsersPage.tsx
- tasks/parts.tsx
- App.tsx
- source.ts
- pay.js
- plan/logic.ts
- useIsPhone
- SalesPage.tsx
- demoRows
- Segments
- home/logic.ts
- Editor.tsx
- stock-billz/demo.ts
- components.json
- users.js
- dependencies
- cost-export.ts
- ui.tsx
- PlanPage.tsx
- HomePage.tsx
- Новая версия (web/): единый дизайн, движение, адаптация. Главная как эталон
- renderSales
- tasks.js
- Charts.tsx
- plan-parity.ts
- package.json
- RowCards.tsx
- access.ts
- Calendar.tsx
- compilerOptions
- parity.ts
- analytics-vite.config.ts
- Stats.tsx
- sales-parity.ts
- compilerOptions
- devDependencies
- Касса Оптики — инструкции для Claude
- plan/Settings.tsx
- inner.js
- tidy.js
- tsconfig.json
- sonner.tsx
- scripts
- echarts
- @fontsource-variable/geist
- react-router
- @refinedev/core
- @refinedev/supabase
- shadcn
- @tanstack/react-table

## God Nodes (most connected - your core abstractions)
1. `Button()` - 91 edges
2. `react` - 84 edges
3. `Card()` - 70 edges
4. `fmt()` - 64 edges
5. `Segments()` - 55 edges
6. `useIsPhone()` - 53 edges
7. `lucide-react` - 47 edges
8. `RowCards()` - 47 edges
9. `Input()` - 41 edges
10. `buildAnalytics()` - 40 edges

## Surprising Connections (you probably didn't know these)
- `Движение (один файл правил `web/src/lib/motion.ts`)` --references--> `land()`  [INFERRED]
  docs/superpowers/specs/2026-11-24-new-design-home-design.md → web/src/lib/motion.ts
- `Распределение работы (экономия токенов) — решение владельца 06.11.2026` --references--> `rpc()`  [INFERRED]
  CLAUDE.md → web/src/lib/source.ts
- `Где что лежит (таблица `public.docs`: col, id, data jsonb)` --references--> `entries()`  [INFERRED]
  CLAUDE.md → dev/graph-src/base.html.js
- `Где что лежит (таблица `public.docs`: col, id, data jsonb)` --references--> `sales()`  [INFERRED]
  CLAUDE.md → dev/graph-src/base.html.js
- `Где что лежит (таблица `public.docs`: col, id, data jsonb)` --references--> `docs()`  [INFERRED]
  CLAUDE.md → web/src/features/analytics/cost.ts

## Import Cycles
- None detected.

## Communities (85 total, 20 thin omitted)

### Community 0 - "renderAnalytics"
Cohesion: 0.17
Nodes (18): batchStats(), curBatch(), drawStack(), C, lineGaps(), niceStep(), periodLabel(), plCalc() (+10 more)

### Community 1 - "analytics/logic.ts"
Cohesion: 0.05
Nodes (106): F(), grpPick(), M0, OUT, prevM, R(), SCEN, T (+98 more)

### Community 2 - "bz.js"
Cohesion: 0.14
Nodes (32): bindItems(), bindSeg(), collectState(), dayTable(), flatItems(), get(), itemsPanel(), kassaRows() (+24 more)

### Community 4 - "base.html.js"
Cohesion: 0.06
Nodes (36): apply(), mark(), batchMatcher(), build(), compress(), confirmBtn(), finLines(), go() (+28 more)

### Community 5 - "fm.js"
Cohesion: 0.16
Nodes (22): card(), cfg(), days(), dayStat(), det(), editor(), fiscalDays(), gross() (+14 more)

### Community 6 - "billz-sync/index.ts"
Cohesion: 0.06
Nodes (46): addD(), bz(), catOf(), collectChecks(), collectStock(), collectTransfers(), CORS, costOf() (+38 more)

### Community 7 - "ReconPage.tsx"
Cohesion: 0.06
Nodes (113): RowCards(), RowColumn, Chip(), OnHero, Tile(), TileLabel(), TileSub(), TileValue() (+105 more)

### Community 8 - "enhanceSelect"
Cohesion: 0.19
Nodes (14): Где что лежит (таблица `public.docs`: col, id, data jsonb), closePop(), count(), deco(), enhanceDate(), enhanceSelect(), entries(), hook() (+6 more)

### Community 9 - "renderJournal"
Cohesion: 0.29
Nodes (8): applyLocal(), askDelete(), cash(), del(), put(), renderJournal(), saveFact(), showMsg()

### Community 10 - "render"
Cohesion: 0.20
Nodes (10): article(), cashState(), chk(), kMonths(), lay(), recFor(), recM(), render() (+2 more)

### Community 11 - "init"
Cohesion: 0.12
Nodes (25): applyPreset(), delSale(), fillCatSel(), fillMonths(), fillPhPoint(), fillSelects(), init(), lensData() (+17 more)

### Community 12 - "show"
Cohesion: 0.33
Nodes (10): isDark(), logoMarkup(), part(), show(), A(), applyTheme(), destroy(), exit() (+2 more)

### Community 13 - "rs.js"
Cohesion: 0.61
Nodes (7): byMonth(), calc(), chart(), days(), months(), render(), xlsx()

### Community 14 - "lsSet"
Cohesion: 0.29
Nodes (7): lsSet(), plStore(), renderPicker(), rpFlash(), rpMsg(), rpSave(), saveSel()

### Community 16 - "render"
Cohesion: 0.23
Nodes (12): applyTpl(), attach(), pick(), place(), render(), close(), open(), renderTemplates() (+4 more)

### Community 17 - "report/logic.ts"
Cohesion: 0.06
Nodes (87): sonner, todayTash(), DayReport(), Editor(), FiscalView(), FmState, PointCard(), PrepBanner() (+79 more)

### Community 18 - "AnalyticsPage.tsx"
Cohesion: 0.08
Nodes (69): xlsx, dark, Page(), qc, qs, PageHead(), AnalyticsPage(), Owner() (+61 more)

### Community 19 - "Button"
Cohesion: 0.09
Nodes (63): lucide-react, motion, InlineNumber(), InlineText(), NumProps, ChipTone, Button(), Editor() (+55 more)

### Community 20 - "kassa/logic.ts"
Cohesion: 0.11
Nodes (54): bcDays(), compute(), reserve(), kassaNow(), FormVal, Articles(), DayChart(), Insights() (+46 more)

### Community 21 - "sales/logic.ts"
Cohesion: 0.08
Nodes (54): get(), PRESETS, put(), SalesFilter(), state, sub(), subs, useSalesFilter() (+46 more)

### Community 25 - "react"
Cohesion: 0.07
Nodes (15): class-variance-authority, cn, radix-ui, react, Badge(), badgeVariants, buttonVariants, Calendar() (+7 more)

### Community 26 - "Card"
Cohesion: 0.15
Nodes (36): ActionLink, Card(), isLink(), Input(), fmt(), ExpenseBox(), LIST, KLBL (+28 more)

### Community 27 - "AddForm.tsx"
Cohesion: 0.10
Nodes (35): Checkbox(), Select(), SelectContent(), SelectItem(), SelectScrollDownButton(), SelectScrollUpButton(), SelectTrigger(), SelectValue() (+27 more)

### Community 28 - "UsersPage.tsx"
Cohesion: 0.12
Nodes (40): SheetHeader(), Switch(), ago(), base, demoRows(), byRoles(), call(), can() (+32 more)

### Community 29 - "tasks/parts.tsx"
Cohesion: 0.12
Nodes (36): Textarea(), HomeExtra, day(), demoStore(), errMsg(), fetchTasks(), fmtD(), fmtT() (+28 more)

### Community 30 - "App.tsx"
Cohesion: 0.10
Nodes (29): App(), Clock(), Gate(), KIT(), Loading(), PAGES, qc, Shell() (+21 more)

### Community 31 - "source.ts"
Cohesion: 0.12
Nodes (30): @tanstack/react-query, dark, Page(), qc, qs, addExpenseLimited(), bzSelect(), client() (+22 more)

### Community 32 - "pay.js"
Cohesion: 0.14
Nodes (29): addPay(), amountOf(), baseAmount(), cashless(), chip(), closeDrawer(), debtOf(), delItem() (+21 more)

### Community 33 - "plan/logic.ts"
Cohesion: 0.15
Nodes (30): barLabel(), HomeData, addD(), checkKey(), defaultCfg(), discOf(), dow(), isContact() (+22 more)

### Community 34 - "useIsPhone"
Cohesion: 0.11
Nodes (27): Block, BlockView(), Dash(), dateCell(), DayCash(), Pill(), Debt, DebtPay (+19 more)

### Community 35 - "SalesPage.tsx"
Cohesion: 0.14
Nodes (28): ExpMode, downloadCsv(), downloadXlsx(), save(), agg, checkKey(), cmpText(), csvOf() (+20 more)

### Community 36 - "demoRows"
Cohesion: 0.12
Nodes (22): demoAll(), rows(), addD(), bzAll(), OUT, rows(), T, demoExtra() (+14 more)

### Community 37 - "Segments"
Cohesion: 0.18
Nodes (21): FilterBar(), SegmentItem, Segments(), AnFilter(), PRESETS, Flt, monthOf(), monthRange() (+13 more)

### Community 38 - "home/logic.ts"
Cohesion: 0.09
Nodes (25): Batch, batchesOf(), BatchItem, batchStats(), curBatch(), docsOf(), normS(), R (+17 more)

### Community 39 - "Editor.tsx"
Cohesion: 0.13
Nodes (18): @hookform/resolvers, react-hook-form, zod, Login(), schema, Label(), Sheet(), SheetContent() (+10 more)

### Community 40 - "stock-billz/demo.ts"
Cohesion: 0.12
Nodes (21): B, build(), bzChecks, bzProducts, demoExtra(), iso(), payName(), PRODUCTS (+13 more)

### Community 41 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 42 - "users.js"
Cohesion: 0.26
Nodes (19): build(), call(), can(), fieldsHtml(), fillPt(), genPass(), getPerms(), list() (+11 more)

### Community 43 - "dependencies"
Cohesion: 0.10
Nodes (20): date-fns, react-day-picker, @supabase/supabase-js, dependencies, class-variance-authority@^0.7.1, cn@^0.5.2, date-fns@^4.4.0, @hookform/resolvers@^7.0.2 (+12 more)

### Community 44 - "cost-export.ts"
Cohesion: 0.11
Nodes (14): c, d, lastD, P, prods, pstat, sales, skus (+6 more)

### Community 45 - "ui.tsx"
Cohesion: 0.12
Nodes (13): FMT, XCol, XSheet, Head, lsGet(), lsSet(), PT, ptColor() (+5 more)

### Community 46 - "PlanPage.tsx"
Cohesion: 0.26
Nodes (17): WeeksTable(), fmt(), monthTitle(), pctF(), planMonths(), planPeriod(), planStatus(), plCls() (+9 more)

### Community 47 - "HomePage.tsx"
Cohesion: 0.19
Nodes (17): homeView(), AL_ICON, AL_TONE, GO(), HomePage(), sgn(), tint(), dateTitle() (+9 more)

### Community 48 - "Новая версия (web/): единый дизайн, движение, адаптация. Главная как эталон"
Cohesion: 0.12
Nodes (15): Варианты движка анимаций, Главная (порядок по важности), Движение (один файл правил `web/src/lib/motion.ts`), Зачем, Новая версия (web/): единый дизайн, движение, адаптация. Главная как эталон, Ограничения, Оставлено исполнителю, Остальные разделы (+7 more)

### Community 49 - "renderSales"
Cohesion: 0.16
Nodes (16): dayCashRows(), debtsOf(), flash(), periodKey(), periodSheet(), periodsIn(), pl(), prevList() (+8 more)

### Community 50 - "tasks.js"
Cohesion: 0.31
Nodes (15): card(), draw(), filtered(), filters(), formAdmin(), formProblem(), kpis(), listHtml() (+7 more)

### Community 51 - "Charts.tsx"
Cohesion: 0.19
Nodes (12): recharts, DayBar, narrow(), Tick(), Tip(), WeekChart(), DaysChart(), Tip() (+4 more)

### Community 52 - "plan-parity.ts"
Cohesion: 0.24
Nodes (12): demoAll(), nz(), OUT, planView(), rows(), demoExtra(), FRAMES, LENSES (+4 more)

### Community 54 - "package.json"
Cohesion: 0.13
Nodes (14): echarts-for-react, react-admin, react-dom, @refinedev/react-router, tw-animate-css, echarts-for-react@^3.0.6, react-admin@^5.15.5, react-dom@^19.3.1 (+6 more)

### Community 55 - "RowCards.tsx"
Cohesion: 0.28
Nodes (11): Cards(), Grid(), Props, RowCard(), useOpenKey(), Table(), TableBody(), TableCell() (+3 more)

### Community 56 - "access.ts"
Cohesion: 0.16
Nodes (14): Ctx, DEF, loadAccess(), make(), PERMS, Role, ROLE_LABEL, ROLES (+6 more)

### Community 57 - "Calendar.tsx"
Cohesion: 0.27
Nodes (13): Calendar(), mln(), mlnCell(), mS(), plOff(), Sum(), calDayOf(), calDefaultSel() (+5 more)

### Community 58 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+5 more)

### Community 59 - "parity.ts"
Cohesion: 0.17
Nodes (11): byCol(), ctx, data, db, M0, repDocs, rows, snap() (+3 more)

### Community 60 - "analytics-vite.config.ts"
Cohesion: 0.21
Nodes (8): @tailwindcss/vite, vite, @vitejs/plugin-react, @tailwindcss/vite@^4.3.4, vite@^8.3.6, @vitejs/plugin-react@^6.2.1, root, root

### Community 61 - "Stats.tsx"
Cohesion: 0.27
Nodes (11): fmtM(), Group, niceStep(), periodLabel(), statsOf(), StF, wdIdx(), Dash() (+3 more)

### Community 62 - "sales-parity.ts"
Cohesion: 0.24
Nodes (9): compute(), num0(), OUT, rows(), Scn, T, demoExtra(), iso() (+1 more)

### Community 63 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, allowImportingTsExtensions, lib, module, moduleResolution, noEmit, skipLibCheck, strict (+3 more)

### Community 64 - "devDependencies"
Cohesion: 0.18
Nodes (11): tailwindcss, @types/node, @types/react, @types/react-dom, typescript, devDependencies, tailwindcss@^4.3.4, @types/node@^26.6.6 (+3 more)

### Community 65 - "Касса Оптики — инструкции для Claude"
Cohesion: 0.22
Nodes (8): Задания и проблемы по точкам — вкладка «Задания», с 23.11.2026, Карта кода (Graphify), Касса Оптики — инструкции для Claude, Код, Правила работы, Приход сотрудников (Face ID) — папка `smena/`, с 15.11.2026, Распределение работы (экономия токенов) — решение владельца 06.11.2026, Роли доступа (с 16.11.2026, права-переключатели с 17.11.2026)

### Community 66 - "plan/Settings.tsx"
Cohesion: 0.39
Nodes (8): buildPlanDoc(), parseAmt(), PlanCalc, PlanCfg, plPrevShares(), comma(), PlanSettings(), Stop()

### Community 68 - "inner.js"
Cohesion: 0.33
Nodes (3): ROLE_DENY, roleFull(), roleName()

### Community 69 - "tidy.js"
Cohesion: 0.47
Nodes (3): apply(), keyOf(), scan()

### Community 70 - "tsconfig.json"
Cohesion: 0.40
Nodes (4): compilerOptions, paths, files, references

### Community 72 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, build, dev, preview

## Knowledge Gaps
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `ReconPage.tsx`, `report/logic.ts`, `AnalyticsPage.tsx`, `Button`, `kassa/logic.ts`, `sales/logic.ts`, `Card`, `AddForm.tsx`, `UsersPage.tsx`, `tasks/parts.tsx`, `App.tsx`, `source.ts`, `useIsPhone`, `SalesPage.tsx`, `Segments`, `Editor.tsx`, `dependencies`, `ui.tsx`, `PlanPage.tsx`, `HomePage.tsx`, `dropdown-menu.tsx`, `package.json`, `RowCards.tsx`, `access.ts`, `Calendar.tsx`, `Stats.tsx`, `plan/Settings.tsx`, `card.tsx`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Should `analytics/logic.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.04956726986624705 - nodes in this community are weakly interconnected._
- **Why does `compute()` connect `kassa/logic.ts` to `render`, `base.html.js`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Should `bz.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14453781512605043 - nodes in this community are weakly interconnected._
- **Should `os` be split into smaller, more focused modules?**
  _Cohesion score 0.053763440860215055 - nodes in this community are weakly interconnected._
- **Should `base.html.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05957767722473605 - nodes in this community are weakly interconnected._
- **Should `billz-sync/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.061495457721872815 - nodes in this community are weakly interconnected._