// Development-only browser harness: real UI/client, simulated OAuth and Drive HTTP.
// This file is not a Vite production entry and contains no real Google credentials.
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import DriveBackupPanel from '../../src/DriveBackupPanel.jsx';
import DriveHeaderControls from '../../src/DriveHeaderControls.jsx';
import {createDriveClient,DRIVE_SCOPE} from '../../src/googleDrive.js';
import {emptyState} from '../../src/model.js';
import '../../src/styles.css';

const clientId='1234567890-browser-test.apps.googleusercontent.com';
const identityLoader=()=>Promise.resolve(identity);
let expired=false,calls=0,files=[];
const identity={initTokenClient(config){return {requestAccessToken(){expired=false;config.callback({access_token:'simulated-only',scope:DRIVE_SCOPE,expires_in:3600});}};}};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
const client=createDriveClient({clientId,fetchImpl:async(url,options)=>{
 calls++;if(expired)return json({error:{}},401);
 if(options.method==='POST'){
  const parts=options.body.split('\r\n\r\n'),metadata=JSON.parse(parts[1].split('\r\n--')[0]),text=parts[2].split('\r\n--')[0];
  const file={id:String(files.length+1),name:metadata.name,createdTime:new Date().toISOString(),text};files.unshift(file);return json(file);
 }
 if(url.includes('alt=media'))return new Response(files.find(file=>url.includes('/'+file.id+'?')).text);
 return json({files:files.map(({text,...file})=>file)});
}});
function Preview(){
 const [state,setState]=useState(()=>{const s=emptyState();s.paths.cai.members.cai.level='12';return s;}),[count,setCount]=useState(0),[showPanel,setShowPanel]=useState(true);
 return <main className="backup-workspace" style={{padding:'28px'}}><h1>Test preview — simulated Google responses</h1><p>No real Google account or browser save is used.</p>
  <header className="topbar"><div className="topbar-breadcrumbs">Build companion · Cai’s path</div><DriveHeaderControls state={state} onManage={()=>setShowPanel(true)} clientId={clientId} client={client} identityLoader={identityLoader}/></header>
  <div style={{display:'flex',gap:16,flexWrap:'wrap',margin:'20px 0'}}><label>Current Cai level <input aria-label="Current Cai level" value={state.paths.cai.members.cai.level} onChange={e=>setState(s=>({...s,paths:{...s.paths,cai:{...s.paths.cai,members:{...s.paths.cai.members,cai:{...s.paths.cai.members.cai,level:e.target.value}}}}}))}/></label><button onClick={()=>{expired=true;}}>Simulate expired access</button><button onClick={()=>setCount(calls)}>Check request count</button><span>Drive requests: {count}</span><button onClick={()=>{files.unshift({id:'damaged',name:'damaged-backup.json',text:'invalid json'});}}>Add damaged backup</button></div>
  <button onClick={()=>setShowPanel(value=>!value)}>{showPanel?'Leave backup page':'Return to backups'}</button>
  {showPanel&&<DriveBackupPanel state={state} onRestore={setState} clientId={clientId} client={client} identityLoader={identityLoader}/>}
 </main>;
}
createRoot(document.getElementById('root')).render(<Preview/>);
