// Local mitigations for advisories with no patched upstream release.
// Never change dependency versions or suppress npm audit: verify exact source hashes.
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const patches=require('./dependency-patches.json');
const hash=s=>createHash('sha256').update(s).digest('hex');
const project=path.resolve(__dirname,'..'),lock=JSON.parse(fs.readFileSync(path.join(project,'package-lock.json'),'utf8'));
for(const name of new Set(patches.map(p=>p.package))){
 const copies=Object.keys(lock.packages).filter(p=>p.endsWith('node_modules/'+name));
 if(copies.length!==1||path.dirname(require.resolve(name+'/package.json'))!==path.resolve(project,copies[0]))throw Error('Review all installed copies of '+name+' before building.');
}
for(const patch of patches){
 const root=path.dirname(require.resolve(patch.package+'/package.json'));
 if(JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version!==patch.version)throw Error('Review security patch for upgraded '+patch.package);
 const file=path.join(root,patch.file),source=fs.existsSync(file)?fs.readFileSync(file,'utf8'):'';
 if(hash(source)===patch.after)continue;
 if(process.argv.includes('--check')||hash(source)!==patch.before)throw Error('Security patch missing or source changed: '+patch.package+'/'+patch.file);
 let next=source;
 for(const [before,after,count] of patch.replacements){if(before===''&&next===''){next=after;continue;}if(next.split(before).length-1!==count)throw Error('Security patch context changed: '+patch.file);next=next.split(before).join(after);}
 if(hash(next)!==patch.after)throw Error('Security patch digest mismatch: '+patch.file);
 fs.writeFileSync(file,next);
}
console.log('Dependency security patches verified. Upstream audit advisories remain visible.');
