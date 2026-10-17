import type {Workspace} from './workspace';
import {money} from './ledger';
import {categoryGroup,emptyPlanning,spendingParts,type Budget} from './planning';
import {daysBetween,occurrence,periodAt,plusDays,type PeriodRule} from './periods';
export function budgetLedger(w:Workspace,b:Budget,asOf:string){
 const p=w.planning??emptyPlanning(),rule=b.period??p.period,start=periodAt(rule,b.from),current=periodAt(rule,asOf);
 const included=new Set(w.ledger?.accounts.filter(a=>a.included).map(a=>a.name)??w.transactions.map(t=>t.account)),parts=spendingParts(w.transactions,w.ledger).filter(t=>included.has(t.account));
 const matches=(t:typeof parts[number])=>b.scope==='overall'||b.scope==='merchant'&&t.merchant.toLowerCase()===b.target.toLowerCase()||b.scope==='category'&&(t.category===b.target||categoryGroup(p.categories,t.category)===b.target||p.categories.some(c=>c.name===t.category&&p.categories.find(parent=>parent.id===c.parentId)?.name===b.target));
 const periodSpending=new Map<number,number>();for(const t of parts)if(t.date>=b.from&&t.date<=asOf&&(!b.until||t.date<b.until)&&matches(t)){const index=periodAt(rule,t.date).index;periodSpending.set(index,money((periodSpending.get(index)??0)+t.amount));}
 let carry=0;const rows:{start:string;end:string;spent:number;carryIn:number;remaining:number;allocation:number;closed:boolean;adjustment:number|null}[]=[];
 for(let i=start.index;i<=current.index;i++){
  const from=occurrence(rule,i),end=occurrence(rule,i+1),active=from>=(b.from>start.start?b.from:start.start)&&(!b.until||from<b.until);
  // A mid-period start is a full allocation from that date, never a claim about prior spending.
  const effectiveStart=i===start.index?b.from:from;
  if(b.until&&effectiveStart>=b.until)break;
  const spent=(periodSpending.get(i)??0);
  const allocation=active||i===start.index?b.amount:0,remaining=money(allocation+carry-spent),closed=end<=asOf,saved=p.closes.filter(c=>c.budgetId===b.id&&c.start===from&&c.end===end).at(-1);
  rows.push({start:from,end,spent,carryIn:carry,remaining,allocation,closed,adjustment:saved?money(remaining-saved.remaining):null});
  carry=b.rollover==='both'?remaining:b.rollover==='positive'?Math.max(0,remaining):0;
 }
 const row=rows.at(-1),isCurrent=row?.start===current.start&&(!b.until||asOf<b.until);
 const elapsed=daysBetween(current.start,asOf)+1,previous=rows.at(-2),comparable=previous?money(parts.filter(t=>t.date>=previous.start&&t.date>=b.from&&t.date<previous.end&&t.date<plusDays(previous.start,elapsed)&&matches(t)).reduce((n,t)=>money(n+t.amount),0)):null;
 return {rows,comparable,elapsed,periodDays:current.days,current:isCurrent?row:undefined,daysLeft:daysBetween(asOf,current.end),daily:row&&isCurrent?Math.floor(Math.max(0,row.remaining)/Math.max(1,daysBetween(asOf,current.end))):null,unreviewed:w.transactions.filter(t=>included.has(t.account)&&t.date>=current.start&&t.date<current.end&&t.movement==='review').length};
}
export function budgetSuggestions(w:Workspace,asOf:string){
 const p=w.planning??emptyPlanning(),months=w.coverage.filter(c=>c.month<asOf.slice(0,7)&&!w.transactions.some(t=>t.date.startsWith(c.month)&&t.movement==='review')).map(c=>c.month).sort().slice(-3);
 if(months.length<3)return {reason:'Confirm three complete reviewed past months before generating suggestions.',suggestions:[]};
 const included=new Set(w.ledger?.accounts.filter(a=>a.included).map(a=>a.name)??w.transactions.map(t=>t.account));
 const parts=spendingParts(w.transactions,w.ledger).filter(t=>included.has(t.account)&&months.includes(t.date.slice(0,7)));
 const periods=p.period.cadence==='monthly'?1:p.period.cadence==='weekly'?12/52:p.period.cadence==='fortnightly'?12/26:p.period.cadence==='four-weekly'?12/13:12;
 return {reason:'Based on '+months.join(', ')+'. Coverage is your attestation. Review before accepting.',suggestions:[...new Set(parts.map(t=>t.category))].filter(c=>c!=='Uncategorised').map(category=>({category,amount:Math.max(0,Math.round(parts.filter(t=>t.category===category).reduce((n,t)=>money(n+t.amount),0)/3*periods))}))};
}
export function closeBudgetPeriods(w:Workspace,asOf:string){const p=w.planning??emptyPlanning(),stamp=new Date().toISOString();const closes=p.budgets.flatMap(b=>budgetLedger(w,b,asOf).rows.filter(r=>r.closed&&(!p.closes.some(c=>c.budgetId===b.id&&c.start===r.start&&c.end===r.end)||p.closes.filter(c=>c.budgetId===b.id&&c.start===r.start&&c.end===r.end).at(-1)!.remaining!==r.remaining)).map(r=>({id:b.id+':'+r.start+':'+stamp,budgetId:b.id,start:r.start,end:r.end,spent:r.spent,carryIn:r.carryIn,remaining:r.remaining,at:stamp})));return {...w,planning:{...p,closes:[...p.closes,...closes]}};}
export function changePeriod(w:Workspace,rule:PeriodRule){const p=w.planning??emptyPlanning();return {...w,planning:{...p,budgets:p.budgets.map(b=>({...b,period:b.period??p.period})),period:rule}};}
