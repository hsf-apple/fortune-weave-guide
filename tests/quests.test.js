import test from 'node:test';
import assert from 'node:assert/strict';
import {QUESTS} from '../src/questData.js';
import {emptyState,normalize,loadState,STORAGE_KEY} from '../src/model.js';

test('quest progress survives reload independently per path and preserves character records',()=>{
 const s=emptyState(),id=QUESTS[0].id;
 s.paths.cai.quests[id]=true;
 s.paths.cai.members.cai.level='12';
 const loaded=loadState({getItem:key=>key===STORAGE_KEY?JSON.stringify(s):null});
 assert.equal(loaded.paths.cai.quests[id],true);
 assert.deepEqual(loaded.paths.leda.quests,{});
 assert.equal(loaded.paths.cai.members.cai.level,'12');
 loaded.paths.cai.quests[id]=false;
 assert.equal(normalize(loaded).paths.cai.quests[id],undefined);
 assert.deepEqual(normalize({paths:{cai:{quests:{bogus:true,[id]:'true'}}}}).paths.cai.quests,{});
});
test('quest catalog has unique stable IDs, source links and explicit unknown chapters',()=>{
 assert.equal(QUESTS.length,174);
 assert.equal(new Set(QUESTS.map(q=>q.id)).size,QUESTS.length);
 for(const q of QUESTS){assert.ok(q.name&&q.objective&&q.requester);assert.ok(q.url.startsWith('https://game8.co/games/Fire-Emblem-Fortunes-Weave/archives/'));for(const chapter of Object.values(q.chapters))assert.ok(chapter===null||Number.isInteger(chapter));}
});

test('quest detail import preserves route-specific deadlines and known requirements',()=>{
 const hair=QUESTS.find(q=>q.id==='1583493');
 assert.equal(hair.location,'Crying Girl, Niraga Mine');
 assert.equal(hair.deadlines.cai,'2/28');
 assert.equal(hair.deadlines.leda,null);
 assert.equal(hair.rewards,'550 Gold 100 Renown');
 assert.equal(QUESTS.find(q=>q.id==='1584646').requirements,'Requires Renown Lv. 3');
 for(const q of QUESTS)for(const deadline of Object.values(q.deadlines||{}))assert.ok(deadline===null||/^\d{1,2}\/\d{1,2}$/.test(deadline));
});
