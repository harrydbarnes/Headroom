import React,{useState} from 'react';
import {View,useWindowDimensions} from 'react-native';
import {Copy} from './components';
import {layoutChildren} from './layoutChildren';
import {columnCount} from '../lib/presentation';
export function AdaptiveColumns({children,minPane=340}:{children:React.ReactNode;minPane?:number}){
 const [available,setAvailable]=useState(0),{fontScale}=useWindowDimensions(),count=columnCount(available,fontScale,minPane);
 return <View onLayout={event=>setAvailable(event.nativeEvent.layout.width)} style={{flexDirection:count===2?'row':'column',gap:24,alignItems:'stretch'}}>{layoutChildren(children).map((child,index)=><View key={React.isValidElement(child)?child.key??index:index} style={{flex:count===2?1:undefined,minWidth:0}}>{typeof child==='string'||typeof child==='number'?<Copy>{child}</Copy>:child}</View>)}</View>;
}
