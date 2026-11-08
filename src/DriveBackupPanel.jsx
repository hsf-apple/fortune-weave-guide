import React,{useEffect,useMemo,useRef,useState,useSyncExternalStore} from 'react';
import {Cloud,Download,Upload,LogOut,CheckCircle2,X,UserRound} from 'lucide-react';
import {Button,Dialog,IconButton,Panel,Select} from './components.jsx';
import BackupPreview from './BackupPreview.jsx';
import {DriveError,getDriveClient,GOOGLE_CLIENT_ID,loadGoogleIdentity,validClientId} from './googleDrive.js';

export default function DriveBackupPanel({state,onRestore,clientId=GOOGLE_CLIENT_ID,client:providedClient,identityLoader=loadGoogleIdentity}){
 const configured=validClientId(clientId),client=useMemo(()=>providedClient||getDriveClient(clientId),[providedClient,clientId]);
 const {connected,remembered,connecting,saving,lastSaved}=useSyncExternalStore(client.subscribe,client.getSnapshot);
 const [identity,setIdentity]=useState(null),[busy,setBusy]=useState(''),[error,setError]=useState(''),[message,setMessage]=useState('');
 const [files,setFiles]=useState([]),[nextPage,setNextPage]=useState(''),[selected,setSelected]=useState(''),[pending,setPending]=useState(null);
 const [loadOpen,setLoadOpen]=useState(false),loadRequest=useRef(0),previousConnection=useRef(connected);
 async function prepare(){
  setBusy('Preparing Google connection…');setError('');
  try{setIdentity(await identityLoader());}catch(cause){setError(cause.message);}finally{setBusy('');}
 }
 // Loading Google's library does not authorize, read, or save any Drive data.
 useEffect(()=>{if(configured)prepare();return()=>{loadRequest.current++;};},[client,configured]);
 useEffect(()=>{
  if(previousConnection.current&&!connected&&!connecting){resetLoad();setBusy('');}
  previousConnection.current=connected;
 },[connected,connecting]);
 function clearSelection(){setFiles([]);setPending(null);setSelected('');setNextPage('');}
 function resetLoad(){loadRequest.current++;setLoadOpen(false);clearSelection();}
 function closeLoad(){resetLoad();setBusy('');setError('');setMessage('');}
 function report(cause){
  setError(cause.message||'Google Drive could not complete this action.');
  if(!client.connected()){resetLoad();setBusy('');}
 }
 function authorize(selectAccount=false){
  if(!identity)throw new DriveError('Google is still loading. Please try again.','identity');
  return client.connect(identity,{selectAccount});
 }
 async function ensureConnection(){if(!client.connected())await authorize();}
 async function connect(selectAccount=false){
  setError('');setMessage('');setBusy('Waiting for Google authorization…');resetLoad();
  try{await authorize(selectAccount);setMessage('Google Drive connected.');}
  catch(cause){report(cause);}finally{setBusy('');}
 }
 function disconnect(){client.disconnect();resetLoad();setError('');setMessage('Disconnected.');}
 async function save(){
  setBusy(client.connected()?'Saving to Google Drive…':'Connecting Google Drive…');setError('');setMessage('');
  try{await ensureConnection();setBusy('Saving to Google Drive…');await client.saveBackup(state);setMessage('Backup saved to Google Drive.');}
  catch(cause){report(cause);setMessage('Save was not confirmed. Use Load to check for a new backup before retrying.');}finally{setBusy('');}
 }
 async function preview(file,request){setPending(null);setSelected(file.id);const backup=await client.readBackup(file);if(request===loadRequest.current)setPending(backup);}
 async function load(){
  const request=++loadRequest.current;
  setBusy(client.connected()?'Loading backups from Google Drive…':'Connecting Google Drive…');setError('');setMessage('');clearSelection();
  try{
   await ensureConnection();if(request!==loadRequest.current)return;
   setLoadOpen(true);setBusy('Loading backups from Google Drive…');
   const result=await client.listBackups();if(request!==loadRequest.current)return;
   setFiles(result.files);setNextPage(result.nextPageToken);
   if(result.files.length)await preview(result.files[0],request);
   else setMessage('No backups found. Save a backup or try another Google account.');
  }catch(cause){if(request===loadRequest.current)report(cause);}finally{if(request===loadRequest.current)setBusy('');}
 }
 async function choose(id){
  const request=++loadRequest.current;
  setBusy('Reading backup…');setError('');setMessage('');
  try{await preview(files.find(file=>file.id===id),request);}catch(cause){if(request===loadRequest.current)report(cause);}finally{if(request===loadRequest.current)setBusy('');}
 }
 async function older(){
  const request=++loadRequest.current;
  setBusy('Loading older backups…');setError('');
  try{const result=await client.listBackups(nextPage);if(request!==loadRequest.current)return;setFiles(previous=>[...previous,...result.files.filter(file=>!previous.some(p=>p.id===file.id))]);setNextPage(result.nextPageToken);}
  catch(cause){if(request===loadRequest.current)report(cause);}finally{if(request===loadRequest.current)setBusy('');}
 }
 function restore(next){
  setError('');setMessage('');
  try{onRestore(next);resetLoad();setMessage('Backup restored.');}
  catch{setError('Couldn’t save in this browser. Progress is unchanged. Allow browser storage or free some space, then retry.');}
 }
 const disabled=Boolean(busy)||connecting||saving,needsIdentity=!connected&&!identity;
 return <Panel className="backup-card drive-backup-card"><div className="drive-heading"><Cloud size={26}/><div><h2>Google Drive backup</h2></div><span className={`drive-connection ${connected?'is-connected':''}`}>{connecting?'Connecting…':connected?'Connected':remembered?'Reconnect needed':'Not connected'}</span></div>
  {!configured?<p className="drive-unavailable">Google Drive is unavailable. Use file export or import below.</p>:<>
   <div className="drive-actions">{(connected||remembered)&&<><Button variant="primary" onClick={save} disabled={disabled||needsIdentity}><Upload size={16}/> Save to Google Drive</Button><Button onClick={load} disabled={disabled||needsIdentity}><Download size={16}/> Load from Google Drive</Button></>}
    {connected?<Button onClick={()=>connect(true)} disabled={disabled||!identity}><UserRound size={16}/> Switch account</Button>:<Button variant={remembered?'secondary':'primary'} onClick={identity?()=>connect():prepare} disabled={disabled}><Cloud size={16}/>{identity?(remembered?'Reconnect Google Drive':'Connect Google Drive'):'Retry Google connection'}</Button>}
    {(connected||remembered)&&<Button onClick={disconnect} disabled={disabled}><LogOut size={15}/> Disconnect</Button>}
   </div>
   {busy&&!loadOpen&&<p className="drive-progress" role="status">{busy}</p>}
   {lastSaved&&<p className="drive-last-saved">Last saved: {new Date(lastSaved).toLocaleString()}</p>}
   {loadOpen&&connected&&<Dialog label="Load from Google Drive" className="drive-load-dialog" onClose={closeLoad}>
    <div className="dialog-heading"><div><h2>Load from Google Drive</h2></div><IconButton label="Close Drive backups" onClick={closeLoad}><X size={20}/></IconButton></div>
    {busy&&<p className="drive-progress" role="status">{busy}</p>}
    {files.length>0&&<div className="drive-backup-list"><Select label="Drive backup to restore" value={selected} onChange={choose} disabled={Boolean(busy)}>{files.map(file=><option key={file.id} value={file.id}>{file.name}</option>)}</Select>{nextPage&&<Button onClick={older} disabled={Boolean(busy)}>Show older backups</Button>}</div>}
    {pending&&<BackupPreview key={selected} backup={pending} onRestore={restore} onCancel={closeLoad} disabled={Boolean(busy)}/>}
    {error&&<p className="backup-error" role="alert">{error}</p>}
    {message&&<p className="backup-success" role="status"><CheckCircle2 size={18}/>{message}</p>}
    {!pending&&<div className="backup-actions"><Button onClick={closeLoad}>Close</Button></div>}
   </Dialog>}
  </>}
  {error&&!loadOpen&&<p className="backup-error" role="alert">{error}</p>}
  {message&&!loadOpen&&<p className="backup-success" role="status"><CheckCircle2 size={18}/>{message}</p>}
  <small><a href="https://myaccount.google.com/connections" target="_blank" rel="noopener noreferrer">Manage Google access</a> · <a href="./privacy.html" target="_blank" rel="noopener noreferrer">Privacy</a></small>
 </Panel>;
}
