import {expect,it} from 'vitest';
import {readFileSync,readdirSync} from 'node:fs';
import ts from 'typescript';
import {toUserMessage,genericError} from '../src/strings/errors';
const files=(dir:string):string[]=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(dir+'/'+e.name):/\.tsx?$/.test(e.name)?[dir+'/'+e.name]:[]);
/** Dynamic exceptions carry provider, saved validation or native errors. Review
 * exact source expressions so a newly introduced dynamic throw also fails. */
const dynamic:Record<string,string>={
 'src/lib/connectionStatus.ts:error':'Rethrows a status fetch error or the explicit status fallback below. Both are checked at their sources.',
 'src/lib/reconciliation.ts:preview.reasons.join(" ")':'Combines explicit preview guard reasons. Their literals are scanned separately below.',
 'src/services/api.ts:data.error || "The finance API could not complete this request."':'Provider response error is translated at the UI boundary; fallback is scanned separately.',
 'src/services/useBanking.ts:useFinance.getState().mutationError || "Imported data or receipt failed validation. Previous figures retained."':'Store validation error is already covered at its source; fallback is scanned separately.',
 'server/index.ts:"Enable Banking setup failed: " + await result.text()':'Operator-only startup diagnostic containing a server response.',
};
function normal(node:ts.Node,source:ts.SourceFile){return ts.createPrinter().printNode(ts.EmitHint.Unspecified,node,source).replace(/'/g,'"');}
function samples(node:ts.Expression):string[]{
 if(ts.isStringLiteralLike(node))return [node.text];
 if(ts.isTemplateExpression(node))return [node.head.text+node.templateSpans.map(s=>'7'+s.literal.text).join('')];
 if(ts.isConditionalExpression(node))return [...samples(node.whenTrue),...samples(node.whenFalse)];
 if(ts.isParenthesizedExpression(node))return samples(node.expression);
 if(ts.isBinaryExpression(node)){
  if(node.operatorToken.kind===ts.SyntaxKind.PlusToken){const a=samples(node.left),b=samples(node.right);return (a.length?a:['7']).flatMap(x=>(b.length?b:['7']).map(y=>x+y));}
  return [...samples(node.left),...samples(node.right)];
 }
 return [];
}
it('maps every thrown static message and explicitly reviews dynamic exceptions',()=>{
 const failures:string[]=[],seen=new Set<string>();let checked=0;
 for(const file of [...files('src'),...files('server'),'App.tsx']){
  if(file.startsWith('src/strings/'))continue;
  const source=ts.createSourceFile(file,readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  function check(node:ts.Expression){const values=samples(node);for(const value of values){checked++;if(toUserMessage(value)===genericError)failures.push(`${file}: ${JSON.stringify(value)}`);}}
  function visit(node:ts.Node){
   if((ts.isCallExpression(node)||ts.isNewExpression(node))&&ts.isIdentifier(node.expression)&&/^(?:Error|RangeError|TypeError|SyntaxError)$/.test(node.expression.text)){
    const arg=node.arguments?.[0];if(!arg)failures.push(file+': empty Error()');else{
     const id=file+':'+normal(arg,source);const reason=dynamic[id];if(reason){seen.add(id);if(!reason.trim())failures.push(id+': missing reason');}
     else if(!samples(arg).length)failures.push(id+': unreviewed dynamic error');
     if(!reason||file!=='server/index.ts')check(arg);
    }
   }
   if(ts.isThrowStatement(node)&&ts.isStringLiteralLike(node.expression))check(node.expression);
   if(file==='src/lib/reconciliation.ts'&&ts.isCallExpression(node)&&node.expression.getText(source)==='reasons.push')for(const arg of node.arguments)check(arg);
   if(file==='src/lib/connectionStatus.ts'&&ts.isConditionalExpression(node)&&ts.isStringLiteralLike(node.whenFalse))check(node.whenFalse);
   ts.forEachChild(node,visit);
  }visit(source);
 }
 expect(checked).toBeGreaterThan(140);expect(failures).toEqual([]);
 expect([...seen].sort()).toEqual(Object.keys(dynamic).sort());
});
