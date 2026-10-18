import {planCopy} from '../strings/plan';
import {HelpNote} from './components';
import {glossary} from '../strings/glossary';
import {toUserMessage} from '../strings/errors';
import React,{useState} from 'react';
import {View} from 'react-native';
import {useWorkspace} from '../state/hooks';
import {monthKey} from '../lib/workspace';
import {Button,Choice,Copy,Input,Notice,Toggle} from './components';
export function CoverageEditor({month}:{month:string}){
 const store=useWorkspace(),w=store.workspace,prior=w.coverage.find(c=>c.month===month),[states,setStates]=useState<Record<string,string>>(Object.fromEntries(prior?.accounts?.map(a=>[a.name,a.status])??[])),[extra,setExtra]=useState(''),[names,setNames]=useState<string[]>([]),[checked,setChecked]=useState(false);
 const accounts=[...new Set([...w.transactions.map(t=>t.account),...(prior?.accounts?.map(a=>a.name)??[]),...names,'Cash / unsupported spending'])];
 const unresolved=w.transactions.some(t=>t.date.startsWith(month)&&t.movement==='review');
 const valid=accounts.every(name=>states[name]==='complete'||(states[name]==='noActivity'&&!w.transactions.some(t=>t.account===name&&t.date.startsWith(month))));
 return <><Copy>{prior?planCopy.monthPreviouslyConfirmedReviewThisChecklistTo:planCopy.monthNotConfirmed}</Copy><HelpNote summary={planCopy.checkTheFullMonthAgainstEveryStatement}><Copy small>{planCopy.checkTheFullMonthAgainstEveryStatement2}</Copy></HelpNote>{accounts.map(name=><View key={name} style={{gap:8}}><Copy strong>{name==='Cash / unsupported spending'?glossary.otherAccounts:name}</Copy><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{(['missing','complete','noActivity'] as const).map(status=><Choice key={status} title={{missing:planCopy.missingData,complete:planCopy.completeStatement,noActivity:planCopy.noActivity}[status]} selected={(states[name]??'missing')===status} disabled={status==='noActivity'&&w.transactions.some(t=>t.account===name&&t.date.startsWith(month))} onPress={()=>setStates(s=>({...s,[name]:status}))}/>)}</View></View>)}<Input label={planCopy.addAnAccountWithoutImportedActivity} value={extra} maxLength={500} onChangeText={setExtra}/><Button secondary title={planCopy.addAccount} disabled={!extra.trim()||accounts.includes(extra.trim())||accounts.length>=200} onPress={()=>{setNames(n=>[...n,extra.trim()]);setExtra('');}}/><Toggle label={planCopy.thisChecklistIncludesAllMyAccountsCash} value={checked} onChange={setChecked}/>{(unresolved||month>=monthKey())&&<Notice>{unresolved?planCopy.reviewEveryTransactionBeforeConfirming:planCopy.waitUntilTheMonthEndsThenCheck}</Notice>}{store.mutationError&&<Notice error>{toUserMessage(store.mutationError)}</Notice>}<Button title={planCopy.confirmMonthComplete} disabled={!valid||!checked||unresolved||month>=monthKey()} onPress={()=>{if(store.change(x=>({...x,coverage:[...x.coverage.filter(c=>c.month!==month),{month,confirmedAt:new Date().toISOString(),accounts:accounts.map(name=>({name,status:states[name] as 'complete'|'noActivity'}))}]})))setChecked(false);}}/></>;
}
