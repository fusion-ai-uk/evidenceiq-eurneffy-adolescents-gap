const fs = require('fs');
const files = [
  'components/alunbrig/audience/AudienceInsights.tsx',
  'components/alunbrig/competitors/CompetitorLens.tsx',
  'components/alunbrig/sequencing/SequencingExplorer.tsx',
  'components/alunbrig/themes/ExamplePostsDrawer.tsx',
  'components/alunbrig/themes/GeneralThemesExplorer.tsx',
  'components/alunbrig/trends/TrendsExplorer.tsx',
  'components/app-shell.tsx',
];

const bad = [
  { name: 'U+00C2', ch: String.fromCharCode(0x00C2) }, // Ã‚
  { name: 'U+00E2', ch: String.fromCharCode(0x00E2) }, // Ã¢
  { name: 'U+00C3', ch: String.fromCharCode(0x00C3) }, // Ãƒ
  { name: 'U+FFFD', ch: String.fromCharCode(0xFFFD) }, // ï¿½
];

for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  let printed = 0;
  for (const b of bad) {
    let idx = s.indexOf(b.ch);
    while (idx !== -1) {
      const start = Math.max(0, idx - 40);
      const end = Math.min(s.length, idx + 40);
      const snippet = s.slice(start, end).replace(/\r/g, '\\r').replace(/\n/g, '\\n');
      console.log(`\n${f} ${b.name} at ${idx}: ...${snippet}...`);
      printed++;
      if (printed >= 6) break;
      idx = s.indexOf(b.ch, idx + 1);
    }
    if (printed >= 6) break;
  }
  if (!printed) console.log(`\n${f}: OK`);
}
