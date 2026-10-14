import {SKILLS} from './buildData.js';

export function rosterNextAction(goal,member,context){
 if(!goal)return ['Create a class plan'];
 if(goal.complete)return ['Route certified'];
 const stage=goal.class,actions=[];
 if(/alternativ|not both mandatory|selectable targets/i.test(stage.uncertainty||''))actions.push('Verify exam skill targets');
 else for(const [skill,target] of goal.gaps||[]){
  actions.push(member.ranks[skill]?`Train ${SKILLS[skill]} ${member.ranks[skill]} → ${target}`:`Record ${SKILLS[skill]} rank (target ${target})`);
 }
 if(goal.phaseBlocked)actions.push('Reach Part III for this class');
 if(stage.renown&&!context.renown)actions.push('Record path Renown');
 else if(goal.renownGap)actions.push(`Raise Renown ${context.renown} → ${stage.renown}`);
 if(stage.noExam)actions.push('Complete special class unlock');
 if(goal.levelGap)actions.push('Check exam chance at current level');
 return actions.length?actions:['Check certification in-game'];
}
