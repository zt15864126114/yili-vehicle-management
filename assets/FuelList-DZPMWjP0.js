import{f as K}from"./fuelRecord-siKxubu8.js";import{v as Q}from"./vehicle-lBh_cm1j.js";import{d as W}from"./driver-B9Ek07UP.js";import{d as X,r as h,B as S,D as Z,c as T,h as C,e as l,w as a,b as m,o as _,f as V,j as i,F,i as U,t as b,C as ee,E as M,a as R,_ as le}from"./index-Dj8K2Q4U.js";import"./mock-BnFOwhRk.js";const te={class:"fuel-list"},ae={class:"card-header"},oe={class:"statistics-cards"},de={class:"stat-value"},ne={class:"stat-value"},ue={class:"stat-value"},se={class:"dialog-footer"},ie=X({__name:"FuelList",setup(re){const v=h([]),I=h(Q.vehicles),N=h(W.drivers),g=h(!1),D=h("add"),r=S({vehicleId:"",station:"",dateRange:[]}),o=S({id:"",vehicleId:"",driverId:"",fuelDate:"",fuelType:"",fuelVolume:0,unitPrice:0,cost:0,station:"",currentMileage:0}),P=()=>{o.cost=Number((o.fuelVolume*o.unitPrice).toFixed(2))};Z(()=>o.fuelVolume,P);const x=T(()=>{const n=new Date,e=v.value.filter(d=>{const f=new Date(d.fuelDate);return f.getMonth()===n.getMonth()&&f.getFullYear()===n.getFullYear()}),s=e.reduce((d,f)=>d+f.fuelVolume,0),u=e.reduce((d,f)=>d+f.cost,0),p=s/(e.length||1);return{totalVolume:s,totalCost:u,avgConsumption:p}}),B=T(()=>v.value.filter(n=>{var p;const e=!r.vehicleId||n.vehicleId===r.vehicleId,s=!r.station||n.station===r.station;let u=!0;if(((p=r.dateRange)==null?void 0:p.length)===2){const d=new Date(n.fuelDate),f=new Date(r.dateRange[0]),w=new Date(r.dateRange[1]);u=d>=f&&d<=w}return e&&s&&u})),L=n=>{const e=I.value.find(s=>s.id===n);return e?e.plateNumber:"-"},E=n=>{const e=N.value.find(s=>s.id===n);return e?e.name:"-"},j=()=>{},O=()=>{Object.assign(r,{vehicleId:"",station:"",dateRange:[]})},$=()=>{D.value="add",g.value=!0,Object.assign(o,{id:"",vehicleId:"",driverId:"",fuelDate:"",fuelType:"",fuelVolume:0,unitPrice:0,cost:0,station:"",currentMileage:0})},z=n=>{D.value="edit",g.value=!0,Object.assign(o,n)},Y=n=>{ee.confirm("确定要删除该加油记录吗？","提示",{type:"warning"}).then(()=>{v.value=v.value.filter(e=>e.id!==n.id),M.success("删除成功")})},A=()=>{if(D.value==="add"){const n={...o,id:String(v.value.length+1)};v.value.unshift(n),M.success("新增加油记录成功")}else{const n=v.value.findIndex(e=>e.id===o.id);n!==-1&&(v.value[n]={...o},M.success("更新加油记录成功"))}g.value=!1};return v.value=K.records,(n,e)=>{const s=m("el-button"),u=m("el-option"),p=m("el-select"),d=m("el-form-item"),f=m("el-date-picker"),w=m("el-form"),y=m("el-card"),c=m("el-table-column"),q=m("el-button-group"),G=m("el-table"),k=m("el-input-number"),H=m("el-dialog");return _(),C("div",te,[l(y,null,{header:a(()=>[V("div",ae,[e[15]||(e[15]=V("span",null,"加油记录管理",-1)),l(s,{type:"primary",onClick:$},{default:a(()=>e[14]||(e[14]=[i("新增加油记录")])),_:1})])]),default:a(()=>[l(w,{inline:!0,class:"search-form"},{default:a(()=>[l(d,{label:"车辆"},{default:a(()=>[l(p,{modelValue:r.vehicleId,"onUpdate:modelValue":e[0]||(e[0]=t=>r.vehicleId=t),placeholder:"请选择车辆",clearable:""},{default:a(()=>[(_(!0),C(F,null,U(I.value,t=>(_(),R(u,{key:t.id,label:t.plateNumber,value:t.id},null,8,["label","value"]))),128))]),_:1},8,["modelValue"])]),_:1}),l(d,{label:"加油站"},{default:a(()=>[l(p,{modelValue:r.station,"onUpdate:modelValue":e[1]||(e[1]=t=>r.station=t),placeholder:"请选择加油站",clearable:""},{default:a(()=>[l(u,{label:"中石化兖州站",value:"中石化兖州站"}),l(u,{label:"中石油济宁站",value:"中石油济宁站"}),l(u,{label:"壳牌加油站",value:"壳牌加油站"}),l(u,{label:"益海嘉里自营站",value:"益海嘉里自营站"})]),_:1},8,["modelValue"])]),_:1}),l(d,{label:"加油日期"},{default:a(()=>[l(f,{modelValue:r.dateRange,"onUpdate:modelValue":e[2]||(e[2]=t=>r.dateRange=t),type:"daterange","range-separator":"至","start-placeholder":"开始日期","end-placeholder":"结束日期"},null,8,["modelValue"])]),_:1}),l(d,null,{default:a(()=>[l(s,{type:"primary",onClick:j},{default:a(()=>e[16]||(e[16]=[i("查询")])),_:1}),l(s,{onClick:O},{default:a(()=>e[17]||(e[17]=[i("重置")])),_:1})]),_:1})]),_:1}),V("div",oe,[l(y,{class:"stat-card"},{header:a(()=>e[18]||(e[18]=[i("本月加油总量")])),default:a(()=>[V("div",de,b(x.value.totalVolume.toFixed(2))+" L",1)]),_:1}),l(y,{class:"stat-card"},{header:a(()=>e[19]||(e[19]=[i("本月加油总费用")])),default:a(()=>[V("div",ne,"¥"+b(x.value.totalCost.toFixed(2)),1)]),_:1}),l(y,{class:"stat-card"},{header:a(()=>e[20]||(e[20]=[i("本月平均油耗")])),default:a(()=>[V("div",ue,b(x.value.avgConsumption.toFixed(2))+" L/100km",1)]),_:1})]),l(G,{data:B.value,border:""},{default:a(()=>[l(c,{prop:"id",label:"记录编号",width:"100"}),l(c,{label:"车牌号",width:"120"},{default:a(({row:t})=>[i(b(L(t.vehicleId)),1)]),_:1}),l(c,{label:"驾驶员",width:"100"},{default:a(({row:t})=>[i(b(E(t.driverId)),1)]),_:1}),l(c,{prop:"fuelDate",label:"加油时间",width:"160"}),l(c,{prop:"fuelType",label:"油品",width:"100"}),l(c,{prop:"fuelVolume",label:"加油量(L)",width:"100"}),l(c,{prop:"unitPrice",label:"单价",width:"100"},{default:a(({row:t})=>[i(" ¥"+b(t.unitPrice.toFixed(2)),1)]),_:1}),l(c,{prop:"cost",label:"总金额",width:"100"},{default:a(({row:t})=>[i(" ¥"+b(t.cost.toFixed(2)),1)]),_:1}),l(c,{prop:"station",label:"加油站",width:"150"}),l(c,{prop:"currentMileage",label:"当前里程",width:"120"},{default:a(({row:t})=>[i(b(t.currentMileage)+"km ",1)]),_:1}),l(c,{label:"操作",width:"150",fixed:"right"},{default:a(({row:t})=>[l(q,null,{default:a(()=>[l(s,{type:"primary",size:"small",onClick:J=>z(t)},{default:a(()=>e[21]||(e[21]=[i("编辑")])),_:2},1032,["onClick"]),l(s,{type:"danger",size:"small",onClick:J=>Y(t)},{default:a(()=>e[22]||(e[22]=[i("删除")])),_:2},1032,["onClick"])]),_:2},1024)]),_:1})]),_:1},8,["data"])]),_:1}),l(H,{modelValue:g.value,"onUpdate:modelValue":e[13]||(e[13]=t=>g.value=t),title:D.value==="add"?"新增加油记录":"编辑加油记录",width:"600px"},{footer:a(()=>[V("span",se,[l(s,{onClick:e[12]||(e[12]=t=>g.value=!1)},{default:a(()=>e[23]||(e[23]=[i("取消")])),_:1}),l(s,{type:"primary",onClick:A},{default:a(()=>e[24]||(e[24]=[i("确定")])),_:1})])]),default:a(()=>[l(w,{model:o,"label-width":"100px"},{default:a(()=>[l(d,{label:"车辆"},{default:a(()=>[l(p,{modelValue:o.vehicleId,"onUpdate:modelValue":e[3]||(e[3]=t=>o.vehicleId=t),placeholder:"请选择车辆"},{default:a(()=>[(_(!0),C(F,null,U(I.value,t=>(_(),R(u,{key:t.id,label:t.plateNumber,value:t.id},null,8,["label","value"]))),128))]),_:1},8,["modelValue"])]),_:1}),l(d,{label:"驾驶员"},{default:a(()=>[l(p,{modelValue:o.driverId,"onUpdate:modelValue":e[4]||(e[4]=t=>o.driverId=t),placeholder:"请选择驾驶员"},{default:a(()=>[(_(!0),C(F,null,U(N.value,t=>(_(),R(u,{key:t.id,label:t.name,value:t.id},null,8,["label","value"]))),128))]),_:1},8,["modelValue"])]),_:1}),l(d,{label:"加油时间"},{default:a(()=>[l(f,{modelValue:o.fuelDate,"onUpdate:modelValue":e[5]||(e[5]=t=>o.fuelDate=t),type:"datetime",placeholder:"选择时间"},null,8,["modelValue"])]),_:1}),l(d,{label:"油品"},{default:a(()=>[l(p,{modelValue:o.fuelType,"onUpdate:modelValue":e[6]||(e[6]=t=>o.fuelType=t),placeholder:"请选择油品"},{default:a(()=>[l(u,{label:"92#汽油",value:"92#汽油"}),l(u,{label:"95#汽油",value:"95#汽油"}),l(u,{label:"98#汽油",value:"98#汽油"}),l(u,{label:"0#柴油",value:"0#柴油"})]),_:1},8,["modelValue"])]),_:1}),l(d,{label:"加油量"},{default:a(()=>[l(k,{modelValue:o.fuelVolume,"onUpdate:modelValue":e[7]||(e[7]=t=>o.fuelVolume=t),min:0,precision:2,step:5},null,8,["modelValue"])]),_:1}),l(d,{label:"单价"},{default:a(()=>[l(k,{modelValue:o.unitPrice,"onUpdate:modelValue":e[8]||(e[8]=t=>o.unitPrice=t),min:0,precision:2,step:.1,onChange:P},null,8,["modelValue"])]),_:1}),l(d,{label:"总金额"},{default:a(()=>[l(k,{modelValue:o.cost,"onUpdate:modelValue":e[9]||(e[9]=t=>o.cost=t),min:0,precision:2,step:10,disabled:""},null,8,["modelValue"])]),_:1}),l(d,{label:"加油站"},{default:a(()=>[l(p,{modelValue:o.station,"onUpdate:modelValue":e[10]||(e[10]=t=>o.station=t),placeholder:"请选择加油站"},{default:a(()=>[l(u,{label:"中石化兖州站",value:"中石化兖州站"}),l(u,{label:"中石油济宁站",value:"中石油济宁站"}),l(u,{label:"壳牌加油站",value:"壳牌加油站"}),l(u,{label:"益海嘉里自营站",value:"益海嘉里自营站"})]),_:1},8,["modelValue"])]),_:1}),l(d,{label:"当前里程"},{default:a(()=>[l(k,{modelValue:o.currentMileage,"onUpdate:modelValue":e[11]||(e[11]=t=>o.currentMileage=t),min:0,step:100},null,8,["modelValue"])]),_:1})]),_:1},8,["model"])]),_:1},8,["modelValue","title"])])}}}),be=le(ie,[["__scopeId","data-v-d6987915"]]);export{be as default};
