"""Стресс-тест клиента на больших данных: ROLE=marketer|cashier|seller|owner N=20000 python t_stress.py.
Генерирует N продаж за 12 месяцев по 4 точкам и ~N*0.15 расходов дня (seed), подмешивает к обычным данным fakesb.
Метрики: вход (мс до первой страницы), «Аналитика» за всё время, календарь и журнал продаж, куча JS, ошибки консоли.
Для cashier — 50 продаж и 30 расходов подряд через фейковые cashier_put_sale / cashier_put_entry.
Пороги: любая ошибка консоли, вход > 15 с, аналитика > 10 с, куча > 1,5 ГБ. Вывод — JSON с метриками в одну строку; при провале есть поле "bad"."""
import os,json,time
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.abspath(__file__))
ROLE=os.environ.get("ROLE","marketer");N=int(os.environ.get("N","20000"));NX=int(os.environ.get("NX",str(round(N*0.15))))
POINT="Премиум"
KEYS=["sales_view","sales_write","sales_edit","exp_view","exp_add","exp_edit","cash_view","debts_view","att_view","analytics","export"]
DEF={"cashier":[k for k in KEYS if k not in("analytics","export")],"seller":["sales_view","exp_view","exp_add","att_view"],
     "marketer":["sales_view","analytics"],"owner":KEYS}
