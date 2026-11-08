import React,{useRef,useState} from 'react';
import {Download,Upload,CheckCircle2} from 'lucide-react';
import {Button,Panel} from './components.jsx';
import {downloadBackup,MAX_BACKUP_BYTES,parseBackup} from './backup.js';
import BackupPreview from './BackupPreview.jsx';
import DriveBackupPanel from './DriveBackupPanel.jsx';

export default function BackupWorkspace({state,saved,onRestore}){
 const [pending,setPending]=useState(null),[reading,setReading]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 const request=useRef(0);
 function exportSave(){
  setError('');setMessage('');
  try{downloadBackup(state);setMessage('Backup download requested.');}
  catch{setError('The backup could not be downloaded. Please try again.');}
 }
 async function chooseFile(event){
  const file=event.target.files?.[0],id=++request.current;
  event.target.value='';setPending(null);setError('');setMessage('');
  if(!file)return;
  setReading(true);
  try{
   if(file.size>MAX_BACKUP_BYTES)throw new Error('Choose a backup smaller than 5 MB.');
   const backup=parseBackup(await file.text());
   if(id===request.current)setPending({...backup,filename:file.name});
  }catch(cause){if(id===request.current)setError(cause.message||'This file could not be read. Try choosing it again.');}
  finally{if(id===request.current)setReading(false);}
 }
 function restore(){
  if(!pending)return;
  setError('');setMessage('');
  try{
   onRestore(pending.state);setPending(null);
   setMessage('Backup restored.');
  }catch{setError('Couldn’t save in this browser. Progress is unchanged. Allow browser storage or free some space, then retry.');}
 }
 return <section className="backup-workspace">
  <div className="page-heading"><div><h1>Backup & restore</h1><p>Back up all four paths.</p></div></div>
  {!saved&&<p className="backup-error" role="alert">Browser storage unavailable. Export a backup to keep your progress.</p>}
  <DriveBackupPanel state={state} onRestore={onRestore}/>
  <div className="backup-columns">
   <Panel className="backup-card"><Download size={24}/><h2>Export backup</h2><p>Download all four paths as a JSON file.</p><Button variant="primary" onClick={exportSave}><Download size={16}/> Export backup</Button></Panel>
   <Panel className="backup-card"><Upload size={24}/><h2>Import backup</h2><p>Restore from a JSON backup.</p><label className="backup-file"><span>Choose backup file</span><input type="file" accept=".json,application/json" onChange={chooseFile} disabled={reading} aria-label="Choose backup file"/></label><small>JSON · Up to 5 MB</small>{reading&&<p role="status">Reading backup…</p>}
    {pending&&<BackupPreview backup={pending} onRestore={restore} onCancel={()=>setPending(null)}/>}
   </Panel>
  </div>
  {error&&<p className="backup-error" role="alert">{error}</p>}
  {message&&<p className="backup-success" role="status"><CheckCircle2 size={18}/>{message}</p>}
 </section>;
}
