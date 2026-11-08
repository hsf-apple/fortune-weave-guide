import test from 'node:test';
import assert from 'node:assert/strict';
import {createDriveClient,getDriveClient,drivePreferenceKey,DRIVE_SCOPE,validClientId} from '../src/googleDrive.js';
import {createBackup} from '../src/backup.js';
import {emptyState,normalize} from '../src/model.js';

const clientId='1234567890-test.apps.googleusercontent.com';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
function identity(response={access_token:'test-only-token',scope:DRIVE_SCOPE,expires_in:3600}){
 const calls=[];
 return {calls,initTokenClient(config){calls.push(config);return {requestAccessToken(options){calls.push(options);config.callback(response);}};}};
}

test('Google connection requests only app-data access and performs no Drive operations',async()=>{
 const requests=[],google=identity(),client=createDriveClient({clientId,fetchImpl:(...args)=>{requests.push(args);}});
 assert.equal(validClientId(clientId),true);assert.equal(validClientId('paste-client-id'),false);
 assert.equal(client.connected(),false);
 await client.connect(google);
 assert.equal(google.calls[0].scope,DRIVE_SCOPE);assert.equal(google.calls[0].include_granted_scopes,false);
 assert.deepEqual(google.calls[1],{prompt:'select_account'});
 assert.equal(client.connected(),true);assert.equal(requests.length,0);
 client.disconnect();assert.equal(client.connected(),false);assert.equal(requests.length,0);
});

test('cancelled, denied, missing-scope and blocked authorizations cannot access Drive',async()=>{
 let requests=0;
 const client=createDriveClient({clientId,fetchImpl:()=>{requests++;}});
 for(const response of [{error:'access_denied'},{access_token:'test',scope:'email',expires_in:3600},{access_token:'test',scope:DRIVE_SCOPE,expires_in:0}]){
  await assert.rejects(client.connect(identity(response)));assert.equal(client.connected(),false);
 }
 for(const type of ['popup_closed','popup_failed_to_open'])await assert.rejects(client.connect({initTokenClient(config){return {requestAccessToken(){config.error_callback({type});}};}}));
 await assert.rejects(client.listBackups(),/expired/);assert.equal(requests,0);
 await assert.rejects(createDriveClient({clientId:''}).connect(identity()),/not configured/);
});

test('save creates dated app-data snapshots without reading or overwriting other files',async()=>{
 const requests=[],state=emptyState();state.paths.cai.members.cai.customPlan.notes='Keep this note 日本語';
 const client=createDriveClient({clientId,fetchImpl:async(url,options)=>{requests.push({url,options});return json({id:String(requests.length),name:'backup.json'});}});
 await client.connect(identity());await client.saveBackup(state);await client.saveBackup(state);
 assert.equal(requests.length,2);
 for(const {url,options} of requests){
  assert.match(url,/\/upload\/drive\/v3\/files\?uploadType=multipart/);assert.equal(options.method,'POST');
  assert.equal(options.headers.Authorization,'Bearer test-only-token');assert.equal(options.credentials,'omit');
  assert.match(options.headers['Content-Type'],/^multipart\/related; boundary=/);
  const parts=options.body.split('\r\n\r\n'),metadata=JSON.parse(parts[1].split('\r\n--')[0]),backup=JSON.parse(parts[2].split('\r\n--')[0]);
  assert.deepEqual(metadata.parents,['appDataFolder']);assert.deepEqual(metadata.appProperties,{app:'fortune-weave-backup'});
  assert.match(metadata.name,/^fortune-weave-backup-/);assert.deepEqual(backup.state,state);
  assert.ok(!options.body.includes('test-only-token'));
 }
});

