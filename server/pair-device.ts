const origin=process.env.PUBLIC_ORIGIN,token=process.env.DEVICE_TOKEN;
if(!origin||new URL(origin).protocol!=='https:'||new URL(origin).origin!==origin||!token)throw Error('Set PUBLIC_ORIGIN and DEVICE_TOKEN in your server environment.');
const response=await fetch(origin+'/mobile/pairing-ticket',{method:'POST',headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(20000)});
if(!response.ok)throw Error('Could not issue a pairing ticket. Check the server and device token.');
const result=await response.json();
console.log('Paste this pairing link into Settings, then choose Link this phone. It works once and expires in two minutes.');
console.log(origin+'/#pairing='+result.ticket);
