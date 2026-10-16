import type {Transaction} from './finance';
import {parseCSV,dateValue} from './calculators/review';

export const accountKinds=['unknown','cash','current','savings','credit card','loan','mortgage','investment','pension'] as const;
export type Account={id:string;name:string;kind:typeof accountKinds[number];currency:'GBP';group:'personal'|'joint'|'business';institution:string;included:boolean;archived:boolean};
export type BalanceSnapshot={id:string;accountId:string;current:number;available?:number;asOf:string;source:'manual'|'provider'};
export type Annotation={transactionId:string;note:string;tags:string[];alias:string;receipts:{name:string;reference:string}[];splits:{category:string;amount:number}[]};
export type ImportReceipt={id:string;at:string;transactionIds:string[];accountId:string};
export type Ledger={csvMappings?:{accountId:string;mapping:CsvMapping}[];version:1;accounts:Account[];balances:BalanceSnapshot[];annotations:Annotation[];imports:ImportReceipt[]};
export const emptyLedger=():Ledger=>({version:1,accounts:[],balances:[],annotations:[],imports:[]});
export const legacyAccountId=(name:string)=>'local:'+encodeURIComponent(name);
export const money=(v:unknown):number=>{if(typeof v!=='number'||!Number.isSafeInteger(v)||Math.abs(v)>1e14)throw Error('Use an integer amount in pence.');return v;};
const text=(v:unknown,max=500):string=>{if(typeof v!=='string'||v.length>max)throw Error('Invalid ledger text.');return v;};
const array=(v:unknown):any[]=>{if(!Array.isArray(v)||v.length>100000)throw Error('Invalid ledger list.');return v;};
const identity=(v:unknown)=>{const s=text(v,2000);if(!s.trim())throw Error('Missing ledger identity.');return s;};
const unique=(rows:{id:string}[])=>{if(new Set(rows.map(r=>r.id)).size!==rows.length)throw Error('Duplicate ledger identity.');};
const stamp=(v:unknown)=>{const s=text(v);if(!Number.isFinite(Date.parse(s)))throw Error('Invalid balance date.');return s;};
export function validateLedger(raw:unknown,transactions:Transaction[]):Ledger{
 const v=raw as Ledger|undefined;if(v&&v.version!==1)throw Error('Unsupported ledger version.');
 const l:Ledger=v?{version:1,accounts:array(v.accounts).map(a=>{if(!accountKinds.includes(a.kind)||a.currency!=='GBP'||!['personal','joint','business'].includes(a.group)||typeof a.included!=='boolean'||typeof a.archived!=='boolean')throw Error('Invalid account.');return {id:identity(a.id),name:identity(a.name),kind:a.kind,currency:'GBP',group:a.group,institution:text(a.institution),included:a.included,archived:a.archived};}),balances:[],annotations:[],imports:[]}:emptyLedger();
 unique(l.accounts);if(new Set(l.accounts.map(a=>a.name)).size!==l.accounts.length)throw Error('Account names must be unique.');
 // Historical account labels are retained as stable local identities; no invented balance.
 for(const t of transactions)if(!l.accounts.some(a=>a.name===t.account))l.accounts.push({id:legacyAccountId(t.account),name:t.account,kind:'unknown',currency:'GBP',group:'personal',institution:'',included:true,archived:false});
 unique(l.accounts);
 if(!v)return l;
 const accounts=new Set(l.accounts.map(a=>a.id)),rows=new Map(transactions.map(t=>[t.id,t]));
 l.balances=array(v.balances).map(b=>{if(!accounts.has(b.accountId)||!['manual','provider'].includes(b.source))throw Error('Invalid balance account or source.');return {id:identity(b.id),accountId:b.accountId,current:money(b.current),...(b.available!==undefined?{available:money(b.available)}:{}),asOf:stamp(b.asOf),source:b.source};});unique(l.balances);
 l.annotations=array(v.annotations).map(a=>{const parent=rows.get(a.transactionId);if(!parent)throw Error('Annotation has no transaction.');const splits=array(a.splits).map(s=>({category:identity(s.category),amount:money(s.amount)}));if(splits.length&&(splits.some(s=>s.amount!==0&&Math.sign(s.amount)!==Math.sign(parent.amount))||splits.reduce((n,s)=>money(n+s.amount),0)!==parent.amount))throw Error('Splits must have the parent direction and sum to its amount.');return {transactionId:parent.id,note:text(a.note,4000),tags:array(a.tags).map(t=>identity(t)),alias:text(a.alias),receipts:array(a.receipts).map(r=>({name:identity(r.name),reference:identity(r.reference)})),splits};});
 if(new Set(l.annotations.map(a=>a.transactionId)).size!==l.annotations.length)throw Error('Duplicate transaction annotation.');
 l.imports=array(v.imports).map(r=>{if(!accounts.has(r.accountId))throw Error('Import account missing.');const ids=array(r.transactionIds).map(identity);if(new Set(ids).size!==ids.length)throw Error('Duplicate import transaction.');return {id:identity(r.id),at:stamp(r.at),accountId:r.accountId,transactionIds:ids};});unique(l.imports);
 if(v.csvMappings!==undefined)l.csvMappings=array(v.csvMappings).map(r=>{if(!accounts.has(r.accountId)||typeof r.mapping?.negativeDebits!=='boolean')throw Error('Invalid saved CSV mapping.');return {accountId:r.accountId,mapping:{date:identity(r.mapping.date),merchant:identity(r.mapping.merchant),amount:identity(r.mapping.amount),credit:text(r.mapping.credit??''),negativeDebits:r.mapping.negativeDebits}};});
 return l;
}
export function latestBalance(l:Ledger,id:string,now=Date.now()){
 const b=l.balances.filter(b=>b.accountId===id).sort((a,b)=>Date.parse(b.asOf)-Date.parse(a.asOf))[0];
 return {snapshot:b,status:!b?'unknown':Date.parse(b.asOf)>now?'future':now-Date.parse(b.asOf)>86400000?'stale':'current'};
}
export function pounds(raw:string){const s=raw.trim().replace(/£/g,'');if(!/^-?\d+(?:\.\d{1,2})?$/.test(s))throw Error('Use pounds with at most two decimal places (no thousands separators).');const [whole,fraction='']=s.replace('-','').split('.');return money((Number(whole)*100+Number(fraction.padEnd(2,'0')))*(s.startsWith('-')?-1:1));}
export type CsvMapping={date:string;merchant:string;amount:string;credit?:string;negativeDebits:boolean};
export function previewCsv(raw:string,account:Account,existing:Transaction[],mapping:CsvMapping){
 if(raw.length>20000000)throw Error('CSV exceeds 20 MB.');if(account.archived)throw Error('Choose an active account.');
 const table=parseCSV(raw.replace(/^\uFEFF/,'')),heads=table.shift()??[];
 const index=(name:string)=>{const matches=heads.map((h,i)=>h.trim()===name?i:-1).filter(i=>i>=0);if(matches.length!==1)throw Error('Choose one unique column: '+name);return matches[0];};
 const d=index(mapping.date),m=index(mapping.merchant),a=index(mapping.amount),c=mapping.credit?index(mapping.credit):-1;
 const known=new Set(existing.map(t=>JSON.stringify([t.account,t.date,t.merchant,t.amount]))),counts=new Map<string,number>(),existingIds=new Set(existing.map(t=>t.id));let duplicates=0;
 const rows=table.map((r,i)=>{if(r.length!==heads.length)throw Error('Wrong column count on row '+(i+2));const date=dateValue(r[d]);if(date>new Date().toISOString().slice(0,10))throw Error('Future CSV transaction on row '+(i+2));const merchant=identity(r[m].trim());let amount=c>=0?pounds(r[a]||'0')-pounds(r[c]||'0'):pounds(r[a])*(mapping.negativeDebits?-1:1);if(c>=0&&(pounds(r[a]||'0')<0||pounds(r[c]||'0')<0||(pounds(r[a]||'0')>0&&pounds(r[c]||'0')>0)))throw Error('Use a debit or credit on each row.');const key=JSON.stringify([account.name,date,merchant,amount]),n=(counts.get(key)??0)+1;counts.set(key,n);if(known.has(key))duplicates++;return {id:'csv:'+JSON.stringify([account.id,date,merchant,amount,n]),account:account.name,date,merchant,amount,movement:'review' as const,category:'Uncategorised'};});
 return {rows,duplicates,add:rows.filter(t=>!known.has(JSON.stringify([t.account,t.date,t.merchant,t.amount]))&&!existingIds.has(t.id))};
}
const cell=(s:string)=>'"'+(/^[=+@\-\t\r]/.test(s)?"'"+s:s).replace(/"/g,'""')+'"';
export function exportCsv(rows:Transaction[]){return 'Date,Merchant,Amount,Account,Category,Movement\r\n'+rows.map(t=>[cell(t.date),cell(t.merchant),(t.amount/100).toFixed(2),cell(t.account),cell(t.category),cell(t.movement)].join(',')).join('\r\n');}
export const providerCapabilities={bookedGBP:true,pending:false,balances:false,scheduledRefresh:false,historyDays:180,notes:'Exact bank/card coverage depends on consent and provider permissions. Missing balances are unknown.'};
