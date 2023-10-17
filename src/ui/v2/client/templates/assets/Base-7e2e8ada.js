import{o as r,c as n,k as f,t as i,b as o,v as u,x as b,d as g,e as d,f as v,B as y,a as c,n as _,i as x}from"./_plugin-vue_export-helper-8cf34f94.js";const h=["for"],q={key:0},S={__name:"Label",props:{label:{type:String,required:!0},name:{type:String,required:!0},version:{type:String,required:!0}},setup(s){const e=s;return(t,a)=>(r(),n("label",{for:e.name,class:"my-1 transition duration-300 ease-in-out text-sm sm:text-md font-bold m-0 dark:text-gray-300"},[f(i(e.label)+" ",1),e.version?(r(),n("span",q,i(e.version),1)):o("",!0)],8,h))}},$={class:"col-span-12 flex flex-col px-2 py-1"},E={__name:"Layout",props:{label:{type:String,required:!0},name:{type:String,required:!0},version:{type:String,required:!1,default:""},noLabel:{type:Boolean,required:!1,default:!1}},setup(s){const e=s;return(t,a)=>(r(),n("div",$,[u(g(S,{label:e.label,name:e.name,version:e.version},null,8,["label","name","version"]),[[b,!e.noLabel]]),d(t.$slots,"default")]))}},k={class:"relative flex items-center"},B=["type","id","required","disabled","placeholder","pattern","name","value"],w={__name:"Input",props:{settings:{type:Object,required:!0},inpClass:{type:String,required:!1}},emits:["inp"],setup(s,{emit:e}){const t=s,a=v({value:t.settings.value});return(m,l)=>(r(),n("div",k,[u(c("input",{"onUpdate:modelValue":l[0]||(l[0]=p=>a.value=p),onInput:l[1]||(l[1]=p=>m.$emit("inp",a.value)),type:t.settings.type,id:t.settings.id,class:_(["input-regular",t.inpClass]),required:!!(t.settings.id==="SERVER_NAME"||t.settings.required),disabled:t.settings.disabled||!1,placeholder:t.settings.placeholder||"",pattern:t.settings.pattern||"(?s).*",name:t.settings.id,value:a.value},null,42,B),[[y,a.value]])]))}},V={key:0,class:"col-span-12 uppercase text-xl mb-2 mx-2 font-bold dark:text-white/90"},L={__name:"Label",props:{label:{type:String,required:!1}},setup(s){const e=s;return(t,a)=>e.label?(r(),n("h2",V,i(e.label),1)):o("",!0)}},N={class:"col-span-12 grid grid-cols-12 justify-start"},D={__name:"Base",props:{label:{type:String,required:!1},color:{type:String,required:!1,default:"default"}},setup(s){const e=s;return(t,a)=>(r(),n("div",{class:_([[`${e.color}`],"card grid grid-cols-12"])},[c("div",N,[e.label?(r(),x(L,{key:0,label:e.label},null,8,["label"])):o("",!0),d(t.$slots,"default")])],2))}};export{E as _,w as a,D as b,L as c};