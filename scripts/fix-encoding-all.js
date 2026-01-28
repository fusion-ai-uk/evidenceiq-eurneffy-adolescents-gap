const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const IGNORE_DIRS = new Set(['.next', 'node_modules', '.git', 'dist', 'build', 'coverage']);
const TEXT_EXT = new Set(['.ts','.tsx','.js','.jsx','.mjs','.cjs','.json','.md','.css','.scss','.txt']);

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (IGNORE_DIRS.has(ent.name)) continue;
      out.push(...walk(full));
    } else if (ent.isFile()) {
      const ext = path.extname(ent.name).toLowerCase();
      if (TEXT_EXT.has(ext)) out.push(full);
    }
  }
  return out;
}

const s = (...codes) => String.fromCharCode(...codes);

const C2 = s(0x00C2); // Ã‚
const E2 = s(0x00E2); // Ã¢
const C3 = s(0x00C3); // Ãƒ
const FFFD = s(0xFFFD);

const OUT_DOT = s(0x00B7); // Â·
const OUT_COPY = s(0x00A9); // Â©
const OUT_ARROW = s(0x2192); // â†’
const OUT_EMDASH = s(0x2014); // â€”
const OUT_TIMES = s(0x00D7); // Ã—
const OUT_CMD = s(0x2318); // âŒ˜
const OUT_SPARKLES = s(0x2728); // âœ¨

const rules = [
  { re: new RegExp(`${C2}(?=${OUT_DOT})`, 'g'), to: '' },
  { re: new RegExp(`${C2}(?=${OUT_COPY})`, 'g'), to: '' },

  { from: s(0x00E2, 0x20AC, 0x00A6), to: '...' },
  { from: s(0x00E2, 0x20AC, 0x201D), to: OUT_EMDASH },
  { from: s(0x00E2, 0x2020, 0x2019), to: OUT_ARROW },
  { from: s(0x00C3, 0x2014), to: OUT_TIMES },
  { from: s(0x00E2, 0x20AC, 0x0153), to: '"' },
  { from: s(0x00E2, 0x20AC, 0x009D), to: '"' },
  { from: s(0x00E2, 0x20AC, 0x2122), to: "'" },
  { from: s(0x00E2, 0x0152, 0x02DC), to: OUT_CMD },
  { from: s(0x00E2, 0x015C, 0x00A8), to: OUT_SPARKLES },

  { re: new RegExp(FFFD, 'g'), to: '' },
];

function applyOnce(raw) {
  let next = raw;
  for (const r of rules) {
    if (r.re) next = next.replace(r.re, r.to);
    else next = next.split(r.from).join(r.to);
  }
  return next;
}

const files = walk(ROOT);

let changed = 0;
for (const abs of files) {
  const rel = path.relative(ROOT, abs);
  // Don't rewrite our own scripts/ and scan artifacts; they may legitimately contain marker chars as examples.
  if (rel.startsWith('scripts' + path.sep)) continue;

  const raw = fs.readFileSync(abs, 'utf8');
  const next = applyOnce(raw);
  if (next !== raw) {
    fs.writeFileSync(abs, next, 'utf8');
    changed++;
    console.log('fixed', rel);
  }
}

// verify (excluding scripts/)
const markers = [C2, E2, C3, FFFD];
let remaining = 0;
for (const abs of files) {
  const rel = path.relative(ROOT, abs);
  if (rel.startsWith('scripts' + path.sep)) continue;
  const txt = fs.readFileSync(abs, 'utf8');
  if (markers.some((m) => txt.includes(m))) {
    remaining++;
    console.log('STILL_HAS', rel);
  }
}

console.log('changed_files', changed);
console.log('remaining_files', remaining);
process.exit(remaining ? 2 : 0);
