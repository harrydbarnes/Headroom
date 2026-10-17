import {categoryGroup,spendingParts} from './planning';
import type {Transaction} from './finance';
import {manualTransaction,monthKey,type Workspace} from './workspace';

export function actualsPreview(w:Workspace,month:string){
 const all=w.transactions.filter(t=>t.date.startsWith(month));
 const spending=spendingParts(all,w.ledger).map(t=>({...t,category:categoryGroup(w.planning?.categories??[],t.category)}));
 const included=spending.filter(t=>t.category==='Essentials'||t.category==='Flexible');
 const annual=spending.filter(t=>t.category==='Annual bills');
 const unresolved=spending.filter(t=>t.category==='Uncategorised'||!t.category.trim());
 const other=spending.filter(t=>!['Essentials','Flexible','Annual bills','Uncategorised',''].includes(t.category));
 const essentials=included.filter(t=>t.category==='Essentials').reduce((sum,t)=>sum+t.amount,0);
 const flexible=included.filter(t=>t.category==='Flexible').reduce((sum,t)=>sum+t.amount,0);
 const reasons:string[]=[];
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)||month>=monthKey())reasons.push('Choose a completed past month.');
 if(!w.coverage.some(c=>c.month===month))reasons.push('Confirm full month coverage in Activity first.');
 if(all.some(t=>t.movement==='review'))reasons.push('Review every transaction in this month first.');
 if(unresolved.length)reasons.push('Categorise the remaining uncategorised spending first.');
 if(!spending.length)reasons.push('This month has no reviewed spending to use.');
 if(essentials<0||flexible<0)reasons.push('Net refunds exceed spending in a baseline category. Choose another month or enter a manual baseline.');
 const signature=JSON.stringify([month,w.plan.essentials,w.plan.flexible,w.plan.annualReserve,w.coverage.filter(c=>c.month===month),all.map(t=>[t.id,t.amount,t.movement,t.category]),w.ledger?.annotations,w.planning?.categories]);
 return {month,essentials,flexible,included,annual,unresolved,other,reasons,signature,excludedCount:all.length-new Set(included.map(t=>t.parentId)).size};
}
export function applyActuals(w:Workspace,month:string,signature:string,excludeOther:boolean,excludeAnnual:boolean):Workspace{
 const preview=actualsPreview(w,month);
 if(preview.signature!==signature)throw Error('Your figures changed after this preview. Reopen it before applying.');
 if(preview.reasons.length)throw Error(preview.reasons.join(' '));
 if(preview.other.length&&!excludeOther)throw Error('Explicitly confirm the excluded Other spending, or recategorise it first.');
 if(preview.annual.length&&!excludeAnnual)throw Error('Confirm annual bills are excluded and the annual reserve stays unchanged.');
 return {...w,plan:{...w.plan,essentials:preview.essentials,flexible:preview.flexible},planConfirmedAt:null};
}
export type ManualDraft={merchant:string;account:string;date:string;amount:number;incoming:boolean};
export function editManual(w:Workspace,transactionId:string,draft:ManualDraft):Workspace{
 const prior=w.transactions.find(t=>t.id===transactionId);
 if(!prior||!prior.id.startsWith('manual:'))throw Error('Only manual transactions can have their source details edited.');
 const next={...manualTransaction(draft.merchant,draft.account,draft.date,draft.amount,draft.incoming),id:prior.id};
 const changedMonths=new Set([prior.date.slice(0,7),next.date.slice(0,7)]);
 return {...w,transactions:w.transactions.map(t=>t.id===prior.id?next:t).sort((a,b)=>b.date.localeCompare(a.date)),coverage:w.coverage.filter(c=>!changedMonths.has(c.month))};
}
export function deleteManual(w:Workspace,transactionId:string):Workspace{
 const prior=w.transactions.find(t=>t.id===transactionId);
 if(!prior||!prior.id.startsWith('manual:'))throw Error('Only manual transactions can be deleted here. Disconnecting a bank does not delete its imported history.');
 return {...w,...(w.ledger?{ledger:{...w.ledger,annotations:w.ledger.annotations.filter(a=>a.transactionId!==transactionId)}}:{}),transactions:w.transactions.filter(t=>t.id!==transactionId),coverage:w.coverage.filter(c=>c.month!==prior.date.slice(0,7))};
}
export function duplicateManual(rows:Transaction[],draft:ManualDraft,exceptId?:string){const signed=draft.incoming?-draft.amount:draft.amount;return rows.some(t=>t.id!==exceptId&&t.merchant.trim().toLowerCase()===draft.merchant.trim().toLowerCase()&&t.account===draft.account&&t.date===draft.date&&t.amount===signed);}

/** Recheck both sides at confirmation time; stale or ambiguous previews stay unresolved. */
export function transferPair(rows:Transaction[],ids:string[]){
 const selected=rows.filter(t=>ids.includes(t.id));if(new Set(ids).size!==2||selected.length!==2)throw Error('Select two existing transfer entries.');
 const matches=(t:Transaction)=>rows.filter(other=>other.id!==t.id&&other.account!==t.account&&other.amount===-t.amount&&Math.abs(Date.parse(other.date)-Date.parse(t.date))<=3*86400000);
 const [a,b]=selected;if(a.amount===0||a.account===b.account||a.amount!==-b.amount||matches(a).length!==1||matches(b).length!==1||matches(a)[0].id!==b.id)throw Error('Transfer match changed or is ambiguous. Review both sides individually.');return selected;
}
