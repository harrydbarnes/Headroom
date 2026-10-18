import {activityCopy} from '../strings/activity';
import {HelpNote} from './components';
import {toUserMessage} from '../strings/errors';
import React,{useState} from 'react';
import type {Transaction} from '../lib/finance';
import {emptyLedger,pounds} from '../lib/ledger';
import {useWorkspace} from '../state/hooks';
import {Button,Copy,Input,Notice} from './components';
export function TransactionDetails({transaction:t}:{transaction:Transaction}){
 const store=useWorkspace(),l=store.workspace.ledger??emptyLedger(),a=l.annotations.find(a=>a.transactionId===t.id);
 const [note,setNote]=useState(a?.note??''),[tags,setTags]=useState(a?.tags.join(', ')??''),[alias,setAlias]=useState(a?.alias??''),[receipt,setReceipt]=useState(a?.receipts[0]?.reference??''),[splits,setSplits]=useState(a?.splits.map(s=>s.category+' = '+(s.amount/100).toFixed(2)).join('\n')??''),[error,setError]=useState(''),[saved,setSaved]=useState(false);
 const edit=(set:(v:string)=>void)=>(value:string)=>{set(value);setSaved(false);setError("");store.dismissMutationError();};
 return <><Copy strong>{activityCopy.transactionDetails}</Copy><Input label={activityCopy.displayMerchantName} value={alias} onChangeText={edit(setAlias)}/><Input label={activityCopy.note} value={note} onChangeText={edit(setNote)} multiline/><Input label={activityCopy.tagsCommaSeparated} value={tags} onChangeText={edit(setTags)}/><Input label={activityCopy.receiptFileReference} value={receipt} onChangeText={edit(setReceipt)}/><Input label={activityCopy.splitsCategoryAmountPerLine} value={splits} onChangeText={edit(setSplits)} multiline/><HelpNote summary={activityCopy.splitAmountsMustAddUpExactlyTo}><Copy small>{activityCopy.splitAmountsMustAddUpExDetail}</Copy></HelpNote><Button secondary title={activityCopy.saveTransactionDetails} onPress={()=>{setError("");setSaved(false);try{const parts=splits.trim()?splits.trim().split('\n').map(line=>{const pos=line.lastIndexOf('=');if(pos<1)throw Error('Use category = pounds for each split.');return {category:line.slice(0,pos).trim(),amount:pounds(line.slice(pos+1))};}):[];const annotation={transactionId:t.id,note,tags:tags.split(',').map(s=>s.trim()).filter(Boolean),alias,receipts:receipt.trim()?[{name:'Receipt',reference:receipt.trim()}]:[],splits:parts};setSaved(store.change(w=>({...w,ledger:{...l,annotations:[...l.annotations.filter(a=>a.transactionId!==t.id),annotation]}})));}catch(e){setError(toUserMessage(e));}}}/>{!!(error||store.mutationError)&&<Notice error>{toUserMessage(error||store.mutationError)}</Notice>}{saved&&<Copy small>{activityCopy.detailsUpdatedCheckText}</Copy>}</>;
}
