import LoadoutWorkspace from './LoadoutWorkspace.jsx';
import ClassTabs from './ClassTabs.jsx';
import {startingRecord} from './startingData.js';
import Planner from './Planner.jsx';
import React,{useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Check,ChevronRight,Info,Star,BookOpen,GraduationCap,Target,Shield,CheckCircle2} from 'lucide-react';
import {RANKS,ROLES} from './catalog.js';
import {SOURCES} from './sourceData.js';
import {CLASSES,SKILLS,buildsFor,selectedBuild,INNATE,SPELL_MILESTONES} from './buildData.js';
import {EQUIPMENT,STAGE_COACHING} from './equipmentData.js';
import {getGoal,rankMet,setAchievement,memberCounts} from './model.js';
import {Button,IconButton,Panel,Select,NumberField,Badge,SourceLink,Portrait,CheckRow,HelpDetails} from './components.jsx';

// This single workspace renders every character and publisher's build from JS data.
export default function CharacterWorkspace({character,path,member,context,recruited,mandatory,revealed,onReveal,onPatch,onAdd,onRemove,onClose}){
 const builds=buildsFor(character.id),build=selectedBuild(character.id,member),goal=getGoal(build,member,context,CLASSES);
 const [tab,setTab]=useState(()=>build?.stages.length?'overview':'planner'),[selectedStage,setSelectedStage]=useState(goal?.cid||build?.stages[0]),[overviewLayout,setOverviewLayout]=useState('cards'),currentRef=useRef(),contentRef=useRef();
 useEffect(()=>{contentRef.current?.scrollTo({top:0});},[tab]);
 useEffect(()=>{if(build&&!build.stages.includes(selectedStage))setSelectedStage(goal?.cid||build.stages[0]);},[build?.id,JSON.stringify(build?.stages)]);
 const start=startingRecord(character.id,path.id);
 const stage=CLASSES[selectedStage],counts=memberCounts(build,member),skills=[...new Set((build?.stages||[]).flatMap(id=>Object.keys(CLASSES[id].requirements)))];
 const current=CLASSES[member.currentClass]?.name||member.currentClass||'Not recorded';
 function achievement(cid,kind,value){const m=setAchievement(member,cid,kind,value);onPatch({certified:m.certified,mastered:m.mastered,currentClass:m.currentClass});}
 const innate=INNATE[character.id],spells=SPELL_MILESTONES[character.id]||[];
 return <div className="workspace" style={{'--path':path.color}}>
  <aside className="character-sidebar" aria-label="Character information"><header className="workspace-top"><Button className="!border-0 !bg-transparent !px-0" onClick={onClose}><ArrowLeft size={16}/> Back to roster</Button><span>{path.name}'s path <ChevronRight size={12}/> {character.name}</span><IconButton label={member.favorite?'Unpin from main team':'Pin to main team'} disabled={!recruited} onClick={()=>onPatch({favorite:!member.favorite})}><Star size={17} fill={member.favorite?'currentColor':'none'}/></IconButton></header>
  <div className="workspace-heading"><Portrait character={character} revealed={revealed} onReveal={onReveal}/><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2 mb-3"><Badge tone="path">{mandatory?'Mandatory member':recruited?'Recruited':'Guide preview'}</Badge><Badge>{build?.role||ROLES[character.id]||'Choose your role'}</Badge></div><h1>{character.name}</h1><p className="mt-2 text-sm text-muted">{build?build.name:'Your character workspace'}</p></div>{!recruited&&<Button variant="primary" onClick={onAdd}>Add to roster <ArrowRight size={15}/></Button>}</div>
  {!recruited&&<p className="notice mb-5"><Info size={15}/> Add this character to the roster to record their build progress.</p>}
  </aside><div className="workspace-main">
   <div className="workspace-tabs" role="tablist" aria-label="Character guide sections">{[['overview','Next steps'],['planner','Edit plan'],['progress','Class details'],['loadout','Loadout & abilities'],['stats','Character stats']].map(([id,label])=><button type="button" role="tab" key={id} aria-selected={tab===id} id={'tab-'+id} aria-controls={'panel-'+id} onClick={()=>setTab(id)} className={tab===id?'active':''}>{label}</button>)}</div>
   <div className="workspace-content" ref={contentRef} tabIndex={0} role="tabpanel" id={'panel-'+tab} aria-labelledby={'tab-'+tab}>{tab==='stats'&&<div className="stats-page">   <div ref={currentRef}><Panel className="p-5"><div className="section-title"><Target size={17}/><h2>Current character</h2></div>{start?<div className="starting-record-note"><Badge>{start.status}</Badge><HelpDetails label="Starting data & source"><p>{start.note}</p><SourceLink href={start.url}>Starting record source</SourceLink></HelpDetails></div>:<p className="starting-record-note">Starting stats unknown. Enter values from your game.</p>}<fieldset disabled={!recruited} className="space-y-4 mt-5">
    <Select label="Current class" hint="Selecting a class also marks it certified. Mastery is recorded separately." value={member.currentClass} onChange={cid=>onPatch({currentClass:cid,certified:cid in CLASSES?{...member.certified,[cid]:true}:member.certified})}><option value="">Not recorded</option><option value="Commoner">Commoner</option><option value="Noble">Noble</option>{Object.values(CLASSES).map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</Select>
    <NumberField label="Character level (optional)" value={member.level} onChange={level=>onPatch({level})}/>
    <div><h3 className="text-xs text-muted font-medium mb-3">Relevant skill ranks</h3><div className="grid grid-cols-2 gap-3">{Object.keys(SKILLS).map(skill=><Select key={skill} label={SKILLS[skill]} value={member.ranks[skill]} onChange={rank=>onPatch({ranks:{...member.ranks,[skill]:rank}})}><option value="">Unknown</option>{RANKS.slice(1).map(r=><option key={r}>{r}</option>)}</Select>)}</div></div>
   </fieldset>{!mandatory&&recruited&&<Button variant="danger" className="mt-6" onClick={onRemove}>Remove from this roster</Button>}</Panel></div>
</div>}{['overview','planner'].includes(tab)&&<Planner mode={tab} character={character} member={member} build={build} context={context} recruited={recruited} onPatch={onPatch} onDetails={id=>{setSelectedStage(id);setTab('progress');}} onStats={()=>setTab('stats')} onEdit={()=>setTab('planner')} onAchievement={achievement} selectedClass={selectedStage} onSelectClass={setSelectedStage} onCompare={()=>{}} layout={overviewLayout} onLayoutChange={setOverviewLayout}/>}
   {tab==='progress'&&<ClassTabs stages={build?.stages||[]} member={member} selected={selectedStage} onSelect={setSelectedStage}/>}
   {tab==='progress'&&(stage&&build?<Panel className="p-5 sm:p-6"><div className="flex flex-wrap justify-between items-start gap-3"><div><span className="eyebrow">{stage.tier.toUpperCase()} / STAGE {build.stages.indexOf(stage.id)+1}</span><h2 className="text-2xl font-semibold mt-2">{stage.name}</h2></div>{member.currentClass===stage.id&&<Badge tone="path">Current class</Badge>}</div><div className="stage-facts"><span>Ideal level <strong>{stage.idealLevel||'—'}</strong></span><span>{stage.renown?'Renown target':'Availability'} <strong>{stage.renown|| (stage.tier==='Master'?'Part III':'Quest unlock')}</strong></span><span>License <strong>{stage.noExam?'Special unlock':stage.tier}</strong></span></div><div className="section-title mt-6 mb-3"><Target size={16}/><h3>Listed training targets</h3></div>{Object.entries(stage.requirements).length?<div className="requirement-table">{Object.entries(stage.requirements).map(([s,r])=><div className="requirement-row" key={s}><span>{SKILLS[s]}</span><span>{member.ranks[s]||'Unknown'} <ArrowRight size={12}/> {r}</span><span className={rankMet(member.ranks[s],r)?'text-emerald-300':'text-muted'}>{rankMet(member.ranks[s],r)?<><Check size={13}/> Target met</>:member.ranks[s]?'Train next':'Record rank'}</span></div>)}</div>:<p className="text-sm text-muted">This stage uses a special class unlock rather than listed exam ranks.</p>}{stage.uncertainty&&<p className="inline-note"><Info size={14}/>{stage.uncertainty}</p>}{stage.unlockNote&&<div className="unlock-note"><strong>Unlock this class</strong><p>{stage.unlockNote}</p></div>}
    {STAGE_COACHING[stage.id]&&<HelpDetails label="Training advice"><p>{STAGE_COACHING[stage.id]}</p></HelpDetails>}<fieldset disabled={!recruited} className="achievement-grid"><div><CheckRow label={stage.noExam?'Class unlocked':'Class certified'} checked={member.certified[stage.id]} onChange={value=>achievement(stage.id,'certified',value)}/></div><div><CheckRow label="Mastery earned" checked={member.mastered[stage.id]} onChange={value=>achievement(stage.id,'mastered',value)}/></div></fieldset>
    <div className="mastery-note"><Shield size={18}/><div><strong>{stage.mastery.name}</strong><p>{stage.mastery.effect}</p></div></div><p className="text-xs text-muted mt-4 leading-relaxed">Targets are recommendations. Verify the exam and unlock requirements in-game.</p><SourceLink href={stage.url}>Class reference · {SOURCES[stage.source].name}</SourceLink>
   </Panel>:<Panel className="p-6"><BookOpen size={25}/><h2 className="text-lg mt-4">Your notes start with a clear role</h2><p className="text-sm text-muted mt-3 leading-relaxed">There is no sourced prebuilt route for {character.name} in this library yet. Create a custom route in Edit plan, or record your current class and ranks in Character stats.</p></Panel>)}
   {tab==='loadout'&&<LoadoutWorkspace character={character} member={member} build={build} recruited={recruited} onPatch={onPatch} onStats={()=>setTab('stats')}/>}

   </div>
  </div>
 </div>;
}
