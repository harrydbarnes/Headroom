import {afterEach,it,expect,vi} from 'vitest';
import {generateKeyPairSync,randomBytes} from 'node:crypto';
import {handle} from '../server/banking';
import {completeImport} from '../src/lib/workspace';
const privateKey=generateKeyPairSync('rsa',{modulusLength:2048}).privateKey.export({format:'pem',type:'pkcs8'}).toString();
async function fixture(){
 const encryption=randomBytes(32),key=await crypto.subtle.importKey('raw',encryption,'AES-GCM',false,['encrypt']),records=new Map<string,string>(),prefix='banking/owner/';
 async function putRecord(name:string,value:unknown){const iv=randomBytes(12),cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode(prefix+name)},key,new TextEncoder().encode(JSON.stringify(value)));records.set(prefix+name,JSON.stringify({iv:iv.toString('base64url'),data:Buffer.from(cipher).toString('base64url')}));}
 const env={BANKING_ENCRYPTION_KEY:encryption.toString('base64url'),BUCKET:{get:async(key:string)=>records.has(key)?{json:async()=>JSON.parse(records.get(key)!)}:null,put:async(key:string,value:string)=>records.set(key,value),list:async({prefix}:{prefix:string})=>({objects:[...records.keys()].filter(key=>key.startsWith(prefix)).map(key=>({key}))})}};
 await putRecord('config',{appId:'fixture',mode:'PRODUCTION',privateKey});
 const session=(id:string)=>({id,provider:id,expires:new Date(Date.now()+86400000).toISOString(),lastSync:null,sessionId:id,accounts:[{uid:id,currency:'GBP'}]});
 const request=(id?:string)=>handle(new Request('https://finance.example/api/banking/sync',{method:'POST',body:id?JSON.stringify({id}):undefined,headers:{'content-type':'application/json','oai-authenticated-user-id':'owner',origin:'https://finance.example','x-banking-request':'1'}}),env);
 return {putRecord,session,request};
}
afterEach(()=>vi.unstubAllGlobals());
it('marks prematurely expired consent for reconnection and avoids fetching it again',async()=>{
 const f=await fixture();await f.putRecord('session/early',f.session('early'));
 const fetch=vi.fn(async()=>Response.json({error:'EXPIRED_SESSION',message:'Provider detail'},{status:401}));vi.stubGlobal('fetch',fetch);
 const result=await (await f.request()).json();
 expect(result.rows).toEqual([]);expect(result.outcomes[0].status).toBe('expired');expect(result.outcomes[0].lastSync).toBeNull();
 expect(result.warnings).toEqual(['early: consent expired. Reconnect your bank.']);
 expect(completeImport(result.outcomes)).toBe(false);
 const retry=await (await f.request()).json();expect(retry.outcomes[0].status).toBe('expired');expect(fetch).toHaveBeenCalledTimes(1);
});
it.each([Response.json({error:'UNAUTHORIZED_ACCESS'},{status:401}),new Response('Unavailable',{status:502})])('does not confuse other provider failures with expired consent',async response=>{
 const f=await fixture();await f.putRecord('session/failed',f.session('failed'));
 vi.stubGlobal('fetch',vi.fn(async()=>response.clone()));
 const result=await (await f.request()).json();expect(result.outcomes[0].status).toBe('failed');expect(result.rows).toEqual([]);
});
it('reports successful, failed and expired banks independently without claiming a complete import',async()=>{
 const f=await fixture();await f.putRecord('session/ok',f.session('ok'));await f.putRecord('session/failed',f.session('failed'));await f.putRecord('session/expired',{...f.session('expired'),expires:new Date(Date.now()-1).toISOString()});
 vi.stubGlobal('fetch',vi.fn(async(url:string)=>{if(url.includes('/failed/'))throw Error('Unavailable');return Response.json({transactions:[{transaction_id:'one',booking_date:'2026-10-01',credit_debit_indicator:'DBIT',transaction_amount:{amount:'12.34',currency:'GBP'}}]});}));
 const response=await f.request();expect(response.status).toBe(200);const result=await response.json();expect(result.rows).toHaveLength(1);expect(result.outcomes.map((o:any)=>o.status)).toEqual(['success','failed','expired']);expect(completeImport(result.outcomes)).toBe(false);expect(result.outcomes[1].lastSync).toBeNull();
});
it('keeps an incomplete cached retrieval marked partial on subsequent syncs',async()=>{
 const f=await fixture();await f.putRecord('session/cached',{...f.session('cached'),lastSync:new Date().toISOString()});await f.putRecord('cache/cached',{rows:[],partial:true});const fetch=vi.fn();vi.stubGlobal('fetch',fetch);const result=await (await f.request()).json();expect(result.outcomes[0].status).toBe('partial');expect(result.warnings.join(' ')).toContain('cached retrieval remains incomplete');expect(completeImport(result.outcomes)).toBe(false);expect(fetch).not.toHaveBeenCalled();
});
it('requires at least one successful or complete cached bank before recording a complete import',()=>{expect(completeImport([])).toBe(false);expect(completeImport([{status:'success'},{status:'cached'}])).toBe(true);expect(completeImport([{status:'success'},{status:'partial'}])).toBe(false);});

it('retries only a known requested bank and rejects unknown connections',async()=>{const f=await fixture();await f.putRecord('session/one',f.session('one'));await f.putRecord('session/two',f.session('two'));const fetch=vi.fn(async()=>Response.json({transactions:[]}));vi.stubGlobal('fetch',fetch);const result=await (await f.request('one')).json();expect(result.outcomes.map((o:any)=>o.id)).toEqual(['one']);expect(fetch).toHaveBeenCalledTimes(1);expect((await f.request('missing')).status).toBe(404);});

it('retains the original partial warning when reading a cached result',async()=>{const f=await fixture();await f.putRecord('session/cached',{...f.session('cached'),lastSync:new Date().toISOString()});await f.putRecord('cache/cached',{rows:[],partial:true,warnings:['Cached Bank: non-GBP account omitted.']});const fetch=vi.fn();vi.stubGlobal('fetch',fetch);const result=await (await f.request()).json();expect(result.warnings).toEqual(['Cached Bank: non-GBP account omitted.']);expect(fetch).not.toHaveBeenCalled();});
