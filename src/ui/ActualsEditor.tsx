import {counts} from '../strings/format';
import {displayMessage} from '../strings/messages';
import {planCopy} from '../strings/plan';
import {formatMonth} from '../lib/dates';
import {counted} from '../strings/format';
import {toUserMessage} from '../strings/errors';
import React,{useRef,useState} from 'react';
import {Text,View} from 'react-native';
import {actualsPreview} from '../lib/reconciliation';
import {monthKey,shiftMonth} from '../lib/workspace';
import {useWorkspace} from '../state/hooks';
import {Button,Card,Copy,focusNative,Line,Money,Notice,Sheet,Toggle} from './components';
import {MonthChooser} from './MonthChooser';
import {styles as s} from './theme';
export function ActualsEditor(){
 const store=useWorkspace(),w=store.workspace,[month,setMonth]=useState(shiftMonth(monthKey(),-1)),[preview,setPreview]=useState<ReturnType<typeof actualsPreview>|null>(null),[excludeOther,setExcludeOther]=useState(false),[excludeAnnual,setExcludeAnnual]=useState(false);
 const [monthsOpen,setMonthsOpen]=useState(false);
 const titleRef=useRef<Text>(null);
 const current=actualsPreview(w,month),sum=(rows:{amount:number}[])=>rows.reduce((n,t)=>n+t.amount,0);
 return <><Card title={planCopy.useReviewedSpending} titleRef={titleRef}><View style={s.row}><Button secondary title={planCopy.previousMonth} onPress={()=>setMonth(shiftMonth(month,-1))}/><Button secondary title={formatMonth(month)+planCopy.chooseMonth} onPress={()=>setMonthsOpen(true)}/><Button secondary title={planCopy.nextMonth} disabled={month>=shiftMonth(monthKey(),-1)} onPress={()=>setMonth(shiftMonth(month,1))}/></View><Line label={planCopy.categorisedEssentials} value={<Money value={current.essentials}/>}/><Line label={planCopy.categorisedFlexible} value={<Money value={current.flexible}/>}/><Copy small>{planCopy.actualsPreviewHelp(counts.includedSpendingTransaction(current.included.length),counts.excludedTransaction(current.excludedCount))}</Copy>{current.reasons.map(reason=><Copy small key={reason}>{displayMessage(reason)}</Copy>)}<Button secondary title={planCopy.reviewProposedBaselineChange} onPress={()=>{setExcludeOther(false);setExcludeAnnual(false);setPreview(actualsPreview(w,month));store.dismissMutationError();}}/></Card>
 <MonthChooser visible={monthsOpen} onClose={()=>setMonthsOpen(false)} rows={w.transactions} onChoose={setMonth}/>
 <Sheet returnFocus={()=>focusNative(titleRef.current)} visible={preview!==null} onClose={()=>setPreview(null)} title={planCopy.reviewProposedBaselineChange}>{preview&&<>
  <Copy strong>{planCopy.actualsSourceMonth(formatMonth(preview.month))}</Copy><Line label={planCopy.essentialsNowAndProposed} value={<><Money value={w.plan.essentials}/>{" → "}<Money value={preview.essentials}/></>}/><Line label={planCopy.flexibleNowAndProposed} value={<><Money value={w.plan.flexible}/>{" → "}<Money value={preview.flexible}/></>}/><Line label={planCopy.annualReserveStays} value={<Money value={w.plan.annualReserve}/>}/>
  <Copy>{planCopy.includedSummary(preview.included.length,preview.excludedCount)}</Copy>
  {preview.reasons.map(reason=><Notice key={reason}>{displayMessage(reason)}</Notice>)}
  {preview.unresolved.length>0&&<Copy>{planCopy.categoryActionHelp(counts.spendingTransaction(preview.unresolved.length),preview.unresolved.length===1?planCopy.needs:planCopy.need)}</Copy>}
  {preview.other.length>0&&<><Line label={planCopy.excludedAccountLabel(counts.otherSpendingTransaction(preview.other.length))} value={<Money precise value={sum(preview.other)}/>}/><Copy small>{planCopy.categoryReviewHelp([...new Set(preview.other.map(t=>t.category))].join(', '))}</Copy><Toggle label={planCopy.iHaveCheckedLabel} value={excludeOther} onChange={setExcludeOther}/></>}
  {preview.annual.length>0&&<><Line label={planCopy.excludedAccountLabel(counts.annualBillTransaction(preview.annual.length))} value={<Money precise value={sum(preview.annual)}/>}/><Toggle label={planCopy.excludeTheseAnnualLabel} value={excludeAnnual} onChange={setExcludeAnnual}/></>}
  <Copy small>{planCopy.incomeTransfersDebtDetail}</Copy>
  {store.mutationError&&<Notice error>{toUserMessage(store.mutationError)}</Notice>}
  <Button title={planCopy.applySpendingAmounts} disabled={preview.reasons.length>0||preview.other.length>0&&!excludeOther||preview.annual.length>0&&!excludeAnnual} onPress={()=>{if(store.applyActuals(preview.month,preview.signature,excludeOther,excludeAnnual))setPreview(null);}}/>
  <Copy small>{planCopy.leavesBaselineUnconfirmText}</Copy>
 </>}</Sheet></>;
}
