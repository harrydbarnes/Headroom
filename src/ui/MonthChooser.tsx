import {activityCopy} from '../strings/activity';
import {formatMonth} from '../lib/dates';
import {formatCount} from '../strings/format';
import React from 'react';
import type {Transaction} from '../lib/finance';
import {monthKey} from '../lib/workspace';
import {Button,Copy,Sheet} from './components';
export function MonthChooser({visible,onClose,rows,onChoose}:{visible:boolean;onClose:()=>void;rows:Transaction[];onChoose:(month:string)=>void}){
 const counts=new Map<string,number>();counts.set(monthKey(),0);for(const row of rows){const month=row.date.slice(0,7);counts.set(month,(counts.get(month)??0)+(row.movement==='review'?1:0));}
 const months=[...counts.keys()].sort().reverse(),oldest=[...counts.keys()].sort().find(m=>(counts.get(m)??0)>0);
 const choose=(month:string)=>{onChoose(month);onClose();};
 return <Sheet visible={visible} onClose={onClose} title={activityCopy.chooseAMonth}>{oldest&&<Button title={activityCopy.review+formatMonth(oldest)} onPress={()=>choose(oldest)}/>}<Copy small>{activityCopy.monthsTransactionsPlusText}</Copy>{months.map(month=><Button key={month} secondary title={activityCopy.reviewMerchantCaption(formatMonth(month),formatCount(counts.get(month)??0))} onPress={()=>choose(month)}/>)}</Sheet>;
}
