import {it,expect} from 'vitest';
import {readFileSync,readdirSync} from 'node:fs';
import ts from 'typescript';
// Internal error keys and input placeholders are contracts, not display prose.
const technical=new Set(['errors.ts','dates.ts','format.ts','glossary.ts']);
it('keeps migrated copy free of jargon, dashes and US spelling',()=>{
 for(const file of readdirSync('src/strings').filter(f=>f.endsWith('.ts')&&!technical.has(f))){
 const source=ts.createSourceFile(file,readFileSync('src/strings/'+file,'utf8'),ts.ScriptTarget.Latest,true);
 function visit(node:ts.Node){if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node)){const text=node.text;if(!text.includes('/')&&!text.includes('YYYY')){expect(text,file).not.toMatch(/[\u2013\u2014]| -- |\b(?:SQLite|SecureStore|heuristic|attestation|workspace|figures|authorize|organize|categorize|enroll|canceled|please)\b/i);}}ts.forEachChild(node,visit);}visit(source);
 }
});
