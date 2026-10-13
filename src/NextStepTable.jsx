import React from 'react';
import {ArrowRight} from 'lucide-react';
import {CLASSES,SKILLS} from './buildData.js';
import {rankMet} from './model.js';

function stepsFor(stage,member,context,upcoming){
 const certified=Boolean(member.certified[stage.id]);
 const rows=Object.entries(stage.requirements).map(([skill,target])=>{
  const current=member.ranks[skill]||'Unknown',done=rankMet(member.ranks[skill],target);
  return {step:SKILLS[skill],current,target,status:done?'Target met':certified?current==='Unknown'?'Not recorded':'Below listed target':upcoming?'Planned':current==='Unknown'?'Record rank':'Train',done};
 });
 if(['Master','Divine'].includes(stage.tier)){
  const done=context.part==='III';
  rows.push({step:'Story access',current:`Part ${context.part}`,target:'Part III',status:done?'Available':certified?'Earlier unlock':upcoming?'Planned':'Later',done});
 }
 if(stage.renown){
  const current=context.renown||'Unknown',done=current!=='Unknown'&&Number(current)>=stage.renown;
  rows.push({step:'Renown (roster)',current,target:String(stage.renown),status:done?'Target met':certified?current==='Unknown'?'Not recorded':'Below listed target':upcoming?'Planned':current==='Unknown'?'Record Renown':'Raise Renown',done});
 }
 if(stage.idealLevel){
  const current=member.level||'Unknown',done=current!=='Unknown'&&Number(current)>=stage.idealLevel;
  rows.push({step:'Level (recommended)',current,target:String(stage.idealLevel),status:done?'Target met':certified?current==='Unknown'?'Not recorded':'Below listed target':upcoming?'Planned':current==='Unknown'?'Record level':'Below target',done});
 }
 rows.push({step:stage.noExam?'Class unlock':'Certification',current:member.certified[stage.id]?(stage.noExam?'Unlocked':'Certified'):'Not yet',target:stage.noExam?'Unlocked':'Certified',status:member.certified[stage.id]?'Done':upcoming?'Planned':'Check in-game',done:Boolean(member.certified[stage.id]),final:true});
 return rows.sort((a,b)=>Number(a.done)-Number(b.done)||Number(a.final)-Number(b.final));
}

function StageRows({stage,member,context,upcoming,onDetails}){
 return <>
  <div className="next-step-table-scroll"><table className="next-step-table"><caption className="sr-only">{stage.name} training and certification steps</caption><thead><tr><th scope="col">Step</th><th scope="col">Current</th><th scope="col">Target</th><th scope="col">Status</th></tr></thead><tbody>{stepsFor(stage,member,context,upcoming).map(row=><tr key={row.step}><th scope="row">{row.step}</th><td data-label="Current">{row.current}</td><td data-label="Target">{row.target}</td><td data-label="Status"><span className={`next-step-status ${row.done?'is-done':upcoming?'is-upcoming':'is-active'}`}>{row.status}</span></td></tr>)}</tbody></table></div>
  {stage.uncertainty&&<p className="next-step-caveat">{stage.uncertainty}</p>}
  {stage.unlockNote&&<details className="next-step-unlock"><summary>Unlock details</summary><p>{stage.unlockNote}</p></details>}
  <button className="text-link next-step-details" onClick={()=>onDetails(stage.id)}>Class details <ArrowRight size={15}/></button>
 </>;
}

export default function NextStepTable({stages,member,context,onDetails,onStats}){
 const nextIndex=stages.findIndex(id=>!member.certified[id]);
 const visible=nextIndex<0?stages:stages.slice(nextIndex);
 return <div className="next-step-view">
  <div className="next-step-intro"><div><h2>{nextIndex<0?'Route certified':'Next class first'}</h2><p>{nextIndex<0?'All planned classes are certified. Review details or mastery goals when you are ready.':'Upcoming classes are below. Open one to see its targets.'}</p></div><button className="text-link" onClick={onStats}>Update ranks <ArrowRight size={15}/></button></div>
  {visible.map((id,index)=>{const stage=CLASSES[id],upcoming=nextIndex>=0&&index>0,collapsed=nextIndex<0||upcoming;if(!stage)return null;return collapsed?<details className="next-step-stage" key={id}><summary><span className="next-step-stage-label">{nextIndex<0?'Certified':'Upcoming'} · {stage.tier}</span><strong>{stage.name}</strong></summary><StageRows stage={stage} member={member} context={context} upcoming onDetails={onDetails}/></details>:<section className="next-step-stage is-current" key={id}><header><span className="next-step-stage-label">Next class · {stage.tier}</span><strong>{stage.name}</strong></header><StageRows stage={stage} member={member} context={context} upcoming={false} onDetails={onDetails}/></section>;})}
  {nextIndex>0&&<p className="next-step-complete-count">{nextIndex} earlier {nextIndex===1?'class':'classes'} certified.</p>}
  <p className="next-step-source-note">Listed targets are guidance. Check the actual exam and unlock requirements in-game.</p>
 </div>;
}
