import {D,checked,nonnegative,rounded,total,type Pence} from './money';
export type Owner='harry'|'cam'|'joint';
export interface BudgetItem {id:string;name:string;amount:Pence;owner:Owner;}
export interface BudgetInput {harry:Pence;cam:Pence;sharedIncome:Pence;fixed:BudgetItem[];variable:BudgetItem[];mortgage:Pence;extra:Pence;reserves:Pence;}
export function budget(i:BudgetInput){
 [i.harry,i.cam,i.sharedIncome,i.mortgage,i.extra,i.reserves,...i.fixed.map(x=>x.amount),...i.variable.map(x=>x.amount)].forEach(nonnegative);
 const owned=(owner:Owner)=>total([...i.fixed,...i.variable].filter(x=>x.owner===owner).map(x=>x.amount));
 const joint=total([owned('joint'),i.mortgage,i.extra,i.reserves]),fund=Math.max(0,joint-i.sharedIncome),salaries=i.harry+i.cam;
 const harryTransfer=salaries?rounded(new D(fund).mul(i.harry).div(salaries)):0,camTransfer=salaries?fund-harryTransfer:0;
 const totalIncome=total([i.harry,i.cam,i.sharedIncome]),outgoings=total([owned('harry'),owned('cam'),joint]);
 return {income:totalIncome,outgoings,beforeReserves:totalIncome-outgoings+i.reserves,remaining:totalIncome-outgoings,joint,harryTransfer,camTransfer,harryLeft:i.harry-owned('harry')-harryTransfer,camLeft:i.cam-owned('cam')-camTransfer,unfunded:salaries?0:fund};
}
export interface SavingsInput{opening:Pence;monthly:Pence;annualRate:number;months:number;}
export function savingsProjection(i:SavingsInput){checked(i.opening);checked(i.monthly);if(!Number.isFinite(i.annualRate)||i.annualRate<=-100||i.annualRate>100||!Number.isInteger(i.months)||i.months<0||i.months>1200)throw new RangeError('Invalid projection');let balance=i.opening;return Array.from({length:i.months},(_,j)=>{const interest=rounded(new D(balance).mul(i.annualRate).div(1200));balance=checked(balance+interest+i.monthly);return {month:j+1,interest,balance};});}
export function debtProjection(balance:Pence,annualRate:number,payment:Pence,maxMonths=600){nonnegative(balance);nonnegative(payment);if(!Number.isFinite(annualRate)||annualRate<0||annualRate>100||!Number.isInteger(maxMonths)||maxMonths<1||maxMonths>1200)throw new RangeError('Invalid debt projection');const rows=[];for(let month=1;month<=maxMonths&&balance>0;month++){const interest=rounded(new D(balance).mul(annualRate).div(1200));if(payment<=interest)return {rows,paidOff:false,reason:'Payment does not reduce the debt'};const paid=Math.min(payment,balance+interest);balance=balance+interest-paid;rows.push({month,payment:paid,interest,balance});}return {rows,paidOff:balance===0,reason:balance?'Projection horizon reached':null};}
export function annualAllowances(items:{annual:Pence|null;mode:'additional'|'within'}[]){return {additional:rounded(items.filter(x=>x.mode==='additional'&&x.annual!==null).reduce((s,x)=>s.plus(x.annual!),new D(0)).div(12)),within:rounded(items.filter(x=>x.mode==='within'&&x.annual!==null).reduce((s,x)=>s.plus(x.annual!),new D(0)).div(12)),unset:items.filter(x=>x.annual===null).length};}
