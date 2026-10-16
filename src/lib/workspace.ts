import {assess, demoPlan, emptyPlan, type Plan, type Transaction, type Movement} from './finance';
import {houseMove, type HouseMoveInput} from './calculators/houseMove';

export const initialHouse:HouseMoveInput={purchase:59000000,buyer:'standard',period:'current',nonResident:false,sale:{selling:true,price:37500000,redemption:23483558,erc:0,agentPercent:1,agentVat:20,listing:36000,aml:3000},fees:{legalNet:300000,legalVat:0,arrangement:100000,valuation:0,booking:0,survey:80000,surveyTier:'custom',landRegistry:0,searches:0,epc:0,removals:100000,storage:0,works:0},savings:1950000,extraSavings:0,reserve:1800000,loanMode:'required',fixedLoan:48000000,annualRate:4.83,years:30,interestOnly:false,ltvCeiling:80,borrowingLimit:48000000,exchangePercent:10,upfront:80000};
export type MoveState={provenance?:'personal'|'example-template'|'existing';input:HouseMoveInput;currentHousing:number;housingType:'mortgage'|'rent'|'none';housingStops:boolean;overlapMonths:number;housingConfirmed:boolean;confirmed:boolean};
export type Scenario=MoveState&{id:string;name:string};
export type Rule={id:string;merchant:string;movement:Movement;category:string;direction?:'in'|'out'};
export type Coverage={month:string;confirmedAt:string;accounts?:{name:string;status:'complete'|'noActivity'}[]};
export type SyncReceipt={attemptedAt:string;finishedAt:string;status:'complete'|'partial'|'failed';added:number;updated:number;unchanged:number;warnings:string[];outcomes:{id:string;provider:string;status:'success'|'cached'|'partial'|'failed'|'expired';lastSync:string|null;count:number}[]};
export type Workspace={exampleStep?:number;syncReceipt?:SyncReceipt;setupSkipped?:number[];plan:Plan;transactions:Transaction[];lastSync:string|null;planConfirmedAt:string|null;onboardingStep:number;coverage:Coverage[];rules:Rule[];move:MoveState;scenarios:Scenario[]};
export type Preferences={theme:'system'|'light'|'dark';dynamicColor:boolean;reduceMotion:boolean;hideAmounts:boolean;moveEnabled:boolean;appLock:boolean;blockCapture:boolean};
export type AppData={version:2;personal:Workspace;example:Workspace;demo:boolean;preferences:Preferences};
export const clone=<T,>(v:T):T=>JSON.parse(JSON.stringify(v));
/** Prevent rejected mutation callbacks from changing live objects in place. */
export function immutable<T>(value:T):T{if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const child of Object.values(value))immutable(child);Object.freeze(value);}return value;}
export const id=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,9);
export const monthKey=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
export const dayKey=(date=new Date())=>monthKey(date)+'-'+String(date.getDate()).padStart(2,'0');
export function manualTransaction(merchant:string,account:string,date:string,amount:number,incoming:boolean):Transaction{
 if(!merchant.trim()||merchant.length>500||!account.trim()||account.length>500||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date||date>dayKey()||!Number.isSafeInteger(amount)||amount<=0)throw Error('Enter a merchant, account, valid past or current date and a positive amount.');
 return {id:'manual:'+id(),merchant:merchant.trim(),account:account.trim(),date,amount:incoming?-amount:amount,movement:'review',category:'Uncategorised'};
}
export function shiftMonth(month:string,delta:number){const [y,m]=month.split('-').map(Number);return monthKey(new Date(y,m-1+delta,1));}
export function debtEntries(p:Plan){return p.debts??(p.debt>0?[{id:'migrated-debt',name:'Existing debt',balance:p.debt,apr:p.debtApr}]:[]);}
export function goalEntries(p:Plan){return p.goals??(p.goal>0||p.goalSaved>0?[{id:'migrated-goal',name:'My goal',target:p.goal,saved:p.goalSaved,months:p.goalMonths}]:[]);}
export function blankHouse():HouseMoveInput{const h=clone(initialHouse);h.purchase=0;h.sale={...h.sale,selling:false,price:0,redemption:0,erc:0,agentPercent:0,agentVat:20,listing:0,aml:0};h.fees={...h.fees,legalNet:0,arrangement:0,survey:0,removals:0};h.savings=0;h.reserve=0;h.fixedLoan=0;h.borrowingLimit=0;h.upfront=0;return h;}
export function freshWorkspace():Workspace{return {plan:{...clone(emptyPlan),debts:[],goals:[]},transactions:[],lastSync:null,planConfirmedAt:null,onboardingStep:0,coverage:[],rules:[],move:{provenance:'personal',input:blankHouse(),currentHousing:0,housingType:'none',housingStops:true,overlapMonths:0,housingConfirmed:false,confirmed:false},scenarios:[]};}
/** A complete fictional journey; personal workspaces never inherit this evidence. */
export function exampleWorkspace(asOf=new Date()):Workspace{
 const w=freshWorkspace(),today=monthKey(asOf),stamp=asOf.toISOString();w.exampleStep=0;w.move={...w.move,provenance:'example-template',input:clone(initialHouse),currentHousing:136578,housingType:'mortgage',housingStops:true,housingConfirmed:true,confirmed:true};
 w.plan={...clone(demoPlan),debts:[{id:'card',name:'Example credit card',balance:50000,apr:24,minimum:2500}],goals:[{id:'move',name:'Next chapter',target:1800000,saved:500000,months:18,dueMonth:shiftMonth(today,18),priority:1,funding:true}],coverageConfirmed:true,monthsReviewed:0};w.onboardingStep=4;w.planConfirmedAt=stamp;
 const add=(month:string,rows:[string,number,Movement,string,string][],current=false)=>rows.forEach(([merchant,amount,movement,category,account],i)=>w.transactions.push({id:`example:${month}:${i}`,merchant,amount,movement,category,account,date:month+'-'+String(current?Math.min(i+1,asOf.getDate()):i+1).padStart(2,'0')}));
 add(today,[['Salary',-590000,'income','Income','Example current account'],['Mortgage',136578,'purchase','Essentials','Example current account'],['Grocer',6425,'review','Uncategorised','Example current account'],['Rail travel',2840,'review','Uncategorised','Example current account'],['Savings transfer',20000,'transfer','Transfers','Example current account'],['Grocer',4299,'review','Uncategorised','Example current account']],true);
 for(let n=1;n<=3;n++){const month=shiftMonth(today,-n);add(month,[['Salary',-590000,'income','Income','Example current account'],['Mortgage',136578,'purchase','Essentials','Example current account'],['Household bills and debt minimum',183422,'purchase','Essentials','Example current account'],['Everyday spending',104000,'purchase','Flexible','Example current account'],['Cash spending',6000,'purchase','Flexible','Example cash'],['Annual insurance',n===1?240000:0,'purchase','Annual bills','Example current account'],['Savings transfer',20000,'transfer','Transfers','Example current account'],['Savings received',-20000,'transfer','Transfers','Example savings']].filter(row=>row[1]!==0) as [string,number,Movement,string,string][]);
 w.coverage.push({month,confirmedAt:stamp,accounts:[{name:'Example current account',status:'complete'},{name:'Example cash',status:'complete'},{name:'Example savings',status:'complete'},{name:'Cash / unsupported spending',status:'complete'}]});}
 const cheaper=clone(w.move);cheaper.input.purchase=55000000;
 w.scenarios=[{...clone(w.move),id:'example:move-a',name:'Example £590k purchase'},{...cheaper,id:'example:move-b',name:'Example £550k purchase'}];
 w.transactions.sort((a,b)=>b.date.localeCompare(a.date));return w;
}
export function freshData():AppData{return {version:2,personal:freshWorkspace(),example:exampleWorkspace(),demo:false,preferences:{theme:'system',dynamicColor:false,reduceMotion:false,hideAmounts:false,moveEnabled:true,appLock:false,blockCapture:false}};}
export function active(data:AppData){return data.demo?data.example:data.personal;}
export function switchWorkspace(data:AppData,demo:boolean):AppData{return {...data,demo};}
export function treatmentFits(movement:Movement,amount:number){return movement==='purchase'?amount>=0:movement==='income'||movement==='refund'?amount<=0:true;}
export function applyRules(rows:Transaction[],rules:Rule[]){const ordered=[...rules.filter(r=>r.direction!==undefined),...rules.filter(r=>r.direction===undefined)];return rows.map(t=>{const rule=ordered.find(r=>r.merchant.toLocaleLowerCase()===t.merchant.toLocaleLowerCase()&&(!r.direction||(r.direction==='in'?t.amount<0:t.amount>=0))&&treatmentFits(r.movement,t.amount));return t.movement==='review'&&rule?{...t,movement:rule.movement,category:rule.category}:t;});}
export function effectivePlan(w:Workspace):Plan{return {...w.plan,monthsReviewed:w.coverage.filter(c=>c.month<monthKey()&&!w.transactions.some(t=>t.date.startsWith(c.month)&&t.movement==='review')).length};}
export function moveBudget(w:Workspace,duringOverlap=false){const m=w.move;if(!w.planConfirmedAt||!m.confirmed||!m.housingConfirmed||w.plan.income<=0||w.plan.essentials<m.currentHousing)return null;const replaced=m.housingStops&&(!duringOverlap||m.overlapMonths===0)?m.currentHousing:0;return w.plan.income-w.plan.essentials-w.plan.flexible-w.plan.annualReserve-houseMove(m.input).payment+replaced;}
export function reviewRows(rows:Transaction[],ids:string[],movement:Movement,category:string){const selected=new Set(ids);return rows.map(t=>selected.has(t.id)?{...t,movement,category}:t);}
export function importCounts(existing:Transaction[],incoming:Transaction[]){const prior=new Map(existing.map(t=>[t.id,t]));let added=0,updated=0,unchanged=0;for(const t of incoming){const old=prior.get(t.id);if(!old)added++;else if(old.amount!==t.amount||old.date!==t.date||old.merchant!==t.merchant||old.account!==t.account)updated++;else unchanged++;}return {added,updated,unchanged};}
export function completeImport(outcomes:{status:string}[]){return outcomes.length>0&&outcomes.every(o=>o.status==='success'||o.status==='cached');}

