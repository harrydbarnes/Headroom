import * as Finance from './transactions';
import type {RecordRow,Statement,Account} from './transactions';
export interface Allowance {id:string;annual:number|null;mode:string;}
export interface SavingsPlan {format:string;actions:{id:number;target:number;status:string;note:string}[];funds:Allowance[];baseline:string;month:string;}
 export const round=(n:number)=>Math.round((Number(n)+Number.EPSILON)*100)/100;
 export const funds=[['holiday','Holidays'],['christmas','Christmas'],['birthdays','Birthdays and gifts'],['car','Car maintenance and MOT'],['family','Family purchases and replacements']];
 export function allowances(items:Allowance[]){const additional=items.filter(x=>x.mode==='additional'&&x.annual!==null).reduce((s,x)=>s+x.annual!/12,0),within=items.filter(x=>x.mode==='within'&&x.annual!==null).reduce((s,x)=>s+x.annual!/12,0);return {additional,within,unset:items.filter(x=>x.annual===null).length};}
 export function group(r:RecordRow){const m=r.merchant.toLowerCase();if(/marks.?&.?spencer|marks and spencer|m&s/.test(m))return 2;if(/\baldi\b/.test(m))return 0;if(r.category==='Groceries')return 1;if(r.category==='Eating out')return 3;if(['Clothing','Home','Gifts','Other'].includes(r.category))return 4;if(r.category==='Activities')return 5;if(r.category==='Health')return 6;if(r.category==='Travel')return /snb|s200188/i.test(m)?7:8;return null;}
 export function measurement(id:number,baselineMonth:string,month:string,records:RecordRow[],finance:typeof Finance,statements:Statement[],accounts:Account[],required:string[]){
  if(!baselineMonth||!month||baselineMonth>=month)return {valid:false,reason:'Choose an earlier baseline month.'};
  const periods=[baselineMonth,month].map(m=>finance.monthly(m,records,statements,accounts,required));
  if(periods.some(p=>!p.complete))return {valid:false,reason:'Complete account coverage and money-movement checks are needed for both months.'};
  if(periods.some(p=>p.rows.some(r=>r.category==='Unsure'||r.pattern==='review')))return {valid:false,reason:'Finish the category and budget-treatment review in both months.'};
  const amount=(p:ReturnType<typeof Finance.monthly>)=>{let total=0;for(const r of p.rows){if(r.flow==='spend'&&r.amount>0&&group(r)===id)total+=r.amount;if(r.flow==='refund'&&r.amount<0){const original=records.find(x=>x.id===r.refundOf);if(original&&group(original)===id)total+=r.amount;}}return round(total);};
  const before=amount(periods[0]),after=amount(periods[1]);return {valid:true,before,after,reduction:round(before-after)};
 }
 export function validPlan(p:SavingsPlan){return p&&p.format==='home-move-savings-plan-v1'&&Array.isArray(p.actions)&&p.actions.length===9&&new Set(p.actions.map(a=>a.id)).size===9&&p.actions.every(a=>Number.isInteger(a.id)&&a.id>=0&&a.id<9&&Number.isFinite(a.target)&&a.target>=0&&a.target<=1e6&&['investigate','trying','paused'].includes(a.status)&&typeof a.note==='string'&&a.note.length<=1000)&&Array.isArray(p.funds)&&p.funds.length===5&&new Set(p.funds.map(f=>f.id)).size===5&&p.funds.every(f=>funds.some(([id])=>id===f.id)&&(f.annual===null||Number.isFinite(f.annual)&&f.annual>=0&&f.annual<=1e7)&&['additional','within'].includes(f.mode))&&typeof p.baseline==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(p.baseline)&&typeof p.month==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(p.month);}
