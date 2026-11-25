# -*- coding: utf-8 -*-
"""Русские названия групп графа Graphify по файлам, которые в группе преобладают.

Graphify при каждом `graphify update .` заново делит граф на группы и теряет ручные имена,
поэтому имена считаются автоматически: читаем graphify-out/graph.json, для каждой группы берём
преобладающие файлы и самый связанный узел (хаб), пишем graphify-out/.graphify_labels.json и
просим graphify перерисовать отчёт и картинку: `graphify cluster-only . --no-label`.

Запуск из корня репо: python dev/graph_labels.py  (делают build.sh / build.ps1 и kassa-build).
"""
import json, os, re, subprocess, sys
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "graphify-out")
GRAPH = os.path.join(OUT, "graph.json")

SECTION = {"home": "Главная", "kassa": "Касса", "sales": "Продажи", "report": "Отчёт р/с", "pay": "Платежи",
           "tasks": "Задания", "users": "Пользователи", "analytics": "Аналитика", "plan": "План", "lens": "Линзы",
           "recon": "Сверка", "stock": "Склад", "stock-billz": "Склад Billz", "stock-margin": "Склад (файл, маржа)"}
OLD_MOD = {"bz": "Сверка Billz (bz.js)", "rs": "Отчёт р/с (rs.js)", "fm": "Фискальные модули (fm.js)",
           "pay": "Платежи (pay.js)", "tasks": "Задания (tasks.js)", "role": "Роли и пользователи", "att": "Приход (att.js)",
           "splash": "Заставка с логотипом", "tidy": "Чистка (tidy.js)", "test": "Тесты", "billz": "Billz"}
# хабы base.html → раздел старого сайта
OLD_HUB = [("analytic", "Аналитика"), ("cash", "Касса"), ("journal", "Касса: журнал"), ("sale", "Продажи"),
           ("debt", "Продажи: долги"), ("batch", "Склад и партии"), ("margin", "Склад: маржа"), ("pl", "План"),
           ("tpl", "Шаблоны"), ("enhance", "Оформление полей"), ("ls", "Локальные настройки"), ("home", "Главная"),
           ("report", "Отчёт"), ("photo", "Фото листов"), ("render", "Отрисовка")]


def area(path: str) -> str:
    """Человеческое имя области по пути файла."""
    p = path.replace("\\", "/")
    m = re.match(r"web/src/features/([^/]+)/", p)
    if m:
        return "Новая версия: " + SECTION.get(m.group(1), m.group(1))
    if p.startswith("web/src/components/ui/"): return "UI shadcn"
    if p.startswith("web/src/components/"): return "Новая версия: общие компоненты"
    if p.startswith("web/src/lib/") or p in ("web/src/App.tsx", "web/src/main.tsx"): return "Новая версия: каркас и данные"
    if p.startswith("web/scripts/"): return "Скрипты сверок и выгрузок"
    if p.startswith("web/") and p.endswith((".json", ".config.ts", ".d.ts")): return "Настройки web"
    if p.startswith("supabase/functions/"): return "Серверные функции Supabase"
    if p.startswith("supabase/"): return "База: миграции"
    if p.startswith("dev/graph-src/") or p == "dev/base.html": return "Старый сайт: base.html"
    m = re.match(r"dev/([^/]+)/", p)
    if m:
        return "Старый сайт: " + OLD_MOD.get(m.group(1), m.group(1))
    if p.startswith("dev/patch_"): return "Сборка старого сайта: патчи"
    if p.startswith("dev/"): return "Сборка старого сайта"
    if p.startswith("smena/"): return "Киоск смены (Face ID)"
    if p.endswith(".md"): return "Документация"
    return "Прочее"


def main() -> int:
    if not os.path.exists(GRAPH):
        print("graphify-out/graph.json нет — сначала graphify update ."); return 1
    g = json.load(open(GRAPH, encoding="utf-8"))
    nodes = g["nodes"]; by_id = {n["id"]: n for n in nodes}
    deg = Counter()
    for e in g.get("links", []):
        deg[e.get("source")] += 1; deg[e.get("target")] += 1
    groups = defaultdict(list)
    for n in nodes:
        groups[str(n.get("community"))].append(n)
    labels, used = {}, Counter()
    for c, ns in groups.items():
        areas = Counter(area(n.get("source_file") or "") for n in ns if n.get("source_file"))
        name = areas.most_common(1)[0][0] if areas else "Прочее"
        hub = max(ns, key=lambda n: deg[n["id"]])
        hub_name = (hub.get("label") or hub["id"]).replace("()", "")
        if name == "Старый сайт: base.html":
            low = hub_name.lower(); sub = next((s for k, s in OLD_HUB if k in low), None)
            name = "Старый сайт: " + (sub or "base.html") + f" ({hub_name})"
        elif name in ("UI shadcn", "Новая версия: общие компоненты", "Новая версия: каркас и данные", "Скрипты сверок и выгрузок",
                      "Настройки web", "Документация", "Прочее") or used[name]:
            name = f"{name} ({hub_name})"
        used[name] += 1
        if used[name] > 1: name = f"{name} {used[name]}"
        labels[c] = name
    with open(os.path.join(OUT, ".graphify_labels.json"), "w", encoding="utf-8") as f:
        json.dump(labels, f, ensure_ascii=False, indent=0)
    print(f"групп: {len(labels)}; имена записаны")
    if "--no-render" not in sys.argv:
        r = subprocess.run(["graphify", "cluster-only", ".", "--no-label"], cwd=ROOT, capture_output=True, text=True)
        print((r.stdout or r.stderr).strip().splitlines()[-1] if (r.stdout or r.stderr) else "cluster-only: пусто")
        return r.returncode
    return 0


if __name__ == "__main__":
    sys.exit(main())
