import type {Connection} from '../services/api';
export type ConnectionStatus={phase:'loading'|'unpaired'|'unavailable'|'verified';origin:string;paired:boolean;connections:Connection[];configured:boolean;lastVerifiedAt:string|null;error:string};
const empty=():ConnectionStatus=>({phase:'loading',origin:'',paired:false,connections:[],configured:false,lastVerifiedAt:null,error:''});
export class ConnectionStatusController{
 private state=empty();private revision=0;private listeners=new Set<()=>void>();
 constructor(private readPairing:()=>Promise<{origin:string;paired:boolean}>,private fetchStatus:()=>Promise<unknown>){}
 snapshot=()=>this.state;
 subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener);};};
 private publish(state:ConnectionStatus){this.state=state;for(const listener of this.listeners)listener();}
 reset(){this.revision++;this.publish({...empty(),phase:'unpaired'});}
 async refresh(){const revision=++this.revision;this.publish({...this.state,phase:'loading',error:''});
  try{const saved=await this.readPairing();if(revision!==this.revision)return;
   const base=saved.origin===this.state.origin?this.state:{...empty(),...saved};
   if(!saved.paired){this.publish({...empty(),phase:'unpaired',origin:saved.origin});return;}
   this.publish({...base,...saved,phase:'loading',error:''});
   const raw=await this.fetchStatus() as any;if(revision!==this.revision)return;
   const date=(v:unknown)=>typeof v==='string'&&Number.isFinite(Date.parse(v));
   if(!raw||typeof raw.configured!=='boolean'||!Array.isArray(raw.connections)||raw.connections.some((c:any)=>!c||typeof c.id!=='string'||typeof c.provider!=='string'||!date(c.expires)||c.lastSync!==null&&!date(c.lastSync)||!Array.isArray(c.accounts)||c.accounts.some((a:any)=>!a||typeof a.name!=='string'||typeof a.currency!=='string')))throw Error('Your server returned an invalid connection status.');
   this.publish({...this.state,phase:'verified',configured:raw.configured,connections:raw.connections,lastVerifiedAt:new Date().toISOString(),error:''});
  }catch(e){if(revision!==this.revision)return;const error=e instanceof Error?e.message:'Connection status could not be checked.';this.publish({...this.state,phase:'unavailable',error});throw Error(error);}
 }
}
