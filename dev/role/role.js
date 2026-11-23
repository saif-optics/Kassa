/* Касса · роли (patch_role.py): кассир, продавец и гость видят и делают только то, что разрешают их права.
   Статус и права приходят из shim.html (window.__sbRole / __sbPoint / __sbPerms, RPC my_access); нет роли — владелец, ничего не меняется.
   owner и admin — полный доступ. Здесь — то, что не требует доступа к переменным страницы; остальное вставлено внутрь скрипта страницы (role/inner.js). */
(function(){
  "use strict";
  // права, которые открывают вкладки (att — журнал прихода)
  const TABP={sales:"sales_view",analytics:"analytics",att:"att_view",tasks:"tasks"};
  const ORDER=["sales","analytics","att","tasks"];
  const PERMS=["sales_view","sales_write","sales_edit","exp_view","exp_add","exp_edit","cash_view","debts_view","att_view","analytics","export","tasks"];
  const role=()=>window.__sbRole||"admin";
  const full=()=>role()==="admin"||role()==="owner";
  window.__roleFull=full;
  // есть ли право (владелец и админ — все)
  window.__rolePerm=k=>full()||!!(window.__sbPerms&&window.__sbPerms[k]);
  // можно ли открыть вкладку: по правам, а не по статусу
  window.__roleOK=t=>full()||(!!TABP[t]&&window.__rolePerm(TABP[t]));
  // первая разрешённая вкладка (для обхода запретной); нет ни одной — "sales" (страницу закрывает сообщение)
  window.__roleFirst=()=>ORDER.find(window.__roleOK)||"sales";
  // после входа (вызывает страница): убрать запрещённые вкладки, пометить html статусом и отсутствующими правами
  window.__roleDom=function(){
    const r=role();if(full())return;
    document.documentElement.setAttribute("data-role",r);
    document.documentElement.setAttribute("data-np",PERMS.filter(k=>!window.__rolePerm(k)).join(" "));
    document.querySelectorAll(".tabs .tab[data-tab]").forEach(b=>{if(!window.__roleOK(b.dataset.tab))b.remove()});
    if(!ORDER.some(window.__roleOK)){
      // ни одного раздела: вместо страниц — сообщение
      document.documentElement.setAttribute("data-role-none","");
      if(!document.getElementById("roleNone")){
        const d=document.createElement("div");d.id="roleNone";d.className="panel";d.setAttribute("role","status");
        d.textContent="Нет доступных разделов, обратитесь к владельцу";
        const w=document.querySelector(".wrap");(w||document.body).appendChild(d)}
    }
    // для не-админа «Пользователи» — просто «Приход»; ищем по data-tab, не по тексту
    const b=document.querySelector('.tabs .tab[data-tab="att"]');
    if(b){const w=document.createTreeWalker(b,NodeFilter.SHOW_TEXT);let n,done=false;while((n=w.nextNode())){if(n.textContent.trim()){n.textContent=done?"":"Приход";done=true}}}
    const h=document.querySelector("#page-att h1");if(h)h.textContent="Приход";
    const p=document.querySelector("#page-att header p");if(p)p.textContent="Кто пришёл и во сколько"+(window.__sbPoint?" на вашей точке":"");
    const e=document.querySelector("#page-att .eyebrow");if(e)e.textContent="Saif-Optics · приход";
  };
  // переход со всех «в обход» вкладки не пускаем — страховка на случай прямой ссылки
  document.addEventListener("click",e=>{
    const b=e.target.closest&&e.target.closest("[data-go]");if(!b||window.__roleOK(b.dataset.go))return;
    e.stopImmediatePropagation();e.preventDefault();
    const t=document.querySelector('.tabs .tab[data-tab="'+window.__roleFirst()+'"]');if(t)t.click();
  },true);
})();
