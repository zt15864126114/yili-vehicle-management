import{i as w}from"./index-CFFsEcQF.js";import{d as B,r as b,z as A,A as D,h as x,e as t,w as e,b as i,o as k,F as E,i as H,j as r,f as n,t as d,_ as N}from"./index-Dj8K2Q4U.js";const O={class:"dashboard"},V={class:"card-header"},F={class:"card-value"},S={class:"card-footer"},U={class:"card-header"},j=B({__name:"Dashboard",setup(I){const T=[{title:"车辆总数",value:"28",tag:"正常运行",type:"success",footer:"较上月 +2"},{title:"本月行驶里程",value:"12,345 km",tag:"正常",type:"info",footer:"日均 411.5 km"},{title:"本月油耗",value:"2,860 L",tag:"偏高",type:"warning",footer:"较上月 +15%"},{title:"本月费用",value:"¥45,678",tag:"正常",type:"success",footer:"较上月 -5%"}],z=[{type:"年检提醒",tagType:"warning",content:"车牌号：鲁H12345 需要进行年度检验",deadline:"2024-03-15",status:"待处理",statusType:"warning"},{type:"保养提醒",tagType:"info",content:"车牌号：鲁H67890 需要进行定期保养",deadline:"2024-03-10",status:"进行中",statusType:"primary"},{type:"保险到期",tagType:"danger",content:"车牌号：鲁H24680 车辆保险即将到期",deadline:"2024-03-20",status:"待处理",statusType:"warning"}];let l=null,o=null;const c=b(),f=b(),C=()=>{if(c.value){l=w(c.value);const p={tooltip:{trigger:"axis"},legend:{data:["燃油费用","维修费用","其他费用"]},xAxis:{type:"category",data:["1月","2月","3月","4月","5月","6月"]},yAxis:{type:"value",axisLabel:{formatter:"¥{value}"}},series:[{name:"燃油费用",type:"line",data:[15e3,14e3,16e3,15500,16500,17e3]},{name:"维修费用",type:"line",data:[5e3,6e3,4500,5500,6500,5e3]},{name:"其他费用",type:"line",data:[2e3,2500,2300,2800,2600,2400]}]};l.setOption(p)}},L=()=>{if(f.value){o=w(f.value);const p={tooltip:{trigger:"item"},legend:{orient:"vertical",left:"left"},series:[{name:"车辆使用状态",type:"pie",radius:"50%",data:[{value:18,name:"正常使用"},{value:5,name:"维修中"},{value:3,name:"待检验"},{value:2,name:"闲置"}],emphasis:{itemStyle:{shadowBlur:10,shadowOffsetX:0,shadowColor:"rgba(0, 0, 0, 0.5)"}}}]};o.setOption(p)}},v=()=>{l==null||l.resize(),o==null||o.resize()};return A(()=>{C(),L(),window.addEventListener("resize",v)}),D(()=>{window.removeEventListener("resize",v),l==null||l.dispose(),o==null||o.dispose()}),(p,s)=>{const y=i("el-tag"),g=i("el-button"),u=i("el-card"),m=i("el-col"),h=i("el-row"),_=i("el-table-column"),R=i("el-table");return k(),x("div",O,[t(h,{gutter:20},{default:e(()=>[(k(),x(E,null,H(T,a=>t(m,{span:6,key:a.title},{default:e(()=>[t(u,{class:"stat-card"},{header:e(()=>[n("div",V,[n("span",null,d(a.title),1),t(y,{type:a.type},{default:e(()=>[r(d(a.tag),1)]),_:2},1032,["type"])])]),default:e(()=>[n("div",F,d(a.value),1),n("div",S,[n("span",null,d(a.footer),1),t(g,{link:"",type:"primary"},{default:e(()=>s[0]||(s[0]=[r("详情")])),_:1})])]),_:2},1024)]),_:2},1024)),64))]),_:1}),t(h,{gutter:20,class:"chart-row"},{default:e(()=>[t(m,{span:12},{default:e(()=>[t(u,null,{header:e(()=>s[1]||(s[1]=[r("月度费用趋势")])),default:e(()=>[n("div",{ref_key:"costChartRef",ref:c,class:"chart"},null,512)]),_:1})]),_:1}),t(m,{span:12},{default:e(()=>[t(u,null,{header:e(()=>s[2]||(s[2]=[r("车辆使用率")])),default:e(()=>[n("div",{ref_key:"usageChartRef",ref:f,class:"chart"},null,512)]),_:1})]),_:1})]),_:1}),t(u,{class:"todo-card"},{header:e(()=>[n("div",U,[s[4]||(s[4]=n("span",null,"待办事项",-1)),t(g,{type:"primary",link:""},{default:e(()=>s[3]||(s[3]=[r("查看全部")])),_:1})])]),default:e(()=>[t(R,{data:z,style:{width:"100%"}},{default:e(()=>[t(_,{prop:"type",label:"类型",width:"120"},{default:e(({row:a})=>[t(y,{type:a.tagType},{default:e(()=>[r(d(a.type),1)]),_:2},1032,["type"])]),_:1}),t(_,{prop:"content",label:"内容"}),t(_,{prop:"deadline",label:"截止日期",width:"180"}),t(_,{prop:"status",label:"状态",width:"120"},{default:e(({row:a})=>[t(y,{type:a.statusType},{default:e(()=>[r(d(a.status),1)]),_:2},1032,["type"])]),_:1})]),_:1})]),_:1})])}}}),q=N(j,[["__scopeId","data-v-390a42e8"]]);export{q as default};
