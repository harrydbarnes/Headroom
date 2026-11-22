import { percent, type Pence } from './calculators/money';
import { cashEvents } from './cashflow';
import { assess, defaultCustomSplit, type AllocationMode, type CustomSplit } from './finance';
import { latestBalance, money } from './ledger';
import { daysBetween, plusDays, validDay } from './periods';
import { emptyPlanning } from './planning';
import { dayKey, effectivePlan, type Workspace } from './workspace';

export type HeadroomMode = 'live' | 'planned';

export type WhatIfDelta = {
  oneOffSpend?: Pence;
  oneOffDate?: string; // YYYY-MM-DD
  monthlyExtraSave?: Pence;
  monthlyExtraInvest?: Pence;
};

export type PointInTimeHeadroom = {
  targetDate: string;
  asOf: string;
  mode: HeadroomMode;
  allocationMode: AllocationMode;
  customSplit: CustomSplit;
  availableTotal: Pence;
  safeToSpend: Pence;
  canSave: Pence;
  canInvest: Pence;
  lowestCashBeforeTarget: Pence | null;
  upcomingBillsTotal: Pence;
  reservedCash: Pence;
  daysUntilTarget: number;
  warnings: string[];
  fallbackReason?: string;
};

const SPENDABLE_KINDS = new Set(['cash', 'current', 'savings']);

