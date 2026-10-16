import {nonnegative,percent,type Pence} from './calculators/money';
export type Movement='purchase'|'income'|'transfer'|'repayment'|'refund'|'review';
export type Transaction={id:string;account:string;date:string;merchant:string;amount:Pence;movement:Movement;category:string};
export type Debt={id:string;name:string;balance:Pence;apr:number;minimum?:Pence};
export type Goal={id:string;name:string;target:Pence;saved:Pence;months:number;dueMonth?:string;priority?:number;funding?:boolean};
export type Plan={income:Pence;essentials:Pence;flexible:Pence;annualReserve:Pence;annualTotal?:Pence;cash:Pence;debt:Pence;debtApr:number;emergencyMonths:number;goal:Pence;goalSaved:Pence;goalMonths:number;horizonYears:number;investmentPercent:number;coverageConfirmed:boolean;monthsReviewed:number;debts?:Debt[];goals?:Goal[]};
export const emptyPlan:Plan={income:0,essentials:0,flexible:0,annualReserve:0,cash:0,debt:0,debtApr:0,emergencyMonths:3,goal:0,goalSaved:0,goalMonths:12,horizonYears:5,investmentPercent:25,coverageConfirmed:false,monthsReviewed:0};
export const demoPlan:Plan={...emptyPlan,income:590000,essentials:320000,flexible:110000,annualReserve:20000,cash:900000,debt:50000,debtApr:24,goal:1800000,goalSaved:500000,goalMonths:18,coverageConfirmed:true,monthsReviewed:3};
export function goalMonths(g:Goal,asOf=new Date()){
 if(!g.dueMonth)return g.months;
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(g.dueMonth))throw Error('Use a valid goal target month.');
 const [year,month]=g.dueMonth.split('-').map(Number);
 return Math.max(1,(year-asOf.getFullYear())*12+month-asOf.getMonth()-1);
}
export function assess(p:Plan,asOf=new Date()){
 for(const k of ['income','essentials','flexible','annualReserve','cash','debt','goal','goalSaved'] as const)nonnegative(p[k]);
 if(![p.debtApr,p.emergencyMonths,p.goalMonths,p.horizonYears,p.investmentPercent,p.monthsReviewed].every(Number.isFinite)||p.goalMonths<1||p.emergencyMonths<1||p.investmentPercent<0||p.investmentPercent>100)throw Error('Invalid planning assumptions');
 const debts=p.debts??[{id:'legacy',name:'Debt',balance:p.debt,apr:p.debtApr}];
 const goals=p.goals??[{id:'legacy',name:'Goal',target:p.goal,saved:p.goalSaved,months:p.goalMonths}];
 debts.forEach(d=>{nonnegative(d.balance);if(!Number.isFinite(d.apr)||d.apr<0||d.apr>100)throw Error('Invalid debt APR');});
 goals.forEach(g=>{nonnegative(g.target);nonnegative(g.saved);if(!Number.isInteger(g.months)||g.months<1)throw Error('Invalid goal deadline');});
 const debt=debts.reduce((n,d)=>n+d.balance,0),expensiveBalance=debts.filter(d=>d.apr>=8).reduce((n,d)=>n+d.balance,0);
 nonnegative(debt);
 const committed=p.essentials+p.flexible+p.annualReserve,surplus=p.income-committed;
 const emergencyTarget=Math.round(p.essentials*p.emergencyMonths),emergencyGap=Math.max(0,emergencyTarget-p.cash);
 const needs=goals.map(g=>({...g,required:g.funding===false?0:Math.ceil(Math.max(0,g.target-g.saved)/goalMonths(g,asOf))})).sort((a,b)=>(a.priority??50)-(b.priority??50)||a.id.localeCompare(b.id));
 const goalRequired=needs.reduce((n,g)=>n+g.required,0);
 nonnegative(goalRequired);nonnegative(committed);nonnegative(emergencyTarget);
 let remaining=Math.max(0,surplus);
 // Cash allocation only: retirement contributions already included in take-home pay are unaffected.
 const expensiveDebt=expensiveBalance>0;
 const debtPayment=Math.min(remaining,expensiveBalance); remaining-=debtPayment;
 const emergency=Math.min(remaining,emergencyGap);remaining-=emergency;
 const goalSaving=Math.min(remaining,goalRequired);remaining-=goalSaving;
 const investment=(p.horizonYears>=5&&debt===0&&emergencyGap===0&&goalSaving>=goalRequired)?percent(remaining,p.investmentPercent):0;
 const unallocated=remaining-investment;
 let debtPool=debtPayment,goalPool=goalSaving;
 const debtAllocations=[...debts].sort((a,b)=>b.apr-a.apr||a.id.localeCompare(b.id)).map(d=>{const extra=d.apr>=8?Math.min(debtPool,d.balance):0;debtPool-=extra;return {...d,extra};});
 const goalAllocations=needs.map(g=>{const allocated=Math.min(goalPool,g.required);goalPool-=allocated;return {...g,allocated,shortfall:g.required-allocated};});
 const coverage=p.coverageConfirmed&&p.monthsReviewed>=3;
 const savingsRate=p.income>0?surplus/p.income:0,runway=p.essentials>0?p.cash/p.essentials:0;
 const cashPoints=Math.min(35,35*runway/p.emergencyMonths),marginPoints=Math.max(0,Math.min(35,35*savingsRate/.2));
 const debtPoints=debt===0?30:expensiveDebt?0:15;
 const score=coverage&&p.income>0?Math.round(cashPoints+marginPoints+debtPoints):null;
 const comfort=surplus<0?'Over budget':surplus<percent(p.income,10)?'Tight':surplus<percent(p.income,20)?'Manageable':'Comfortable';
 return {debtAllocations,goalAllocations,surplus,committed,debt,emergencyTarget,emergencyGap,goalRequired,debtPayment,emergency,goalSaving,goalShortfall:Math.max(0,goalRequired-goalSaving),investment,unallocated,runway,score,comfort,coverage,components:{cash:Math.round(cashPoints),margin:Math.round(marginPoints),debt:debtPoints}};
}
export function mergeTransactions(existing:Transaction[],incoming:Transaction[]){const rows=new Map(existing.map(t=>[t.id,t]));for(const t of incoming){const prior=rows.get(t.id);rows.set(t.id,prior?{...t,movement:prior.movement,category:prior.category}:t);}return [...rows.values()].sort((a,b)=>b.date.localeCompare(a.date));}
export function monthTotals(rows:Transaction[],month:string){const r=rows.filter(t=>t.date.startsWith(month));return {spending:r.filter(t=>t.movement==='purchase'||t.movement==='refund').reduce((s,t)=>s+t.amount,0),income:0-r.filter(t=>t.movement==='income').reduce((s,t)=>s+t.amount,0),unreviewed:r.filter(t=>t.movement==='review').length};}
export function fromProvider(r:any):Transaction|null{if(typeof r.providerId!=='string'||typeof r.accountHash!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||r.currency!=='GBP'||!Number.isFinite(r.amount))return null;const amount=Math.round(r.amount*100);if(!Number.isSafeInteger(amount))return null;return {id:JSON.stringify([r.accountHash,r.providerId]),account:String(r.account),date:r.date,merchant:String(r.merchant),amount,movement:'review',category:'Uncategorised'};}
