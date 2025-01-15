import{d as B,r as w,B as T,h as k,e,w as t,b as m,o as b,f as y,j as _,a as S,g as C,E as r,H as F,_ as N}from"./index-Dj8K2Q4U.js";import{M as z}from"./mock-BnFOwhRk.js";const E=z.mock({settings:{company:{name:"益海嘉里（兖州）粮油工业有限公司",address:"山东省济宁市兖州区新兖镇新驿大道",contact:"0537-1234567",logo:'@image("200x200")'},system:{name:"车辆管理系统",version:"1.0.0",theme:"light",pageSize:20,dateFormat:"YYYY-MM-DD",timeFormat:"HH:mm:ss"},notification:{maintenanceReminder:7,inspectionReminder:30,insuranceReminder:30,licenseReminder:30},backup:{autoBackup:!0,backupTime:"03:00",backupRetention:30,lastBackupTime:'@datetime("yyyy-MM-dd HH:mm:ss")'}}}),I={class:"settings"},j={class:"card-header"},L=["src"],O=B({__name:"Settings",setup(q){const V=w("company"),a=T(E.settings),Y=()=>{r.success("设置保存成功")},v=()=>{r.success("数据备份已开始，请稍候..."),setTimeout(()=>{a.backup.lastBackupTime=new Date().toISOString(),r.success("数据备份完成")},2e3)},g=()=>{r.warning("该功能需要在实际项目中实现")};return(A,l)=>{const c=m("el-button"),u=m("el-input"),n=m("el-form-item"),M=m("el-icon"),U=m("el-upload"),i=m("el-form"),p=m("el-tab-pane"),d=m("el-option"),f=m("el-select"),s=m("el-input-number"),x=m("el-switch"),D=m("el-time-picker"),R=m("el-tabs"),H=m("el-card");return b(),k("div",I,[e(H,null,{header:t(()=>[y("div",j,[l[19]||(l[19]=y("span",null,"系统设置",-1)),e(c,{type:"primary",onClick:Y},{default:t(()=>l[18]||(l[18]=[_("保存设置")])),_:1})])]),default:t(()=>[e(R,{modelValue:V.value,"onUpdate:modelValue":l[17]||(l[17]=o=>V.value=o)},{default:t(()=>[e(p,{label:"公司信息",name:"company"},{default:t(()=>[e(i,{model:a.company,"label-width":"120px"},{default:t(()=>[e(n,{label:"公司名称"},{default:t(()=>[e(u,{modelValue:a.company.name,"onUpdate:modelValue":l[0]||(l[0]=o=>a.company.name=o)},null,8,["modelValue"])]),_:1}),e(n,{label:"公司地址"},{default:t(()=>[e(u,{modelValue:a.company.address,"onUpdate:modelValue":l[1]||(l[1]=o=>a.company.address=o)},null,8,["modelValue"])]),_:1}),e(n,{label:"联系电话"},{default:t(()=>[e(u,{modelValue:a.company.contact,"onUpdate:modelValue":l[2]||(l[2]=o=>a.company.contact=o)},null,8,["modelValue"])]),_:1}),e(n,{label:"公司Logo"},{default:t(()=>[e(U,{class:"avatar-uploader",action:"#","show-file-list":!1,"auto-upload":!1},{default:t(()=>[a.company.logo?(b(),k("img",{key:0,src:a.company.logo,class:"avatar"},null,8,L)):(b(),S(M,{key:1,class:"avatar-uploader-icon"},{default:t(()=>[e(C(F))]),_:1}))]),_:1})]),_:1})]),_:1},8,["model"])]),_:1}),e(p,{label:"系统参数",name:"system"},{default:t(()=>[e(i,{model:a.system,"label-width":"120px"},{default:t(()=>[e(n,{label:"系统名称"},{default:t(()=>[e(u,{modelValue:a.system.name,"onUpdate:modelValue":l[3]||(l[3]=o=>a.system.name=o)},null,8,["modelValue"])]),_:1}),e(n,{label:"系统版本"},{default:t(()=>[e(u,{modelValue:a.system.version,"onUpdate:modelValue":l[4]||(l[4]=o=>a.system.version=o),disabled:""},null,8,["modelValue"])]),_:1}),e(n,{label:"主题设置"},{default:t(()=>[e(f,{modelValue:a.system.theme,"onUpdate:modelValue":l[5]||(l[5]=o=>a.system.theme=o)},{default:t(()=>[e(d,{label:"浅色",value:"light"}),e(d,{label:"深色",value:"dark"})]),_:1},8,["modelValue"])]),_:1}),e(n,{label:"每页显示条数"},{default:t(()=>[e(s,{modelValue:a.system.pageSize,"onUpdate:modelValue":l[6]||(l[6]=o=>a.system.pageSize=o),min:10,max:100,step:10},null,8,["modelValue"])]),_:1}),e(n,{label:"日期格式"},{default:t(()=>[e(f,{modelValue:a.system.dateFormat,"onUpdate:modelValue":l[7]||(l[7]=o=>a.system.dateFormat=o)},{default:t(()=>[e(d,{label:"YYYY-MM-DD",value:"YYYY-MM-DD"}),e(d,{label:"YYYY/MM/DD",value:"YYYY/MM/DD"}),e(d,{label:"DD/MM/YYYY",value:"DD/MM/YYYY"})]),_:1},8,["modelValue"])]),_:1}),e(n,{label:"时间格式"},{default:t(()=>[e(f,{modelValue:a.system.timeFormat,"onUpdate:modelValue":l[8]||(l[8]=o=>a.system.timeFormat=o)},{default:t(()=>[e(d,{label:"HH:mm:ss",value:"HH:mm:ss"}),e(d,{label:"HH:mm",value:"HH:mm"}),e(d,{label:"hh:mm:ss a",value:"hh:mm:ss a"})]),_:1},8,["modelValue"])]),_:1})]),_:1},8,["model"])]),_:1}),e(p,{label:"提醒设置",name:"notification"},{default:t(()=>[e(i,{model:a.notification,"label-width":"120px"},{default:t(()=>[e(n,{label:"保养提醒天数"},{default:t(()=>[e(s,{modelValue:a.notification.maintenanceReminder,"onUpdate:modelValue":l[9]||(l[9]=o=>a.notification.maintenanceReminder=o),min:1,max:30},null,8,["modelValue"])]),_:1}),e(n,{label:"年检提醒天数"},{default:t(()=>[e(s,{modelValue:a.notification.inspectionReminder,"onUpdate:modelValue":l[10]||(l[10]=o=>a.notification.inspectionReminder=o),min:1,max:90},null,8,["modelValue"])]),_:1}),e(n,{label:"保险提醒天数"},{default:t(()=>[e(s,{modelValue:a.notification.insuranceReminder,"onUpdate:modelValue":l[11]||(l[11]=o=>a.notification.insuranceReminder=o),min:1,max:90},null,8,["modelValue"])]),_:1}),e(n,{label:"证照提醒天数"},{default:t(()=>[e(s,{modelValue:a.notification.licenseReminder,"onUpdate:modelValue":l[12]||(l[12]=o=>a.notification.licenseReminder=o),min:1,max:90},null,8,["modelValue"])]),_:1})]),_:1},8,["model"])]),_:1}),e(p,{label:"备份设置",name:"backup"},{default:t(()=>[e(i,{model:a.backup,"label-width":"120px"},{default:t(()=>[e(n,{label:"自动备份"},{default:t(()=>[e(x,{modelValue:a.backup.autoBackup,"onUpdate:modelValue":l[13]||(l[13]=o=>a.backup.autoBackup=o)},null,8,["modelValue"])]),_:1}),e(n,{label:"备份时间"},{default:t(()=>[e(D,{modelValue:a.backup.backupTime,"onUpdate:modelValue":l[14]||(l[14]=o=>a.backup.backupTime=o),format:"HH:mm"},null,8,["modelValue"])]),_:1}),e(n,{label:"备份保留天数"},{default:t(()=>[e(s,{modelValue:a.backup.backupRetention,"onUpdate:modelValue":l[15]||(l[15]=o=>a.backup.backupRetention=o),min:1,max:365},null,8,["modelValue"])]),_:1}),e(n,{label:"上次备份时间"},{default:t(()=>[e(u,{modelValue:a.backup.lastBackupTime,"onUpdate:modelValue":l[16]||(l[16]=o=>a.backup.lastBackupTime=o),disabled:""},null,8,["modelValue"])]),_:1}),e(n,null,{default:t(()=>[e(c,{type:"primary",onClick:v},{default:t(()=>l[20]||(l[20]=[_("立即备份")])),_:1}),e(c,{type:"success",onClick:g},{default:t(()=>l[21]||(l[21]=[_("恢复数据")])),_:1})]),_:1})]),_:1},8,["model"])]),_:1})]),_:1},8,["modelValue"])]),_:1})])}}}),K=N(O,[["__scopeId","data-v-d41ad741"]]);export{K as default};