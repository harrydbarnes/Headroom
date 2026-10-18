const {spawnSync,execFileSync}=require('node:child_process');
const path=require('node:path');
execFileSync(process.execPath,[path.join(__dirname,'prepare-dependencies.cjs'),'--check'],{stdio:'inherit'});
const run=process.platform==='win32'
 ?spawnSync('cmd.exe',['/d','/s','/c','npm audit --json'],{encoding:'utf8'})
 :spawnSync('npm',['audit','--json'],{encoding:'utf8'});
if(run.error)throw run.error;
if(![0,1].includes(run.status))throw Error('Dependency audit process did not complete.');
let audit;try{audit=JSON.parse(run.stdout);}catch{throw Error('Dependency audit unavailable; no clean-audit claim can be made.');}
if(audit.error||!audit.metadata||!audit.vulnerabilities)throw Error('Dependency audit did not return a valid result.');
const mitigated=new Map([
 ['https://github.com/advisories/GHSA-vfj7-8cjw-p6xm','braces'],
 ['https://github.com/advisories/GHSA-86w9-cpqp-85rv','node-forge']
]);
const findings=Object.values(audit.vulnerabilities).flatMap(v=>v.via).filter(v=>typeof v==='object');
for(const v of Object.values(audit.vulnerabilities))for(const via of v.via)if(typeof via==='string'&&!audit.vulnerabilities[via])throw Error('Unclassified dependency audit chain: '+via);
for(const finding of findings)if(mitigated.get(finding.url)!==finding.name)throw Error('Unmitigated dependency advisory: '+finding.url);
if(Object.keys(audit.vulnerabilities).length&&!findings.length)throw Error('Dependency audit has unclassified findings.');
console.log('Published-package audit:',JSON.stringify(audit.metadata.vulnerabilities));
console.log('Accepted only the two named advisories with verified local source mitigations. This is not a zero-audit result.');
