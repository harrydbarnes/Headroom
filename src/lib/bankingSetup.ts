export function bankingCallback(address:string){
 const u=new URL(address.trim());
 if(u.protocol!=='https:'||u.username||u.password||u.pathname!=='/'||u.search||u.hash)throw Error('Enter the HTTPS server address without a path, login details, query or fragment.');
 return u.origin+'/api/banking/callback';
}
export type SetupState={paired:boolean;statusState:'loading'|'unpaired'|'unavailable'|'verified';configured:boolean;connections:{expires:string}[]};
export function bankingSetup(state:SetupState,demo:boolean,now=Date.now()){
 const verified=state.paired&&state.statusState==='verified',canDiscover=verified&&state.configured&&!demo;
 const active=state.connections.some(c=>Date.parse(c.expires)>now);
 const step=!state.paired?0:!verified?2:!state.configured?1:!active?3:4;
 return {step,canDiscover,canImport:canDiscover&&active,needsRenewal:verified&&state.configured&&state.connections.length>0&&!active};
}
