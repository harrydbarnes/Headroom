const fs=require('node:fs'),ts=require('typescript');
const output='docs/copy-fixups-2026-10-18.md';
const relevant=/encrypt|backup|bank permission|bank login|banking password|credential|private key|signing key|device token|secure|screen lock|app lock|screenshots|recent apps|recovery records|data (?:stays|is stored|has been|deleted|is hidden)|data.*unchanged/i;
function evidence(text){
 if(/delet|unlink|disconnect|clear(?:s|ing)? (?:your|current)/i.test(text))return '`src/state/store.ts:42`, `src/services/api.ts:10`, `server/banking.ts:23`, `src/state/persistence.ts:26`, `src/state/persistence.ts:50`';
 if(/app lock|screen lock|biometric|authentication|screenshot|recent apps|screen protection|data is hidden/i.test(text))return '`App.tsx:37`, `App.tsx:39`, `App.tsx:41`, `App.tsx:43`, `src/ui/ScreenProtection.tsx:6`';
 if(/encrypt/i.test(text))return '`src/state/persistence.ts:56`, `src/services/api.ts:7`, `server/banking.ts:6`, `server/banking.ts:7`, `server/banking.ts:9`, `server/banking.ts:17`, `server/banking.ts:45`';
 if(/backup|recovery records/i.test(text))return '`src/services/backup.ts:9`, `src/lib/workspace.ts:59`, `src/lib/workspace.ts:105`, `src/lib/workspace.ts:106`, `src/state/persistence.ts:45`, `app.json:12`';
 if(/private key|signing key|credential|device token|secure/i.test(text))return '`src/services/api.ts:7`, `src/services/api.ts:9`, `src/services/api.ts:11`, `server/index.ts:18`, `server/banking.ts:9`, `server/banking.ts:21`';
 if(/permission|bank login|banking password/i.test(text))return '`server/banking.ts:20`, `server/banking.ts:21`, `server/banking.ts:22`, `server/banking.ts:23`, `src/services/useBanking.ts:23`';
 return '`src/state/persistence.ts:56`, `src/services/api.ts:7`, `server/banking.ts:31`, `server/banking.ts:45`';
}
function verdict(text,source){
 if(/^(?:Keep|Use|Do not|Never|Export|Back up|Configure|Set|Follow|Register|Start|Run|[0-9]+\.)\b/i.test(text.trim()))return 'Instruction, not a claim about a configured phone or host. Code references show the relevant boundary.';
 if(source.startsWith('docs/')&&!/copy-style|enable-banking-onboarding/.test(source))return 'Dated report, quoted review material or verification checklist. Retained as historical evidence only; implementation references do not certify current device or deployment state.';
 if(/phone.*storage encryption|Android.*encryption/i.test(text))return 'Conditional platform protection. Phone configuration was not checked; Headroom adds no database encryption.';
 if(/screenshot|recent apps|app lock|screen lock|biometric/i.test(text))return 'Implemented through native protection/authentication APIs. Device behaviour was not checked this run.';
 return 'Supported by the cited implementation, subject to the limits and corrections in the main claims table. Operator instructions are not deployment guarantees.';
}
const rows=[],seen=new Set();
function add(text,file,line){if(!relevant.test(text)||text.trim().length<12)return;const key=file+':'+text;if(seen.has(key))return;seen.add(key);rows.push({claim:text.trim(),file,line});}
for(const file of fs.readdirSync('src/strings').filter(f=>f.endsWith('.ts')).map(f=>'src/strings/'+f)){
 const source=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
 function visit(n){if(ts.isStringLiteralLike(n)||ts.isTemplateExpression(n)){
  if(ts.isPropertyAssignment(n.parent)&&n.parent.name===n)return;
  const text=ts.isTemplateExpression(n)?n.head.text+n.templateSpans.map(s=>'{value}'+s.literal.text).join(''):n.text;
  add(text,file,source.getLineAndCharacterOfPosition(n.getStart(source)).line+1);if(ts.isTemplateExpression(n))return;
 }ts.forEachChild(n,visit);}visit(source);
}
for(const file of ['README.md',...fs.readdirSync('docs').filter(f=>f.endsWith('.md')&&f!=='copy-fixups-2026-10-18.md').map(f=>'docs/'+f)]){
 fs.readFileSync(file,'utf8').split(/\r?\n/).forEach((line,i)=>{if(line.startsWith('#')||/^\s*\|\s*---/.test(line))return;add(line,file,i+1);});
}
const cell=text=>text.replace(/\|/g,'\\|').replace(/[\u2013\u2014]/g,':').replace(/--/g,':').replace(/\r?\n/g,' ');
const table='\n## Claim occurrence inventory\n\nThis conservative inventory includes matching UI copy, README statements, documentation instructions, historical reports and checklists. Repeated exact values in one module are listed once. Internal thrown-message keys are excluded because they are not presentation copy. The main claims table records the substantive security conclusions and wording corrections; the verdict column below distinguishes implementation from instructions and historical evidence.\n\n| Claim or instruction, with source occurrence | Code evidence | Verdict |\n| --- | --- | --- |\n'+rows.map(r=>'| '+cell(r.claim)+' (`'+r.file+':'+r.line+'`) | '+evidence(r.claim)+' | '+verdict(r.claim,r.file)+' |').join('\n')+'\n';
let doc=fs.readFileSync(output,'utf8').split('\n## Claim occurrence inventory')[0];fs.writeFileSync(output,doc+table);console.log('Recorded '+rows.length+' claim and instruction occurrences.');
