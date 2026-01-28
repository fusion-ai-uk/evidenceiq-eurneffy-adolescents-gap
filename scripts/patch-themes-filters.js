const fs = require('fs');
const p = 'components/alunbrig/themes/GeneralThemesExplorer.tsx';
let s = fs.readFileSync(p, 'utf8');

function ensureImport(afterNeedle, importBlock) {
  if (s.includes(importBlock.trim())) return;
  const idx = s.indexOf(afterNeedle);
  if (idx === -1) throw new Error('Could not find import anchor: ' + afterNeedle);
  const end = s.indexOf('\n', idx) + 1;
  s = s.slice(0, end) + importBlock + s.slice(end);
}

ensureImport(
  'import { ExamplePostsDrawer } from "@/components/alunbrig/themes/ExamplePostsDrawer"',
  [
    'import { Input } from "@/components/ui/input"',
    'import { Switch } from "@/components/ui/switch"',
    'import { Checkbox } from "@/components/ui/checkbox"',
    'import { FilterPane } from "@/components/alunbrig/filters/FilterPane"',
    'import { MultiSelect } from "@/components/alunbrig/filters/MultiSelect"',
    'import { ActiveFiltersBar, type ActiveFilterChip } from "@/components/alunbrig/filters/ActiveFiltersBar"',
    '',
  ].join('\n')
);

if (!s.includes('filtersAdvancedOpen')) {
  s = s.replace(
    'const [drawerGroupValue, setDrawerGroupValue] = useState("")',
    'const [drawerGroupValue, setDrawerGroupValue] = useState("")\n  const [filtersAdvancedOpen, setFiltersAdvancedOpen] = useState(false)'
  );
}

if (!s.includes('const activeChips = useMemo<ActiveFilterChip[]>')) {
  const needle = '\n  return (\n';
  const insertAt = s.indexOf(needle);
  if (insertAt === -1) throw new Error('Could not find return anchor');
  const helpers = [
    '',
    '  const activeChips = useMemo<ActiveFilterChip[]>(() => {',
    '    const chips: ActiveFilterChip[] = []',
    '    if (searchText.trim()) chips.push({ key: "search", label: `Search: "${searchText.trim()}"`, onClear: () => setSearchText("") })',
    '    if (includeLowRelevance) chips.push({ key: "low", label: "Include low relevance", onClear: () => setIncludeLowRelevance(false) })',
    '    if (sequencingOnly) chips.push({ key: "seqOnly", label: "Sequencing only", onClear: () => setSequencingOnly(false) })',
    '    if (stakeholderPrimary.length) chips.push({ key: "stakeholder", label: `Stakeholder: ${stakeholderPrimary.join(", ")}`, onClear: () => setStakeholderPrimary([]) })',
    '    if (sentimentLabel.length) chips.push({ key: "sentiment", label: `Sentiment: ${sentimentLabel.join(", ")}`, onClear: () => setSentimentLabel([]) })',
    '    if (ukNation.length) chips.push({ key: "uk", label: `UK nation: ${ukNation.join(", ")}`, onClear: () => setUkNation([]) })',
    '    if (evidenceType.length) chips.push({ key: "evidence", label: `Evidence: ${evidenceType.join(", ")}`, onClear: () => setEvidenceType([]) })',
    '    if (flags.length) chips.push({ key: "flags", label: `Flags: ${flags.join(", ")}`, onClear: () => setFlags([]) })',
    '    return chips',
    '  }, [searchText, includeLowRelevance, sequencingOnly, stakeholderPrimary, sentimentLabel, ukNation, evidenceType, flags])',
    '',
    '  const resetAll = useCallback(() => {',
    '    setStakeholderPrimary([])',
    '    setSentimentLabel([])',
    '    setUkNation([])',
    '    setEvidenceType([])',
    '    setFlags([])',
    '    setSequencingOnly(false)',
    '    setIncludeLowRelevance(false)',
    '    setSearchText("")',
    '    setSentimentThreshold(0)',
    '  }, [])',
    '',
  ].join('\n');
  s = s.slice(0, insertAt) + helpers + s.slice(insertAt);
}

const start = s.indexOf('          {/* Global filters */}');
const end = s.indexOf('          <Tabs value={tab}', start);
if (start === -1 || end === -1) throw new Error('Could not locate Global filters block');

