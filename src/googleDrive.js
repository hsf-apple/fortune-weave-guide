import {createBackup,MAX_BACKUP_BYTES,parseBackup} from './backup.js';

export const DRIVE_SCOPE='https://www.googleapis.com/auth/drive.appdata';
const API='https://www.googleapis.com/drive/v3/files';
const UPLOAD='https://www.googleapis.com/upload/drive/v3/files';
const APP='fortune-weave-backup';
export const GOOGLE_CLIENT_ID=(import.meta.env?.VITE_GOOGLE_CLIENT_ID||'').trim();
export const validClientId=value=>/^\d+-[a-z\d_-]+\.apps\.googleusercontent\.com$/i.test(value);

export class DriveError extends Error{
 constructor(message,code='request'){super(message);this.name='DriveError';this.code=code;}
}

let identityPromise;
export function loadGoogleIdentity(){
 if(window.google?.accounts?.oauth2)return Promise.resolve(window.google.accounts.oauth2);
 if(identityPromise)return identityPromise;
 identityPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;
  const fail=()=>{clearTimeout(timer);script.remove();identityPromise=undefined;reject(new DriveError('Google could not load. Check your connection or content blocker, then retry.','identity'));};
  const timer=setTimeout(fail,15000);
  script.onload=()=>{if(!window.google?.accounts?.oauth2){fail();return;}clearTimeout(timer);resolve(window.google.accounts.oauth2);};
  script.onerror=fail;document.head.append(script);
 });
 return identityPromise;
}

function browserStorage(){try{return typeof window==='undefined'?null:window.localStorage;}catch{return null;}}
export const drivePreferenceKey=clientId=>`fortune-weave:drive:v1:${clientId}`;

