import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyState,emptyMember,normalize,migrateLegacy,setAchievement,updateMember,getGoal,rankMet} from '../src/model.js';
import {BUILDS,CLASSES} from '../src/buildData.js';
test('legacy Cai mastery and recruited roster survive migration into independent paths',()=>{
 const migrated=migrateLegacy({path:'cai',revealed:{anatolia:true},paths:{cai:{roster:['guzran'],members:{cai:{progress:{'class:light-cavalry:bolster-health':'Mastered'}}}}}},null);
 assert.ok(migrated.paths.cai.roster.includes('guzran'));assert.equal(migrated.paths.cai.members.cai.certified['light-cavalry'],true);assert.equal(migrated.paths.cai.members.cai.mastered['light-cavalry'],true);assert.ok(!migrated.paths.dietrich.roster.includes('guzran'));assert.equal(migrated.revealed.anatolia,true);
});
test('mandatory roster members are restored and invalid saved values rejected',()=>{
 const s=normalize({activePath:'bad',paths:{cai:{roster:['missing'],members:{cai:{level:-2,ranks:{spear:'Z'},mastered:{bardinger:true}}}}}});
 assert.equal(s.activePath,'cai');assert.equal(s.paths.cai.roster.length,4);assert.equal(s.paths.cai.members.cai.level,'');assert.deepEqual(s.paths.cai.members.cai.ranks,{});assert.equal(s.paths.cai.members.cai.certified.bardinger,true);
});
test('path edits do not affect another version of the same character',()=>{
 const s=emptyState();s.paths.dietrich.members.cai=emptyMember();const next=updateMember(s,'cai','cai',{ranks:{spear:'A'}});
 assert.equal(next.paths.cai.members.cai.ranks.spear,'A');assert.equal(next.paths.dietrich.members.cai.ranks.spear,undefined);assert.equal(s.paths.cai.members.cai.ranks.spear,undefined);
});
test('mastery implies certification and undoing certification clears contradictory state',()=>{
 const m=setAchievement(emptyMember(),'light-cavalry','mastered',true);assert.equal(m.certified['light-cavalry'],true);const n=setAchievement({...m,currentClass:'light-cavalry'},'light-cavalry','certified',false);assert.equal(n.mastered['light-cavalry'],false);assert.equal(n.currentClass,'');
});
test('switching source guides preserves shared class facts and previously earned rewards',()=>{
 const m={...emptyMember(),certified:{'ornius-rider':true,'light-cavalry':true,bardinger:true},mastered:{'light-cavalry':true}};
 const alternative={...BUILDS.cai[1],id:'another-publisher:cai:hybrid',source:'another-publisher'};const goal=getGoal(alternative,{...m,build:alternative.id},{part:'I'},CLASSES);assert.equal(goal.cid,'caladrius');assert.equal(m.mastered['light-cavalry'],true);assert.equal(getGoal(BUILDS.cai[0],m,{part:'I'},CLASSES).cid,'orichaldia');
});
test('unknown ranks do not become falsely ready and plus ranks sort correctly',()=>{
 const g=getGoal(BUILDS.cai[0],emptyMember(),{part:'I'},CLASSES);assert.ok(g.unknown.length);assert.equal(rankMet('','E'),false);assert.equal(rankMet('C+','C'),true);assert.equal(rankMet('B','B+'),false);
});
test('master class phase and recorded Renown affect coaching independently of skill targets',()=>{
 const m={...emptyMember(),certified:{'ornius-rider':true,'light-cavalry':true,bardinger:true},ranks:{riding:'B',spear:'A',sword:'A'}};
 assert.equal(getGoal(BUILDS.cai[0],m,{part:'I'},CLASSES).phaseBlocked,true);assert.equal(getGoal(BUILDS.cai[0],m,{part:'III'},CLASSES).phaseBlocked,false);
 const n={...emptyMember(),certified:{'ornius-rider':true},ranks:{riding:'D',spear:'C',sword:'C'}};assert.ok(getGoal(BUILDS.cai[0],n,{part:'I',renown:'2'},CLASSES).renownGap);
});
test('every mandatory guide references known, source-checked classes',()=>{
 for(const builds of Object.values(BUILDS))for(const b of builds){assert.equal(b.stages.length,4);for(const id of b.stages){assert.ok(CLASSES[id],id);assert.match(CLASSES[id].url,/^https:\/\/game8.co\//);}}
});
