import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyState,emptyMember,normalize,loadState,STORAGE_KEY} from '../src/model.js';
import {QUESTS} from '../src/questData.js';
import {createBackup,parseBackup,backupSummary,saveRestoredState,MAX_BACKUP_BYTES} from '../src/backup.js';

function populatedState(){
 const state=emptyState();state.activePath='leda';state.rosterLayout='table';state.revealed.anatolia=true;
 for(const [index,run] of Object.values(state.paths).entries()){
  run.roster.push('guzran');run.members.guzran=emptyMember();
  const m=run.members.guzran;m.level=String(20+index);m.currentClass='light-cavalry';m.ranks={spear:'B+',riding:'A'};
  m.favorite=true;m.build='reference-choice';m.referenceChoice='custom';
  m.certified={'light-cavalry':true};m.mastered={'light-cavalry':true};m.milestones={'gear:iron-spear':true};
  m.customPlan={stages:['light-cavalry','bardinger'],role:'Support',notes:'Keep this note 日本語',tasks:[{id:'task-1',label:'Train riding',done:true}]};
  m.loadout={equipmentPlan:['manual:spear'],abilityPlan:['manual:ability'],equippedEquipment:['manual:spear'],equippedAbilities:['manual:ability'],ownedEquipment:{'manual:spear':true},learnedAbilities:{'manual:ability':true},manualEquipment:[{id:'manual:spear',name:'My spear',type:'Weapon',requirements:{spear:'B'},note:'My note'}],manualAbilities:[{id:'manual:ability',name:'My ability',kind:'Custom',effect:'A helpful effect',acquisition:'Learn it',note:'Personal entry'}]};
  run.context={part:'III',chapter:String(10+index),renown:'12'};run.quests={[QUESTS[0].id]:true};
 }
 // Removed allies retain progress and an intentionally empty roster stays empty.
 state.paths.cai.roster=[];
 return state;
}

test('backup survives loss of browser storage and restores the full run on every path',()=>{
 const original=populatedState(),backup=createBackup(original,new Date('2026-11-08T12:34:56.000Z'));
 assert.match(backup.filename,/^fortune-weave-backup-2026-11-08T12-34-56-000Z.json$/);
 const parsed=parseBackup(backup.text);assert.equal(parsed.exportedAt,'2026-11-08T12:34:56.000Z');
 const store=new Map();assert.deepEqual(loadState({getItem:key=>store.get(key)}),emptyState());
 saveRestoredState({setItem:(key,value)=>store.set(key,value)},parsed.state);
 assert.deepEqual(loadState({getItem:key=>store.get(key)}),normalize(original));
 assert.deepEqual(original,populatedState());
 assert.equal(backupSummary(parsed.state)[0].characters,0);
 assert.ok(backupSummary(parsed.state).every(path=>path.quests===1));
});

test('invalid, unrelated, incomplete and future backups are rejected without modifying a save',()=>{
 const original=populatedState(),text=createBackup(original).text;
 for(const value of ['','{','null','[]','{}',JSON.stringify(original)])assert.throws(()=>parseBackup(value));
 const edits=[
  b=>b.format='another-app',b=>b.backupVersion=2,b=>b.state.version=3,b=>b.exportedAt='invalid',
  b=>delete b.state.paths.leda,b=>b.state.paths.cai.roster=null,b=>b.state.paths.cai.members.guzran=null,
  b=>b.state.paths.cai.members.guzran.customPlan.tasks=[{label:{bad:true}}],
  b=>b.state.paths.cai.members.guzran.loadout.manualAbilities[0].effect={},
  b=>b.state.paths.cai.members.guzran.loadout.manualAbilities[0].url='javascript:alert(1)',
  b=>b.state.paths.cai.members.guzran.ranks.spear='Z',
  b=>b.state.paths.cai.members.guzran.level=100,b=>b.state.paths.cai.context.chapter='invalid',
  b=>b.state.paths.leda.members={},b=>b.state.paths.cai.context=[],
 ];
 for(const edit of edits){const damaged=JSON.parse(text);edit(damaged);assert.throws(()=>parseBackup(JSON.stringify(damaged)));}
 assert.deepEqual(original,populatedState());
});

test('oversized files and prototype fields are rejected; UTF-8 BOM is accepted',()=>{
 assert.throws(()=>parseBackup(' '.repeat(MAX_BACKUP_BYTES+1)),/5 MB/);
 assert.throws(()=>parseBackup('日'.repeat(Math.ceil(MAX_BACKUP_BYTES/3))),/5 MB/);
 assert.throws(()=>parseBackup('{"__proto__":{"polluted":true}}'),/valid JSON/);
 assert.equal({}.polluted,undefined);
 const {text}=createBackup(emptyState());assert.deepEqual(parseBackup('\uFEFF'+text).state,normalize(emptyState()));
});

test('storage failure leaves the previous saved data and candidate state intact',()=>{
 const previous=JSON.stringify(emptyState()),candidate=parseBackup(createBackup(populatedState()).text).state;
 let stored=previous;
 assert.throws(()=>saveRestoredState({setItem:()=>{throw new Error('QuotaExceededError');}},candidate),/QuotaExceededError/);
 assert.equal(stored,previous);
 saveRestoredState({setItem:(key,value)=>{assert.equal(key,STORAGE_KEY);stored=value;}},candidate);
 assert.deepEqual(JSON.parse(stored),candidate);
});

test('unticked progress and removed mandatory members do not reappear after restore',()=>{
 const state=emptyState();state.paths.cai.roster=[];state.paths.cai.members.cai.certified.bardinger=false;state.paths.cai.members.cai.mastered.bardinger=false;
 const restored=parseBackup(createBackup(state).text).state;
 assert.deepEqual(restored.paths.cai.roster,[]);assert.equal(restored.paths.cai.members.cai.certified.bardinger,undefined);
 assert.equal(restored.paths.cai.members.cai.mastered.bardinger,undefined);
});
