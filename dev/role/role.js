/* Касса · роли (patch_role.py): продавец (seller), кассир (cashier) и маркетолог (marketer) видят только разрешённое.
   Роль приходит из shim.html (window.__sbRole / __sbPoint, RPC my_access); нет роли — владелец, ничего не меняется.
   Здесь — то, что не требует доступа к переменным страницы; остальное вставлено внутрь скрипта страницы (role/inner.js). */
(function(){
  "use strict";
  const TABS={seller:["sales","att"],cashier:["sales","att"],marketer:["sales","analytics"]};
  const role=()=>window.__sbRole||"admin";
  // можно ли открыть вкладку; неизвестная роль — только «Продажи»
  window.__roleOK=t=>{const r=role();return r==="admin"||(TABS[r]||["sales"]).includes(t)};
  // после входа (вызывает страница): убрать запрещённые вкладки из DOM, пометить html ролью
  window.__roleDom=function(){
    const r=role();if(r==="admin")return;
    document.documentElement.setAttribute("data-role",r);
    document.querySelectorAll(".tabs .tab[data-tab]").forEach(b=>{if(!window.__roleOK(b.dataset.tab))b.remove()});
    if(r==="seller"||r==="cashier"){
      // для продавца и кассира «Контроль» — просто «Приход»; ищем по data-tab, не по тексту
      const b=document.querySelector('.tabs .tab[data-tab="att"]');
      if(b){const w=document.createTreeWalker(b,NodeFilter.SHOW_TEXT);let n,done=false;while((n=w.nextNode())){if(n.textContent.trim()){n.textContent=done?"":"Приход";done=true}}}
      const h=document.querySelector("#page-att h1");if(h)h.textContent="Приход";
      const p=document.querySelector("#page-att header p");if(p)p.textContent="Кто пришёл и во сколько на вашей точке";
      const e=document.querySelector("#page-att .eyebrow");if(e)e.textContent="Saif-Optics · приход";
    }
  };
  // переход со всех «в обход» вкладки не пускаем — страховка на случай прямой ссылки
  document.addEventListener("click",e=>{
    const b=e.target.closest&&e.target.closest("[data-go]");if(!b||window.__roleOK(b.dataset.go))return;
    e.stopImmediatePropagation();e.preventDefault();
    const t=document.querySelector('.tabs .tab[data-tab="sales"]');if(t)t.click();
  },true);
})();