test('load finds private backups after browser data loss and validates downloaded content',async()=>{
 const state=emptyState();state.activePath='leda';state.paths.leda.context.chapter='9';
 const saved=createBackup(state),requests=[];
 // A fresh client, without any locally remembered Drive file ID.
 const client=createDriveClient({clientId,fetchImpl:async(url,options)=>{
  requests.push({url,options});
  if(url.includes('alt=media'))return new Response(saved.text);
  return json({files:[{id:'safe/id',name:saved.filename}],nextPageToken:'older-page'});
 }});
 await client.connect(identity());
 const result=await client.listBackups(),query=new URL(requests[0].url).searchParams;
 assert.equal(query.get('spaces'),'appDataFolder');assert.match(query.get('q'),/appProperties/);assert.equal(query.get('orderBy'),'createdTime desc,name desc');
 assert.equal(result.nextPageToken,'older-page');
 const backup=await client.readBackup(result.files[0]);assert.deepEqual(backup.state,normalize(state));
 assert.match(requests[1].url,/safe%2Fid\?alt=media/);
 await client.listBackups(result.nextPageToken);assert.equal(new URL(requests[2].url).searchParams.get('pageToken'),'older-page');
 assert.ok(requests.every(({options})=>!options.method));
});

test('expired or revoked tokens require an explicit reconnect; nothing refreshes automatically',async()=>{
 let time=100000,requests=0;
 const client=createDriveClient({clientId,now:()=>time,fetchImpl:async()=>{requests++;return json({error:{}},401);}});
 await client.connect(identity({access_token:'test',scope:DRIVE_SCOPE,expires_in:60}));time+=31000;
 await assert.rejects(client.listBackups(),/expired/);assert.equal(requests,0);assert.equal(client.connected(),false);
 await client.connect(identity());await assert.rejects(client.listBackups(),/revoked/);assert.equal(requests,1);assert.equal(client.connected(),false);
 await assert.rejects(client.listBackups());assert.equal(requests,1);
});

test('failed uploads are not retried; storage and rate-limit errors are useful',async()=>{
 for(const [status,reason,message] of [[403,'storageQuotaExceeded',/storage is full/],[429,'rateLimitExceeded',/usage limit/],[403,'insufficientPermissions',/denied access/],[500,'backendError',/could not complete/]]){
  let requests=0;const client=createDriveClient({clientId,fetchImpl:async()=>{requests++;return json({error:{errors:[{reason}]}},status);}});
  await client.connect(identity());await assert.rejects(client.saveBackup(emptyState()),message);assert.equal(requests,1);
 }
 let attempts=0;const client=createDriveClient({clientId,fetchImpl:async()=>{attempts++;throw new Error('offline');}});
 await client.connect(identity());await assert.rejects(client.saveBackup(emptyState()),/internet connection/);assert.equal(attempts,1);
});

test('unreadable and oversized downloads are rejected before replacing local progress',async()=>{
 for(const response of [()=>new Response('{"unrelated":true}'),()=>new Response('bad json'),()=>new Response('x',{headers:{'content-length':'6000000'}}),()=>new Response('x'.repeat(5*1024*1024+1))]){
  const client=createDriveClient({clientId,fetchImpl:async()=>response()});await client.connect(identity());
  await assert.rejects(client.readBackup({id:'backup',name:'backup.json'}));
 }
 let requests=0;const client=createDriveClient({clientId,fetchImpl:()=>{requests++;}});await client.connect(identity());
 await assert.rejects(client.readBackup({id:'backup',size:'6000000'}),/5 MB/);assert.equal(requests,0);
});

test('switching connections invalidates an outstanding download',async()=>{
 let finish;const client=createDriveClient({clientId,fetchImpl:()=>new Promise(resolve=>{finish=resolve;})});
 await client.connect(identity());const pending=client.readBackup({id:'backup',name:'backup.json'});
 client.disconnect();finish(new Response(createBackup(emptyState()).text));
 await assert.rejects(pending,/connection changed/);
});

test('navigation reuses the current tab connection without Google requests',async()=>{
 const id='1234567890-navigation.apps.googleusercontent.com';
 const client=getDriveClient(id);await client.connect(identity());
 const snapshot=client.getSnapshot();assert.equal(snapshot.connected,true);
 const unsubscribe=client.subscribe(()=>{});unsubscribe();
 assert.equal(getDriveClient(id),client);assert.equal(getDriveClient(id).getSnapshot(),snapshot);
 assert.equal(client.connected(),true);client.disconnect();
});

