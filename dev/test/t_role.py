"""Самопроверка ролей и прав на фейковом Supabase: ROLE=seller|cashier|marketer|guestpt|sellernoatt|sellernoview|empty|owner|admin python t_role.py.
seller/cashier/marketer — права по умолчанию статуса; guestpt — гость с точкой (продажи + аналитика); sellernoatt — продавец без журнала прихода; sellernoview — добавляет расход, но не видит расходы (панель списка скрыта); empty — пустые права (сообщение «Нет доступных разделов»);
owner/admin — вкладка «Пользователи» с тремя подразделами (фейс-контроль, сессии, таблица: группы по точкам, select-ы статуса и точки, форма изменения, права); ownerempty — владелец при пустых данных (нет сотрудников и сессий, без ошибок).
Вывод {} = чисто, иначе — словарь отклонений; DEBUG=1 дополнительно печатает весь отчёт."""
import os,json
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.abspath(__file__))
SC=os.environ.get("ROLE","seller");POINT=os.environ.get("POINT","Премиум")
KEYS=["sales_view","sales_write","sales_edit","exp_view","exp_add","exp_edit","cash_view","debts_view","att_view","analytics","export","tasks"]
DEF={"cashier":[k for k in KEYS if k not in("analytics","export")],"seller":["sales_view","exp_view","exp_add","att_view","tasks"],
     "marketer":["sales_view","analytics"]}
# сценарий -> (статус, есть ли точка, права)
SCEN={"seller":("seller",True,DEF["seller"]),"cashier":("cashier",True,DEF["cashier"]),"marketer":("marketer",False,DEF["marketer"]),
      "guestpt":("marketer",True,DEF["marketer"]),"sellernoatt":("seller",True,[k for k in DEF["seller"] if k!="att_view"]),
      "sellernoview":("seller",True,["sales_view","exp_add","att_view"]),"empty":("marketer",False,[]),
      "owner":("owner",False,KEYS),"admin":("admin",False,KEYS),"ownerempty":("owner",False,KEYS)}
