import {useCallback,useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {AppState} from 'react-native';
import * as Linking from 'expo-linking';
import {ConnectionStatusController} from '../lib/connectionStatus';
import {useFinance} from '../state/store';
import {active,completeImport,importCounts} from '../lib/workspace';
import {api,connectBank,saveConnection,savedConnection,sync,type Bank,type Connection,type SyncOutcome} from './api';
export function useBanking(){
 const [banks,setBanks]=useState<Bank[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(''),[outcomes,setOutcomes]=useState<SyncOutcome[]>([]),[loaded,setLoaded]=useState(false);const inFlight=useRef(false),consentResult=useRef('');
 const statusController=useRef<ConnectionStatusController|null>(null);if(!statusController.current)statusController.current=new ConnectionStatusController(savedConnection,()=>api('/api/banking/status'));
 const controller=statusController.current,connectionStatus=useSyncExternalStore(controller.subscribe,controller.snapshot,controller.snapshot);
 const status=()=>controller.refresh();
 const run=useCallback(async(task:()=>Promise<void>)=>{if(inFlight.current)return;inFlight.current=true;setBusy(true);setError('');setMessage('');try{await task();}catch(e){setError(e instanceof Error?e.message:'The request failed. Try again.');}finally{inFlight.current=false;setBusy(false);setLoaded(true);}},[]);
 const refreshStatus=()=>run(status);
 useEffect(()=>{void refreshStatus();const sub=AppState.addEventListener('change',state=>{if(state==='active')void refreshStatus();});const link=Linking.addEventListener('url',({url})=>{const parsed=Linking.parse(url);if(parsed.hostname==='banking'||parsed.path==='banking'){consentResult.current=String(parsed.queryParams?.result??'');if(consentResult.current==='cancelled')setMessage('Bank authorisation cancelled. Existing consent and local transactions are unchanged.');void refreshStatus();}});return()=>{sub.remove();link.remove();};},[]);
 return {origin:connectionStatus.origin,paired:connectionStatus.paired,connections:connectionStatus.connections,banks,busy,message,error,outcomes,loaded,statusState:connectionStatus.phase,lastStatusAt:connectionStatus.lastVerifiedAt,statusError:connectionStatus.error,configured:connectionStatus.configured,refreshStatus,clearMessage:()=>{setMessage('');setError('');},
  save:(address:string,token:string)=>run(async()=>{await saveConnection(address,token);await status();setMessage('Device paired. You can now find your bank.');}),
  discover:()=>run(async()=>{const d=await api('/api/banking/banks');setBanks(d.banks||[]);setMessage('Choose the exact bank and account product you use.');}),
  connect:(name:string)=>run(async()=>{if(useFinance.getState().data.demo)throw Error('Leave example mode to connect a real bank.');const prior=new Set(controller.snapshot().connections.map(c=>c.id));consentResult.current='';await connectBank(name);await status();const latest=controller.snapshot(),added=latest.phase==='verified'&&latest.connections.some(c=>c.provider===name&&!prior.has(c.id));setMessage(added?'New bank connection verified. Refresh transactions, then disconnect any superseded expired consent.':consentResult.current==='cancelled'?'Authorisation cancelled. No new verified connection was added.':'Authorisation unfinished or not yet verified. Complete the bank browser flow, then retry connection status.');}),
  disconnect:(id:string)=>run(async()=>{await api('/api/banking/disconnect','POST',{id});await status();setMessage('Bank consent revoked and its server cache deleted. Local transactions remain until you delete them.');}),
  reset:()=>{controller.reset();setBanks([]);setOutcomes([]);},
  refresh:(connectionId?:string)=>run(async()=>{const state=useFinance.getState();if(state.storageBlocked)throw Error('Restore saved storage before importing transactions.');if(state.data.demo)throw Error('Leave example mode before importing real accounts.');const attemptedAt=new Date().toISOString();
 const eligible=()=>{const current=useFinance.getState();return current.generation===state.generation&&!current.data.demo&&!current.storageBlocked;};
 try{const d=await sync(connectionId);const current=useFinance.getState();if(!eligible())throw Error('Workspace changed during import. Return to personal figures and refresh again.');const counts=importCounts(active(current.data).transactions,d.rows),success=completeImport(d.outcomes);if(!current.merge(d.rows,success&&!connectionId,{attemptedAt,finishedAt:new Date().toISOString(),status:success?'complete':'partial',...counts,warnings:d.warnings,outcomes:d.outcomes}))throw Error(useFinance.getState().mutationError||'Imported data or receipt failed validation. Previous figures retained.');setOutcomes(d.outcomes);setMessage(`${counts.added} new · ${counts.updated} updated · ${counts.unchanged} unchanged. ${d.warnings.join(' ')}`);await status();
 }catch(e){if(eligible()){const warning=e instanceof Error?e.message:'Import failed. Previous data retained.';useFinance.getState().change(w=>({...w,syncReceipt:{attemptedAt,finishedAt:new Date().toISOString(),status:'failed',added:0,updated:0,unchanged:0,warnings:[warning],outcomes:[]}}));}throw e;}})
 };
}
export type Banking=ReturnType<typeof useBanking>;
