import React,{useEffect,useMemo,useRef,useState,useSyncExternalStore} from 'react';
import {Cloud,RefreshCw,X} from 'lucide-react';
import {getDriveClient,GOOGLE_CLIENT_ID,loadGoogleIdentity,validClientId} from './googleDrive.js';

export default function DriveHeaderControls({state,onManage,clientId=GOOGLE_CLIENT_ID,client:providedClient,identityLoader=loadGoogleIdentity}){
 const client=useMemo(()=>providedClient||getDriveClient(clientId),[providedClient,clientId]);
 const {connected,remembered,connecting,saving,lastSaved}=useSyncExternalStore(client.subscribe,client.getSnapshot);
 const [identity,setIdentity]=useState(null),[preparing,setPreparing]=useState(false),[notice,setNotice]=useState(null);
 const mounted=useRef(false);
 async function prepare(){
  setPreparing(true);setNotice(null);
  try{const library=await identityLoader();if(mounted.current)setIdentity(library);}
  catch(error){if(mounted.current)setNotice({error:true,text:error.message||'Google could not load. Try again.'});}
  finally{if(mounted.current)setPreparing(false);}
 }
 useEffect(()=>{mounted.current=true;if(validClientId(clientId))prepare();return()=>{mounted.current=false;};},[clientId,identityLoader]);
 useEffect(()=>{
  if(!notice||notice.error)return;
  const timer=setTimeout(()=>setNotice(null),3500);return()=>clearTimeout(timer);
 },[notice]);
 async function connect(){
  if(!identity){prepare();return;}
  setNotice(null);
  try{await client.connect(identity);if(mounted.current)setNotice({text:'Google Drive connected.'});}
  catch(error){if(mounted.current)setNotice({error:true,text:error.message||'Couldn’t connect to Google Drive.'});}
 }
 async function sync(){
  setNotice(null);
  try{await client.saveBackup(state);if(mounted.current)setNotice({text:'Backup saved.'});}
  catch(error){if(mounted.current)setNotice({error:true,text:error.code==='authorization'?error.message:'Save not confirmed. Check your Drive backups before retrying.'});}
 }
 if(!validClientId(clientId))return null;
 const connectionLabel=connected?'Google Drive':connecting?'Connecting…':preparing?'Loading…':remembered?'Reconnect':'Connect Drive';
 return <div className="drive-header" aria-label="Google Drive controls">
  <button type="button" className={`drive-header-button drive-header-connection ${connected?'is-connected':''}`} onClick={connected?onManage:connect} disabled={connecting||saving||(!connected&&preparing)} aria-label={connected?'Google Drive connected. Manage backups':remembered?'Reconnect Google Drive':'Connect Google Drive'} title={connected?'Manage Google Drive backups':remembered?'Reconnect Google Drive':'Connect Google Drive'}>
   <Cloud size={17}/><span className="drive-header-label">{connectionLabel}</span>
  </button>
  {connected&&<button type="button" className="drive-header-button drive-header-sync" onClick={sync} disabled={connecting||saving} aria-label="Sync progress to Google Drive" title={lastSaved?`Save a backup to Google Drive · Last saved ${new Date(lastSaved).toLocaleString()}`:'Save a backup to Google Drive'}><RefreshCw size={15} className={saving?'is-spinning':''}/><span>{saving?'Syncing…':'Sync'}</span></button>}
  {notice&&<div className={`drive-header-notice ${notice.error?'is-error':''}`} role={notice.error?'alert':'status'}><span>{notice.text}</span><button type="button" aria-label="Dismiss Google Drive message" onClick={()=>setNotice(null)}><X size={14}/></button></div>}
 </div>;
}
