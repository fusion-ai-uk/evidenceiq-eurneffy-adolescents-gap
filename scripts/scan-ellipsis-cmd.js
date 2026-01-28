const fs=require('fs');
const path=require('path');
const ROOT=process.cwd();
const IGNORE=new Set(['.next','node_modules','.git','dist','build','coverage','scripts']);
const EXT=new Set(['.ts','.tsx']);
function walk(dir){
  const out=[];
  for (const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,ent.name);
    if(ent.isDirectory()){
      if(IGNORE.has(ent.name)) continue;
      out.push(...walk(full));
    } else if(ent.isFile()){
      if(EXT.has(path.extname(ent.name).toLowerCase())) out.push(full);
    }
  }
  return out;
}
const files=[...walk(path.join(ROOT,'components')),...walk(path.join(ROOT,'app'))];
const targets=[
  {name:'ellipsis', ch: String.fromCharCode(0x2026)},
  {name:'cmd', ch: String.fromCharCode(0x2318)},
];
let count=0;
for (const f of files){
  const s=fs.readFileSync(f,'utf8');
  const hit=targets.filter(t=>s.includes(t.ch)).map(t=>t.name);
  if(hit.length){
    console.log(path.relative(ROOT,f), hit.join(','));
    count++;
  }
}
console.log('files_with_ellipsis_or_cmd',count);
