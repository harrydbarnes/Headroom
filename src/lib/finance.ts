import {nonnegative,percent,type Pence} from './calculators/money';
export type Movement='purchase'|'income'|'transfer'|'repayment'|'refund'|'review';
export type Transaction={id:string;account:string;date:string;merchant:string;amount:Pence;movement:Movement;category:string};
export type Plan={income:Pence;essentials:Pence;flexible:Pence;annualReserve:Pence;cash:Pence;debt:Pence;debtApr:number;emergencyMonths:number;goal:Pence;goalSaved:Pence;goalMonths:number;horizonYears:number;investmentPercent:number;coverageConfirmed:boolean;monthsReviewed:number};
export const emptyPlan:Plan={income:0,essentials:0,flexible:0,annualReserve:0,cash:0,debt:0,debtApr:0,emergencyMonths:3,goal:0,goalSaved:0,goalMonths:12,horizonYears:5,investmentPercent:25,coverageConfirmed:false,monthsReviewed:0};
export const demoPlan:Plan={...emptyPlan,income:590000,essentials:320000,flexible:110000,annualReserve:20000,cash:900000,debt:50000,debtApr:24,goal:1800000,goalSaved:500000,goalMonths:18,coverageConfirmed:true,monthsReviewed:3};
export function assess(p:Plan){
 for(const k of ['income','essentials','flexible','annualReserve','cash','debt','goal','goalSaved'] as const)nonnegative(p[k]);
 if(![p.debtApr,p.emergencyMonths,p.goalMonths,p.horizonYears,p.investmentPercent,p.monthsReviewed].every(Number.isFinite)||p.goalMonths<1||p.emergencyMonths<1||p.investmentPercent<0||p.investmentPercent>100)throw Error('Invalid planning assumptions');
 const committed=p.essentials+p.flexible+p.annualReserve,surplus=p.income-committed;
 const emergencyTarget=Math.round(p.essentials*p.emergencyMonths),emergencyGap=Math.max(0,emergencyTarget-p.cash);
 const goalRequired=Math.ceil(Math.max(0,p.goal-p.goalSaved)/p.goalMonths);
 let remaining=Math.max(0,surplus);
 // Cash allocation only: retirement contributions already included in take-home pay are unaffected.
 const expensiveDebt=p.debtApr>=8;
 const debtPayment=expensiveDebt?Math.min(remaining,p.debt):0; remaining-=debtPayment;
 const emergency=Math.min(remaining,emergencyGap);remaining-=emergency;
 const goalSaving=Math.min(remaining,goalRequired);remaining-=goalSaving;
 const investment=(p.horizonYears>=5&&p.debt===0&&emergencyGap===0&&goalSaving>=goalRequired)?percent(remaining,p.investmentPercent):0;
 const unallocated=remaining-investment;
 const coverage=p.coverageConfirmed&&p.monthsReviewed>=3;
 const savingsRate=p.income>0?surplus/p.income:0,runway=p.essentials>0?p.cash/p.essentials:0;
 const cashPoints=Math.min(35,35*runway/p.emergencyMonths),marginPoints=Math.max(0,Math.min(35,35*savingsRate/.2));
 const debtPoints=p.debt===0?30:expensiveDebt?0:15;
 const score=coverage&&p.income>0?Math.round(cashPoints+marginPoints+debtPoints):null;
 const comfort=surplus<0?'Over budget':surplus<percent(p.income,10)?'Tight':surplus<percent(p.income,20)?'Manageable':'Comfortable';
 return {surplus,committed,emergencyTarget,emergencyGap,goalRequired,debtPayment,emergency,goalSaving,goalShortfall:Math.max(0,goalRequired-goalSaving),investment,unallocated,runway,score,comfort,coverage,components:{cash:Math.round(cashPoints),margin:Math.round(marginPoints),debt:debtPoints}};
}
export function mergeTransactions(existing:Transaction[],incoming:Transaction[]){const rows=new Map(existing.map(t=>[t.id,t]));for(const t of incoming){const prior=rows.get(t.id);rows.set(t.id,prior?{...t,movement:prior.movement,category:prior.category}:t);}return [...rows.values()].sort((a,b)=>b.date.localeCompare(a.date));}
export function monthTotals(rows:Transaction[],month:string){const r=rows.filter(t=>t.date.startsWith(month));return {spending:r.filter(t=>t.movement==='purchase'||t.movement==='refund').reduce((s,t)=>s+t.amount,0),income:0-r.filter(t=>t.movement==='income').reduce((s,t)=>s+t.amount,0),unreviewed:r.filter(t=>t.movement==='review').length};}
export function fromProvider(r:any):Transaction|null{if(typeof r.providerId!=='string'||typeof r.accountHash!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||r.currency!=='GBP'||!Number.isFinite(r.amount))return null;const amount=Math.round(r.amount*100);if(!Number.isSafeInteger(amount))return null;return {id:JSON.stringify([r.accountHash,r.providerId]),account:String(r.account),date:r.date,merchant:String(r.merchant),amount,movement:'review',category:'Uncategorised'};}
