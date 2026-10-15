import type {RecordRow} from './transactions';
export interface ReviewRecord extends RecordRow {pattern:string;note:string;source?:string;}
 export const categories=['Unsure','Groceries','Clothing','Olivia & family','Home','Gifts','Eating out','Travel','Health','Mortgage','Bills','Subscriptions','Activities','Fees','Other'];
 export const patterns=['review','usual','oneoff','annual','transfer','refund'];
 export const normal=(r:ReviewRecord)=>r.pattern==='usual'?Math.max(0,r.amount):r.pattern==='annual'?Math.max(0,r.amount)/12:0;
 export function valid(r:ReviewRecord){return r&&typeof r.id==='string'&&r.id.length<1000&&typeof r.merchant==='string'&&r.merchant.length<500&&Number.isFinite(r.amount)&&Math.abs(r.amount)<1e9&&typeof r.month==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(r.month)&&typeof r.account==='string'&&typeof r.date==='string'&&['aggregate','transaction'].includes(r.kind)&&categories.includes(r.category)&&patterns.includes(r.pattern)&&typeof r.note==='string'&&r.note.length<=1000;}
 export function parseCSV(text:string){
  const rows:string[][]=[];let row:string[]=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell='';}else cell+=c;}
  if(quoted)throw Error('A quoted CSV field is unfinished.');row.push(cell);if(row.some(x=>x.trim()))rows.push(row);return rows;
 }
 export function dateValue(s:string){s=s.trim();let m: string[]|null=s.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/);if(!m){const uk=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(uk)m=Object.assign(["",uk[3],uk[2].padStart(2,'0'),uk[1].padStart(2,'0')],{index:0,input:s});}if(!m)throw Error('Use dates in YYYY-MM-DD or DD/MM/YYYY format.');const value=`${m[1]}-${m[2]}-${m[3]}`;const d=new Date(value+'T00:00:00Z');if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==value)throw Error('The CSV contains an invalid date.');return value;}
 export function transactions(text:string,account:string,sign:string){
  const rows=parseCSV(text.replace(/^\uFEFF/,''));if(rows.length<2)throw Error('The CSV needs headers and transaction rows.');
  const heads=rows.shift()!.map(x=>x.trim().toLowerCase());const find=(names:string[])=>heads.findIndex(x=>names.includes(x));const di=find(['date','transaction date','posted date']),mi=find(['merchant','description','payee','transaction description']),ai=find(['amount','transaction amount']);
  if([di,mi,ai].includes(-1))throw Error('CSV headers must include Date, Description (or Merchant), and Amount.');
  const counts=new Map<string,number>();return rows.map((cells,i)=>{if(cells.length!==heads.length)throw Error(`Row ${i+2} has the wrong number of columns.`);const date=dateValue(cells[di]);const merchant=cells[mi].trim();const raw=cells[ai].trim().replace(/[£,\s]/g,'');if(!/^-?\d+(\.\d{1,2})?$/.test(raw)||!merchant)throw Error(`Check the merchant and amount on row ${i+2}.`);const amount=Number(raw)*(sign==='negative'?-1:1);const key=JSON.stringify([account,date,merchant,amount]);const count=(counts.get(key)||0)+1;counts.set(key,count);const id='tx:'+key+':'+count;const r:ReviewRecord={id,merchant,date,month:date.slice(0,7),account,amount,kind:'transaction',source:'Statement CSV',category:'Unsure',flow:'review',pattern:'review',note:''};if(!valid(r))throw Error(`Invalid data on row ${i+2}.`);return r;});
 }
