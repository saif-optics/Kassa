/* Касса · «Приход»: админка прихода сотрудников (smena/admin.html) во вкладке сайта.
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
  new MutationObserver(send).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
  window.__ATT={render};
})();
