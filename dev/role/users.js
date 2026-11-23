/* Касса · раздел «Пользователи» для владельца и админа (patch_role.py): логины, статусы, точки, права; сервер — функция users-admin.
   Показывается только при window.__sbRole owner или admin (без роли — тесты, локальный режим — не показываем).
   Таблица сгруппирована по точкам; «Изменить» раскрывает форму под строкой; форма «Добавить» — те же поля и переключатели прав. */
(function(){
  "use strict";
  const ROLES={owner:"Владелец",admin:"Админ",cashier:"Кассир",seller:"Продавец",marketer:"Гость"};
  const NOFN="Серверная функция не выложена";
  // 11 прав: ключ, подпись
  const PERMS=[["sales_view","Видеть продажи"],["sales_write","Вносить продажи"],["sales_edit","Править и удалять продажи за сегодня и вчера"],
    ["exp_view","Видеть расходы дня"],["exp_add","Добавлять расход дня"],["exp_edit","Править и удалять расходы дня"],
    ["cash_view","Видеть кассу дня"],["debts_view","Видеть долги"],["att_view","Журнал прихода"],["analytics","Аналитика продаж"],["export","Экспорт в Excel"],["tasks","Задания своей точки"]];
  // стартовый набор по статусу (admin и owner — полный доступ)
  const DEF={cashier:PERMS.map(p=>p[0]).filter(k=>k!=="analytics"&&k!=="export"),
    seller:["sales_view","exp_view","exp_add","att_view","tasks"],marketer:["sales_view","analytics"]};
  const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const $=id=>document.getElementById(id);
  let built=false,loaded=false,busy=false,rows=[];
  const myRole=()=>window.__sbOwner?"owner":"admin";
  // пароль из n знаков: латиница и цифры без похожих (0/O, 1/l/I)
  function genPass(n){
    const A="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789",b=new Uint32Array(n||12);
    crypto.getRandomValues(b);return[...b].map(x=>A[x%A.length]).join("")}
  // вызов серверной функции: успех — data.ok, бизнес-ошибка — data.error (статус 200), сбой HTTP — тело ответа
  async function call(action,body){
    try{
      const r=await window.__sb.functions.invoke("users-admin",{body:Object.assign({action},body||{})});
      if(r.error){
        let m="";try{const j=await r.error.context.json();m=j&&j.error||""}catch(e){}
        return{error:m||(/not found|404|Failed to send|fetch/i.test(String(r.error.message||""))?NOFN:"Не удалось выполнить запрос")}}
      const d=r.data||{};
      if(d.error)return{error:String(d.error)};
      if(d.ok!==true)return{error:"Не удалось выполнить запрос"};
      return{data:d}
    }catch(e){return{error:e&&e.name==="FunctionsFetchError"?"Нет связи с сервером":NOFN}}}
  async function list(){
    // сначала RPC access_list, если его нет — функция
    try{const r=await window.__sb.rpc("access_list");if(r&&!r.error)return{data:Array.isArray(r.data)?r.data:[]}}catch(e){}
    const r=await call("list");if(r.error)return r;return{data:Array.isArray(r.data.users)?r.data.users:Array.isArray(r.data.list)?r.data.list:[]}}
  const dt=v=>{if(!v)return"ещё не входил";const d=new Date(v);if(isNaN(d))return"ещё не входил";
    return d.toLocaleString("ru-RU",{timeZone:"Asia/Tashkent",day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})};
  const msg=(id,t,bad)=>{const m=$(id);if(!m)return;m.textContent=t||"";m.style.color=bad?"var(--minus)":"var(--plus)"};
  function points(){const s=window.__roleSettings&&window.__roleSettings();return s&&Array.isArray(s.points)?s.points:[]}
  // ---- поля формы (общие для «Добавить» и «Изменить») ----
  function fieldsHtml(o){
    const roles=(myRole()==="owner"?["admin","cashier","seller","marketer"]:["cashier","seller","marketer"]);
    return`<div class="ru-grid">${o.create?`<label>Логин (почта)<input type="email" data-f="email" required autocomplete="off"></label>
    <label>Пароль<span class="ru-pw"><input type="text" data-f="password" minlength="10" required autocomplete="new-password"><button type="button" class="ru-btn" data-gen>Сгенерировать</button></span></label>`:""}
    ${o.limited?"":`<label>Статус<select data-f="role">${roles.map(r=>`<option value="${r}">${ROLES[r]}</option>`).join("")}</select></label>
    <label data-w="point">Точка<select data-f="point"></select></label>`}
    <label>Имя<input type="text" data-f="label" autocomplete="off"></label>
    <label>Телефон<input type="tel" data-f="phone" autocomplete="off"></label>
    <label>Должность<input type="text" data-f="position" autocomplete="off"></label>
    <label>Заметка<input type="text" data-f="note" autocomplete="off"></label>
  </div>${o.limited?"":`<fieldset class="ru-perms" data-w="perms"><legend>Права</legend>
    <div class="ru-pgrid">${PERMS.map(p=>`<label class="ru-pl"><input type="checkbox" class="ru-sw" data-p="${p[0]}"><span>${p[1]}</span></label>`).join("")}</div>
    <p class="ru-mut" data-w="full" hidden>Полный доступ</p></fieldset>`}`}
  const F=(root,k)=>root.querySelector('[data-f="'+k+'"]');
  function fillPt(root,cur){
    const sel=F(root,"point");if(!sel)return;const adm=F(root,"role").value==="admin",ps=points().slice();
    if(cur&&!ps.includes(cur))ps.push(cur);
    sel.innerHTML=(adm?'<option value="">Все точки</option>':"")+ps.map(p=>`<option>${esc(p)}</option>`).join("");
    sel.value=cur||(adm?"":ps[0]||"")}
  function setPerms(root,perms){root.querySelectorAll("[data-p]").forEach(c=>{c.checked=!!perms[c.dataset.p]})}
  function getPerms(root){const o={};PERMS.forEach(p=>{const c=root.querySelector('[data-p="'+p[0]+'"]');o[p[0]]=F(root,"role").value==="admin"?true:!!(c&&c.checked)});return o}
  // при смене статуса: точка, видимость прав, стартовый набор
  function syncRole(root,reset){
    const r=F(root,"role").value,adm=r==="admin";
    fillPt(root,adm?"":F(root,"point").value);
    root.querySelectorAll("[data-p]").forEach(c=>{c.closest("label").hidden=adm});
    root.querySelector('[data-w="full"]').hidden=!adm;
    if(reset&&!adm){const d=DEF[r]||[];setPerms(root,Object.fromEntries(PERMS.map(p=>[p[0],d.includes(p[0])])))}}
  function wire(root,u){
    if(F(root,"role")){
      F(root,"role").onchange=()=>syncRole(root,true);
      if(u){F(root,"role").value=u.role;fillPt(root,u.point||"")}else fillPt(root,"");
      syncRole(root,!u);
      if(u)setPerms(root,u.perms&&typeof u.perms==="object"?u.perms:Object.fromEntries(PERMS.map(p=>[p[0],(DEF[u.role]||[]).includes(p[0])])));
    }
    if(u){["label","phone","position","note"].forEach(k=>{F(root,k).value=u[k]||""})}
    const g=root.querySelector("[data-gen]");if(g)g.onclick=()=>{F(root,"password").value=genPass(12)};
  }
  function build(){
    const page=$("attUsers");if(!page||built)return;built=true;
    const s=document.createElement("section");s.className="panel";s.id="roleUsers";
    s.innerHTML=`<div class="ru-head"><h2>Пользователи</h2><button type="button" class="ru-btn" id="ruRefresh">Обновить</button></div>
<div class="ru-wrap"><table class="ru-tbl"><thead><tr><th>Логин</th><th>Имя</th><th>Статус</th><th>Телефон</th><th>Должность</th><th>Включён</th><th>Последний вход</th><th></th></tr></thead><tbody id="ruBody"><tr><td colspan="8" class="ru-mut">Загрузка…</td></tr></tbody></table></div>
<div class="ru-msg" id="ruTblMsg" role="status"></div>
<form class="ru-form" id="ruForm" autocomplete="off">
  <h3>Добавить пользователя</h3>
  ${fieldsHtml({create:true})}
  <div class="ru-act"><button type="submit" class="ru-btn ru-main" id="ruAdd">Добавить</button><span class="ru-msg" id="ruMsg" role="status"></span></div>
  <div class="ru-once" id="ruOnce" hidden><span>Пароль для <b id="ruOnceFor"></b>:</span><input type="text" id="ruOnceVal" readonly><button type="button" class="ru-btn" id="ruCopy">Скопировать</button><small>Запишите, больше не покажется.</small></div>
  <ul class="ru-hint"><li><b>Владелец</b> — всё и управление доступами.</li><li><b>Админ</b> — всё, кроме владельца и других админов.</li><li><b>Кассир, Продавец, Гость</b> — по переключателям; при выборе статуса ставится стартовый набор.</li></ul>
</form>`;
    page.appendChild(s);
    const f=$("ruForm");wire(f,null);F(f,"password").value=genPass(12);
    $("ruRefresh").onclick=refresh;
    $("ruCopy").onclick=async()=>{const v=$("ruOnceVal");try{await navigator.clipboard.writeText(v.value);$("ruCopy").textContent="Скопировано"}catch(e){v.select();try{document.execCommand("copy");$("ruCopy").textContent="Скопировано"}catch(x){}}setTimeout(()=>{$("ruCopy").textContent="Скопировать"},2000)};
    f.onsubmit=onAdd;
    $("ruBody").addEventListener("click",onAct);
  }
  let pwTimer=0;
  function showPass(email,pw){$("ruOnceFor").textContent=email;$("ruOnceVal").value=pw;$("ruOnce").hidden=false;clearTimeout(pwTimer);pwTimer=setTimeout(()=>{$("ruOnceVal").value="";$("ruOnce").hidden=true},90000)}
  const val=(root,k)=>{const e=F(root,k);return e?e.value.trim():""};
  async function onAdd(ev){
    ev.preventDefault();if(busy)return;const f=$("ruForm");
    const role=F(f,"role").value,email=val(f,"email"),password=F(f,"password").value;
    const point=F(f,"point").value||null;
    if(role!=="admin"&&!point){msg("ruMsg","Выберите точку.",true);return}
    if(password.length<10){msg("ruMsg","Пароль — минимум 10 знаков.",true);return}
    busy=true;$("ruAdd").disabled=true;msg("ruMsg","Добавляю…");
    const r=await call("create",{email,password,role,point,label:val(f,"label")||null,phone:val(f,"phone")||null,position:val(f,"position")||null,note:val(f,"note")||null,perms:getPerms(f)});
    busy=false;$("ruAdd").disabled=false;
    if(r.error){msg("ruMsg",r.error,true);return}
    msg("ruMsg","Пользователь добавлен");showPass(email,password);
    ["email","label","phone","position","note"].forEach(k=>{F(f,k).value=""});F(f,"password").value="";
    refresh()}
  // ---- строки таблицы ----
  // кто что может с этой строкой: edit — «Изменить» (limited — только имя, телефон, должность, заметка), ops — выключить, пароль, удалить
  function can(u){
    const mine=String(u.email||"").toLowerCase()===String(window.__sbEmail||"").toLowerCase(),me=myRole();
    if(u.role==="owner")return{edit:mine,limited:true,ops:false};
    if(u.role==="admin")return me==="owner"?{edit:true,limited:mine,ops:!mine}:{edit:mine,limited:true,ops:false};
    return{edit:true,limited:false,ops:!mine}}
  function rowHtml(u){
    const em=String(u.email||""),on=u.active!==false,c=can(u),e=esc(em);
    const act=(c.edit?`<button type="button" class="ru-btn" data-act="edit" data-email="${e}">Изменить</button>`:"")+
      (c.ops?`<button type="button" class="ru-btn" data-act="${on?"off":"on"}" data-email="${e}">${on?"Выключить":"Включить"}</button><button type="button" class="ru-btn" data-act="pw" data-email="${e}">Новый пароль</button><button type="button" class="ru-btn ru-del" data-act="del" data-email="${e}">Удалить</button>`:"");
    return`<tr data-row="${e}"><td data-l="Логин">${e}</td><td data-l="Имя">${esc(u.label||"—")}</td><td data-l="Статус">${esc(ROLES[u.role]||u.role||"")}</td><td data-l="Телефон">${esc(u.phone||"—")}</td><td data-l="Должность">${esc(u.position||"—")}</td><td data-l="Включён">${on?"да":"нет"}</td><td data-l="Последний вход">${esc(dt(u.last_sign_in_at||u.last_sign_in||u.last_login))}</td><td class="ru-acts">${act}</td></tr>`}
  function render(){
    const body=$("ruBody");
    if(!rows.length){body.innerHTML=`<tr><td colspan="8" class="ru-mut">Пока никого нет</td></tr>`;return}
    // группы по точкам: «Все точки» первой, дальше в порядке настроек, потом прочие
    const ps=points(),keys=[...new Set(rows.map(u=>u.point||""))];
    const ord=k=>k===""?-1:(ps.indexOf(k)>=0?ps.indexOf(k):1000);
    keys.sort((a,b)=>ord(a)-ord(b)||a.localeCompare(b,"ru"));
    body.innerHTML=keys.map(k=>{const g=rows.filter(u=>(u.point||"")===k);
      return`<tr class="ru-grp"><td colspan="8">${esc(k||"Все точки")} <span class="ru-mut">· ${g.length}</span></td></tr>`+g.map(rowHtml).join("")}).join("")}
  function openEdit(email){
    const body=$("ruBody"),old=body.querySelector(".ru-edit");
    const same=old&&old.dataset.for===email;if(old)old.remove();if(same)return;
    const u=rows.find(x=>x.email===email),tr=[...body.querySelectorAll("tr[data-row]")].find(x=>x.dataset.row===email);if(!u||!tr)return;
    const c=can(u),e=document.createElement("tr");e.className="ru-edit";e.dataset.for=email;
    e.innerHTML=`<td colspan="8"><form class="ru-form" autocomplete="off"><h3>Изменить: ${esc(email)}</h3>${fieldsHtml({limited:c.limited})}
<div class="ru-act"><button type="submit" class="ru-btn ru-main">Сохранить</button><button type="button" class="ru-btn" data-cancel>Отмена</button><span class="ru-msg" role="status"></span></div></form></td>`;
    tr.after(e);const f=e.querySelector("form");wire(f,u);
    f.querySelector("[data-cancel]").onclick=()=>e.remove();
    f.onsubmit=async ev=>{
      ev.preventDefault();if(busy)return;const m=f.querySelector(".ru-msg");
      const b={email,label:val(f,"label")||null,phone:val(f,"phone")||null,position:val(f,"position")||null,note:val(f,"note")||null};
      if(!c.limited){const role=F(f,"role").value,pt=F(f,"point").value||null;
        if(role!=="admin"&&!pt){m.textContent="Выберите точку.";m.style.color="var(--minus)";return}
        b.role=role;b.point=pt;b.perms=getPerms(f)}
      busy=true;m.textContent="Сохраняю…";m.style.color="var(--muted)";
      const r=await call("update",b);busy=false;
      if(r.error){m.textContent=r.error;m.style.color="var(--minus)";return}
      msg("ruTblMsg","Сохранено");refresh()}}
  async function onAct(ev){
    const b=ev.target.closest("[data-act]");if(!b||busy)return;
    const email=b.dataset.email,act=b.dataset.act;
    if(act==="edit"){openEdit(email);return}
    if(act==="del"||act==="pw"){
      if(!b.dataset.c){b.dataset.c="1";const t=b.textContent;b.textContent=act==="del"?"Точно удалить?":"Точно сменить?";b.style.color="var(--minus)";
        setTimeout(()=>{if(b.isConnected){delete b.dataset.c;b.textContent=t;b.style.color=""}},3000);return}}
    busy=true;b.disabled=true;let r;
    if(act==="del")r=await call("delete",{email});
    else if(act==="pw"){const pw=genPass(12);r=await call("password",{email,password:pw});if(!r.error)showPass(email,pw)}
    else r=await call("update",{email,active:act==="on"});
    busy=false;
    if(r.error){msg("ruTblMsg",r.error,true);b.disabled=false;return}
    msg("ruTblMsg",act==="del"?"Удалено":act==="pw"?"Пароль изменён, он показан под формой":"Сохранено");
    refresh()}
  async function refresh(){
    const body=$("ruBody");if(!body)return;loaded=true;
    const r=await list();
    if(r.error){rows=[];body.innerHTML=`<tr><td colspan="8" class="ru-mut">${esc(r.error)}</td></tr>`;return}
    rows=r.data;render()}
  // вызывается страницей при показе вкладки «Пользователи» (patch_role.py)
  window.__roleUsersRender=function(){
    if(!window.__roleFull||!window.__sbRole||!window.__roleFull())return;
    build();if(!built)return;
    const f=$("ruForm");if(f&&F(f,"role"))fillPt(f,F(f,"point").value);
    if(!loaded)refresh()};
})();
