import {it,expect} from 'vitest';
import {execFileSync} from 'node:child_process';
import {readFileSync,existsSync} from 'node:fs';
it('keeps all tracked source and documentation valid UTF-8 without mojibake',()=>{
 const files=execFileSync('git',['ls-files','-co','--exclude-standard','-z'],{encoding:'utf8'}).split('\0').filter(p=>/\.(?:ts|tsx|js|cjs|json|md|yml)$/.test(p)&&existsSync(p));
 const decoder=new TextDecoder('utf-8',{fatal:true});
 for(const file of new Set(files)){let text='';expect(()=>{text=decoder.decode(readFileSync(file));},file).not.toThrow();expect(text,file).not.toMatch(/\u00c2\u00b7|\u00e2\u20ac|\u00c3|\u00e2\u0080/);}
});