/** Compute the next payday YYYY-MM-DD strictly after `asOf` (or on `asOf` if `includeToday`). */
export function nextPayday(asOf: string, paydayDay = 25): string {
  const clamped = Math.max(1, Math.min(31, Math.round(paydayDay)));
  const [y, m, d] = asOf.split('-').map(Number);
  const daysIn = (year: number, month1: number) => new Date(Date.UTC(year, month1, 0)).getUTCDate();
  const thisMonthDay = Math.min(clamped, daysIn(y, m));
  if (thisMonthDay > d) {
    return `${y}-${String(m).padStart(2, '0')}-${String(thisMonthDay).padStart(2, '0')}`;
  }
  const nextMonth = m === 12 ? 1 : m + 1;
  const nextYear = m === 12 ? y + 1 : y;
  const nextDay = Math.min(clamped, daysIn(nextYear, nextMonth));
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`;
}

/** Return the last calendar day of the month containing `asOf`. */
export function endOfMonth(asOf: string): string {
  const [y, m] = asOf.split('-').map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return `${y}-${String(m).padStart(2, '0')}-${String(last).padStart(2, '0')}`;
}

export type QuickTarget = {
  id: 'today' | 'payday' | 'monthEnd' | 'threeMonths' | 'oneYear';
  date: string;
};

export function quickTargetDates(asOf: string, paydayDay = 25): QuickTarget[] {
  return [
    { id: 'today', date: asOf },
    { id: 'payday', date: nextPayday(asOf, paydayDay) },
    { id: 'monthEnd', date: endOfMonth(asOf) },
    { id: 'threeMonths', date: plusDays(asOf, 90) },
    { id: 'oneYear', date: plusDays(asOf, 365) },
  ];
}

function splitAvailable(
  availableTotal: Pence,
  allocationMode: AllocationMode,
  customSplit: CustomSplit,
  assessed: ReturnType<typeof assess>,
): { canSave: Pence; canInvest: Pence; safeToSpend: Pence } {
  const positive = Math.max(0, availableTotal);
  if (positive === 0) return { canSave: 0, canInvest: 0, safeToSpend: 0 };
  if (allocationMode === 'custom') {
    const canSave = percent(positive, customSplit.save);
    const canInvest = percent(positive, customSplit.invest);
    const safeToSpend = Math.max(0, positive - canSave - canInvest);
    return { canSave, canInvest, safeToSpend };
  }
  // Guided mode: preserve proportions of assess() when availableTotal differs from monthly surplus,
  // or apply exact waterfall amounts when projecting monthly surplus directly.
  const guidedTotal =
    assessed.debtPayment +
    assessed.emergency +
    assessed.goalSaving +
    assessed.investment +
    assessed.unallocated;
  if (guidedTotal <= 0) {
    return { canSave: 0, canInvest: 0, safeToSpend: positive };
  }
  const guidedSave = assessed.debtPayment + assessed.emergency + assessed.goalSaving;
  if (positive === guidedTotal) {
    return {
      canSave: guidedSave,
      canInvest: assessed.investment,
      safeToSpend: assessed.unallocated,
    };
  }
  const saveRatio = guidedSave / guidedTotal;
  const investRatio = assessed.investment / guidedTotal;
  const canSave = Math.round(positive * saveRatio);
  const canInvest = Math.round(positive * investRatio);
  const safeToSpend = Math.max(0, positive - canSave - canInvest);
  return { canSave, canInvest, safeToSpend };
}

/**
 * Unified point-in-time headroom projection.
 * Blends live spendable account balances + upcoming confirmed bills when usable snapshots exist,
 * and seamlessly falls back to the monthly plan when live balances have not been recorded.
 */
export function headroomAt(
  workspace: Workspace,
  targetDate: string,
  asOf = dayKey(),
  whatIf?: WhatIfDelta,
): PointInTimeHeadroom {
  const safeTarget = validDay(targetDate) ? targetDate : asOf;
  const plan = effectivePlan(workspace);
  const targetAsDate = new Date(safeTarget + 'T12:00:00Z');
  const assessed = assess(plan, targetAsDate);
  const allocationMode: AllocationMode = plan.allocationMode ?? 'guided';
  const customSplit: CustomSplit = plan.customSplit ?? defaultCustomSplit;
  const daysUntilTarget = daysBetween(asOf, safeTarget);
  const warnings: string[] = [];

  if (assessed.debtPayment > 0) {
    warnings.push('High-cost debt remains. Extra debt repayment saves interest.');
  }
  if (assessed.emergencyGap > 0) {
    warnings.push('Emergency cash is below your target.');
  }

  const ledger = workspace.ledger;
  const planning = workspace.planning ?? emptyPlanning();
  const configuredIds = planning.forecast.accounts;
  const candidateAccounts = (ledger?.accounts ?? []).filter(
    (a) =>
      !a.archived &&
      SPENDABLE_KINDS.has(a.kind) &&
      (configuredIds.length > 0 ? configuredIds.includes(a.id) : a.included),
  );

  // Use snapshots at or before min(asOf, safeTarget) for past queries, or at or before asOf for now/future.
  const balanceRefDate = safeTarget < asOf ? safeTarget : asOf;
  const balanceRefTs = Date.parse(balanceRefDate + 'T23:59:59Z');
  const usableSources = candidateAccounts
    .map((account) => ({
      account,
      ...latestBalance(ledger!, account.id, balanceRefTs),
    }))
    .filter((s) => s.snapshot && s.status !== 'future');

  const whatIfOneOff = Math.max(0, Math.round(whatIf?.oneOffSpend ?? 0));
  const whatIfOneOffDate =
    whatIf?.oneOffDate && validDay(whatIf.oneOffDate) ? whatIf.oneOffDate : asOf;
  const whatIfMonthlySave = Math.max(0, Math.round(whatIf?.monthlyExtraSave ?? 0));
  const whatIfMonthlyInvest = Math.max(0, Math.round(whatIf?.monthlyExtraInvest ?? 0));
  const monthsForward = daysUntilTarget > 0 ? daysUntilTarget / 30.4375 : 0;

  if (usableSources.length > 0) {
    if (usableSources.some((s) => s.status === 'stale')) {
      warnings.push('At least one starting snapshot is older than 24 hours.');
    }
    const accountNames = new Set(usableSources.map((s) => s.account.name));
    const base = usableSources.reduce((sum, s) => money(sum + s.snapshot!.current), 0);
    // Roll snapshots forward using booked deltas up to balanceRefDate.
    const bookedDelta = usableSources.reduce(
      (sum, s) =>
        money(
          sum +
            workspace.transactions
              .filter(
                (t) =>
                  t.account === s.account.name &&
                  t.date > s.snapshot!.asOf.slice(0, 10) &&
                  t.date <= balanceRefDate,
              )
              .reduce((acc, t) => money(acc + t.amount), 0),
        ),
      0,
    );
    const opening = money(base - bookedDelta);

    const baseReserve = money(
      planning.forecast.reserve + planning.forecast.goalReserve + planning.forecast.pensionDelta,
    );

    if (daysUntilTarget < 0) {
      // Historical point in time
      const availableTotal = money(opening - baseReserve);
      const split = splitAvailable(availableTotal, allocationMode, customSplit, assessed);
      return {
        targetDate: safeTarget,
        asOf,
        mode: 'live',
        allocationMode,
        customSplit,
        availableTotal,
        ...split,
        lowestCashBeforeTarget: availableTotal,
        upcomingBillsTotal: 0,
        reservedCash: baseReserve,
        daysUntilTarget,
        warnings,
      };
    }

    // Daily cash-flow stepping up to 366 days
    const dailyHorizon = Math.min(366, Math.max(0, daysUntilTarget));
    const dailyEnd = plusDays(asOf, dailyHorizon);
    const allEvents = cashEvents(workspace, asOf, dailyEnd).filter((e) =>
      accountNames.has(e.account),
    );
    const overdueReserve = money(
      allEvents
        .filter((e) => e.status === 'overdue' && e.amount > 0)
        .reduce((sum, e) => money(sum + e.amount), 0),
    );
    const reservedCash = money(baseReserve + overdueReserve);
    let running = money(opening - reservedCash);
    let lowest = running;
    let upcomingBillsTotal = 0;

    for (let i = 0; i <= dailyHorizon; i++) {
      const date = plusDays(asOf, i);
      const due = allEvents.filter(
        (e) =>
          e.due === date && (e.status === 'expected' || (e.status === 'ambiguous' && e.amount > 0)),
      );
      for (const e of due) {
        if (!e.refundId) {
          running = money(running - e.amount);
          if (e.amount > 0) upcomingBillsTotal = money(upcomingBillsTotal + e.amount);
        }
      }
      if (whatIfOneOff > 0 && date === whatIfOneOffDate) {
        running = money(running - whatIfOneOff);
      }
      lowest = Math.min(lowest, running);
    }

    // Beyond 366 days, extend using steady-state monthly surplus.
    let projected = running;
    if (daysUntilTarget > 366) {
      const extraMonths = (daysUntilTarget - 366) / 30.4375;
      projected = money(projected + Math.round(assessed.surplus * extraMonths));
      if (whatIfOneOff > 0 && whatIfOneOffDate > dailyEnd && whatIfOneOffDate <= safeTarget) {
        projected = money(projected - whatIfOneOff);
      }
      lowest = Math.min(lowest, projected);
    }

    const extraMonthlyDrag = Math.round((whatIfMonthlySave + whatIfMonthlyInvest) * monthsForward);
    const availableTotal = money(Math.min(projected, lowest) - extraMonthlyDrag);
    const split = splitAvailable(availableTotal, allocationMode, customSplit, assessed);

    return {
      targetDate: safeTarget,
      asOf,
      mode: 'live',
      allocationMode,
      customSplit,
      availableTotal,
      canSave: money(split.canSave + Math.round(whatIfMonthlySave * monthsForward)),
      canInvest: money(split.canInvest + Math.round(whatIfMonthlyInvest * monthsForward)),
      safeToSpend: split.safeToSpend,
      lowestCashBeforeTarget: money(lowest - extraMonthlyDrag),
      upcomingBillsTotal,
      reservedCash,
      daysUntilTarget,
      warnings,
    };
  }

  // Seamless fallback to monthly planned capacity when no live snapshots exist.
  const periodFactor = daysUntilTarget <= 30 ? 1 : monthsForward;
  const rawPlanned = Math.round(assessed.surplus * periodFactor);
  const oneOffDrag =
    whatIfOneOff > 0 && whatIfOneOffDate >= asOf && whatIfOneOffDate <= safeTarget
      ? whatIfOneOff
      : 0;
  const extraMonthlyDrag = Math.round(
    (whatIfMonthlySave + whatIfMonthlyInvest) * Math.max(1, monthsForward),
  );
  const availableTotal = money(rawPlanned - oneOffDrag - extraMonthlyDrag);
  const split = splitAvailable(availableTotal, allocationMode, customSplit, assessed);

  return {
    targetDate: safeTarget,
    asOf,
    mode: 'planned',
    allocationMode,
    customSplit,
    availableTotal,
    canSave: money(split.canSave + Math.round(whatIfMonthlySave * Math.max(1, monthsForward))),
    canInvest: money(
      split.canInvest + Math.round(whatIfMonthlyInvest * Math.max(1, monthsForward)),
    ),
    safeToSpend: split.safeToSpend,
    lowestCashBeforeTarget: null,
    upcomingBillsTotal: 0,
    reservedCash: 0,
    daysUntilTarget,
    warnings,
    fallbackReason: 'Add an account balance in Accounts to include live cash and upcoming bills.',
  };
}
