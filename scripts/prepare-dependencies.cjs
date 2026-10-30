// Repo-local security patches are tied to exact source hashes.
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const patches=require('./dependency-patches.json');
const hash=s=>createHash('sha256').update(s).digest('hex');
const project=path.resolve(__dirname,'..'),lock=JSON.parse(fs.readFileSync(path.join(project,'package-lock.json'),'utf8'));
const resolveRoot=patch=>{
 const from=patch.from?path.join(project,'node_modules',patch.from):project;
 return path.dirname(require.resolve(patch.package+'/package.json',{paths:[from]}));
};
for(const name of new Set(patches.map(p=>p.package))){
 const copies=Object.keys(lock.packages).filter(p=>p.endsWith('node_modules/'+name));
 const patch=patches.find(p=>p.package===name),root=resolveRoot(patch);
 if(copies.length!==1||root!==path.resolve(project,copies[0]))throw Error('Review all installed copies of '+name+' before building.');
}
for(const patch of patches){
 const root=resolveRoot(patch),metadata=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
 if(metadata.name!==patch.package)throw Error('Security patch package identity changed: '+patch.package);
 const version=metadata.version;
 if(patch.package==='node-forge'&&version!==patch.version&&['1.4.0','1.4.1'].includes(version))continue;
 if(version!==patch.version)throw Error('Review security patch for upgraded '+patch.package);
 const file=path.join(root,patch.file),source=fs.existsSync(file)?fs.readFileSync(file,'utf8'):'';
 if(hash(source)===patch.after)continue;
 if(process.argv.includes('--check')||hash(source)!==patch.before)throw Error('Security patch missing or source changed: '+patch.package+'/'+patch.file);
 let next=source;
 for(const [before,after,count] of patch.replacements){if(before===''&&next===''){next=after;continue;}if(next.split(before).length-1!==count)throw Error('Security patch context changed: '+patch.file);next=next.split(before).join(after);}
 if(hash(next)!==patch.after)throw Error('Security patch digest mismatch: '+patch.file);
 fs.writeFileSync(file,next);
}
console.log('Dependency security patches verified. Upstream audit advisories remain visible.');
