"""Самопроверка ролей на фейковом Supabase: ROLE=seller|cashier|marketer [POINT=Премиум] python t_role.py.
Вывод {} = чисто, иначе — словарь отклонений; DEBUG=1 дополнительно печатает весь отчёт."""
import os,json
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.abspath(__file__))
ROLE=os.environ.get("ROLE","seller");POINT=os.environ.get("POINT","Премиум")
EXT='''
(function(){const cc=window.supabase.createClient;window.supabase.createClient=function(){const c=cc.apply(this,arguments);
 const role=%r,pt=%r,own=role==="seller"||role==="cashier";
 c.rpc=async(name,args)=>{const T=window.__T;
  if(name==="my_access")return {data:[{role:role,point:own?pt:null}],error:null};
  if(name==="role_docs_all"){const out=[];T.docs.forEach(r=>{const d=JSON.parse(JSON.stringify(r.data));
    if(r.col==="sales"){if(own&&d.point!==pt)return;delete d.cost;delete d.costEst;delete d.costSrc;delete d.photo;out.push({col:r.col,id:r.id,data:d})}
    else if(r.col==="settings"&&r.id==="sales"){delete d.plan;out.push({col:r.col,id:r.id,data:d})}
    else if(r.col==="entries"&&own&&d.branch===pt&&(d.type==="exp"||d.kind==="bc"))out.push({col:r.col,id:r.id,data:d})});
    if(own)out.push({col:"settings",id:"sellerTpl",data:{[pt]:["Такси","Вода"]}});
    return {data:out,error:null}}
  if(name==="seller_add_expense"){if(!args.p_amount)return {data:null,error:{message:"Сумма должна быть больше нуля"}};
    T.docs.push({col:"entries",id:"e_t1",data:{type:"exp",name:pt+" за "+args.p_name,amount:args.p_amount,cat:"op",branch:pt,date:args.p_date,source:"day",createdAt:Date.now()}});return {data:"e_t1",error:null}}
  if(name==="cashier_put_sale"){const d=args.p_data||{};if(d.point!==pt)return {data:null,error:{message:"Можно вносить только на своей точке"}};
    const i=T.docs.findIndex(r=>r.col==="sales"&&r.id===args.p_id);if(i>=0)T.docs[i].data=d;else T.docs.push({col:"sales",id:args.p_id,data:d});return {data:args.p_id,error:null}}
  if(name==="cashier_del_sale"){T.docs=T.docs.filter(r=>!(r.col==="sales"&&r.id===args.p_id));return {data:null,error:null}}
  if(name==="cashier_put_entry"){T.docs.push({col:"entries",id:args.p_id,data:args.p_data});return {data:args.p_id,error:null}}
  if(name==="cashier_del_entry"){T.docs=T.docs.filter(r=>!(r.col==="entries"&&r.id===args.p_id));return {data:null,error:null}}
  if(name==="access_list")return {data:[],error:null};
  return {data:null,error:{message:"нет "+name}}};
 c.functions={invoke:async()=>({data:{error:"Серверная функция не выложена"},error:null})};
 return c}})();
'''%(ROLE,POINT)
rep={};errs=[]
with sync_playwright() as pw:
    b=pw.chromium.launch();ctx=b.new_context(viewport={'width':1440,'height':950});p=ctx.new_page()
    p.on('pageerror',lambda e:errs.append(str(e)[:200]));p.on('console',lambda m:m.type=='error' and 'ERR_FAILED' not in m.text and errs.append(m.text[:200]))
    p.route("https://fonts.googleapis.com/**",lambda r:r.abort())
    p.route("**/supabase.js",lambda r:r.fulfill(body=open(D+"/fakesb_synth.js",encoding="utf-8").read()+EXT,content_type="application/javascript"))
    p.route("**/xlsx.full.min.js",lambda r:r.fulfill(path=D+"/xlsx.full.min.js"))
    idx="file://"+os.path.abspath(D+"/../../index.html")
    p.goto(idx+"#analytics" if ROLE!="marketer" else idx);p.wait_for_timeout(800)
    p.fill('#sbEmail','o@x.uz');p.fill('#sbPass','pass12345');p.click('#sbGo');p.wait_for_timeout(2500)
    rep["tabs"]=p.evaluate('[...document.querySelectorAll(".tabs .tab[data-tab]")].map(b=>b.dataset.tab)')
    rep["visible"]=p.evaluate('[...document.querySelectorAll(".page:not([hidden])")].map(x=>x.id)')
    vis=lambda s:p.evaluate('s=>{const e=document.querySelector(s);return !!e&&e.getBoundingClientRect().width>0}',s)
    rep["shown"]={s:vis(s) for s in ["#photoPanel","#saleFormPanel","details.settings","#exportBtns","#salesKpis","#sCalPanel","#dayCashWrap","#debtsWrap","#dxForm","#fPoint",".scal-plan"]}
    rep["html_nan"]="NaN" in p.evaluate("document.body.innerText")
    if ROLE in("seller","cashier"):
        rep["dxPoint"]=p.evaluate('[document.getElementById("dxPoint").value,document.getElementById("dxPoint").disabled]')
        rep["chips"]=p.evaluate('[...document.querySelectorAll("#dxTpl button")].map(b=>b.textContent)')
        rep["dateMax"]=p.evaluate('document.getElementById("sDate").max')
        p.click('#dxTpl button');p.fill('#dxAmount','1000');p.click('#dxSubmit');p.wait_for_timeout(800)
        rep["dxMsg"]=p.inner_text('#dxMsg');rep["dxRows"]=p.evaluate('document.querySelectorAll("#dxTable tbody tr").length')
        p.fill('#dxAmount','');p.click('#dxSubmit');p.wait_for_timeout(300);rep["dxErr"]=p.inner_text('#dxMsg')
        p.click("#dxToggle");p.wait_for_timeout(300)
        rep["dxActs"]=vis("#dxTable td.acts");rep["dxDel"]=p.evaluate("document.querySelectorAll('#dxTable [data-xd]').length")
        if ROLE=="cashier":
            rep["ptBtns"]=p.evaluate('document.querySelectorAll("#sPointSeg button").length')
            p.fill('#sProduct','Тестовая оправа');p.fill('#sPrice','100000');p.click('#sSubmit');p.wait_for_timeout(800)
            rep["sMsg"]=p.inner_text('#sMsg');rep["jrn"]="Тестовая оправа" in p.inner_text('#jGrid')
            rep["jActs"]=vis("#jGrid .ja")
        p.evaluate('document.querySelector(\'.tab[data-tab="att"]\').click()');p.wait_for_timeout(500)
        rep["attLabel"]=p.evaluate('document.querySelector(\'.tabs .tab[data-tab="att"]\').textContent.trim()')
        rep["usersBlock"]=vis("#roleUsers")
    else:
        p.evaluate('document.querySelector(\'.tab[data-tab="analytics"]\').click()');p.wait_for_timeout(1000)
        p.click('#presetSeg [data-p=all]');p.wait_for_timeout(800)
        rep["anCards"]=p.evaluate('document.getElementById("anCards").children.length')
        rep["anXlsx"]=vis("#anXlsx")
        rep["anText"]=[w for w in ["Прогноз","Маржа","Валовая","План за период","Расходы дня","Прибыль"] if w in p.evaluate("document.getElementById('page-analytics').innerText")]
    rep["errors"]=list(dict.fromkeys(errs))
    if os.environ.get("DEBUG"):print(json.dumps(rep,ensure_ascii=False,indent=1))
    bad={}
    exp_tabs=["sales","analytics"] if ROLE=="marketer" else ["sales","att"]
    if sorted(rep["tabs"])!=sorted(exp_tabs):bad["tabs"]=rep["tabs"]
    SH={"seller":{"#photoPanel":0,"#saleFormPanel":0,"details.settings":0,"#exportBtns":0,".scal-plan":0,"#dxForm":1},
        "cashier":{"#photoPanel":0,"#saleFormPanel":1,"details.settings":0,"#exportBtns":0,".scal-plan":0,"#dxForm":1,"#fPoint":0},
        "marketer":{"#photoPanel":0,"#saleFormPanel":0,"details.settings":0,"#exportBtns":0,".scal-plan":0,"#dxForm":0,"#dayCashWrap":0}}[ROLE]
    for s,v in SH.items():
        if rep["shown"].get(s)!=bool(v):bad["shown "+s]=rep["shown"].get(s)
    if rep["errors"]:bad["errors"]=rep["errors"]
    if rep["html_nan"]:bad["html_nan"]=True
    if ROLE=="marketer":
        if rep["anXlsx"]:bad["anXlsx"]=True
        if rep["anText"]:bad["anText"]=rep["anText"]
    else:
        if rep["dxPoint"]!=[POINT,True]:bad["dxPoint"]=rep["dxPoint"]
        if rep["chips"]!=["Такси","Вода"]:bad["chips"]=rep["chips"]
        if not rep["dxRows"]:bad["dxRows"]=rep["dxRows"]
        if not rep["dxErr"]:bad["dxErr"]="нет ошибки при пустой сумме"
        if rep["attLabel"]!="Приход":bad["attLabel"]=rep["attLabel"]
        if rep["usersBlock"]:bad["usersBlock"]=True
        if not rep["dateMax"]:bad["dateMax"]="нет"
    if ROLE=="seller" and rep["dxActs"]:bad["dxActs"]="кнопки удаления видны продавцу"
    if ROLE=="cashier":
        if rep["ptBtns"]!=1:bad["ptBtns"]=rep["ptBtns"]
        if not rep["jrn"]:bad["jrn"]="продажа не попала в журнал: "+rep["sMsg"]
        if not rep["jActs"]:bad["jActs"]="нет кнопок правки в журнале"
        if not rep["dxDel"]:bad["dxDel"]="нет расходов дня с кнопкой удаления"
        if rep["dxDel"] and not rep["dxActs"]:bad["dxActs"]="кнопки удаления расходов скрыты кассиру"
    print(json.dumps(bad,ensure_ascii=False));b.close()
