import test from 'node:test';
import assert from 'node:assert/strict';
import {PATHS,byId} from '../src/catalog.js';
import {BUILDS,CLASSES} from '../src/buildData.js';
import {SOURCES} from '../src/sourceData.js';
test('all mandatory members have guides and each source and class reference resolves',()=>{
 for(const path of PATHS)for(const id of path.mandatory){assert.ok(byId(id));assert.ok(BUILDS[id]?.length);}
 const ids=new Set();for(const guides of Object.values(BUILDS))for(const b of guides){assert.ok(!ids.has(b.id),'duplicate guide ID');ids.add(b.id);assert.ok(SOURCES[b.source]);assert.ok(b.url.startsWith('https://'));for(const id of b.stages){assert.ok(CLASSES[id]);assert.ok(SOURCES[CLASSES[id].source]);}}
});
test('Dancer special unlock never masquerades as a standard exam',()=>{
 assert.equal(CLASSES.dancer.noExam,true);assert.deepEqual(CLASSES.dancer.requirements,{});assert.match(CLASSES.dancer.unlockNote,/Necklace/);
});
