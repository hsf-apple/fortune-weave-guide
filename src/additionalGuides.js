// Publisher recommendations stay separate from class facts and the user's custom plan.
const checked='12 October 2026';
const keen='https://www.keengamer.com/articles/guides/fire-emblem-fortunes-weave-best-class-for-every-character/';
const ath={cai:'https://allthings.how/the-best-cai-build-in-fire-emblem-fortune-s-weave/',dietrich:'https://allthings.how/fire-emblem-fortune-s-weave-best-dietrich-build-and-class-path/',leda:'https://allthings.how/leda-s-dancer-decision-in-fire-emblem-fortune-s-weave/',theodora:'https://allthings.how/fire-emblem-fortune-s-weave-best-theodora-team-build-part-1/'};
const mob=path=>'https://mobalytics.gg/gamebase/guides/fire-emblem-fortunes-weave-'+path+'-tier-list';
const id=s=>s.toLowerCase().replaceAll(' ','-');
const roles={wiseman:'Healing & support',bishop:'Healing & support',troubadour:'Mounted support',druid:'Offensive magic',ovate:'Offensive magic',shaman:'Offensive magic','high-savant':'Mounted hybrid','castle-knight':'Armored frontline',dreadnought:'Armored frontline',battlemaster:'Physical attacker',warrior:'Physical attacker','bow-adept':'Ranged damage',sniper:'Ranged damage',archer:'Ranged damage',sentinel:'Spear support',guardian:'Spear support',orichaldia:'Mounted spear attacker',bardinger:'Mounted spear attacker',dancer:'Dance support','the-apsara':'Dance support','the-blade':'Sword attacker',shido:'Sword attacker','shadow-seeker':'Sword & bow utility','the-cavalier':'Mounted attacker'};
function guide(character,source,name,stages,url,extra={}){return {character,id:source+':'+character+':'+id(name),source,name,role:roles[id(stages.at(-1))]||'Custom team role',stages:stages.map(id),url,checked,scope:'Selected published route',why:'Use this reference as a starting point for your own plan.',tradeoff:'Class changes require separate training and unlocks. Adjust this plan to your actual character records.',verification:'Publisher recommendation; not independently verified in-game. Class details have their own sources.',loadout:[],equipment:[],milestones:[],...extra};}
const keenRoutes=[
 ['cai','Ornius Rider|Bardinger|Orichaldia','Intermediate mounted training is not specified.'],
 ['dietrich','Gladiator|Myrmidon|Shido|Shadow Seeker|The Blade',''],
 ['theodora','Soldier|Armored Knight|Guardian|Sentinel','Armored Knight selected from the published alternative.'],
 ['leda','Hunter|Rogue|Dancer|The Apsara','Rogue selected from the published alternative.'],
 ['peter','Hunter|Archer|Sniper|Bow Adept',''],['tialla','Diviner|Priest|Bishop|Wiseman',''],
 ['ultand','Soldier|Guardian|Sentinel','Intermediate Faith training is not specified.'],
 ['esmeralda','Soldier|Armored Knight|Dreadnought|Castle Knight',''],['fabio','Diviner|Shaman|Ovate|Druid',''],
 ['mikaela','Gladiator|Brigand|Warrior|Battlemaster',''],
 ['bonaventure','Diviner|High Savant','Partial: the article leaves the mounted intermediate classes unspecified.'],
 ['tobias','Gladiator|Brigand|Warrior|Battlemaster','Brigand selected from the published alternative.'],
 ['lysander','Ornius Rider|Light Cavalry|Bardinger|Orichaldia','Ornius Rider selected from the published alternative.'],
 ['lilian','Hunter|Archer|Sniper|Bow Adept',''],['buccar','Soldier|Armored Knight|Dreadnought|Castle Knight',''],
 ['mu','Gladiator|Pugilist|Warrior|Battlemaster','Pugilist selected from the published alternative.'],
 ['olympia','Diviner|Priest|Bishop|Wiseman',''],
 ['sirocco','Diviner|High Savant','Partial: the article leaves the mounted intermediate classes unspecified.']
];
export const ADDITIONAL_GUIDES=keenRoutes.map(([c,route,note])=>guide(c,'keengamer','Published class route',route.split('|'),keen,{scope:note.startsWith('Partial')||['cai','ultand'].includes(c)?'Partial published route':'Selected published route',verification:'Source route, with class aliases normalized to shared IDs. '+note}));
function add(c,s,n,route,url,extra){ADDITIONAL_GUIDES.push(guide(c,s,n,route.split('|'),url,extra));}
add('cai','allthingshow','Mounted spear route','Ornius Rider|Armored Ornius Rider|Dragoon|Orichaldia|The Cavalier',ath.cai,{equipment:['levin-sword','da-mina-spear','star-spear','ridersbane','red-meganius'],abilityGoals:['catalog:flamekeeper','mastery:dragoon','mastery:bardinger'],loadout:[['Endgame gear','The article uses refined spear weapons and Levin Sword; refinements are not modeled as separate items.']],verification:'Dragoon selected from the source fork. Mount species and Divine assignment must be checked. The article’s Aegis description is not used as a class fact.'});
add('cai','allthingshow','Mounted magic branch','Ornius Rider|Armored Ornius Rider|Caladrius|Orichaldia|The Cavalier',ath.cai,{equipment:['levin-sword','red-meganius'],verification:'Caladrius selected from the source fork. Plan the change between flying/mounted species in-game.'});
add('dietrich','allthingshow','Sword route with mastery detours','Gladiator|Hunter|Myrmidon|Rogue|Shido|Shadow Seeker|The Blade',ath.dietrich,{abilityGoals:['mastery:myrmidon','mastery:rogue','mastery:shido','mastery:shadow-seeker'],verification:'Hunter and Rogue are optional detours, not a strict promotion chain.'});
for(const [c,r] of [['fabio','Diviner|Shaman|Ovate'],['esmeralda','Gladiator|Armored Knight|Dreadnought'],['mikaela','Gladiator|Brigand|Warrior'],['tialla','Diviner|Priest|Troubadour'],['peter','Hunter|Archer|Forest Knight'],['ultand','Diviner|Priest|Bishop']])add(c,'allthingshow','Dietrich team role (partial)',r,ath.dietrich,{scope:'Part I team recommendation · partial'});
add('leda','allthingshow','Dance support route','Gladiator|Hunter|Rogue|Dancer|The Apsara',ath.leda,{abilityGoals:['mastery:dancer','mastery:archer'],verification:'Archer mastery is an optional detour. Dancer eligibility is disputed across existing sources. The article contradicts itself about extra-action Blaze Arts; that claim is not imported.'});
add('leda','allthingshow','Combat and buff alternative','Gladiator|Hunter|Rogue|Shadow Seeker|The Calamity',ath.leda,{verification:'Alternative when another ally handles Dance. The source’s claimed extra dancers are not modeled as a verified mechanic.'});
for(const [c,r] of [['sirocco','Diviner|Shaman|Ovate'],['buccar','Armored Knight|Dreadnought'],['mu','Pugilist|Warrior'],['olympia','Troubadour'],['catania','Wing Soldier'],['sofia','Priest'],['inyoni','Archer'],['guzran','Light Cavalry']])add(c,'allthingshow','Leda team role (partial)',r,ath.leda,{scope:'Team-role target · partial'});
add('theodora','allthingshow','Part I guardian route','Soldier|Archer|Armored Knight|Light Cavalry|Guardian',ath.theodora,{scope:'Part I · includes mastery detours',equipment:['javelin','killing-edge','da-mina-spear'],abilityGoals:['mastery:guardian','mastery:light-cavalry','mastery:archer','catalog:spears-lv.-3','catalog:direct-hit'],verification:'Archer and Light Cavalry are detours. Guardian access depends on route unlocks. Combat arts are not imported into ability slots.'});
add('theodora','allthingshow','Part I armored alternative','Soldier|Archer|Armored Knight|Light Cavalry|Dreadnought',ath.theodora,{scope:'Part I · selected alternative'});
for(const [c,r] of [['bonaventure','Shaman'],['tobias','Brigand'],['lysander','Bardinger'],['lilian','Archer'],['sofia','Priest']])add(c,'allthingshow','Theodora team role (partial)',r,ath.theodora,{scope:'Team-role target · partial'});
const mobaNote='Selected training detours, not a full progression chain. Growth numbers and imprecise ability wording from the article are not treated as class facts.';
for(const [c,r] of [['cai','Myrmidon|Brigand|Archer|Bardinger'],['mu','Myrmidon|Pugilist|Shido'],['guzran','Myrmidon|Brigand'],['esmeralda','Armored Knight|Dreadnought'],['tialla','Priest|Bishop|Troubadour'],['sofia','Priest|Bishop|Troubadour'],['olympia','Myrmidon|Shaman|Ovate'],['ultand','Priest|Troubadour'],['peter','Archer|Charioteer'],['nuzzuo','Archer|Charioteer|Sniper'],['inyoni','Archer|Charioteer|Forest Knight']])add(c,'mobalytics','Cai-path training detours',r,mob('cai'),{scope:'Cai-path training targets · partial',verification:mobaNote});
for(const [c,r] of [['theodora','Myrmidon|Brigand|Archer|Wing Soldier'],['mu','Myrmidon|Pugilist'],['bonaventure','Shaman|Ovate'],['olympia','Priest|Shaman|Ovate'],['sirocco','Myrmidon|Shaman'],['lilian','Brigand|Archer'],['nuzzuo','Archer|Rogue']])add(c,'mobalytics','Theodora-path training detours',r,mob('theodora'),{scope:'Theodora-path training targets · partial',verification:mobaNote});
for(const [c,r] of [['esmeralda','Guardian'],['leda','Dancer']])add(c,'mobalytics','Leda-path role target',r,mob('leda'),{scope:'Leda-path class target · partial',verification:mobaNote});
for(const [c,r] of [['olympia','Shaman|Ovate'],['inyoni','Archer|Sniper']])add(c,'mobalytics','Dietrich-path training targets',r,mob('dietrich'),{scope:'Dietrich-path training targets · partial',verification:mobaNote});

