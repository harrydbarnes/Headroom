import React from 'react';
import {Animated,View} from 'react-native';
import {todayCopy} from '../strings/today';
import {useMotionValue} from './motion';
import {useInterfaceVisible} from './privacy';
import {useTheme} from './theme';

function Segment({filled,arriving,animate}:{filled:boolean;arriving:boolean;animate:boolean}){
 const {colors:c}=useTheme(),scale=useMotionValue(filled?1:0,{enabled:animate,initial:arriving?0:filled?1:0});
 return <View style={{flex:1,height:8,borderRadius:4,overflow:'hidden',backgroundColor:c.divider}}><Animated.View style={{flex:1,backgroundColor:c.primary,transform:[{scaleX:scale}],transformOrigin:['0%','50%',0]}}/></View>;
}
/** Segmented setup progress. The current segment fills as each step arrives. */
export function SetupProgress({step,total}:{step:number;total:number}){
 const {reducedMotion}=useTheme(),visible=useInterfaceVisible();
 return <View accessible accessibilityRole="progressbar" accessibilityLabel={todayCopy.setupProgressLabel} accessibilityValue={{min:1,max:total,now:step+1,text:todayCopy.setupProgressValue(step+1,total)}} style={{flexDirection:'row',gap:6}}>
  {Array.from({length:total},(_,i)=><Segment key={i} filled={i<=step} arriving={i===step} animate={visible&&!reducedMotion}/>)}
 </View>;
}
