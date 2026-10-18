import ts from 'typescript';
export function stringStructure(){
 const config=ts.readConfigFile('tsconfig.json',ts.sys.readFile).config,parsed=ts.parseJsonConfigFileContent(config,ts.sys,'.'),program=ts.createProgram(parsed.fileNames,parsed.options),checker=program.getTypeChecker();
 const files=program.getSourceFiles().filter(f=>!f.isDeclarationFile&&!f.fileName.includes('node_modules'));
 const rel=(f:ts.SourceFile)=>f.fileName.replace(/\\/g,'/').replace(process.cwd().replace(/\\/g,'/')+'/','');
 const references=new Map<ts.Symbol,number>();
 for(const file of files){if(!rel(file).startsWith('src/')&&!rel(file).startsWith('App.tsx'))continue;function visit(n:ts.Node){if(ts.isPropertyAccessExpression(n)||ts.isElementAccessExpression(n)){const symbol=checker.getSymbolAtLocation(ts.isPropertyAccessExpression(n)?n.name:n.argumentExpression);if(symbol)for(const root of checker.getRootSymbols(symbol))references.set(root,(references.get(root)||0)+1);}ts.forEachChild(n,visit);}visit(file);}
 const entries:{file:string;root:string;key:string;value:string|null;references:number}[]=[];
 for(const file of files){if(!rel(file).startsWith('src/strings/'))continue;for(const statement of file.statements)if(ts.isVariableStatement(statement)&&statement.modifiers?.some(m=>m.kind===ts.SyntaxKind.ExportKeyword))for(const decl of statement.declarationList.declarations){if(!decl.initializer)continue;let obj=decl.initializer;if(ts.isAsExpression(obj))obj=obj.expression;if(!ts.isObjectLiteralExpression(obj))continue;
  function collect(object:ts.ObjectLiteralExpression,prefix:string){for(const p of object.properties)if(ts.isPropertyAssignment(p)){const key=ts.isIdentifier(p.name)||ts.isStringLiteral(p.name)?p.name.text:'';const symbol=checker.getSymbolAtLocation(p.name);entries.push({file:rel(file),root:decl.name.getText(file),key:prefix+key,value:ts.isStringLiteralLike(p.initializer)?p.initializer.text:null,references:symbol?references.get(symbol)||0:0});if(ts.isObjectLiteralExpression(p.initializer))collect(p.initializer,prefix+key+'.');}}
  collect(obj,'');
 }}return entries;
}
/** Indexed by a validated theme enum or the four explicit CSV mapping fields.
 * These nested labels have no individual property-access syntax in the UI. */
export const dynamicStringKeys:Record<string,string>={
 'settingsUI.themeLabels.system':'Selected by the system/light/dark theme enum in Settings.',
 'settingsUI.themeLabels.light':'Selected by the system/light/dark theme enum in Settings.',
 'settingsUI.themeLabels.dark':'Selected by the system/light/dark theme enum in Settings.',
 'toolsCopy.csvColumnLabels.date':'Selected by the explicit CSV mapping field list in AccountLedger.',
 'toolsCopy.csvColumnLabels.merchant':'Selected by the explicit CSV mapping field list in AccountLedger.',
 'toolsCopy.csvColumnLabels.amount':'Selected by the explicit CSV mapping field list in AccountLedger.',
 'toolsCopy.csvColumnLabels.credit':'Selected by the explicit CSV mapping field list in AccountLedger.',
};
