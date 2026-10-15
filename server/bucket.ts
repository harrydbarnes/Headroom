import {mkdir,readFile,writeFile,rename,unlink,readdir} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
// One server process only. Encryption is performed by banking.ts with key-bound AAD.
export class Bucket {
 private queue:Promise<unknown>=Promise.resolve();
 constructor(private dir:string){}
 private file(key:string){return this.dir+'/'+Buffer.from(key).toString('base64url')+'.json';}
 async get(key:string){try{const text=await readFile(this.file(key),'utf8');return {etag:createHash('sha256').update(text).digest('hex'),json:async()=>JSON.parse(text)};}catch(e:any){if(e.code==='ENOENT')return null;throw e;}}
 async put(key:string,value:string,options?:{onlyIf:{etagMatches:string}}){const work=this.queue.then(async()=>{await mkdir(this.dir,{recursive:true,mode:0o700});if(options&&(await this.get(key))?.etag!==options.onlyIf.etagMatches)return null;const temp=this.file(key)+'.'+randomUUID()+'.tmp';await writeFile(temp,value,{mode:0o600});await rename(temp,this.file(key));return {key};});this.queue=work.catch(()=>{});return work;}
 async delete(key:string){try{await unlink(this.file(key));}catch(e:any){if(e.code!=='ENOENT')throw e;}}
 async list({prefix}:{prefix:string}){await mkdir(this.dir,{recursive:true,mode:0o700});return {objects:(await readdir(this.dir)).filter(f=>f.endsWith('.json')).map(f=>({key:Buffer.from(f.slice(0,-5),'base64url').toString()})).filter(o=>o.key.startsWith(prefix))};}
}
