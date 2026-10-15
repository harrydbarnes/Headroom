import * as Finance from './transactions';
import * as Savings from './savingsReview';
import type {RecordRow,Statement,Account} from './transactions';
export interface FinanceMeta {requiredAccounts:string[];accounts:Account[];statements:Statement[];}
 export function score(month:string,records:RecordRow[],meta:FinanceMeta,finance:typeof Finance,savings:typeof Savings,caps:number[]){
  const scope=[...new Set([...meta.requiredAccounts,...meta.accounts.filter(a=>a.type==='savings').map(a=>a.name)])];
  const result=finance.monthly(month,records,meta.statements,meta.accounts,scope),cents=finance.cents;
  const groups=caps.map((cap,id)=>({id,cap,actual:0,difference:0}));let outside=0;
  const account=(r:RecordRow)=>meta.accounts.find(a=>a.id===r.account||a.name===r.account);
  const validRefund=(r:RecordRow)=>r.flow==='refund'&&r.amount<0&&records.some(p=>p.id===r.refundOf&&p.flow==='spend'&&p.amount>0&&p.account===r.account)&&!result.unknown.includes(r);
  const purchases=result.rows.filter(r=>r.flow==='spend'&&r.amount>0||validRefund(r));
  const pending=result.rows.filter(r=>r.category==='Unsure'||r.pattern==='review'||result.unknown.includes(r));
  const classificationPending=purchases.some(r=>{const p=r.flow==='refund'?records.find(p=>p.id===r.refundOf):r;return !p||p.category==='Unsure'||p.pattern==='review';});
  const verified=result.complete&&!classificationPending;
  for(const r of purchases){const original=r.flow==='refund'?records.find(p=>p.id===r.refundOf):r,id=original!.category==='Health'&&/Chelmsford City Council/i.test(original!.merchant)&&/^(Harry|Cam) gym/i.test(original!.note||'')?null:savings.group(original!);if(id===null)outside+=cents(r.amount);else groups[id].actual+=cents(r.amount);}
  for(const g of groups){g.actual/=100;g.difference=(cents(g.cap)-cents(g.actual))/100;}
  const spending=groups.reduce((s,g)=>s+cents(g.actual),0)/100,capTotal=caps.reduce((s,c)=>s+cents(c),0)/100;
  const movements=result.rows.filter(r=>r.flow==='savings'&&account(r)?.type!=='savings');
  let deposits=0,withdrawals=0,unresolvedSavings=0;
  for(const r of movements){const other=records.find(x=>x.id===r.matchedTo);if(finance.validMatch(r,records)&&account(other!)?.type==='savings'){if(r.amount>0)deposits+=cents(r.amount);else withdrawals-=cents(r.amount);}else unresolvedSavings++;}
  return {result,groups,spending,capTotal,outside:outside/100,difference:(cents(capTotal)-cents(spending))/100,verified,pendingCount:pending.length,pendingAmount:pending.reduce((s,r)=>s+Math.abs(cents(r.amount)),0)/100,deposits:deposits/100,withdrawals:withdrawals/100,netSavings:(deposits-withdrawals)/100,unresolvedSavings,savingsVerified:result.complete&&unresolvedSavings===0};
 }
