import {describe,it,expect} from 'vitest';
import {deleteWithReceipt,settingsTarget,ruleSummary,exampleSummary,linkSummary,protectionSummary,appLockSummary} from '../src/lib/settingsModel';
import {settingsUI as copy} from '../src/strings/settingsRework';
import {counts} from '../src/strings/format';
describe('Settings navigation',()=>{
 it.each([
  ['Appearance','home','appearance'],['Privacy','home','privacy'],['Pair bank access','link',undefined],
  ['Your workspace','examples',undefined],['Merchant rules','rules',undefined],['Backup and restore','backup',undefined],['About Headroom','about',undefined],
 ])('maps legacy section %s',(section,route,anchor)=>expect(settingsTarget(section)).toEqual(anchor?{route,anchor}:{route}));
 it.each([undefined,'Unknown','','__proto__','constructor'])('falls back to home for %s',section=>expect(settingsTarget(section)).toEqual({route:'home'}));
});

describe('Settings deletion feedback',()=>{
 function setup(example=false){let state={generation:7,data:{demo:example},error:null as string|null,mutationError:null as string|null,clear:()=>{},flushSave:async()=>true};const calls:string[]=[];state.clear=()=>{calls.push('clear');state={...state,generation:state.generation+1};};state.flushSave=async()=>{calls.push('save');return true;};return {read:()=>state,calls,replace:(patch:Partial<typeof state>)=>state={...state,...patch}};}
 it.each([false,true])('waits for the durable save before confirming deletion in example mode %s',async example=>{const s=setup(example);const result=await deleteWithReceipt(s.read);expect(result).toEqual({deleted:true,example,error:null});expect(s.calls).toEqual(['clear','save']);});
 it('does not confirm a rejected clear',async()=>{const s=setup();s.replace({clear:()=>s.replace({mutationError:'Restore or reopen your saved data before editing.'})});expect(await deleteWithReceipt(s.read)).toEqual({deleted:false,example:false,error:'Restore or reopen your saved data before editing.'});expect(s.calls).toEqual([]);});
 it('reports a failed save without claiming deletion succeeded',async()=>{const s=setup();s.replace({flushSave:async()=>{s.replace({error:'Changes are in memory but could not be saved. Retry before closing the app.'});return false;}});expect(await deleteWithReceipt(s.read)).toMatchObject({deleted:false,error:'Changes are in memory but could not be saved. Retry before closing the app.'});});
 it('keeps a thrown failure for the presentation error boundary',async()=>{const s=setup(),error=new Error('Disk unavailable');s.replace({clear:()=>{throw error;}});expect(await deleteWithReceipt(s.read)).toEqual({deleted:false,example:false,error});});
});
describe('Settings current state summaries',()=>{
 it.each([[0,'No rules'],[1,'1 rule'],[2,'2 rules']] as const)('summarises %i rules',(n,label)=>expect(ruleSummary(n)).toBe(label));
 it('summarises examples and bank linking',()=>{expect(exampleSummary(true)).toBe('On');expect(exampleSummary(false)).toBe('Off');expect(linkSummary(true)).toBe('Linked');expect(linkSummary(false)).toBe('Not linked');});
 it.each([['pending','Applying.'],['active','Stops screenshots and previews of Headroom.'],['inactive','Stops screenshots and previews of Headroom.'],['failed','Couldn’t change this. Try again.']] as const)('summarises protection %s',(status,label)=>expect(protectionSummary(status)).toBe(label));
 it('summarises app lock and the hardware check',()=>{expect(appLockSummary(false)).toBe(copy.lockOff);expect(appLockSummary(true)).toBe(copy.lockOn);expect(appLockSummary(false,true)).toBe(copy.lockUnavailable);expect(appLockSummary(true,true)).toBe(copy.lockUnavailable);});
 it('uses singular nouns for restore and delete confirmation counts',()=>{expect(copy.restoreBody(counts.transaction(1),counts.moveScenario(1),counts.transaction(2),counts.scenario(0))).toContain('1 transaction and 1 move scenario.');expect(copy.deleteBody(counts.transaction(1),counts.merchantRule(1),counts.scenario(1))).toContain('1 transaction, 1 merchant rule and 1 scenario will');});
});
