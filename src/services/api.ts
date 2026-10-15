import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import {fromProvider} from '../lib/finance';
export async function saveConnection(url:string,token:string){const u=new URL(url);if(u.protocol!=='https:'||u.username||u.password||u.pathname!=='/'||u.search||u.hash)throw Error('Use your finance API HTTPS origin, with no path.');if(token.length<32)throw Error('Use the server device token (at least 32 characters).');await SecureStore.setItemAsync('apiOrigin',u.origin);await SecureStore.setItemAsync('deviceToken',token);}
export async function forgetConnection(){await SecureStore.deleteItemAsync('deviceToken');await SecureStore.deleteItemAsync('apiOrigin');}
export async function api(path:string,method='GET',body?:unknown){const origin=await SecureStore.getItemAsync('apiOrigin'),token=await SecureStore.getItemAsync('deviceToken');if(!origin||!token)throw Error('Add your secure API connection in Accounts first.');const r=await fetch(origin+path,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(120000)});const data=await r.json();if(!r.ok)throw Error(data.error||'The finance API could not complete this request.');return data;}
export async function sync(){const d=await api('/api/banking/sync','POST');return {rows:(d.rows||[]).map(fromProvider).filter((r:any)=>r!==null),warnings:d.warnings||[]};}
export async function connectBank(bank:string){const {url}=await api('/mobile/launch','POST',{bank});await WebBrowser.openBrowserAsync(url);}
