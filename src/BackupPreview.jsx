import React,{useState} from 'react';
import {Upload} from 'lucide-react';
import {Button,CheckRow} from './components.jsx';
import {backupSummary} from './backup.js';

export default function BackupPreview({backup,onRestore,onCancel,disabled=false}){
 const [confirmed,setConfirmed]=useState(false);
 return <div className="backup-preview"><h3>Ready to restore</h3><p className="backup-filename">{backup.filename}</p><p>Exported {new Date(backup.exportedAt).toLocaleString()}</p>
  <table><caption className="sr-only">Progress in the selected backup</caption><thead><tr><th scope="col">Path</th><th scope="col">Allies</th><th scope="col">Quests done</th></tr></thead><tbody>{backupSummary(backup.state).map(path=><tr key={path.id}><th scope="row">{path.name}</th><td>{path.characters}</td><td>{path.quests}</td></tr>)}</tbody></table>
  <p className="backup-replace-note">This replaces saved progress for all four paths.</p>
  <CheckRow label="Replace my saved progress for all four paths" checked={confirmed} onChange={setConfirmed} disabled={disabled}/>
  <div className="backup-actions"><Button disabled={disabled} onClick={onCancel}>Cancel import</Button><Button variant="primary" disabled={!confirmed||disabled} onClick={()=>onRestore(backup.state)}><Upload size={16}/> Restore backup</Button></div>
 </div>;
}
