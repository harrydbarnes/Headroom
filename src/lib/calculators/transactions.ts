import {pence} from './money';
/** Compatibility boundary: transaction amounts in GBP, converted to integer pence internally. */
export interface RecordRow {id:string;kind:'transaction'|'aggregate';account:string;date:string;month:string;amount:number;flow:string;merchant:string;category:string;pattern?:string;note?:string;statementId?:string;matchedTo?:string;refundOf?:string;}
export interface Account {id:string;name:string;type:string;}
export interface Statement {id:string;account:string;start:string;end:string;opening:number;closing:number;inflow:number;outflow:number;complete?:boolean;}
 export const flows=['review','spend','income','transfer','repayment','refund','savings','restricted'];
 export const cents=(n:number)=>pence(n);
 export const sum=(rows:RecordRow[])=>rows.reduce((total,r)=>total+cents(r.amount),0)/100;
 export const monthBounds=(month:string)=>{const [y,m]=month.split('-').map(Number);return [month+'-01',new Date(Date.UTC(y,m,0)).toISOString().slice(0,10)];};
 export function statementCheck(statement:Statement,records:RecordRow[],accounts:Account[]){
  const rows=records.filter(r=>r.kind==='transaction'&&r.statementId===statement.id);
  const account=accounts.find(a=>a.id===statement.account||a.name===statement.account);
  const opening=cents(statement.opening),closing=cents(statement.closing);
  const cashIn=-sum(rows.filter(r=>r.amount<0)),cashOut=sum(rows.filter(r=>r.amount>0));
  const calculated=opening+(account?.type==='card'?1:-1)*cents(sum(rows));
  const mismatch=Math.abs(calculated-closing)>0||Math.abs(cents(cashIn)-cents(statement.inflow))>0||Math.abs(cents(cashOut)-cents(statement.outflow))>0;
  const valid=!!account&&Number.isFinite(opening)&&Number.isFinite(closing)&&Number.isFinite(cents(statement.inflow))&&Number.isFinite(cents(statement.outflow))&&rows.length>0&&!mismatch&&rows.every(r=>r.account===account.name&&r.date>=statement.start&&r.date<=statement.end);
  return {valid,count:rows.length,cashIn,cashOut,calculated:calculated/100,difference:(calculated-closing)/100};
 }
 export function coverage(month:string,statements:Statement[],records:RecordRow[],accounts:Account[],required:string[]){
  const [start,end]=monthBounds(month);
  return required.map(name=>{
   const account=accounts.find(a=>a.name===name||a.id===name);
   const evidence=account?statements.filter(s=>s.account===account.id||s.account===account.name):[];
   const periods=evidence.filter(s=>s.complete&&statementCheck(s,records,accounts).valid).sort((a,b)=>a.start.localeCompare(b.start));
   let coveredUntil=start;let complete=false;
   for(const s of periods){if(s.end<coveredUntil)continue;if(s.start>coveredUntil)break;if(s.end>=end){complete=true;break;}coveredUntil=new Date(new Date(s.end+'T00:00:00Z').getTime()+86400000).toISOString().slice(0,10);}
   return {name,complete,hasRows:records.some(r=>r.kind==='transaction'&&r.account===(account?.name||name)&&r.month===month),evidence};
  });
 }
 export function matchingCandidates(records:RecordRow[]){
  const transfers=records.filter(r=>r.kind==='transaction'&&['transfer','repayment','savings','restricted'].includes(r.flow)&&!r.matchedTo);
  const proposals=[];const processed=new Set();
  for(const debit of transfers.filter(r=>r.amount>0)){
   const credits=transfers.filter(r=>r.account!==debit.account&&cents(r.amount)===-cents(debit.amount)&&Math.abs(new Date(r.date).getTime()-new Date(debit.date).getTime())<=3*86400000&&r.flow===debit.flow);
   if(credits.length!==1)continue;const credit=credits[0];
   const reverse=transfers.filter(r=>r.account!==credit.account&&cents(r.amount)===-cents(credit.amount)&&Math.abs(new Date(r.date).getTime()-new Date(credit.date).getTime())<=3*86400000&&r.flow===credit.flow);
   if(reverse.length!==1||processed.has(credit.id))continue;
   proposals.push({debit,credit});processed.add(credit.id);
  }
  return proposals;
 }
 export function validMatch(r:RecordRow,records:RecordRow[]){const other=records.find(x=>x.id===r.matchedTo);return !!other&&other.matchedTo===r.id&&other.account!==r.account&&cents(r.amount)===-cents(other.amount)&&r.flow===other.flow&&Math.abs(new Date(r.date).getTime()-new Date(other.date).getTime())<=3*86400000;}
 export function monthly(month:string,records:RecordRow[],statements:Statement[],accounts:Account[],required:string[]){
  const rows=records.filter(r=>r.kind==='transaction'&&r.month===month);
  const bank=(r:RecordRow)=>accounts.find(a=>a.name===r.account||a.id===r.account)?.type!=='card';
  const income=-sum(rows.filter(r=>bank(r)&&r.amount<0&&r.flow==='income'));
  const grossSpend=sum(rows.filter(r=>r.amount>0&&r.flow==='spend'));
  const linkedRefunds=rows.filter(r=>r.amount<0&&r.flow==='refund'&&r.refundOf&&records.some(p=>p.id===r.refundOf&&p.flow==='spend'&&p.amount>0&&p.account===r.account));
  // Cap total linked credits at the original purchase, including credits in other months.
  const validRefunds=linkedRefunds.filter(r=>{const purchase=records.find(p=>p.id===r.refundOf);return -sum(records.filter(x=>x.refundOf===purchase!.id&&x.flow==='refund'&&x.amount<0))<=purchase!.amount;});
  const refunds=-sum(validRefunds),netSpend=grossSpend-refunds;
  const unknown=rows.filter(r=>r.flow==='review'||!flows.includes(r.flow)||r.flow==='refund'&&!validRefunds.includes(r)||r.flow==='spend'&&r.amount<0||r.flow==='income'&&r.amount>0);
  const unmatched=rows.filter(r=>['transfer','repayment','savings'].includes(r.flow)&&!validMatch(r,records));
  const savings=sum(rows.filter(r=>r.flow==='savings'&&accounts.find(a=>a.name===r.account||a.id===r.account)?.type!=='savings'));
  const check=coverage(month,statements,records,accounts,required);
  const complete=required.length>0&&check.every(c=>c.complete)&&unknown.length===0&&unmatched.length===0;
  const byCategory:Record<string,number>={};for(const r of rows.filter(r=>r.flow==='spend'&&r.amount>0))byCategory[r.category]=(cents(byCategory[r.category]||0)+cents(r.amount))/100;for(const r of validRefunds){const p=records.find(p=>p.id===r.refundOf);byCategory[p!.category]=(cents(byCategory[p!.category]||0)+cents(r.amount))/100;}
  return {rows,income,grossSpend,refunds,netSpend,savings,remaining:income-netSpend-savings,generated:income-netSpend,cashIn:-sum(rows.filter(r=>bank(r)&&r.amount<0)),cashOut:sum(rows.filter(r=>bank(r)&&r.amount>0)),restrictedIn:-sum(rows.filter(r=>r.flow==='restricted'&&r.amount<0)),restrictedOut:sum(rows.filter(r=>r.flow==='restricted'&&r.amount>0)),unknown,unmatched,coverage:check,complete,byCategory};
 }
