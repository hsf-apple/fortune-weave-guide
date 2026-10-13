import React,{useState} from 'react';
import {Search} from 'lucide-react';
import {PATHS} from './catalog.js';
import {QUESTS,QUEST_SOURCE} from './questData.js';
import {Panel,Select,SourceLink} from './components.jsx';

export default function QuestChecklist({pathId,completed,onToggle,onPath}){
 const [query,setQuery]=useState(''),[type,setType]=useState('all'),[status,setStatus]=useState('all');
 const done=QUESTS.filter(q=>completed[q.id]).length;
 const visible=QUESTS.filter(q=>`${q.name} ${q.requester} ${q.objective}`.toLowerCase().includes(query.trim().toLowerCase())&&(type==='all'||q.type===type)&&(status==='all'||Boolean(completed[q.id])===(status==='done'))).sort((a,b)=>Number(a.part)-Number(b.part)||(a.chapters[pathId]??999)-(b.chapters[pathId]??999)||a.name.localeCompare(b.name));
 return <>
  <div className="page-heading"><div><span className="eyebrow">YOUR ADVENTURE</span><h1>Quest checklist</h1><p>Check off completed quests. Progress is saved separately for each path.</p></div></div>
  <nav className="path-tabs" aria-label="Quest progress path">{PATHS.map(p=><button key={p.id} aria-pressed={pathId===p.id} className={pathId===p.id?'active':''} style={{'--tab-color':p.color}} onClick={()=>onPath(p.id)}>{p.name}</button>)}</nav>
  <div className="quest-summary" role="status"><strong>{done} / {QUESTS.length} completed</strong><progress aria-label="Quest completion" value={done} max={QUESTS.length}/></div>
  <div className="quest-filters"><label className="search-input"><Search size={16}/><input type="search" aria-label="Search quests" placeholder="Search quests, requesters or objectives" value={query} onChange={e=>setQuery(e.target.value)}/></label><Select label="Quest type" value={type} onChange={setType}><option value="all">All types</option>{[...new Set(QUESTS.map(q=>q.type))].map(t=><option key={t}>{t}</option>)}</Select><Select label="Completion" value={status} onChange={setStatus}><option value="all">All quests</option><option value="todo">Incomplete</option><option value="done">Completed</option></Select></div>
  <p className="text-sm text-muted my-4">{visible.length} quests shown · Chapter numbers are Game8's reported availability. An unlisted chapter does not confirm path availability.</p>
  <div className="quest-list">{visible.map(q=><Panel key={q.id} className={`quest-row ${completed[q.id]?'quest-done':''}`}><label className="quest-check"><input type="checkbox" checked={Boolean(completed[q.id])} onChange={e=>onToggle(q.id,e.target.checked)}/><span><strong>{q.name}</strong><small>{q.type} · Part {q.part} · {q.chapters[pathId]?`Chapter ${q.chapters[pathId]}`:'Chapter not listed for this path'}</small></span></label><p>{q.objective}</p><div className="quest-meta"><span>Requester: {q.requester}</span><SourceLink href={q.url}>Game8 guide</SourceLink></div></Panel>)}</div>
  {!visible.length&&<Panel className="empty-panel"><h2>No quests match</h2><p>Try another search or filter.</p></Panel>}
  <div className="footer-note"><p>174 entries from Game8, checked 13 October 2026. Source coverage may be incomplete. Deadlines and rewards are not included in this checklist.</p><SourceLink href={QUEST_SOURCE}>Quest source</SourceLink></div>
 </>;
}
