import {it,expect} from 'vitest';
import {readFileSync,readdirSync} from 'node:fs';
import ts from 'typescript';
const parse=(file:string)=>ts.createSourceFile(file,readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
const copyFiles=readdirSync('src/strings').filter(f=>f.endsWith('.ts')).map(f=>'src/strings/'+f);
const walk=(dir:string):string[]=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):/\.tsx?$/.test(e.name)?[dir+'/'+e.name]:[]);
const uiFiles=['App.tsx',...walk('src/screens'),...walk('src/ui')];
const serviceFiles=walk('src/services');
const forbidden=/[\u2013\u2014]| -- |\b(?:SQLite|SecureStore|heuristic|attestation|workspace|figures|authorize|organize|categorize|enroll|canceled|please|linking code|access code|finance server|finance API|pairing ticket|HTTPS origin)\b/i;
const objects=new Map<string,Map<string,ts.Expression>>();
for(const file of copyFiles){const source=parse(file);function collect(node:ts.Node){if(ts.isVariableDeclaration(node)&&ts.isIdentifier(node.name)){let value=node.initializer;if(value&&ts.isAsExpression(value))value=value.expression;if(value&&ts.isObjectLiteralExpression(value)){const entries=new Map<string,ts.Expression>();for(const p of value.properties)if(ts.isPropertyAssignment(p))entries.set(ts.isIdentifier(p.name)?p.name.text:ts.isStringLiteral(p.name)?p.name.text:'',p.initializer);objects.set(node.name.text,entries);}}ts.forEachChild(node,collect);}collect(source);}
function choices(node:ts.Expression):string[]{
 if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node))return [node.text];
 if(ts.isPropertyAccessExpression(node)&&ts.isIdentifier(node.expression)){const value=objects.get(node.expression.text)?.get(node.name.text);return value?choices(value):['value'];}
 if(ts.isConditionalExpression(node))return [...choices(node.whenTrue),...choices(node.whenFalse)];
 if(ts.isBinaryExpression(node)&&node.operatorToken.kind===ts.SyntaxKind.PlusToken)return choices(node.left).flatMap(a=>choices(node.right).map(b=>a+b));
 if(ts.isCallExpression(node)&&ts.isPropertyAccessExpression(node.expression)&&ts.isIdentifier(node.expression.expression)){const value=objects.get(node.expression.expression.text)?.get(node.expression.name.text);if(value&&ts.isArrowFunction(value)&&ts.isTemplateExpression(value.body)){return [value.body.head.text+value.body.templateSpans.map(s=>'value'+s.literal.text).join('')];}}
 return ['value'];
}
const words=(value:string)=>value.trim().split(/\s+/).filter(Boolean).length;
it('marks every Cancel alert button as a native cancel action',()=>{
 let checked=0;
 for(const file of uiFiles){const source=parse(file);function visit(node:ts.Node){if(ts.isCallExpression(node)&&node.expression.getText(source)==='Alert.alert'&&node.arguments[2]&&ts.isArrayLiteralExpression(node.arguments[2]))for(const button of node.arguments[2].elements)if(ts.isObjectLiteralExpression(button)){
  const label=button.properties.find((p):p is ts.PropertyAssignment=>ts.isPropertyAssignment(p)&&p.name.getText(source)==='text');
  if(label&&(choices(label.initializer).includes('Cancel')||ts.isPropertyAccessExpression(label.initializer)&&label.initializer.name.text==='cancel')){checked++;const style=button.properties.find((p):p is ts.PropertyAssignment=>ts.isPropertyAssignment(p)&&p.name.getText(source)==='style');expect(style&&ts.isStringLiteral(style.initializer)&&style.initializer.text==='cancel',file).toBe(true);}
 }ts.forEachChild(node,visit);}visit(source);}expect(checked).toBeGreaterThan(0);
});
function internalKey(node:ts.Node,source:ts.SourceFile){
 if(ts.isPropertyAssignment(node.parent)&&node.parent.name===node)return true;
 // Exact thrown messages are internal contracts checked by error-coverage.test.
 // They must retain their values even when presentation terminology changes.
 let parent:ts.Node|undefined=node.parent;while(parent){if((ts.isCallExpression(parent)||ts.isNewExpression(parent))&&/^(?:Error|RangeError|TypeError|SyntaxError)$/.test(parent.expression.getText(source)))return true;if(ts.isThrowStatement(parent))return true;parent=parent.parent;}return false;
}
it('keeps presentation strings free of jargon, long dashes and ISO display dates',()=>{
 for(const file of [...copyFiles,...uiFiles,...serviceFiles]){if(/src\/strings\/(dates|format)\.ts$/.test(file))continue;const source=parse(file);
 function visit(node:ts.Node){if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node)||ts.isTemplateHead(node)||ts.isTemplateMiddle(node)||ts.isTemplateTail(node)){
  if(internalKey(node,source))return;
  if(ts.isImportDeclaration(node.parent)||ts.isExportDeclaration(node.parent))return;
  const value=node.text;expect(value,`${file}: ${value}`).not.toMatch(forbidden);
  // Explicit date-field placeholders are required by the brief, not display examples.
  if(copyFiles.includes(file)&&!['DD/MM/YYYY','MM/YYYY'].includes(value)){expect(value,file).not.toMatch(/\bYYYY|\b\d{4}-\d{2}(?:-\d{2})?\b/);}
 }ts.forEachChild(node,visit);}visit(source);}
});
it('rejects inline prose in screen and UI JSX, alerts and notice setters',()=>{
 const failures:string[]=[];
 // There are no prose exceptions. Empty values, punctuation and short style or
 // test-id tokens do not constitute prose and need no per-string exemption.
 for(const file of uiFiles){const source=parse(file);function visit(node:ts.Node){
  if(ts.isJsxText(node)&&words(node.text)>=3)failures.push(file+': '+node.text.trim());
  if((ts.isStringLiteralLike(node)||ts.isTemplateExpression(node))&&!internalKey(node,source)){
   const text=ts.isTemplateExpression(node)?node.head.text+node.templateSpans.map(s=>s.literal.text).join(' '):node.text;
   if(words(text)>=3){let parent:ts.Node|undefined=node.parent,visible=false;while(parent){if(ts.isJsxAttribute(parent)&&/^(?:title|label|placeholder|accessibilityLabel|accessibilityHint)$/.test(parent.name.getText(source)))visible=true;if(ts.isJsxExpression(parent))visible=true;if(ts.isCallExpression(parent)&&/^(?:Alert\.alert|show|setError)$/.test(parent.expression.getText(source)))visible=true;parent=parent.parent;}if(visible)failures.push(file+': '+text);}
   if(ts.isTemplateExpression(node))return;
  }ts.forEachChild(node,visit);
 }visit(source);}
 expect(failures).toEqual([]);
});
it('keeps visible helper summaries at 25 words or fewer',()=>{
 for(const file of uiFiles){const source=parse(file);function visit(node:ts.Node){
  if(ts.isJsxElement(node)&&node.openingElement.tagName.getText(source)==='Copy'){
   let parent:ts.Node|undefined=node.parent,detail=false;while(parent){if(ts.isJsxElement(parent)&&parent.openingElement.tagName.getText(source)==='HelpNote')detail=true;parent=parent.parent;}
   if(!detail){let variants=[''];for(const child of node.children){const values=ts.isJsxText(child)?[child.text]:ts.isJsxExpression(child)&&child.expression?choices(child.expression):[' value '];variants=variants.flatMap(a=>values.map(b=>a+' '+b));}for(const value of variants)expect(words(value),`${file}: ${value}`).toBeLessThanOrEqual(25);}
  }
  if(ts.isJsxAttribute(node)&&node.name.getText(source)==='summary'&&node.parent.parent.tagName.getText(source)==='HelpNote'){const init=node.initializer;if(init&&ts.isJsxExpression(init)&&init.expression)for(const value of choices(init.expression)){expect(words(value),file).toBeLessThanOrEqual(25);expect(value.trim(),file).not.toMatch(/^[.,]/);}}
 ts.forEachChild(node,visit);}visit(source);}
});
it('keeps fixed action titles short and uses verbs or documented status/navigation exceptions',()=>{
 const verbs=/^(?:Add|Apply|Archive|Ask|Cancel|Check|Choose|Clear|Close|Compare|Confirm|Connect|Continue|Delete|Disable|Discard|Disconnect|Dismiss|Edit|Enable|End|Explore|Export|Filter|Find|Finish|Forecast|Hide|Import|Link|Load|Open|Preview|Read|Record|Reconnect|Refresh|Reject|Remove|Rename|Reopen|Replace|Replay|Reset|Restart|Restore|Return|Review|Roll|Save|Select|Set|Show|Skip|Try|Turn|Undo|Unlink|Unlock|Update|Use)\b/;
 // Busy labels report progress; confirmed labels report state; previous/next navigate.
 const exceptions=/^(?:Working|Checking|Authenticating|Baseline confirmed|Assumptions confirmed|Previous|Next)/;
 for(const file of uiFiles){const source=parse(file);function visit(node:ts.Node){if(ts.isJsxAttribute(node)&&node.name.getText(source)==='title'&&/^(?:Button|TextButton)$/.test(node.parent.parent.tagName.getText(source))){
 const init=node.initializer,expr=init&&ts.isJsxExpression(init)?init.expression:init&&ts.isStringLiteral(init)?init:undefined;
 if(expr&&!ts.isCallExpression(expr))for(const title of choices(expr)){if(title==='value'||title.includes('value'))continue;expect(words(title),`${file}: ${title}`).toBeLessThanOrEqual(3);expect(verbs.test(title)||exceptions.test(title),`${file}: ${title}`).toBe(true);}
 }ts.forEachChild(node,visit);}visit(source);}
});
it('takes every alert title and body from the copy modules',()=>{
 let count=0;for(const file of uiFiles){const source=parse(file);function visit(node:ts.Node){if(ts.isCallExpression(node)&&node.expression.getText(source)==='Alert.alert'){count++;for(const arg of node.arguments.slice(0,2)){let raw=false;function literals(n:ts.Node){if(ts.isTemplateExpression(n)||(ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n))&&/[A-Za-z]/.test(n.text))raw=true;ts.forEachChild(n,literals);}literals(arg);expect(raw,`${file}: ${arg.getText(source)}`).toBe(false);}}ts.forEachChild(node,visit);}visit(source);}expect(count).toBeGreaterThan(0);
});
it('keeps date display through shared helpers',()=>{
 for(const file of uiFiles){const source=parse(file);expect(source.text,file).not.toMatch(/\.toLocale(?:Date|Time)?String\(/);function visit(node:ts.Node){if(ts.isJsxExpression(node)&&node.expression&&!ts.isJsxAttribute(node.parent)&&ts.isPropertyAccessExpression(node.expression)){const value=node.expression;if(!/Copy$/.test(value.expression.getText(source)))expect(value.getText(source),file).not.toMatch(/\.(?:date|due|from|until|anchor|month|taxYear|lastSync|asOf|finishedAt|attemptedAt|at)$/);}ts.forEachChild(node,visit);}visit(source);}
});