test('reload remembers Drive usage without storing credentials or claiming authorization',async()=>{
 const entries=new Map(),storage={getItem:key=>entries.get(key),setItem:(key,value)=>entries.set(key,value),removeItem:key=>entries.delete(key)};
 const client=createDriveClient({clientId,storage});await client.connect(identity());
 assert.deepEqual(JSON.parse(entries.get(drivePreferenceKey(clientId))),{usedDrive:true});
 assert.ok(!JSON.stringify([...entries]).includes('test-only-token'));
 let requests=0;const reloaded=createDriveClient({clientId,storage,fetchImpl:()=>{requests++;}});
 assert.equal(reloaded.getSnapshot().remembered,true);assert.equal(reloaded.getSnapshot().connected,false);
 await assert.rejects(reloaded.listBackups(),/expired/);assert.equal(requests,0);
 const google=identity();await reloaded.connect(google);assert.deepEqual(google.calls[1],{prompt:''});
 assert.equal(reloaded.connected(),true);assert.equal(requests,0);
 client.disconnect();reloaded.disconnect();assert.equal(entries.size,0);
});

test('expiry preserves the preference and account switching explicitly opens the chooser',async()=>{
 let time=100000,requests=0;
 const client=createDriveClient({clientId,now:()=>time,fetchImpl:()=>{requests++;}});
 await client.connect(identity({access_token:'test',scope:DRIVE_SCOPE,expires_in:60}));
 time+=31000;
 assert.equal(client.getSnapshot().connected,false);assert.equal(client.getSnapshot().remembered,true);
 assert.equal(client.getSnapshot().expiresAt,0);assert.equal(requests,0);
 const google=identity();await client.connect(google,{selectAccount:true});assert.deepEqual(google.calls[1],{prompt:'select_account'});
 client.disconnect();assert.equal(client.getSnapshot().remembered,false);
});

test('subscribers can unmount without disconnecting and the last save survives navigation',async()=>{
 const client=createDriveClient({clientId,fetchImpl:async()=>json({id:'saved',name:'backup.json'})});
 let updates=0;const unsubscribe=client.subscribe(()=>{updates++;});
 await client.connect(identity());assert.ok(updates>=2);
 const saved=await client.saveBackup(emptyState());assert.equal(client.getSnapshot().lastSaved,saved.exportedAt);
 const before=updates;unsubscribe();assert.equal(client.connected(),true);
 const snapshot=client.getSnapshot();assert.equal(client.getSnapshot(),snapshot);
 await client.connect(identity(),{selectAccount:true});assert.equal(client.getSnapshot().lastSaved,'');
 assert.equal(updates,before);client.disconnect();
});

test('disconnect cancels pending authorization and ignores a late Google response',async()=>{
 let callback;
 const client=createDriveClient({clientId}),pending=client.connect({initTokenClient(config){callback=config.callback;return {requestAccessToken(){}};}});
 assert.equal(client.getSnapshot().connecting,true);
 client.disconnect();await assert.rejects(pending,/cancelled/);
 callback({access_token:'late-token',scope:DRIVE_SCOPE,expires_in:3600});
 assert.equal(client.connected(),false);assert.equal(client.getSnapshot().remembered,false);assert.equal(client.getSnapshot().connecting,false);
 await client.connect(identity());assert.equal(client.connected(),true);client.disconnect();
});

test('blocked local storage does not prevent connecting, saving, or disconnecting',async()=>{
 const blocked=()=>{throw new Error('Storage blocked');};
 const client=createDriveClient({clientId,storage:{getItem:blocked,setItem:blocked,removeItem:blocked},fetchImpl:async()=>json({id:'saved'})});
 await client.connect(identity());await client.saveBackup(emptyState());
 assert.equal(client.getSnapshot().connected,true);assert.equal(client.getSnapshot().remembered,true);
 client.disconnect();assert.equal(client.connected(),false);assert.equal(client.getSnapshot().remembered,false);
});

test('header and backup-page controls share saving status and prevent duplicate uploads',async()=>{
 let finish,requests=0;
 const client=createDriveClient({clientId,fetchImpl:()=>{requests++;return new Promise(resolve=>{finish=resolve;});}});
 await client.connect(identity());
 const saving=client.saveBackup(emptyState());
 assert.equal(client.getSnapshot().saving,true);
 await assert.rejects(client.saveBackup(emptyState()),error=>error.code==='busy');assert.equal(requests,1);
 finish(json({id:'saved',name:'backup.json'}));await saving;
 assert.equal(client.getSnapshot().saving,false);assert.ok(client.getSnapshot().lastSaved);
 client.disconnect();
});
