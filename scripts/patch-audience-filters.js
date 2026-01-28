const fs = require('fs');
const p = 'components/alunbrig/audience/AudienceInsights.tsx';
let s = fs.readFileSync(p, 'utf8');

function ensureImport(afterNeedle, importBlock) {
  if (s.includes(importBlock.trim())) return;
  const idx = s.indexOf(afterNeedle);
  if (idx === -1) throw new Error('Could not find import anchor: ' + afterNeedle);
  const end = s.indexOf('\n', idx) + 1;
  s = s.slice(0, end) + importBlock + s.slice(end);
}

ensureImport(
  'import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"',
  [
    'import { Badge } from "@/components/ui/badge"',
    'import { FilterPane } from "@/components/alunbrig/filters/FilterPane"',
    'import { ActiveFiltersBar, type ActiveFilterChip } from "@/components/alunbrig/filters/ActiveFiltersBar"',
    '',
  ].join('\n')
);

if (!s.includes('const hasUnsavedChanges = useMemo')) {
  s = s.replace(
    'const apply = useCallback(() => setApplied(draft), [draft])',
    [
      'const apply = useCallback(() => setApplied(draft), [draft])',
      '',
      '  const discard = useCallback(() => {',
      '    if (applied) setDraft(applied)',
      '  }, [applied])',
      '',
      '  const hasUnsavedChanges = useMemo(() => {',
      '    if (!applied) return false',
      '    try {',
      '      return JSON.stringify(draft) !== JSON.stringify(applied)',
      '    } catch {',
      '      return true',
      '    }',
      '  }, [draft, applied])',
      '',
      '  const activeChips = useMemo<ActiveFilterChip[]>(() => {',
      '    const chips: ActiveFilterChip[] = []',
      '    if (draft.audience && draft.audience !== "All") chips.push({ key: "aud", label: `Audience: ${draft.audience}`, onClear: () => setDraft((d) => ({ ...d, audience: "All" })) })',
      '    if (draft.includeLowRelevance) chips.push({ key: "low", label: "Include low relevance", onClear: () => setDraft((d) => ({ ...d, includeLowRelevance: false })) })',
      '    if (draft.searchText?.trim()) chips.push({ key: "search", label: `Search: "${draft.searchText.trim()}"`, onClear: () => setDraft((d) => ({ ...d, searchText: "" })) })',
      '    return chips',
      '  }, [draft])',
    ].join('\n')
  );
}

const startMarker = '      <Card className="border-border/50">\n        <CardHeader>\n          <div className="flex items-center justify-between gap-3">\n            <CardTitle className="text-base font-medium">Controls</CardTitle>';
const endMarker = '      </Card>\n\n      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">';
const start = s.indexOf(startMarker);
const end = s.indexOf(endMarker, start);
if (start === -1 || end === -1) throw new Error('Could not locate audience controls card');

const replacement = [
  '      <FilterPane',
  '        title="Filters"',
  '        description={',
  '          <span>Refine audience slice across charts (<span className="text-foreground">social media data</span>).</span>',
  '        }',
  '        hasUnsavedChanges={hasUnsavedChanges}',
  '        rightSlot={',
  '          <div className="flex items-center gap-2">',
  '            {hasUnsavedChanges ? (',
  '              <Button type="button" variant="outline" size="sm" onClick={discard}>Discard</Button>',
  '            ) : null}',
  '            <Button type="button" size="sm" onClick={apply}>Apply</Button>',
  '          </div>',
  '        }',
  '        metaLine={applied ? <Badge variant="secondary">Applied</Badge> : null}',
  '      >',
  '        <div className="grid gap-3 md:grid-cols-6">',
  '          <div className="md:col-span-2 space-y-1">',
  '            <div className="text-xs text-muted-foreground">Date range</div>',
  '            <div className="flex items-center gap-2">',
  '              <Input type="date" value={draft.startDate} onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))} />',
  '              <div className="text-xs text-muted-foreground">→</div>',
  '              <Input type="date" value={draft.endDate} onChange={(e) => setDraft((d) => ({ ...d, endDate: e.target.value }))} />',
  '            </div>',
  '          </div>',
  '          <div className="md:col-span-2 space-y-1">',
  '            <div className="text-xs text-muted-foreground">Search</div>',
  '            <Input value={draft.searchText} onChange={(e) => setDraft((d) => ({ ...d, searchText: e.target.value }))} placeholder="Keyword across text + topics" />',
  '          </div>',
  '          <div className="md:col-span-2 grid grid-cols-2 gap-3">',
  '            <label className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2">',
  '              <span className="text-sm">Include low</span>',
  '              <Switch checked={draft.includeLowRelevance} onCheckedChange={(v) => setDraft((d) => ({ ...d, includeLowRelevance: v }))} />',
  '            </label>',
  '            <label className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2">',
  '              <span className="text-sm">Audience</span>',
  '              <span className="text-sm text-muted-foreground">{draft.audience}</span>',
  '            </label>',
  '          </div>',
  '          <div className="md:col-span-6">',
  '            <ActiveFiltersBar chips={activeChips} />',
  '          </div>',
  '        </div>',
  '      </FilterPane>',
].join('\n');

s = s.slice(0, start) + replacement + s.slice(end + '      </Card>\n\n'.length);
fs.writeFileSync(p, s, 'utf8');
console.log('patched');
console.log('hasFilterPane', s.includes('FilterPane'));
