import {describe,it,expect} from 'vitest';
import {assess,emptyPlan,demoPlan,mergeTransactions,monthTotals,fromProvider,type Transaction} from '../src/lib/finance';
import {normalise} from '../server/banking';
describe('monthly allocations and score',()=>{
 it('does not score an empty or incomplete plan',()=>{expect(assess(emptyPlan).score).toBeNull();expect(assess({...demoPlan,monthsReviewed:2}).score).toBeNull();expect(assess({...demoPlan,coverageConfirmed:false}).score).toBeNull();});
 it('keeps all allocations within surplus at every tested income',()=>{for(let income=0;income<1200000;income+=3173){const r=assess({...demoPlan,income});expect(r.debtPayment+r.emergency+r.goalSaving+r.investment+r.unallocated).toBe(Math.max(0,r.surplus));if(r.score!==null){expect(r.score).toBeGreaterThanOrEqual(0);expect(r.score).toBeLessThanOrEqual(100);}}});
 it('prioritises expensive debt and emergency cash before goals',()=>{const r=assess({...demoPlan,cash:0});expect(r.debtPayment).toBe(50000);expect(r.emergency).toBe(90000);expect(r.goalSaving).toBe(0);expect(r.investment).toBe(0);});
 it('does not allocate to investments while a short-term goal is underfunded',()=>expect(assess({...demoPlan,debt:0,cash:3000000,goal:9000000,goalMonths:1}).investment).toBe(0));
 it('keeps investment suggestion at zero for short horizons',()=>expect(assess({...demoPlan,debt:0,cash:3000000,goal:0,horizonYears:4}).investment).toBe(0));
 it('does not reuse goal savings as emergency cash',()=>expect(assess({...demoPlan,goalSaved:9000000,cash:0}).emergencyGap).toBe(960000));
 it('no allocation when the budget is negative',()=>{const r=assess({...demoPlan,income:10000});expect(r.comfort).toBe('Over budget');expect(r.investment+r.emergency+r.goalSaving+r.debtPayment).toBe(0);});
 it('allocates only the selected fraction of eligible remaining surplus',()=>{const r=assess({...demoPlan,debt:0,cash:960000,goal:0,investmentPercent:25});expect(r.investment).toBe(35000);expect(r.unallocated).toBe(105000);});
 it('rejects malformed planning amounts',()=>expect(()=>assess({...demoPlan,cash:NaN})).toThrow());
});
const t:Transaction={id:'one',account:'card',date:'2026-10-10',merchant:'ALDI',amount:5000,movement:'purchase',category:'Groceries'};
describe('import accounting',()=>{
 it('repeated imports are idempotent and preserve human review',()=>{const rows=mergeTransactions([t],[{...t,amount:6000,movement:'review',category:'Uncategorised'}]);expect(rows).toHaveLength(1);expect(rows[0]).toMatchObject({amount:6000,movement:'purchase',category:'Groceries'});});
 it('excludes repayments and transfers and nets refunds',()=>{const r=monthTotals([t,{...t,id:'two',movement:'repayment',amount:5000},{...t,id:'three',movement:'transfer',amount:90000},{...t,id:'four',movement:'refund',amount:-1000}], '2026-10');expect(r.spending).toBe(4000);});
 it('keeps unreviewed credits out of income',()=>expect(monthTotals([{...t,movement:'review',amount:-10000}],'2026-10')).toMatchObject({income:0,unreviewed:1}));
 it('uses account and provider reference together as identity',()=>{const a=fromProvider({providerId:'1',accountHash:'a',date:'2026-10-10',currency:'GBP',amount:12.25,merchant:'x',account:'a'})!;const b=fromProvider({providerId:'1',accountHash:'b',date:'2026-10-10',currency:'GBP',amount:12.25,merchant:'x',account:'b'})!;expect(a.id).not.toBe(b.id);expect(a.amount).toBe(1225);expect(a.movement).toBe('review');});
 it('normalises provider debit and credit signs',()=>{const p={booking_date:'2026-10-10',transaction_amount:{amount:'12.25',currency:'GBP'},transaction_id:'t'};expect(normalise({...p,credit_debit_indicator:'DBIT'},{uid:'a'},'Bank')?.amount).toBe(12.25);expect(normalise({...p,credit_debit_indicator:'CRDT'},{uid:'a'},'Bank')?.amount).toBe(-12.25);});
 it('skips unsupported currency and unstable provider identities',()=>{expect(fromProvider({currency:'EUR'})).toBeNull();expect(normalise({booking_date:'2026-10-10',transaction_amount:{amount:'1',currency:'GBP'},credit_debit_indicator:'DBIT'},{uid:'a'},'Bank')).toBeNull();});
});
