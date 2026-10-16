import {useEffect,useRef} from 'react';
import {Animated} from 'react-native';
import {motion,TransitionSlot} from '../lib/presentation';
/** Cancel on replacement, reduced motion, privacy changes and unmount. */
export function useMotionValue(target:number,{enabled=true,kind='spring',initial=target}:{enabled?:boolean;kind?:'spring'|'fade';initial?:number}={}){
 const value=useRef(new Animated.Value(initial)).current,slot=useRef(new TransitionSlot()).current;
 useEffect(()=>{slot.stop();if(!enabled){value.stopAnimation();value.setValue(target);return;}const animation=kind==='fade'?Animated.timing(value,{toValue:target,duration:motion.duration.screen,useNativeDriver:true}):Animated.spring(value,{toValue:target,...motion.spring,useNativeDriver:true});slot.replace({start:()=>animation.start(),stop:()=>animation.stop()});return()=>slot.stop();},[target,enabled,kind]);
 return value;
}
