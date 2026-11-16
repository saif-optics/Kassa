/* Касса · «Контроль»: окошко «Доступы продавцов» (rpc access_list через window.__sb) и журнал прихода сотрудников (smena/admin.html) во вкладке сайта.
   Вход общий с сайтом (один origin и один ключ хранилища). Тему передаём в iframe при открытии и при смене. */
(function(){
  "use strict";
  let frame=null;
  const theme=()=>document.documentElement.getAttribute("data-theme")||"";
  const send=()=>{if(frame&&frame.contentWindow)frame.contentWindow.postMessage({kassaTheme:theme()||null},location.origin)};
  const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const ROLE={owner:"Владелец",admin:"Владелец",seller:"Продавец",manager:"Управляющий"};
  const dt=v=>{if(!v)return "ещё не входил";const d=new Date(v);if(isNaN(d))return esc(v);
    return d.toLocaleString("ru-RU",{timeZone:"Asia/Tashkent",day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})};
  async function loadAcc(){
    const body=document.getElementById("attAccBody");if(!body)return;
    const btn=document.getElementById("attAccRef");if(btn)btn.disabled=true;
    body.innerHTML='<p class="note">Загрузка…</p>';
    let rows=null,err=null;
    try{const sb=window.__sb;if(!sb)throw new Error("нет входа");const r=await sb.rpc("access_list");err=r.error;rows=r.data}catch(e){err={message:e&&e.message||String(e)}}
    if(btn)btn.disabled=false;
    if(err){
      const m=String(err.message||""),c=String(err.code||"");
      const none=c==="42883"||c==="PGRST202"||c==="404"||err.status===404||/could not find|does not exist|not found/i.test(m);
      body.innerHTML=none?'<p class="note">Логины продавцов ещё не созданы</p>':'<p class="note">Не удалось загрузить: '+esc(m)+'</p>';return}
    if(!Array.isArray(rows)||!rows.length){body.innerHTML='<p class="note">Логины продавцов ещё не созданы</p>';return}
    body.innerHTML='<div class="tbl"><table><thead><tr><th>Кому выдан</th><th>Логин</th><th>Точка</th><th>Роль</th><th>Статус</th><th>Последний вход</th></tr></thead><tbody>'+
      rows.map(r=>'<tr><td>'+esc(r.label||"—")+'</td><td>'+esc(r.email)+'</td><td>'+esc(r.point||"—")+'</td><td>'+esc(ROLE[r.role]||r.role||"—")+
        '</td><td><span class="pill att-st '+(r.active?"ok":"off")+'">'+(r.active?"Активен":"Выключен")+'</span></td><td class="att-dt">'+dt(r.last_sign_in_at)+'</td></tr>').join("")+'</tbody></table></div>';
  }
  function render(){
    const box=document.getElementById("attBody");
    if(!box||frame)return;
    const acc=document.createElement("section");
    acc.className="panel att-acc";
    acc.innerHTML='<div class="att-ah"><h2>Доступы продавцов</h2><button type="button" class="sec" id="attAccRef">Обновить</button></div><div id="attAccBody"></div><p class="note att-hint">Логины создаёт владелец; пароль продавцу передаётся лично. Отключить вход — в разделе доступа.</p>';
    box.appendChild(acc);
    acc.querySelector("#attAccRef").addEventListener("click",loadAcc);
    loadAcc();
    frame=document.createElement("iframe");
    frame.id="attFrame";
    frame.title="Приход сотрудников";
    frame.setAttribute("allow","camera");
    frame.setAttribute("loading","lazy");
    frame.src="smena/admin.html?embed=1&theme="+encodeURIComponent(theme());
    frame.addEventListener("load",send);
    box.appendChild(frame);
  }
  // высота iframe — по содержимому (admin.html сообщает attHeight)
  addEventListener("message",e=>{
    if(!frame||e.origin!==location.origin||e.source!==frame.contentWindow)return;
    if(e.data&&e.data.attScroll){window.scrollTo({top:frame.getBoundingClientRect().top+window.scrollY-120,behavior:"smooth"});return}
    const h=e.data&&typeof e.data==="object"?+e.data.attHeight:0;
    if(h>0)frame.style.height=Math.max(420,h+8)+"px";
  });
  new MutationObserver(send).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
  window.__ATT={render};
})();
