import React from 'react';
import type {Transaction} from '../lib/finance';
import {monthKey} from '../lib/workspace';
import {Button,Copy,Sheet} from './components';
export function MonthChooser({visible,onClose,rows,onChoose}:{visible:boolean;onClose:()=>void;rows:Transaction[];onChoose:(month:string)=>void}){
 const counts=new Map<string,number>();counts.set(monthKey(),0);for(const row of rows){const month=row.date.slice(0,7);counts.set(month,(counts.get(month)??0)+(row.movement==='review'?1:0));}
 const months=[...counts.keys()].sort().reverse(),oldest=[...counts.keys()].sort().find(m=>(counts.get(m)??0)>0);
 const choose=(month:string)=>{onChoose(month);onClose();};
 return <Sheet visible={visible} onClose={onClose} title="Choose a month">{oldest&&<Button title={'Oldest outstanding: '+oldest} onPress={()=>choose(oldest)}/>}<Copy small>Months with transactions, plus the current month. Use Previous and Next for months without activity.</Copy>{months.map(month=><Button key={month} secondary title={`${month} · ${counts.get(month)} to review`} onPress={()=>choose(month)}/>)}</Sheet>;
}
