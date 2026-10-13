import {SKILLS} from './buildData.js';

export function rosterNextAction(goal,member,context){
 if(!goal)return 'Create a class plan';
 if(goal.complete)return 'Route certified';
 const stage=goal.class;
 if(/alternativ|not both mandatory|selectable targets/i.test(stage.uncertainty||''))return 'Verify exam skill targets';
 if(goal.unknown?.length){const [skill]=goal.unknown[0];return `Record ${SKILLS[skill]} rank`;}
 if(goal.gaps?.length){const [skill,target]=goal.gaps[0];return `Train ${SKILLS[skill]} ${member.ranks[skill]} → ${target}`;}
 if(goal.phaseBlocked)return 'Reach Part III for this class';
 if(stage.renown&&!context.renown)return 'Record path Renown';
 if(goal.renownGap)return `Raise Renown ${context.renown} → ${stage.renown}`;
 if(stage.noExam)return 'Complete special class unlock';
 if(goal.levelGap)return 'Check exam chance at current level';
 return 'Check certification in-game';
}
