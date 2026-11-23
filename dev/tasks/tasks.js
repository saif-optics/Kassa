/* Касса · «Задания»: задания и проблемы по точкам.
   Админ (owner/admin) работает с таблицами tasks / task_comments напрямую (RLS по is_admin()),
   ограниченная роль — через RPC tasks_my_list / tasks_comment / tasks_problem. */
(function(){
  "use strict";
  const PTS=["Премиум","Яшнабад","Сергели","C1"];
  const PRI={high:"Срочно",normal:"Обычное",low:"Не горит"};
  const ST={new:"Новая",work:"В работе",done:"Сделано"};
  const S={tasks:[],comments:[],open:new Set(),f:{point:"",status:"open",pri:"",q:""},form:null,nf:{},pf:{},showDone:false,req:0,drafts:{},err:"",busy:false,loaded:false,loading:false};
  let bound=false;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const isAdm=()=>["owner","admin"].includes(window.__sbRole)||!!window.__sbOwner;
  const TZ="Asia/Tashkent";
  const today=()=>new Date().toLocaleDateString("sv-SE",{timeZone:TZ});
  const fmtD=d=>d?String(d).slice(8,10)+"."+String(d).slice(5,7)+"."+String(d).slice(0,4):"";
  const fmtT=t=>{if(!t)return"";const d=new Date(t);return isNaN(d)?"":d.toLocaleString("ru-RU",{timeZone:TZ,day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})};
  const overdue=t=>t.status!=="done"&&t.due&&String(t.due).slice(0,10)<today();
  const sb=()=>window.__sb;
  // Частые ошибки базы — по-русски, остальное как есть
  const errMsg=e=>{
    const m=(e&&e.message)||"",c=e&&e.code;
    if(c==="42501"||/row-level security|permission denied/i.test(m))return /[А-Яа-я]/.test(m)&&c==="42501"?m:"Нет прав на это действие";
    if(c==="23514"||/violates check constraint/i.test(m))return "Слишком длинный текст или неверное значение";
    if(c==="23502")return "Заполните обязательное поле";
    return m||"Не получилось, попробуйте ещё раз";
  };

  async function load(){
    if(!sb()){S.err="Нет связи с базой";draw();return}
    const my=++S.req;
    S.loading=true;S.err="";draw();
    let tk=null,cm=null,er="";
    try{
      if(isAdm()){
        const a=await sb().from("tasks").select("*").order("created_at",{ascending:false});
        if(a.error)throw a.error;
        const b=await sb().from("task_comments").select("*").order("created_at",{ascending:true});
        if(b.error)throw b.error;
        tk=a.data||[];cm=b.data||[];
      }else{
        const r=await sb().rpc("tasks_my_list");
        if(r.error)throw r.error;
        const d=r.data||{};tk=d.tasks||[];cm=d.comments||[];
      }
    }catch(e){er=errMsg(e)}
    if(my!==S.req)return; // устаревший ответ
    if(tk){S.tasks=tk;S.comments=cm;S.loaded=true}
    S.err=er;S.loading=false;draw();
  }

  function filtered(){
    const f=S.f,q=f.q.trim().toLowerCase();
    return S.tasks.filter(t=>{
      if(f.point&&t.point!==f.point)return false;
      if(!isAdm()&&!S.showDone&&t.status==="done")return false;
      if(f.status==="open"&&t.status==="done")return false;
      if(f.status&&f.status!=="open"&&t.status!==f.status)return false;
      if(f.pri&&t.priority!==f.pri)return false;
      if(q&&!((t.title||"")+" "+(t.body||"")+" "+(t.assignee||"")).toLowerCase().includes(q))return false;
      return true;
    });
  }

  function kpis(){
    return '<div class="kpis">'+PTS.map(p=>{
      const a=S.tasks.filter(t=>t.point===p);
      const open=a.filter(t=>t.status!=="done").length,over=a.filter(overdue).length,sel=a.filter(t=>t.source==="seller"&&t.status!=="done").length;
      return '<div class="kpi"><span class="k">'+esc(p)+'</span><span class="v">Открыто: '+open+'</span>'
        +'<span class="d"'+(over?' style="color:var(--minus)"':'')+'>Просрочено: '+over+'</span>'
        +'<span class="d">От продавцов: '+sel+'</span></div>';
    }).join("")+'</div>';
  }

  function opts(map,sel,all){
    return (all?'<option value="">'+esc(all)+'</option>':'')+Object.keys(map).map(k=>'<option value="'+esc(k)+'"'+(k===sel?' selected':'')+'>'+esc(map[k])+'</option>').join("");
  }
  function filters(){
    const pm={};PTS.forEach(p=>pm[p]=p);
    return '<div class="panel tk-filters">'
      +'<select data-f="point" aria-label="Точка">'+opts(pm,S.f.point,"Все точки")+'</select>'
      +'<select data-f="status" aria-label="Статус"><option value="open"'+(S.f.status==="open"?' selected':'')+'>Открытые</option><option value=""'+(S.f.status===""?' selected':'')+'>Все</option>'+opts(ST,S.f.status)+'</select>'
      +'<select data-f="pri" aria-label="Срочность">'+opts(PRI,S.f.pri,"Любая срочность")+'</select>'
      +'<input type="search" data-f="q" placeholder="Поиск по тексту" value="'+esc(S.f.q)+'" aria-label="Поиск">'
      +'</div>';
  }

  function formAdmin(){
    const v=S.nf,pm={};PTS.forEach(p=>pm[p]=p);
    return '<form class="panel tk-form" data-form="new">'
      +'<label>Точка<select name="point" required>'+opts(pm,v.point||S.f.point||PTS[0])+'</select></label>'
      +'<label>Срочность<select name="priority">'+opts(PRI,v.priority||"normal")+'</select></label>'
      +'<label class="wide">Заголовок<input name="title" maxlength="200" required value="'+esc(v.title)+'"></label>'
      +'<label class="wide">Описание<textarea name="body" maxlength="4000">'+esc(v.body)+'</textarea></label>'
      +'<label>Срок<input type="date" name="due" value="'+esc(v.due)+'"></label>'
      +'<label>Ответственный<input name="assignee" maxlength="80" value="'+esc(v.assignee)+'"></label>'
      +'<div class="tk-actions wide" style="grid-column:1/-1"><button type="submit" class="primary"'+(S.busy?' disabled':'')+'>Создать</button><button type="button" data-act="cancel">Отмена</button></div>'
      +'</form>';
  }
  function formProblem(){
    const v=S.pf;
    return '<form class="panel tk-form" data-form="problem">'
      +'<label class="wide">Заголовок<input name="title" maxlength="200" required value="'+esc(v.title)+'"></label>'
      +'<label class="wide">Что случилось или что предлагаете<textarea name="body" maxlength="4000">'+esc(v.body)+'</textarea></label>'
      +'<div class="tk-actions wide" style="grid-column:1/-1"><button type="submit" class="primary"'+(S.busy?' disabled':'')+'>Отправить</button><button type="button" data-act="cancel">Отмена</button></div>'
      +'</form>';
  }

  function card(t){
    const open=S.open.has(t.id),adm=isAdm();
    const od=overdue(t);
    let h='<div class="panel tk-card" data-id="'+esc(t.id)+'">'
      +'<div class="tk-head" data-act="toggle" role="button" tabindex="0" aria-expanded="'+open+'">'
      +'<div class="tk-title">'+esc(t.title)+'</div><div class="tk-chips">'
      +'<span class="chip none">'+esc(t.point)+'</span>'
      +'<span class="chip '+(t.priority==="high"?'bad':t.priority==="low"?'none':'over')+'">'+esc(PRI[t.priority]||t.priority)+'</span>'
      +'<span class="chip '+(t.status==="done"?'ok':t.status==="work"?'over':'none')+'">'+esc(ST[t.status]||t.status)+'</span>'
      +(t.due?'<span class="chip '+(od?'bad':'none')+'">'+(od?'Просрочено · ':'Срок ')+esc(fmtD(t.due))+'</span>':'')
      +(t.source==="seller"?'<span class="chip over">От продавца</span>':'')
      +'</div>'
      +(t.assignee?'<div class="tk-meta">Ответственный: '+esc(t.assignee)+'</div>':'')
      +'</div>';
    if(adm){
      h+='<div class="tk-actions">'+Object.keys(ST).map(k=>'<button type="button" data-act="status" data-v="'+k+'" aria-pressed="'+(t.status===k)+'"'+(t.status===k?' disabled':'')+'>'+ST[k]+'</button>').join("")
        +'<button type="button" data-act="del" style="margin-left:auto;color:var(--minus)">Удалить</button></div>';
    }
    if(open){
      const cs=S.comments.filter(c=>c.task_id===t.id);
      h+=(t.body?'<div class="tk-body">'+esc(t.body)+'</div>':'<div class="tk-meta">Без описания</div>')
        +'<div class="tk-meta">Создано '+esc(fmtT(t.created_at))+((t.created_label||t.created_by)?' · '+esc(t.created_label||t.created_by):'')+'</div>'
        +'<div class="tk-feed">'+(cs.length?cs.map(c=>'<div class="tk-c'+(c.kind==="problem"?' problem':'')+'"><small>'+esc(c.author_label||(isAdm()?c.author_email:"")||"")+' · '+esc(fmtT(c.created_at))+(c.kind==="problem"?' · проблема':'')+'</small>'+esc(c.body)+'</div>').join(""):'<div class="tk-meta">Комментариев пока нет</div>')+'</div>'
        +'<form class="tk-form" data-form="comment"><label class="wide">Комментарий<textarea name="body" maxlength="2000">'+esc(S.drafts[t.id]||"")+'</textarea></label>'
        +'<div class="tk-actions wide" style="grid-column:1/-1"><button type="submit"'+(S.busy?' disabled':'')+'>Отправить</button></div></form>';
    }
    return h+'</div>';
  }

  function listHtml(){
    const a=filtered();
    if(S.loading&&!S.loaded)return '<div class="tk-empty">Загрузка…</div>';
    if(!a.length)return '<div class="tk-empty">'+(S.tasks.length?'По фильтрам ничего не найдено.':isAdm()?'Заданий пока нет. Нажмите «Новое задание».':'Для вашей точки заданий нет. Если что-то не так — нажмите «Сообщить о проблеме».')+'</div>';
    return '<div class="tk-list">'+a.map(card).join("")+'</div>';
  }

  function draw(){
    const box=$("tasksBody");if(!box)return;
    const adm=isAdm();
    box.innerHTML=(adm?kpis()+filters():'')
      +'<div class="tk-actions">'+(adm?'<button type="button" class="primary" data-act="new">Новое задание</button>':'<button type="button" class="primary" data-act="problem">Сообщить о проблеме / предложение</button>')
      +(adm?'':'<button type="button" data-act="done" aria-pressed="'+S.showDone+'">'+(S.showDone?'Скрыть сделанные':'Показать сделанные')+'</button>')
      +'<button type="button" data-act="reload">Обновить</button></div>'
      +(S.err?'<div class="tk-err" role="alert">'+esc(S.err)+'</div>':'')
      +(S.form==="new"&&adm?formAdmin():'')+(S.form==="problem"&&!adm?formProblem():'')
      +'<div id="tkList">'+listHtml()+'</div>';
  }
  const drawList=()=>{const l=$("tkList");if(l)l.innerHTML=listHtml()};

  async function run(fn){
    if(S.busy)return;
    S.busy=true;S.err="";
    try{await fn()}catch(e){S.err=errMsg(e)}
    S.busy=false;
    if(!S.err)await load();else draw();
  }

  function onClick(e){
    const el=e.target.closest("[data-act]");if(!el)return;
    const act=el.dataset.act,cardEl=el.closest("[data-id]"),id=cardEl&&cardEl.dataset.id;
    if(act==="new"){S.form=S.form==="new"?null:"new";draw()}
    else if(act==="problem"){S.form=S.form==="problem"?null:"problem";draw()}
    else if(act==="cancel"){S.form=null;S.err="";S.nf={};S.pf={};draw()}
    else if(act==="reload")load();
    else if(act==="done"){S.showDone=!S.showDone;draw()}
    else if(act==="toggle"&&id){S.open.has(id)?S.open.delete(id):S.open.add(id);drawList()}
    else if(act==="status"&&id&&isAdm())run(async()=>{const r=await sb().from("tasks").update({status:el.dataset.v}).eq("id",id);if(r.error)throw r.error});
    else if(act==="del"&&id&&isAdm()){
      if(!confirm("Удалить задание вместе с комментариями?"))return;
      run(async()=>{const r=await sb().from("tasks").delete().eq("id",id);if(r.error)throw r.error;S.open.delete(id)});
    }
  }
  function onKey(e){
    if((e.key==="Enter"||e.key===" ")&&e.target.matches&&e.target.matches(".tk-head")){e.preventDefault();e.target.click()}
  }
  function onSubmit(e){
    const f=e.target.closest("form[data-form]");if(!f)return;
    e.preventDefault();
    const v=n=>((f.elements[n]&&f.elements[n].value)||"").trim();
    const kind=f.dataset.form;
    if(kind==="new"&&isAdm()){
      if(!v("title"))return;
      run(async()=>{
        const r=await sb().from("tasks").insert({point:v("point"),title:v("title"),body:v("body"),priority:v("priority")||"normal",due:v("due")||null,assignee:v("assignee")||null,source:"owner",created_by:window.__sbEmail||null});
        if(r.error)throw r.error;S.form=null;S.nf={};
      });
    }else if(kind==="problem"&&!isAdm()){
      if(!v("title")){S.err="Напишите заголовок";draw();return}
      run(async()=>{const r=await sb().rpc("tasks_problem",{p_title:v("title"),p_body:v("body")});if(r.error)throw r.error;S.form=null;S.pf={}});
    }else if(kind==="comment"){
      const id=f.closest("[data-id]").dataset.id;
      if(!v("body"))return;
      run(async()=>{
        if(isAdm()){
          const r=await sb().from("task_comments").insert({task_id:id,author_email:window.__sbEmail||null,author_label:"Владелец",kind:"comment",body:v("body")});
          if(r.error)throw r.error;
        }else{
          const r=await sb().rpc("tasks_comment",{p_task:id,p_body:v("body")});
          if(r.error)throw r.error;
        }
        delete S.drafts[id];
      });
    }
  }
  function onInput(e){
    const t=e.target;
    if(t.dataset&&t.dataset.f){S.f[t.dataset.f]=t.value;if(t.dataset.f==="q")drawList();else draw();return}
    const fm=t.closest&&t.closest("form[data-form]");
    if(fm&&t.name&&fm.dataset.form==="new"){S.nf[t.name]=t.value;return}
    if(fm&&t.name&&fm.dataset.form==="problem"){S.pf[t.name]=t.value;return}
    if(t.tagName==="TEXTAREA"&&t.closest("form[data-form=comment]")){const c=t.closest("[data-id]");if(c)S.drafts[c.dataset.id]=t.value}
  }

  function render(){
    const box=$("tasksBody");if(!box)return;
    if(!bound){
      bound=true;
      box.addEventListener("click",onClick);
      box.addEventListener("keydown",onKey);
      box.addEventListener("submit",onSubmit);
      box.addEventListener("input",onInput);
    }
    load();
  }
  window.__TASKS={render};
})();
