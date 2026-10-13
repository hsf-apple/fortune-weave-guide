import fs from 'node:fs';
import facts from '../src/classData.js';
import {SUPPLEMENTAL_CLASSES} from '../src/supplementalClasses.js';
import {ADDITIONAL_GUIDES} from '../src/additionalGuides.js';
import {routeDefinitions,CHARACTERS} from '../src/catalog.js';

const classes=[...facts.classes,...SUPPLEMENTAL_CLASSES],known=new Set(classes.map(c=>c.id));
const aliases={'sword-master':'swordmaster','battle-master':'battlemaster','orichalda':'orichaldia'};
const slug=s=>s.toLowerCase().replaceAll(' ','-');
const resolve=s=>aliases[slug(s)]||slug(s);
const research=JSON.parse(fs.readFileSync('research/collected-guide-coverage.json','utf8'));
const keen=JSON.parse(fs.readFileSync('research/keengamer-class-targets.json','utf8'));
const jpAliases=fs.existsSync('research/japanese-class-aliases.json')?JSON.parse(fs.readFileSync('research/japanese-class-aliases.json','utf8')):{};
const records=research.characters.flatMap(c=>c.entries).concat(keen).flatMap(r=>r.routeGroups?[{...r,route:r.routeGroups.map(g=>g[0])},...(r.routeGroups.some(g=>g.length>1)?[{...r,route:r.routeGroups.map(g=>g.at(-1)),variant:'alternative'}]:[])]:[r]);
const guides=[],unresolved=[],seen=new Set();
for(const r of records){
 if(r.source==='encyclopedia'&&!r.route)continue;
 let stages=(r.route||r.routeJapanese?.map(n=>jpAliases[n])||[]).map(n=>n?resolve(n):null);
 const native=r.target?.startsWith('Keep Native');
 if(r.target&&!native)stages=[resolve(r.target.split(' / ')[0])];
 if(stages.some(s=>!known.has(s))){unresolved.push({...r,unresolvedClasses:stages.filter(s=>!known.has(s))});continue;}
 const key=r.character+':'+r.source+':'+stages.join('|');
 if(seen.has(key))continue;
 seen.add(key);
 if(ADDITIONAL_GUIDES.some(g=>g.character===r.character&&g.source===r.source&&g.stages.join('|')===stages.join('|')))continue;
 if(r.source==='keengamer'&&ADDITIONAL_GUIDES.some(g=>g.character===r.character&&g.source===r.source&&g.stages.at(-1)===stages[0]))continue;
 const endpoint=classes.find(c=>c.id===stages.at(-1));
 const type=native?'Keep your joining class':r.target?'Endgame class target':r.source==='game8'?(r.variant?'Published alternative route':'Published character route'):r.source==='game8jp'?'Japanese character route':r.source==='encyclopedia'?'Encyclopedia training idea':'Character guide route';
 const magic=/Wiseman|Bishop|Troubadour|Valkyrium/.test(endpoint?.name||''),offensive=/Druid|Ovate|High Savant/.test(endpoint?.name||'');
 guides.push({character:r.character,id:r.source+':'+r.character+':coverage-'+slug(type),source:r.source,name:type,role:native?'Use your joining role':magic?'Healing & support':offensive?'Magic attacker':endpoint?endpoint.name+' role':'Your current role',stages,url:r.url,checked:'12 October 2026',scope:r.scope||'Published route',why:native?'This source recommends keeping the class and ranks the character joins with. It does not specify a new class sequence.':r.target?'This reference supplies an endgame target. Add your own earlier training stages rather than treating this as a complete route.':'Use the source’s class direction as an editable starting point. Skip earlier steps when your character already meets the later requirements.',tradeoff:(r.alternative?'The source also lists '+r.alternative+'. ':'')+'Match your plan to recorded ranks, learned abilities and available class unlocks. Completing every stage is optional.',verification:r.source==='encyclopedia'?(r.aiGenerated?'Fan encyclopedia’s AI-generated training suggestion, not independently tested. Its linked source facts and its own recommendations are separate.':'Fan encyclopedia’s translated or aggregated training direction. It cites Japanese Game8 and is not independent in-game evidence.'):r.source==='compilation'?'Fan guide recommendation. Some profiles are compilations or editorial suggestions; not independently verified in-game. Keep disagreements with other publishers visible.':'Publisher recommendation, not independently verified in-game. Names mapped to shared class IDs; verify class exams and Divine assignments in-game.',loadout:[],equipment:[],milestones:[],adviceOnly:native});
}
fs.writeFileSync('src/comprehensiveGuides.js','// Source recommendations remain separate; unknown classes are held for review.\nexport const COMPREHENSIVE_GUIDES='+JSON.stringify(guides,null,2)+';\n');
const existing=ADDITIONAL_GUIDES.concat(guides).concat(Object.entries(routeDefinitions).flatMap(([character,defs])=>defs.map(([,stages])=>({character,source:'game8',stages:stages.map(resolve)}))));
const publishers=['game8','game8jp','keengamer','allthingshow','mobalytics','compilation','encyclopedia'];
const coverage=CHARACTERS.map(c=>({character:c.id,name:c.name,sources:Object.fromEntries(publishers.map(s=>[s,{count:existing.filter(g=>g.character===c.id&&g.source===s).length,status:existing.some(g=>g.character===c.id&&g.source===s)?'available':'No verified build imported; not a claim that none exists'}]))}));
const review=JSON.parse(fs.readFileSync('research/source-review-status.json','utf8'));
fs.writeFileSync('research/build-source-coverage.json',JSON.stringify({checkedOn:'2026-10-12',publisherChecks:review.publisherChecks,unresolved,characters:coverage},null,2)+'\n');
console.log(JSON.stringify({added:guides.length,charactersWithReferences:new Set(existing.map(g=>g.character)).size,unresolved:unresolved.length,bySource:Object.fromEntries(publishers.map(s=>[s,existing.filter(g=>g.source===s).length]))}));
