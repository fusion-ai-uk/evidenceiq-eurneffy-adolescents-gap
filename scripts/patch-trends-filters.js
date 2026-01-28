const fs = require('fs');
const p = 'components/alunbrig/trends/TrendsExplorer.tsx';
let s = fs.readFileSync(p, 'utf8');

function ensureImport(afterNeedle, importBlock) {
  if (s.includes(importBlock.trim())) return;
  const idx = s.indexOf(afterNeedle);
  if (idx === -1) throw new Error('Could not find import anchor: ' + afterNeedle);
  const end = s.indexOf('\n', idx) + 1;
  s = s.slice(0, end) + importBlock + s.slice(end);
}

ensureImport(
  'import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"',
  [
    'import { Badge } from "@/components/ui/badge"',
    'import { FilterPane } from "@/components/alunbrig/filters/FilterPane"',
    'import { MultiSelect } from "@/components/alunbrig/filters/MultiSelect"',
    'import { ActiveFiltersBar, type ActiveFilterChip } from "@/components/alunbrig/filters/ActiveFiltersBar"',
    '',
  ].join('\n')
);

if (!s.includes('const [filtersAdvancedOpen')) {
  s = s.replace(
    'const [drawerArgs, setDrawerArgs] = useState<Record<string, string>>({})',
    'const [drawerArgs, setDrawerArgs] = useState<Record<string, string>>({})\n  const [filtersAdvancedOpen, setFiltersAdvancedOpen] = useState(false)'
  );
}

if (!s.includes('const hasUnsavedChanges = useMemo')) {
  s = s.replace(
    'const apply = useCallback(() => setApplied({ ...draft, sentimentLabel: allowedSentiments }), [draft, allowedSentiments])',
    [
      'const apply = useCallback(() => setApplied({ ...draft, sentimentLabel: allowedSentiments }), [draft, allowedSentiments])',
      '',
      '  const discard = useCallback(() => {',
      '    if (applied) {',
      '      const { sentimentLabel: _sl, ...rest } = applied as any',
      '      setDraft(rest)',
      '    }',
      '  }, [applied])',
      '',
      '  const hasUnsavedChanges = useMemo(() => {',
      '    if (!applied) return false',
      '    try {',
      '      const { sentimentLabel: _sl, ...rest } = applied as any',
      '      return JSON.stringify(draft) !== JSON.stringify(rest)',
      '    } catch {',
      '      return true',
      '    }',
      '  }, [draft, applied])',
      '',
      '  const activeChips = useMemo<ActiveFilterChip[]>(() => {',
      '    const chips: ActiveFilterChip[] = []',
      '    if (draft.searchText.trim()) chips.push({ key: "search", label: `Search: "${draft.searchText.trim()}"`, onClear: () => setDraft((d) => ({ ...d, searchText: "" })) })',
      '    if (draft.sequencingOnly) chips.push({ key: "seqOnly", label: "Sequencing only", onClear: () => setDraft((d) => ({ ...d, sequencingOnly: false })) })',
      '    if (draft.ukOnly) chips.push({ key: "ukOnly", label: "UK only", onClear: () => setDraft((d) => ({ ...d, ukOnly: false })) })',
      '    if (draft.includeLowRelevance) chips.push({ key: "low", label: "Include low relevance", onClear: () => setDraft((d) => ({ ...d, includeLowRelevance: false })) })',
      '    if (draft.sentimentGroup !== "all") chips.push({ key: "sent", label: `Sentiment: ${draft.sentimentGroup}`, onClear: () => setDraft((d) => ({ ...d, sentimentGroup: "all" })) })',
      '    if (draft.stakeholder.length) chips.push({ key: "stakeholder", label: `Stakeholder: ${draft.stakeholder.join(", ")}`, onClear: () => setDraft((d) => ({ ...d, stakeholder: [] })) })',
      '    if (draft.evidenceType.length) chips.push({ key: "evidence", label: `Evidence: ${draft.evidenceType.join(", ")}`, onClear: () => setDraft((d) => ({ ...d, evidenceType: [] })) })',
      '    if (draft.flags.length) chips.push({ key: "flags", label: `Flags: ${draft.flags.join(", ")}`, onClear: () => setDraft((d) => ({ ...d, flags: [] })) })',
      '    return chips',
      '  }, [draft])',
    ].join('\n')
  );
}

