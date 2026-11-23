/* Касса · вкладка «Пользователи» для владельца и админа (patch_role.py); сервер — функция users-admin и RPC admin_sessions / admin_end_session.
   Показывается только при window.__sbRole owner или admin (без роли — тесты, локальный режим — не показываем).
   Три подраздела (сегмент сверху, выбор запоминается): «Фейс-контроль по точкам» (плитки прихода за сегодня; под ними журнал #attBody),
   «Активные сессии» (по пользователям, завершение сессии, доступ к сайту), «Пользователи» (таблица по точкам, статус и точка прямо в строке,
   «Изменить» раскрывает форму под строкой, форма «Добавить»). */
(function(){
  "use strict";
  const ROLES={owner:"Владелец",admin:"Админ",cashier:"Кассир",seller:"Продавец",marketer:"Гость"};
  const NOFN="Серверная функция не выложена";
  // 12 прав: ключ, подпись
  const PERMS=[["sales_view","Видеть продажи"],["sales_write","Вносить продажи"],["sales_edit","Править и удалять продажи за сегодня и вчера"],
    ["exp_view","Видеть расходы дня"],["exp_add","Добавлять расход дня"],["exp_edit","Править и удалять расходы дня"],
    ["cash_view","Видеть кассу дня"],["debts_view","Видеть долги"],["att_view","Журнал прихода"],["analytics","Аналитика продаж"],["export","Экспорт в Excel"],["tasks","Задания своей точки"]];
  // стартовый набор по статусу (admin и owner — полный доступ)
  const DEF={cashier:PERMS.map(p=>p[0]).filter(k=>k!=="analytics"&&k!=="export"),
    seller:["sales_view","exp_view","exp_add","att_view","tasks"],marketer:["sales_view","analytics"]};
  const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const $=id=>document.getElementById(id);
  let built=false,loaded=false,busy=false,rows=[],sub="face",sessRows=[];
  const SUBS=[["face","Фейс-контроль по точкам"],["sess","Активные сессии"],["users","Пользователи"]];
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
    let saved="";try{saved=localStorage.getItem("ruSub")||""}catch(e){}
    if(SUBS.some(x=>x[0]===saved))sub=saved;
    s.innerHTML=`<div class="seg ru-seg" role="group" aria-label="Подраздел" id="ruSeg">${SUBS.map(x=>`<button type="button" data-sub="${x[0]}" aria-pressed="${x[0]===sub}">${x[1]}</button>`).join("")}</div>
<div class="ru-sub" id="ruPFace" hidden><div class="ru-head"><h2>Фейс-контроль по точкам</h2><button type="button" class="ru-btn" id="ruFaceRef">Обновить</button></div>
<div id="ruFaceBody" class="ru-tiles"><p class="ru-mut">Загрузка…</p></div></div>
<div class="ru-sub" id="ruPSess" hidden><div class="ru-head"><h2>Активные сессии</h2><button type="button" class="ru-btn" id="ruSessRef">Обновить</button></div>
<div id="ruSessBody"><p class="ru-mut">Загрузка…</p></div><div class="ru-msg" id="ruSessMsg" role="status"></div>
<p class="ru-note">Завершение сессии действует после обновления страницы у пользователя, не позже чем через час.</p></div>
<div class="ru-sub" id="ruPUsers" hidden><div class="ru-head"><h2>Пользователи</h2><button type="button" class="ru-btn" id="ruRefresh">Обновить</button></div>
<div class="ru-wrap"><table class="ru-tbl"><thead><tr><th>Логин</th><th>Имя</th><th>Статус</th><th>Точка</th><th>Телефон</th><th>Должность</th><th>Включён</th><th>Последний вход</th><th></th></tr></thead><tbody id="ruBody"><tr><td colspan="9" class="ru-mut">Загрузка…</td></tr></tbody></table></div>
<div class="ru-msg" id="ruTblMsg" role="status"></div>
<form class="ru-form" id="ruForm" autocomplete="off">
  <h3>Добавить пользователя</h3>
  ${fieldsHtml({create:true})}
  <div class="ru-act"><button type="submit" class="ru-btn ru-main" id="ruAdd">Добавить</button><span class="ru-msg" id="ruMsg" role="status"></span></div>
  <div class="ru-once" id="ruOnce" hidden><span>Пароль для <b id="ruOnceFor"></b>:</span><input type="text" id="ruOnceVal" readonly><button type="button" class="ru-btn" id="ruCopy">Скопировать</button><small>Запишите, больше не покажется.</small></div>
  <ul class="ru-hint"><li><b>Владелец</b> — всё и управление доступами.</li><li><b>Админ</b> — всё, кроме владельца и других админов.</li><li><b>Кассир, Продавец, Гость</b> — по переключателям; при выборе статуса ставится стартовый набор.</li></ul>
</form></div>`;
    page.appendChild(s);
    const f=$("ruForm");wire(f,null);F(f,"password").value=genPass(12);
    $("ruRefresh").onclick=refresh;
    $("ruCopy").onclick=async()=>{const v=$("ruOnceVal");try{await navigator.clipboard.writeText(v.value);$("ruCopy").textContent="Скопировано"}catch(e){v.select();try{document.execCommand("copy");$("ruCopy").textContent="Скопировано"}catch(x){}}setTimeout(()=>{$("ruCopy").textContent="Скопировать"},2000)};
    f.onsubmit=onAdd;
    $("ruBody").addEventListener("click",onAct);
    $("ruBody").addEventListener("change",onSel);
    $("ruSeg").onclick=ev=>{const b=ev.target.closest("[data-sub]");if(b)setSub(b.dataset.sub)};
    $("ruFaceRef").onclick=loadFace;$("ruSessRef").onclick=loadSess;
    $("ruSessBody").addEventListener("click",onSessAct);$("ruSessBody").addEventListener("change",onAccess);
  }
  // переключение подраздела: показать свою панель, журнал #attBody — только в «Фейс-контроле» (att.js не трогаем)
  function setSub(k){
    if(!SUBS.some(x=>x[0]===k))k="face";sub=k;try{localStorage.setItem("ruSub",k)}catch(e){}
    SUBS.forEach(x=>{const p=$({face:"ruPFace",sess:"ruPSess",users:"ruPUsers"}[x[0]]);if(p)p.hidden=x[0]!==k});
    document.querySelectorAll("#ruSeg [data-sub]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.sub===k)));
    const ab=$("attBody");if(ab)ab.style.display=k==="face"?"":"none";
    if(k==="face")loadFace();else if(k==="sess")loadSess();else if(!loaded)refresh()}
  // ---- «Фейс-контроль»: приход за сегодня по Ташкенту (UTC+5) ----
  const TZ=5*3600000,HM=ms=>{const d=new Date(ms+TZ);return String(d.getUTCHours()).padStart(2,"0")+":"+String(d.getUTCMinutes()).padStart(2,"0")};
  let faceSeq=0;
  async function loadFace(){
    const box=$("ruFaceBody");if(!box)return;const my=++faceSeq;
    try{
      const day=new Date(Date.now()+TZ).toISOString().slice(0,10),t0=new Date(day+"T00:00:00+05:00").toISOString();
      const [a,b,c]=await Promise.all([window.__sb.from("att_points").select("point,start_time"),
        window.__sb.from("att_employees").select("id,name,point,active").eq("active",true),
        window.__sb.from("att_events").select("employee_id,point,kind,ts").gte("ts",t0).order("ts",{ascending:true})]);
      if(my!==faceSeq)return;
      const er=a.error||b.error||c.error;if(er){box.innerHTML=`<p class="ru-mut">${esc(er.message||"Не удалось загрузить приход")}</p>`;return}
      box.innerHTML=faceHtml(day,a.data||[],b.data||[],c.data||[])
    }catch(e){if(my===faceSeq)box.innerHTML=`<p class="ru-mut">Не удалось загрузить приход</p>`}}
  function faceHtml(day,pts,emps,evs){
    const start={};pts.forEach(p=>{start[p.point]=String(p.start_time||"").slice(0,5)});
    const keys=[...new Set([...pts.map(p=>p.point),...emps.map(e=>e.point)])].filter(Boolean),ps=points();
    const o=k=>ps.indexOf(k)>=0?ps.indexOf(k):1000;
    keys.sort((x,y)=>o(x)-o(y)||String(x).localeCompare(String(y),"ru"));
    if(!keys.length)return`<p class="ru-mut">Нет точек и сотрудников</p>`;
    return keys.map(pt=>{
      const st0=start[pt]||"",st=/^\d{1,2}:\d{2}$/.test(st0)?st0.padStart(5,"0"):"10:00",sm=new Date(day+"T"+st+":00+05:00").getTime();
      let came=0,late=0,none=0;
      const li=emps.filter(e=>e.point===pt).sort((x,y)=>String(x.name).localeCompare(String(y.name),"ru")).map(e=>{
        const mine=evs.filter(v=>v.employee_id===e.id).map(v=>({k:v.kind,t:new Date(v.ts).getTime()})).filter(v=>!isNaN(v.t)).sort((x,y)=>x.t-y.t);
        const ins=mine.filter(v=>v.k==="in"),outs=mine.filter(v=>v.k==="out");
        let txt,cls;
        if(!ins.length){none++;txt="ещё нет";cls="ru-mut"}
        else{const fi=ins[0].t,m=Math.max(1,Math.floor((fi-sm)/60000));
          if(fi>sm){late++;txt="опоздал на "+m+" мин, "+HM(fi);cls="ru-bad"}
          else if(fi>=sm-600000){came++;txt="впритык "+HM(fi);cls="ru-warn"}
          else{came++;txt="пришёл "+HM(fi);cls="ru-ok"}
          const lastIn=ins[ins.length-1],lo=outs[outs.length-1];if(lo&&lo.t>lastIn.t)txt+=" · ушёл "+HM(lo.t)}
        return`<li><span>${esc(e.name||"—")}</span><span class="${cls}">${esc(txt)}</span></li>`}).join("");
      return`<div class="ru-tile"><div class="ru-th"><b>${esc(pt)}</b><span class="ru-mut">начало ${esc(st)}</span></div>
<div class="ru-cnt"><span class="ru-ok">пришли ${came}</span><span class="ru-bad">опоздали ${late}</span><span class="ru-mut">ещё нет ${none}</span></div>
<ul class="ru-emp">${li||`<li class="ru-mut">Нет сотрудников</li>`}</ul></div>`}).join("")}
  // ---- «Активные сессии» ----
  function uaText(ua){
    ua=String(ua||"");let d="",b="",m;
    if(/iPhone/.test(ua))d="iPhone"+((m=ua.match(/OS (\d+)/))?" iOS "+m[1]:"");
    else if(/iPad/.test(ua))d="iPad"+((m=ua.match(/OS (\d+)/))?" iOS "+m[1]:"");
    else if(/Android/.test(ua))d="Android"+((m=ua.match(/Android (\d+)/))?" "+m[1]:"");
    else if(/Macintosh|Mac OS X/.test(ua))d="Mac";
    else if(/Windows/.test(ua))d="Windows";
    else if(/Linux/.test(ua))d="Linux";
    if(/YaBrowser/.test(ua))b="Яндекс";else if(/Edg/.test(ua))b="Edge";else if(/Firefox|FxiOS/.test(ua))b="Firefox";
    else if(/CriOS|Chrome/.test(ua))b="Chrome";else if(/Safari/.test(ua))b="Safari";
    return[d,b].filter(Boolean).join(" · ")||ua.slice(0,40)||"неизвестное устройство"}
  let sessSeq=0;
  async function loadSess(){
    const box=$("ruSessBody");if(!box)return;const my=++sessSeq;
    let r;try{r=await window.__sb.rpc("admin_sessions")}catch(e){r={error:{message:NOFN}}}
    if(my!==sessSeq)return;
    if(!r||r.error){box.innerHTML=`<p class="ru-mut">${esc(r&&r.error&&r.error.message||"Не удалось загрузить сессии")}</p>`;return}
    if(!loaded){const l=await list();if(!l.error)rows=l.data;if(my!==sessSeq)return}
    sessRows=Array.isArray(r.data)?r.data:[];box.innerHTML=sessHtml()}
  function sessHtml(){
    if(!sessRows.length)return`<p class="ru-mut">Активных сессий нет</p>`;
    const by=new Map();sessRows.forEach(x=>{const k=String(x.email||"").toLowerCase();if(!by.has(k))by.set(k,[]);by.get(k).push(x)});
    return[...by.values()].map(g=>{
      const h=g[0],em=String(h.email||""),e=esc(em),u=rows.find(x=>String(x.email||"").toLowerCase()===em.toLowerCase()),on=!u||u.active!==false;
      const sw=(u&&h.role&&can({email:em,role:h.role}).ops)?`<label class="ru-pl ru-acc"><span>Доступ к сайту</span><input type="checkbox" class="ru-sw" data-access="${e}"${on?" checked":""}></label>`:"";
      const items=g.map(x=>`<li><div><b>${esc(uaText(x.user_agent))}</b>${x.is_current?' <span class="ru-cur">эта сессия</span>':""}</div>
<div class="ru-mut">вход ${esc(x.created_at?dt(x.created_at):"—")} · активность ${esc(x.last_at?dt(x.last_at):"—")} · сеть ${esc(x.ip||"—")}</div>
${x.is_current?"":`<button type="button" class="ru-btn ru-del" data-end="${esc(x.id)}">Завершить сессию</button>`}</li>`).join("");
      return`<div class="ru-user"><div class="ru-uh"><span>${esc(h.label||"—")} · ${esc(ROLES[h.role]||h.role||"")} · ${esc(h.point||"Все точки")} · ${e}</span>${sw}</div><ul class="ru-sess">${items}</ul></div>`}).join("")}
  async function onSessAct(ev){
    const b=ev.target.closest("[data-end]");if(!b||busy)return;busy=true;b.disabled=true;
    let r;try{r=await window.__sb.rpc("admin_end_session",{p_id:b.dataset.end})}catch(e){r={error:{message:NOFN}}}
    busy=false;
    if(!r||r.error){msg("ruSessMsg",r&&r.error&&r.error.message||"Не удалось завершить сессию",true);b.disabled=false;return}
    msg("ruSessMsg","Сессия завершена");loadSess()}
  async function onAccess(ev){
    const c=ev.target.closest("[data-access]");if(!c||busy)return;
    const on=c.checked;busy=true;c.disabled=true;
    const r=await call("update",{email:c.dataset.access,active:on});busy=false;
    if(r.error){msg("ruSessMsg",r.error,true);c.checked=!on;c.disabled=false;return}
    msg("ruSessMsg",r.data&&r.data.warn?String(r.data.warn):on?"Доступ включён":"Доступ выключен, сессии завершены. Включить обратно можно в подразделе «Пользователи»",!!(r.data&&r.data.warn));
    refresh();loadSess()}
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
  // select-ы статуса и точки в строке: доступны там же, где доступны «Выключить»/«Удалить» (c.ops)
  function selHtml(u,c){
    const d=c.ops?"":" disabled",roles=myRole()==="owner"?["admin","cashier","seller","marketer"]:["cashier","seller","marketer"];
    if(!roles.includes(u.role))roles.unshift(u.role);
    const adm=u.role==="admin"||u.role==="owner",ps=points().slice();if(u.point&&!ps.includes(u.point))ps.push(u.point);
    const po=(adm?'<option value="">Все точки</option>':(u.point?"":'<option value="">—</option>'))+ps.map(p=>`<option value="${esc(p)}"${p===u.point?" selected":""}>${esc(p)}</option>`).join("");
    return`<td data-l="Статус"><select class="ru-sel" data-sel="role"${d}>${roles.map(r=>`<option value="${r}"${r===u.role?" selected":""}>${esc(ROLES[r]||r)}</option>`).join("")}</select></td>
<td data-l="Точка"><select class="ru-sel" data-sel="point"${d}>${po}</select></td>`}
  function rowHtml(u){
    const em=String(u.email||""),on=u.active!==false,c=can(u),e=esc(em);
    const act=(c.edit?`<button type="button" class="ru-btn" data-act="edit" data-email="${e}">Изменить</button>`:"")+
      (c.ops?`<button type="button" class="ru-btn" data-act="${on?"off":"on"}" data-email="${e}">${on?"Выключить":"Включить"}</button><button type="button" class="ru-btn" data-act="pw" data-email="${e}">Новый пароль</button><button type="button" class="ru-btn ru-del" data-act="del" data-email="${e}">Удалить</button>`:"");
    return`<tr data-row="${e}"><td data-l="Логин">${e}</td><td data-l="Имя">${esc(u.label||"—")}</td>${selHtml(u,c)}<td data-l="Телефон">${esc(u.phone||"—")}</td><td data-l="Должность">${esc(u.position||"—")}</td><td data-l="Включён">${on?"да":"нет"}</td><td data-l="Последний вход">${esc(dt(u.last_sign_in_at||u.last_sign_in||u.last_login))}</td><td class="ru-acts">${act}</td></tr>`}
  function render(){
    const body=$("ruBody");
    if(!rows.length){body.innerHTML=`<tr><td colspan="9" class="ru-mut">Пока никого нет</td></tr>`;return}
    // группы по точкам: «Все точки» первой, дальше в порядке настроек, потом прочие
    const ps=points(),keys=[...new Set(rows.map(u=>u.point||""))];
    const ord=k=>k===""?-1:(ps.indexOf(k)>=0?ps.indexOf(k):1000);
    keys.sort((a,b)=>ord(a)-ord(b)||a.localeCompare(b,"ru"));
    body.innerHTML=keys.map(k=>{const g=rows.filter(u=>(u.point||"")===k);
      return`<tr class="ru-grp"><td colspan="9">${esc(k||"Все точки")} <span class="ru-mut">· ${g.length}</span></td></tr>`+g.map(rowHtml).join("")}).join("")}
  // смена статуса или точки прямо в строке: сервер при смене статуса сбрасывает права на набор статуса
  async function onSel(ev){
    const sel=ev.target.closest("[data-sel]");if(!sel)return;
    const tr=sel.closest("tr[data-row]"),email=tr&&tr.dataset.row;if(!email)return;
    const rs=tr.querySelector('[data-sel="role"]'),ps=tr.querySelector('[data-sel="point"]');
    const role=rs.value;let point=ps.value;
    if(sel.dataset.sel==="role")point=role==="admin"?"":(point||points()[0]||"");
    if(role!=="admin"&&!point){msg("ruTblMsg","Выберите точку.",true);render();return}
    if(busy){render();return}
    busy=true;rs.disabled=ps.disabled=true;msg("ruTblMsg","Сохраняю…");
    const r=await call("update",{email,role,point:point||null});busy=false;
    if(r.error)msg("ruTblMsg",r.error,true);else msg("ruTblMsg","Сохранено");
    refresh()}
  function openEdit(email){
    const body=$("ruBody"),old=body.querySelector(".ru-edit");
    const same=old&&old.dataset.for===email;if(old)old.remove();if(same)return;
    const u=rows.find(x=>x.email===email),tr=[...body.querySelectorAll("tr[data-row]")].find(x=>x.dataset.row===email);if(!u||!tr)return;
    const c=can(u),e=document.createElement("tr");e.className="ru-edit";e.dataset.for=email;
    e.innerHTML=`<td colspan="9"><form class="ru-form" autocomplete="off"><h3>Изменить: ${esc(email)}</h3>${fieldsHtml({limited:c.limited})}
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
    msg("ruTblMsg",r.data&&r.data.warn?String(r.data.warn):act==="del"?"Удалено":act==="pw"?"Пароль изменён, он показан под формой":"Сохранено",!!(r.data&&r.data.warn));
    refresh()}
  async function refresh(){
    const body=$("ruBody");if(!body)return;loaded=true;
    const r=await list();
    if(r.error){rows=[];body.innerHTML=`<tr><td colspan="9" class="ru-mut">${esc(r.error)}</td></tr>`;return}
    rows=r.data;render()}
  // вызывается страницей при показе вкладки «Пользователи» (patch_role.py)
  window.__roleUsersRender=function(){
    if(!window.__roleFull||!window.__sbRole||!window.__roleFull())return;
    build();if(!built)return;
    const f=$("ruForm");if(f&&F(f,"role"))fillPt(f,F(f,"point").value);
    setSub(sub)};
})();
