import {bankingSetupTitles as titles} from '../strings/accounts';
import {counts} from '../strings/format';
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


export function BankingSetup({banking:b,demo,openSettings}:{banking:Banking;demo:boolean;openSettings:()=>void}){
 const [open,setOpen]=useState(false),[step,setStep]=useState(0),[origin,setOrigin]=useState(b.origin),[error,setError]=useState('');
 const status=bankingSetup(b,demo);let callback='',addressError='';
 if(origin.trim())try{callback=bankingCallback(origin);}catch(e){addressError=toUserMessage(e);}
 const link=async(url:string)=>{setError("");try{await Linking.openURL(url);}catch{setError(accountsCopy.theBrowserCouldNotOpenTryAgain);}};
 const pairing=()=>{setOpen(false);openSettings();};
 return <><Button secondary title={accountsCopy.setUpBanking} onPress={()=>{setOrigin(b.origin);setStep(status.step);setError("");setOpen(true);}}/>
 <Sheet key={step} visible={open} onClose={()=>setOpen(false)} title={accountsCopy.connectYourBank}>
 <Copy strong>{accountsCopy.setupProgress(step+1,titles[step])}</Copy>
 <Copy small>{accountsCopy.enableBankingGivesDetail}</Copy>
 {demo&&<Notice>{accountsCopy.youReViewingExampleDataReadThe}</Notice>}
 {step===0&&<><Copy strong>{accountsCopy.ownerSetup}</Copy><HelpNote summary={accountsCopy.ownerAccountSummary}><Copy>{accountsCopy.createEnableBankingDetail}</Copy></HelpNote><HelpNote summary={accountsCopy.realAccountsActivateSummary}><Copy>{accountsCopy.realAccountsActivateDetail}</Copy></HelpNote><Button secondary title={accountsCopy.openAccountSignIn} onPress={()=>void link('https://enablebanking.com/sign-in/')}/><Button secondary title={accountsCopy.readSetupGuide} onPress={()=>void link('https://enablebanking.com/docs/api/quick-start/')}/><Button secondary title={accountsCopy.useLinkingCode} disabled={demo} onPress={pairing}/></>}
 {step===1&&<><Copy strong>{accountsCopy.ownerSetup}</Copy><HelpNote summary={accountsCopy.serverOwnerSummary}><Copy>{accountsCopy.serverOwnerDetail}</Copy></HelpNote><HelpNote summary={accountsCopy.ifYouOwnTheServerFollowThe}><Copy>{accountsCopy.serverSetupDetail}</Copy></HelpNote><Button secondary title={accountsCopy.readServerInstructions} onPress={()=>void link('https://github.com/harrydbarnes/Headroom#configure-real-bank-access')}/><Input label={accountsCopy.serverHTTPSAddressCallbLabel} value={origin} autoCapitalize="none" autoCorrect={false} onChangeText={setOrigin} placeholder={accountsCopy.httpsYourServerExample}/>{!!addressError&&<Notice error>{addressError}</Notice>}{!!callback&&<><Copy small>{accountsCopy.registerExactAllowedDetail}</Copy><Input label={accountsCopy.allowedRedirectURL} value={callback} editable={false}/></>}<HelpNote summary={accountsCopy.applicationCheckSummary}><Copy small>{accountsCopy.applicationCheckDetail}</Copy></HelpNote></>}
 {step===2&&<><HelpNote summary={accountsCopy.onTheServerItsOwnerRunsThe}><Copy>{accountsCopy.pairingLinkDetail}</Copy></HelpNote><Copy small>{accountsCopy.linkingThisPhoneDoesnTGiveBank}</Copy><Button title={accountsCopy.linkThisPhone} disabled={demo} onPress={pairing}/><Button secondary title={accountsCopy.checkPhoneLink} disabled={demo||b.busy} onPress={()=>void b.refreshStatus()}/>{b.statusState==='unavailable'&&<Notice error>{toUserMessage(b.statusError)}</Notice>}</>}
 {step===3&&<><HelpNote summary={accountsCopy.findExactBankSummary}><Copy>{accountsCopy.findExactBankDetail}</Copy></HelpNote>{status.needsRenewal&&<Notice>{accountsCopy.bankPermissionHasDetail}</Notice>}<Button title={accountsCopy.findSupportedBanks} disabled={!status.canDiscover||b.busy} onPress={()=>{setOpen(false);void b.discover();}}/>{!status.canDiscover&&<Notice>{accountsCopy.firstShowYourDataLinkThisPhone}</Notice>}<HelpNote summary={accountsCopy.bankCreditCardSummary}><Copy small>{accountsCopy.bankCreditCardDetail}</Copy></HelpNote></>}
 {step===4&&<><Copy>{accountsCopy.afterBankPermissionDetail}</Copy><Button title={accountsCopy.refreshTransactions} disabled={!status.canImport||b.busy} onPress={()=>{setOpen(false);void b.refresh();}}/>{!status.canImport&&<Notice>{accountsCopy.refreshNeedsAReachableDetail}</Notice>}<HelpNote summary={accountsCopy.bankImportSummary}><Copy small>{accountsCopy.bankImportDetail}</Copy></HelpNote></>}
 <Copy small>{accountsCopy.connectionStatus(bankStatusLabel(b.statusState),b.statusState==='verified'?(b.configured?accountsCopy.serverConfigured:accountsCopy.serverNeedsEnableBankingSetup):"",counts.recordedBankConnection(b.connections.length))}</Copy>
 {!!error&&<Notice error>{error}</Notice>}
 {step>0&&<Button secondary title={accountsCopy.previousSetupStep} onPress={()=>setStep(step-1)}/>}{step<4&&<Button title={accountsCopy.nextSetupStep} onPress={()=>setStep(step+1)}/>}
 </Sheet></>;
}
