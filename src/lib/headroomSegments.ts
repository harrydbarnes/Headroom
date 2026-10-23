import {assess, type Plan} from './finance';

export type HeadroomPart = 'essentials' | 'flexible' | 'annual' | 'minimums' | 'headroom';
export type HeadroomSegment = {id: HeadroomPart; amount: number; share: number};

/** Debt minimums belong to essentials already. Split them out, never add them again.
 * An inconsistent minimum total stays in essentials until the baseline is corrected.
 */
export function headroomSegments(plan: Plan) {
  const result = assess(plan);
  const recorded = (plan.debts ?? []).reduce((sum, debt) => sum + (debt.minimum ?? 0), 0);
  const separateMinimums = recorded <= plan.essentials ? recorded : 0;
  const amounts: [HeadroomPart, number][] = [
    ['essentials', plan.essentials - separateMinimums],
    ['flexible', plan.flexible],
    ['annual', plan.annualReserve],
    ...(separateMinimums > 0 ? [['minimums', separateMinimums] as [HeadroomPart, number]] : []),
    ['headroom', Math.max(0, result.surplus)],
  ];
  const empty = plan.income === 0;
  const overspent = result.surplus < 0;
  const total = Math.max(plan.income, result.committed);
  const segments: HeadroomSegment[] = amounts.map(([id, amount]) => ({
    id, amount, share: empty || total === 0 ? 0 : amount / total,
  }));
  return {segments, empty, overspent, minimumsIncluded: recorded > plan.essentials};
}
