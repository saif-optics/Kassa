/* Касса · раздел «Пользователи» для владельца (patch_role.py): логины, роли, точки; сервер — функция users-admin.
   Показывается только при window.__sbRole === "admin" (без роли — тесты, локальный режим — не показываем). */
(function(){
  "use strict";
  const ROLES={admin:"Админ",cashier:"Кассир",seller:"Продавец",marketer:"Гость"};
  const NEEDPT=["cashier","seller"];
  const NOFN="Серверная функция не выложена";
  const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let built=false,loaded=false,busy=false;
  const $=id=>document.getElementById(id);
  // пароль 12 знаков: латиница и цифры без похожих (0/O, 1/l/I)
  function genPass(){
    const A="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789",b=new Uint32Array(12);
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
  function fillPoints(){
    const sel=$("ruPoint");if(!sel)return;const cur=sel.value,ps=points();
    if(sel.options.length===ps.length&&ps.every((p,i)=>sel.options[i].value===p))return;
    sel.innerHTML=ps.map(p=>`<option>${esc(p)}</option>`).join("");if(cur)sel.value=cur}
  function build(){
    const page=$("attUsers");if(!page||built)return;built=true;
    const s=document.createElement("section");s.className="panel";s.id="roleUsers";
    s.innerHTML=`<div class="ru-head"><h2>Пользователи</h2><button type="button" class="ru-btn" id="ruRefresh">Обновить</button></div>
<div class="ru-wrap"><table class="ru-tbl"><thead><tr><th>Логин</th><th>Статус</th><th>Точка</th><th>Кому выдан</th><th>Включён</th><th>Последний вход</th><th></th></tr></thead><tbody id="ruBody"><tr><td colspan="7" class="ru-mut">Загрузка…</td></tr></tbody></table></div>
<div class="ru-msg" id="ruTblMsg" role="status"></div>
<form class="ru-form" id="ruForm" autocomplete="off">
  <h3>Добавить пользователя</h3>
  <div class="ru-grid">
    <label>Логин (почта)<input type="email" id="ruEmail" required autocomplete="off"></label>
    <label>Пароль<span class="ru-pw"><input type="text" id="ruPass" minlength="10" required autocomplete="new-password"><button type="button" class="ru-btn" id="ruGen">Сгенерировать</button></span></label>
    <label>Статус<select id="ruRole"><option value="cashier">Кассир</option><option value="seller">Продавец</option><option value="marketer">Гость</option><option value="admin">Админ</option></select></label>
    <label id="ruPtL">Точка<select id="ruPoint"></select></label>
    <label>Кому выдан<input type="text" id="ruLabel" placeholder="Имя, необязательно" autocomplete="off"></label>
  </div>
  <div class="ru-act"><button type="submit" class="ru-btn ru-main" id="ruAdd">Добавить</button><span class="ru-msg" id="ruMsg" role="status"></span></div>
  <div class="ru-once" id="ruOnce" hidden><span>Пароль для <b id="ruOnceFor"></b>:</span><input type="text" id="ruOnceVal" readonly><button type="button" class="ru-btn" id="ruCopy">Скопировать</button><small>Запишите, больше не покажется.</small></div>
  <ul class="ru-hint"><li><b>Админ</b> — всё.</li><li><b>Кассир</b> — своя точка: продажи и расходы дня, вносит и правит за сегодня и вчера, журнал прихода.</li><li><b>Продавец</b> — своя точка, только просмотр и расход дня.</li><li><b>Гость</b> — продажи всех точек без себестоимости, расходов и плана.</li></ul>
</form>`;
    page.appendChild(s);
    $("ruRefresh").onclick=refresh;
    $("ruGen").onclick=()=>{$("ruPass").value=genPass()};
    const syncPt=()=>{const need=NEEDPT.includes($("ruRole").value);$("ruPtL").hidden=!need;$("ruPoint").required=need};
    $("ruRole").onchange=syncPt;syncPt();
    $("ruCopy").onclick=async()=>{const v=$("ruOnceVal");try{await navigator.clipboard.writeText(v.value);$("ruCopy").textContent="Скопировано"}catch(e){v.select();try{document.execCommand("copy");$("ruCopy").textContent="Скопировано"}catch(x){}}setTimeout(()=>{$("ruCopy").textContent="Скопировать"},2000)};
    $("ruForm").onsubmit=onAdd;
    $("ruBody").addEventListener("click",onAct);
    fillPoints();
  }
  let pwTimer=0;
  function showPass(email,pw){$("ruOnceFor").textContent=email;$("ruOnceVal").value=pw;$("ruOnce").hidden=false;clearTimeout(pwTimer);pwTimer=setTimeout(()=>{$("ruOnceVal").value="";$("ruOnce").hidden=true},90000)}
  async function onAdd(ev){
    ev.preventDefault();if(busy)return;
    const role=$("ruRole").value,email=$("ruEmail").value.trim(),password=$("ruPass").value;
    const point=NEEDPT.includes(role)?$("ruPoint").value:null;
    if(NEEDPT.includes(role)&&!point){msg("ruMsg","Выберите точку.",true);return}
    if(password.length<10){msg("ruMsg","Пароль — минимум 10 знаков.",true);return}
    busy=true;$("ruAdd").disabled=true;msg("ruMsg","Добавляю…");
    const r=await call("create",{email,password,role,point,label:$("ruLabel").value.trim()||null});
    busy=false;$("ruAdd").disabled=false;
    if(r.error){msg("ruMsg",r.error,true);return}
    msg("ruMsg","Пользователь добавлен");showPass(email,password);
    $("ruEmail").value="";$("ruPass").value="";$("ruLabel").value="";
    refresh()}
  async function onAct(ev){
    const b=ev.target.closest("[data-act]");if(!b||busy)return;
    const email=b.dataset.email,act=b.dataset.act;
    if(act==="del"||act==="pw"){
      if(!b.dataset.c){b.dataset.c="1";const t=b.textContent;b.textContent=act==="del"?"Точно удалить?":"Точно сменить?";b.style.color="var(--minus)";
        setTimeout(()=>{if(b.isConnected){delete b.dataset.c;b.textContent=t;b.style.color=""}},3000);return}}
    busy=true;b.disabled=true;let r;
    if(act==="del")r=await call("delete",{email});
    else if(act==="pw"){const pw=genPass();r=await call("password",{email,password:pw});if(!r.error)showPass(email,pw)}
    else r=await call("update",{email,active:act==="on"});
    busy=false;
    if(r.error){msg("ruTblMsg",r.error,true);b.disabled=false;return}
    msg("ruTblMsg",act==="del"?"Удалено":act==="pw"?"Пароль изменён, он показан под формой":"Сохранено");
    refresh()}
  async function refresh(){
    const body=$("ruBody");if(!body)return;loaded=true;
    const r=await list();
    if(r.error){body.innerHTML=`<tr><td colspan="7" class="ru-mut">${esc(r.error)}</td></tr>`;return}
    const me=String(window.__sbEmail||"").toLowerCase();
    if(!r.data.length){body.innerHTML=`<tr><td colspan="7" class="ru-mut">Пока никого нет</td></tr>`;return}
    body.innerHTML=r.data.map(u=>{
      const em=String(u.email||""),mine=em.toLowerCase()===me,on=u.active!==false;
      const act=mine?"":`<button type="button" class="ru-btn" data-act="${on?"off":"on"}" data-email="${esc(em)}">${on?"Выключить":"Включить"}</button><button type="button" class="ru-btn" data-act="pw" data-email="${esc(em)}">Новый пароль</button><button type="button" class="ru-btn ru-del" data-act="del" data-email="${esc(em)}">Удалить</button>`;
      return`<tr><td data-l="Логин">${esc(em)}</td><td data-l="Статус">${esc(ROLES[u.role]||u.role||"")}</td><td data-l="Точка">${esc(u.point||"—")}</td><td data-l="Кому выдан">${esc(u.label||"—")}</td><td data-l="Включён">${on?"да":"нет"}</td><td data-l="Последний вход">${esc(dt(u.last_sign_in_at||u.last_sign_in||u.last_login))}</td><td class="ru-acts">${act}</td></tr>`}).join("")}
  // вызывается страницей при показе вкладки «Контроль» (patch_role.py)
  window.__roleUsersRender=function(){
    if(window.__sbRole!=="admin")return;
    build();if(!built)return;
    fillPoints();
    if(!loaded)refresh()};
})();
