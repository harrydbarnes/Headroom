export type ProtectionState={status:'pending'|'active'|'inactive'|'failed';applied:boolean|null;error:string|null};
/** Serialises native changes and publishes only the latest request's receipt. */
export class ScreenProtectionController{
 private state:ProtectionState={status:'pending',applied:null,error:null};
 private listeners=new Set<()=>void>();private queue=Promise.resolve();private revision=0;private applied:boolean|null=null;
 constructor(private apply:(enabled:boolean)=>Promise<void>){}
 snapshot=()=>this.state;
 subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener);};};
 private publish(state:ProtectionState){this.state=state;for(const listener of this.listeners)listener();}
 request(enabled:boolean){const revision=++this.revision;this.publish({status:'pending',applied:this.applied,error:null});
  this.queue=this.queue.then(async()=>{try{await this.apply(enabled);this.applied=enabled;if(revision===this.revision)this.publish({status:enabled?'active':'inactive',applied:enabled,error:null});}catch{if(revision===this.revision)this.publish({status:'failed',applied:this.applied,error:enabled?'Screenshot protection could not be applied. Your financial screens remain hidden until you retry or explicitly turn this request off.':'Screen protection could not be disabled. Its last confirmed state is shown.'});}});return this.queue;
 }
}
export function protectionBlocksContent(requested:boolean,state:ProtectionState){return requested&&(state.status!=='active'||state.applied!==true);}
