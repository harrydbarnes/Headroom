import {create} from 'zustand';
import {mergeTransactions,type Plan,type Transaction,type Movement} from '../lib/finance';
import {active,anchorGoalDates,applyRules,exampleWorkspace,freshData,freshWorkspace,immutable,reviewRows,switchWorkspace,treatmentFits,validateWorkspace,type AppData,type Workspace,type Preferences,type SyncReceipt} from '../lib/workspace';
import {applyActuals,deleteManual,editManual,transferPair,type ManualDraft} from '../lib/reconciliation';
import {openFinanceRepository,type FinanceRepository} from './persistence';

let repository:FinanceRepository|undefined;
let timer:ReturnType<typeof setTimeout>|undefined;
let writing:Promise<unknown>=Promise.resolve();
let queuedRevision=0;
type Undo={demo:boolean;rows:{id:string;before:Transaction|null}[];rules:Workspace['rules'];coverage:Workspace['coverage'];revision:number;label:string};
type State={exampleGeneration:number;data:AppData;ready:boolean;error:string|null;mutationError:string|null;saving:boolean;lastSaved:string|null;undo:Undo|null;storageBlocked:boolean;generation:number;revision:number;durableRevision:number;recoveryArchive:string|null;recoverablePersonal:Workspace|null;
 init:()=>Promise<void>;change:(f:(w:Workspace)=>Workspace)=>boolean;patch:(p:Partial<Plan>)=>boolean;setDemo:(v:boolean)=>void;preferences:(p:Partial<Preferences>)=>void;
 merge:(rows:Transaction[],success:boolean,receipt?:SyncReceipt)=>boolean;review:(ids:string[],movement:Movement,category:string,remember?:boolean)=>boolean;confirmTransfer:(ids:string[])=>boolean;undoReview:()=>void;editManual:(id:string,draft:ManualDraft)=>boolean;deleteManual:(id:string)=>boolean;applyActuals:(month:string,signature:string,excludeOther:boolean,excludeAnnual:boolean)=>boolean;
 resetExample:()=>boolean;clear:()=>void;restore:(w:Workspace)=>Promise<boolean>;retrySave:()=>void;flushSave:()=>Promise<boolean>;dismissMutationError:()=>void;};
