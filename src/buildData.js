import {SUPPLEMENTAL_CLASSES} from './supplementalClasses.js';
import facts from './classData.js';
import {routeDefinitions,coaching,ROLES,slug} from './catalog.js';
import {ADDITIONAL_GUIDES} from './additionalGuides.js';
import {COMPREHENSIVE_GUIDES} from './comprehensiveGuides.js';
import {enrichGuides} from './guideEditorial.js';
import {GUIDE_EQUIPMENT} from './equipmentData.js';
export const SKILLS={sword:'Sword',spear:'Spear',axe:'Axe',bow:'Bow',gauntlet:'Gauntlet','white-magic':'White Magic','black-magic':'Black Magic',riding:'Riding',flying:'Flying','heavy-armor':'Heavy Armor',infantry:'Infantry',authority:'Authority'};
export const CLASSES=Object.fromEntries(facts.classes.map(c=>[c.id,{...c,source:'game8',noExam:c.id==='dancer'}]));
for(const c of SUPPLEMENTAL_CLASSES)CLASSES[c.id]=c;
// New source comparison exposes a conflict with the older special-unlock record.
Object.assign(CLASSES.dancer,{requirements:{bow:'B',sword:'B'},idealLevel:35,renown:8,noExam:false,source:'gamewith',url:'https://gamewith.jp/fefw/573025',unlockNote:'Reported unlock: Leda Part I Chapter 9 quest, with wider availability in Part III. Confirm exam, license and assignment in-game.',uncertainty:'GameWith lists Bow B or Sword B as selectable targets, not both mandatory. Older sources describe a special unlock; check the actual exam before training.'});

const CLASS_TIER_ORDER=['Beginner','Specialty','Advanced','Master','Divine'];
export const SORTED_CLASSES=Object.values(CLASSES).sort((a,b)=>{
 const tierA=CLASS_TIER_ORDER.indexOf(a.tier),tierB=CLASS_TIER_ORDER.indexOf(b.tier);
 return (tierA<0?99:tierA)-(tierB<0?99:tierB)||a.name.localeCompare(b.name);
});

export const BUILDS=Object.fromEntries(Object.entries(routeDefinitions).map(([id,definitions])=>[id,definitions.map(([name,route])=>({
 id:'game8:'+id+':'+slug(name),source:'game8',name,role:ROLES[id],stages:route.map(slug),
 url:facts.routeSource,checked:'12 October 2026',scope:'Beginner through Master',
 why:coaching[id]?.why||`Develop a clear ${ROLES[id].toLowerCase()} role with the listed Game8 class route.`,
 tradeoff:coaching[id]?.tradeoff||'Later classes may add new skill targets or quests. Start the next training investment early; completing every mastery is optional.',
 loadout:coaching[id]?.loadout||genericLoadout(id,route),
 milestones:coaching[id]?.milestones||[],equipment:GUIDE_EQUIPMENT[id]||[],
 verification:'Prebuilt route from Game8. Build names, coaching and equipment suggestions are this companion’s interpretation. Listed secondary skills may be alternatives; check your exam screen.'
}))]));
function genericLoadout(id,route){const skills=new Set(route.flatMap(n=>Object.keys(CLASSES[slug(n)]?.requirements||{}))),magic=skills.has('black-magic')||skills.has('white-magic'),flying=skills.has('flying'),riding=skills.has('riding');return [
 [magic?'Spells you have learned':'Reliable main weapon',magic?'Choose the spells this character can actually use. Match damage or healing to the team’s needs.':'Prioritise useful accuracy and manageable weight. The strongest weapon is not always the best everyday choice.'],
 [magic?'Support or physical backup':'Situational backup',magic?'Keep a support option or a usable weapon for situations where your main spell is unsuitable.':'Keep a ranged or effective weapon for matchups your everyday weapon cannot handle. Check its skill requirements.'],
 [flying||riding?'Compatible mount':'Survival & utility',flying||riding?'Match the mount species to the equipped class. A class change may need a different mount. Bond ability recommendations depend on your route.':'Choose defensive or utility equipment that supports the role, while keeping an eye on total weight.']
 ];}
for(const guide of [...ADDITIONAL_GUIDES,...COMPREHENSIVE_GUIDES]){BUILDS[guide.character]??=[];BUILDS[guide.character].push({...guide,milestones:guide.milestones||[],loadout:guide.loadout||[]});}
const hybrid=BUILDS.cai.find(b=>b.name==='Hybrid cavalry');
Object.assign(hybrid,{role:'Mounted mixed damage',equipment:['iron-spear','levin-sword'],why:'Keep Cai mobile while developing a magical option alongside his physical weapons.',tradeoff:'Caladrius needs Black Magic training and a Cai-route class unlock. Match your mount to the current class; an Ornius and a horse are different investments.',loadout:[['Useful attack spell','Use a spell Cai has actually learned; a magic-capable class does not guarantee every spell.'],['Physical backup','Keep a usable spear or sword for opponents better handled with physical damage.'],['Class-compatible mount','Caladrius uses an Ornius-type mount; plan the mount change when moving to a horse-class target. Verify bond abilities in-game.']]});
enrichGuides(BUILDS,CLASSES);
export function buildsFor(id){return BUILDS[id]||[];}
export function selectedBuild(id,member){const base=buildsFor(id).find(b=>b.id===member.build)||null;const plan=member.customPlan;if(!plan?.stages?.length)return null;return {...(base||{id:'custom',source:null,loadout:[],equipment:[],milestones:[]}),name:'Custom plan',role:plan.role||'Your own build',stages:plan.stages.filter(id=>CLASSES[id]),custom:true};}

export const INNATE={
cai:['Brio','Movement +1.'],peter:['Steady Aim','Bow combat arts gain 1 range.'],tialla:["Tactician’s Wit",'Ally-targeting combat arts gain 1 range.'],ultand:['Patch Up','Restores a little HP after an adjacent ally’s combat.'],
dietrich:['Murderous Intent','Critical rate +5 when initiating.'],esmeralda:['Brawn','Equipment weight is reduced to 80%.'],fabio:['Dark Calling','Adjacent enemies lose 5 Dodge.'],mikaela:["Veteran’s Mettle",'Hit +10 against an adjacent enemy.'],
theodora:['Royal Resolve','30% chance to halve incoming damage.'],bonaventure:['Sage Advice','Adjacent ally stat bonus. Sources disagree on the affected stat; check the in-game description.'],lilian:['Safety First','Hit +10 when the enemy cannot counter.'],lysander:['Racing Attack','Avoid +15 when initiating.'],tobias:['Power Arts','Attack +3 when using a combat art.'],
leda:['Blindside','Chance to prevent a counter when initiating.'],buccar:["Guardian’s Duty",'Incoming damage reduced to 90%.'],mu:['Signs of Growth','Improves stat growth. Some published growth tables already include this bonus.'],olympia:['Competitive Zeal','Critical rate +10 with magic equipped.'],sirocco:["Goddess’s Favor",'Restores 5 HP after combat.']
};
export const SPELL_MILESTONES={tialla:[{id:'spell:physic',name:'Physic',skill:'white-magic',rank:'C',source:'community',note:'Reported community learnset: a useful healing milestone. Confirm in your game.'}]};
