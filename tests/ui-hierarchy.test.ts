import {expect, it} from 'vitest';
import {motion, releaseSheetDrag} from '../src/lib/presentation';
import {todayCopy} from '../src/strings/today';

it('restores a dragged sheet even when the close request keeps it open for confirmation', () => {
  let offset = motion.sheet.dismissDistance + 20;
  const requests: number[] = [];
  releaseSheetDrag(offset, () => {offset = 0;}, () => {requests.push(offset);});
  // Cancelling the confirmation leaves visibility unchanged and the sheet settled.
  expect(offset).toBe(0);
  expect(requests).toEqual([0]);
});

it('settles a short drag without requesting dismissal', () => {
  let settled = false;
  let requested = false;
  releaseSheetDrag(motion.sheet.dismissDistance, () => {settled = true;}, () => {requested = true;});
  expect(settled).toBe(true);
  expect(requested).toBe(false);
});

it('names every outstanding check in the collapsed attention summary', () => {
  expect(todayCopy.attentionSummary(2, true, 1)).toBe('2 transactions to review · Bank permission expired · Setup checks incomplete');
  expect(todayCopy.attentionSummary(1, false, 0)).toBe('1 transaction to review');
  expect(todayCopy.attentionSummary(0, true, 0)).toBe('Bank permission expired');
  expect(todayCopy.attentionSummary(0, false, 0)).toBe('');
});
