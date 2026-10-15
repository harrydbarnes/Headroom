import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {stampDuty,houseMove,saleEquity,transactionCosts} from '../src/lib/calculators/houseMove';
import {monthlyPayment,amortisation,stressTest} from '../src/lib/calculators/mortgage';
import {budget,savingsProjection,debtProjection,annualAllowances} from '../src/lib/calculators/budget';
import {pence as p,percent} from '../src/lib/calculators/money';
const source=readFileSync('legacy/app.js','utf8');
const old=vm.runInNewContext(source.match(/function repayment[^\n]+/)![0]+'\n'+source.match(/function sdlt[^\n]+/)![0]+'\n({repayment,sdlt})');
export const fees={legalNet:p(3000),legalVat:0,arrangement:p(1000),valuation:0,booking:0,survey:p(800),surveyTier:'custom' as const,landRegistry:0,searches:0,epc:0,removals:p(1000),storage:0,works:0};
export const sale={selling:true,price:p(375000),redemption:p(234835.58),erc:0,agentPercent:1,agentVat:20,listing:p(360),aml:p(30)};
export const input={purchase:p(590000),buyer:'standard' as const,period:'current' as const,nonResident:false,sale,fees,savings:p(19500),extraSavings:0,reserve:p(18000),loanMode:'required' as const,fixedLoan:p(480000),annualRate:4.83,years:30,interestOnly:false,ltvCeiling:80,borrowingLimit:p(480000),exchangePercent:10,upfront:p(800)};
describe('existing site parity',()=>{
 it.each([0,125000,125000.01,250000,250000.01,300000,590000,925000,1500000,20000000])('SDLT £%s',price=>expect(stampDuty({price:p(price),buyer:'standard'})).toBe(p(old.sdlt(price))));
 it.each([[480000,4.83,30],[0,0,30],[100000,0,10],[600000,8,50]])('repayment %s', (loan,rate,years)=>expect(monthlyPayment({principal:p(loan),annualRate:rate,years})).toBe(p(old.repayment(loan,rate,years))));
 it('retains the required-loan buffer formula and every legacy fee',()=>{const s=375000,price=590000,redemption=234835.58,fee=s*.012+390+old.sdlt(price)+3000+800+1000+1000;const loan=Math.max(0,price+fee+18000-(s-redemption)-19500);const r=houseMove(input);expect(r.loan).toBe(p(loan));expect(r.cashAfterCompletion).toBe(p(18000));expect(r.payment).toBe(p(old.repayment(loan,4.83,30)));expect(r.sale.commission).toBe(p(4500));});
});
describe('tax rules and boundaries',()=>{
 it.each([[0,0],[125000,0],[250000,2500],[925000,36250],[1500000,93750],[2000000,153750]])('standard £%s', (price,tax)=>expect(stampDuty({price:p(price),buyer:'standard'})).toBe(p(tax)));
 it.each([[300000,0],[300001,.05],[500000,10000],[500001,15000.05]])('first-time £%s',(price,tax)=>expect(stampDuty({price:p(price),buyer:'firstTime'})).toBe(p(tax)));
 it('higher rates, £40k exemption and non-resident addition',()=>{expect(stampDuty({price:p(300000),buyer:'additional'})).toBe(p(20000));expect(stampDuty({price:p(39999),buyer:'additional'})).toBe(0);expect(stampDuty({price:p(40000),buyer:'additional'})).toBe(p(2000));expect(stampDuty({price:p(300000),buyer:'additional',nonResident:true})).toBe(p(26000));});
 it('historic +3/+5 regimes use historic thresholds',()=>{expect(stampDuty({price:p(300000),buyer:'additional',period:'2022-09-23'})).toBe(p(11500));expect(stampDuty({price:p(300000),buyer:'additional',period:'2024-10-31'})).toBe(p(17500));});
 it('rejects invalid amounts',()=>{expect(()=>stampDuty({price:-1,buyer:'standard'})).toThrow();expect(()=>stampDuty({price:NaN,buyer:'standard'})).toThrow();});
});
describe('sale, fees and cash flow',()=>{
 it('preserves negative equity and ERCs',()=>{expect(saleEquity({...sale,price:p(200000),erc:p(5000)}).netEquity).toBe(p(-42625.58));expect(saleEquity({...sale,selling:false}).netEquity).toBe(0);});
 it('legal VAT is applied once',()=>expect(transactionCosts({...fees,legalNet:p(2500),legalVat:20}).total).toBe(p(5800)));
 it('fixed borrowing exposes a real shortfall',()=>{const r=houseMove({...input,loanMode:'fixed',fixedLoan:0});expect(r.cashAfterCompletion).toBeLessThan(0);expect(r.warnings).toContain('Cash shortfall at completion');});
 it('zero purchase has defined LTV and extra savings reduce borrowing',()=>{expect(houseMove({...input,purchase:0}).ltv).toBe(null);expect(houseMove({...input,extraSavings:p(1000)}).loan).toBe(houseMove(input).loan-p(1000));});
 it('exchange deposit is a timing check, never a second purchase charge',()=>expect(houseMove({...input,exchangePercent:20}).cashAfterCompletion).toBe(houseMove(input).cashAfterCompletion));
 it('balances the per-person budget exactly to the penny',()=>{const r=budget({harry:p(3195),cam:p(2691.06),sharedIncome:p(47),fixed:[{id:'a',name:'bill',amount:p(300),owner:'joint'}],variable:[{id:'b',name:'commute',amount:p(98.58),owner:'harry'}],mortgage:p(2500),extra:0,reserves:p(150)});expect(r.harryTransfer+r.camTransfer).toBe(p(2903));expect(r.harryLeft+r.camLeft).toBe(r.remaining);});
 it('reports unfunded joint costs with zero salaries',()=>expect(budget({harry:0,cam:0,sharedIncome:0,fixed:[],variable:[],mortgage:p(100),extra:0,reserves:0}).unfunded).toBe(p(100)));
});
describe('amortisation, savings and debt',()=>{
 it('principal and interest reconcile throughout the schedule',()=>{const rows=amortisation({principal:p(480000),annualRate:4.83,years:30});expect(rows.length).toBe(360);expect(rows.at(-1)!.balance).toBe(0);expect(rows.reduce((s,r)=>s+r.principal,0)).toBe(p(480000));for(const row of rows)expect(row.payment).toBe(row.interest+row.principal);});
 it('interest-only retains principal until the balloon',()=>{const rows=amortisation({principal:p(100000),annualRate:6,years:10,interestOnly:true});expect(rows[0].payment).toBe(p(500));expect(rows[0].balance).toBe(p(100000));expect(rows.at(-1)!.payment).toBe(p(100500));});
 it('zero-rate debt and mortgage repay exactly',()=>{expect(monthlyPayment({principal:p(1200),annualRate:0,years:1})).toBe(p(100));expect(debtProjection(p(1000),0,p(100)).rows.length).toBe(10);expect(debtProjection(p(1000),12,p(5)).paidOff).toBe(false);});
 it('includes three increasing rate shocks',()=>{const r=stressTest({principal:p(100000),annualRate:5,years:25});expect(r.map(x=>x.shock)).toEqual([1,2,3]);expect(r[2].payment).toBeGreaterThan(r[1].payment);});
 it('projects end-of-month deposits, allowances and decimal rounding',()=>{expect(savingsProjection({opening:p(1000),monthly:p(100),annualRate:12,months:1})[0].balance).toBe(p(1110));expect(annualAllowances([{annual:p(1200),mode:'additional'},{annual:null,mode:'within'}])).toEqual({additional:p(100),within:0,unset:1});expect(p('1.005')).toBe(101);expect(percent(101,20)).toBe(20);});
 it('rejects invalid terms and percentages',()=>{expect(()=>monthlyPayment({principal:100,annualRate:-1,years:30})).toThrow();expect(()=>monthlyPayment({principal:100,annualRate:1,years:0})).toThrow();});
});
