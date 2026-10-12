// Factual examples from Serenes Forest; recommendations remain companion guidance.
const base='https://serenesforest.net/fortunes-weave/weapons-items/';
export const EQUIPMENT={
 'iron-spear':{name:'Iron Spear',requirements:{spear:'D'},note:'Everyday physical option. Compare its accuracy and weight with your current weapon.',url:base+'spears/'},
 javelin:{name:'Javelin',requirements:{spear:'D'},note:'A 1–2 range spear for reaching enemies without moving adjacent.',url:base+'spears/'},
 'short-spear':{name:'Short Spear',requirements:{spear:'C'},note:'A stronger throwing option with more weight and lower listed accuracy than a Javelin.',url:base+'spears/'},
 'iron-sword':{name:'Iron Sword',requirements:{sword:'D'},note:'A conventional Sword option; check total weight before choosing heavier alternatives.',url:base+'swords/'},
 'killing-edge':{name:'Killing Edge',requirements:{sword:'C'},note:'Provides access to the Deadly Blade combat art. Confirm the art in your equipment menu.',url:base+'swords/'},
 flyssa:{name:'Flyssa',requirements:{sword:'C'},note:'An armour-effective backup for physical sword users.',url:base+'swords/'},
 'levin-sword':{name:'Levin Sword',requirements:{sword:'C'},note:'Deals magical damage at 1–2 range. This is a weapon, not a learned magic spell.',url:base+'swords/'},
 'iron-bow':{name:'Iron Bow',requirements:{bow:'D'},note:'An everyday ranged weapon; bows are useful against flying targets.',url:base+'bows/'},
 'mini-bow':{name:'Mini Bow',requirements:{bow:'D'},note:'A 1–2 range option for situations that need closer bow coverage.',url:base+'bows/'},
 'horse-killer-bow':{name:'Horsekiller Bow',requirements:{bow:'C'},note:'A cavalry-effective backup for a bow specialist.',url:base+'bows/'},
 'iron-axe':{name:'Iron Axe',requirements:{axe:'D'},note:'A physical Axe option. Its weight and accuracy are important tradeoffs.',url:base+'axes/'},
 'hand-axe':{name:'Hand Axe',requirements:{axe:'D'},note:'A 1–2 range backup; check hit chance before relying on it.',url:base+'axes/'},
 hammer:{name:'Hammer',requirements:{axe:'D'},note:'Armour-effective, but particularly heavy. Useful as a situational tool.',url:base+'axes/'},
 'iron-gauntlets':{name:'Iron Gauntlets',requirements:{gauntlet:'D'},note:'A close-range physical option for brawling builds.',url:base+'gauntlets/'}
};
export const GUIDE_EQUIPMENT={cai:['iron-spear','javelin','short-spear'],peter:['iron-bow','mini-bow','horse-killer-bow'],dietrich:['iron-sword','killing-edge','flyssa'],esmeralda:['iron-spear','javelin','iron-axe'],mikaela:['iron-axe','hand-axe','hammer'],theodora:['iron-spear','javelin'],lilian:['iron-bow','mini-bow','horse-killer-bow'],lysander:['iron-spear','javelin','iron-axe'],tobias:['iron-axe','hand-axe','hammer'],leda:['iron-bow','mini-bow','flyssa'],buccar:['iron-spear','iron-axe','hand-axe'],mu:['iron-gauntlets','iron-axe','hand-axe']};
export const STAGE_COACHING={
 'ornius-rider':'Use Spear often and keep Riding moving. Confirm which secondary exam targets apply before dividing training between weapons.',
 'light-cavalry':'Secure the listed mounted targets, then prepare Sword for Bardinger or Black Magic for the hybrid branch. Bolster Health is a useful optional reward.',
 bardinger:'Work toward Riding C, Spear C and Sword B. Keep developing the weapons needed for the next target instead of treating mastery as a mandatory pause.',
 orichaldia:'Prepare the listed Riding B and A-rank weapon targets before Part III certification. Fierce Spear is a separate mastery objective.',
 caladrius:'Prepare Black Magic B alongside Riding. Complete the route-specific class unlock and have a suitable Ornius mount ready.',
 troubadour:'Start Riding while developing both magic skills. Check the class-unlock quest and the spells this character actually learns.',
 dancer:'This is a role choice rather than a normal exam milestone. Complete the necklace quest and use dance when the team benefits from another action.'
};
