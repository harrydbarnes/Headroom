import {accountsCopy} from '../strings/accounts';
import {HelpNote} from './components';
import {counted} from '../strings/format';
import {toUserMessage} from '../strings/errors';
import {bankStatusLabel} from '../strings/glossary';
import React,{useState} from 'react';
import {Linking} from 'react-native';
import type {Banking} from '../services/useBanking';
import {bankingCallback,bankingSetup} from '../lib/bankingSetup';
import {Button,Copy,Input,Notice,Sheet} from './components';

const titles=['Enable Banking account','Server owner setup','Link this phone','Connect a bank','Refresh and review'];
export function BankingSetup({banking:b,demo,openSettings}:{banking:Banking;demo:boolean;openSettings:()=>void}){
 const [open,setOpen]=useState(false),[step,setStep]=useState(0),[origin,setOrigin]=useState(b.origin),[error,setError]=useState('');
 const status=bankingSetup(b,demo);let callback='',addressError='';
 if(origin.trim())try{callback=bankingCallback(origin);}catch(e){addressError=toUserMessage(e);}
 const link=async(url:string)=>{setError(accountsCopy.separator3);try{await Linking.openURL(url);}catch{setError(accountsCopy.theBrowserCouldNotOpenTryAgain);}};
 const pairing=()=>{setOpen(false);openSettings();};
 return <><Button secondary title={accountsCopy.setUpBanking} onPress={()=>{setOrigin(b.origin);setStep(status.step);setError(accountsCopy.separator3);setOpen(true);}}/>
 <Sheet key={step} visible={open} onClose={()=>setOpen(false)} title={accountsCopy.connectYourBank}>
 <Copy strong>{accountsCopy.step}{step+1}{accountsCopy.of5}{titles[step]}</Copy>
 <Copy small>{accountsCopy.enableBankingGivesHeadroomPermissionToRead}</Copy>
 {demo&&<Notice>{accountsCopy.youReViewingExampleDataReadThe}</Notice>}
 {step===0&&<><Copy>{accountsCopy.createAnEnableBankingAccountThenRegister}</Copy><HelpNote summary={accountsCopy.forRealAccountsActivateProductionAccessAnd}><Copy>{accountsCopy.forRealAccountsActivateProductionAccessAnd2}</Copy></HelpNote><Button secondary title={accountsCopy.openAccountSignIn} onPress={()=>void link('https://enablebanking.com/sign-in/')}/><Button secondary title={accountsCopy.readSetupGuide} onPress={()=>void link('https://enablebanking.com/docs/api/quick-start/')}/><Button secondary title={accountsCopy.useLinkingCode} disabled={demo} onPress={pairing}/></>}
 {step===1&&<><HelpNote summary={accountsCopy.headroomCurrentlyNeedsAnOwnerManagedHTTPS}><Copy>{accountsCopy.headroomCurrentlyNeedsAnOwnerManagedHTTPS2}</Copy></HelpNote><HelpNote summary={accountsCopy.ifYouOwnTheServerFollowThe}><Copy>{accountsCopy.ifYouOwnTheServerFollowThe2}</Copy></HelpNote><Button secondary title={accountsCopy.readServerInstructions} onPress={()=>void link('https://github.com/harrydbarnes/Headroom#configure-real-bank-access')}/><Input label={accountsCopy.serverHTTPSAddressCallbackPreviewOnly} value={origin} autoCapitalize="none" autoCorrect={false} onChangeText={setOrigin} placeholder={accountsCopy.httpsYourServerExample}/>{!!addressError&&<Notice error>{addressError}</Notice>}{!!callback&&<><Copy small>{accountsCopy.registerThisExactAllowedRedirectURLIn}</Copy><Input label={accountsCopy.allowedRedirectURL} value={callback} editable={false}/></>}<HelpNote summary={accountsCopy.theServerMustVerifyTheApplicationIs}><Copy small>{accountsCopy.theServerMustVerifyTheApplicationIs2}</Copy></HelpNote></>}
 {step===2&&<><HelpNote summary={accountsCopy.onTheServerItsOwnerRunsThe}><Copy>{accountsCopy.onTheServerItsOwnerRunsThe2}</Copy></HelpNote><Copy small>{accountsCopy.linkingThisPhoneDoesnTGiveBank}</Copy><Button title={accountsCopy.linkThisPhone} disabled={demo} onPress={pairing}/><Button secondary title={accountsCopy.checkPhoneLink} disabled={demo||b.busy} onPress={()=>void b.refreshStatus()}/>{b.statusState==='unavailable'&&<Notice error>{toUserMessage(b.statusError)}</Notice>}</>}
 {step===3&&<><HelpNote summary={accountsCopy.findYourExactBankAndAccountProduct}><Copy>{accountsCopy.findYourExactBankAndAccountProduct2}</Copy></HelpNote>{status.needsRenewal&&<Notice>{accountsCopy.bankPermissionHasExpiredConnectTheBank}</Notice>}<Button title={accountsCopy.findSupportedBanks} disabled={!status.canDiscover||b.busy} onPress={()=>{setOpen(false);void b.discover();}}/>{!status.canDiscover&&<Notice>{accountsCopy.firstShowYourDataLinkThisPhone}</Notice>}<HelpNote summary={accountsCopy.bankCreditCardAndHistoryCoverageDepends}><Copy small>{accountsCopy.bankCreditCardAndHistoryCoverageDepends2}</Copy></HelpNote></>}
 {step===4&&<><Copy>{accountsCopy.afterBankPermissionIsCheckedRefreshTransactions}</Copy><Button title={accountsCopy.refreshTransactions} disabled={!status.canImport||b.busy} onPress={()=>{setOpen(false);void b.refresh();}}/>{!status.canImport&&<Notice>{accountsCopy.refreshNeedsAReachableConfiguredServerAnd}</Notice>}<HelpNote summary={accountsCopy.theCurrentConnectionImportsBookedGBPTransactions}><Copy small>{accountsCopy.theCurrentConnectionImportsBookedGBPTransactions2}</Copy></HelpNote></>}
 <Copy small>{accountsCopy.connection}{bankStatusLabel(b.statusState)}{b.statusState==='verified'?(b.configured?accountsCopy.serverConfigured:accountsCopy.serverNeedsEnableBankingSetup):accountsCopy.separator3}{accountsCopy.separator}{counted(b.connections.length,"recorded bank connection")}{accountsCopy.separator4}</Copy>
 {!!error&&<Notice error>{error}</Notice>}
 {step>0&&<Button secondary title={accountsCopy.previousSetupStep} onPress={()=>setStep(step-1)}/>}{step<4&&<Button title={accountsCopy.nextSetupStep} onPress={()=>setStep(step+1)}/>}
 </Sheet></>;
}
