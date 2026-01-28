const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const IGNORE_DIRS = new Set(['.next','node_modules','.git','dist','build','coverage']);
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

const targets = walk(ROOT).map(p=>path.relative(ROOT,p));
const chars = [
  {name:'ellipsis', ch: String.fromCharCode(0x2026)}, // â€¦
  {name:'middot', ch: String.fromCharCode(0x00B7)}, // Â·
  {name:'copyright', ch: String.fromCharCode(0x00A9)}, // Â©
  {name:'arrow', ch: String.fromCharCode(0x2192)}, // â†’
  {name:'cmd', ch: String.fromCharCode(0x2318)}, // âŒ˜
  {name:'times', ch: String.fromCharCode(0x00D7)}, // Ã—
  {name:'emdash', ch: String.fromCharCode(0x2014)}, // â€”
  {name:'bullet', ch: String.fromCharCode(0x2022)}, // â€¢
];

const countsByFile = [];
for (const rel of targets) {
  const abs = path.join(ROOT, rel);
  const s = fs.readFileSync(abs,'utf8');
  const hit = {};
  for (const c of chars) {
    const n = s.split(c.ch).length - 1;
    if (n>0) hit[c.name]=n;
  }
  if (Object.keys(hit).length) countsByFile.push({file: rel, ...hit});
}

countsByFile.sort((a,b)=>a.file.localeCompare(b.file));
console.log('files_with_ui_unicode', countsByFile.length);
for (const r of countsByFile.slice(0,60)) console.log(r);
if (countsByFile.length>60) console.log('...and', countsByFile.length-60, 'more');
