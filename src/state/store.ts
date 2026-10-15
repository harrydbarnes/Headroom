import {create} from 'zustand';
import * as SQLite from 'expo-sqlite';
import {emptyPlan,demoPlan,mergeTransactions,type Plan,type Transaction,type Movement} from '../lib/finance';
let db:SQLite.SQLiteDatabase;let writing=Promise.resolve();
type Saved={plan:Plan;transactions:Transaction[];demo:boolean;lastSync:string|null};
type State=Saved&{ready:boolean;error:string|null;init:()=>Promise<void>;patch:(p:Partial<Plan>)=>void;setDemo:(v:boolean)=>void;merge:(r:Transaction[])=>void;review:(id:string,movement:Movement)=>void;clear:()=>void};
const baseline:Saved={plan:emptyPlan,transactions:[],demo:false,lastSync:null};
function persist(s:State){if(!db)return;const data=JSON.stringify({plan:s.plan,transactions:s.transactions,demo:s.demo,lastSync:s.lastSync});writing=writing.then(()=>db.runAsync('INSERT OR REPLACE INTO state (id,value) VALUES (1,?)',data)).then(()=>{}).catch(()=>{useFinance.setState({error:'Could not save changes on this device.'});});}
export const useFinance=create<State>((set,get)=>({ ...baseline,ready:false,error:null,
 async init(){try{db=await SQLite.openDatabaseAsync('headroom.db');await db.execAsync('CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY, value TEXT NOT NULL)');const row=await db.getFirstAsync<{value:string}>('SELECT value FROM state WHERE id=1');if(row){const saved=JSON.parse(row.value);set({...saved,plan:{...emptyPlan,...saved.plan},ready:true});}else set({ready:true});}catch{set({ready:true,error:'Local storage could not be opened. Changes may not be saved.'});}},
 patch(p){set({plan:{...get().plan,...p}});persist(get());},
 setDemo(v){set({...baseline,demo:v,plan:v?demoPlan:{...emptyPlan}});persist(get());},
 merge(r){set({transactions:mergeTransactions(get().transactions,r),lastSync:new Date().toISOString()});persist(get());},
 review(id,movement){set({transactions:get().transactions.map(t=>t.id===id?{...t,movement}:t)});persist(get());},
 clear(){set({...baseline,plan:{...emptyPlan}});persist(get());}
}));