const movements=['purchase','income','transfer','repayment','refund','review'];
const object=(v:unknown):Record<string,any>=>{if(!v||typeof v!=='object'||Array.isArray(v))throw Error('Invalid backup structure.');return v as Record<string,any>;};
const text=(v:unknown,max=500)=>{if(typeof v!=='string'||v.length>max)throw Error('Invalid backup text.');return v;};
const amount=(v:unknown)=>{if(typeof v!=='number'||!Number.isSafeInteger(v)||Math.abs(v)>1e14)throw Error('Invalid backup amount.');return v;};
const list=(v:unknown,max=100000):any[]=>{if(!Array.isArray(v)||v.length>max)throw Error('Invalid backup list.');return v;};
const iso=(v:any)=>{if(v===null)return null;if(typeof v!=='string'||!Number.isFinite(Date.parse(v)))throw Error('Invalid backup date.');return v;};
export function validateWorkspace(input:unknown,prior?:Workspace):Workspace{
 const v=object(input),p=object(v.plan),plan={...emptyPlan} as Plan;
 for(const key of Object.keys(emptyPlan) as (keyof typeof emptyPlan)[]){if(key==='coverageConfirmed'){if(typeof p[key]!=='boolean')throw Error('Invalid coverage confirmation.');(plan as any)[key]=p[key];}else if(!['debtApr','emergencyMonths','horizonYears','investmentPercent'].includes(key)) (plan as any)[key]=amount(p[key]);}
 // Fractional APR and target months are valid; monetary fields remain integer pence.
 for(const key of ['debtApr','emergencyMonths','horizonYears','investmentPercent'] as const){if(typeof p[key]!=='number'||!Number.isFinite(p[key])||p[key]<0||p[key]>100)throw Error('Invalid planning rate.');plan[key]=p[key];}
 if(p.annualTotal!==undefined){plan.annualTotal=amount(p.annualTotal);if(plan.annualTotal<0||Math.round(plan.annualTotal/12)!==plan.annualReserve)throw Error('Annual total and monthly reserve disagree.');}
 if(p.debts!==undefined)plan.debts=list(p.debts,100).map(d=>{if(typeof d.apr!=='number')throw Error('Invalid debt APR.');return {id:text(d.id),name:text(d.name,100),balance:amount(d.balance),apr:d.apr,...(d.minimum!==undefined?{minimum:amount(d.minimum)}:{})};});
 if(p.goals!==undefined)plan.goals=list(p.goals,100).map(g=>({id:text(g.id),name:text(g.name,100),target:amount(g.target),saved:amount(g.saved),months:amount(g.months),...(g.dueMonth!==undefined?{dueMonth:text(g.dueMonth,7)}:{}),...(g.priority!==undefined?{priority:amount(g.priority)}:{}),...(g.funding!==undefined?{funding:g.funding}:{})}));
 plan.debts=debtEntries(plan);plan.goals=goalEntries(plan);
 if(plan.debts.some(d=>(d.minimum??0)<0)||plan.goals.some(g=>(g.priority!==undefined&&(g.priority<1||g.priority>100))||(g.funding!==undefined&&typeof g.funding!=='boolean')))throw Error('Invalid debt minimum or goal priority.');
 unique(plan.debts,'debts');unique(plan.goals,'goals');assess(plan);
 const transactions=prior&&v.transactions===prior.transactions?prior.transactions:list(v.transactions).map(t=>{if(!movements.includes(t.movement)||!/^\d{4}-\d{2}-\d{2}$/.test(t.date)||!Number.isFinite(Date.parse(t.date))||new Date(t.date).toISOString().slice(0,10)!==t.date)throw Error('Invalid backup transaction.');return {id:text(t.id,2000),account:text(t.account),date:t.date,merchant:text(t.merchant),amount:amount(t.amount),movement:t.movement as Movement,category:text(t.category,100)};});
 if((!prior||transactions!==prior.transactions)&&new Set(transactions.map(t=>t.id)).size!==transactions.length)throw Error('Duplicate transaction identities in backup.');
 const readMove=(value:any):MoveState=>{
  const m=object(value),source=object(m.input),h=clone(initialHouse);
  const copyShape=(from:Record<string,any>,to:Record<string,any>)=>{if(Object.keys(from).some(k=>!(k in to)))throw Error('Unknown move assumption.');for(const key of Object.keys(to)){if(typeof to[key]==='object')copyShape(object(from[key]),to[key]);else{if(typeof from[key]!==typeof to[key])throw Error('Invalid move assumption type.');to[key]=from[key];}}};
  copyShape(source,h);houseMove(h);
  const legacy=m.currentHousing===undefined,currentHousing=amount(legacy?m.currentMortgage:m.currentHousing),housingConfirmed=legacy?false:m.housingConfirmed,housingType=legacy?'mortgage':m.housingType,housingStops=legacy?true:m.housingStops,overlapMonths=legacy?0:amount(m.overlapMonths);
  if(typeof m.confirmed!=='boolean'||typeof housingConfirmed!=='boolean'||currentHousing<0||typeof housingStops!=='boolean'||!['mortgage','rent','none'].includes(housingType)||overlapMonths<0||overlapMonths>120||!['required','fixed'].includes(h.loanMode)||!['homebuyer','structural','custom'].includes(h.fees.surveyTier)||h.annualRate>97)throw Error('Invalid move assumptions.');
  if(housingType==='none'&&currentHousing!==0)throw Error('No current housing payment must have a zero amount.');
  if(m.provenance!==undefined&&!['personal','example-template','existing'].includes(m.provenance))throw Error('Invalid move input origin.');
  return {provenance:m.provenance??'existing',input:h,confirmed:m.confirmed,currentHousing,housingConfirmed,housingType,housingStops,overlapMonths};
 };
 const coverage=prior&&v.coverage===prior.coverage?prior.coverage:list(v.coverage,1200).map(c=>{if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(c.month)||c.month>=monthKey()||!c.confirmedAt)throw Error('Invalid completed month.');const accounts=c.accounts===undefined?undefined:list(c.accounts,200).map(a=>{if(!['complete','noActivity'].includes(a.status))throw Error('Invalid account coverage.');return {name:text(a.name),status:a.status as 'complete'|'noActivity'};});if(accounts&&(accounts.some(a=>!a.name.trim())||new Set(accounts.map(a=>a.name)).size!==accounts.length))throw Error('Duplicate or empty coverage accounts.');return {month:c.month,confirmedAt:iso(c.confirmedAt)!,...(accounts?{accounts}:{})};});
 if(new Set(coverage.map(c=>c.month)).size!==coverage.length)throw Error('Duplicate covered months.');
 if(!Array.isArray(v.rules)||v.rules.length>1000)throw Error('A workspace supports at most 1,000 merchant rules. Remove unused rules before adding more.');
 const rules=prior&&v.rules===prior.rules?prior.rules:list(v.rules,1000).map(r=>{if(!movements.includes(r.movement)||r.movement==='review')throw Error('Invalid merchant rule.');return {id:text(r.id),merchant:text(r.merchant),movement:r.movement as Movement,category:text(r.category,100),...(r.direction!==undefined?{direction:r.direction as 'in'|'out'}:{})};});
 const move=prior&&v.move===prior.move?prior.move:readMove(v.move);
 const scenarios=prior&&v.scenarios===prior.scenarios?prior.scenarios:list(v.scenarios,30).map(s=>({...readMove(s),id:text(s.id),name:text(s.name,100)}));
 if(rules.some(r=>r.direction!==undefined&&!['in','out'].includes(r.direction)))throw Error('Invalid rule direction.');
 unique(rules,'merchant rules');unique(scenarios,'scenarios');
 const result={plan,transactions,lastSync:iso(v.lastSync),planConfirmedAt:iso(v.planConfirmedAt),onboardingStep:Math.max(0,Math.min(4,amount(v.onboardingStep))),coverage,rules,move,scenarios};
 const extra:Partial<Workspace>={};
 if(v.exampleStep!==undefined){const step=amount(v.exampleStep);if(step<0||step>4)throw Error('Invalid example guide step.');extra.exampleStep=step;}
 if(v.setupSkipped!==undefined){extra.setupSkipped=list(v.setupSkipped,3).map(amount);if(extra.setupSkipped.some(n=>n<0||n>2)||new Set(extra.setupSkipped).size!==extra.setupSkipped.length)throw Error('Invalid setup checklist.');}
 if(v.syncReceipt!==undefined){const r=object(v.syncReceipt);if(!['complete','partial','failed'].includes(r.status))throw Error('Invalid import receipt.');const outcomes=list(r.outcomes,100).map(o=>{if(!['success','cached','partial','failed','expired'].includes(o.status))throw Error('Invalid import outcome.');const count=amount(o.count);if(count<0)throw Error('Invalid import count.');return {id:text(o.id),provider:text(o.provider),status:o.status,lastSync:iso(o.lastSync),count};});
 const counts={added:amount(r.added),updated:amount(r.updated),unchanged:amount(r.unchanged)};if(Object.values(counts).some(n=>n<0)||!r.attemptedAt||!r.finishedAt)throw Error('Invalid import receipt.');extra.syncReceipt={...counts,attemptedAt:iso(r.attemptedAt)!,finishedAt:iso(r.finishedAt)!,status:r.status,warnings:list(r.warnings,200).map(x=>text(x,4000)),outcomes};}
 const checked={...result,...extra};assertBackupSize(checked);return checked;
}
function unique(rows:{id:string}[],label:string){if(rows.some(r=>!r.id.trim())||new Set(rows.map(r=>r.id)).size!==rows.length)throw Error('Duplicate or empty identities in '+label+'.');}
export const BACKUP_LIMIT=20_000_000;
export function utf8Bytes(s:string){let bytes=0;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);if(c<128)bytes++;else if(c<2048)bytes+=2;else if(c>=0xd800&&c<=0xdbff&&s.charCodeAt(i+1)>=0xdc00&&s.charCodeAt(i+1)<=0xdfff){bytes+=4;i++;}else bytes+=3;}return bytes;}
// Mutation paths preserve immutable array references, so small plan edits reuse sizes.
const partSizes=new WeakMap<object,number>();
function partBytes(value:unknown){if(value&&typeof value==='object'){const cached=partSizes.get(value);if(cached!==undefined)return cached;const size=utf8Bytes(JSON.stringify(value));partSizes.set(value,size);return size;}return utf8Bytes(JSON.stringify(value));}
function assertBackupSize(w:Workspace){const entries=Object.entries(w);const bytes=2+Math.max(0,entries.length-1)+entries.reduce((n,[key,value])=>n+utf8Bytes(JSON.stringify(key))+1+partBytes(value),0);if(bytes+128>BACKUP_LIMIT)throw Error('This workspace exceeds the 20 MB backup limit. Export your existing data before adding more.');}
export function exportBackup(w:Workspace){const checked=validateWorkspace(w);const raw=JSON.stringify({format:'headroom-backup',version:2,exportedAt:new Date().toISOString(),workspace:checked});if(utf8Bytes(raw)>BACKUP_LIMIT)throw Error('This workspace exceeds the 20 MB backup limit.');return raw;}
export function parseBackup(raw:string):Workspace{if(utf8Bytes(raw)>BACKUP_LIMIT)throw Error('Backup exceeds 20 MB.');let parsed;try{parsed=JSON.parse(raw);}catch{throw Error('This file is not valid JSON. Choose an exported Headroom backup.');}const v=object(parsed);if(v.format!=='headroom-backup'||v.version!==2)throw Error('Choose a Headroom version 2 backup.');return validateWorkspace(v.workspace);}

