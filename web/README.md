# Касса Оптики — новая версия (React)

Новая версия сайта собирается здесь по разделам. Рабочий сайт (`index.html` в корне, исходники в `dev/`) не меняется, пока раздел не перенесён и не сверен.

- Стек: React + Vite + TypeScript, Tailwind CSS + shadcn/ui, Motion, Lucide, TanStack Query, React Hook Form + Zod, Recharts, SheetJS, Supabase.
- Данные — та же база и тот же формат `docs`, что у рабочего сайта: обе версии видят одни платежи.
- Готовы все 12 разделов (`src/features/*`, включая Задания и Пользователей), расчёты сверены со старым сайтом скриптами `scripts/*-parity.ts`. Раздел выбирается адресом: `#home`, `#kassa`, `#sales`, `#report`, `#pay`, `#analytics`, `#plan`, `#lens`, `#recon`, `#batch`, `#tasks`, `#users`. Чистка 25.11.2026: в `package.json` только используемые пакеты, в `src/components/ui/` только используемые shadcn-компоненты (новый ставить `npx shadcn add <имя>`).
- Дизайн (с 24.11.2026, спека `docs/superpowers/specs/2026-11-24-new-design-home-design.md`): цвета бренда и логотип (`src/components/Logo.tsx`), общие компоненты `PageHead`, `Tile`, `Card`, `Segments`, `RowCards` (таблица → карточки на телефоне), `FilterBar` (фильтры в листе снизу), правила движения в одном файле `src/lib/motion.ts` (пилюля 0,36/0,55 с, посадка карточек 0,8 с с шагом 0,06 с). Сетка: телефон < 640, планшет 640–1279 (панель свёрнута), компьютер ≥ 1280. Витрина компонентов: `?demo#kit`.

## Команды
Node 24 на этом компьютере лежит в `C:\Users\user\.local\node` (в PATH не добавлен).

```
npm install
npm run dev            # http://localhost:5173 — настоящая база (нужен вход); с ?demo — тестовые данные
npm run build          # сборка в dist/
npx tsx scripts/parity.ts   # сверка «Платежей» со старым разделом: «совпало N из N»
npx tsx scripts/kassa-parity.ts rows; python scripts/kassa_old.py; npx tsx scripts/kassa-parity.ts cmp   # сверка Кассы (старая — собранный index.html в браузере)
```