HASPT=ROLE in("cashier","seller");PERM={k:(k in DEF[ROLE]) for k in KEYS}
EXT='''
(function(){const cc=window.supabase.createClient;window.supabase.createClient=function(){const c=cc.apply(this,arguments);
 const role=%r,pt=%r,perms=%s,own=role!=="owner",N=%d,NX=%d,PTS=["Премиум","Яшнабад","Сергели","C1"];window.__calls=[];window.__puts=0;window.__ents=0;
 const T=window.__T;
 // --- детерминированная генерация (mulberry32) ---
 let s=20260101;const rnd=()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t)^t)^(t>>>14);return((t^(t>>>14))>>>0)/4294967296};
 const pick=a=>a[Math.floor(rnd()*a.length)],iso=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
 const now=new Date(),day=()=>{const d=new Date(now);d.setDate(d.getDate()-Math.floor(rnd()*365));return iso(d)};
 const CATS=["Оправы","Детские оправы","Очковые линзы","Солнцезащитные очки","Контактные линзы","Растворы и капли","Аксессуары","Готовая оптика","Ремонт и услуги","Без детализации"];
 const PAYS=["Наличные","Терминал","QR/Payme","Перечисление"];
 const base=Date.now()-86400000*400;
 for(let i=0;i<N;i++){const price=(1+Math.floor(rnd()*40))*10000,qty=1+Math.floor(rnd()*3),sum=price*qty,mixed=rnd()<0.1,pay=pick(PAYS);
  const d={date:day(),point:pick(PTS),cat:pick(CATS),product:"Товар "+Math.floor(rnd()*500),qty:qty,price:price,sum:sum,pay:mixed?"Смешанная":pay,
   pays:mixed?{[PAYS[0]]:Math.floor(sum/2),[PAYS[1]]:sum-Math.floor(sum/2)}:null,check:String(1+Math.floor(rnd()*30)),createdAt:base+i,cost:Math.round(sum*0.45)};
  T.docs.push({col:"sales",id:"st"+i,data:d})}
 for(let i=0;i<NX;i++)T.docs.push({col:"entries",id:"sx"+i,data:{type:"exp",cat:"op",branch:pick(PTS),name:pick(["Такси","Вода","Доставка","Мастер"]),amount:(1+Math.floor(rnd()*20))*5000,date:day(),source:"day",createdAt:base+i}});
 if(own){
 c.rpc=async(name,args)=>{
  if(name==="my_access")return {data:[{role:role,point:pt||null,perms:perms,label:role,is_owner:false}],error:null};
  if(name==="role_docs_all"){const out=[];T.docs.forEach(r=>{
    if(r.col==="sales"){if(!perms.sales_view)return;if(pt&&r.data.point!==pt)return;const d=Object.assign({},r.data);delete d.cost;delete d.costEst;delete d.costSrc;delete d.photo;out.push({col:r.col,id:r.id,data:d})}
    else if(r.col==="settings"&&r.id==="sales"){const d=Object.assign({},r.data);delete d.plan;out.push({col:r.col,id:r.id,data:d})}
    else if(r.col==="entries"&&perms.exp_view&&(!pt||r.data.branch===pt)&&(r.data.type==="exp"||r.data.kind==="bc"))out.push({col:r.col,id:r.id,data:r.data})});
    if(perms.exp_add&&pt)out.push({col:"settings",id:"sellerTpl",data:{[pt]:["Такси","Вода"]}});
    return {data:out,error:null}}
  if(name==="seller_add_expense"){window.__ents++;T.docs.push({col:"entries",id:"e_s"+window.__ents,data:{type:"exp",name:pt+" за "+args.p_name,amount:args.p_amount,cat:"op",branch:pt,date:args.p_date,source:"day",createdAt:Date.now()}});return {data:"e",error:null}}
  if(name==="cashier_put_sale"){const d=args.p_data||{};if(d.point!==pt)return {data:null,error:{message:"Можно вносить только на своей точке"}};
    const i=T.docs.findIndex(r=>r.col==="sales"&&r.id===args.p_id);if(i>=0)T.docs[i].data=d;else T.docs.push({col:"sales",id:args.p_id,data:d});window.__puts++;return {data:args.p_id,error:null}}
  if(name==="cashier_del_sale"){T.docs=T.docs.filter(r=>!(r.col==="sales"&&r.id===args.p_id));return {data:null,error:null}}
  if(name==="cashier_put_entry"){window.__ents++;T.docs.push({col:"entries",id:args.p_id,data:args.p_data});return {data:args.p_id,error:null}}
  if(name==="cashier_del_entry"){T.docs=T.docs.filter(r=>!(r.col==="entries"&&r.id===args.p_id));return {data:null,error:null}}
  if(name==="att_my_load")return {data:{point:pt,start_time:"10:00",employees:[],events:[]},error:null};
  if(name==="access_list")return {data:[],error:null};
  return {data:null,error:{message:"нет "+name}}};
 }else{
 c.rpc=async(name)=>{if(name==="my_access")return {data:[{role:"admin",point:null,perms:perms,label:"owner",is_owner:true}],error:null};
  if(name==="access_list")return {data:[],error:null};return {data:null,error:{message:"нет "+name}}};
 }
 c.functions={invoke:async(n,o)=>{window.__calls.push(o&&o.body);return {data:{ok:true},error:null}}};
 return c}})();
'''%(ROLE,POINT if HASPT else "",json.dumps(PERM),N,NX)
m={"role":ROLE,"n":N,"nx":NX};bad={};errs=[]
# клик или ввод значения + ожидание перерисовки (два кадра), возвращает мс
RAF='async(a)=>{const e=document.querySelector(a[0]);const t=performance.now();if(a[1]==="click")e.click();else{e.value=a[2];e.dispatchEvent(new Event("input",{bubbles:true}));e.dispatchEvent(new Event("change",{bubbles:true}))}await new Promise(r=>requestAnimationFrame(()=>setTimeout(r,0)));return performance.now()-t}'
with sync_playwright() as pw:
    b=pw.chromium.launch(args=["--enable-precise-memory-info"]);ctx=b.new_context(viewport={'width':1440,'height':950});p=ctx.new_page()
    p.on('pageerror',lambda e:errs.append(str(e)[:200]));p.on('console',lambda x:x.type=='error' and 'ERR_FAILED' not in x.text and errs.append(x.text[:200]))
    p.route("https://fonts.googleapis.com/**",lambda r:r.abort())
    p.route("**/supabase.js",lambda r:r.fulfill(body=open(D+"/fakesb_synth.js",encoding="utf-8").read()+EXT,content_type="application/javascript"))
    p.route("**/xlsx.full.min.js",lambda r:r.fulfill(path=D+"/xlsx.full.min.js"))
    p.set_default_timeout(60000)
    p.goto("file://"+os.path.abspath(D+"/../../index.html"));p.wait_for_timeout(800)
    p.fill('#sbEmail','o@x.uz');p.fill('#sbPass','pass12345')
    t0=time.perf_counter();p.click('#sbGo')
    p.wait_for_function('document.querySelectorAll(".tabs .tab[data-tab]").length>0&&[...document.querySelectorAll(".page:not([hidden])")].some(x=>x.getBoundingClientRect().width>0)',polling=50)
    m["login_ms"]=round((time.perf_counter()-t0)*1000);p.wait_for_timeout(1500)
    tabs=p.evaluate('[...document.querySelectorAll(".tabs .tab[data-tab]")].map(b=>b.dataset.tab)');m["tabs"]=tabs
    if "analytics" in tabs:
        t0=time.perf_counter();p.evaluate('document.querySelector(\'.tab[data-tab="analytics"]\').click()')
        p.wait_for_function('document.getElementById("anCards")&&document.getElementById("anCards").children.length>0',polling=50);m["an_tab_ms"]=round((time.perf_counter()-t0)*1000)
        p.evaluate(RAF,['#presetSeg [data-p=all]','click']);p.wait_for_function('document.getElementById("anCards").children.length>0',polling=50)
        m["an_all_ms"]=round((time.perf_counter()-t0)*1000)
    if "sales" in tabs:
        p.evaluate('document.querySelector(\'.tab[data-tab="sales"]\').click()');p.wait_for_timeout(800)
        cal=[p.evaluate(RAF,['#sCalPrev','click']) for _ in range(6)]+[p.evaluate(RAF,['#sCalNext','click']) for _ in range(6)]
        m["cal_ms"]=round(sum(cal)/len(cal));m["cal_max_ms"]=round(max(cal))
        d=p.evaluate('[...Array(12)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-5-i*20);return d.toISOString().slice(0,10)})')
        jr=[p.evaluate(RAF,['#jDate','set',x]) for x in d]+[p.evaluate(RAF,['#jNext','click']) for _ in range(5)]
        m["journal_ms"]=round(sum(jr)/len(jr));m["journal_max_ms"]=round(max(jr))
    if ROLE=="cashier":
        t=[]
        for i in range(50):
            p.fill('#sProduct','Стресс %d'%i);p.fill('#sPrice','100000')
            t0=time.perf_counter();p.click('#sSubmit');p.wait_for_function('window.__puts>%d'%i,polling=20);t.append((time.perf_counter()-t0)*1000)
        m["sale_put_avg_ms"]=round(sum(t)/len(t));m["sale_put_max_ms"]=round(max(t))
        t=[]
        for i in range(30):
            p.fill('#dxName','Такси');p.fill('#dxAmount',str(10000+i));t0=time.perf_counter();p.click('#dxSubmit');p.wait_for_function('window.__ents>%d'%i,polling=20);t.append((time.perf_counter()-t0)*1000)
        m["exp_put_avg_ms"]=round(sum(t)/len(t));m["exp_put_max_ms"]=round(max(t))
        p.wait_for_timeout(500)
    h=p.evaluate('performance.memory?performance.memory.usedJSHeapSize:null');m["heap_mb"]=round(h/1048576) if h else None
    p.wait_for_timeout(300);m["errors"]=len(errs)
    if errs:bad["errors"]=list(dict.fromkeys(errs))[:5]
    if m["login_ms"]>15000:bad["login"]=m["login_ms"]
    if m.get("an_all_ms",0)>10000:bad["analytics"]=m["an_all_ms"]
    if h and h>1.5*1024**3:bad["heap"]=m["heap_mb"]
    if not tabs:bad["tabs"]="нет вкладок"
    if bad:m["bad"]=bad
    print(json.dumps(m,ensure_ascii=False));b.close()
