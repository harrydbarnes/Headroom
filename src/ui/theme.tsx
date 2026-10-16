import React,{createContext,useContext,useEffect,useState} from 'react';
import {AccessibilityInfo,Platform,PlatformColor,StyleSheet,useColorScheme,type ColorValue} from 'react-native';
import {typeRoles} from '../lib/presentation';
import type {Preferences} from '../lib/workspace';

export {light,dark} from '../lib/palette';
import {light,dark} from '../lib/palette';
export type Palette={[K in keyof typeof light]:ColorValue};
export const deviceColorSupported=Platform.OS==='android'&&Number(Platform.Version)>=31;
function devicePalette(base:Palette,isDark:boolean):Palette{
 const tone=(family:string,value:number)=>PlatformColor('@android:color/system_'+family+'_'+value);
 return {...base,primary:tone('accent1',isDark?200:600),onPrimary:tone('accent1',isDark?800:0),primaryContainer:tone('accent1',isDark?700:100),onPrimaryContainer:tone('accent1',isDark?100:900),surface:tone('neutral1',isDark?900:10),container:tone('neutral1',isDark?800:100),card:tone('neutral1',isDark?900:0),text:tone('neutral1',isDark?100:900),muted:tone('neutral2',isDark?200:700),outline:tone('neutral2',isDark?400:600),divider:tone('neutral2',isDark?700:200)};
}
const Context=createContext<{colors:Palette;dark:boolean;reducedMotion:boolean;hideAmounts:boolean}>({colors:light,dark:false,reducedMotion:false,hideAmounts:false});
export function ThemeProvider({preferences,children}:{preferences:Preferences;children:React.ReactNode}){
 const system=useColorScheme(),[reduced,setReduced]=useState(true);useEffect(()=>{let alive=true,changed=false;AccessibilityInfo.isReduceMotionEnabled().then(value=>{if(alive&&!changed)setReduced(value);}).catch(()=>{});const sub=AccessibilityInfo.addEventListener('reduceMotionChanged',value=>{if(!alive)return;changed=true;setReduced(value);});return()=>{alive=false;sub.remove();};},[]);
 const isDark=preferences.theme==='dark'||(preferences.theme==='system'&&system==='dark');
 const base=isDark?dark:light;
 return <Context.Provider value={{colors:preferences.dynamicColor&&deviceColorSupported?devicePalette(base,isDark):base,dark:isDark,reducedMotion:reduced||preferences.reduceMotion,hideAmounts:preferences.hideAmounts}}>{children}</Context.Provider>;
}
export const useTheme=()=>useContext(Context);
export const styles=StyleSheet.create({page:{padding:24,gap:24,paddingBottom:40,width:'100%',maxWidth:1120,alignSelf:'center'},card:{padding:20,borderRadius:20,gap:16},title:typeRoles.headline,heading:typeRoles.title,body:typeRoles.body,small:typeRoles.caption,label:typeRoles.label,row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12},wrap:{flexDirection:'row',flexWrap:'wrap',gap:8},input:{borderWidth:1,borderRadius:12,padding:14,fontSize:16,lineHeight:24,minHeight:52},hero:{padding:24,borderRadius:24,gap:16},number:{...typeRoles.display,fontVariant:['tabular-nums']},button:{minHeight:48,borderRadius:24,paddingHorizontal:20,paddingVertical:13,alignItems:'center',justifyContent:'center'},chip:{minHeight:48,borderRadius:16,paddingHorizontal:14,paddingVertical:12,borderWidth:1},separator:{height:1}});
