import {settingsUI as copy} from '../strings/settingsRework';
export type SettingsRoute='home'|'backup'|'rules'|'examples'|'link'|'about';
export type SettingsAnchor='appearance'|'privacy';
export type SettingsTarget={route:SettingsRoute;anchor?:SettingsAnchor};
const sections:Record<string,SettingsTarget>={
 Appearance:{route:'home',anchor:'appearance'},Privacy:{route:'home',anchor:'privacy'},
 'Pair bank access':{route:'link'},'Your workspace':{route:'examples'},'Merchant rules':{route:'rules'},
 'Backup and restore':{route:'backup'},'About Headroom':{route:'about'},
};
export function settingsTarget(section?:string):SettingsTarget{return section&&Object.prototype.hasOwnProperty.call(sections,section)?sections[section]:{route:'home'};}
export const ruleSummary=(n:number)=>n===0?copy.noRules:copy.ruleCount(n);
export const exampleSummary=(on:boolean)=>on?"On":copy.off;
export const linkSummary=(linked:boolean)=>linked?copy.linked:copy.notLinked;
export const appLockSummary=(on:boolean,unavailable=false)=>unavailable?copy.lockUnavailable:on?copy.lockOn:copy.lockOff;
export const protectionSummary=(status:'pending'|'active'|'inactive'|'failed')=>status==='pending'?copy.protectionPending:status==='failed'?copy.protectionFailed:copy.protectionHint;

type DeleteState={generation:number;data:{demo:boolean};clear:()=>void;flushSave:()=>Promise<boolean>;error:string|null;mutationError:string|null};
/** clear() returns void. Its generation changes only after an accepted clear.
 * Wait for the existing save boundary before showing a deletion receipt. */
export async function deleteWithReceipt(read:()=>DeleteState){
 const before=read(),example=before.data.demo;
 const failed=()=>{const state=read();return {deleted:false,example,error:state.mutationError||state.error};};
 try{before.clear();if(read().generation===before.generation)return failed();if(!await before.flushSave())return failed();return {deleted:true,example,error:null};}
 catch(error){return {deleted:false,example,error};}
}
