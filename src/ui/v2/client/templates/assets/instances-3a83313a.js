import{_ as I,o as n,c as i,a as s,f as v,y as C,n as S,t as u,F as w,r as g,i as f,z as D,v as E,x as O,w as h,k as x,d as y,b as P,g as N,h as q,j as B}from"./_plugin-vue_export-helper-8cf34f94.js";import{u as j,_ as z,f as $,c as F}from"./api-c8d35a00.js";import{_ as b}from"./Base-dee1bee9.js";import{_ as L}from"./Base-db9c2a8d.js";const T={},A={xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"pointer-events-none w-5.5 h-5.5 stroke-white fill-sky-500"},M=s("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"},null,-1),V=[M];function G(m,c){return n(),i("svg",A,V)}const H=I(T,[["render",G]]),R={},J={xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"pointer-events-none w-6 h-6 stroke-white fill-red-500"},K=s("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"},null,-1),Q=[K];function U(m,c){return n(),i("svg",J,Q)}const W=I(R,[["render",U]]),X={class:"card-instance-container h-max"},Y={class:"w-full relative"},Z=["value"],ee={class:"grid grid-cols-12 items-center"},te={class:"col-span-10 flex items-center"},se={class:"card-instance-title"},ne={class:"absolute flex flex-col justify-end items-end right-0 top-0"},oe=["color","onClick","onPointerover","onPointerleave"],ae={class:"card-instance-info-container"},re={class:"card-instance-info-item"},ie={class:"card-instance-info-item-title"},le={class:"card-instance-info-item-content"},ce={class:"card-instance-actions-container"},de={__name:"Card",props:{id:{type:String,required:!0},serverName:{type:String,required:!0},hostname:{type:String,required:!0},method:{type:String,required:!0},port:{type:Number,required:!0},status:{type:String,required:!0}},emits:["action","delete"],setup(m,{emit:c}){const e=m,a=v({info:[{label:"hostname",text:e.hostname},{label:"method",text:e.method},{label:"port",text:e.port}],actions:e.status==="up"?[{name:"stop",color:"delete"},{name:"reload",color:"edit"},{name:"restart",color:"valid"}]:[{name:"reload",color:"edit"},{name:"restart",color:"valid"}],checks:[{name:"delete",class:"bg-red-500",svg:C(W),popup:!1,emit:"delete"},{name:"ping",class:"bg-sky-500",svg:C(H),popup:!1,emit:"action"}]});return(o,p)=>(n(),i("div",X,[s("div",Y,[s("input",{type:"hidden",name:"csrf_token",value:e.csrfToken},null,8,Z),s("div",ee,[s("div",te,[s("div",{class:S([[e.status==="up"?"bg-green-500":"bg-red-500"],"h-4 w-4 rounded-full"])},null,2),s("h5",se,u(e.serverName),1)])]),s("div",ne,[(n(!0),i(w,null,g(a.checks,t=>(n(),i("button",{color:t.color,onClick:_=>o.$emit(t.emit,t.emit==="action"?{hostname:e.hostname,operation:t.name}:e.hostname),onPointerover:_=>t.popup=!0,onPointerleave:_=>t.popup=!1,class:S([[t.popup?"pl-2 p-1":"w-10 p-1",`${t.class}`],"h-10 hover:brightness-95 dark:hover:brightness-90 ml-2 my-1 rounded-full p-1 scale-90"])},[(n(),f(D(t.svg))),E(s("span",{class:"text-normal font-normal mx-1 mr-2 text-white whitespace-nowrap"},u(t.name),513),[[O,t.popup]])],42,oe))),256))]),s("div",ae,[(n(!0),i(w,null,g(a.info,t=>(n(),i("div",re,[s("p",ie,u(t.label),1),s("p",le,u(t.text),1)]))),256))]),s("div",ce,[(n(!0),i(w,null,g(a.actions,t=>(n(),f(b,{color:t.color,onClick:_=>o.$emit("action",{hostname:e.hostname,operation:t.name}),size:"normal",class:"text-sm mx-1 my-1 w-full xs:w-fit max-w-[200px]"},{default:h(()=>[x(u(t.name),1)]),_:2},1032,["color","onClick"]))),256))])])]))}},me={class:"w-full"},ue={class:"flex justify-center"},pe={class:"modal-path"},_e={class:"modal-path-text"},he=s("input",{type:"hidden",name:"csrf_token",value:"{{ csrf_token() }}"},null,-1),fe={class:"mt-2 w-full justify-end flex"},ve={__name:"Delete",props:{hostname:{type:String,required:!0},isOpen:{type:Boolean,required:!0}},emits:["close","delete"],setup(m,{emit:c}){const e=m;return(a,o)=>e.isOpen?(n(),f(L,{key:0,title:"delete instance"},{default:h(()=>[s("div",me,[s("div",ue,[s("div",pe,[s("p",_e,u(`Are you sure to delete instance with hostname ${e.hostname} ?`),1)])]),he,s("div",fe,[y(b,{color:"close",size:"lg",onClick:o[0]||(o[0]=p=>a.$emit("close")),type:"button",class:"text-xs"},{default:h(()=>[x(" Close ")]),_:1}),y(b,{color:"delete",size:"lg",onClick:o[1]||(o[1]=()=>{a.$emit("close"),a.$emit("delete",{hostname:e.hostname})}),class:"text-xs ml-2"},{default:h(()=>[x(" DELETE ")]),_:1})])])]),_:1})):P("",!0)}},we={__name:"Instances",setup(m){const c=j(),e=v({delIsOpen:!1,pingIsOpen:!1,hostname:""});function a(d){e.hostname=d,e.delIsOpen=!0}const o=v({isPend:!1,isErr:!1,data:[],count:N(()=>o.data.length)});async function p(){await $("/api/instances","GET",null,o,c.addFeedback)}async function t(d){await $(`/api/instances/${d.hostname}/${d.operation}`,"POST",null,o,c.addFeedback),await p()}v({isPend:!1,isErr:!1,data:[]});async function _(d){await $(`/api/instances/${d.hostname}`,"DELETE",null,o,c.addFeedback),await p()}return q(async()=>{await p()}),(d,l)=>(n(),f(z,null,{default:h(()=>[(n(!0),i(w,null,g(o.data,r=>(n(),f(de,{id:r.server_name,serverName:r.server_name,hostname:r.hostname,port:r.port,method:r.method,status:r.status,onAction:l[0]||(l[0]=k=>t(k)),onDelete:l[1]||(l[1]=k=>a(k))},null,8,["id","serverName","hostname","port","method","status"]))),256)),y(ve,{onDelete:l[2]||(l[2]=r=>_(r)),onClose:l[3]||(l[3]=r=>e.delIsOpen=!1),isOpen:e.delIsOpen,hostname:e.hostname},null,8,["isOpen","hostname"])]),_:1}))}},ge=F();B(we).use(ge).mount("#app");