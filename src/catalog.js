export const PATHS=[
{id:'cai',name:'Cai',faction:'Ribeira Winds',color:'#99c4af',description:'Build a mobile party around spears, support magic, and mounted reach.',mandatory:['cai','peter','tialla','ultand']},
{id:'dietrich',name:'Dietrich',faction:'House Lamine',color:'#a4b5df',description:'Develop decisive attackers with swordplay, combat arts, and durable support.',mandatory:['dietrich','esmeralda','fabio','mikaela']},
{id:'theodora',name:'Theodora',faction:"Megaira's Beacon",color:'#c5b0df',description:'Shape a resilient frontline, with ranged pressure and reliable support.',mandatory:['theodora','bonaventure','lilian','lysander','tobias']},
{id:'leda',name:'Leda',faction:'Rose Tempest',color:'#dfa6b6',description:'Balance ranged attacks, flexible magic, and close-range power.',mandatory:['leda','buccar','mu','olympia','sirocco']}];
export const slug=s=>s.toLowerCase().replaceAll(' ','-');
const names='Cai|Dietrich|Theodora|Leda|Peter|Tialla|Ultand|Esmeralda|Fabio|Mikaela|Bonaventure|Lilian|Lysander|Tobias|Buccar|Mu|Olympia|Sirocco|Dadao|Halvin|Nezha|Sha Lan|Dante|Gaitz|Goliath|Jester|Diego|Loretta|Ninae|Seteth|Catania|Guzran|Io|Majide|Noctula|Nuzzuo|Nydine|Yang Jie|Alexandra|Benditz|Inyoni|Jasmine|Kiroc|Peppe|Zarcone|Fianna|Ludia|Simon|Ursula|Sofia|Anatolia|Aswan|Bertrand|Centurio|Klapka|Orchel|Tahonia|Talimun|Creek|Nathan|Eshmel|Hong Hua|Troy'.split('|');
const spoilers=new Set('Anatolia|Aswan|Bertrand|Centurio|Klapka|Orchel|Tahonia|Talimun|Creek|Nathan|Eshmel|Hong Hua|Troy'.split('|'));
const missingPortraits=new Set(['Eshmel','Hong Hua','Troy']);
export const CHARACTERS=names.map(name=>({id:slug(name),name,spoiler:spoilers.has(name),portrait:missingPortraits.has(name)?null:`assets/portraits/${slug(name)}.webp`}));
export const byId=id=>CHARACTERS.find(c=>c.id===id);
export const asset=path=>import.meta.env.BASE_URL+path;
export const RANKS=['','E','E+','D','D+','C','C+','B','B+','A','A+','S','S+'];
export const ROLES={cai:'Mobile spear attacker',peter:'Ranged damage',tialla:'Healing & support',ultand:'Support frontline',dietrich:'Sword & critical attacks',esmeralda:'Durable spear attacker',fabio:'Offensive magic',mikaela:'Physical attacker',theodora:'Resilient frontline',bonaventure:'Flexible magic',lilian:'Ranged damage',lysander:'Mobile physical attacker',tobias:'Heavy frontline',leda:'Ranged utility',buccar:'Durable mounted attacker',mu:'Close-range damage',olympia:'Offensive magic',sirocco:'Flexible magic'};
export const routeDefinitions={
cai:[['Physical cavalry',['Ornius Rider','Light Cavalry','Bardinger','Orichaldia']],['Hybrid cavalry',['Ornius Rider','Light Cavalry','Caladrius','High Savant']]],
dietrich:[['Sword specialist',['Gladiator','Myrmidon','Shido','Swordmaster']]],
theodora:[['Spear frontline',['Gladiator','Armored Ornius Rider','Guardian','Sentinel']]],
leda:[['Ranged utility',['Hunter','Archer','Ranger','Shadow Seeker']],['Dance support',['Hunter','Archer','Dancer','Shadow Seeker']]],
peter:[['Bow specialist',['Hunter','Archer','Sniper','Bow Adept']],['Mounted archer',['Hunter','Archer','Forest Knight','Bow Knight']]],
tialla:[['Mounted healer',['Diviner','Priest','Troubadour','Valkyrium']]],
ultand:[['Support frontline',['Diviner','Priest','Guardian','Sentinel']]],
esmeralda:[['Mounted defence',['Gladiator','Armored Ornius Rider','Cataphract','Bau Lord']],['Mobile offence',['Gladiator','Armored Ornius Rider','Bardinger','Bau Lord']]],
fabio:[['Black magic',['Diviner','Shaman','Ovate','Druid']]],
mikaela:[['Flying attacker',['Gladiator','Armored Ornius Rider','Dragoon','Bau Lord']],['Physical attacker',['Gladiator','Armored Ornius Rider','Warrior','Bau Lord']]],
bonaventure:[['Offensive magic',['Diviner','Shaman','Ovate','Druid']],['Mounted support',['Diviner','Shaman','Troubadour','Valkyrium']]],
lilian:[['Bow specialist',['Hunter','Archer','Sniper','Bow Adept']]],
lysander:[['Flying attacker',['Gladiator','Armored Ornius Rider','Dragoon','Bau Lord']],['Mounted spear',['Gladiator','Armored Ornius Rider','Bardinger','Orichaldia']]],
tobias:[['Heavy cavalry',['Gladiator','Armored Ornius Rider','Cataphract','Great Knight']]],
buccar:[['Mounted attacker',['Gladiator','Light Cavalry','Bardinger','Bau Lord']]],
mu:[['Physical brawler',['Gladiator','Brigand','Warrior','Battlemaster']],['Support brawler',['Gladiator','Brigand','Warrior','War Monk']]],
olympia:[['Offensive magic',['Diviner','Shaman','Ovate','Wiseman']]],
sirocco:[['Mounted hybrid',['Diviner','Shaman','Caladrius','High Savant']],['Mounted healer',['Diviner','Shaman','Troubadour','Valkyrium']]]
};
// Wording below is this companion's coaching, separate from the source class routes.
export const coaching={
cai:{why:'Mounted reach gives Cai a clear job: reach priority enemies and reposition. His Brio movement bonus supports that role.',tradeoff:'The physical branch invests in both Spear and Sword. The hybrid branch introduces Black Magic and a different advanced-class unlock.',loadout:[['Reliable spear','Use an accurate spear as your everyday weapon. Keep a stronger option for tougher targets.'],['Ranged option','A Javelin or other throwing spear offers reach; compare weight and hit before upgrading.'],['Suitable mount','Match the mount species to the class. For the horse-class physical route, work toward a movement or Canto bond ability.']],milestones:[{id:'cai:ranged-spear',label:'Equip a usable ranged spear',kind:'recommended'},{id:'cai:mount-bond',label:'Earn the chosen mount bond ability',kind:'recommended'}]},
peter:{why:'A dedicated bow role keeps training focused and gives the party a ranged attacker.',tradeoff:'The mounted branch adds Riding investment. The infantry branch keeps the focus on Bow.'},
tialla:{why:'Develop healing and support first, then follow the mounted magic route if its unlock is available.',tradeoff:'Troubadour adds Riding and both magic skills. A class change is useful only if it supports the spells you actually have.'},
ultand:{why:'A support-focused frontline can help protect fragile allies while contributing healing.',tradeoff:'The route shifts from magic preparation into Spear training; start that transition before the advanced target.'},
dietrich:{why:'A focused Sword route supports an attacker who initiates combat and seeks critical hits.',tradeoff:'High damage still needs reliable accuracy and positioning. Keep fragile support units behind the frontline.',milestones:[{id:'dietrich:art',label:'Learn the chosen combat art from a duel',kind:'recommended'},{id:'dietrich:teach',label:'Teach or upgrade the chosen art when available',kind:'optional'}]},
esmeralda:{why:'A durable spear role gives the team a reliable unit to take pressure off its magic users.',tradeoff:'The source route eventually switches to a flying class. That requires separate Flying and weapon investment; mounted defence is a valid stopping point.'},
fabio:{why:'Focus on Black Magic for consistent magical damage rather than spreading early training widely.',tradeoff:'Offensive magic training does not guarantee a particular support spell. Check the character learnset before investing.'},
theodora:{why:'A resilient Spear frontline gives ranged and magic allies room to work.',tradeoff:'The early mounted class and later foot classes use different movement skills; avoid overinvesting in a mount-only target.',milestones:[{id:'theodora:battalion',label:'Assign a battalion that supports the frontline role',kind:'recommended'}]},
leda:{why:'Choose ranged utility or dance support according to the role your main team needs.',tradeoff:'Dancer is an alternate role, not simply a step to rush through. The source later suggests Shadow Seeker; staying in Dancer can remain useful.',milestones:[{id:'leda:unlock',label:'Complete the selected route-specific class unlock',kind:'essential'}]}
};
