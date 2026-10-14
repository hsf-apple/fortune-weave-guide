import test from 'node:test';
import assert from 'node:assert/strict';
import {getGoal} from '../src/model.js';
import {rosterNextAction} from '../src/rosterNextAction.js';

const classes={target:{name:'Target',requirements:{sword:'C',axe:'C','heavy-armor':'C'}}};
const build={stages:['target']},context={part:'III'};
function actions(ranks){const member={ranks,certified:{}};return rosterNextAction(getGoal(build,member,context,classes),member,context);}
test('table shows all three outstanding skills and hides each completed target',()=>{
 assert.deepEqual(actions({sword:'E',axe:'D','heavy-armor':'E'}),['Train Sword E → C','Train Axe D → C','Train Heavy Armor E → C']);
 assert.deepEqual(actions({sword:'C',axe:'B','heavy-armor':'E'}),['Train Heavy Armor E → C']);
 assert.deepEqual(actions({sword:'C',axe:'B','heavy-armor':'C'}),['Check certification in-game']);
});
test('unknown ranks and known training gaps appear together',()=>{
 assert.deepEqual(actions({axe:'D','heavy-armor':'C'}),['Record Sword rank (target C)','Train Axe D → C']);
});
test('alternative exam targets require verification rather than training every alternative',()=>{
 assert.deepEqual(rosterNextAction({class:{uncertainty:'selectable targets'},gaps:[['sword','C'],['axe','C']]},{ranks:{}},context),['Verify exam skill targets']);
});
