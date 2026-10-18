export type Cadence='weekly'|'fortnightly'|'four-weekly'|'monthly'|'yearly';
export type PeriodRule={cadence:Cadence;anchor:string;weekend:'none'|'previous'|'next'};
const DAY=86400000;
export function validDay(value:string){return typeof value==='string'&&/^(?:19|20|21)\d{2}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;}
export function dateOnly(date:Date){return date.toISOString().slice(0,10);}
export function plusDays(day:string,n:number){if(!validDay(day)||!Number.isInteger(n))throw Error('Use a valid calendar date.');return dateOnly(new Date(Date.parse(day+'T12:00:00Z')+n*DAY));}
export function daysBetween(a:string,b:string){return Math.round((Date.parse(b)-Date.parse(a))/DAY);}
export function occurrence(rule:PeriodRule,index:number){
 if(!validDay(rule.anchor)||!Number.isInteger(index))throw Error('Choose a valid period anchor.');
 let day:string;
 if(rule.cadence==='monthly'||rule.cadence==='yearly'){
  const [y,m,d]=rule.anchor.split('-').map(Number),target=new Date(Date.UTC(y,m-1+index*(rule.cadence==='yearly'?12:1),1,12));
  const last=new Date(Date.UTC(target.getUTCFullYear(),target.getUTCMonth()+1,0)).getUTCDate();target.setUTCDate(Math.min(d,last));day=dateOnly(target);
 }else{const step={weekly:7,fortnightly:14,'four-weekly':28}[rule.cadence];if(!step)throw Error('Choose a supported period.');day=plusDays(rule.anchor,index*step);}
 const dow=new Date(day+'T12:00:00Z').getUTCDay();
 return dow===0||dow===6?plusDays(day,rule.weekend==='previous'?(dow===6?-1:-2):rule.weekend==='next'?(dow===6?2:1):0):day;
}
export function periodAt(rule:PeriodRule,day:string){
 if(!validDay(day))throw Error('Choose a valid period date.');
 const [ay,am]=rule.anchor.split('-').map(Number),[y,m]=day.split('-').map(Number);
 let index=rule.cadence==='monthly'?(y-ay)*12+m-am:rule.cadence==='yearly'?y-ay:Math.floor(daysBetween(rule.anchor,day)/({weekly:7,fortnightly:14,'four-weekly':28}[rule.cadence]??7));
 while(occurrence(rule,index)>day)index--;while(occurrence(rule,index+1)<=day)index++;
 const start=occurrence(rule,index),end=occurrence(rule,index+1);return {index,start,end,last:plusDays(end,-1),days:daysBetween(start,end)};
}
export const cadences:Cadence[]=['weekly','fortnightly','four-weekly','monthly','yearly'];