function schedule(){if(!repository)return;clearTimeout(timer);const state=useFinance.getState();useFinance.setState({revision:state.revision+1,saving:true,error:null});timer=setTimeout(()=>{void useFinance.getState().flushSave();},180);}
function transactionChange(label:string,ids:string[],change:(w:Workspace)=>Workspace){const store=useFinance.getState(),data=store.data,w=active(data);const before=ids.map(id=>({id,before:w.transactions.find(t=>t.id===id)||null}));if(!store.change(change))return false;const next=useFinance.getState();useFinance.setState({undo:{demo:data.demo,rows:before,rules:w.rules,coverage:w.coverage,revision:next.revision,label}});return true;}
export const useFinance=create<State>((set,get)=>({exampleGeneration:0,data:immutable(freshData()),ready:false,error:null,mutationError:null,saving:false,lastSaved:null,undo:null,storageBlocked:false,generation:0,revision:0,durableRevision:0,recoveryArchive:null,recoverablePersonal:null,
 async init(){
  if(repository&&get().ready&&!get().storageBlocked)return;
  set({ready:false,error:null});
  try{repository=await openFinanceRepository();const data=immutable(await repository.read());set({data,ready:true,storageBlocked:false,error:null,mutationError:null,recoveryArchive:null,recoverablePersonal:null});}
  catch{let recovery:{raw:string;personal:Workspace|null}|null=null;try{recovery=await repository?.recovery()||null;}catch{}set({ready:true,storageBlocked:true,error:'Saved data could not be opened. Your existing records have not been replaced.',recoveryArchive:recovery?.raw||null,recoverablePersonal:recovery?.personal||null});}
 },
 change(f){
  if(get().storageBlocked){set({mutationError:'Restore or reopen your saved data before editing.'});return false;}
  try{const data=get().data,key=data.demo?'example':'personal',previous=active(data),candidate=f(previous),next=validateWorkspace(candidate,previous);const affectsUndo=next.transactions!==previous.transactions||next.rules!==previous.rules||next.coverage!==previous.coverage;
   set({data:immutable({...data,[key]:next}),mutationError:null,...(affectsUndo?{undo:null}:{})});schedule();return true;
  }catch(e){set({mutationError:e instanceof Error?e.message:'The edit could not be validated. Your previous figures are unchanged.'});return false;}
 },
 patch(p){if('debt' in p||'debtApr' in p||'goal' in p||'goalSaved' in p||'goalMonths' in p){set({mutationError:'Use the named debt or goal list to change these figures.'});return false;}return get().change(w=>({...w,plan:{...w.plan,...p},planConfirmedAt:Object.keys(p).some(k=>k!=='coverageConfirmed'&&k!=='monthsReviewed')?null:w.planConfirmedAt}));},
 setDemo(v){if(get().storageBlocked)return;set({data:immutable(switchWorkspace(get().data,v)),undo:null,mutationError:null});schedule();},
 preferences(p){if(get().storageBlocked)return;set({data:immutable({...get().data,preferences:{...get().data.preferences,...p}})});schedule();},
 merge(rows,success,receipt){return get().change(w=>{const incoming=applyRules(rows,w.rules),merged=mergeTransactions(w.transactions,incoming),prior=new Map(w.transactions.map(t=>[t.id,t])),changed=new Set<string>();for(const t of merged){const old=prior.get(t.id);if(!old||old.amount!==t.amount||old.date!==t.date||old.merchant!==t.merchant||old.account!==t.account){changed.add(t.date.slice(0,7));if(old)changed.add(old.date.slice(0,7));}}return {...w,...(receipt?{syncReceipt:receipt}:{}),transactions:merged,lastSync:success?new Date().toISOString():w.lastSync,coverage:w.coverage.filter(c=>!changed.has(c.month))};});},
 review(ids,movement,category,remember=false){return transactionChange('Review',ids,current=>{const selected=new Set(ids),rows=current.transactions.filter(t=>selected.has(t.id));if(rows.length!==selected.size||rows.length===0)throw Error('The selected transactions changed. Select them again.');if(rows.some(t=>!treatmentFits(movement,t.amount)))throw Error('This treatment does not match the selected debit/credit directions.');let rules=current.rules;if(remember&&movement!=='review'){const decisions=Array.from(new Map(rows.map(t=>{const direction=t.amount<0?'in' as const:'out' as const;return [t.merchant.toLowerCase()+':'+direction,{merchant:t.merchant.toLowerCase(),direction}];})).values());rules=[...rules.filter(r=>!decisions.some(d=>d.merchant===r.merchant.toLowerCase()&&d.direction===r.direction)),...decisions.map(d=>({id:d.merchant+':'+d.direction,...d,movement,category}))];}return {...current,transactions:reviewRows(current.transactions,ids,movement,category),rules,coverage:current.coverage.filter(c=>!rows.some(t=>t.date.startsWith(c.month)))};});},
 confirmTransfer(ids){return transactionChange('Transfer review',ids,w=>{const selected=transferPair(w.transactions,ids);return {...w,transactions:reviewRows(w.transactions,ids,'transfer','Transfers'),coverage:w.coverage.filter(c=>!selected.some(t=>t.date.startsWith(c.month)))};});},
 editManual(id,draft){return transactionChange('Manual edit',[id],w=>editManual(w,id,draft));},
 deleteManual(id){return transactionChange('Deletion',[id],w=>deleteManual(w,id));},
 undoReview(){const undo=get().undo;if(!undo||undo.demo!==get().data.demo)return;get().change(w=>{const ids=new Set(undo.rows.map(t=>t.id));const restored=[...w.transactions.filter(t=>!ids.has(t.id)),...undo.rows.flatMap(t=>t.before?[t.before]:[])].sort((a,b)=>b.date.localeCompare(a.date));return {...w,transactions:restored,rules:undo.rules,coverage:undo.coverage};});set({undo:null});},
 applyActuals(month,signature,excludeOther,excludeAnnual){return get().change(w=>applyActuals(w,month,signature,excludeOther,excludeAnnual));},
 resetExample(){if(get().storageBlocked)return false;try{const example=validateWorkspace(exampleWorkspace());set({data:immutable({...get().data,example}),exampleGeneration:get().exampleGeneration+1,mutationError:null,...(get().undo?.demo?{undo:null}:{})});schedule();return true;}catch(e){set({mutationError:e instanceof Error?e.message:'Examples could not be reset.'});return false;}},
 clear(){if(get().change(()=>freshWorkspace()))set({undo:null,generation:get().generation+1});},
 async restore(w){if(!repository){set({mutationError:'Storage is unavailable. Retry opening the saved data before restoring a backup.'});return false;}try{const checked=anchorGoalDates(validateWorkspace(w));set({data:immutable({...get().data,personal:checked,demo:false}),undo:null,storageBlocked:false,generation:get().generation+1,mutationError:null});schedule();return await get().flushSave();}catch(e){set({mutationError:e instanceof Error?e.message:'Backup could not be restored.'});return false;}},
 retrySave(){void get().flushSave();},
 flushSave(){
  clearTimeout(timer);const state=get();if(!repository||state.storageBlocked)return Promise.resolve(false);const target=state.revision;if(target<=state.durableRevision)return Promise.resolve(true);if(target<=queuedRevision)return writing as Promise<boolean>;
  queuedRevision=target;const snapshot=state.data;set({saving:true,error:null});
  const task=writing.then(async()=>{try{await repository!.save(snapshot);const now=get();set({durableRevision:Math.max(now.durableRevision,target),lastSaved:new Date().toISOString(),...(now.revision===target?{saving:false,error:null}:{})});return true;}catch{if(queuedRevision===target)queuedRevision=target-1;if(get().revision===target)set({saving:false,error:'Changes are in memory but could not be saved. Retry before closing the app.'});return false;}});
  writing=task;return task;
 },
 dismissMutationError(){set({mutationError:null});}
}));
