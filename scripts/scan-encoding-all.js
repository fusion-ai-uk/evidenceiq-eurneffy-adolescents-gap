const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const IGNORE_DIRS = new Set(['.next', 'node_modules', '.git', 'dist', 'build', 'coverage']);

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (IGNORE_DIRS.has(ent.name)) continue;
      out.push(...walk(full));
    } else if (ent.isFile()) {
      out.push(full);
    }
  }
  return out;
}

const MARKERS = [
  { name: 'U+00C2', ch: String.fromCharCode(0x00C2) }, // Ã‚
  { name: 'U+00E2', ch: String.fromCharCode(0x00E2) }, // Ã¢
  { name: 'U+00C3', ch: String.fromCharCode(0x00C3) }, // Ãƒ
  { name: 'U+FFFD', ch: String.fromCharCode(0xFFFD) }, // ï¿½
];

const TEXT_EXT = new Set(['.ts','.tsx','.js','.jsx','.mjs','.cjs','.json','.md','.css','.scss','.txt']);

const files = walk(ROOT)
  .filter((p) => TEXT_EXT.has(path.extname(p).toLowerCase()))
  .filter((p) => !p.includes(`${path.sep}terminals${path.sep}`));

const hits = [];
for (const abs of files) {
  let raw;
  try {
    raw = fs.readFileSync(abs, 'utf8');
  } catch {
    continue;
  }
  for (const m of MARKERS) {
    const idx = raw.indexOf(m.ch);
    if (idx !== -1) {
      const start = Math.max(0, idx - 40);
      const end = Math.min(raw.length, idx + 60);
      const snippet = raw.slice(start, end).replace(/\r/g,'\\r').replace(/\n/g,'\\n');
      hits.push({ file: path.relative(ROOT, abs), marker: m.name, idx, snippet });
      break;
    }
  }
}

hits.sort((a,b)=> a.file.localeCompare(b.file));
console.log('files_with_markers', new Set(hits.map(h=>h.file)).size);
for (const h of hits.slice(0, 80)) {
  console.log(`\n${h.file} ${h.marker} @${h.idx}: ...${h.snippet}...`);
}
if (hits.length > 80) console.log(`\n...and ${hits.length-80} more hits`);

// Also emit a machine-readable list
fs.writeFileSync('scripts/encoding-hits.json', JSON.stringify(hits, null, 2), 'utf8');
process.exit(hits.length ? 2 : 0);
