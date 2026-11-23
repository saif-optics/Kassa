"""Самопроверка ролей и прав на фейковом Supabase: ROLE=seller|cashier|marketer|guestpt|sellernoatt|sellernoview|empty|owner|admin|ownerempty python t_role.py.
seller/cashier/marketer — права по умолчанию статуса; guestpt — гость с точкой (продажи + аналитика); sellernoatt — продавец без журнала прихода; sellernoview — добавляет расход, но не видит расходы (панель списка скрыта); empty — пустые права (сообщение «Нет доступных разделов»);
owner/admin — раздел «Пользователи» (группы по точкам, форма изменения, права).
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
      "sellernoview":("seller",True,["sales_view","exp_add","att_view","tasks"]),"empty":("marketer",False,[]),
      "owner":("owner",False,KEYS),"admin":("admin",False,KEYS),"ownerempty":("owner",False,KEYS)}
ROLE,HASPT,PL=SCEN[SC];PERM={k:(k in PL) for k in KEYS};FULL=ROLE in("owner","admin");EMPTY=SC=="ownerempty"
EXT='''
(function(){const cc=window.supabase.createClient;window.supabase.createClient=function(){const c=cc.apply(this,arguments);
 const role=%r,pt=%r,perms=%s,own=role!=="owner"&&role!=="admin",emp=%s,P0="Премиум";window.__calls=[];
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
  if(name==="access_list")return {data:own||emp?[]:ulist,error:null};
  return {data:null,error:{message:"нет "+name}}};
 c.functions={invoke:async(n,o)=>{window.__calls.push(o&&o.body);return {data:{ok:true},error:null}}};
 return c}})();
'''%(ROLE,POINT if HASPT else "",json.dumps(PERM),"true" if EMPTY else "false")
HASTASKS='data-tab="tasks"' in open(D+"/../../index.html",encoding="utf-8").read()
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
    if FULL:
        p.evaluate('document.querySelector(\'.tab[data-tab="att"]\').click()');p.wait_for_timeout(900)
        rep["usersBlock"]=vis("#roleUsers")
        if os.environ.get("SHOT"):p.evaluate('document.querySelector("#roleUsers [data-act=edit]")?.click()');p.wait_for_timeout(400);p.screenshot(path=os.environ["SHOT"],full_page=True)  # снимок панели для превью владельцу
        if EMPTY:
            rep["errors"]=list(dict.fromkeys(errs))
            rep["nan"]="NaN" in p.evaluate("document.body.innerText")
            if not rep["usersBlock"]:bad["usersBlock"]="нет панели «Пользователи»"
            if rep["errors"]:bad["errors"]=rep["errors"]
            if rep["nan"]:bad["nan"]=True
        else:
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
            # изменить кассира: форма раскрывается, сохранение шлёт все 12 прав
            p.click('#ruBody [data-act=edit][data-email="c1@x.uz"]');p.wait_for_timeout(300)
            rep["editOpen"]=vis("#ruBody .ru-edit form")
            p.click('#ruBody .ru-edit [data-p=export]');p.click('#ruBody .ru-edit button[type=submit]');p.wait_for_timeout(500)
            up=[c for c in p.evaluate("window.__calls") if isinstance(c,dict) and c.get("action")=="update"]
            rep["updateCall"]=up[-1] if up else None
            rep["errors"]=list(dict.fromkeys(errs))
            if any(t not in rep["tabs"] for t in ["att","sales","analytics"]+(["tasks"] if HASTASKS else [])):bad["tabs"]=rep["tabs"]
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
        exp_tabs=[t for t,k in(("sales","sales_view"),("analytics","analytics"),("att","att_view"))+((("tasks","tasks"),) if HASTASKS else ()) if PERM[k]]
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
