import {planCopy} from '../strings/plan';
import React from 'react';
import {Alert,View} from 'react-native';
import type {Debt,Plan} from '../lib/finance';
import {debtEntries,id} from '../lib/workspace';
import {Button,Copy,Field,Input} from './components';
export function DebtFields({plan,onChange}:{plan:Plan;onChange:(debts:Debt[])=>void}){
 const debts=debtEntries(plan);
 const patch=(key:string,change:Partial<Debt>)=>onChange(debts.map(d=>d.id===key?{...d,...change}:d));
 return <>{debts.length===0&&<Copy>{planCopy.emptyDebts}</Copy>}{debts.map(d=><View key={d.id} style={{gap:12}}><Input label={planCopy.debtName} value={d.name} maxLength={100} onChangeText={name=>patch(d.id,{name})}/><Field label={planCopy.debtBalance} value={d.balance} onChange={balance=>patch(d.id,{balance})}/><Field money={false} max={100} label={planCopy.interestRateAPR} value={d.apr} onChange={apr=>patch(d.id,{apr})}/><Field label={planCopy.minimumPaymentAlreadyLabel} value={d.minimum??0} onChange={minimum=>patch(d.id,{minimum})}/><Copy small>{planCopy.debtMinimumHelp}</Copy><Button secondary title={planCopy.removeTitle+(d.name||'this debt')} onPress={()=>Alert.alert(planCopy.removeDebt,planCopy.thisRemovesTheDebtFromYourPlan,[{text:planCopy.cancel},{text:planCopy.remove,onPress:()=>onChange(debts.filter(x=>x.id!==d.id))}])}/></View>)}<Button secondary title={planCopy.addDebt} disabled={debts.length>=100} onPress={()=>onChange([...debts,{id:id(),name:'New debt',balance:0,apr:0}])}/></>;
}
