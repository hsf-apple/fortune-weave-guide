import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyState,normalize,updateMember} from '../src/model.js';
import {emptyLoadout,guideLoadout,normalizeLoadout,abilityLearned} from '../src/loadoutModel.js';
import {BUILDS} from '../src/buildData.js';

test('new characters have an empty custom plan with documented defaults and unknown ranks',()=>{
 const member=emptyState().paths.cai.members.cai;
 assert.equal(member.referenceChoice,'custom');assert.deepEqual(member.customPlan.stages,[]);
 assert.equal(member.level,'1');assert.deepEqual(member.ranks,{});
});
test('browsing references and resetting the plan preserve actual stats, mastery and loadout',()=>{
 const state=emptyState(),member=state.paths.cai.members.cai;
 member.level='42';member.ranks={spear:'A'};member.mastered={bardinger:true};
 member.loadout={...emptyLoadout(),equippedEquipment:['custom:spear'],ownedEquipment:{'custom:spear':true}};
 member.customPlan={stages:['bardinger'],role:'My role',notes:'Keep this',tasks:[]};
 const browsing=updateMember(state,'cai','cai',{referenceChoice:BUILDS.cai[1].id});
 assert.deepEqual(browsing.paths.cai.members.cai.customPlan,member.customPlan);
 const reset=updateMember(browsing,'cai','cai',{build:'',referenceChoice:'custom',customPlan:{stages:[],role:'',notes:'',tasks:[]}}).paths.cai.members.cai;
 assert.equal(reset.level,'42');assert.deepEqual(reset.ranks,{spear:'A'});assert.deepEqual(reset.mastered,{bardinger:true});assert.deepEqual(reset.loadout,member.loadout);
});
test('copying guide goals preserves owned, learned, equipped and manual records',()=>{
 const previous={...emptyLoadout(),equipmentPlan:['old'],abilityPlan:['old'],equippedEquipment:['custom:spear'],equippedAbilities:['custom:skill'],ownedEquipment:{'custom:spear':true},learnedAbilities:{'custom:skill':true},manualEquipment:[{id:'custom:spear',name:'My spear'}],manualAbilities:[{id:'custom:skill',name:'My skill'}]};
 const copied=guideLoadout({equipment:['iron-spear'],abilityGoals:['mastery:bardinger'],stages:['bardinger']},previous);
 assert.deepEqual(copied.equipmentPlan,['iron-spear']);assert.deepEqual(copied.abilityPlan,['mastery:bardinger']);
 for(const key of ['equippedEquipment','equippedAbilities','ownedEquipment','learnedAbilities','manualEquipment','manualAbilities'])assert.deepEqual(copied[key],previous[key]);
 assert.deepEqual(previous.equipmentPlan,['old']);
});
test('once migrated, unchecked ownership is not resurrected from legacy milestones',()=>{
 const migrated=normalizeLoadout(null,{'gear:iron-spear':true});assert.equal(migrated.ownedEquipment['iron-spear'],true);
 delete migrated.ownedEquipment['iron-spear'];assert.equal(normalizeLoadout(migrated,{'gear:iron-spear':true}).ownedEquipment['iron-spear'],undefined);
});
test('learned mastery is available independently of reference choice or custom route',()=>{
 const member={mastered:{bardinger:true},customPlan:{stages:[]},referenceChoice:'custom'};
 assert.equal(abilityLearned({classId:'bardinger'},member,emptyLoadout()),true);
 const restored=normalize({paths:{cai:{members:{cai:{...emptyState().paths.cai.members.cai,level:'42',customPlan:{stages:[],role:'',notes:'',tasks:[]},mastered:{bardinger:true}}}}}});
 assert.equal(restored.paths.cai.members.cai.level,'42');assert.equal(restored.paths.cai.members.cai.mastered.bardinger,true);
});
