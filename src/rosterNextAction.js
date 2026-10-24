import {SKILLS} from './buildData.js';

export function rosterNextAction(goal,member){
 if(!goal||goal.complete)return [];
 return (goal.gaps||[]).map(([skill,target])=>`${SKILLS[skill]} ${member.ranks[skill]||'Unknown'} → ${target}`);
}
