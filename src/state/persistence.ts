import * as SQLite from 'expo-sqlite';
import * as KV from 'expo-sqlite/kv-store';
import {migrateLegacy,validateWorkspace,type AppData,type Workspace} from '../lib/workspace';
export type Database={execAsync:(sql:string)=>Promise<unknown>;runAsync:(sql:string,...args:any[])=>Promise<unknown>;getFirstAsync:<T>(sql:string,...args:any[])=>Promise<T|null>;getAllAsync:<T>(sql:string,...args:any[])=>Promise<T[]>;withExclusiveTransactionAsync:(task:(tx:Database)=>Promise<void>)=>Promise<void>};
type Space='personal'|'example';
type Stored={version:3|4|5;demo:boolean;preferences:AppData['preferences'];personal:Omit<Workspace,'transactions'>;example:Omit<Workspace,'transactions'>};
export class FinanceRepository{
 private persisted:AppData|null=null;private legacyCleaned=false;
 constructor(private db:Database,private legacyHouse:()=>Promise<string|null>=()=>KV.default.getItem('house'),private cleanLegacy:()=>Promise<void>=()=>KV.default.removeItem('house')){}
 async prepare(){await this.db.execAsync('CREATE TABLE IF NOT EXISTS headroom_migrations (id INTEGER PRIMARY KEY, value TEXT NOT NULL); CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY, value TEXT NOT NULL); CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY, value TEXT NOT NULL); CREATE TABLE IF NOT EXISTS headroom_transactions (space TEXT NOT NULL, id TEXT NOT NULL, value TEXT NOT NULL, PRIMARY KEY (space,id));');}
 async read():Promise<AppData>{
  const row=await this.db.getFirstAsync<{value:string}>('SELECT value FROM app_state WHERE id=1');
  if(row){const stored=JSON.parse(row.value) as Stored;if(stored.version!==3&&stored.version!==4&&stored.version!==5)throw Error('Unsupported storage version.');const records=await this.db.getAllAsync<{space:Space;id:string;value:string}>('SELECT space,id,value FROM headroom_transactions');if(records.some(r=>!['personal','example'].includes(r.space)||JSON.parse(r.value).id!==r.id))throw Error('Stored transaction identities do not match their records.');const data=migrateLegacy({...stored,version:2,personal:{...stored.personal,transactions:records.filter(r=>r.space==='personal').map(r=>JSON.parse(r.value))},example:{...stored.example,transactions:records.filter(r=>r.space==='example').map(r=>JSON.parse(r.value))}});this.persisted=data;if([stored.personal,stored.example].some(w=>w.plan.goals?.some(g=>!g.dueMonth)))await this.save(data);return data;}
  const legacy=await this.db.getFirstAsync<{value:string}>('SELECT value FROM state WHERE id=1');const saved=legacy?JSON.parse(legacy.value):null,oldHouse=saved?.version===2?null:await this.legacyHouse();const data=migrateLegacy(saved,oldHouse?JSON.parse(oldHouse):null);if(saved&&[data.personal,data.example].some(w=>w.plan.goals?.length))await this.save(data);return data;
 }
 async save(data:AppData){
  data={...data,personal:validateWorkspace(data.personal),example:validateWorkspace(data.example)};
  const {transactions:personalTransactions,...personal}=data.personal,{transactions:exampleTransactions,...example}=data.example;
  const stored:Stored={version:5,demo:data.demo,preferences:data.preferences,personal,example};
  const prior=this.persisted;
  await this.db.withExclusiveTransactionAsync(async tx=>{
   const original=await tx.getFirstAsync<{value:string}>('SELECT value FROM app_state WHERE id=1');
   const legacy=await tx.getFirstAsync<{value:string}>('SELECT value FROM state WHERE id=1');
   if((original&&JSON.parse(original.value).version===3)||(!original&&legacy)){
    const records=await tx.getAllAsync('SELECT space,id,value FROM headroom_transactions');
    await tx.runAsync('INSERT OR IGNORE INTO headroom_migrations (id,value) VALUES (1,?)',JSON.stringify({format:'headroom-pre-ledger',current:original?.value??null,legacy:legacy?.value??null,transactions:records}));
   }

   if(original&&JSON.parse(original.value).version===4){const records=await tx.getAllAsync('SELECT space,id,value FROM headroom_transactions');await tx.runAsync('INSERT OR IGNORE INTO headroom_migrations (id,value) VALUES (2,?)',JSON.stringify({format:'headroom-pre-planning',current:original.value,transactions:records}));}
   for(const space of ['personal','example'] as const){
    const rows=data[space].transactions,previous=prior?.[space].transactions;if(rows===previous)continue;
    const old=new Map((previous||[]).map(t=>[t.id,t])),next=new Set(rows.map(t=>t.id));
    if(!prior)await tx.runAsync('DELETE FROM headroom_transactions WHERE space=?',space);
    for(const row of rows){const before=old.get(row.id);if(before===row||before&&before.account===row.account&&before.date===row.date&&before.merchant===row.merchant&&before.amount===row.amount&&before.movement===row.movement&&before.category===row.category)continue;await tx.runAsync('INSERT OR REPLACE INTO headroom_transactions (space,id,value) VALUES (?,?,?)',space,row.id,JSON.stringify(row));}
    for(const row of previous||[])if(!next.has(row.id))await tx.runAsync('DELETE FROM headroom_transactions WHERE space=? AND id=?',space,row.id);
   }
   await tx.runAsync('INSERT OR REPLACE INTO app_state (id,value) VALUES (1,?)',JSON.stringify(stored));
   // The legacy record is removed only in the same committed transaction.
   await tx.runAsync('DELETE FROM state WHERE id=1');
  });
  this.persisted=data;
  // Stale KV is not used once app_state exists. Cleanup cannot invalidate a committed save.
  if(!this.legacyCleaned)try{await this.cleanLegacy();this.legacyCleaned=true;}catch{}
 }
 async recovery(){
  const current=await this.db.getFirstAsync<{value:string}>('SELECT value FROM app_state WHERE id=1'),legacy=await this.db.getFirstAsync<{value:string}>('SELECT value FROM state WHERE id=1');
  const records=await this.db.getAllAsync<{space:Space;value:string}>('SELECT space,value FROM headroom_transactions');
  let personal:Workspace|null=null;
  try{if(current){const stored=JSON.parse(current.value);personal=validateWorkspace({...stored.personal,transactions:records.filter(r=>r.space==='personal').map(r=>JSON.parse(r.value))});}else if(legacy){const saved=JSON.parse(legacy.value);personal=saved.version===2?validateWorkspace(saved.personal):migrateLegacy(saved).personal;}}catch{}
  const migration=await this.db.getFirstAsync<{value:string}>('SELECT value FROM headroom_migrations WHERE id=1');
  const planningMigration=await this.db.getFirstAsync<{value:string}>('SELECT value FROM headroom_migrations WHERE id=2');
  let legacyHouse:string|null=null;try{legacyHouse=await this.legacyHouse();}catch{}
  return {personal,raw:JSON.stringify({format:'headroom-recovery-archive',createdAt:new Date().toISOString(),note:'Unvalidated raw financial records. Preserve for recovery; this is not a normal restorable backup.',current:current?.value??null,legacy:legacy?.value??null,transactions:records,legacyHouse,preLedger:migration?.value??null,prePlanning:planningMigration?.value??null},null,2)};
 }
}
export async function openFinanceRepository(){const db=await SQLite.openDatabaseAsync('headroom.db');const repo=new FinanceRepository(db as unknown as Database);await repo.prepare();return repo;}
