import React from 'react';
import {Alert,View} from 'react-native';
import type {Debt,Plan} from '../lib/finance';
import {debtEntries,id} from '../lib/workspace';
import {Button,Copy,Field,Input} from './components';
export function DebtFields({plan,onChange}:{plan:Plan;onChange:(debts:Debt[])=>void}){
 const debts=debtEntries(plan);
 const patch=(key:string,change:Partial<Debt>)=>onChange(debts.map(d=>d.id===key?{...d,...change}:d));
 return <>{debts.length===0&&<Copy>No non-mortgage debts recorded. Add each balance separately if needed.</Copy>}{debts.map(d=><View key={d.id} style={{gap:12}}><Input label="Debt name" value={d.name} maxLength={100} onChangeText={name=>patch(d.id,{name})}/><Field label="Debt balance" value={d.balance} onChange={balance=>patch(d.id,{balance})}/><Field money={false} max={100} label="Debt APR (%)" value={d.apr} onChange={apr=>patch(d.id,{apr})}/><Field label="Minimum payment already included in essentials (optional)" value={d.minimum??0} onChange={minimum=>patch(d.id,{minimum})}/><Copy small>Reference only: this is not deducted again. Extra repayments are ordered by highest APR.</Copy><Button secondary title={'Remove '+(d.name||'this debt')} onPress={()=>Alert.alert('Remove debt?','Its balance will no longer be included in your plan.',[{text:'Cancel'},{text:'Remove',onPress:()=>onChange(debts.filter(x=>x.id!==d.id))}])}/></View>)}<Button secondary title="Add debt" disabled={debts.length>=100} onPress={()=>onChange([...debts,{id:id(),name:'New debt',balance:0,apr:0}])}/></>;
}
