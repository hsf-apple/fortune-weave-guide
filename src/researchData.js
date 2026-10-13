const shops='https://allthings.how/fire-emblem-fortune-s-weave-best-items-to-buy-in-the-shops/';
const cai='https://allthings.how/the-best-cai-build-in-fire-emblem-fortune-s-weave/';
const reported='Reported equipment suggestion · verify rank, availability and effect in-game.';
export const RESEARCH_EQUIPMENT=[
{id:'black-feathered-maginius',name:'Black-feathered Maginius (黒羽のマジニウス)',type:'Mount',note:'Japanese Cai guide mount recommendation. English name is a provisional alias; verify species and class compatibility.',url:'https://game8.jp/fe-banshisenko/816414'},

{id:'da-mina-spear',name:'Da Mina Spear',type:'Weapon',skill:'spear',note:'Reported combat-art accuracy option; refinements are not modeled.',url:shops},
{id:'star-spear',name:'Star Spear',type:'Weapon',skill:'spear',note:'Endgame spear suggestion from the Cai guide; acquisition and rank not checked.',url:cai},
{id:'ridersbane',name:'Ridersbane',type:'Weapon',skill:'spear',note:'Cavalry-effective option. Reported shop: Megaira, 2,100 gold.',url:shops},
{id:'red-meganius',name:'Red Meganius',type:'Mount',note:'Cai guide mount suggestion. Check current-class species compatibility; growth figures not imported.',url:cai},
{id:'zanbato',name:'Zanbato',type:'Weapon',skill:'sword',note:'Cavalry-effective sword. Reported shop: Fina, 2,100 gold.',url:shops},
{id:'da-mina-sword',name:'Da Mina Sword',type:'Weapon',skill:'sword',note:'Reported combat-art accuracy option. Callianera Port, 2,800 gold.',url:shops},
{id:'da-mina-bow',name:'Da Mina Bow',type:'Weapon',skill:'bow',note:'Reported combat-art accuracy option. Shop reference: Orens.',url:shops},
{id:'da-mina-axe',name:'Da Mina Axe',type:'Weapon',skill:'axe',note:'Reported combat-art accuracy option. Shop reference: Raivo Port.',url:shops},
{id:'da-mina-gauntlets',name:'Da Mina Gauntlets',type:'Weapon',skill:'gauntlet',note:'Reported combat-art accuracy option. Mons, 2,800 gold.',url:shops},
{id:'resistant-gauntlets',name:'Resistant Gauntlets',type:'Weapon',skill:'gauntlet',note:'Reported Res +3 option. Niiza Port, 2,100 gold.',url:shops},
{id:'qiankun-circles',name:'Qiankun Circles',type:'Weapon',skill:'gauntlet',note:'Reported ranged brawling option. Alecto, 3,500 gold.',url:shops},
{id:'da-mina-shield',name:'Da Mina Shield',type:'Equipment',note:'Reported Def +4 shield. Mons, 4,000 gold.',url:shops},
{id:'silver-shield',name:'Silver Shield',type:'Equipment',note:'Reported Def +6 shield. Mons, 10,000 gold.',url:shops},
{id:'gale-ring',name:'Gale Ring',type:'Equipment',note:'Reported Speed accessory; check barter availability in Alecto.',url:shops}
].map(e=>({...e,requirements:{},note:e.note+' '+reported}));

export const BUILD_READINGS=[
{id:'jp-classes',source:'game8jp',title:'Japanese class and exam guide',topic:'Class rules',note:'Useful for the distinction between required and selectable skills, and late-game class access. Check translations against your game.',url:'https://game8.jp/fe-banshisenko/816464'},
{id:'jp-mounts',source:'game8jp',title:'Mount choices by character',topic:'Equipment',note:'Character and class-specific mount ideas. Mount species and bond development should be checked separately from the class route.',url:'https://game8.jp/fe-banshisenko/816904'},

{id:'boons',source:'keengamer',title:'Progression Boons',topic:'Training',note:'Prioritize battle EXP, then Class EXP and the skill EXP investments your actual builds use.',url:'https://www.keengamer.com/articles/guides/fire-emblem-fortunes-weave-best-boons-of-salvation-to-learn/'},
{id:'weekly',source:'mobalytics',title:'Weekly training routine',topic:'Training',note:'The guide suggests weekend Arena training, followed by meals to restore Motivation. Check the in-game calendar and costs.',url:'https://mobalytics.gg/gamebase/guides/fire-emblem-fortunes-weave-weekly-prioritization'},
{id:'echo',source:'mobalytics',title:'Magic Echo Shards',topic:'Dietrich',note:'Dietrich’s Answerer’s Cry skirmishes are a suggested shard-farming loop for combat-art development. Drop counts and efficiency vary.',url:'https://mobalytics.gg/gamebase/guides/fire-emblem-fortunes-weave-magic-echo-shards'},
{id:'shops',source:'allthingshow',title:'Useful equipment and shops',topic:'Equipment',note:'Browse weapon options, accessories, manuals and reported shop locations before spending gold.',url:shops},
{id:'dance',source:'allthingshow',title:'Who should handle Dance?',topic:'Team roles',note:'Consider the action cost of assigning Leda to Dance. The guide discusses transferring the role to another suitable ally.',url:'https://allthings.how/fire-emblem-fortune-s-weave-best-dancer-and-apsara-class-picks/'},
{id:'mages',source:'mobalytics',title:'Mage and healer roles',topic:'Team roles',note:'Role recommendations rather than complete class routes. Treat rankings as author opinion.',url:'https://mobalytics.gg/gamebase/guides/fire-emblem-fortunes-weave-mage-tier-list'},
{id:'class-exams',source:'gamewith',title:'Class exams and alternatives',topic:'Class rules',note:'Distinguishes required skills from selectable weapon targets. Useful when sources list multiple exam ranks.',url:'https://gamewith.jp/fefw/573025'},
{id:'growths',source:'serenes',title:'Character and class growths',topic:'Class rules',note:'Personal growth and class modifiers are separate. A class growth percentage is not a flat stat bonus.',url:'https://serenesforest.net/fortunes-weave/classes/growth-rates/'}
];
