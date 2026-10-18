import {it,expect} from 'vitest';
import {plural,formatCount} from '../src/strings/format';
import {movementLabel} from '../src/strings/glossary';
import {toUserMessage} from '../src/strings/errors';
it('formats singular, plural, zero and thousands',()=>{expect(plural(1,'transaction','transactions')).toBe('transaction');expect(plural(0,'transaction','transactions')).toBe('transactions');expect(plural(2,'transaction','transactions')).toBe('transactions');expect(formatCount(1234)).toBe('1,234');});
it('keeps stored transaction types out of labels',()=>{expect(movementLabel('purchase')).toBe('Spending');expect(movementLabel('review')).toBe('Needs review');expect(movementLabel('repayment')).toBe('Repayment');});
it('maps known errors and uses an honest fallback for unknown failures',()=>{expect(toUserMessage(Error('Invalid backup structure.'))).toContain('Choose a file');expect(toUserMessage('Wrong column count on row 7')).toContain('Row 7');expect(toUserMessage(Error('internal secret'))).not.toContain('internal secret');expect(toUserMessage(null)).toContain('Try again');});

import {counts} from '../src/strings/format';
import {displayMessage,displayBankMessage} from '../src/strings/messages';
import {stringStructure,dynamicStringKeys} from './string-structure';
it('keeps exported copy keys short, meaningful, referenced and free of fragments',()=>{
 const failures:string[]=[];const seen=new Set<string>();
 for(const entry of stringStructure()){
  const key=entry.key.split('.').at(-1)!,id=entry.root+'.'+entry.key;
  if(/separator\d*$|\d$/.test(key)||key.length>30)failures.push(id+': invalid key');
  if(entry.value!==null&&entry.value.length<=2)failures.push(id+': short fragment');
  if(!entry.references){if(dynamicStringKeys[id])seen.add(id);else failures.push(id+': unused');}
 }
 expect(failures).toEqual([]);expect([...seen].sort()).toEqual(Object.keys(dynamicStringKeys).sort());
});
it('formats named counts without exposing a wrong singular',()=>{expect(counts.transaction(1)).toBe('1 transaction');expect(counts.transaction(1234)).toBe('1,234 transactions');expect(counts.existingMatch(1)).toBe('1 existing match');});
it('preserves the specific save failure when it crosses the UI twice',()=>{const text=toUserMessage('Changes are in memory but could not be saved. Retry before closing the app.');expect(text).toContain('haven’t been saved');expect(toUserMessage(text)).toBe(text);expect(toUserMessage('unexpected error')).not.toContain('unchanged');});
it('translates bank-prefixed warnings without dropping unrelated financial caveats',()=>{
 expect(displayBankMessage('Example bank: consent expired. Reconnect your bank.')).toBe('Example bank: Permission expired. Connect this bank again.');
 const caveat='Planning estimate: unsupported/pending payments, unrecorded spending and excluded accounts may be missing.';expect(displayMessage(caveat)).toBe(caveat);
 expect(displayMessage('Based on 2026-08, 2026-09. Coverage is your attestation. Review before accepting.')).toContain('August 2026, September 2026');
 expect(displayMessage('1 transactions still need review.')).toBe('1 transaction needs review.');
});
