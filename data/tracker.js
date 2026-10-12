/* Future sources belong in sources and each character's builds array.
   Stable stage IDs indicate identical class/mastery objectives across builds.
   Progress keys are path / character / stage ID, independent of build selection. */
window.TRACKER_DATA={sources:{game8:{name:'Game8'}},paths:[
{id:'cai',name:'Cai',faction:'Ribeira Winds',color:'#79b8a0',mandatory:['cai','peter','tialla','ultand']},
{id:'dietrich',name:'Dietrich',faction:'House Lamine',color:'#92a7d4',mandatory:['dietrich','esmeralda','fabio','mikaela']},
{id:'theodora',name:'Theodora',faction:"Megaira's Beacon",color:'#c4a8df',mandatory:['theodora','bonaventure','lilian','lysander','tobias']},
{id:'leda',name:'Leda',faction:'Rose Tempest',color:'#d08b9c',mandatory:['leda','buccar','mu','olympia','sirocco']}],characters:[],rosterSource:'https://ffrecruiter.lovable.app/'};
const catalogNames='Cai|Dietrich|Theodora|Leda|Peter|Tialla|Ultand|Esmeralda|Fabio|Mikaela|Bonaventure|Lilian|Lysander|Tobias|Buccar|Mu|Olympia|Sirocco|Dadao|Halvin|Nezha|Sha Lan|Dante|Gaitz|Goliath|Jester|Diego|Loretta|Ninae|Seteth|Catania|Guzran|Io|Majide|Noctula|Nuzzuo|Nydine|Yang Jie|Alexandra|Benditz|Inyoni|Jasmine|Kiroc|Peppe|Zarcone|Fianna|Ludia|Simon|Ursula|Sofia|Anatolia|Aswan|Bertrand|Centurio|Klapka|Orchel|Tahonia|Talimun|Creek|Nathan'.split('|');
window.TRACKER_DATA.characters=catalogNames.map((name,index)=>({id:name.toLowerCase().replaceAll(' ','-'),name,portrait:'assets/'+name.toLowerCase().replaceAll(' ','-')+'.webp',spoiler:index>=50,builds:[]}));
window.TRACKER_DATA.characters[0].builds=[{id:'game8-cavalry',source:'game8',name:'Physical cavalry',role:'Mobile spear attacker',url:'https://game8.co/games/Fire-Emblem-Fortunes-Weave/archives/624119',verification:'Existing repository route attributed to Game8. Certification targets, alternate exam requirements and mastery details must be checked in-game; the source could not be reverified during this update.',stages:window.CAI_STAGES.map(s=>({...s,id:'class:'+s.name.toLowerCase().replaceAll(' ','-')+':'+s.mastery.toLowerCase().replaceAll(' ','-')}))}];
