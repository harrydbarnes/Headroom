import {expect, it} from 'vitest';
import {numberFieldText, numberFieldValue} from '../src/lib/numberField';

it('shows zero as an empty resting field and retains explicit zero while editing', () => {
  expect(numberFieldText(0, true)).toBe('');
  expect(numberFieldText(0, false)).toBe('');
  expect(numberFieldText(0, true, true)).toBe('0');
  expect(numberFieldText(12345, true)).toBe('123.45');
});
it('treats an empty draft as zero only for fields whose minimum is zero', () => {
  expect(numberFieldValue('')).toBe(0);
  expect(numberFieldValue('', {money: false, min: 0, integer: true})).toBe(0);
  expect(numberFieldValue('', {min: 1})).toBeNull();
  expect(numberFieldValue('', {min: -1})).toBeNull();
});
it('preserves decimal, range and whole-number validation', () => {
  expect(numberFieldValue('12.34')).toBe(1234);
  expect(numberFieldValue('.5')).toBe(50);
  expect(numberFieldValue('12.345')).toBeNull();
  expect(numberFieldValue('1.5', {money: false, integer: true})).toBeNull();
  expect(numberFieldValue('51', {money: false, min: 1, max: 50})).toBeNull();
  expect(numberFieldValue(' ')).toBeNull();
  expect(numberFieldValue('2e3')).toBeNull();
});
