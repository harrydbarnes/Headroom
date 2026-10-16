import {File,Paths} from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import {Platform} from 'react-native';
import {StorageAccessFramework} from 'expo-file-system/legacy';
import {exportBackup,parseBackup,type Workspace} from '../lib/workspace';
export async function shareBackup(w:Workspace){
 return savePrivateText(exportBackup(w),'headroom-backup');
}
export async function savePrivateText(contents:string,prefix='headroom-recovery'){
 if(Platform.OS==='android'){
  const permission=await StorageAccessFramework.requestDirectoryPermissionsAsync();if(!permission.granted)return 'cancelled';
  const uri=await StorageAccessFramework.createFileAsync(permission.directoryUri,prefix+'-'+Date.now()+'.json','application/json');
  await StorageAccessFramework.writeAsStringAsync(uri,contents);return 'saved';
 }
 if(!await Sharing.isAvailableAsync())throw Error('File sharing is unavailable on this device.');
 const file=new File(Paths.cache,prefix+'-'+Date.now()+'.json');
 file.create();file.write(contents);await Sharing.shareAsync(file.uri,{mimeType:'application/json',dialogTitle:'Save your Headroom data privately',UTI:'public.json'});return 'shared';
}
export async function chooseBackup(){
 const result=await DocumentPicker.getDocumentAsync({type:['application/json','text/plain'],copyToCacheDirectory:true,multiple:false});if(result.canceled)return null;
 const file=new File(result.assets[0].uri);try{if(file.size>20000000)throw Error('Backup exceeds 20 MB.');return parseBackup(await file.text());}finally{if(file.exists)file.delete();}
}
