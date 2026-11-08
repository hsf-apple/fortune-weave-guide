import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CHARACTERS,PATHS,byId} from '../src/catalog.js';
import {PORTRAIT_FRAMES} from '../src/portraitFrames.js';
import {BUILDS,CLASSES} from '../src/buildData.js';
import {SOURCES} from '../src/sourceData.js';
test('every catalog character has a local WebP portrait and display frame',()=>{
 for(const character of CHARACTERS){
  assert.equal(character.portrait,`assets/portraits/${character.id}.webp`,character.name);
  const artwork=readFileSync(new URL(`../${character.portrait}`,import.meta.url));
  assert.equal(artwork.toString('ascii',0,4),'RIFF',character.name);
  assert.equal(artwork.toString('ascii',8,12),'WEBP',character.name);
  assert.ok(artwork.length>12,character.name);
  const frame=PORTRAIT_FRAMES[character.id];
  assert.ok(frame&&frame.height>0&&[frame.height,frame.top,frame.center].every(Number.isFinite),character.name);
 }
});
test('all mandatory members have guides and each source and class reference resolves',()=>{
 for(const path of PATHS)for(const id of path.mandatory){assert.ok(byId(id));assert.ok(BUILDS[id]?.length);}
 const ids=new Set();for(const guides of Object.values(BUILDS))for(const b of guides){assert.ok(!ids.has(b.id),'duplicate guide ID');ids.add(b.id);assert.ok(SOURCES[b.source]);assert.ok(b.url.startsWith('https://'));for(const id of b.stages){assert.ok(CLASSES[id]);assert.ok(SOURCES[CLASSES[id].source]);}}
});
test('disputed Dancer exam targets expose alternative-rank and unlock uncertainty',()=>{
 assert.match(CLASSES.dancer.uncertainty,/Bow B or Sword B/);assert.match(CLASSES.dancer.uncertainty,/not both mandatory/);assert.match(CLASSES.dancer.unlockNote,/Confirm exam/);
});