EMPTY=SC=="ownerempty";ROLE,HASPT,PL=SCEN[SC];PERM={k:(k in PL) for k in KEYS};FULL=ROLE in("owner","admin")
EXT='''
(function(){const cc=window.supabase.createClient;window.supabase.createClient=function(){const c=cc.apply(this,arguments);
 const role=%r,pt=%r,perms=%s,own=role!=="owner"&&role!=="admin",P0="Премиум";window.__calls=[];
 const ulist=[
  {email:"o@x.uz",role:role,point:null,label:"Я",phone:"",position:"",note:"",perms:perms,perms_own:{},active:true,last_sign_in_at:null},
  {email:"own@x.uz",role:"owner",point:null,label:"Владелец",phone:"1",position:"",note:"",perms:perms,perms_own:{},active:true,last_sign_in_at:null},
  {email:"adm@x.uz",role:"admin",point:null,label:"",phone:"",position:"",note:"",perms:perms,perms_own:{},active:true,last_sign_in_at:null},
  {email:"c1@x.uz",role:"cashier",point:P0,label:"Касса",phone:"2",position:"Кассир",note:"",perms:{sales_view:true,sales_write:true},perms_own:{},active:true,last_sign_in_at:null},
  {email:"s1@x.uz",role:"seller",point:P0,label:"",phone:"",position:"",note:"",perms:{sales_view:true},perms_own:{},active:false,last_sign_in_at:null},
  {email:"m1@x.uz",role:"marketer",point:P0,label:"",phone:"",position:"",note:"",perms:{sales_view:true,analytics:true},perms_own:{},active:true,last_sign_in_at:null}];
 c.rpc=async(name,args)=>{const T=window.__T;
  if(name==="my_access")return {data:[{role:role==="owner"?"admin":role,point:pt||null,perms:perms,label:role,is_owner:role==="owner"}],error:null};
  if(name==="role_docs_all"){const out=[];T.docs.forEach(r=>{const d=JSON.parse(JSON.stringify(r.data));
    if(r.col==="sales"){if(!perms.sales_view)return;if(pt&&d.point!==pt)return;delete d.cost;delete d.costEst;delete d.costSrc;delete d.photo;out.push({col:r.col,id:r.id,data:d})}
    else if(r.col==="settings"&&r.id==="sales"){delete d.plan;out.push({col:r.col,id:r.id,data:d})}
    else if(r.col==="entries"&&perms.exp_view&&(!pt||d.branch===pt)&&(d.type==="exp"||d.kind==="bc"))out.push({col:r.col,id:r.id,data:d})});
    if(perms.exp_add&&pt)out.push({col:"settings",id:"sellerTpl",data:{[pt]:["Такси","Вода"]}});
    return {data:out,error:null}}
  if(name==="seller_add_expense"){window.__calls.push("seller_add_expense");if(!args.p_amount)return {data:null,error:{message:"Сумма должна быть больше нуля"}};
    T.docs.push({col:"entries",id:"e_t1",data:{type:"exp",name:pt+" за "+args.p_name,amount:args.p_amount,cat:"op",branch:pt,date:args.p_date,source:"day",createdAt:Date.now()}});return {data:"e_t1",error:null}}
  if(name==="cashier_put_sale"){const d=args.p_data||{};if(d.point!==pt)return {data:null,error:{message:"Можно вносить только на своей точке"}};
    const i=T.docs.findIndex(r=>r.col==="sales"&&r.id===args.p_id);if(i>=0)T.docs[i].data=d;else T.docs.push({col:"sales",id:args.p_id,data:d});return {data:args.p_id,error:null}}
  if(name==="cashier_del_sale"){T.docs=T.docs.filter(r=>!(r.col==="sales"&&r.id===args.p_id));return {data:null,error:null}}
  if(name==="cashier_put_entry"){window.__calls.push("cashier_put_entry");T.docs.push({col:"entries",id:args.p_id,data:args.p_data});return {data:args.p_id,error:null}}
  if(name==="cashier_del_entry"){T.docs=T.docs.filter(r=>!(r.col==="entries"&&r.id===args.p_id));return {data:null,error:null}}
  if(name==="att_my_load")return {data:{point:pt,start_time:"10:00",employees:[],events:[]},error:null};
  if(name==="access_list")return {data:own?[]:ulist,error:null};
  return {data:null,error:{message:"нет "+name}}};
 c.functions={invoke:async(n,o)=>{window.__calls.push(o&&o.body);return {data:{ok:true},error:null}}};
 // подразделы «Пользователей»: приход (att_* через from), сессии (admin_sessions, admin_end_session)
 const emp=%s,day=new Date(Date.now()+5*3600000).toISOString().slice(0,10),T=h=>day+"T"+h+"+05:00";
 const ATT={att_points:[{point:"Премиум",start_time:"10:00:00"}],
  att_employees:[{id:"e1",name:"Аня",point:"Премиум",active:true},{id:"e2",name:"Бек",point:"Премиум",active:true},{id:"e3",name:"Гуля",point:"Премиум",active:true},{id:"e4",name:"Дина",point:"Премиум",active:true},{id:"e5",name:"Ева",point:"Яшнабад",active:true}],
  att_events:[{employee_id:"e1",point:"Премиум",kind:"in",ts:T("09:30:00")},{employee_id:"e1",point:"Премиум",kind:"out",ts:T("18:00:00")},{employee_id:"e2",point:"Премиум",kind:"in",ts:T("09:55:00")},{employee_id:"e3",point:"Премиум",kind:"in",ts:T("10:20:00")}]};
 const of=c.from;c.from=function(t){if(!/^att_/.test(t))return of.apply(this,arguments);
  const rows=emp?[]:(ATT[t]||[]),q={select(){return q},eq(){return q},gte(){return q},order(){return q},then(a,b){return Promise.resolve({data:rows,error:null}).then(a,b)}};return q};
 const UA=["Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36 Edg/120.0","Weird/1.0 <b>x</b>"];
 const SESS=[{id:"s1",email:"o@x.uz",role:role,point:null,label:"Я",created_at:T("08:00:00"),last_at:T("09:00:00"),user_agent:UA[1],ip:"10.0.0.1",is_current:true},
  {id:"s2",email:"o@x.uz",role:role,point:null,label:"Я",created_at:T("07:00:00"),last_at:T("08:30:00"),user_agent:UA[0],ip:"10.0.0.2",is_current:false},
  {id:"s3",email:"c1@x.uz",role:"cashier",point:"Премиум",label:"Касса",created_at:T("06:00:00"),last_at:T("08:00:00"),user_agent:UA[2],ip:"10.0.0.3",is_current:false},
  {id:"s4",email:"c1@x.uz",role:"cashier",point:"Премиум",label:"Касса",created_at:T("05:00:00"),last_at:T("07:00:00"),user_agent:UA[3],ip:"10.0.0.4",is_current:false}];
 const orpc=c.rpc;c.rpc=async(name,args)=>{
  if(name==="admin_sessions")return {data:emp?[]:SESS,error:null};
  if(name==="admin_end_session"){window.__calls.push({rpc:name,args:args});return {data:null,error:null}}
  return orpc(name,args)};
 return c}})();
'''%(ROLE,POINT if HASPT else "",json.dumps(PERM),"true" if EMPTY else "false")
rep={};errs=[]
with sync_playwright() as pw:
    b=pw.chromium.launch();ctx=b.new_context(viewport={'width':1440,'height':950});p=ctx.new_page()
    p.on('pageerror',lambda e:errs.append(str(e)[:200]));p.on('console',lambda m:m.type=='error' and 'ERR_FAILED' not in m.text and errs.append(m.text[:200]))
    p.route("https://fonts.googleapis.com/**",lambda r:r.abort())
    p.route("**/supabase.js",lambda r:r.fulfill(body=open(D+"/fakesb_synth.js",encoding="utf-8").read()+EXT,content_type="application/javascript"))
    p.route("**/xlsx.full.min.js",lambda r:r.fulfill(path=D+"/xlsx.full.min.js"))
    idx="file://"+os.path.abspath(D+"/../../index.html")
    p.goto(idx+"#analytics" if not PERM["analytics"] else idx);p.wait_for_timeout(800)
    p.fill('#sbEmail','o@x.uz');p.fill('#sbPass','pass12345');p.click('#sbGo');p.wait_for_timeout(2500)
    rep["tabs"]=p.evaluate('[...document.querySelectorAll(".tabs .tab[data-tab]")].map(b=>b.dataset.tab)')
    rep["visible"]=p.evaluate('[...document.querySelectorAll(".page:not([hidden])")].map(x=>x.id)')
    vis=lambda s:p.evaluate('s=>{const e=document.querySelector(s);return !!e&&e.getBoundingClientRect().width>0}',s)
    bad={}
    if EMPTY:
        # пустые данные: ни точек, ни сотрудников, ни сессий — тексты-заглушки и ни одной ошибки
        p.evaluate('document.querySelector(\'.tab[data-tab="att"]\').click()');p.wait_for_timeout(900)
        rep["faceEmpty"]=p.inner_text("#ruFaceBody")
        p.click('#ruSeg [data-sub=sess]');p.wait_for_timeout(500);rep["sessEmpty"]=p.inner_text("#ruSessBody")
        p.click('#ruSeg [data-sub=users]');p.wait_for_timeout(500)
        rep["errors"]=list(dict.fromkeys(errs))
        if "Нет точек" not in rep["faceEmpty"]:bad["faceEmpty"]=rep["faceEmpty"]
        if "нет" not in rep["sessEmpty"]:bad["sessEmpty"]=rep["sessEmpty"]
        if rep["errors"]:bad["errors"]=rep["errors"]
    elif FULL:
        p.evaluate('document.querySelector(\'.tab[data-tab="att"]\').click()');p.wait_for_timeout(900)
        # --- подраздел 1: фейс-контроль (по умолчанию), журнал виден ---
        rep["subDef"]=p.evaluate('document.querySelector("#ruSeg [aria-pressed=true]").dataset.sub')
        rep["segBtns"]=p.evaluate('[...document.querySelectorAll("#ruSeg button")].map(b=>b.textContent)')
        rep["bodyFace"]=p.evaluate('document.getElementById("attBody").style.display')
        rep["tiles"]=p.evaluate('[...document.querySelectorAll("#ruFaceBody .ru-tile")].map(t=>t.innerText.replace(/\\s+/g," "))')
        # --- подраздел 2: сессии ---
        p.click('#ruSeg [data-sub=sess]');p.wait_for_timeout(600)
        rep["bodySess"]=p.evaluate('document.getElementById("attBody").style.display')
        rep["sessGroups"]=p.evaluate('document.querySelectorAll("#ruSessBody .ru-user").length')
        rep["sessText"]=p.inner_text("#ruPSess")
        rep["endBtns"]=p.evaluate('document.querySelectorAll("#ruSessBody [data-end]").length')
        rep["curBtn"]=p.evaluate('[...document.querySelectorAll("#ruSessBody .ru-sess li")].filter(li=>li.textContent.includes("эта сессия")).map(li=>li.querySelectorAll("[data-end]").length)')
        rep["access"]=p.evaluate('[...document.querySelectorAll("#ruSessBody [data-access]")].map(x=>x.dataset.access)')
        rep["hasTag"]=p.evaluate('!!document.querySelector("#ruSessBody b") && [...document.querySelectorAll("#ruSessBody b")].every(b=>!b.querySelector("b"))')
        p.click('#ruSessBody [data-end=s2]');p.wait_for_timeout(500)
        rep["endCall"]=[c for c in p.evaluate("window.__calls") if isinstance(c,dict) and c.get("rpc")=="admin_end_session"]
        p.click('#ruSeg [data-sub=users]');p.wait_for_timeout(600)
        rep["bodyUsers"]=p.evaluate('document.getElementById("attBody").style.display')
        rep["lsSub"]=p.evaluate('localStorage.getItem("ruSub")')
        rep["usersBlock"]=vis("#roleUsers")
        if os.environ.get("SHOT"):p.evaluate('document.querySelector("#roleUsers [data-act=edit]")?.click()');p.wait_for_timeout(400);p.screenshot(path=os.environ["SHOT"],full_page=True)  # снимок панели для превью владельцу
        rep["groups"]=p.evaluate('[...document.querySelectorAll("#ruBody .ru-grp td")].map(x=>x.textContent.trim())')
        rep["btns"]=p.evaluate('Object.fromEntries([...document.querySelectorAll("#ruBody tr[data-row]")].map(r=>[r.dataset.row,[...r.querySelectorAll("[data-act]")].map(b=>b.dataset.act)]))')
        rep["roleOpts"]=p.evaluate('[...document.querySelectorAll("#ruForm [data-f=role] option")].map(o=>o.value)')
        # форма «Добавить»: смена статуса сбрасывает права на набор по умолчанию
        def chk():return p.evaluate('[...document.querySelectorAll("#ruForm [data-p]")].filter(c=>c.checked).map(c=>c.dataset.p)')
        p.select_option('#ruForm [data-f=role]','seller');rep["defSeller"]=chk()
        p.select_option('#ruForm [data-f=role]','marketer');rep["defMarketer"]=chk()
        p.select_option('#ruForm [data-f=role]','cashier');rep["defCashier"]=chk()
        rep["swCount"]=p.evaluate('document.querySelectorAll("#ruForm [data-p]").length')
        if ROLE=="owner":
            p.select_option('#ruForm [data-f=role]','admin')
            rep["adminPt"]=p.evaluate('[...document.querySelectorAll("#ruForm [data-f=point] option")].map(o=>o.textContent)[0]')
            rep["adminFull"]=p.evaluate('!document.querySelector("#ruForm [data-w=full]").hidden')
        # изменить кассира: форма раскрывается, сохранение шлёт все 11 прав
        p.click('#ruBody [data-act=edit][data-email="c1@x.uz"]');p.wait_for_timeout(300)
        rep["editOpen"]=vis("#ruBody .ru-edit form")
        p.click('#ruBody .ru-edit [data-p=export]');p.click('#ruBody .ru-edit button[type=submit]');p.wait_for_timeout(500)
        up=[c for c in p.evaluate("window.__calls") if isinstance(c,dict) and c.get("action")=="update"]
        rep["updateCall"]=up[-1] if up else None
        # select-ы в строке: свои и владельца заблокированы; смена статуса шлёт update {email, role, point}
        rep["sel"]=p.evaluate('Object.fromEntries([...document.querySelectorAll("#ruBody tr[data-row]")].map(r=>[r.dataset.row,[...r.querySelectorAll("[data-sel]")].map(x=>x.value+(x.disabled?"!":""))]))')
        p.select_option('#ruBody tr[data-row="c1@x.uz"] [data-sel=role]','seller');p.wait_for_timeout(600)
        up2=[c for c in p.evaluate("window.__calls") if isinstance(c,dict) and c.get("action")=="update"]
        rep["selCall"]=up2[-1] if up2 else None
        rep["selMsg"]=p.inner_text("#ruTblMsg")
        rep["errors"]=list(dict.fromkeys(errs))
        if rep["subDef"]!="face":bad["subDef"]=rep["subDef"]
        if len(rep["segBtns"])!=3:bad["segBtns"]=rep["segBtns"]
        if rep["bodyFace"]=="none":bad["bodyFace"]="журнал скрыт в фейс-контроле"
        if rep["bodySess"]!="none" or rep["bodyUsers"]!="none":bad["bodyHidden"]=[rep["bodySess"],rep["bodyUsers"]]
        if rep["lsSub"]!="users":bad["lsSub"]=rep["lsSub"]
        t0=next((t for t in rep["tiles"] if t.startswith("Премиум")),"")
        for w in ["начало 10:00","пришли 2","опоздали 1","ещё нет 1","пришёл 09:30","ушёл 18:00","впритык 09:55","опоздал на 20 мин, 10:20","Дина ещё нет"]:
            if w not in t0:bad["tile "+w]=t0
        if not any(t.startswith("Яшнабад") and "ещё нет 1" in t for t in rep["tiles"]):bad["tileYa"]=rep["tiles"]
        if rep["sessGroups"]!=2:bad["sessGroups"]=rep["sessGroups"]
        if rep["endBtns"]!=3 or rep["curBtn"]!=[0]:bad["endBtns"]=[rep["endBtns"],rep["curBtn"]]
        if rep["access"]!=["c1@x.uz"]:bad["access"]=rep["access"]
        for w in ["iPhone iOS 17 · Safari","Mac · Chrome","Windows · Edge","Weird/1.0 <b>x</b>","10.0.0.3","эта сессия","не позже чем через час"]:
            if w not in rep["sessText"]:bad["sess "+w]=rep["sessText"][:300]
        if not rep["endCall"] or rep["endCall"][-1]["args"]!={"p_id":"s2"}:bad["endCall"]=rep["endCall"]
        sl=rep["sel"]
        if sl.get("c1@x.uz")!=["cashier","Премиум"]:bad["selC1"]=sl.get("c1@x.uz")
        if sl.get("own@x.uz") is None or not all(x.endswith("!") for x in sl["own@x.uz"]):bad["selOwner"]=sl.get("own@x.uz")
        if not all(x.endswith("!") for x in sl.get("o@x.uz",["x"])):bad["selSelf"]=sl.get("o@x.uz")
        if ROLE=="owner" and any(x.endswith("!") for x in sl.get("adm@x.uz",["!"])):bad["selAdmOwner"]=sl.get("adm@x.uz")
        if ROLE=="admin" and not all(x.endswith("!") for x in sl.get("adm@x.uz",["x"])):bad["selAdmAdmin"]=sl.get("adm@x.uz")
        if not rep["selCall"] or {k:rep["selCall"].get(k) for k in("email","role","point")}!={"email":"c1@x.uz","role":"seller","point":"Премиум"}:bad["selCall"]=rep["selCall"]
        if rep["selMsg"]!="Сохранено":bad["selMsg"]=rep["selMsg"]
        if "att" not in rep["tabs"] or "sales" not in rep["tabs"] or "analytics" not in rep["tabs"]:bad["tabs"]=rep["tabs"]
        if not rep["usersBlock"]:bad["usersBlock"]="нет панели «Пользователи»"
        if not rep["groups"] or not rep["groups"][0].startswith("Все точки"):bad["groups"]=rep["groups"]
        if rep["btns"].get("own@x.uz"):bad["ownerBtns"]=rep["btns"].get("own@x.uz")
        if ROLE=="admin" and rep["btns"].get("o@x.uz")!=["edit"]:bad["selfBtns"]=rep["btns"].get("o@x.uz")
        if ROLE=="owner":
            if rep["btns"].get("adm@x.uz")!=["edit","off","pw","del"]:bad["admBtns"]=rep["btns"].get("adm@x.uz")
            if "admin" not in rep["roleOpts"]:bad["roleOpts"]=rep["roleOpts"]
            if rep["adminPt"]!="Все точки" or not rep["adminFull"]:bad["admin"]=[rep["adminPt"],rep["adminFull"]]
        else:
            if rep["btns"].get("adm@x.uz")!=[]:bad["admBtns"]=rep["btns"].get("adm@x.uz")
            if "admin" in rep["roleOpts"]:bad["roleOpts"]="админ видит «Админ»"
        if rep["btns"].get("c1@x.uz")!=["edit","off","pw","del"]:bad["cashBtns"]=rep["btns"].get("c1@x.uz")
        if rep["btns"].get("s1@x.uz")!=["edit","on","pw","del"]:bad["sellBtns"]=rep["btns"].get("s1@x.uz")
        if sorted(rep["defSeller"])!=sorted(DEF["seller"]):bad["defSeller"]=rep["defSeller"]
        if sorted(rep["defMarketer"])!=sorted(DEF["marketer"]):bad["defMarketer"]=rep["defMarketer"]
        if sorted(rep["defCashier"])!=sorted(DEF["cashier"]):bad["defCashier"]=rep["defCashier"]
        if rep["swCount"]!=12:bad["swCount"]=rep["swCount"]
        if not rep["editOpen"]:bad["editOpen"]="форма не раскрылась"
        u=rep["updateCall"]
        if not u or sorted((u.get("perms") or {}).keys())!=sorted(KEYS) or u["perms"].get("export") is not True:bad["updateCall"]=u
        if rep["errors"]:bad["errors"]=rep["errors"]
    else:
        rep["shown"]={s:vis(s) for s in ["#photoPanel","#saleFormPanel","details.settings","#exportBtns","#salesKpis","#sCalPanel","#dayCashWrap","#debtsWrap","#dxForm","#dxToggle","#dxTable","#fPoint",".scal-plan"]}
        rep["html_nan"]="NaN" in p.evaluate("document.body.innerText")
        rep["noneMsg"]=vis("#roleNone")
        if PERM["exp_add"]:
            rep["dxPoint"]=p.evaluate('[document.getElementById("dxPoint").value,document.getElementById("dxPoint").disabled]')
            rep["chips"]=p.evaluate('[...document.querySelectorAll("#dxTpl button")].map(b=>b.textContent)')
            rep["dateMax"]=p.evaluate('document.getElementById("sDate").max')
            p.click('#dxTpl button');p.fill('#dxAmount','1000');p.click('#dxSubmit');p.wait_for_timeout(800)
            rep["dxMsg"]=p.inner_text('#dxMsg');rep["dxRows"]=p.evaluate('document.querySelectorAll("#dxTable tbody tr").length')
            rep["calls"]=p.evaluate("window.__calls")
            p.fill('#dxAmount','');p.click('#dxSubmit');p.wait_for_timeout(300);rep["dxErr"]=p.inner_text('#dxMsg')
            if PERM["exp_view"]:p.click("#dxToggle");p.wait_for_timeout(300)
            rep["dxActs"]=vis("#dxTable td.acts");rep["dxDel"]=p.evaluate("document.querySelectorAll('#dxTable [data-xd]').length")
        if PERM["sales_view"]:
            rep["ptBtns"]=p.evaluate('document.querySelectorAll("#sPointSeg button").length')
        if PERM["sales_write"]:
            p.fill('#sProduct','Тестовая оправа');p.fill('#sPrice','100000');p.click('#sSubmit');p.wait_for_timeout(800)
            rep["sMsg"]=p.inner_text('#sMsg');rep["jrn"]="Тестовая оправа" in p.inner_text('#jGrid')
            rep["jActs"]=vis("#jGrid .ja")
        if PERM["att_view"]:
            p.evaluate('document.querySelector(\'.tab[data-tab="att"]\').click()');p.wait_for_timeout(500)
            rep["attLabel"]=p.evaluate('document.querySelector(\'.tabs .tab[data-tab="att"]\').textContent.trim()')
            rep["usersBlock"]=vis("#roleUsers")
        if PERM["analytics"]:
            p.evaluate('document.querySelector(\'.tab[data-tab="analytics"]\').click()');p.wait_for_timeout(1000)
            p.click('#presetSeg [data-p=all]');p.wait_for_timeout(800)
            rep["anCards"]=p.evaluate('document.getElementById("anCards").children.length')
            rep["anXlsx"]=vis("#anXlsx")
            rep["anText"]=[w for w in ["Прогноз","Маржа","Валовая","План за период","Расходы дня","Прибыль"] if w in p.evaluate("document.getElementById('page-analytics').innerText")]
        rep["errors"]=list(dict.fromkeys(errs))
        # --- проверки по правам ---
        HASTASKS='data-tab="tasks"' in open(D+"/../../index.html",encoding="utf-8").read()  # вкладка «Задания» появится позже отдельным патчем
        exp_tabs=[t for t,k in(("sales","sales_view"),("analytics","analytics"),("att","att_view"),("tasks","tasks")) if PERM[k] and (t!="tasks" or HASTASKS)]
        if sorted(rep["tabs"])!=sorted(exp_tabs):bad["tabs"]=rep["tabs"]
        SH={"#photoPanel":0,"details.settings":0,".scal-plan":0,"#saleFormPanel":PERM["sales_write"] and PERM["sales_view"],"#dxForm":PERM["exp_add"]}
        if not PERM["exp_view"]:SH["#dxToggle"]=0;SH["#dxTable"]=0
        if not PERM["export"]:SH["#exportBtns"]=0
        if not PERM["cash_view"]:SH["#dayCashWrap"]=0
        if not PERM["debts_view"]:SH["#debtsWrap"]=0
        if HASPT and PERM["sales_write"]:SH["#fPoint"]=0
        for s,v in SH.items():
            if rep["shown"].get(s)!=bool(v):bad["shown "+s]=rep["shown"].get(s)
        if rep["errors"]:bad["errors"]=rep["errors"]
        if rep["html_nan"]:bad["html_nan"]=True
        if PERM["analytics"]:
            if rep["anXlsx"]!=PERM["export"]:bad["anXlsx"]=rep["anXlsx"]
            if rep["anText"]:bad["anText"]=rep["anText"]
        if PERM["exp_add"]:
            if HASPT and rep["dxPoint"]!=[POINT,True]:bad["dxPoint"]=rep["dxPoint"]
            if rep["chips"]!=["Такси","Вода"]:bad["chips"]=rep["chips"]
            if PERM["exp_view"] and not rep["dxRows"]:bad["dxRows"]=rep["dxRows"]
            if not rep["dxErr"]:bad["dxErr"]="нет ошибки при пустой сумме"
            if not rep["dateMax"]:bad["dateMax"]="нет"
            want="cashier_put_entry" if PERM["exp_edit"] else "seller_add_expense"
            if want not in rep["calls"]:bad["expRpc"]=[want,rep["calls"]]
            if PERM["exp_edit"]:
                if PERM["exp_view"] and not rep["dxDel"]:bad["dxDel"]="нет расходов дня с кнопкой удаления"
                if rep["dxDel"] and not rep["dxActs"]:bad["dxActs"]="кнопки удаления расходов скрыты при exp_edit"
            elif rep["dxActs"]:bad["dxActs"]="кнопки удаления видны без exp_edit"
        if PERM["att_view"]:
            if rep["attLabel"]!="Приход":bad["attLabel"]=rep["attLabel"]
            if rep["usersBlock"]:bad["usersBlock"]=True
        if HASPT and PERM["sales_view"] and rep["ptBtns"]!=1:bad["ptBtns"]=rep["ptBtns"]
        if PERM["sales_write"]:
            if not rep["jrn"]:bad["jrn"]="продажа не попала в журнал: "+rep["sMsg"]
            if PERM["sales_edit"] and not rep["jActs"]:bad["jActs"]="нет кнопок правки в журнале"
        if not exp_tabs and not rep["noneMsg"]:bad["noneMsg"]="нет сообщения «Нет доступных разделов»"
    if os.environ.get("DEBUG"):print(json.dumps(rep,ensure_ascii=False,indent=1))
    print(json.dumps(bad,ensure_ascii=False));b.close()