// Selected Japanese recommendation-table routes; class names mapped to existing English IDs.
const jp='https://game8.jp/fe-banshisenko/816464';
const jpCharacter={cai:'https://game8.jp/fe-banshisenko/816414',dietrich:'https://game8.jp/fe-banshisenko/816415',theodora:'https://game8.jp/fe-banshisenko/816416',leda:'https://game8.jp/fe-banshisenko/816417'};
const japaneseRoutes=[
['cai','Ornius Rider|Armored Ornius Rider|Caladrius|High Savant|The Cavalier'],
['dietrich','Hunter|Myrmidon|Shido|Swordmaster|The Blade'],
['theodora','Soldier|Armored Knight|Guardian|Sentinel|The Trident'],
['leda','Hunter|Archer|Dancer|Shadow Seeker|The Apsara'],
['tialla','Diviner|Priest|Ovate|Valkyrium|The Avatar'],
['peter','Hunter|Archer|Forest Knight|Bow Knight|The Calamity'],
['ultand','Diviner|Shaman|Ovate|Sentinel|The Trident'],
['fabio','Diviner|Shaman|Ovate|Druid|The Avatar'],
['esmeralda','Ornius Rider|Armored Ornius Rider|Bardinger|Celestial Trooper|The Trident'],
['mikaela','Hunter|Archer|Forest Knight|Bow Knight|The Calamity'],
['bonaventure','Diviner|Shaman|Ovate|Druid|The Avatar'],
['tobias','Gladiator|Brigand|Warrior|Battlemaster|The Cavalier'],
['lilian','Hunter|Archer|Forest Knight|Bow Knight|The Calamity'],
['lysander','Ornius Rider|Armored Ornius Rider|Bardinger|Bau Lord|The Cavalier'],
['buccar','Ornius Rider|Brigand|Warrior|Bau Lord|The Eternal'],
['sirocco','Diviner|Shaman|Ovate|Druid|The Avatar'],
['olympia','Diviner|Priest|Bishop|Wiseman|The Avatar'],
['mu','Gladiator|Pugilist|Warrior|Battlemaster']
];
for(const [c,route] of japaneseRoutes)add(c,'game8jp','Japanese class recommendation',route,jpCharacter[c]||jp,{scope:'Published Japanese route · selected Divine endpoint',verification:'Translated recommendation; English aliases use shared class IDs. Not a guaranteed promotion chain. Verify new weapon investments, route unlocks and unique Divine assignments.',...(c==='cai'?{equipment:['black-feathered-maginius'],loadout:[['Mount choice','The Japanese Cai guide suggests 黒羽のマジニウス; verify the localized name and current-class species.']]}:{})});

