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
 return <><Card title="Build a baseline from reviewed actuals" titleRef={titleRef}><View style={s.row}><Button secondary title="Previous month" onPress={()=>setMonth(shiftMonth(month,-1))}/><Button secondary title={month+' · choose month'} onPress={()=>setMonthsOpen(true)}/><Button secondary title="Next month" disabled={month>=shiftMonth(monthKey(),-1)} onPress={()=>setMonth(shiftMonth(month,1))}/></View><Line label="Categorised essentials" value={<Money value={current.essentials}/>}/><Line label="Categorised flexible" value={<Money value={current.flexible}/>}/><Copy small>{current.included.length} included spending transactions · {current.excludedCount} excluded transactions. Nothing changes until you review the comparison.</Copy>{current.reasons.map(reason=><Copy small key={reason}>{reason}</Copy>)}<Button secondary title="Review proposed baseline change" onPress={()=>{setExcludeOther(false);setExcludeAnnual(false);setPreview(actualsPreview(w,month));store.dismissMutationError();}}/></Card>
 <MonthChooser visible={monthsOpen} onClose={()=>setMonthsOpen(false)} rows={w.transactions} onChoose={setMonth}/>
 <Sheet returnFocus={()=>focusNative(titleRef.current)} visible={preview!==null} onClose={()=>setPreview(null)} title="Review baseline change">{preview&&<>
  <Copy strong>Source month: {preview.month}</Copy><Line label="Essentials now → proposed" value={<><Money value={w.plan.essentials}/> → <Money value={preview.essentials}/></>}/><Line label="Flexible now → proposed" value={<><Money value={w.plan.flexible}/> → <Money value={preview.flexible}/></>}/><Line label="Annual reserve stays" value={<Money value={w.plan.annualReserve}/>}/>
  <Copy>{preview.included.length} purchases/refunds in Essentials and Flexible are included. {preview.excludedCount} other transactions are excluded.</Copy>
  {preview.reasons.map(reason=><Notice key={reason}>{reason}</Notice>)}
  {preview.unresolved.length>0&&<Copy>{preview.unresolved.length} spending transactions need a category in Activity before you can apply this.</Copy>}
  {preview.other.length>0&&<><Line label={`${preview.other.length} other spending transactions excluded`} value={<Money precise value={sum(preview.other)}/>}/><Copy small>Categories: {[...new Set(preview.other.map(t=>t.category))].join(', ')}. Recategorise these in Activity if they belong in your baseline.</Copy><Toggle label="I have checked this Other spending and want to exclude it" value={excludeOther} onChange={setExcludeOther}/></>}
  {preview.annual.length>0&&<><Line label={`${preview.annual.length} annual-bill transactions excluded`} value={<Money precise value={sum(preview.annual)}/>}/><Toggle label="Exclude these annual bills and retain my existing monthly annual reserve" value={excludeAnnual} onChange={setExcludeAnnual}/></>}
  <Copy small>Income, transfers and debt repayments are not used to replace these spending categories. Check that debt minimums and housing are correctly categorised.</Copy>
  {store.mutationError&&<Notice error>{store.mutationError}</Notice>}
  <Button title="Apply these two spending amounts" disabled={preview.reasons.length>0||preview.other.length>0&&!excludeOther||preview.annual.length>0&&!excludeAnnual} onPress={()=>{if(store.applyActuals(preview.month,preview.signature,excludeOther,excludeAnnual))setPreview(null);}}/>
  <Copy small>This leaves the baseline unconfirmed. Review the edited plan and confirm it when complete.</Copy>
 </>}</Sheet></>;
}
