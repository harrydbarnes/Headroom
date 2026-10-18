import {counts} from '../strings/format';
import {recoveryCopy} from '../strings/recovery';
import {HelpNote} from '../ui/components';
import {counted} from '../strings/format';
import {toUserMessage} from '../strings/errors';
import React,{useRef,useState} from 'react';
import {Alert} from 'react-native';
import {useFinance} from '../state/store';
import {chooseBackup,savePrivateText,shareBackup} from '../services/backup';
import {Button,Card,Copy,Heading,Notice,Page} from '../ui/components';
export function Recovery(){
 const error=useFinance(s=>s.error),archive=useFinance(s=>s.recoveryArchive),personal=useFinance(s=>s.recoverablePersonal),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),inFlight=useRef(false);
 const run=async(action:()=>Promise<void>)=>{if(inFlight.current)return;inFlight.current=true;setBusy(true);setMessage("");try{await action();}catch(e){setMessage(toUserMessage(e));}finally{inFlight.current=false;setBusy(false);}};
 const restore=()=>void run(async()=>{const backup=await chooseBackup();if(!backup)return;Alert.alert(recoveryCopy.replaceUnreadableSavedData,recoveryCopy.restoreConfirmBody(counts.transaction(backup.transactions.length),counts.scenario(backup.scenarios.length)),[{text:recoveryCopy.cancel,style:'cancel'},{text:recoveryCopy.restoreBackup,onPress:()=>void run(async()=>{if(!await useFinance.getState().restore(backup))throw Error('Restored data hasn’t been saved. Try saving again before closing Headroom.');})}]);});
 return <Page><Heading>{recoveryCopy.recoverYourData}</Heading><Notice error>{toUserMessage(error)}</Notice><Copy>{recoveryCopy.editingPaused}</Copy>{!!message&&<Notice>{message}</Notice>}
 <Card title={recoveryCopy.preserveYourRecords}><HelpNote summary={recoveryCopy.exportPrivacySummary}><Copy small>{recoveryCopy.exportPrivacyDetail}</Copy></HelpNote>{personal&&<Button title={recoveryCopy.exportYourBackup} disabled={busy} onPress={()=>void run(async()=>{const result=await shareBackup(personal);setMessage(result==='saved'?recoveryCopy.yourBackupWasWritten:result==='cancelled'?recoveryCopy.exportCancelled:recoveryCopy.backupShareReceipt);})}/>}{archive&&<Button secondary title={recoveryCopy.exportRecoveryRecords} disabled={busy} onPress={()=>void run(async()=>{const result=await savePrivateText(archive);setMessage(result==='saved'?recoveryCopy.recoveryRecordsExportedText:result==='cancelled'?recoveryCopy.exportCancelled:recoveryCopy.archiveShareReceipt);})}/>}</Card>
 <Button title={recoveryCopy.tryOpeningAgain} disabled={busy} onPress={()=>void useFinance.getState().init()}/><Button secondary title={recoveryCopy.restoreABackup} disabled={busy} onPress={restore}/><Copy small>{recoveryCopy.restoreUnavailableHelp}</Copy></Page>;
}
