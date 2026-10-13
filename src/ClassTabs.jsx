import React from 'react';
import {Check} from 'lucide-react';
import {CLASSES} from './buildData.js';
export default function ClassTabs({stages=[],member,selected,onSelect}){
 return <div className="journey-track" role="group" aria-label="Planned classes">{stages.map((id,i)=><button className={`journey-stop ${member.certified[id]?'done':''} ${selected===id?'next':''}`} aria-pressed={selected===id} key={id} onClick={()=>onSelect(id)}><span>{member.certified[id]?<Check size={18}/>:String(i+1).padStart(2,'0')}</span><small>{CLASSES[id].tier}</small><strong>{CLASSES[id].name}</strong><em>{member.mastered[id]?'Mastered':member.certified[id]?'Certified':selected===id?'Viewing':'Planned'}</em></button>)}</div>;
}
