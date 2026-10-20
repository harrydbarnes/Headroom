import React from 'react';
import {View} from 'react-native';
import {Choice,Copy} from './components';
import {Button, Notice} from './components';
import {TextButton} from './TextButton';
import {planCopy} from '../strings/plan';

export function PlanDraftActions({dirty, title, disabled, onSave, onDiscard}: {
  dirty: boolean; title: string; disabled: boolean;
  onSave: () => void; onDiscard: () => void;
}) {
  return (
    <View style={{gap: 8}}>
      {dirty && <Notice kind="info">{planCopy.unsavedChanges}</Notice>}
      <Button title={title} disabled={disabled || !dirty} onPress={onSave}/>
      {dirty && <TextButton title={planCopy.discard} onPress={onDiscard}/>}
      <Copy small>{planCopy.discardDraftHelp}</Copy>
    </View>
  );
}
export function Options<T extends string>({label,value,options,onChange,labelFor=(value:T)=>value}:{label:string;value:T;options:readonly T[];onChange:(v:T)=>void;labelFor?:(value:T)=>string}){return <View style={{gap:8}}><Copy strong>{label}</Copy><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{options.map(o=><Choice key={o} title={labelFor(o)} selected={value===o} onPress={()=>onChange(o)}/>)}</View></View>;}
