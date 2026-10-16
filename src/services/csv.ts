import {File,Paths} from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import {Platform} from 'react-native';
import {StorageAccessFramework} from 'expo-file-system/legacy';
export async function chooseCsv(){
 const result=await DocumentPicker.getDocumentAsync({type:['text/csv','text/comma-separated-values','text/plain','application/vnd.ms-excel'],copyToCacheDirectory:true,multiple:false});if(result.canceled)return null;
 const file=new File(result.assets[0].uri);try{if(file.size>20000000)throw Error('CSV exceeds 20 MB.');return await file.text();}finally{if(file.exists)file.delete();}
}
export async function saveCsv(contents:string){
 const name='headroom-transactions-'+Date.now()+'.csv';
 if(Platform.OS==='android'){const permission=await StorageAccessFramework.requestDirectoryPermissionsAsync();if(!permission.granted)return 'cancelled';const uri=await StorageAccessFramework.createFileAsync(permission.directoryUri,name,'text/csv');await StorageAccessFramework.writeAsStringAsync(uri,contents);return 'saved';}
 if(!await Sharing.isAvailableAsync())throw Error('File sharing is unavailable.');const file=new File(Paths.cache,name);try{file.create();file.write(contents);await Sharing.shareAsync(file.uri,{mimeType:'text/csv'});return 'shared';}finally{if(file.exists)file.delete();}
}
