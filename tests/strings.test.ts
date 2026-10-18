import {it,expect} from 'vitest';
import {plural,formatCount} from '../src/strings/format';
import {movementLabel} from '../src/strings/glossary';
import {toUserMessage} from '../src/strings/errors';
it('formats singular, plural, zero and thousands',()=>{expect(plural(1,'transaction','transactions')).toBe('transaction');expect(plural(0,'transaction','transactions')).toBe('transactions');expect(plural(2,'transaction','transactions')).toBe('transactions');expect(formatCount(1234)).toBe('1,234');});
it('keeps stored transaction types out of labels',()=>{expect(movementLabel('purchase')).toBe('Spending');expect(movementLabel('review')).toBe('Needs review');expect(movementLabel('repayment')).toBe('Repayment');});
it('maps known errors and uses an honest fallback for unknown failures',()=>{expect(toUserMessage(Error('Invalid backup structure.'))).toContain('Choose a file');expect(toUserMessage('Wrong column count on row 7')).toContain('Row 7');expect(toUserMessage(Error('internal secret'))).not.toContain('internal secret');expect(toUserMessage(null)).toContain('try again');});
