const fs = require('fs');
const p = 'components/alunbrig/competitors/CompetitorLens.tsx';
let s = fs.readFileSync(p, 'utf8');

function ensureImport(afterNeedle, importBlock) {
  if (s.includes(importBlock.trim())) return;
  const idx = s.indexOf(afterNeedle);
  if (idx === -1) throw new Error('Could not find import anchor: ' + afterNeedle);
  const end = s.indexOf('\n', idx) + 1;
  s = s.slice(0, end) + importBlock + s.slice(end);
}

ensureImport(
  'import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"',
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
      '    if (draft.targetBrand.trim()) chips.push({ key: "target", label: `Target: ${draft.targetBrand.trim()}`, onClear: () => setDraft((d) => ({ ...d, targetBrand: "" })) })',
      '    if (draft.competitor) chips.push({ key: "competitor", label: `Competitor: ${draft.competitor}`, onClear: () => setDraft((d) => ({ ...d, competitor: "" })) })',
      '    if (draft.includeLowRelevance) chips.push({ key: "low", label: "Include low relevance", onClear: () => setDraft((d) => ({ ...d, includeLowRelevance: false })) })',
      '    if (draft.sequencingOnly) chips.push({ key: "seqOnly", label: "Sequencing only", onClear: () => setDraft((d) => ({ ...d, sequencingOnly: false })) })',
      '    if (draft.searchText?.trim()) chips.push({ key: "search", label: `Search: "${draft.searchText.trim()}"`, onClear: () => setDraft((d) => ({ ...d, searchText: "" })) })',
      '    if (draft.stakeholderPrimary?.length) chips.push({ key: "stakeholder", label: `Stakeholder: ${draft.stakeholderPrimary.join(", ")}`, onClear: () => setDraft((d) => ({ ...d, stakeholderPrimary: [] })) })',
      '    if (draft.sentimentLabel?.length) chips.push({ key: "sentiment", label: `Sentiment: ${draft.sentimentLabel.join(", ")}`, onClear: () => setDraft((d) => ({ ...d, sentimentLabel: [] })) })',
      '    if (draft.ukNation?.length) chips.push({ key: "uk", label: `UK nation: ${draft.ukNation.join(", ")}`, onClear: () => setDraft((d) => ({ ...d, ukNation: [] })) })',
      '    if (draft.evidenceType?.length) chips.push({ key: "evidence", label: `Evidence: ${draft.evidenceType.join(", ")}`, onClear: () => setDraft((d) => ({ ...d, evidenceType: [] })) })',
      '    return chips',
      '  }, [draft])',
    ].join('\n')
  );
}

const startMarker = '      <Card className="border-border/50">\n        <CardHeader>\n          <CardTitle className="text-base font-medium">Filters</CardTitle>';
const endMarker = '      </Card>\n\n      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">';
const start = s.indexOf(startMarker);
const end = s.indexOf(endMarker);
if (start === -1 || end === -1 || end < start) throw new Error('Could not locate competitor filter block');

const replacement = [
  '      <FilterPane',
  '        title="Filters"',
  '        description={',
  '          <span>',
  '            Refine competitor slice and positioning signals (<span className="text-foreground">social media data</span>).',
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
  '            <Button type="button" size="sm" onClick={apply} disabled={!draft.startDate || !draft.endDate}>',
  '              Apply',
  '            </Button>',
  '          </div>',
  '        }',
  '        metaLine={',
  '          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">',
  '            {optionsLoading ? (',
  '              <span>Loading filter options...</span>',
  '            ) : options?.meta ? (',
  '              <span>',
  '                <span className="text-foreground">{options.meta.totalPosts.toLocaleString()}</span> posts in range · {options.meta.minDate} → {options.meta.maxDate}',
  '              </span>',
  '            ) : null}',
  '            {applied ? <Badge variant="secondary">Applied</Badge> : null}',
  '          </div>',
  '        }',
  '        advancedOpen={filtersAdvancedOpen}',
  '        onAdvancedOpenChange={setFiltersAdvancedOpen}',
  '        advanced={',
  '          <div className="grid gap-4 md:grid-cols-2">',
  '            <div className="space-y-2">',
  '              <div className="text-xs text-muted-foreground">Stakeholder (primary)</div>',
  '              <MultiSelect value={draft.stakeholderPrimary} options={options?.stakeholderPrimary || []} onChange={(v) => setDraft((d) => ({ ...d, stakeholderPrimary: v }))} placeholder="All stakeholders" />',
  '            </div>',
  '            <div className="space-y-2">',
  '              <div className="text-xs text-muted-foreground">Sentiment label</div>',
  '              <MultiSelect value={draft.sentimentLabel} options={options?.sentimentLabel || []} onChange={(v) => setDraft((d) => ({ ...d, sentimentLabel: v }))} placeholder="All sentiment labels" />',
  '            </div>',
  '            <div className="space-y-2">',
  '              <div className="text-xs text-muted-foreground">UK nation</div>',
  '              <MultiSelect value={draft.ukNation} options={options?.ukNation || []} onChange={(v) => setDraft((d) => ({ ...d, ukNation: v }))} placeholder="All UK nations" />',
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
  '            <div className="text-xs text-muted-foreground">Target brand</div>',
  '            <Input value={draft.targetBrand} onChange={(e) => setDraft((d) => ({ ...d, targetBrand: e.target.value }))} placeholder="e.g., Alunbrig" />',
  '          </div>',
  '          <div className="md:col-span-2 space-y-1">',
  '            <div className="text-xs text-muted-foreground">Competitor</div>',
  '            <Select value={draft.competitor || "__overall__"} onValueChange={(v) => setDraft((d) => ({ ...d, competitor: v === "__overall__" ? "" : v }))}>',
  '              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>',
  '              <SelectContent>',
  '                <SelectItem value="__overall__">Overall competitive landscape</SelectItem>',
  '                {(list?.competitors || []).slice(0, 50).map((c, i) => (',
  '                  <SelectItem key={`${c.name}-${i}`} value={c.name}>{c.name}</SelectItem>',
  '                ))}',
  '              </SelectContent>',
  '            </Select>',
  '          </div>',
  '          <div className="md:col-span-2 space-y-1">',
  '            <div className="text-xs text-muted-foreground">Search</div>',
  '            <Input value={draft.searchText} onChange={(e) => setDraft((d) => ({ ...d, searchText: e.target.value }))} placeholder="Keyword across text + topics" />',
  '          </div>',
  '          <div className="md:col-span-2 space-y-1">',
  '            <div className="text-xs text-muted-foreground">Trends granularity</div>',
  '            <Select value={draft.granularity} onValueChange={(v) => setDraft((d) => ({ ...d, granularity: v }))}>',
  '              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>',
  '              <SelectContent><SelectItem value="week">Week</SelectItem><SelectItem value="month">Month</SelectItem></SelectContent>',
  '            </Select>',
  '          </div>',
  '          <div className="md:col-span-2 grid grid-cols-2 gap-3">',
  '            <label className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2">',
  '              <span className="text-sm">Sequencing only</span>',
  '              <Switch checked={draft.sequencingOnly} onCheckedChange={(v) => setDraft((d) => ({ ...d, sequencingOnly: v }))} />',
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
