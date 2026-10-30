import {createRequire} from 'node:module';
import {generateKeyPairSync} from 'node:crypto';
import {it,expect} from 'vitest';
const require=createRequire(import.meta.url),braces=require('braces'),forge=require('node-forge'),deepmerge=require('deepmerge'),zod=require('zod');
it('rejects excessive brace/parenthesis depth at parsing and public AST entry points',()=>{
 for(const [open,close] of [['{','}'],['(',')']])for(const action of [braces.parse,braces.compile,braces.expand])expect(()=>action(open.repeat(4000)+'a,b'+close.repeat(4000))).toThrow(/nesting limit/);
 let ast:any={type:'text',value:'a'};for(let i=0;i<5000;i++)ast={type:'root',nodes:[ast]};
 for(const action of [braces.compile,braces.expand,braces.stringify])expect(()=>action(ast)).toThrow(/nesting limit/);
 const cyclic:any={type:'root',nodes:[]};cyclic.nodes=[cyclic];expect(()=>braces.stringify(cyclic)).toThrow(/nesting limit/);
 expect(braces.expand('src/{lib,ui}/{a,b}.ts')).toEqual(['src/lib/a.ts','src/lib/b.ts','src/ui/a.ts','src/ui/b.ts']);
 expect(braces.expand('file{1..3}')).toEqual(['file1','file2','file3']);expect(braces.stringify(braces.parse('a/{b,c}'))).toBe('a/{b,c}');
});
it('rejects malformed nested DigestAlgorithm while preserving valid SHA and MD5 signatures',()=>{
 const pem=generateKeyPairSync('rsa',{modulusLength:1024,publicExponent:3,privateKeyEncoding:{type:'pkcs8',format:'pem'},publicKeyEncoding:{type:'spki',format:'pem'}});
 const key=forge.pki.privateKeyFromPem(pem.privateKey),pub=forge.pki.publicKeyFromPem(pem.publicKey),asn=forge.asn1;
 const node=(type:number,constructed:boolean,value:any)=>asn.create(asn.Class.UNIVERSAL,type,constructed,value);
 for(const algorithm of ['sha256','md5']){
  const md=forge.md[algorithm].create();md.update('Headroom legitimate control');const digest=md.digest().getBytes();
  const oid=node(asn.Type.OID,false,asn.oidToDer(forge.pki.oids[algorithm]).getBytes()),nil=node(asn.Type.NULL,false,'');
  const sign=(children:any[])=>key.sign(asn.toDer(node(asn.Type.SEQUENCE,true,[node(asn.Type.SEQUENCE,true,children),node(asn.Type.OCTETSTRING,false,digest)])).getBytes(),'NONE');
  expect(pub.verify(digest,sign([oid,nil]))).toBe(true);
  if(algorithm==='sha256')expect(pub.verify(digest,sign([oid]))).toBe(true);else expect(()=>pub.verify(digest,sign([oid]))).toThrow();
  for(const malformed of [[oid,nil,nil],[oid,node(asn.Type.OCTETSTRING,false,'padding')],[oid,node(asn.Type.NULL,false,'garbage')]])expect(()=>pub.verify(digest,sign(malformed))).toThrow();
 }
});
it('preserves Expo code-signing certificate and signature verification',()=>{
 const expo=require('@expo/code-signing-certificates');
 const keyPair=expo.generateKeyPair(),certificate=expo.generateSelfSignedCodeSigningCertificate({keyPair,validityNotBefore:new Date(Date.now()-60000),validityNotAfter:new Date(Date.now()+86400000),commonName:'Headroom test'});
 expect(()=>expo.validateSelfSignedCertificate(certificate,keyPair)).not.toThrow();
 expect(typeof expo.signBufferRSASHA256AndVerify(keyPair.privateKey,certificate,Buffer.from('Headroom test manifest'))).toBe('string');
});
it('ignores __proto__ at both deepmerge copy boundaries and preserves ordinary keys',()=>{
 const poisoned=()=>JSON.parse('{"__proto__":{"isAdmin":true},"safe":{"value":1}}');
 const expectClean=(result:any)=>{
  expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
  expect(result.isAdmin).toBeUndefined();
  expect(Object.prototype.hasOwnProperty.call(result,'__proto__')).toBe(false);
 };

 const nullPrototypeTarget=Object.create(null);
 const nullPrototypeResult=deepmerge(nullPrototypeTarget,poisoned());
 expectClean(nullPrototypeResult);
 expect(nullPrototypeResult.safe).toEqual({value:1});

 const nestedResult=deepmerge({session:null},JSON.parse('{"session":{"__proto__":{"isAdmin":true},"safe":true}}'));
 expectClean(nestedResult.session);
 expect(nestedResult.session.safe).toBe(true);

 const ownProtoTarget=poisoned();
 const ownProtoResult=deepmerge(ownProtoTarget,{safe:{other:2}});
 expectClean(ownProtoResult);
 expect(ownProtoResult.safe).toEqual({value:1,other:2});

 const arrayResult=deepmerge([],JSON.parse('[{"__proto__":{"isAdmin":true},"safe":true}]'));
 expectClean(arrayResult[0]);
 expect(arrayResult[0].safe).toBe(true);
});
it('short-circuits oversized Zod arrays and bounds Expo CLI extension inputs and output',async()=>{
 const assertShortCircuits=(z:any)=>{
  let parsed=0;
  const oversized=z.array(z.any().refine(()=>{parsed++;return false;})).max(2).safeParse([1,2,3]);
  expect(oversized.success).toBe(false);
  expect(parsed).toBe(0);
  if(!oversized.success){expect(oversized.error.issues).toHaveLength(1);expect(oversized.error.issues[0].code).toBe('too_big');}
  parsed=0;
  const exact=z.array(z.any().refine(()=>{parsed++;return false;})).length(2).safeParse([1,2,3]);
  expect(exact.success).toBe(false);
  expect(parsed).toBe(0);
  if(!exact.success){expect(exact.error.issues).toHaveLength(1);expect(exact.error.issues[0].code).toBe('too_big');}
 };
 assertShortCircuits(zod.z);
 const esmZod=await import('zod');
 assertShortCircuits(esmZod.z);

 const expoRequire=createRequire(require.resolve('expo/package.json'));
 const cliPackage=expoRequire.resolve('@expo/cli/package.json');
 const cliRoot=require('node:path').dirname(cliPackage);
 const schemas=require(require('node:path').join(cliRoot,'build/src/start/server/DevToolsPlugin.schema.js'));
 const command={name:'run',title:'Run',environments:['cli'],parameters:[]};
 const base={packageName:'test-plugin',packageRoot:'./test-plugin'};
 const assertPluginOversize=(cliExtensions:any,path:Array<string|number>)=>{
  const result=schemas.PluginSchema.safeParse({...base,cliExtensions});
  expect(result.success).toBe(false);
  if(!result.success){expect(result.error.issues).toHaveLength(1);expect(result.error.issues[0].code).toBe('too_big');expect(result.error.issues[0].path).toEqual(path);}
 };
 assertPluginOversize({description:'test',entryPoint:'index.js',commands:new Array(101).fill(null)},['cliExtensions','commands']);
 assertPluginOversize({description:'test',entryPoint:'index.js',commands:[{...command,environments:['cli','mcp','cli']}]},['cliExtensions','commands',0,'environments']);
 assertPluginOversize({description:'test',entryPoint:'index.js',commands:[{...command,parameters:new Array(101).fill(null)}]},['cliExtensions','commands',0,'parameters']);
 const output=schemas.DevToolsPluginOutputSchema.safeParse(new Array(1001).fill(null));
 expect(output.success).toBe(false);
 if(!output.success){expect(output.error.issues).toHaveLength(1);expect(output.error.issues[0].code).toBe('too_big');}
});
