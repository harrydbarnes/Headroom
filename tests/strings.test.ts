import {it,expect} from 'vitest';
import {plural,formatCount} from '../src/strings/format';
import {movementLabel} from '../src/strings/glossary';
import {toUserMessage} from '../src/strings/errors';
it('formats singular, plural, zero and thousands',()=>{expect(plural(1,'transaction','transactions')).toBe('transaction');expect(plural(0,'transaction','transactions')).toBe('transactions');expect(plural(2,'transaction','transactions')).toBe('transactions');expect(formatCount(1234)).toBe('1,234');});
it('keeps stored transaction types out of labels',()=>{expect(movementLabel('purchase')).toBe('Spending');expect(movementLabel('review')).toBe('Needs review');expect(movementLabel('repayment')).toBe('Repayment');});
it('maps known errors and uses an honest fallback for unknown failures',()=>{expect(toUserMessage(Error('Invalid backup structure.'))).toContain('Choose a file');expect(toUserMessage('Wrong column count on row 7')).toContain('Row 7');expect(toUserMessage(Error('internal secret'))).not.toContain('internal secret');expect(toUserMessage(null)).toContain('Try again');});

import {counts} from '../src/strings/format';
import {displayMessage,displayBankMessage} from '../src/strings/messages';
it('formats named counts without exposing a wrong singular',()=>{expect(counts.transaction(1)).toBe('1 transaction');expect(counts.transaction(1234)).toBe('1,234 transactions');expect(counts.existingMatch(1)).toBe('1 existing match');});
it('preserves the specific save failure when it crosses the UI twice',()=>{const text=toUserMessage('Changes are in memory but could not be saved. Retry before closing the app.');expect(text).toContain('haven’t been saved');expect(toUserMessage(text)).toBe(text);expect(toUserMessage('unexpected error')).not.toContain('unchanged');});
it('translates bank-prefixed warnings without dropping unrelated financial caveats',()=>{
 expect(displayBankMessage('Example bank: consent expired. Reconnect your bank.')).toBe('Example bank: Permission expired. Connect this bank again.');
 const caveat='Planning estimate: unsupported/pending payments, unrecorded spending and excluded accounts may be missing.';expect(displayMessage(caveat)).toBe(caveat);
 expect(displayMessage('Based on 2026-08, 2026-09. Coverage is your attestation. Review before accepting.')).toContain('August 2026, September 2026');
 expect(displayMessage('1 transactions still need review.')).toBe('1 transaction needs review.');
});