// Shared within this tab. Only a non-secret preference is persisted, never tokens.
export function createDriveClient({clientId,fetchImpl=(...args)=>fetch(...args),now=()=>Date.now(),storage=browserStorage()}={}){
 const preferenceKey=drivePreferenceKey(clientId),listeners=new Set();
 let remembered=false;
 try{remembered=JSON.parse(storage?.getItem(preferenceKey)||'null')?.usedDrive===true;}catch{}
 let token='',expiresAt=0,generation=0,connecting=false,saving=false,lastSaved='',expiryTimer,cancelAuthorization;
 let snapshot={connected:false,remembered,connecting,saving,expiresAt,lastSaved};
 function publish(notify=true){
  snapshot={connected:Boolean(token)&&now()<expiresAt,remembered,connecting,saving,expiresAt,lastSaved};
  if(notify)for(const listener of listeners)listener();
 }
 function remember(value){
  remembered=value;
  try{if(value)storage?.setItem(preferenceKey,JSON.stringify({usedDrive:true}));else storage?.removeItem(preferenceKey);}catch{}
 }
 function clearAccess(notify=true){
  clearTimeout(expiryTimer);token='';expiresAt=0;lastSaved='';generation++;publish(notify);
 }
 function connected(){if(token&&now()>=expiresAt)clearAccess();return Boolean(token);}
 function getSnapshot(){if(token&&now()>=expiresAt)clearAccess(false);return snapshot;}
 function subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener);}
 function disconnect(){cancelAuthorization?.();remember(false);clearAccess();}
 function connect(identity,{selectAccount=false}={}){
  if(!validClientId(clientId))return Promise.reject(new DriveError('Google Drive is not configured on this site yet.','configuration'));
  if(connecting)return Promise.reject(new DriveError('Finish the open Google account window first.','authorization'));
  clearAccess(false);const attempt=generation;connecting=true;publish();
  // requestAccessToken runs synchronously inside the click's user gesture.
  return new Promise((resolve,reject)=>{
   let settled=false;
   const finish=(error,response)=>{
    if(settled)return;settled=true;clearTimeout(authorizationTimer);
    if(attempt!==generation){reject(new DriveError('Connection cancelled.','authorization'));return;}
    connecting=false;cancelAuthorization=undefined;
    if(error){publish();reject(error);return;}
    token=response.access_token;expiresAt=now()+(Number(response.expires_in)-30)*1000;remember(true);publish();
    expiryTimer=setTimeout(()=>clearAccess(),Math.max(0,expiresAt-now()));expiryTimer?.unref?.();
    resolve({expiresAt});
   };
   const fail=error=>finish(error);
   const authorizationTimer=setTimeout(()=>fail(new DriveError('Google connection timed out. Try again.','authorization')),120000);authorizationTimer?.unref?.();
   cancelAuthorization=()=>fail(new DriveError('Connection cancelled.','authorization'));
   try{
    const client=identity.initTokenClient({
     client_id:clientId,scope:DRIVE_SCOPE,include_granted_scopes:false,
     callback:response=>{
      if(settled)return;
      if(response.error||!response.access_token){fail(new DriveError('Google access was not granted. Your progress has not changed.','authorization'));return;}
      if(!response.scope?.split(/\s+/).includes(DRIVE_SCOPE)){
       fail(new DriveError('Allow access to this app’s Drive backups to use Save and Load.','authorization'));return;
      }
      const seconds=Number(response.expires_in);
      if(!Number.isFinite(seconds)||seconds<=30){fail(new DriveError('Google authorization has expired. Connect again.','authorization'));return;}
      finish(null,response);
     },
     error_callback:error=>fail(new DriveError(error.type==='popup_closed'?'Google connection cancelled. Your progress has not changed.':'The Google window could not open. Allow popups for this site and try again.','authorization')),
    });
    client.requestAccessToken({prompt:selectAccount||!remembered?'select_account':''});
   }catch{fail(new DriveError('Google connection could not start. Please try again.','authorization'));}
  });
 }
 function access(){
  if(!connected())throw new DriveError('Your Google connection has expired. Reconnect and retry.','authorization');
  return {token,generation};
 }
 async function request(url,options,read){
  const session=access(),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
  try{
   const response=await fetchImpl(url,{...options,headers:{...options?.headers,Authorization:`Bearer ${session.token}`},credentials:'omit',cache:'no-store',signal:controller.signal});
   if(session.generation!==generation)throw new DriveError('The Google account connection changed. Please retry.','authorization');
   if(!response.ok){
    if(response.status===401){clearAccess();throw new DriveError('Google access has expired or was revoked. Reconnect and retry.','authorization');}
    let reason='';try{reason=(await response.json()).error?.errors?.[0]?.reason||'';}catch{}
    if(reason==='storageQuotaExceeded')throw new DriveError('Your Google Drive storage is full. Free some space, then try saving again.');
    if(response.status===429||['rateLimitExceeded','userRateLimitExceeded','dailyLimitExceeded'].includes(reason))throw new DriveError('Google Drive is busy or its usage limit was reached. Wait a little, then click the button again.');
    if(response.status===404)throw new DriveError('This Drive backup is no longer available. Click Load from Google Drive to refresh the list.');
    if(response.status===403)throw new DriveError('Google Drive denied access. Check the app’s Drive permission or contact the site owner.');
    throw new DriveError('Google Drive could not complete the request. Try again later.');
   }
   const result=await read(response);
   if(session.generation!==generation)throw new DriveError('The Google account connection changed. Please retry.','authorization');
   return result;
  }catch(error){
   if(error instanceof DriveError)throw error;
   throw new DriveError('Google Drive could not be reached. Check your internet connection, then try again.');
  }finally{clearTimeout(timer);}
 }
 async function listBackups(pageToken=''){
  const params=new URLSearchParams({spaces:'appDataFolder',q:`trashed = false and appProperties has { key='app' and value='${APP}' }`,orderBy:'createdTime desc,name desc',pageSize:'20',fields:'nextPageToken,files(id,name,createdTime,modifiedTime,size)'});
  if(pageToken)params.set('pageToken',pageToken);
  const result=await request(`${API}?${params}`,{},response=>response.json());
  if(!Array.isArray(result.files)||!result.files.every(file=>typeof file.id==='string'&&typeof file.name==='string'))throw new DriveError('Google returned an unreadable backup list. Please try again.');
  return {files:result.files,nextPageToken:result.nextPageToken||''};
 }
 async function readBackup(file){
  if(Number(file.size)>MAX_BACKUP_BYTES)throw new DriveError('This backup exceeds the 5 MB limit. Choose another backup.');
  const text=await request(`${API}/${encodeURIComponent(file.id)}?alt=media`,{},async response=>{
   if(Number(response.headers.get('content-length'))>MAX_BACKUP_BYTES)throw new DriveError('This backup exceeds the 5 MB limit.');
   // Bound the actual download as well as the reported size.
   const reader=response.body.getReader(),decoder=new TextDecoder();let bytes=0,result='';
   try{
    while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;
     if(bytes>MAX_BACKUP_BYTES){await reader.cancel();throw new DriveError('This backup exceeds the 5 MB limit.');}
     result+=decoder.decode(value,{stream:true});
    }
    return result+decoder.decode();
   }finally{reader.releaseLock();}
  });
  return {...parseBackup(text),filename:file.name};
 }
 async function saveBackup(state){
  if(saving)throw new DriveError('A Drive save is already in progress.','busy');
  const backup=createBackup(state,new Date(now())),boundary=`fortune_weave_${crypto.randomUUID().replaceAll('-','')}`;
  const metadata={name:backup.filename,mimeType:'application/json',parents:['appDataFolder'],appProperties:{app:APP}};
  const body=`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${backup.text}\r\n--${boundary}--\r\n`;
  // Header and backup-page controls share the same in-flight save state.
  saving=true;publish();
  try{
   const file=await request(`${UPLOAD}?uploadType=multipart&fields=id,name,createdTime`,{method:'POST',headers:{'Content-Type':`multipart/related; boundary=${boundary}`},body},response=>response.json());
   if(typeof file.id!=='string')throw new DriveError('Google did not confirm the save. Use Load to check your backups before saving again.');
   lastSaved=JSON.parse(backup.text).exportedAt;
   return {...file,exportedAt:lastSaved};
  }finally{saving=false;publish();}
 }
 return {connect,disconnect,connected,getSnapshot,subscribe,listBackups,readBackup,saveBackup};
}

const driveClients=new Map();
export function getDriveClient(clientId=GOOGLE_CLIENT_ID){
 if(!driveClients.has(clientId))driveClients.set(clientId,createDriveClient({clientId}));
 return driveClients.get(clientId);
}
