import {guideLoadout} from './loadoutModel.js';
import React,{useRef,useState} from 'react';

import {ArrowRight,Info,Plus,GripVertical,Trash2,BookOpen,Columns2,X} from 'lucide-react';

import {CLASSES,SKILLS,buildsFor} from './buildData.js';

import {SOURCES} from './sourceData.js';

import {getGoal,rankMet} from './model.js';

import {Button,Panel,Select,Badge,CheckRow,Dialog,IconButton,SourceLink} from './components.jsx';

import ClassTabs from './ClassTabs.jsx';



export function GuideNotes({guide,onPreview}){const d=guide.decision;return <div className="guide-notes"><div className="flex flex-wrap gap-2"><Badge>{SOURCES[guide.source]?.name}</Badge>{d&&<Badge>{d.kind}</Badge>}</div><h3>Choose this if…</h3><p>{d?.pick||guide.why}</p>{d&&<><h3>How you’ll use this character</h3><p>{d.play}</p><h3>Training to budget for</h3><p>{d.training}</p><p>{d.routeMeaning}</p></>}<h3>What you give up</h3><p>{d?.cost||guide.tradeoff}</p>{d?.warnings.length>0&&<div className="guide-decision-warnings"><h3>Before you commit</h3>{d.warnings.map(t=><p key={t}>{t}</p>)}</div>}{d?.comparison.length>0&&<><h3>Compare another direction</h3>{d.comparison.map(c=><div className="guide-alternative" key={c.id}><p>{c.reason}</p>{onPreview&&<Button onClick={()=>onPreview(c.id)}>Preview {c.name} <ArrowRight size={14}/></Button>}</div>)}</>}{d?.stageReasons.length>0&&<details className="guide-stage-explanation"><summary>What each class adds</summary>{d.stageReasons.map((s,i)=><div key={s.id}><h3>{i+1}. {s.name}{s.detour?' · training stop':''}</h3><p>{s.reason}</p>{s.mastery&&<p className="text-xs text-muted">Reported mastery: {s.mastery} — {s.masteryEffect} Earn it separately; changing class does not automatically learn it.</p>}</div>)}</details>}{guide.sourceContext?.length>0&&<details className="guide-stage-explanation"><summary>Additional reference context</summary>{guide.sourceContext.map((t,i)=><p key={i}>{t}</p>)}</details>}<h3>Source & confidence</h3><p>Build names and decision notes are this planner’s interpretation of the recorded route and reported class profiles.</p><p>{guide.verification}</p><p>{guide.scope} · source checked {guide.checked}</p><SourceLink href={guide.url}>Read the publisher’s guide</SourceLink></div>;}

function GuideRoute({guide,onCopy,disabled}){if(!guide.stages.length)return <p className="text-muted mt-4">This reference gives general advice without a class sequence. Read its guide notes and keep your current plan.</p>;return <div className="guide-route">{guide.stages.map((id,i)=><div key={id}><span>{String(i+1).padStart(2,'0')}</span><section><small>{CLASSES[id].tier}</small><strong>{CLASSES[id].name}</strong><p>{Object.entries(CLASSES[id].requirements).map(([s,r])=>`${SKILLS[s]} ${r}`).join(' · ')||'Special unlock'}</p></section>{onCopy&&<IconButton label={`Copy ${CLASSES[id].name} to your plan`} disabled={disabled||onCopy.has(id)} onClick={()=>onCopy.add(id)}><Plus size={17}/></IconButton>}</div>)}</div>;}



