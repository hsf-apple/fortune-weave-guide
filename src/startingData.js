// Starting records are source-backed, never inferred from a recommended build.
// Expand this registry with per-path records as verified join data becomes available.
export const STARTING_RECORDS={
 cai:{cai:{level:'1',currentClass:'Commoner',ranks:{},url:'https://fortunesweave.co.uk/characters/cai',status:'Reported starting record · not independently verified',note:'Level 1 Commoner is reported. Starting skill ranks are not documented in this source.'}},
 tialla:{cai:{level:'1',currentClass:'Commoner',ranks:{},url:'https://www.nolanchai.dev/fortune-weave/characters/tialla/',status:'Reported starting record · not independently verified',note:'Use the starting Level 1 Commoner table, not the later Level 5 save capture. Starting skill ranks are not documented.'}},
 dietrich:{dietrich:{currentClass:'Noble',ranks:{},url:'https://fortunesweave.co.uk/characters/dietrich',status:'Reported starting class · incomplete record',note:'Noble is reported; starting level and ranks are not documented in this source.'}}
};
export function startingRecord(id,path){return STARTING_RECORDS[id]?.[path]||null;}
