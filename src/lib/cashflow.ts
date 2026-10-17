import type {Workspace} from './workspace';
import type {Transaction} from './finance';
import {money,latestBalance} from './ledger';
import {emptyPlanning,type Commitment} from './planning';
import {daysBetween,occurrence,periodAt,plusDays,type Cadence} from './periods';
const same=(a:string,b:string)=>a.trim().toLowerCase()===b.trim().toLowerCase();
export function recurringSuggestions(w:Workspace,asOf:string){
 const groups=new Map<string,Transaction[]>();for(const t of w.transactions)if(t.date<=asOf&&['purchase','income'].includes(t.movement)){const key=JSON.stringify([t.account,t.merchant.toLowerCase(),t.amount<0]);groups.set(key,[...(groups.get(key)??[]),t]);}
 return [...groups.values()].flatMap(rows=>{rows.sort((a,b)=>a.date.localeCompare(b.date));if(rows.length<3)return [];const last=rows.at(-1)!;if(w.planning?.commitments.some(c=>same(c.merchant,last.merchant)&&c.account===last.account&&(!c.until||c.until>=asOf)))return [];
  const intervals=rows.slice(1).map((r,i)=>daysBetween(rows[i].date,r.date)),mean=intervals.reduce((n,v)=>n+v,0)/intervals.length;
  const candidates:[Cadence,number,number][]=[['weekly',7,2],['fortnightly',14,3],['four-weekly',28,3],['monthly',30.44,4],['yearly',365.25,8]],fit=candidates.filter(([,n,tol])=>Math.abs(n-mean)<=tol).sort((a,b)=>Math.abs(a[1]-mean)-Math.abs(b[1]-mean))[0];
  if(!fit||intervals.some(n=>Math.abs(n-fit[1])>fit[2]))return [];
  const amounts=rows.map(r=>Math.abs(r.amount)),low=Math.min(...amounts),high=Math.max(...amounts),rule={cadence:fit[0],anchor:last.date,weekend:'none' as const};
  return [{merchant:last.merchant,account:last.account,amount:Math.abs(last.amount),direction:last.amount<0?'in' as const:'out' as const,rule:{...rule,anchor:occurrence(rule,1)},variable:low!==high,low,high,confidence:intervals.length>=3?'Repeated pattern':'Three observations',transactionIds:rows.map(t=>t.id),last:last.date}];
 });
}
export type CashEvent={id:string;commitmentId?:string;refundId?:string;due:string;merchant:string;account:string;amount:number;status:'expected'|'settled'|'overdue'|'ambiguous';transactionId?:string;variable:boolean;assumption:string};
function amountOn(c:Commitment,date:string){return c.priceHistory.filter(p=>p.date<=date).sort((a,b)=>a.date.localeCompare(b.date)).at(-1)?.amount??c.amount;}
export function cashEvents(w:Workspace,asOf:string,through:string){
 const p=w.planning??emptyPlanning(),used=new Set<string>(),events:CashEvent[]=[],booked=w.transactions.filter(t=>t.date<=asOf&&t.movement!=='transfer');
 const explicit=new Set([...p.commitments.flatMap(c=>c.settlements.map(s=>s.transactionId)),...p.refunds.flatMap(r=>r.receivedId?[r.receivedId]:[])]);
 for(const c of p.commitments.filter(c=>c.confirmed)){
  const first=Math.max(0,periodAt(c.rule,plusDays(asOf,-40)).index);let count=0;
  for(let n=first;;n++){
   if(++count>500)throw Error('Too many forecast occurrences.');const due=occurrence(c.rule,n);if(due>through||c.until&&due>c.until)break;
   const expected=amountOn(c,due)*(c.direction==='in'?-1:1),link=c.settlements.find(s=>s.due===due),linked=link?booked.find(t=>t.id===link.transactionId&&t.account===c.account&&Math.sign(t.amount)===Math.sign(expected)&&Math.abs(daysBetween(t.date,due))<=35):undefined;
   const candidates=booked.filter(t=>!used.has(t.id)&&!explicit.has(t.id)&&!c.ignoredMatches?.some(s=>s.due===due&&s.transactionId===t.id)&&t.account===c.account&&same(t.merchant,c.merchant)&&t.amount===expected&&Math.abs(daysBetween(t.date,due))<=3);
   const transaction=linked??(candidates.length===1?candidates[0]:undefined);if(transaction)used.add(transaction.id);
   events.push({id:c.id+':'+due,commitmentId:c.id,due,merchant:c.merchant,account:c.account,amount:expected,status:transaction?'settled':candidates.length>1?'ambiguous':due<asOf?'overdue':'expected',...(transaction?{transactionId:transaction.id}:{}),variable:c.variable,assumption:linked?'Explicitly linked booked entry':transaction?'Exact merchant, account, amount; within three days':link?'Linked entry missing or changed; review required':c.variable?'Variable amount uses your confirmed estimate':'Confirmed schedule'});
  }
 }
 for(const r of p.refunds.filter(r=>!r.dismissed&&r.due<=through)){
  const source=w.transactions.find(t=>t.id===r.purchaseId&&t.movement==='purchase'),received=r.receivedId?booked.find(t=>t.id===r.receivedId&&t.account===r.account&&t.movement==='refund'&&t.amount<=-r.amount):undefined;
  events.push({id:'refund:'+r.id,refundId:r.id,due:r.due,merchant:r.merchant,account:r.account,amount:-r.amount,status:received?'settled':r.due<asOf?'overdue':'expected',...(received?{transactionId:received.id}:{}),variable:false,assumption:!source?'Original purchase missing or changed; review required':received?'Explicitly linked refund':'Expected refund is uncertain until received'});
 }
 return events.sort((a,b)=>a.due.localeCompare(b.due)||a.id.localeCompare(b.id));
}
export function forecast(w:Workspace,asOf:string){
 const p=w.planning??emptyPlanning(),end=plusDays(asOf,p.forecast.horizon),events=cashEvents(w,asOf,end),warnings:string[]=[],sources=p.forecast.accounts.map(id=>({account:w.ledger?.accounts.find(a=>a.id===id),...latestBalance(w.ledger!,id,Date.parse(asOf+'T23:59:59Z'))}));
 if(!sources.length)warnings.push('Choose spendable accounts with dated balance snapshots.');
 if(sources.some(s=>!s.snapshot||s.status==='future'||s.account?.archived||!['cash','current','savings'].includes(s.account?.kind??'')))warnings.push('A selected account is missing a usable spendable balance.');
 const names=new Set(sources.flatMap(s=>s.account?[s.account.name]:[])),selected=events.filter(e=>names.has(e.account)),unknown=w.transactions.filter(t=>names.has(t.account)&&t.date<=asOf&&t.movement==='review').length;
 if(w.syncReceipt&&w.syncReceipt.status!=='complete')warnings.push('The latest bank import was '+w.syncReceipt.status+'; some booked activity may be missing.');
 if(unknown)warnings.push(unknown+' transactions still need review.');
 if(sources.some(s=>s.status==='stale'))warnings.push('At least one starting snapshot is older than 24 hours.');
 if(selected.some(e=>e.status==='ambiguous'))warnings.push('Ambiguous booked matches need explicit reconciliation.');
 if(selected.some(e=>e.status==='overdue'))warnings.push('Missed expected payments/income are shown separately; future amounts may differ.');
 if(selected.some(e=>e.variable))warnings.push('Variable commitments use confirmed estimates.');
 warnings.push('Planning estimate: unsupported/pending payments, unrecorded spending and excluded accounts may be missing.');
 const usable=sources.length>0&&sources.every(s=>s.snapshot&&s.status!=='future'&&!s.account?.archived&&['cash','current','savings'].includes(s.account?.kind??'')),base=usable?money(sources.reduce((n,s)=>money(n+s.snapshot!.current),0)):null;
 // Move each dated current balance forward using booked deltas after its timestamp, once.
 const opening=base===null?null:money(base-sources.reduce((n,s)=>money(n+w.transactions.filter(t=>t.account===s.account!.name&&t.date>s.snapshot!.asOf.slice(0,10)&&t.date<=asOf).reduce((sum,t)=>money(sum+t.amount),0)),0));
 const overdueReserve=money(selected.filter(e=>e.status==='overdue'&&e.amount>0).reduce((n,e)=>money(n+e.amount),0));const reserve=money(p.forecast.reserve+p.forecast.goalReserve+p.forecast.pensionDelta+overdueReserve);let running=opening===null?null:money(opening-reserve),low=running;
 const rows=Array.from({length:p.forecast.horizon+1},(_,i)=>{const date=plusDays(asOf,i),due=selected.filter(e=>e.due===date&&(e.status==='expected'||e.status==='ambiguous'&&e.amount>0)),delta=money(due.reduce((n,e)=>money(n-e.amount),0)),certainDelta=money(due.filter(e=>!e.refundId).reduce((n,e)=>money(n-e.amount),0));if(running!==null){running=money(running+certainDelta);low=Math.min(low!,running);}return {date,events:due,delta,balance:running,unconfirmedRefunds:money(due.filter(e=>e.refundId).reduce((n,e)=>n-e.amount,0))};});
 return {sources,opening,reserve,overdueReserve,rows,events,low,warnings,excludedAccounts:(w.ledger?.accounts??[]).filter(a=>!p.forecast.accounts.includes(a.id)).map(a=>a.name),end};
}