const startMarker = '      <Card className="border-border/50">\n        <CardHeader>\n          <div className="flex items-center justify-between gap-3">\n            <CardTitle className="text-base font-medium">Controls</CardTitle>';
const nextCardMarker = '      </Card>\n\n      <Card className="border-border/50">';
const start = s.indexOf(startMarker);
const end = s.indexOf(nextCardMarker, start);
if (start === -1 || end === -1) throw new Error('Could not locate trends controls card');

const replacement = [
  '      <FilterPane',
  '        title="Filters"',
  '        description={',
  '          <span>',
  '            Configure trend slice and alerting thresholds (<span className="text-foreground">social media data</span>).',
  '          </span>',
  '        }',
  '        hasUnsavedChanges={hasUnsavedChanges}',
  '        rightSlot={',
  '          <div className="flex items-center gap-2">',
  '            {hasUnsavedChanges ? (',
  '              <Button type="button" variant="outline" size="sm" onClick={discard}>',
  '                Discard',
  '              </Button>',
  '            ) : null}',
  '            <Button type="button" size="sm" onClick={apply} disabled={optionsLoading}>',
  '              Apply',
  '            </Button>',
  '          </div>',
  '        }',
  '        metaLine={',
  '          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">',
  '            {optionsLoading ? <span>Loading filter options...</span> : options?.meta ? (',
  '              <span><span className="text-foreground">{options.meta.totalPosts.toLocaleString()}</span> posts · {options.meta.minDate} → {options.meta.maxDate}</span>',
  '            ) : null}',
  '            {applied ? <Badge variant="secondary">Applied</Badge> : null}',
  '          </div>',
  '        }',
  '        advancedOpen={filtersAdvancedOpen}',
  '        onAdvancedOpenChange={setFiltersAdvancedOpen}',
  '        advanced={',
  '          <div className="grid gap-4 md:grid-cols-2">',
  '            <div className="space-y-2">',
  '              <div className="text-xs text-muted-foreground">Stakeholder</div>',
  '              <MultiSelect value={draft.stakeholder} options={["HCP","Patient","Caregiver","Payer","Other"]} onChange={(v) => setDraft((d) => ({ ...d, stakeholder: v }))} placeholder="All stakeholders" />',
  '            </div>',
  '            <div className="space-y-2">',
  '              <div className="text-xs text-muted-foreground">Evidence type</div>',
  '              <MultiSelect value={draft.evidenceType} options={options?.evidenceType || []} onChange={(v) => setDraft((d) => ({ ...d, evidenceType: v }))} placeholder="All evidence types" />',
  '            </div>',
  '          </div>',
  '        }',
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
  '          <div className="md:col-span-2 space-y-1">',
  '            <div className="text-xs text-muted-foreground">Granularity</div>',
  '            <Select value={draft.granularity} onValueChange={(v) => setDraft((d) => ({ ...d, granularity: v }))}>',
  '              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>',
  '              <SelectContent><SelectItem value="day">Day</SelectItem><SelectItem value="week">Week</SelectItem><SelectItem value="month">Month</SelectItem></SelectContent>',
  '            </Select>',
  '          </div>',
  '          <div className="md:col-span-2 space-y-1">',
  '            <div className="text-xs text-muted-foreground">Sentiment group</div>',
  '            <Select value={draft.sentimentGroup} onValueChange={(v) => setDraft((d) => ({ ...d, sentimentGroup: v }))}>',
  '              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>',
  '              <SelectContent>',
  '                <SelectItem value="all">All</SelectItem>',
  '                <SelectItem value="positive">Positive</SelectItem>',
  '                <SelectItem value="neutral">Neutral</SelectItem>',
  '                <SelectItem value="negative">Negative</SelectItem>',
  '                <SelectItem value="mixed">Mixed</SelectItem>',
  '              </SelectContent>',
  '            </Select>',
  '          </div>',
  '          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-3 gap-3">',
  '            <label className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2">',
  '              <span className="text-sm">Sequencing only</span>',
  '              <Switch checked={draft.sequencingOnly} onCheckedChange={(v) => setDraft((d) => ({ ...d, sequencingOnly: v }))} />',
  '            </label>',
  '            <label className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2">',
  '              <span className="text-sm">UK only</span>',
  '              <Switch checked={draft.ukOnly} onCheckedChange={(v) => setDraft((d) => ({ ...d, ukOnly: v }))} />',
  '            </label>',
  '            <label className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2">',
  '              <span className="text-sm">Include low</span>',
  '              <Switch checked={draft.includeLowRelevance} onCheckedChange={(v) => setDraft((d) => ({ ...d, includeLowRelevance: v }))} />',
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
