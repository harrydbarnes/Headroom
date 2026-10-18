import {createServer} from 'node:http';
import {randomBytes,timingSafeEqual,createHmac} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {handle} from './banking';
import {Bucket} from './bucket';
import {PairingTickets} from './pairing';
const origin=process.env.PUBLIC_ORIGIN,token=process.env.DEVICE_TOKEN,key=process.env.BANKING_ENCRYPTION_KEY;
if(!origin||new URL(origin).protocol!=='https:'||new URL(origin).origin!==origin)throw Error('PUBLIC_ORIGIN must be a bare HTTPS origin.');
if(!token||token.length<43||!key||Buffer.from(key,'base64url').length!==32)throw Error('Set a random DEVICE_TOKEN (32+ random bytes) and 32-byte base64url BANKING_ENCRYPTION_KEY.');
const env={BUCKET:new Bucket(process.env.DATA_DIR||'./private-data'),BANKING_ENCRYPTION_KEY:key};
const tickets=new Map<string,{bank:string,created:number}>();
const pairingTickets=new PairingTickets();
const valid=(given:string,expected:string)=>{const a=Buffer.from(given),b=Buffer.from(expected);return a.length===b.length&&timingSafeEqual(a,b);};
const signedCookie=()=>{const value=String(Date.now());return value+'.'+createHmac('sha256',token).update(value).digest('base64url');};
function cookieValid(c:string){const [time,sig]=c.split('.');return !!sig&&Number.isFinite(Number(time))&&Date.now()-Number(time)>=0&&Date.now()-Number(time)<1200000&&valid(sig,createHmac('sha256',token!).update(time).digest('base64url'));}
async function request(path:string,method='GET',body?:string){return handle(new Request(origin+path,{method,headers:{'oai-authenticated-user-id':'personal-owner','origin':origin!,'x-banking-request':'1','content-type':'application/json','user-agent':'Headroom personal API'},body:method==='GET'?undefined:body}),env);}
// Provision through server environment only. Never expose the private key to Android.
if(process.env.ENABLE_APP_ID&&process.env.ENABLE_PRIVATE_KEY_PATH&&!(await (await request('/api/banking/status')).json() as any).configured){const result=await request('/api/banking/configure','POST',JSON.stringify({appId:process.env.ENABLE_APP_ID,privateKey:await readFile(process.env.ENABLE_PRIVATE_KEY_PATH,'utf8'),mode:process.env.ENABLE_MODE||'PRODUCTION'}));if(!result.ok)throw Error('Enable Banking setup failed: '+await result.text());}
export function callbackPage(connected:boolean){return '<!doctype html><html lang="en-GB"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Headroom</title><h1>'+ (connected?'Bank connected':'Connection cancelled')+'</h1><p>'+(connected?'Return to Headroom to refresh your transactions.':'No new bank connection was added. Return to Accounts to try again.')+'</p><a href="headroom://banking?result='+(connected?'connected':'cancelled')+'">Return to Headroom</a><p>If the app doesn’t open, switch back to Headroom and open Accounts.</p></html>'; }
const server=createServer(async(req,res)=>{res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Content-Type-Options','nosniff');try{
 const url=new URL(req.url||'/',origin);if(url.origin!==origin)throw Error('Invalid URL');
 let body='';for await(const chunk of req){body+=chunk.toString();if(Buffer.byteLength(body)>16384){res.writeHead(413).end();return;}}
 const authenticated=valid(req.headers.authorization||'','Bearer '+token);
 const cookie=(req.headers.cookie||'').split(';').map(c=>c.trim()).find(c=>c.startsWith('__Host-headroom='))?.slice(16)||'';
 if(url.pathname==='/mobile/start'&&req.method==='GET'){
 const t=url.searchParams.get('ticket')||'',ticket=tickets.get(t);tickets.delete(t);if(!ticket||Date.now()-ticket.created>120000){res.writeHead(401).end('Link expired. Start again in the app.');return;}
 const result=await request('/api/banking/connect','POST',JSON.stringify({bank:ticket.bank}));const d=await result.json() as any;if(!result.ok){res.writeHead(result.status,{'Content-Type':'text/plain'}).end(d.error||'Connection failed.');return;}
 res.writeHead(303,{'Location':d.url,'Set-Cookie':'__Host-headroom='+signedCookie()+'; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=1200'}).end();return;}
 if(url.pathname==='/api/banking/callback'&&req.method==='GET'){
 if(!cookieValid(cookie)){res.writeHead(401).end('Bank authorisation expired. Start again from the app.');return;}
 const result=await request(url.pathname+url.search);if(result.status>=300&&result.status<400){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'none'; base-uri 'none'; frame-ancestors 'none'",'Set-Cookie':'__Host-headroom=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0'}).end(callbackPage(new URL(result.headers.get('location')!,origin).searchParams.get('banking')==='connected'));}else{res.writeHead(result.status,{'Content-Type':'text/plain'}).end('Bank connection couldn’t be completed. Return to Headroom and try connecting again.');}return;}
 if(url.pathname==='/mobile/pair'&&req.method==='POST'){
  const {ticket}=JSON.parse(body);if(!pairingTickets.consume(ticket)){res.writeHead(401,{'Content-Type':'application/json'}).end(JSON.stringify({error:'Pairing ticket expired or already used.'}));return;}
  res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify({token}));return;
 }
 if(!authenticated){res.writeHead(401,{'Content-Type':'application/json'}).end(JSON.stringify({error:'Unauthorised device.'}));return;}
 if(url.pathname==='/mobile/pairing-ticket'&&req.method==='POST'){res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify({ticket:pairingTickets.issue(),expiresIn:120}));return;}
 if(url.pathname==='/mobile/launch'&&req.method==='POST'){const {bank}=JSON.parse(body);if(typeof bank!=='string'||bank.length>200)throw Error('Invalid bank');for(const [k,v]of tickets)if(Date.now()-v.created>120000)tickets.delete(k);if(tickets.size>=100){res.writeHead(429).end();return;}const t=randomBytes(32).toString('base64url');tickets.set(t,{bank,created:Date.now()});res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify({url:origin+'/mobile/start?ticket='+t}));return;}
 const allowed:Record<string,string>={status:'GET',banks:'GET',sync:'POST',disconnect:'POST'};const action=url.pathname.replace('/api/banking/','');if(allowed[action]!==req.method||!url.pathname.startsWith('/api/banking/')){res.writeHead(404).end();return;}
 const result=await request(url.pathname,req.method,body);res.writeHead(result.status,{'Content-Type':'application/json'}).end(await result.text());
 }catch{res.writeHead(400,{'Content-Type':'application/json'}).end(JSON.stringify({error:'The finance request could not be completed.'}));}});
server.requestTimeout=150000;server.listen(Number(process.env.PORT||8787),'127.0.0.1',()=>console.log('Headroom API listening on loopback. Publish behind HTTPS; do not log bank URLs or request bodies.'));
