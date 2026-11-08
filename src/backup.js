import {PATHS,byId,RANKS} from './catalog.js';
import {normalize,STORAGE_KEY} from './model.js';

const FORMAT='fortune-weave-backup';
export const MAX_BACKUP_BYTES=5*1024*1024;
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const string=value=>typeof value==='string';
const strings=value=>Array.isArray(value)&&value.every(string);
const booleans=value=>object(value)&&Object.values(value).every(v=>typeof v==='boolean');
const ranks=value=>object(value)&&Object.values(value).every(v=>RANKS.includes(v));
const optional=(value,key,check)=>!Object.hasOwn(value,key)||check(value[key]);
const fields=(value,checks)=>object(value)&&Object.entries(checks).every(([key,check])=>optional(value,key,check));
const numberText=value=>string(value)||typeof value==='number'&&Number.isFinite(value);
const bounded=max=>value=>value===''||numberText(value)&&Number.isInteger(Number(value))&&Number(value)>=1&&Number(value)<=max;
const task=value=>fields(value,{id:numberText,label:string,done:v=>typeof v==='boolean'})&&string(value.label)&&numberText(value.id);
const manualEntry=value=>fields(value,{
 id:string,name:string,type:string,kind:string,note:string,effect:string,acquisition:string,
 classId:string,skill:string,requirements:ranks,level:numberText,units:strings,
 url:v=>string(v)&&/^https?:\/\//i.test(v),
})&&string(value.id)&&string(value.name);
const loadout=value=>fields(value,{
 equipmentPlan:strings,abilityPlan:strings,equippedEquipment:strings,equippedAbilities:strings,
 ownedEquipment:booleans,learnedAbilities:booleans,
 manualEquipment:v=>Array.isArray(v)&&v.every(manualEntry),manualAbilities:v=>Array.isArray(v)&&v.every(manualEntry),
});
const member=value=>fields(value,{
 favorite:v=>typeof v==='boolean',startingDefaults:v=>typeof v==='boolean',build:string,referenceChoice:string,
 currentClass:string,level:bounded(99),ranks,certified:booleans,mastered:booleans,milestones:booleans,loadout,
 customPlan:v=>fields(v,{stages:strings,role:string,notes:string,tasks:t=>Array.isArray(t)&&t.every(task)}),
});

function validateState(state){
 if(!object(state)||state.version!==2)throw new Error('This save version is not supported. Use a backup exported by this version of the companion.');
 if(!PATHS.some(p=>p.id===state.activePath)||!object(state.paths)||!optional(state,'revealed',booleans)||!optional(state,'rosterLayout',v=>['cards','table'].includes(v)))throw new Error('This backup contains invalid save settings.');
 for(const path of PATHS){
  const run=state.paths[path.id];
  if(!object(run)||!Array.isArray(run.roster)||!run.roster.every(id=>string(id)&&byId(id))||!object(run.members)||!Object.entries(run.members).every(([id,value])=>byId(id)&&member(value))||!run.roster.every(id=>Object.hasOwn(run.members,id))||!optional(run,'quests',booleans)||!fields(run.context,{part:v=>['I','II','III'].includes(v),chapter:bounded(99),renown:bounded(20)}))throw new Error(`The ${path.name} path is missing or damaged. Your current progress has not changed.`);
 }
}

export function createBackup(state,date=new Date()){
 validateState(state);
 const text=JSON.stringify({format:FORMAT,backupVersion:1,exportedAt:date.toISOString(),state},null,2);
 if(new TextEncoder().encode(text).length>MAX_BACKUP_BYTES)throw new Error('This save exceeds the 5 MB backup limit.');
 return {text,filename:`fortune-weave-backup-${date.toISOString().replace(/[:.]/g,'-')}.json`};
}

export function parseBackup(text){
 if(new TextEncoder().encode(text).length>MAX_BACKUP_BYTES)throw new Error('Choose a backup smaller than 5 MB.');
 let backup;
 try{
  backup=JSON.parse(text.replace(/^\uFEFF/,''),(key,value)=>{
   if(['__proto__','constructor','prototype'].includes(key))throw new Error('Unsafe field');
   return value;
  });
 }catch{throw new Error('This file is not a valid JSON backup. Choose a file exported by Fortune’s Weave.');}
 if(!object(backup)||backup.format!==FORMAT)throw new Error('This is not a Fortune’s Weave backup. Choose a file created with Export backup.');
 if(backup.backupVersion!==1)throw new Error('This backup format is not supported. Try a newer version of the companion.');
 if(!string(backup.exportedAt)||!Number.isFinite(Date.parse(backup.exportedAt)))throw new Error('This backup is missing a valid export date.');
 validateState(backup.state);
 return {state:normalize(backup.state),exportedAt:backup.exportedAt};
}

export function backupSummary(state){
 return PATHS.map(path=>({id:path.id,name:path.name,characters:state.paths[path.id].roster.length,quests:Object.values(state.paths[path.id].quests||{}).filter(Boolean).length}));
}

// Persist first so an unavailable/full browser store cannot replace the active run.
export function saveRestoredState(storage,state){
 validateState(state);
 storage.setItem(STORAGE_KEY,JSON.stringify(state));
}

export function downloadBackup(state){
 const {text,filename}=createBackup(state),url=URL.createObjectURL(new Blob([text],{type:'application/json'})),link=document.createElement('a');
 link.href=url;link.download=filename;
 document.body.append(link);
 try{link.click();}finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
}
