import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {runInNewContext} from 'node:vm';
import path from 'node:path';
import {it,expect} from 'vitest';
const require=createRequire(import.meta.url);
it('normalises Metro ancestor requests with dot segments on POSIX and Windows',()=>{
 const sourcePath=require.resolve('@expo/metro-file-map/package.json').replace(/package\.json$/,'build/lib/RootPathUtils.js'),moduleRequire=createRequire(sourcePath),code=readFileSync(sourcePath,'utf8');
 for(const [api,root] of [[path.posix,'/home/runner/work/Headroom/Headroom'],[path.win32,'C:\\Dev\\Headroom']] as const){
  const exports:any={};runInNewContext(code,{exports,require:(name:string)=>name==='path'?api:moduleRequire(name)});const utils=new exports.RootPathUtils(root);
  for(const from of ['..',api.join('..','..')])for(const relative of ['./Headroom/node_modules/expo','./node_modules/expo','node_modules/expo','../Headroom/./App.tsx']){
   const portable=relative.split('/').join(api.sep),expected=api.relative(root,api.resolve(root,from,portable));expect(utils.joinNormalToRelative(from,portable).normalPath).toBe(expected);
  }
 }
});
