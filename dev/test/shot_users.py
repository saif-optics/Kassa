"""Самопроверка ролей и прав на фейковом Supabase: ROLE=seller|cashier|marketer|guestpt|sellernoatt|sellernoview|empty|owner|admin python t_role.py.
seller/cashier/marketer — права по умолчанию статуса; guestpt — гость с точкой (продажи + аналитика); sellernoatt — продавец без журнала прихода; sellernoview — добавляет расход, но не видит расходы (панель списка скрыта); empty — пустые права (сообщение «Нет доступных разделов»);
owner/admin — вкладка «Пользователи» с тремя подразделами (фейс-контроль, сессии, таблица: группы по точкам, select-ы статуса и точки, форма изменения, права); ownerempty — владелец при пустых данных (нет сотрудников и сессий, без ошибок).
Вывод {} = чисто, иначе — словарь отклонений; DEBUG=1 дополнительно печатает весь отчёт."""
import os,json
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.abspath(__file__))
SC=os.environ.get("ROLE","owner");POINT=os.environ.get("POINT","Премиум")
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
    p.evaluate('document.querySelector(".tab[data-tab=att]").click()');p.wait_for_timeout(1500)
    OUT=os.environ["OUT"]
    for w in (1920,1366,390):
        p.set_viewport_size({'width':w,'height':950});p.wait_for_timeout(500)
        for sub in ("face","sess"):
            p.click('#ruSeg [data-sub=%s]'%sub);p.wait_for_timeout(1200)
            m=p.evaluate('()=>{const r=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return [Math.round(b.left),Math.round(b.right)]};return {panel:r("#roleUsers"),seg:r("#ruSeg"),frame:r("#attFrame"),sw:document.documentElement.scrollWidth}}')
            print(w,sub,m)
            p.evaluate('document.querySelector("#roleUsers").scrollIntoView()')
            p.screenshot(path="%s/align_%d_%s.png"%(OUT,w,sub),full_page=True)
    b.close()
