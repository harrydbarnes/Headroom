import { describe, expect, it } from 'vitest';
import { headroomAt, nextPayday, quickTargetDates } from '../src/lib/headroomAt';
import { emptyLedger } from '../src/lib/ledger';
import { emptyPlanning } from '../src/lib/planning';
import { freshWorkspace } from '../src/lib/workspace';

describe('headroomAt unified point-in-time engine', () => {
  it('falls back seamlessly to monthly plan when no balance snapshots exist', () => {
    const w = freshWorkspace();
    w.plan.income = 400000; // £4,000
    w.plan.essentials = 200000; // £2,000
    w.plan.flexible = 80000; // £800
    w.plan.annualReserve = 20000; // £200 -> £1,000 surplus
    w.plan.allocationMode = 'custom';
    w.plan.customSplit = { save: 40, invest: 20, spend: 40 };

    const res = headroomAt(w, '2026-11-22', '2026-11-22');
    expect(res.mode).toBe('planned');
    expect(res.availableTotal).toBe(100000);
    expect(res.canSave).toBe(40000);
    expect(res.canInvest).toBe(20000);
    expect(res.safeToSpend).toBe(40000);
    expect(res.canSave + res.canInvest + res.safeToSpend).toBe(res.availableTotal);
    expect(res.fallbackReason).toBeTruthy();
  });

  it('conserves exact integer pence on awkward custom splits', () => {
    const w = freshWorkspace();
    w.plan.income = 100001; // £1,000.01 surplus
    w.plan.allocationMode = 'custom';
    w.plan.customSplit = { save: 33, invest: 33, spend: 34 };

    const res = headroomAt(w, '2026-11-22', '2026-11-22');
    expect(res.canSave + res.canInvest + res.safeToSpend).toBe(100001);
  });

  it('blends live account balances and upcoming confirmed bills and tracks lowest cash floor', () => {
    const w = freshWorkspace();
    w.plan.income = 400000;
    w.plan.essentials = 200000;
    w.plan.allocationMode = 'custom';
    w.plan.customSplit = { save: 50, invest: 25, spend: 25 };
    const ledger = emptyLedger();
    ledger.accounts.push({
      id: 'acc-current',
      name: 'Current',
      kind: 'current',
      currency: 'GBP',
      group: 'personal',
      institution: 'Bank',
      included: true,
      archived: false,
    });
    ledger.balances.push({
      id: 'bal-1',
      accountId: 'acc-current',
      current: 250000, // £2,500
      asOf: '2026-11-22T09:00:00Z',
      source: 'manual',
    });
    w.ledger = ledger;

    const planning = emptyPlanning();
    planning.commitments.push({
      id: 'rent',
      merchant: 'Landlord',
      account: 'Current',
      amount: 120000, // £1,200 due in 3 days
      direction: 'out',
      rule: { cadence: 'monthly', anchor: '2026-11-25', weekend: 'none' },
      variable: false,
      confirmed: true,
      cancellation: '',
      priceHistory: [],
      settlements: [],
    });
    planning.commitments.push({
      id: 'salary',
      merchant: 'Employer',
      account: 'Current',
      amount: 300000, // £3,000 due in 6 days
      direction: 'in',
      rule: { cadence: 'monthly', anchor: '2026-11-28', weekend: 'none' },
      variable: false,
      confirmed: true,
      cancellation: '',
      priceHistory: [],
      settlements: [],
    });
    w.planning = planning;

    // On 2026-11-30, balance after salary is £4,300, but lowest cash before then (on Nov 25) is £1,300!
    const res = headroomAt(w, '2026-11-30', '2026-11-22');
    expect(res.mode).toBe('live');
    expect(res.lowestCashBeforeTarget).toBe(130000);
    expect(res.upcomingBillsTotal).toBe(120000);
    // Available total is capped by the lowest cash floor so the user won't miss rent.
    expect(res.availableTotal).toBe(130000);
    expect(res.canSave + res.canInvest + res.safeToSpend).toBe(130000);
  });

  it('reconstructs a historical point in time using snapshots at or before the past date', () => {
    const w = freshWorkspace();
    const ledger = emptyLedger();
    ledger.accounts.push({
      id: 'acc-1',
      name: 'Current',
      kind: 'current',
      currency: 'GBP',
      group: 'personal',
      institution: 'Bank',
      included: true,
      archived: false,
    });
    ledger.balances.push(
      {
        id: 'bal-oct',
        accountId: 'acc-1',
        current: 150000,
        asOf: '2026-10-01T09:00:00Z',
        source: 'manual',
      },
      {
        id: 'bal-nov',
        accountId: 'acc-1',
        current: 220000,
        asOf: '2026-11-20T09:00:00Z',
        source: 'manual',
      },
    );
    w.ledger = ledger;

    const past = headroomAt(w, '2026-10-15', '2026-11-22');
    expect(past.mode).toBe('live');
    expect(past.availableTotal).toBe(150000);
    expect(past.daysUntilTarget).toBeLessThan(0);
  });

  it('applies what-if one-off spend without mutating workspace', () => {
    const w = freshWorkspace();
    w.plan.income = 300000;
    w.plan.essentials = 150000;
    w.plan.allocationMode = 'custom';
    w.plan.customSplit = { save: 50, invest: 0, spend: 50 };

    const base = headroomAt(w, '2026-11-30', '2026-11-22');
    const sim = headroomAt(w, '2026-11-30', '2026-11-22', {
      oneOffSpend: 40000,
      oneOffDate: '2026-11-25',
    });
    expect(base.availableTotal - sim.availableTotal).toBe(40000);
  });

  it('computes next payday and quick target dates accurately', () => {
    expect(nextPayday('2026-11-22', 25)).toBe('2026-11-25');
    expect(nextPayday('2026-11-25', 25)).toBe('2026-12-25');
    expect(nextPayday('2026-01-31', 31)).toBe('2026-02-28');
    const chips = quickTargetDates('2026-11-22', 25);
    expect(chips.map((c) => c.id)).toEqual([
      'today',
      'payday',
      'monthEnd',
      'threeMonths',
      'oneYear',
    ]);
    expect(chips[1].date).toBe('2026-11-25');
    expect(chips[2].date).toBe('2026-11-30');
  });
});