export default function Planner({mode,character,member,build,context,recruited,onPatch,onDetails,onStats,onEdit,onAchievement,selectedClass,onSelectClass,onCompare=()=>{}}){

 const guides=buildsFor(character.id),goal=getGoal(build,member,context,CLASSES);

 const [choice,setChoice]=useState(member.referenceChoice||'custom'),[pending,setPending]=useState(null),[notes,setNotes]=useState(null),[comparison,setComparison]=useState(null),[task,setTask]=useState(''),[dragging,setDragging]=useState(null),[resetOpen,setResetOpen]=useState(false),[copyLoadout,setCopyLoadout]=useState(false);

 const dragRef=useRef(null),stages=member.customPlan?.stages||[],viewId=stages.includes(selectedClass)?selectedClass:goal?.cid||stages[0],viewClass=CLASSES[viewId],reference=guides.find(b=>b.id===choice),preview=guides.find(b=>b.id===pending);

 function edit(patch){onPatch({customPlan:{stages,role:member.customPlan?.role||'',notes:member.customPlan?.notes||'',tasks:member.customPlan?.tasks||[],...patch}});}

 function apply(guide){if(!guide.stages.length)return;onPatch({...(copyLoadout?{loadout:guideLoadout(guide,member.loadout)}:{}),build:guide.id,referenceChoice:guide.id,customPlan:{stages:[...guide.stages],role:guide.role||'',notes:'',tasks:[]}});onSelectClass(guide.stages[0]);setPending(null);setComparison(null);onCompare(false);}

 function chooseReference(id){setCopyLoadout(false);setChoice(id);onPatch({referenceChoice:id});if(id==='custom'){setPending(null);setNotes(null);stopCompare();}else if(!guides.find(g=>g.id===id)?.stages.length){setPending(null);setNotes(guides.find(g=>g.id===id));}else setPending(id);}

 function resetPlan(){onPatch({build:'',referenceChoice:'custom',customPlan:{stages:[],role:'',notes:'',tasks:[]}});setChoice('custom');setPending(null);setNotes(null);stopCompare();setTask('');setDragging(null);setResetOpen(false);onSelectClass(undefined);}

 function copyClass(id){if(!stages.includes(id))edit({stages:[...stages,id]});}

 function expand(){setComparison(preview);setPending(null);onCompare(true);}

 function stopCompare(){setComparison(null);onCompare(false);}

 function reorder(from,to){if(from===null||from===to)return;const next=[...stages],item=next.splice(from,1)[0];next.splice(to,0,item);edit({stages:next});}

 function pointerMove(e){const d=dragRef.current;if(!d||e.pointerId!==d.pointerId)return;if(Math.abs(e.clientY-d.y)>6)d.active=true;if(d.active){e.preventDefault();const row=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-stage-index]');if(row){d.target=Number(row.dataset.stageIndex);setDragging(d.target);}}}

 function pointerEnd(e){const d=dragRef.current;if(!d||e.pointerId!==d.pointerId)return;if(d.active)reorder(d.from,d.target);dragRef.current=null;setDragging(null);}

 const editor=<div className="planner-editor">

  <section className="guide-start guide-start-top"><div className="reference-controls"><Select label="Reference starting point" value={choice} onChange={chooseReference}><option value="custom">Custom build · your own plan</option>{guides.map(b=><option key={b.id} value={b.id}>{SOURCES[b.source]?.name} · {b.name}</option>)}</Select>{reference&&<><Button onClick={()=>setNotes(reference)}><BookOpen size={16}/> Guide notes</Button><Button variant="primary" onClick={()=>setPending(reference.id)}>Preview build <ArrowRight size={16}/></Button></>}</div><details className="reference-help"><summary>{reference?'About this reference':'How references work'}</summary><p>Preview a sourced build, copy individual classes, or explicitly apply the whole route. Your plan stays until you choose an override.</p>{reference?.decision&&<div className="guide-choice-summary"><Badge>{reference.decision.kind}</Badge><p>{reference.decision.pick}</p>{reference.decision.warnings[0]&&<p className="catalog-uncertainty">{reference.decision.warnings[0]}</p>}</div>}{!guides.length&&<p>No published guide yet. Your custom planner is ready below.</p>}</details></section>

  <div className="plan-heading"><div><h2>Shape your build</h2></div><div className="plan-editor-actions"><Badge>{stages.length?`${stages.length} planned classes`:'Empty plan'}</Badge><Button variant="danger" disabled={!recruited||!(stages.length||member.customPlan?.role||member.customPlan?.notes||member.customPlan?.tasks?.length||member.build)} onClick={()=>setResetOpen(true)}><Trash2 size={15}/> Reset class plan</Button></div></div>

  <fieldset disabled={!recruited}>

   <label className="field planner-role"><span>Your role</span><input value={member.customPlan?.role||''} placeholder="e.g. Mobile healer" onChange={e=>edit({role:e.target.value})}/></label>

   <h3 className="font-semibold mb-2">Planned classes</h3><p className="text-muted text-sm mb-5">Drag to reorder, or focus a grip and press ↑ or ↓.</p>

   {!stages.length&&<p className="empty-route-note">Add your first class below or preview a reference.</p>}

   <div className="editable-route">{stages.map((id,i)=><div className={`editable-stage ${dragging===i?'drag-target':''}`} data-stage-index={i} key={id} onDragOver={e=>{e.preventDefault();setDragging(i);}} onDrop={e=>{e.preventDefault();const from=Number(e.dataTransfer.getData('text/plain'));if(Number.isInteger(from)&&from>=0&&from<stages.length)reorder(from,i);setDragging(null);}}>

    <button type="button" className="drag-grip" aria-label={`Reorder ${CLASSES[id]?.name}. Use up and down arrows.`} onPointerDown={e=>{if(!recruited)return;e.currentTarget.setPointerCapture(e.pointerId);dragRef.current={from:i,target:i,pointerId:e.pointerId,y:e.clientY,active:false};}} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={()=>{dragRef.current=null;setDragging(null);}} onKeyDown={e=>{if(e.key==='ArrowUp'&&i>0){e.preventDefault();reorder(i,i-1);}if(e.key==='ArrowDown'&&i<stages.length-1){e.preventDefault();reorder(i,i+1);}}}><GripVertical size={21}/></button>

    <span>{String(i+1).padStart(2,'0')}</span><Select label={'Stage '+(i+1)} value={id} onChange={cid=>edit({stages:stages.map((x,n)=>n===i?cid:x).filter((x,n,a)=>a.indexOf(x)===n)})}>{Object.values(CLASSES).map(c=><option key={c.id} value={c.id}>{c.tier} · {c.name}</option>)}</Select><IconButton label={`Delete ${CLASSES[id]?.name} from plan`} onClick={()=>edit({stages:stages.filter((_,n)=>n!==i)})}><Trash2 size={18}/></IconButton>

   </div>)}</div>

   <Select className="mt-5" label="Add another class" value="" onChange={id=>{if(id)edit({stages:[...stages,id]});}}><option value="">Choose a class…</option>{Object.values(CLASSES).filter(c=>!stages.includes(c.id)).map(c=><option key={c.id} value={c.id}>{c.tier} · {c.name}</option>)}</Select>

   <div className="planner-extras"><div className="planner-goals"><h3>Your own goals</h3>{member.customPlan?.tasks?.map(t=><div className="custom-task" key={t.id}><span>{t.label}</span><IconButton label={`Delete goal: ${t.label}`} onClick={()=>edit({tasks:member.customPlan.tasks.filter(x=>x.id!==t.id)})}><Trash2 size={18}/></IconButton></div>)}<form onSubmit={e=>{e.preventDefault();if(task.trim()){edit({tasks:[...(member.customPlan?.tasks||[]),{id:crypto.randomUUID(),label:task.trim(),done:false}]});setTask('');}}}><input aria-label="New personal goal" placeholder="e.g. Master Light Cavalry for its reward" value={task} onChange={e=>setTask(e.target.value)}/><button className="btn btn-secondary" type="submit">Add goal</button></form></div>

   <label className="field planner-notes"><span>Build notes</span><textarea rows="3" placeholder="Equipment ideas, team synergy, or your training plan…" value={member.customPlan?.notes||''} onChange={e=>edit({notes:e.target.value})}/></label></div>

  </fieldset><p className="inline-note"><Info size={16}/> Class access can depend on character and path. Confirm your custom class choices in-game.</p>

 </div>;

 return <>

 {mode==='overview'?<div className="glance-view">

  <div className="plan-heading"><div><span className="eyebrow">YOUR CLASS JOURNEY</span><h2>{member.customPlan?.role||'Your custom build'}</h2></div><Button onClick={onEdit}>Edit your plan <ArrowRight size={16}/></Button></div>

  <ClassTabs stages={stages} member={member} selected={viewId} onSelect={onSelectClass}/>

  {viewClass?<><div className="stage-preview-heading"><div><span className="eyebrow">{viewId===goal?.cid?'YOUR NEXT STEP':'CLASS PREVIEW'}</span><h2>{viewClass.name}</h2></div><Button onClick={()=>onDetails(viewId)}>Class details <ArrowRight size={16}/></Button></div><div className="action-board"><section><span className="eyebrow">01 / TRAIN</span><h2>Work on these skills</h2>{viewClass.uncertainty&&<p className="catalog-uncertainty">{viewClass.uncertainty}</p>}{Object.entries(viewClass.requirements).map(([skill,target])=><div className="training-action" key={skill}><strong>{SKILLS[skill]}</strong><span>{member.ranks[skill]||'Unknown'} → <b>{target}</b></span><em>{rankMet(member.ranks[skill],target)?'Ready':'Train next'}</em></div>)}{!Object.keys(viewClass.requirements).length&&<p>{viewClass.unlockNote||'Follow the special class unlock.'}</p>}<button className="text-link mt-6" onClick={onStats}>Update your ranks <ArrowRight size={15}/></button></section><section><span className="eyebrow">02 / CERTIFY</span><h2>Unlock {viewClass.name}</h2><p>{viewClass.noExam?'Complete this class’s special unlock.':`Aim for level ${viewClass.idealLevel||'—'}${viewClass.renown?` and Renown ${viewClass.renown}`:''}, then check the exam in-game.`}</p>{['Master','Divine'].includes(viewClass.tier)&&context.part!=='III'&&<Badge>Part III target</Badge>}<CheckRow label="I've unlocked this class" checked={member.certified[viewId]} disabled={!recruited} onChange={v=>onAchievement(viewId,'certified',v)}/><button className="text-link mt-6" onClick={()=>onDetails(viewId)}>Exam & mastery details <ArrowRight size={15}/></button></section></div></>:<Panel className="p-8"><h2>Create your first plan</h2><Button className="mt-5" onClick={onEdit}>Edit plan <Plus size={16}/></Button></Panel>}

  <section className="personal-goals"><div className="plan-heading"><h2>Your own goals</h2><button className="text-link" onClick={onEdit}>Add a goal <Plus size={15}/></button></div>{member.customPlan?.tasks?.length?member.customPlan.tasks.map(t=><CheckRow key={t.id} label={t.label} checked={t.done} disabled={!recruited} onChange={done=>edit({tasks:member.customPlan.tasks.map(x=>x.id===t.id?{...x,done}:x)})}/>):<p className="text-muted">Plan a weapon, a mastery reward, or anything your team needs.</p>}</section>

 </div>:<div className={comparison?'planner-compare':''}>{editor}{comparison&&<aside className="comparison-reference"><div className="plan-heading"><div><span className="eyebrow">REFERENCE · {SOURCES[comparison.source]?.name}</span><h2>{comparison.name}</h2></div><IconButton label="Close comparison" onClick={stopCompare}><X size={20}/></IconButton></div><p className="text-muted">Copy individual classes with + while editing your own plan on the left.</p><GuideRoute guide={comparison} disabled={!recruited} onCopy={{has:id=>stages.includes(id),add:copyClass}}/><GuideNotes guide={comparison} onPreview={id=>setPending(id)}/><Button variant="primary" disabled={!recruited} className="mt-6" onClick={()=>setPending(comparison.id)}>Preview full override <ArrowRight size={16}/></Button></aside>}</div>}

 {preview&&<Dialog label={`Preview ${preview.name}`} className="guide-preview-dialog" onClose={()=>setPending(null)}><div className="plan-heading"><div><span className="eyebrow">{SOURCES[preview.source]?.name} REFERENCE</span><h2>{preview.name}</h2></div><IconButton label="Close guide preview" onClick={()=>setPending(null)}><X size={21}/></IconButton></div><div className="preview-columns"><section><h3>Your current plan</h3>{stages.length?<GuideRoute guide={{stages}}/>:<p className="text-muted mt-4">No classes planned yet.</p>}<p className="text-muted mt-4">{member.customPlan?.role||'No role set'}</p></section><section><h3>Reference plan</h3><GuideRoute guide={preview}/><p className="text-muted mt-4">{preview.role}</p></section></div><details className="preview-notes"><summary>Guide notes & source</summary><GuideNotes guide={preview} onPreview={id=>setPending(id)}/></details><p className="override-note"><Info size={17}/><span>{stages.length||member.customPlan?.tasks?.length||member.customPlan?.notes||member.customPlan?.role?'Override replaces your planned classes, role, notes and personal goals.':'Apply copies this guide into your editable custom plan.'} Your current class, level, weapon ranks, certifications, mastery and prepared equipment stay saved.</span></p><CheckRow label="Also copy guide equipment and mastery goals" description="Replaces planned equipment and ability goals. Current loadout, owned items and learned abilities stay saved. Leave unchecked to change classes only." checked={copyLoadout} onChange={setCopyLoadout}/><div className="preview-actions"><Button onClick={()=>setPending(null)}>Keep my plan</Button><Button onClick={expand}><Columns2 size={17}/> Compare side by side</Button><Button variant="primary" disabled={!recruited||!preview.stages.length} onClick={()=>apply(preview)}>{stages.length?'Override my plan':'Use this plan'} <ArrowRight size={16}/></Button></div></Dialog>}

 {resetOpen&&<Dialog label="Reset class plan?" className="reset-plan-dialog" onClose={()=>setResetOpen(false)}><h2>Reset class plan?</h2><p>This clears all planned classes, your custom role, build notes, personal goals and the reference association.</p><p><strong>Your current class, character level, skill ranks, certifications, mastery and prepared equipment stay saved.</strong></p><div><Button onClick={()=>setResetOpen(false)}>Keep my plan</Button><Button variant="danger" onClick={resetPlan}><Trash2 size={16}/> Reset class plan</Button></div></Dialog>}

 {notes&&<Dialog label={`${notes.name} guide notes`} className="guide-notes-dialog" onClose={()=>setNotes(null)}><div className="plan-heading"><h2>{notes.name}</h2><IconButton label="Close guide notes" onClick={()=>setNotes(null)}><X size={21}/></IconButton></div><GuideNotes guide={notes} onPreview={id=>{setNotes(null);setPending(id);}}/></Dialog>}

 </>;

}
