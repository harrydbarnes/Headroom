import {D,nonnegative,rate,rounded,total,type Pence} from './money';
export interface MortgageInput {principal:Pence;annualRate:number;years:number;interestOnly?:boolean;}
export interface Payment {month:number;payment:Pence;interest:Pence;principal:Pence;balance:Pence;}
export function monthlyPayment(i:MortgageInput):Pence {
 nonnegative(i.principal);rate(i.annualRate);if(!Number.isInteger(i.years)||i.years<1||i.years>50)throw new RangeError('Term must be 1 to 50 whole years');
 const r=new D(i.annualRate).div(1200),n=i.years*12;
 return rounded(i.interestOnly?new D(i.principal).mul(r):r.isZero()?new D(i.principal).div(n):new D(i.principal).mul(r).div(new D(1).minus(r.plus(1).pow(-n))));
}
export function amortisation(i:MortgageInput):Payment[]{
 const payment=monthlyPayment(i),rows:Payment[]=[];let balance=i.principal;
 for(let month=1;month<=i.years*12&&balance>0;month++){
  const interest=rounded(new D(balance).mul(i.annualRate).div(1200));
  const paid=i.interestOnly?(month===i.years*12?balance+interest:interest):month===i.years*12?balance+interest:Math.min(balance+interest,payment);
  const principal=paid-interest;balance-=principal;rows.push({month,payment:paid,interest,principal,balance});
 }return rows;
}
export function stressTest(i:MortgageInput){const base=monthlyPayment(i);return [1,2,3].map(shock=>({shock,rate:i.annualRate+shock,payment:monthlyPayment({...i,annualRate:i.annualRate+shock}),increase:monthlyPayment({...i,annualRate:i.annualRate+shock})-base}));}
export function mortgageTotals(i:MortgageInput){const schedule=amortisation(i);return {schedule,interest:total(schedule.map(r=>r.interest)),paid:total(schedule.map(r=>r.payment))};}
