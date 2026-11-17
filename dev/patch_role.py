#!/usr/bin/env python3
"""Касса: роли и права — статус (owner, admin, cashier, seller, marketer) и итоговые права perms из RPC my_access (shim.html: window.__sbRole, __sbPoint, __sbPerms).
Вкладки и элементы страницы определяются правами (role/role.js, role.css, inner.js); owner и admin — полный доступ и раздел «Пользователи» (role/users.js).
Запись не-админа — RPC cashier_* и seller_add_expense. Применять после patch_att.py, перед patch_ui.py."""
import sys, io, os
SRC = sys.argv[1]
D = os.path.dirname(os.path.abspath(__file__)) + '/role/'
h = io.open(SRC, encoding="utf-8").read()
def rep(old, new, cnt=1):
    global h
    n = h.count(old); assert n == cnt, (old[:90], n); h = h.replace(old, new)

# --- setTab: запрещённую вкладку заменяем на «Продажи»
rep('  function setTab(t){\n    tab=t;', '  function setTab(t){\n    if(window.__roleOK&&!window.__roleOK(t))t=window.__roleFirst();\n    tab=t;')
# --- значки фильтра точки / формы расхода: после заполнения селектов фиксируем точку продавца
rep('    fillPhPoint();\n    $("setPoints").value', '    fillPhPoint();\n    if(window.__roleFill)window.__roleFill();\n    $("setPoints").value')
# --- расход дня продавца: RPC вместо записи в docs
rep('    if(mode!=="db"){flash("dxMsg","Расходы сохраняются только в опубликованной странице.",true);return}',
    '    if(window.__roleExpRpc&&window.__roleExpRpc()){\n'
    '      $("dxSubmit").disabled=true;\n'
    '      try{const r=await window.__sb.rpc("seller_add_expense",{p_name:name,p_amount:amount,p_date:date});if(r.error)throw r.error;\n'
    '        $("dxName").value="";$("dxAmount").value="";\n'
    '        try{await window.__sbReload();flash("dxMsg","Расход добавлен")}catch(e2){flash("dxMsg","Расход добавлен, обновите страницу")}}\n'
    '      catch(e){flash("dxMsg",String((e&&e.message)||"Не удалось сохранить расход."),true)}\n'
    '      finally{$("dxSubmit").disabled=false}\n'
    '      return}\n'
    '    if(mode!=="db"){flash("dxMsg","Расходы сохраняются только в опубликованной странице.",true);return}')
# --- KPI «Б/Ч − расходы дня» маркетологу не показываем
K = '+CARD("Б/Ч − расходы дня",fmt(a.cash-expSum)+" сум",`наличные ${fmt(a.cash)} · расходы ${fmt(expSum)}`);'
rep(K, '+(window.__roleNoCash?"":CARD("Б/Ч − расходы дня",fmt(a.cash-expSum)+" сум",`наличные ${fmt(a.cash)} · расходы ${fmt(expSum)}`));')
# --- старт: роль уже известна (shim ждёт my_access до готовности хранилища)
rep('    mode="db";$("salesStatus").textContent="Сохраняется автоматически";', '    mode="db";if(window.__roleApply)window.__roleApply();$("salesStatus").textContent="Сохраняется автоматически";')
# --- шаблоны расходов продавца + блок роли внутри скрипта страницы
A3 = 'db.doc("settings/analytics3").onSnapshot(s=>{if(s.exists&&Array.isArray(s.data().off)){anSel=s.data().off;if(tab==="analytics")renderAnalytics()}},()=>{});'
inner = io.open(D + 'inner.js', encoding='utf-8').read()
rep(A3 + '\n  }\n  init();\n})();',
    A3 + '\n    db.doc("settings/sellerTpl").onSnapshot(s=>{if(window.__roleTpl)window.__roleTpl(s.exists?s.data():null)},()=>{});\n  }\n' + inner + '  init();\n})();')
# --- раздел «Пользователи» владельца: рисуем при показе вкладки «Пользователи»
rep('    if(tab==="att"){window.__ATT&&window.__ATT.render();return}', '    if(tab==="att"){window.__roleUsersRender&&window.__roleUsersRender();window.__ATT&&window.__ATT.render();return}')
# --- подпись «Пользователи» в шторке «Ещё» для не-админа — «Приход» (как во вкладках)
rep('att:"Пользователи",recon:', 'get att(){return window.__roleFull&&!window.__roleFull()?"Приход":"Пользователи"},recon:')
# --- ошибки сервера (кассир) вместо общего «Не удалось сохранить»
rep('?"Хранилище заполнено.":"Не удалось сохранить. Попробуйте ещё раз.",true)}\n    finally{$("sSubmit")', '?"Хранилище заполнено.":window.__roleErr(err,"Не удалось сохранить. Попробуйте ещё раз."),true)}\n    finally{$("sSubmit")')
rep('catch(e){flash("dxMsg","Не удалось сохранить расход.",true)}', 'catch(e){flash("dxMsg",window.__roleErr(e,"Не удалось сохранить расход."),true)}')
rep('catch(e){sMsg("Не удалось удалить.",true)}', 'catch(e){sMsg(window.__roleErr(e,"Не удалось удалить."),true)}')
rep('catch(e){flash("dxMsg","Не удалось удалить.",true)}', 'catch(e){flash("dxMsg",window.__roleErr(e,"Не удалось удалить."),true)}')
# --- логотип/ссылки data-tab-go: запрещённое → «Продажи»
rep('const t=document.querySelector(\'.tab[data-tab="\'+b.dataset.tabGo+\'"]\');',
    'const t=document.querySelector(\'.tab[data-tab="\'+(window.__roleOK&&!window.__roleOK(b.dataset.tabGo)?window.__roleFirst():b.dataset.tabGo)+\'"]\');')
# --- шторка «Ещё»: только разрешённые разделы, рядом с почтой — роль
rep('EXTRA.map(k=>`<button type="button" class="more-it"', 'EXTRA.filter(k=>!window.__roleOK||window.__roleOK(k)).map(k=>`<button type="button" class="more-it"')
rep('<div class="more-acc"><span>${window.__sbEmail.replace(/[<>&"]/g,"")}</span>',
    '<div class="more-acc"><span>${window.__sbEmail.replace(/[<>&"]/g,"")}${window.__roleLabel?`<small>${window.__roleLabel.replace(/[<>&"]/g,"")}</small>`:""}</span>')

css = io.open(D + 'role.css', encoding='utf-8').read(); js = io.open(D + 'role.js', encoding='utf-8').read(); ujs = io.open(D + 'users.js', encoding='utf-8').read()
rep('</style>', css + '</style>')
rep('<!--patch-scripts-->', '<script>\n' + js + '\n</script>\n<script>\n' + ujs + '\n</script>\n<!--patch-scripts-->')
io.open(SRC, "w", encoding="utf-8").write(h); print("ok")
