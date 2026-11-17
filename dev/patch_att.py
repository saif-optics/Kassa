#!/usr/bin/env python3
"""Касса: раздел «Пользователи» — доступы и журнал прихода сотрудников (smena/admin.html) во вкладке. Применять после patch_pay.py."""
import sys, io, os
SRC = sys.argv[1]
D = os.path.dirname(os.path.abspath(__file__)) + '/att/'
h = io.open(SRC, encoding="utf-8").read()
def rep(old, new, cnt=1):
    global h
    n = h.count(old); assert n == cnt, (old[:90], n); h = h.replace(old, new)

# --- вкладка после «Платежей»
A = 'data-tab="pay" aria-selected="false">Платежи</button>'
rep(A, A + '\n    <button type="button" role="tab" class="tab" data-tab="att" aria-selected="false">Пользователи</button>')
rep('const PAGES=["home","kassa","report","pay","sales","recon",', 'const PAGES=["home","kassa","report","pay","att","sales","recon",')
rep('const EXTRA=["pay","recon",', 'const EXTRA=["pay","att","recon",')
rep('const LBL={pay:"Платежи",recon:"Сверка",', 'const LBL={pay:"Платежи",att:"Пользователи",recon:"Сверка",')
RC = "    more:"
rep(RC, "    att:'<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 7.5V12l3 2\"/>',\n" + RC)
# на телефоне — в листе «Ещё»
rep('.tabs .tab[data-tab="pay"],', '.tabs .tab[data-tab="pay"],.tabs .tab[data-tab="att"],')

PAGE = '''  <div class="page" id="page-att" hidden>
    <header class="head">
      <div>
        <div class="eyebrow">Saif-Optics · пользователи</div>
        <h1>Пользователи</h1>
        <p>Пользователи и доступы · кто пришёл и во сколько</p>
      </div>
    </header>
    <div id="attUsers"></div>
    <div id="attBody"></div>
  </div>
'''
rep('  <div class="page" id="page-analytics" hidden>', PAGE + '  <div class="page" id="page-analytics" hidden>')
rep('    if(tab==="pay"){window.__PAY&&window.__PAY.render();return}', '    if(tab==="att"){window.__ATT&&window.__ATT.render();return}\n    if(tab==="pay"){window.__PAY&&window.__PAY.render();return}')

css = io.open(D + 'att.css', encoding='utf-8').read(); js = io.open(D + 'att.js', encoding='utf-8').read()
rep('</style>', css + '</style>')
rep('<!--patch-scripts-->', '<script>\n' + js + '\n</script>\n<!--patch-scripts-->')
io.open(SRC, "w", encoding="utf-8").write(h); print("ok")
