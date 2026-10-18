import {expect,it} from 'vitest';
import fixture from './fixtures/error-map.json';
import {toUserMessage,displayMessage,genericError} from '../src/strings/errors';
it('preserves every previously specific exact translation and warning',()=>{
 for(const row of fixture){
  // The old error entry point did not translate ordinary warnings. They now
  // have specific messages too, but this is not an old mapping to preserve.
  if(row.error!=='Something went wrong. Check the latest saved data and try again.')expect(toUserMessage(row.raw),row.raw).toBe(row.error);
  expect(displayMessage(row.raw),row.raw).toBe(row.display);
 }
});
it('uses the honest fallback without implying a write outcome',()=>{
 expect(toUserMessage(null)).toBe(genericError);
 expect(toUserMessage(new Error('Unknown failure'))).toBe('Something went wrong. Try again. If it keeps happening, restart Headroom.');
});
