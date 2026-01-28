const fs = require('fs');
const files=[
  'components/alunbrig/audience/AudienceInsights.tsx',
  'components/alunbrig/competitors/CompetitorLens.tsx',
  'components/alunbrig/trends/TrendsExplorer.tsx',
  'components/alunbrig/sequencing/SequencingExplorer.tsx',
  'components/alunbrig/themes/GeneralThemesExplorer.tsx',
  'components/alunbrig/themes/ExamplePostsDrawer.tsx',
  'components/alunbrig/filters/MultiSelect.tsx',
  'components/app-shell.tsx',
  'lib/alunbrig/trendsFilters.ts',
];
const needles=['Ã‚·','Ã¢â€ '','Ã¢â‚¬Â¦','Ã¢â‚¬"','Ãƒ—','Ã¢â‚¬Å“','Ã¢â‚¬Â','Ã‚©'];
for (const f of files) {
  const s = fs.readFileSync(f,'utf8');
  const out = {};
  for (const n of needles) {
    const c = s.split(n).length-1;
    if (c>0) out[n]=c;
  }
  if (Object.keys(out).length) console.log(f, out);
}
