import test from 'node:test';
import assert from 'node:assert/strict';
import {getGoal} from '../src/model.js';
import {rosterNextAction} from '../src/rosterNextAction.js';

const classes={target:{name:'Target',requirements:{sword:'C',axe:'C','heavy-armor':'C'}}};
const build={stages:['target']},context={part:'III'};
function actions(ranks){const member={ranks,certified:{}};return rosterNextAction(getGoal(build,member,context,classes),member,context);}
test('table shows all three outstanding skills and hides each completed target',()=>{
 assert.deepEqual(actions({sword:'E',axe:'D','heavy-armor':'E'}),['Sword E → C','Axe D → C','Heavy Armor E → C']);
 assert.deepEqual(actions({sword:'C',axe:'B','heavy-armor':'E'}),['Heavy Armor E → C']);
 assert.deepEqual(actions({sword:'C',axe:'B','heavy-armor':'C'}),[]);
});
test('unknown ranks and known training gaps appear together',()=>{
 assert.deepEqual(actions({axe:'D','heavy-armor':'C'}),['Sword Unknown → C','Axe D → C']);
});
test('alternative exam warnings do not hide outstanding rank targets',()=>{
 assert.deepEqual(rosterNextAction({class:{uncertainty:'selectable targets'},gaps:[['sword','C'],['axe','C']]},{ranks:{}},context),['Sword Unknown → C','Axe Unknown → C']);
});

test('column excludes chapter, Renown, unlock and exam actions',()=>{
 const member={ranks:{sword:'E'},certified:{}};
 const goal={class:{renown:5,noExam:true},gaps:[['sword','C']],phaseBlocked:true,renownGap:true,levelGap:true};
 assert.deepEqual(rosterNextAction(goal,member,{part:'I',renown:'1'}),['Sword E → C']);
 assert.deepEqual(rosterNextAction({...goal,gaps:[]},member),[]);
 assert.deepEqual(rosterNextAction(null,member),[]);
 assert.deepEqual(rosterNextAction({complete:true},member),[]);
});
