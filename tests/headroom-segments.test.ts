import {expect, it} from 'vitest';
import {emptyPlan} from '../src/lib/finance';
import {headroomSegments} from '../src/lib/headroomSegments';

it('splits minimums from essentials without changing headroom or counting them twice', () => {
  const model = headroomSegments({...emptyPlan, income: 100000, essentials: 40000,
    flexible: 20000, annualReserve: 10000, debts: [{id: 'a', name: 'Loan', balance: 100000, apr: 5, minimum: 5000}]});
  expect(model.segments.map(s => s.amount)).toEqual([35000, 20000, 10000, 5000, 30000]);
  expect(model.segments.reduce((sum, s) => sum + s.share, 0)).toBeCloseTo(1);
});
it('flags overspending with non-negative shares and no positive headroom', () => {
  const model = headroomSegments({...emptyPlan, income: 10000, essentials: 15000});
  expect(model.overspent).toBe(true);
  expect(model.segments.at(-1)?.amount).toBe(0);
  expect(model.segments.reduce((sum, s) => sum + s.share, 0)).toBeCloseTo(1);
});
it('keeps zero income empty and omits zero debt minimums', () => {
  const model = headroomSegments(emptyPlan);
  expect(model.empty).toBe(true);
  expect(model.segments.every(s => s.share === 0)).toBe(true);
  expect(model.segments.some(s => s.id === 'minimums')).toBe(false);
});
it('does not invent extra spending when minimums exceed essentials', () => {
  const model = headroomSegments({...emptyPlan, income: 10000, essentials: 1000,
    debts: [{id: 'a', name: 'Loan', balance: 10000, apr: 5, minimum: 2000}]});
  expect(model.minimumsIncluded).toBe(true);
  expect(model.segments[0].amount).toBe(1000);
  expect(model.segments.at(-1)?.amount).toBe(9000);
});
