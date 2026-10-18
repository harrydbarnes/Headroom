import React from 'react';
import {View} from 'react-native';
import {Choice,Copy} from './components';
export function Options<T extends string>({label,value,options,onChange}:{label:string;value:T;options:readonly T[];onChange:(v:T)=>void}){return <View style={{gap:8}}><Copy strong>{label}</Copy><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{options.map(o=><Choice key={o} title={o} selected={value===o} onPress={()=>onChange(o)}/>)}</View></View>;}
