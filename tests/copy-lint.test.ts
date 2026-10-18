import {it,expect} from 'vitest';
import {readFileSync,readdirSync} from 'node:fs';
import ts from 'typescript';
const parse=(file:string)=>ts.createSourceFile(file,readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
const copyFiles=readdirSync('src/strings').filter(f=>f.endsWith('.ts')).map(f=>'src/strings/'+f);
const uiFiles=['App.tsx',...['src/screens','src/ui'].flatMap(dir=>readdirSync(dir).filter(f=>f.endsWith('.tsx')).map(f=>dir+'/'+f))];
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
it('keeps presentation strings free of jargon, long dashes and ISO display dates',()=>{
 for(const file of copyFiles){if(/\/(dates|format)\.ts$/.test(file))continue;const source=parse(file);
 function visit(node:ts.Node){if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node)||ts.isTemplateHead(node)||ts.isTemplateMiddle(node)||ts.isTemplateTail(node)){
  if(ts.isPropertyAssignment(node.parent)&&node.parent.name===node)return; // Internal exception keys are immutable contracts.
  if(ts.isImportDeclaration(node.parent)||ts.isExportDeclaration(node.parent))return;
  const value=node.text;expect(value,`${file}: ${value}`).not.toMatch(forbidden);
  // Explicit date-field placeholders are required by the brief, not display examples.
  if(!['DD/MM/YYYY','MM/YYYY'].includes(value)){expect(value,file).not.toMatch(/\bYYYY|\b\d{4}-\d{2}(?:-\d{2})?\b/);}
 }ts.forEachChild(node,visit);}visit(source);}
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
 for(const file of uiFiles){const source=parse(file);function visit(node:ts.Node){if(ts.isJsxAttribute(node)&&node.name.getText(source)==='title'&&node.parent.parent.tagName.getText(source)==='Button'){
 const init=node.initializer,expr=init&&ts.isJsxExpression(init)?init.expression:init&&ts.isStringLiteral(init)?init:undefined;
 if(expr&&!ts.isCallExpression(expr))for(const title of choices(expr)){if(title==='value'||title.includes('value'))continue;expect(words(title),`${file}: ${title}`).toBeLessThanOrEqual(3);expect(verbs.test(title)||exceptions.test(title),`${file}: ${title}`).toBe(true);}
 }ts.forEachChild(node,visit);}visit(source);}
});
it('takes every alert title and body from the copy modules',()=>{
 let count=0;for(const file of uiFiles){const source=parse(file);function visit(node:ts.Node){if(ts.isCallExpression(node)&&node.expression.getText(source)==='Alert.alert'){count++;for(const arg of node.arguments.slice(0,2)){let raw=false;function literals(n:ts.Node){if(ts.isStringLiteral(n)||ts.isTemplateExpression(n)||ts.isNoSubstitutionTemplateLiteral(n))raw=true;ts.forEachChild(n,literals);}literals(arg);expect(raw,`${file}: ${arg.getText(source)}`).toBe(false);}}ts.forEachChild(node,visit);}visit(source);}expect(count).toBeGreaterThan(0);
});
it('keeps date display through shared helpers',()=>{
 for(const file of uiFiles){const source=parse(file);expect(source.text,file).not.toMatch(/\.toLocale(?:Date|Time)?String\(/);function visit(node:ts.Node){if(ts.isJsxExpression(node)&&node.expression&&!ts.isJsxAttribute(node.parent)&&ts.isPropertyAccessExpression(node.expression)){const value=node.expression;if(!/Copy$/.test(value.expression.getText(source)))expect(value.getText(source),file).not.toMatch(/\.(?:date|due|from|until|anchor|month|taxYear|lastSync|asOf|finishedAt|attemptedAt|at)$/);}ts.forEachChild(node,visit);}visit(source);}
});
