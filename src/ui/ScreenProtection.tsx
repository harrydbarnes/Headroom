import React,{createContext,useContext,useEffect,useRef,useSyncExternalStore} from 'react';
import * as ScreenCapture from 'expo-screen-capture';
import {ScreenProtectionController,type ProtectionState} from '../lib/screenProtection';
const Context=createContext<{state:ProtectionState;retry:()=>void}>({state:{status:'pending',applied:null,error:null},retry:()=>{}});
export function ScreenProtectionProvider({requested,children}:{requested:boolean;children:React.ReactNode}){
 const controller=useRef<ScreenProtectionController|null>(null);if(!controller.current)controller.current=new ScreenProtectionController(enabled=>enabled?ScreenCapture.preventScreenCaptureAsync('headroom'):ScreenCapture.allowScreenCaptureAsync('headroom'));
 const current=controller.current,state=useSyncExternalStore(current.subscribe,current.snapshot,current.snapshot);
 useEffect(()=>{void current.request(requested);},[requested,current]);
 return <Context.Provider value={{state,retry:()=>{void current.request(requested);}}}>{children}</Context.Provider>;
}
export const useScreenProtection=()=>useContext(Context);
