const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const IGNORE_DIRS = new Set(['.next','node_modules','.git','dist','build','coverage','scripts']);
const TEXT_EXT = new Set(['.ts','.tsx','.js','.jsx']);

function walk(dir) {
  const out=[];
  for (const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,ent.name);
    if(ent.isDirectory()){
      if(IGNORE_DIRS.has(ent.name)) continue;
      out.push(...walk(full));
    } else if(ent.isFile()){
      if(TEXT_EXT.has(path.extname(ent.name).toLowerCase())) out.push(full);
    }
  }
  return out;
}

const s = (...codes) => String.fromCharCode(...codes);

const repls = [
  { from: s(0x2026), to: '...' },     // â€¦
  { from: s(0x00B7), to: '|' },       // Â·
  { from: s(0x00A9), to: '(c)' },     // Â©
  { from: s(0x2192), to: '->' },      // â†’
  { from: s(0x2318), to: 'Ctrl' },    // âŒ˜
  { from: s(0x00D7), to: 'x' },       // Ã—
  { from: s(0x2014), to: '-' },       // â€”
  { from: s(0x2022), to: '*' },       // â€¢
  { from: s(0x2265), to: '>=' },      // â‰¥
  { from: s(0x2264), to: '<=' },      // â‰¤
];

const files = [
  ...walk(path.join(ROOT,'app')),
  ...walk(path.join(ROOT,'components')),
  ...walk(path.join(ROOT,'lib')),
];

let changed=0;
for (const abs of files){
  const raw = fs.readFileSync(abs,'utf8');
  let next = raw;
  for (const r of repls) next = next.split(r.from).join(r.to);
  if (next !== raw){
    fs.writeFileSync(abs,next,'utf8');
    changed++;
  }
}
console.log('changed_files',changed);
