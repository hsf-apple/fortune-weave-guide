import fs from 'node:fs';
const raw=JSON.parse(fs.readFileSync('research/game8-quest-collection.json','utf8'));
const details=JSON.parse(fs.readFileSync('research/quest-details.json','utf8'));
const quests=raw.collectionArraySchema.collectionItems.map(({id,name,url,type,part,objective,requester,...rest})=>({id,name,url,type,part,objective,requester,...details[id],chapters:Object.fromEntries(['cai','dietrich','theodora','leda'].map(p=>[p,/^\d+$/.test(rest[p])?Number(rest[p]):null]))}));
fs.writeFileSync('src/questData.js',`// Game8 public quest collection 868, retrieved 13 October 2026. Missing chapters are unknown, not unavailable.\nexport const QUEST_SOURCE='https://game8.co/games/Fire-Emblem-Fortunes-Weave/archives/618792';\nexport const QUESTS=${JSON.stringify(quests,null,2)};\n`);
