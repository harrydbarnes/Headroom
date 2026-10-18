import {it,expect} from 'vitest';
import {bankingCallback,bankingSetup,type SetupState} from '../src/lib/bankingSetup';
const base:SetupState={paired:false,statusState:'unpaired',configured:false,connections:[]};
it('gates real discovery and import on verified configuration, consent and workspace',()=>{
 expect(bankingSetup(base,false).step).toBe(0);
 expect(bankingSetup({...base,paired:true,statusState:'unavailable',configured:true},false).canDiscover).toBe(false);
 expect(bankingSetup({...base,paired:true,statusState:'verified'},false).step).toBe(1);
 const ready={...base,paired:true,statusState:'verified' as const,configured:true};
 expect(bankingSetup(ready,false)).toMatchObject({step:3,canDiscover:true,canImport:false});
 const connected={...ready,connections:[{expires:'2099-01-01'}]};expect(bankingSetup(connected,false)).toMatchObject({step:4,canImport:true});expect(bankingSetup(connected,true).canImport).toBe(false);expect(bankingSetup(connected,true).canDiscover).toBe(false);
 expect(bankingSetup({...ready,connections:[{expires:'2000-01-01'}]},false)).toMatchObject({step:3,canImport:false,needsRenewal:true});
});
it('previews only an exact HTTPS origin callback without leaking credentials or query data',()=>{
 expect(bankingCallback('https://finance.example.com/')).toBe('https://finance.example.com/api/banking/callback');
 for(const bad of ['http://finance.example.com','https://user:secret@example.com','https://example.com/path','https://example.com/?secret=x','https://example.com/#secret','not a URL'])expect(()=>bankingCallback(bad)).toThrow();
});
