import {amountContent,amountDisplay} from '../src/lib/amountDisplay';
import {createElement} from 'react';
import {layoutChildren} from '../src/ui/layoutChildren';
import {describe,it,expect} from 'vitest';
import {columnCount,navigationNeedsMenu,layoutPolicy,motion,TransitionSlot} from '../src/lib/presentation';
import {light,dark} from '../src/lib/palette';
import {assess} from '../src/lib/finance';
import {actualsPreview,transferPair} from '../src/lib/reconciliation';
import {effectivePlan,exampleWorkspace,exportBackup,freshWorkspace,parseBackup,validateWorkspace} from '../src/lib/workspace';
describe('responsive presentation policy',()=>{
 it('uses a scrollable bottom bar on compact/short windows and a rail on wide windows',()=>{expect(layoutPolicy(360,800).rail).toBe(false);expect(layoutPolicy(840,800).rail).toBe(true);expect(layoutPolicy(900,360).rail).toBe(false);expect(layoutPolicy(900,800,3).railWidth).toBe(160);});
 it('only adds columns when the actual container can hold both panes at the chosen text size',()=>{expect(columnCount(700)).toBe(1);expect(columnCount(704)).toBe(2);expect(columnCount(704,2)).toBe(1);expect(columnCount(1384,2)).toBe(2);expect(columnCount(650,1,300)).toBe(2);});
 it('stacks amount rows for compact windows and large text, and bounds wide dialogs',()=>{expect(layoutPolicy(360,800).stackValues).toBe(true);expect(layoutPolicy(600,800,2).stackValues).toBe(true);expect(layoutPolicy(720,800).centerSheet).toBe(true);expect(layoutPolicy(720,360).centerSheet).toBe(false);});
});
describe('interrupted transitions',()=>{
 it('stops an earlier transition before starting the replacement and clears the final handle',()=>{const slot=new TransitionSlot(),calls:string[]=[];slot.replace({start:()=>calls.push('start-a'),stop:()=>calls.push('stop-a')});slot.replace({start:()=>calls.push('start-b'),stop:()=>calls.push('stop-b')});slot.stop();slot.stop();expect(calls).toEqual(['start-a','stop-a','start-b','stop-b']);});
 it('cancels without starting another transition when motion or visibility is disabled',()=>{const slot=new TransitionSlot(),calls:string[]=[];slot.replace({start:()=>calls.push('start'),stop:()=>calls.push('stop')});slot.replace(null);expect(calls).toEqual(['start','stop']);expect(motion.spring.damping).toBeGreaterThan(0);});
});
const luminance=(hex:string)=>{const rgb=hex.slice(1).match(/../g)!.map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
const contrast=(a:string,b:string)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
describe('static palette contrast',()=>{
 for(const [name,p] of Object.entries({light,dark}))it(name+' text and action pairs meet 4.5:1',()=>{for(const [foreground,background] of [[p.text,p.surface],[p.text,p.card],[p.muted,p.surface],[p.muted,p.card],[p.onPrimary,p.primary],[p.onPrimaryContainer,p.primaryContainer],[p.error,p.errorContainer],[p.onError,p.error],[p.warning,p.warningContainer],[p.primary,p.surface],[p.primary,p.card],[p.primary,p.primaryContainer],[p.text,p.primaryContainer],[p.muted,p.primaryContainer]])expect(contrast(foreground,background),foreground+' on '+background).toBeGreaterThanOrEqual(4.5);});
});
describe('fictional walkthrough data',()=>{
 it('contains three complete past months, an unfinished current review and comparable scenarios',()=>{const w=exampleWorkspace(new Date('2026-10-15T12:00:00Z'));expect(effectivePlan(w).monthsReviewed).toBe(3);expect(assess(effectivePlan(w)).score).not.toBeNull();expect(w.transactions.filter(t=>t.date.startsWith('2026-10')&&t.movement==='review')).toHaveLength(3);expect(w.scenarios).toHaveLength(2);expect(w.exampleStep).toBe(0);expect(parseBackup(exportBackup(w))).toEqual(validateWorkspace(w));});
 it('demonstrates annual-bill exclusions without changing the two monthly baseline categories',()=>{const w=exampleWorkspace(new Date('2026-10-15T12:00:00Z')),p=actualsPreview(w,'2026-09');expect(p.essentials).toBe(320000);expect(p.flexible).toBe(110000);expect(p.annual).toHaveLength(1);expect(p.annual[0].amount).toBe(240000);expect(p.reasons).toEqual([]);const rows=w.transactions.filter(t=>t.date.startsWith('2026-09')&&t.movement==='transfer');expect(transferPair(w.transactions,rows.map(t=>t.id))).toHaveLength(2);});
 it('never places current example entries after the creation date, even on the first day of a month',()=>{const w=exampleWorkspace(new Date('2026-10-01T12:00:00Z'));expect(w.transactions.every(t=>t.date<='2026-10-01')).toBe(true);expect(freshWorkspace().coverage).toEqual([]);expect(assess(effectivePlan(freshWorkspace())).score).toBeNull();});
 it('validates persisted guide progress and rejects out-of-range steps',()=>{const w=exampleWorkspace();w.exampleStep=4;expect(validateWorkspace(w).exampleStep).toBe(4);w.exampleStep=5;expect(()=>validateWorkspace(w)).toThrow('guide');});
});

it('ignores JSX-only whitespace between adaptive panels while retaining real content',()=>{const a=createElement('panel',{key:'a'}),b=createElement('panel',{key:'b'});expect(layoutChildren(['  ',a,'\n',b,false,null])).toEqual([expect.objectContaining({type:'panel'}),expect.objectContaining({type:'panel'})]);expect(layoutChildren(['Caption',0])).toEqual(['Caption',0]);});

 it('uses an explicit destination menu before scaled tabs overflow, including optional Move',()=>{expect(navigationNeedsMenu(411,1,5)).toBe(false);expect(navigationNeedsMenu(411,2,5)).toBe(true);expect(navigationNeedsMenu(411,2,4)).toBe(true);expect(navigationNeedsMenu(320,1,5)).toBe(true);expect(navigationNeedsMenu(768,2,5)).toBe(false);});

it('never includes financial digits, a sign or magnitude in a hidden amount',()=>{for(const value of [0,1,-12345,999999999])for(const precise of [true,false])expect(amountDisplay(value,precise,true)).toBe('••••••');expect(amountDisplay(12345,true,false)).toBe('£123.45');});

it('removes real amount text from every hidden animation layer, including rapid reversals',()=>{for(const hidden of [false,true,false,true,true,false,true]){const content=amountContent(987654321,true,hidden);if(hidden){expect(content.text).toBeNull();expect(content.label).toBe('Amount hidden');expect(content.mask).toBe('••••••');expect(JSON.stringify(content)).not.toMatch(/987|9,876|543/);}else expect(content.text).toBe('£9,876,543.21');}expect(motion.duration.privacy).toBe(200);});
