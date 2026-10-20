import React,{useEffect,useRef,useState} from 'react';
import {Animated,Easing,ScrollView,Text,View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import {todayCopy} from '../strings/today';
import {Button,Copy} from './components';
import {styles as s,useTheme} from './theme';
import {useInterfaceVisible} from './privacy';

const SPENDING_SHARE='64%',HEADROOM_SHARE='36%',ORIGIN=['0%','50%',0];
const ease=(value:Animated.Value,duration:number)=>Animated.timing(value,{toValue:1,duration,easing:Easing.out(Easing.cubic),useNativeDriver:true});
/** First-open intro: income, then planned spending, then the headroom that is left. */
export function Intro({onStart,onExample}:{onStart:()=>void;onExample:()=>void}){
 const {colors:c,dark,reducedMotion}=useTheme(),visible=useInterfaceVisible(),completed=useRef(false),[ready,setReady]=useState(reducedMotion);
 const income=useRef(new Animated.Value(0)).current,spending=useRef(new Animated.Value(0)).current,headroom=useRef(new Animated.Value(0)).current,glow=useRef(new Animated.Value(0)).current,words=useRef(new Animated.Value(0)).current;
 useEffect(()=>{
  const values=[income,spending,headroom,glow,words];
  // Finish quietly when covered, so returning from a lock never strands the actions.
  if(reducedMotion||!visible||completed.current){values.forEach(v=>v.setValue(1));glow.setValue(0);completed.current=true;setReady(true);return;}
  values.forEach(v=>v.setValue(0));
  const run=Animated.sequence([ease(income,700),Animated.delay(150),ease(spending,900),Animated.delay(100),Animated.spring(headroom,{toValue:1,damping:11,stiffness:150,mass:1,useNativeDriver:true}),Animated.parallel([ease(words,500),Animated.sequence([ease(glow,450),Animated.timing(glow,{toValue:0,duration:650,easing:Easing.inOut(Easing.quad),useNativeDriver:true})])])]);
  run.start(({finished})=>{if(finished){completed.current=true;setReady(true);}});
  return()=>run.stop();
 },[reducedMotion,visible,income,spending,headroom,glow,words]);
 const pulse=glow.interpolate({inputRange:[0,1],outputRange:[1,1.05]}),rise=words.interpolate({inputRange:[0,1],outputRange:[16,0]}),track={height:28,borderRadius:14,overflow:'hidden' as const,backgroundColor:c.container};
 return <SafeAreaView style={{flex:1,backgroundColor:c.surface}}><StatusBar style={dark?'light':'dark'}/>
  <ScrollView contentContainerStyle={{flexGrow:1,justifyContent:'center',padding:24,gap:36,maxWidth:600,width:'100%',alignSelf:'center'}}>
   <View accessible accessibilityRole="image" accessibilityLabel={todayCopy.introAnimationLabel} style={{gap:20}}>
    <View style={{gap:8}}>
     <Animated.View style={{opacity:income}}><Copy small>{todayCopy.introIncomeLabel}</Copy></Animated.View>
     <View style={track}><Animated.View style={{flex:1,backgroundColor:c.primary,transform:[{scaleX:income}],transformOrigin:ORIGIN}}/></View>
    </View>
    <View style={{gap:8}}>
     <View style={[track,{flexDirection:'row'}]}>
      <View style={{width:SPENDING_SHARE}}><Animated.View style={{flex:1,backgroundColor:c.outline,transform:[{scaleX:spending}],transformOrigin:ORIGIN}}/></View>
      <View style={{width:HEADROOM_SHARE}}><Animated.View style={{flex:1,backgroundColor:c.primaryContainer,borderWidth:2,borderColor:c.primary,borderRadius:14,opacity:headroom,transform:[{scaleX:headroom},{scale:pulse}],transformOrigin:ORIGIN}}/></View>
     </View>
     <View style={{flexDirection:'row'}}>
      <Animated.View style={{width:SPENDING_SHARE,opacity:spending}}><Copy small>{todayCopy.introSpendingLabel}</Copy></Animated.View>
      <Animated.View style={{width:HEADROOM_SHARE,opacity:headroom}}><Copy small strong>{todayCopy.introHeadroomLabel}</Copy></Animated.View>
     </View>
    </View>
   </View>
   <Animated.View pointerEvents={ready?'auto':'none'} accessibilityElementsHidden={!ready} importantForAccessibility={ready?'auto':'no-hide-descendants'} style={{gap:16,opacity:words,transform:[{translateY:rise}]}}>
    <Text accessibilityRole="header" style={[s.title,{color:c.text}]}>{todayCopy.makeRoomForWhatMatters}</Text>
    <Copy>{todayCopy.introTagline}</Copy>
    <Button title={todayCopy.startSetup} onPress={onStart}/>
    <Button secondary title={todayCopy.tryExampleData} onPress={onExample}/>
   </Animated.View>
  </ScrollView>
 </SafeAreaView>;
}
