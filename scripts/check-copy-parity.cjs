// Compare actual module exports, including function results, at two revisions.
// The manifest accounts explicitly for required deletions and whole-sentence merges.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),ts=require('typescript');
const manifest=JSON.parse(fs.readFileSync('docs/copy-key-map.json','utf8'));
function snapshot(revision){const cache=new Map();function load(file){file=file.replace(/\\/g,'/');if(cache.has(file))return cache.get(file).exports;const source=revision?cp.execFileSync('git',['show',revision+':'+file],{encoding:'utf8'}):fs.readFileSync(file,'utf8');const module={exports:{}};cache.set(file,module);const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const requireLocal=ref=>ref.startsWith('.')?load(path.posix.normalize(path.posix.join(path.posix.dirname(file),ref))+'.ts'):require(ref);new Function('require','module','exports',code)(requireLocal,module,module.exports);return module.exports;}
 const files=revision?cp.execFileSync('git',['ls-tree','-r','--name-only',revision,'src/strings'],{encoding:'utf8'}).trim().split(/\r?\n/):fs.readdirSync('src/strings').filter(f=>f.endsWith('.ts')).map(f=>'src/strings/'+f);
 const values={};function visit(value,key){if(typeof value==='string')values[key]=[value];else if(typeof value==='function'){const samples=[0,1,2].map(n=>Array.from({length:Math.max(value.length,8)},(_,i)=>i===0?n:'2026-10'));try{values[key]=samples.map(args=>String(value(...args)));}catch{values[key]=[0,1,2].map(()=>String(value(...Array(Math.max(value.length,8)).fill('2026-10'))));}}else if(value&&typeof value==='object'&&!Array.isArray(value))for(const [name,v]of Object.entries(value))visit(v,key+'.'+name);else if(Array.isArray(value))value.forEach((v,i)=>visit(v,key+'.'+i));}
 for(const file of files)for(const [name,value]of Object.entries(load(file)))visit(value,file+':'+name);return values;
}
const base=snapshot(manifest.base),head=snapshot(process.argv[2]||null),failures=[];let identical=0,removed=0;
const accounted=new Set();for(const [oldKey,oldValue]of Object.entries(base)){
 const change=manifest.entries.find(e=>e.old===oldKey)??manifest.entries.find(e=>!e.new&&oldKey.startsWith(e.old+'.')),target=change?.new??oldKey;
 if(change?.reason==='punctuation'||change?.reason==='unused'||change?.reason==='duplicate'||change?.reason==='fragment'){
  if(change.new){if(JSON.stringify(oldValue)!==JSON.stringify(head[change.new]))failures.push(oldKey+' changed while deduplicating');accounted.add(change.new);}removed++;continue;
 }
 if(change?.reason==='merged fragment'){removed++;continue;}
 if(JSON.stringify(oldValue)!==JSON.stringify(head[target]))failures.push(oldKey+' -> '+target+' changed');else identical++;accounted.add(target);
}
const baseValues=new Set(Object.values(base).flat());
for(const entry of manifest.merges??[]){
 for(const part of entry.parts)if(part.literal&&/[a-z]/i.test(part.literal)&&!baseValues.has(part.literal))failures.push('Unproven source fragment: '+entry.new+' '+part.literal);
 const dynamic=entry.parts.some(p=>p.argument!==undefined);
 const before=(dynamic?[0,1,2]:[0]).map(n=>entry.parts.map(part=>part.argument!==undefined?part.argument===0?String(n):'2026-10':part.literal??base[part.key]?.[0]??'<missing>').join(''));
 if(JSON.stringify(head[entry.new])!==JSON.stringify(before))failures.push('Merged sentence changed: '+entry.new);accounted.add(entry.new);
}
for(const key of Object.keys(head))if(!accounted.has(key))failures.push('Unaccounted new output: '+key);
console.log(JSON.stringify({base:manifest.base,retainedOutputs:identical,explicitRemovals:removed,mergedSentences:manifest.merges?.length??0,failures},null,2));if(failures.length)process.exitCode=1;
