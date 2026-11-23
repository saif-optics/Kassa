#!/usr/bin/env python3
"""Касса: вкладка «Задания» (задания и проблемы по точкам). Применять после patch_att.py и patch_role.py."""
import sys, io, os, re
SRC = sys.argv[1]
D = os.path.dirname(os.path.abspath(__file__)) + '/tasks/'
h = io.open(SRC, encoding="utf-8").read()
def rep(old, new, cnt=1):
    global h
    n = h.count(old); assert n == cnt, (old[:90], n); h = h.replace(old, new)

# --- вкладка после «att» (подпись у неё меняет patch_role, поэтому ищем по data-tab)
m = re.findall(r'<button[^>]*data-tab="att"[^>]*>[^<]*</button>', h)
assert len(m) == 1, ('кнопка вкладки att не найдена', len(m))
rep(m[0], m[0] + '\n    <button type="button" role="tab" class="tab" data-tab="tasks" aria-selected="false">Задания</button>')
rep('"att","sales","recon",', '"att","tasks","sales","recon",')
rep('"pay","att","recon",', '"pay","att","tasks","recon",')
rep('const LBL={', 'const LBL={tasks:"Задания",')  # подпись att у patch_role — геттер, поэтому якорь на начало объекта
RC = "    more:"
rep(RC, "    tasks:'<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"3\"/><path d=\"M8.5 12.5l2.5 2.5 4.5-5\"/>',\n" + RC)
rep('.tabs .tab[data-tab="att"],', '.tabs .tab[data-tab="att"],.tabs .tab[data-tab="tasks"],')

PAGE = '''  <div class="page" id="page-tasks" hidden>
    <header class="head">
      <div>
        <div class="eyebrow">Saif-Optics · задания</div>
        <h1>Задания</h1>
        <p>Задания и проблемы по точкам</p>
      </div>
    </header>
    <div id="tasksBody"></div>
  </div>
'''
rep('  <div class="page" id="page-analytics" hidden>', PAGE + '  <div class="page" id="page-analytics" hidden>')
rep('    if(tab==="att"){', '    if(tab==="tasks"){window.__TASKS&&window.__TASKS.render();return}\n    if(tab==="att"){')

css = io.open(D + 'tasks.css', encoding='utf-8').read(); js = io.open(D + 'tasks.js', encoding='utf-8').read()
rep('</style>', css + '</style>')
rep('<!--patch-scripts-->', '<script>\n' + js + '\n</script>\n<!--patch-scripts-->')
io.open(SRC, "w", encoding="utf-8").write(h); print("ok")