const newBlock = [
  '          {/* Global filters */}',
  '          <FilterPane',
  '            title="Filters"',
  '            description={',
  '              <span>',
  '                Refine the slice used across charts and tables (<span className="text-foreground">social media data</span>).',
  '              </span>',
  '            }',
  '            rightSlot={',
  '              <Button variant="outline" size="sm" onClick={resetAll}>',
  '                Reset',
  '              </Button>',
  '            }',
  '            metaLine={',
  '              optionsLoading ? (',
  '                <span className="flex items-center gap-2">',
  '                  <Skeleton className="h-2 w-2 rounded-full" /> Loading filter options...',
  '                </span>',
  '              ) : options?.meta ? (',
  '                <span>',
  '                  Slice contains <span className="text-foreground">{options.meta.totalPosts.toLocaleString()}</span> posts (min {options.meta.minDate}, max {options.meta.maxDate})',
  '                </span>',
  '              ) : null',
  '            }',
  '            advancedOpen={filtersAdvancedOpen}',
  '            onAdvancedOpenChange={setFiltersAdvancedOpen}',
  '            advanced={',
  '              <div className="grid gap-4 md:grid-cols-2">',
  '                <div className="space-y-2">',
  '                  <div className="text-xs text-muted-foreground">Stakeholder (primary)</div>',
  '                  <MultiSelect value={stakeholderPrimary} options={options?.stakeholderPrimary || []} onChange={setStakeholderPrimary} placeholder="All stakeholders" />',
  '                </div>',
  '                <div className="space-y-2">',
  '                  <div className="text-xs text-muted-foreground">Sentiment label</div>',
  '                  <MultiSelect value={sentimentLabel} options={options?.sentimentLabel || []} onChange={setSentimentLabel} placeholder="All sentiment labels" />',
  '                </div>',
  '                <div className="space-y-2">',
  '                  <div className="text-xs text-muted-foreground">UK nation</div>',
  '                  <MultiSelect value={ukNation} options={options?.ukNation || []} onChange={setUkNation} placeholder="All UK nations" />',
  '                </div>',
  '                <div className="space-y-2">',
  '                  <div className="text-xs text-muted-foreground">Evidence type</div>',
  '                  <MultiSelect value={evidenceType} options={options?.evidenceType || []} onChange={setEvidenceType} placeholder="All evidence types" />',
  '                </div>',
  '                <div className="md:col-span-2 space-y-2">',
  '                  <div className="text-xs text-muted-foreground">Flags</div>',
  '                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">',
  '                    {[',
  '                      { id: "efficacy", label: "Efficacy" },',
  '                      { id: "safety", label: "Safety" },',
  '                      { id: "neurotox", label: "Neurotox" },',
  '                      { id: "qol", label: "QoL" },',
  '                      { id: "caregiver", label: "Caregiver" },',
  '                      { id: "cns", label: "CNS" },',
  '                      { id: "uk_access", label: "UK access" },',
  '                    ].map((f) => {',
  '                      const active = flags.includes(f.id)',
  '                      return (',
  '                        <label key={f.id} className="flex items-center gap-2 text-sm">',
  '                          <Checkbox',
  '                            checked={active}',
  '                            onCheckedChange={(v) => {',
  '                              const next = new Set(flags)',
  '                              v ? next.add(f.id) : next.delete(f.id)',
  '                              setFlags(Array.from(next))',
  '                            }}',
  '                          />',
  '                          <span>{f.label}</span>',
  '                        </label>',
  '                      )',
  '                    })}',
  '                  </div>',
  '                </div>',
  '              </div>',
  '            }',
  '          >',
  '            <div className="grid gap-3 md:grid-cols-6">',
  '              <div className="md:col-span-2 space-y-1">',
  '                <div className="text-xs text-muted-foreground">Date range</div>',
  '                <div className="flex items-center gap-2">',
  '                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />',
  '                  <div className="text-xs text-muted-foreground">→</div>',
  '                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />',
  '                </div>',
  '              </div>',
  '              <div className="md:col-span-2 space-y-1">',
  '                <div className="text-xs text-muted-foreground">Search</div>',
  '                <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Keyword across text + topics" />',
  '              </div>',
  '              <div className="md:col-span-2 grid grid-cols-2 gap-3">',
  '                <label className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2">',
  '                  <span className="text-sm">Include low</span>',
  '                  <Switch checked={includeLowRelevance} onCheckedChange={setIncludeLowRelevance} />',
  '                </label>',
  '                <label className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2">',
  '                  <span className="text-sm">Sequencing only</span>',
  '                  <Switch checked={sequencingOnly} onCheckedChange={setSequencingOnly} />',
  '                </label>',
  '              </div>',
  '              <div className="md:col-span-6">',
  '                <ActiveFiltersBar chips={activeChips} onClearAll={resetAll} />',
  '              </div>',
  '            </div>',
  '          </FilterPane>',
  '',
].join('\n');

s = s.slice(0, start) + newBlock + s.slice(end);
fs.writeFileSync(p, s, 'utf8');
console.log('patched');
console.log('hasFilterPane', s.includes('FilterPane'));
