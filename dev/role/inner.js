  // ===================== роли: продавец, кассир и маркетолог (patch_role.py) =====================
  // Вставлено внутрь скрипта страницы, чтобы видеть F, settings, setTab, METRICS и др.
  const roleName=()=>window.__sbRole||"admin";
  // показатели аналитики, которым нужны деньги владельца: прогноз и план, касса и расходы, прибыль и маржа
  const ROLE_DENY=new Set([4,5,20,21,23,24,25,26,27,36,37,38,39,59]);
  let roleTpl=null,roleDone=false;
  // настройки страницы (точки) для раздела «Пользователи» (role/users.js)
  window.__roleSettings=()=>settings;
  // текст ошибки сервера (RPC кассира) вместо общего «Не удалось сохранить»
  window.__roleErr=(e,def)=>(roleName()!=="admin"&&e&&e.code==="server"&&e.message)?e.message:def;
  // сегодня и вчера по Ташкенту (UTC+5), а не по часам устройства
  const roleDay=k=>new Date(Date.now()+5*3600e3-k*864e5).toISOString().slice(0,10);
  function roleRenderTpl(){
    const box=$("dxTpl");if(!box)return;
    const arr=roleTpl&&Array.isArray(roleTpl[window.__sbPoint])?roleTpl[window.__sbPoint]:[];
    box.hidden=!arr.length;
    box.innerHTML=arr.map(n=>`<button type="button" data-tpl="${esc(n)}">${esc(n)}</button>`).join("");
  }
  window.__roleTpl=d=>{roleTpl=d;roleRenderTpl()};
  // вызывается из fillSelects: зафиксировать точку продавца
  window.__roleFill=function(){
    if(!["seller","cashier"].includes(roleName())||!window.__sbPoint)return;
    const pt=window.__sbPoint;F.point=pt;
    $("fPoint").innerHTML=`<option selected>${esc(pt)}</option>`;$("fPoint").value=pt;
    $("dxPoint").innerHTML=`<option selected>${esc(pt)}</option>`;$("dxPoint").value=pt;$("dxPoint").disabled=true;
    if(roleName()==="cashier"){
      // кассир вносит продажи только на своей точке: в сегменте одна кнопка
      curPoint=pt;
      $("sPointSeg").innerHTML=`<button type="button" role="radio" aria-checked="true" data-pt="${esc(pt)}"><span class="sw" style="background:${pointColor(pt)}"></span>${esc(pt)}</button>`;
    }
  };
  window.__roleApply=function(){
    const r=roleName();if(r==="admin"||roleDone)return;roleDone=true;
    if(window.__roleDom)window.__roleDom();
    const hide=el=>{if(el)el.style.display="none"};
    if(r==="seller"||r==="cashier"){
      // даты расхода и продажи — только вчера и сегодня (Ташкент)
      ["dxDate","sDate"].forEach(id=>{const e=$(id);if(!e)return;e.min=roleDay(1);e.max=roleDay(0);if(!e.value||e.value>e.max||e.value<e.min)e.value=e.max});
      hide($("fPoint").closest("label"));
      const lab=$("dxName").closest("label");
      if(lab&&!$("dxTpl")){const d=document.createElement("div");d.id="dxTpl";d.className="dx-tpl";d.hidden=true;lab.before(d);
        d.addEventListener("click",e=>{const b=e.target.closest("[data-tpl]");if(!b)return;$("dxName").value=b.dataset.tpl;$("dxAmount").focus()})}
      roleRenderTpl();
    }else{
      // маркетолог: ни расходов, ни кассы, ни долгов, ни денег владельца
      window.__roleNoCash=true;
      hide($("dxForm").closest(".panel"));hide($("dayCashWrap").closest(".panel"));hide($("debtsSum").closest(".panel"));
      // из аналитики убираем закрытые показатели и из списка выбора тоже
      METRICS.forEach(g=>{g[1]=g[1].filter(x=>!ROLE_DENY.has(x[0]))});
      for(let i=METRICS.length-1;i>=0;i--)if(!METRICS[i][1].length)METRICS.splice(i,1);
      ALL_IDS.length=0;METRICS.forEach(g=>g[1].forEach(x=>ALL_IDS.push(x[0])));
    }
    fillSelects();
    const h=(location.hash||"").replace("#","");
    setTab(PAGES.includes(h)?h:"sales");
  };
