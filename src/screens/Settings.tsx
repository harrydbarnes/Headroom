import React,{useContext,useEffect,useRef,useState} from 'react';
import {Alert,ScrollView,View} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import {forgetConnection} from '../services/api';
import type {Banking} from '../services/useBanking';
import {chooseBackup,shareBackup} from '../services/backup';
import {redeemPairingLink} from '../services/pairing';
import {useScreenProtection} from '../ui/ScreenProtection';
import {useWorkspace} from '../state/hooks';
import {useFinance} from '../state/store';
import {Button,Copy,Input,Notice} from '../ui/components';
import {ActionRow,DetailScreen,HelpNote,NavRow,SegmentedControl,SettingsGroup,ToggleRow} from '../ui/settings/components';
import {RuleManager} from '../ui/RuleManager';
import {CoverWorkspace} from '../ui/privacy';
import {deviceColorSupported} from '../ui/theme';
import {deleteWithReceipt,settingsTarget,ruleSummary,exampleSummary,linkSummary,appLockSummary,protectionSummary,type SettingsRoute,type SettingsAnchor} from '../lib/settingsModel';
import {settingsUI as copy} from '../strings/settingsRework';
import {counts} from '../strings/format';
import {toUserMessage} from '../strings/errors';
import packageInfo from '../../package.json';
type Receipt={text:string;error:boolean};
export function Settings({banking:b,request,active=true,onBackHandler,onRequestHandled}:{banking:Banking;request?:{section:string;key:number};active?:boolean;onRequestHandled?:()=>void;onBackHandler?:(handler:(()=>boolean)|null)=>void}){
 const protection=useScreenProtection(),cover=useContext(CoverWorkspace),store=useWorkspace(),p=store.data.preferences;
 const [route,setRoute]=useState<SettingsRoute>('home'),[address,setAddress]=useState(b.origin),[token,setToken]=useState(''),[pairing,setPairing]=useState(''),[advanced,setAdvanced]=useState(false),[busy,setBusy]=useState(false),[notices,setNotices]=useState<Partial<Record<SettingsRoute|'privacy',Receipt>>>({}),[lockUnavailable,setLockUnavailable]=useState(false),[manualCompleted,setManualCompleted]=useState(0);
 const wasActive=useRef(false),handled=useRef<number|undefined>(undefined),home=useRef<ScrollView>(null),anchors=useRef<Partial<Record<SettingsAnchor,number>>>({}),pendingAnchor=useRef<SettingsAnchor|undefined>(undefined),returnFocus=useRef<(()=>void)|null>(null),focusOnHome=useRef(false),busyGuard=useRef(false),routeRef=useRef(route),activeRef=useRef(active),generation=useRef(0),homeOffset=useRef(0),manualReceipt=useRef<{version:number}|null>(null);
 routeRef.current=route;activeRef.current=active;
 const clear=()=>{generation.current++;setNotices({});};
 const go=(next:SettingsRoute,focus?:()=>void)=>{clear();if(focus)returnFocus.current=focus;setRoute(next);};
 const back=()=>{focusOnHome.current=true;go('home');};
 const scrollAnchor=()=>{const anchor=pendingAnchor.current;if(anchor&&anchors.current[anchor]!==undefined){home.current?.scrollTo({y:anchors.current[anchor],animated:false});pendingAnchor.current=undefined;}};
 // Consume requests in App so example-mode remounts cannot replay an old deep link.
 useEffect(()=>{const reopening=active&&!wasActive.current;wasActive.current=active;if(!active){clear();pendingAnchor.current=undefined;setRoute('home');setAdvanced(false);setToken('');setPairing('');return;}
  if(request&&handled.current!==request.key){clear();handled.current=request.key;const target=settingsTarget(request.section);returnFocus.current=null;pendingAnchor.current=target.anchor;setRoute(target.route);scrollAnchor();onRequestHandled?.();}else if(reopening){clear();setRoute('home');}
 },[active,request?.key]);
 useEffect(()=>{if(route==='home'&&active){if(!pendingAnchor.current)home.current?.scrollTo({y:homeOffset.current,animated:false});scrollAnchor();if(focusOnHome.current){focusOnHome.current=false;const timer=setTimeout(()=>returnFocus.current?.(),100);return()=>clearTimeout(timer);}}},[route,active]);
 useEffect(()=>{onBackHandler?.(()=>{if(routeRef.current==='home')return false;back();return true;});return()=>onBackHandler?.(null);},[onBackHandler]);
 useEffect(()=>setAddress(b.origin),[b.origin]);
 useEffect(()=>{const pending=manualReceipt.current;if(!pending)return;manualReceipt.current=null;if(activeRef.current&&routeRef.current==='link'&&generation.current===pending.version)receipt('link',b.error||copy.linkSuccess,!!b.error);b.clearMessage();},[manualCompleted]);
 const receipt=(scope:SettingsRoute|'privacy',text:string,error=false)=>setNotices(v=>({...v,[scope]:{text,error}}));
 const run=async(scope:SettingsRoute|'privacy',f:(show:(text:string,error?:boolean)=>void)=>Promise<void>)=>{if(busyGuard.current)return;busyGuard.current=true;setBusy(true);const version=generation.current;setNotices(v=>({...v,[scope]:undefined}));const show=(text:string,error=false)=>{if(activeRef.current&&generation.current===version)receipt(scope,text,error);};try{await f(show);}catch(e){show(toUserMessage(e),true);}finally{busyGuard.current=false;setBusy(false);}};
 const notice=(scope:SettingsRoute|'privacy')=>notices[scope]&&<Notice error={notices[scope]!.error} kind="success">{notices[scope]!.text}</Notice>;
 const lock=(value:boolean)=>void run('privacy',async show=>{if(value&&(!await LocalAuthentication.hasHardwareAsync()||!await LocalAuthentication.isEnrolledAsync())){setLockUnavailable(true);show(copy.lockUnavailable,true);return;}setLockUnavailable(false);const result=await LocalAuthentication.authenticateAsync({promptMessage:value?copy.enableAppLock:copy.disableAppLock,cancelLabel:copy.cancel,promptSubtitle:copy.unlockSubtitle,disableDeviceFallback:false});if(!result.success){show(copy.lockCancelled,true);return;}store.preferences({appLock:value});});
 const deleteData=()=>Alert.alert(store.demo?copy.deleteExampleTitle:copy.deleteTitle,copy.deleteBody(counts.transaction(store.workspace.transactions.length),counts.merchantRule(store.workspace.rules.length),counts.scenario(store.workspace.scenarios.length)),[{text:copy.cancel,style:'cancel'},{text:copy.deleteConfirm,style:'destructive',onPress:()=>void run('home',async show=>{const result=await deleteWithReceipt(useFinance.getState);show(result.deleted?(result.example?copy.exampleDeleted:copy.dataDeleted):toUserMessage(result.error),!result.deleted);homeOffset.current=0;home.current?.scrollTo({y:0,animated:false});})}]);
 const titles={backup:copy.backup,rules:copy.rules,examples:copy.examples,link:copy.link,about:copy.about};
 return <View style={{flex:1}}><View pointerEvents={route==='home'?'auto':'none'} accessibilityElementsHidden={route!=='home'} importantForAccessibility={route==='home'?'auto':'no-hide-descendants'} style={{position:'absolute',top:0,bottom:0,left:0,right:0,opacity:route==='home'?1:0}}><ScrollView ref={home} onScroll={e=>{if(routeRef.current==='home')homeOffset.current=e.nativeEvent.contentOffset.y;}} scrollEventThrottle={16} onLayout={e=>{if(e.nativeEvent.layout.height>0){if(!pendingAnchor.current)home.current?.scrollTo({y:homeOffset.current,animated:false});scrollAnchor();}}} keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:16,paddingBottom:40,gap:12,width:'100%',maxWidth:640,alignSelf:'center'}}>
 {notice('home')}
 <View onLayout={e=>{if(e.nativeEvent.layout.height>0){anchors.current.appearance=e.nativeEvent.layout.y;scrollAnchor();}}}><SettingsGroup title={copy.appearance}>
 <SegmentedControl label={copy.theme} options={(['system','light','dark'] as const).map(value=>({value,label:copy.themeLabels[value]}))} value={p.theme} onChange={theme=>store.preferences({theme})}/>
 <ToggleRow title={copy.wallpaper} subtitle={deviceColorSupported?copy.wallpaperHint:copy.wallpaperUnsupported} value={p.dynamicColor} disabled={!deviceColorSupported} onChange={dynamicColor=>store.preferences({dynamicColor})}/>
 <ToggleRow title={copy.motion} subtitle={copy.motionHint} value={p.reduceMotion} onChange={reduceMotion=>store.preferences({reduceMotion})}/>
 <ToggleRow title={copy.move} subtitle={copy.moveHint} value={p.moveEnabled} onChange={moveEnabled=>store.preferences({moveEnabled})}/>
 </SettingsGroup></View>
 <View onLayout={e=>{if(e.nativeEvent.layout.height>0){anchors.current.privacy=e.nativeEvent.layout.y;scrollAnchor();}}}><SettingsGroup title={copy.privacy}>
 {notices.privacy&&<View style={{padding:16}}>{notice('privacy')}</View>}
 <ToggleRow title={copy.hide} subtitle={copy.hideHint} value={p.hideAmounts} onChange={hideAmounts=>store.preferences({hideAmounts})}/>
 <ToggleRow title={copy.lock} subtitle={appLockSummary(p.appLock,lockUnavailable)} value={p.appLock} disabled={busy} onChange={lock}/>
 <ToggleRow title={copy.protection} subtitle={protectionSummary(protection.state.status)} value={protection.state.applied===true} disabled={protection.state.status==='pending'} onChange={blockCapture=>store.preferences({blockCapture})}/>
 {protection.state.status==='failed'&&<View style={{padding:16}}><Button secondary title={copy.retry} onPress={protection.retry}/></View>}
 <ActionRow icon="shield-lock-outline" title={copy.cover} subtitle={copy.coverHint} onPress={()=>cover?.()}/>
 <HelpNote summary={copy.privacySummary}><Copy small>{copy.privacyDetail}</Copy></HelpNote>
 </SettingsGroup></View>
 <SettingsGroup title={copy.data}>
 <NavRow icon="backup-restore" title={copy.backup} onPress={focus=>go('backup',focus)}/>
 <NavRow icon="tag-outline" title={copy.rules} value={ruleSummary(store.workspace.rules.length)} onPress={focus=>go('rules',focus)}/>
 <NavRow icon="flask-outline" title={copy.examples} value={exampleSummary(store.demo)} onPress={focus=>go('examples',focus)}/>
 </SettingsGroup>
 <SettingsGroup title={copy.bank}><NavRow icon="link-variant" title={copy.link} value={linkSummary(b.paired)} onPress={focus=>go('link',focus)}/></SettingsGroup>
 <SettingsGroup title={copy.aboutGroup}><NavRow icon="information-outline" title={copy.about} value={copy.version(packageInfo.version)} onPress={focus=>go('about',focus)}/></SettingsGroup>
 <SettingsGroup title={copy.remove} footer={copy.removeFooter}><ActionRow icon="delete-outline" danger title={store.demo?copy.deleteExample:copy.delete} subtitle={store.storageBlocked?copy.storageReason:undefined} disabled={busy||b.busy||store.storageBlocked} onPress={deleteData}/></SettingsGroup>
 </ScrollView></View>
 {route!=='home'&&<DetailScreen key={route} title={titles[route]} onBack={back}>{notice(route)}
 {route==='backup'&&<>
 <HelpNote summary={copy.backupIntro}><Copy small>{copy.backupHelp}</Copy></HelpNote>
 <Button title={copy.export} disabled={busy} onPress={()=>void run('backup',async show=>{const result=await shareBackup(store.data.personal);show(result==='saved'?copy.saved:result==='cancelled'?copy.cancelled:copy.shared);})}/>
 <Button secondary title={copy.restore} disabled={busy||b.busy} onPress={()=>void run('backup',async()=>{const restored=await chooseBackup();if(restored)Alert.alert(copy.replaceTitle,copy.restoreBody(counts.transaction(restored.transactions.length),counts.moveScenario(restored.scenarios.length),counts.transaction(store.data.personal.transactions.length),counts.scenario(store.data.personal.scenarios.length)),[{text:copy.cancel,style:'cancel'},{text:copy.replace,style:'destructive',onPress:()=>void run('backup',async show=>{if(!await store.restore(restored)){show(copy.notSaved,true);return;}show(copy.restored);})}]);})}/>
 </>}
 {route==='rules'&&<RuleManager/>}
 {route==='examples'&&<>
 <Copy>{copy.examplesIntro}</Copy><ActionRow icon="flask-outline" title={store.demo?copy.ownData:copy.tryExamples} onPress={()=>store.setDemo(!store.demo)}/>
 <Button secondary title={copy.reset} disabled={busy||b.busy||store.storageBlocked} onPress={()=>Alert.alert(copy.resetTitle,copy.resetBody,[{text:copy.cancel,style:'cancel'},{text:copy.resetConfirm,onPress:()=>{if(store.resetExample())receipt('examples',copy.resetSuccess);else receipt('examples',copy.resetFailure,true);}}])}/>
 {store.storageBlocked&&<Copy small>{copy.storageReason}</Copy>}
 <Button secondary title={copy.restart} onPress={()=>store.change(w=>({...w,onboardingStep:0}))}/><Copy small>{copy.restartHint}</Copy>
 </>}
 {route==='link'&&<>
 <Copy>{b.paired?copy.linkedAddress(b.origin):copy.unlinkedStatus}</Copy>
 <HelpNote summary={copy.linkSummary}><Copy small>{copy.linkDetail}</Copy></HelpNote>
 {store.demo&&<Notice>{copy.demoReason}</Notice>}
 <Input label={copy.pairing} autoCapitalize="none" autoCorrect={false} secureTextEntry value={pairing} onChangeText={setPairing}/><Copy small>{copy.pairingHint}</Copy>
 <Button title={copy.link} disabled={busy||b.busy||!pairing||store.demo} onPress={()=>void run('link',async show=>{await redeemPairingLink(pairing);setPairing('');await b.refreshStatus();show(copy.linkSuccess);})}/>
 <ActionRow icon={advanced?'chevron-up':'chevron-down'} title={copy.manual} expanded={advanced} onPress={()=>setAdvanced(v=>!v)}/>
 {advanced&&<><Input label={copy.address} value={address} onChangeText={setAddress} autoCapitalize="none" autoCorrect={false} placeholder={b.origin||copy.addressPlaceholder}/><Input label={copy.token} value={token} onChangeText={setToken} secureTextEntry autoCapitalize="none" autoCorrect={false}/><Button title={copy.save} disabled={busy||b.busy||store.demo} onPress={()=>{const secret=token;setToken('');setNotices(v=>({...v,link:undefined}));manualReceipt.current={version:generation.current};void b.save(address,secret).then(()=>setManualCompleted(v=>v+1));}}/><Copy small>{copy.keyHint}</Copy></>}
 <ActionRow icon="link-variant-off" danger title={copy.unlink} disabled={busy||b.busy||!b.paired||store.demo} onPress={()=>Alert.alert(copy.unlinkTitle,copy.unlinkBody,[{style:'cancel',text:copy.cancel},{text:copy.unlinkConfirm,style:'destructive',onPress:()=>void run('link',async show=>{await forgetConnection();b.reset();setAddress('');show(copy.unlinkSuccess);})}])}/>
 </>}
 {route==='about'&&<><Copy>{copy.tagline}</Copy><Copy small>{copy.versionSentence(packageInfo.version)}</Copy><Copy small>{copy.currency}</Copy><SettingsGroup title={copy.numbers}><View style={{padding:16,gap:12}}><Copy>{copy.headroom}</Copy><Copy>{copy.score}</Copy><Copy>{copy.limits}</Copy></View></SettingsGroup><HelpNote title={copy.dataTitle} summary={copy.dataSummary}><Copy small>{copy.dataDetail}</Copy></HelpNote></>}
 </DetailScreen>}
 </View>;
}
