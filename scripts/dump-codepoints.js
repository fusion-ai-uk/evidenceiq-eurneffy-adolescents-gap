const fs=require('fs');
const samples=[
  {f:'components/alunbrig/competitors/CompetitorLens.tsx', idx:16755, label:'comp_arrow'},
  {f:'components/alunbrig/audience/AudienceInsights.tsx', idx:10549, label:'aud_apostrophe'},
  {f:'components/alunbrig/audience/AudienceInsights.tsx', idx:22918, label:'aud_emdash'},
  {f:'components/app-shell.tsx', idx:3901, label:'app_cmdk'},
];
for (const s of samples){
  const txt=fs.readFileSync(s.f,'utf8');
  const slice=txt.slice(s.idx, s.idx+6);
  const codes=[...slice].map(ch=>ch.codePointAt(0).toString(16).toUpperCase().padStart(4,'0'));
  console.log('\n',s.label,s.f,'idx',s.idx,'slice',JSON.stringify(slice),'codes',codes.join(' '));
}