export function anchorGoalDates(w:Workspace){const anchor=monthKey(w.planConfirmedAt?new Date(w.planConfirmedAt):new Date());w.plan={...w.plan,goals:goalEntries(w.plan).map(g=>({...g,dueMonth:g.dueMonth??shiftMonth(anchor,g.months)}))};return w;}
export function migrateLegacy(saved:any,oldHouse?:any):AppData{
 const d=freshData();if(!saved)saved={plan:emptyPlan,transactions:[],demo:false,lastSync:null};
 if(saved.version!==undefined&&saved.version!==2)throw Error('Saved data uses an unsupported version.');
 if(saved.version===2){d.personal=anchorGoalDates(validateWorkspace(saved.personal));d.example=anchorGoalDates(validateWorkspace(saved.example));d.demo=saved.demo===true;const p=object(saved.preferences);if(['system','light','dark'].includes(p.theme))d.preferences.theme=p.theme;for(const k of ['dynamicColor','reduceMotion','hideAmounts','moveEnabled','appLock','blockCapture'] as const)if(typeof p[k]==='boolean')d.preferences[k]=p[k];return d;}
 const w=freshWorkspace();w.move.provenance='example-template';w.move.input=clone(initialHouse);w.move.currentHousing=136578;w.move.housingType='mortgage';w.move.housingStops=true;w.plan={...emptyPlan,...saved.plan};assess(w.plan);w.plan.monthsReviewed=0;w.plan.coverageConfirmed=false;w.transactions=saved.transactions||[];w.lastSync=saved.lastSync||null;
 if(oldHouse){w.move={input:oldHouse.house||oldHouse,currentHousing:oldHouse.currentMortgage??136578,housingType:'mortgage',housingStops:true,overlapMonths:0,confirmed:false,housingConfirmed:false};houseMove(w.move.input);}
 const checked=anchorGoalDates(validateWorkspace(w));if(saved.demo){d.example=checked;d.demo=true;if(oldHouse)d.personal.move=clone(checked.move);}else d.personal=checked;return d;
}
