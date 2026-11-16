/* Касса · «Контроль»: журнал прихода сотрудников (smena/admin.html) во вкладке сайта.
   Блок «Пользователи» (логины, роли, статусы) над журналом вставляет patch_role в контейнер #attUsers.
   Вход общий с сайтом (один origin и один ключ хранилища). Тему передаём в iframe при открытии и при смене. */
(function(){
  "use strict";
  let frame=null;
  const theme=()=>document.documentElement.getAttribute("data-theme")||"";
  const send=()=>{if(frame&&frame.contentWindow)frame.contentWindow.postMessage({kassaTheme:theme()||null},location.origin)};
  function render(){
    const box=document.getElementById("attBody");
    if(!box||frame)return;
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
