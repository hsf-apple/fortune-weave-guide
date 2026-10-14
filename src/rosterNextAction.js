import {SKILLS} from './buildData.js';

export function rosterNextAction(goal,member){
 if(!goal||goal.complete)return [];
 // Alternative exam targets are not all mandatory training requirements.
 if(/alternativ|not both mandatory|selectable targets/i.test(goal.class.uncertainty||''))return [];
 return (goal.gaps||[]).map(([skill,target])=>`${SKILLS[skill]} ${member.ranks[skill]||'Unknown'} → ${target}`);
}