// Individual-page alternatives and newly published guides, kept separate from team-role notes.
add('ludia','game8jp','Japanese sword route','Gladiator|Myrmidon|Shido|Swordmaster|The Calamity','https://game8.jp/fe-banshisenko/816454',{verification:'Published Japanese route; English aliases mapped to the shared catalog. The Divine endpoint is optional and needs separate skills and assignment.'});
add('eshmel','game8jp','Japanese spear-support route','Guardian|Sentinel|The Trident','https://game8.jp/fe-banshisenko/816479',{scope:'Advanced through Divine · partial',verification:'The Japanese page identifies the protagonist as Ishmael (イシュマール); matched to the supplied Eshmel/Ishmal profile. This is an editorial name alias, not official localization evidence. Verify Divine assignment in-game.'});
add('klapka','game8jp','Joining Guardian role','Guardian','https://game8.jp/fe-banshisenko/817240',{scope:'Reported fixed-class role · no progression chain',why:'The Japanese character guide recommends using Klapka’s Guardian role for frontline protection and support.',tradeoff:'The source reports that his class is fixed and cannot be changed through exams. The custom planner currently permits edits; treat other classes as hypothetical until this restriction is verified.',verification:'Published fixed-class claim, not independently verified in-game. This is a role reference, not an instruction to certify again.'});
add('yang-jie','game8jp','Cai-path mounted healer alternative','Diviner|Priest|Troubadour','https://game8.jp/fe-banshisenko/816446',{scope:'Advanced class alternative · partial',why:'The Japanese character guide offers Troubadour as a mounted healing alternative on Cai’s path.',tradeoff:'Riding is a weakness for Yang Jie; prepare its exam rank early. The source suggests a Monoceros, but its localized identity and bond effects need confirmation.',verification:'Published alternative, not a full endgame route. Mount recommendation remains a source note; no starting ranks are inferred.'});
for(const endpoint of ['Celestial Trooper','Bau Lord'])add('esmeralda','allthingshow','Spear-throwing flier · '+endpoint,'Soldier|Armored Knight|Dragoon|'+endpoint,'https://allthings.how/fire-emblem-fortune-s-weave-best-build-for-esmeralda/',{equipment:['javelin','ridersbane'],scope:'Individual character route · selected Master alternative',why:'The source develops spear attacks into a flying role, with two Master alternatives.',tradeoff:'Flying training and compatible mounts are additional investments. The article’s exam percentages describe a particular character state, not a universal pass chance.',verification:'Published route checked. Refinements, relic access and combat-art restrictions are not assumed; confirm them in-game.',loadout:[['Source loadout idea','The article recommends ranged spears, a personal relic, and effective backup weapons. Refinement levels are not modeled separately.']]});
for(const [c,r] of [['fianna','Priest|Troubadour'],['sirocco','Shaman'],['dante','Shaman']])add(c,'mobalytics','Cai-path support training',r,mob('cai'),{scope:'Cai-path training targets · partial',verification:mobaNote});
add('cai','mobalytics','Cai-path flying endpoint','Dragoon',mob('cai'),{scope:'Alternative advanced-class target only',verification:mobaNote});
for(const c of ['diego','peter','ultand'])add(c,'mobalytics','Theodora-path hunter alternative','Hunter',mob('theodora'),{scope:'Optional team class target only',verification:mobaNote});
