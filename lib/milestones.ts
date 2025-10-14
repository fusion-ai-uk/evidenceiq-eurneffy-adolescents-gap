export type Milestone = {
  date: string
  title: string
  impact: 'Low' | 'Medium' | 'High'
  tags?: string[]
  supportingMetrics?: { count?: number; pctChange?: number; z?: number }
  narrative: string
}

export const milestones: Milestone[] = [
  {
    date: '2024-11-18',
    title: 'Pre-ASH buzz (CAR-T & bispecific preview)',
    impact: 'High',
    tags: ['CAR-T', 'bispecifics'],
    supportingMetrics: { count: 728, pctChange: 1.56, z: 3.26 },
    narrative:
      'Strong pre-ASH lift with CAR-T chatter dominant; early bispecific/ADC mentions. Use to prime HCP/analyst recaps.',
  },
  {
    date: '2024-12-10',
    title: 'ASH 2024 Congress — bispecific durability',
    impact: 'High',
    tags: ['Congress', 'bispecifics'],
    narrative:
      'ASH discussions around durability and safety drive engagement; bispecifics signal grows vs Zynlonta baseline.',
  },
  {
    date: '2025-01-27',
    title: 'Post-ASH debrief cycle',
    impact: 'Medium',
    supportingMetrics: { count: 512, pctChange: 0.93, z: 2.64 },
    narrative:
      'Editorial roundups and clinician threads synthesize ASH takeaways; CAR-T still leads but bispecifics persist.',
  },
  {
    date: '2025-02-24',
    title: 'Bispecifics moving into 2L (implementation chatter)',
    impact: 'Medium',
    tags: ['2L', 'practice change'],
    supportingMetrics: { count: 558, pctChange: 0.4, z: 2.14 },
    narrative:
      'Conversation shifts to access/implementation as bispecifics expand into earlier lines; payer concerns begin to surface.',
  },
  {
    date: '2025-04-14',
    title: 'Spring lull (pre-congress)',
    impact: 'Low',
    supportingMetrics: { count: 214, pctChange: -0.43, z: -2.37 },
    narrative:
      'A trough before summer congress season; useful as contrast to event-led spikes.',
  },
  {
    date: '2025-06-23',
    title: 'EHA/ICML window; LOTIS-7 combo buzz (Lonca + Glofit)',
    impact: 'High',
    tags: ['EHA', 'ICML', 'LOTIS-7'],
    supportingMetrics: { count: 967, pctChange: 0.91, z: 16.48 },
    narrative:
      'Major summer spike; heavy CAR-T and bispecific dialogue and Lonca combo mentions/testing optimism.',
  },
  {
    date: '2025-09-22',
    title: 'Late-September congress/news cycle',
    impact: 'Medium',
    tags: ['Congress season', 'bispecifics'],
    supportingMetrics: { count: 554, pctChange: 0.53, z: 2.2 },
    narrative:
      'Another lift aligned with late-Sept meetings; bispecific-weighted conversation with sustained CAR-T interest.',
  },
]


