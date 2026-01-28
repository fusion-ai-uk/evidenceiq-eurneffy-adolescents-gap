const fs = require('fs');
const path = require('path');

const roots = [
  'components/alunbrig',
  'components/app-shell.tsx',
  'lib/alunbrig',
];

function listFiles(p) {
  const out = [];
  if (!fs.existsSync(p)) return out;
  const st = fs.statSync(p);
  if (st.isFile()) return [p];
  const entries = fs.readdirSync(p, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(p, e.name);
    if (e.isDirectory()) out.push(...listFiles(full));
    else if (e.isFile()) out.push(full);
  }
  return out;
}

const targets = Array.from(new Set(roots.flatMap(listFiles)))
  .filter((p) => p.endsWith('.ts') || p.endsWith('.tsx'));

const s = (...codes) => String.fromCharCode(...codes);

// Mojibake markers
const C2 = s(0x00C2); // Ã‚
const E2 = s(0x00E2); // Ã¢
const C3 = s(0x00C3); // Ãƒ
const FFFD = s(0xFFFD); // ï¿½

// Correct outputs via codepoints (avoid terminal encoding corruption)
const OUT_DOT = s(0x00B7); // ·
const OUT_COPY = s(0x00A9); // ©
const OUT_ARROW = s(0x2192); // →
const OUT_EMDASH = s(0x2014); // —
const OUT_TIMES = s(0x00D7); // ×
const OUT_CMD = s(0x2318); // ⌘

const rules = [
  // Remove stray Ã‚ before common punctuation
  { re: new RegExp(`${C2}(?=${OUT_DOT})`, 'g'), to: '' }, // Ã‚·
  { re: new RegExp(`${C2}(?=${OUT_COPY})`, 'g'), to: '' }, // Ã‚©

  // Windows-1252 mojibake sequences
  { from: s(0x00E2, 0x20AC, 0x00A6), to: '...' }, // Ã¢â‚¬Â¦ (ellipsis)
  { from: s(0x00E2, 0x20AC, 0x201D), to: OUT_EMDASH }, // Ã¢â‚¬"
  { from: s(0x00E2, 0x2020, 0x2019), to: OUT_ARROW }, // Ã¢â€ '
  { from: s(0x00C3, 0x2014), to: OUT_TIMES }, // Ãƒ—

  // Curly quotes/apostrophes mojibake
  { from: s(0x00E2, 0x20AC, 0x0153), to: '"' }, // Ã¢â‚¬Å“
  { from: s(0x00E2, 0x20AC, 0x009D), to: '"' }, // Ã¢â‚¬ï¿½
  { from: s(0x00E2, 0x20AC, 0x2122), to: "'" }, // Ã¢â‚¬â„¢

  // ⌘ (E2 8C 98) -> Ã¢Å’Ëœ
  { from: s(0x00E2, 0x0152, 0x02DC), to: OUT_CMD },
];

function applyOnce(raw) {
  let next = raw;
  for (const r of rules) {
    if (r.re) next = next.replace(r.re, r.to);
    else next = next.split(r.from).join(r.to);
  }
  return next;
}

let totalChanged = 0;
for (let pass = 0; pass < 5; pass++) {
  let changedThisPass = 0;
  for (const p of targets) {
    const raw = fs.readFileSync(p, 'utf8');
    const next = applyOnce(raw);
    if (next !== raw) {
      fs.writeFileSync(p, next, 'utf8');
      changedThisPass++;
    }
  }
  totalChanged += changedThisPass;
  if (!changedThisPass) break;
}

const markers = [C2, E2, C3, FFFD];
let remaining = 0;
for (const p of targets) {
  const txt = fs.readFileSync(p, 'utf8');
  if (markers.some((m) => txt.includes(m))) {
    remaining++;
    console.log('STILL_HAS_MARKER', p);
  }
}

console.log('total_changed_files_over_passes', totalChanged);
console.log('remaining_files_with_markers', remaining);
process.exit(remaining ? 2 : 0);
