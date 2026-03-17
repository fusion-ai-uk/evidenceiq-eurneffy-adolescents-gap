import { humanizeLabel } from "@/lib/evidence/display"

const HELP_TEXT: Record<string, string> = {
  // Page-level headers
  "Overview":
    "This page is the fastest read of the filtered evidence set. Scores show where evidence is strongest, while gap indicators show where important information is still missing. Use this view to decide where to drill in next.",
  "Pillars":
    "Each pillar score shows how strongly sources support that strategic theme. High pillar score means stronger support for that pillar, not necessarily stronger UK-adolescent evidence. Always pair with confidence, directness, and caution context.",
  "Topic & Gap Explorer":
    "This page compares topic coverage against gap pressure. Use it to separate well-supported topics from topics that look important but still need KOL input or additional research.",
  "Barrier & Behaviour Explorer":
    "This view explains what gets in the way and why. Barrier tags show friction points; behavioural and social tags explain underlying human drivers behind those barriers.",
  "Dosing / Response / Risk Settings":
    "These three tabs isolate practical decision points: dosing transitions, recognition/response behaviour, and risk settings. Read this page as an operational map of where use can break down.",
  "EURneffy Opportunity View":
    "This page is opportunity framing, not final recommendation logic. High EURneffy relevance means the source informs where EURneffy may fit; support level and cautions show how direct or indirect that support is.",
  "Evidence Explorer":
    "This is the source-level proof table. Scores show usefulness, tags show topic fit, and the detail drawer/extracts show underlying evidence text supporting each classification.",
  "Comparison Lab":
    "Build two cohorts and compare evidence and gap profiles side-by-side. This tests whether a narrative changes when criteria are tightened for UK-direct, adolescent-direct, or high-confidence sources.",
  "Gap Prioritization Workspace":
    "This workspace ranks missing evidence by likely strategic impact. Prioritize high-gap, high-directness questions first, then convert those into KOL and follow-up research actions.",
  "Methodology":
    "This page defines what each score and label means, including confidence, directness, and caution fields. Share it with non-analyst reviewers before interpreting dashboard outputs.",
  "Methodology / Definitions":
    "This page defines what each score and label means, including confidence, directness, and caution fields. Share it with non-analyst reviewers before interpreting dashboard outputs.",

  // Reusable module titles
  "Coverage vs Gap Matrix":
    "Coverage is how much relevant support exists for a topic; gap pressure is how strongly sources indicate unresolved evidence needs. High coverage with high gap pressure usually means context exists but decision-grade detail is missing.",
  "Source type":
    "Shows who evidence comes from (for example regulator, guideline body, registry, or study source). This helps users distinguish institutional context from primary empirical evidence.",
  "Evidence type":
    "Classifies what kind of evidence this is, such as guideline, observational study, or safety communication. It helps explain why some sources are directional context while others are stronger proof.",
  "Article kind":
    "Describes the source artifact format (for example guidance page, study page, policy notice). Use this to understand whether a row is primary evidence, context, or operational guidance.",
  "Population directness":
    "Shows how directly evidence matches the target adolescent population. Lower directness means findings are more proxy-based and should be interpreted cautiously.",
  "Geography directness":
    "Shows how directly evidence matches the target UK-first geography. Higher directness means stronger UK applicability; lower directness means Europe/non-UK proxy context.",
  "Barrier tags":
    "Most frequent friction points surfaced in the current view. These tags summarize what gets in the way of timely carriage, recognition, or use.",
  "Setting tags":
    "Most frequent environments where burden/risk appears (for example school, travel, sport, home). Use these to identify where interventions likely need setting-specific support.",
  "Behavioural drivers":
    "Shows the behavioral mechanisms most often linked to barrier outcomes in the current cohort (for example low risk perception, avoidance, or anxiety). Higher percentages mean that driver appears in more rows. Use this panel to identify the core behavior-change levers to address first.",
  "Social psychology tags":
    "Highlights social and identity-related pressures connected to barrier behavior (for example transition to independence, peer acceptance, fear of standing out, or mental burden). Read this as the social context behind non-adherence. This supports moving from clinical framing to real-world teen experience framing.",
  "Training error tags":
    "Shows the most frequent training or execution failure patterns in current evidence (for example forgetting steps under stress, wrong threshold, or incorrect demonstration). Higher values indicate where practical guidance and rehearsal support are most needed.",
  "Barrier x setting co-occurrence":
    "Shows which barriers most frequently appear in which real-world settings (for example school, community, travel, sport). Each pair indicates a repeated pattern, not a single anecdote. Use this to prioritize setting-specific interventions where barrier friction is highest.",
  "Barrier x behavioural-driver co-occurrence":
    "Shows which behavioral drivers repeatedly sit underneath specific barriers (for example training gap -> low risk perception). This helps explain why barriers persist and where message or support design should intervene first.",
  "Barrier x training-error co-occurrence":
    "Shows which barriers are most often linked to specific training or technique failures. Use this as an action map for practical enablement: where people fail under pressure, where training content is unclear, and which errors should be prioritized for correction.",
  "Dosing tag distribution":
    "Shows the most frequent dosing-transition signals in the current cohort (for example second dose need, weight thresholds, under-dosing risk, and dose-strength mentions). Higher percentages indicate where dosing uncertainty appears most often.",
  "Dosing x gap relationship":
    "Connects dosing-transition evidence to the gap themes it most often exposes. Use this to see whether dosing evidence is mainly missing adolescent breakout, UK breakout, real-world error data, or other decision-critical detail.",
  "Dosing x barrier relationship":
    "Shows where dosing-transition issues overlap with practical or behavioral barriers (for example not carrying devices, uncertainty, or training friction). This helps prioritize dosing interventions that also remove real-world barriers.",
  "Recognition/response tags":
    "Shows the most frequent recognition and response failure patterns (for example delayed adrenaline, hesitation, or technique uncertainty). Read this as the front-line failure map for emergency action.",
  "Training error crossover":
    "Shows the most common training or execution error types found alongside recognition/response issues. Use this to identify the highest-value training fixes that could improve emergency performance.",
  "Recognition x training co-occurrence":
    "Maps repeated pairs of recognition problems and training errors. This turns abstract gaps into practical correction targets (what people misunderstand, and what they then do wrong under pressure).",
  "Settings ranking":
    "Shows which real-world settings are most represented in the filtered evidence (for example community, school, home, travel, or sport). Higher percentages show where risk and burden patterns appear most often.",
  "Setting x gap relationship":
    "Shows which evidence gaps are most common within setting-of-risk rows. Use this to identify where setting-specific insight is still missing and where follow-up research should focus first.",
  "Setting x barrier relationship":
    "Shows repeated pairings between settings and barriers (for example school -> training gap). This is useful for designing setting-specific support plans rather than one-size-fits-all solutions.",
  "Data gap tags":
    "Structured labels for what evidence is missing (for example no UK adolescent breakout, no real-world error data). These are core signals for research prioritization.",
  "EUR opportunity tags":
    "Evidence-linked opportunity themes relevant to EURneffy framing. Treat as hypothesis signals; validate with support level and med/legal caution context.",
  "EURneffy opportunity tags":
    "Evidence-linked opportunity themes relevant to EURneffy framing. Treat as hypothesis signals; validate with support level and med/legal caution context.",
  "Gap kind":
    "Primary category of what is missing in the evidence. Use with gap reasons and summary to understand whether this is a missing subgroup, missing setting breakout, or missing quantification issue.",
  "Gap reasons (structured)":
    "Machine-structured reasons behind a gap label. These improve transparency by showing exactly why a row is considered a gap signal.",
  "Contextual support indicator":
    "Shows whether sources are direct support, contextual support, weak connection, or no clear support. This helps non-analysts avoid treating all evidence rows as equally direct proof.",
  "Cautions & Med/Legal Review":
    "Highlights fields that need conservative interpretation. This panel helps prevent overclaiming by showing caution phrases and medical/legal review flags.",
  "Recrawl / Validation Shortlist":
    "Rows likely affected by capture quality issues. Prioritize these for recrawl before treating them as true strategic gaps.",
  "Current filtered cohort at-a-glance":
    "Quick read of strongest and weakest pillar/topic scores in the current filter context. Use this as orientation before drilling into evidence detail.",
  "Brief Fit Snapshot":
    "Average fit metrics for the current filtered cohort. These indicate direction and relative strength, not final claim certainty.",
  "Gap signal summary":
    "Share view of where key breakouts are missing (adolescent, UK, real-world error, setting, equity). Higher percentages indicate stronger follow-up priority.",
  "Pillar score averages":
    "Average score by strategic pillar across the current selection.",
  "Topic score averages":
    "Average score by topic across the current selection.",
  "Source type distribution":
    "Distribution of institutional source origins in the current selection.",
  "Evidence type distribution":
    "Distribution of evidence categories (for example guideline, observational, safety communication).",
  "Best use distribution":
    "Distribution of recommended strategic workflow role for current rows.",
  "Novelty distribution":
    "How much evidence appears to add incremental value beyond baseline expected coverage.",
  "Gap priority distribution":
    "Distribution of gap-priority levels from none to critical under current filters.",
  "Top data gap tags":
    "Most common structured evidence gaps in the current selection.",
  "Top gap kinds":
    "Most common primary gap categories in the current selection.",
  "Top barrier tags":
    "Most common barrier themes currently represented.",
  "Top setting tags":
    "Most common risk settings represented.",
  "Top EUR opportunity tags":
    "Most frequent EURneffy-relevant opportunity themes in current evidence.",
  "Top EURneffy opportunity tags":
    "Most frequent EURneffy-relevant opportunity themes in current evidence.",
  "Top gap themes (high-priority rows)":
    "Shows the most common structured gap themes among rows already marked high/critical priority. Use this to identify the dominant unresolved evidence problems driving strategic risk.",
  "What still needs answering":
    "Consolidated open-question view combining follow-up research asks, KOL prompts, and unresolved practical unknowns from the filtered cohort.",
  "KOL questions":
    "Most frequent expert-input questions implied by the current evidence gaps. Use this panel to shape interview guides around the highest-impact unknowns.",
  "Follow-up research questions":
    "Most frequent desk-research questions implied by current evidence gaps. These questions help define what should be verified in published sources before stakeholder interviews.",
  "Missing stats we wish we had":
    "Most frequent missing quantitative measures that would make decisions more robust. Use this to prioritize exactly which metrics need to be sourced or generated.",
  "Best evidence for selected topic":
    "Highest-support topic rows ranked for fast proof review. Use this table to inspect what the strongest currently available evidence says.",
  "Best gap evidence for selected topic":
    "Highest-priority gap rows for the selected topic. Use this to inspect where evidence is thin, absent, or insufficiently broken out.",
  "Topic evidence ledger":
    "Full topic-level row list for audit and drilldown. Use this ledger to verify how broad themes map back to source-level evidence context.",
  "Barrier overview (weighted)":
    "Ranks barrier families by weighted gap signal under current filters. Higher bars indicate barrier areas where unresolved evidence pressure is concentrated.",
  "Top supporting evidence rows":
    "Rows with strongest available support signal in the selected barrier context.",
  "Top gap rows for barrier context":
    "Rows with strongest unresolved evidence pressure in the selected barrier context.",
  "Barrier evidence ledger":
    "Complete row-level evidence list for the selected barrier family.",
  "Dosing proof points":
    "Highest-support rows for dosing-transition interpretation, ranked for rapid evidence inspection.",
  "Dosing gaps":
    "Highest-priority unresolved dosing-transition evidence gaps under current cohort filters.",
  "Response proof points":
    "Highest-support recognition/response rows, useful for validating what is currently known about emergency behavior patterns.",
  "Response gaps":
    "Highest-priority recognition/response gaps, highlighting where emergency-behavior evidence remains insufficient.",
  "Setting supporting evidence":
    "Highest-support rows for settings-of-risk interpretation.",
  "Setting gap evidence":
    "Highest-priority settings-of-risk gaps showing where setting-specific evidence is still missing.",
  "Opportunity tag ranking":
    "Ranks EURneffy opportunity themes by frequency and average gap signal. Use this to identify opportunity areas that are common and evidence-constrained.",
  "Top related barriers":
    "Most frequent barrier tags associated with this opportunity family.",
  "Top caution statements":
    "Most frequent caution statements attached to this opportunity family. Use these as guardrails to avoid over-interpreting indirect support.",
  "Top KOL questions":
    "Highest-frequency KOL questions surfaced within the current opportunity cohort.",
  "Top follow-up research questions":
    "Highest-frequency follow-up desk-research questions surfaced within the current opportunity cohort.",
  "Top missing stats":
    "Highest-frequency missing quantitative measures surfaced within the current opportunity cohort.",
  "EURneffy evidence table":
    "Source-level table for EURneffy-relevant rows. Use this to inspect support context, gap pressure, and proof detail before making strategic interpretations.",
  "Gap evidence drilldown rows":
    "Row-level drilldown list of the strongest gap signals under current filters.",
  "KOL question bank":
    "Prioritized KOL interview questions generated from the current gap set.",
  "Follow-up research question bank":
    "Prioritized desk-research questions generated from the current gap set.",
  "Missing stats bank":
    "Prioritized list of missing quantitative measures generated from the current gap set.",
  "Cohort comparison summary":
    "Side-by-side metric summary showing how cohort definitions change the overall evidence and gap profile.",
  "Barrier differences (A vs B)":
    "Largest barrier-tag count shifts between cohort A and B.",
  "Setting differences (A vs B)":
    "Largest setting-tag count shifts between cohort A and B.",
  "Gap differences (A vs B)":
    "Largest data-gap-tag count shifts between cohort A and B.",
  "EURneffy opportunity differences (A vs B)":
    "Largest EURneffy opportunity-tag count shifts between cohort A and B.",
  "Top evidence rows in Cohort A":
    "Highest-support evidence rows under cohort A definition.",
  "Top evidence rows in Cohort B":
    "Highest-support evidence rows under cohort B definition.",
  "Top gaps in Cohort A":
    "Highest-priority gap rows under cohort A definition.",
  "Top gaps in Cohort B":
    "Highest-priority gap rows under cohort B definition.",

  // Common metric labels
  "Average confidence":
    "Average confidence in enrichment quality and interpretability for the current selection. Lower values indicate more uncertainty in how rows were classified.",
  "Average UK relevance":
    "Average relevance to UK decision context across selected rows. Higher values suggest stronger UK applicability.",
  "Average adolescent specificity":
    "Average directness to adolescent populations across selected rows. Higher values indicate less reliance on proxy populations.",
  "Average pillar score":
    "Average strength of support for the selected pillar. This reflects thematic support, not necessarily evidence quality on its own.",
  "Gap pressure":
    "How strongly selected evidence indicates unresolved information needs. High values suggest decision-critical missing evidence.",
  "Evidence signal":
    "How useful the source is for developing evidence-led messaging or interpretation.",
  "Gap signal":
    "How useful the source is for identifying what is still missing in the evidence base.",
  "High-priority gap signal":
    "Share of the filtered cohort marked high/critical gap priority.",
  "High-priority gap signals":
    "Share of the filtered cohort currently marked high or critical gap priority for this brief.",
  "High-priority gap share":
    "Share of the filtered cohort currently marked high or critical gap priority for this brief.",
  "Strong EUR relevance signals":
    "Rows with stronger EURneffy opportunity-space relevance in the current selection.",
  "Strong EURneffy relevance signals":
    "Rows with stronger EURneffy opportunity-space relevance in the current selection.",
  "Direct adolescent evidence signals":
    "Rows with high adolescent specificity/directness.",
  "UK-direct evidence signals":
    "Rows with high UK relevance/directness.",
  "KOL input signals":
    "Share of the filtered cohort surfacing explicit KOL follow-up question signals.",
  "KOL input share":
    "Share of the filtered cohort surfacing explicit KOL follow-up question signals.",
  "Evidence with usable stats":
    "Rows that include at least one usable quantitative proof point.",
  "Med/legal caution signals":
    "Rows with medical/legal caution flags requiring conservative interpretation.",
  "Average gap signal":
    "Average gap-analysis score for the current row set. Higher values indicate stronger concentration of unresolved evidence needs.",
  "Avg gap signal":
    "Average gap-analysis score for the current row set. Higher values indicate stronger concentration of unresolved evidence needs.",
  "Missing-breakout burden":
    "Composite percentage showing how often key breakout dimensions are missing at row level (adolescent, UK, real-world error, setting, equity). Higher values indicate denser unresolved evidence structure.",
  "Critical gaps":
    "Share of the filtered cohort marked critical gap priority. These represent the most urgent unresolved evidence needs.",
  "Critical gap share":
    "Share of the filtered cohort marked critical gap priority. These represent the most urgent unresolved evidence needs.",
  "No adolescent breakout":
    "Share of the filtered cohort that does not report an adolescent-specific breakout.",
  "No adolescent breakout share":
    "Share of the filtered cohort that does not report an adolescent-specific breakout.",
  "No UK breakout":
    "Share of the filtered cohort that does not report a UK-specific breakout.",
  "No UK breakout share":
    "Share of the filtered cohort that does not report a UK-specific breakout.",
  "No real-world error data":
    "Share of the filtered cohort lacking real-world misuse/error evidence.",
  "No real-world error data share":
    "Share of the filtered cohort lacking real-world misuse/error evidence.",
  "No setting-specific data":
    "Share of the filtered cohort lacking setting-level breakout evidence.",
  "No setting-specific data share":
    "Share of the filtered cohort lacking setting-level breakout evidence.",
  "No equity subgroup data":
    "Share of the filtered cohort lacking equity subgroup breakout evidence.",
  "No equity subgroup data share":
    "Share of the filtered cohort lacking equity subgroup breakout evidence.",
  "Rows with med/legal flags":
    "Share of the filtered cohort carrying medical/legal caution flags.",
  "Med/legal flag share":
    "Share of the filtered cohort carrying medical/legal caution flags.",
  "KOL question signals":
    "Share of the filtered cohort that surfaces explicit KOL follow-up prompts.",
  "KOL question signal share":
    "Share of the filtered cohort that surfaces explicit KOL follow-up prompts.",
  "Missing-stat signals":
    "Share of the filtered cohort that explicitly references a missing quantitative metric.",
  "Missing-stat signal share":
    "Share of the filtered cohort that explicitly references a missing quantitative metric.",
  "Gap-heavy rows":
    "Share of the filtered cohort where gap signal exceeds evidence/message support signal.",
  "Gap-heavy share":
    "Share of the filtered cohort where gap signal exceeds evidence/message support signal.",

  // Table columns
  "Quality":
    "At-a-glance capture/readiness quality. Low quality often means a source extraction issue rather than true weak evidence.",
  "Title":
    "Best-guess source title for scanning. Open detail to confirm context when capture quality is low.",
  "One-line takeaway":
    "Short brief-framed summary of why the source matters. Use as a quick orientation before opening full detail.",
  "Confidence":
    "Overall confidence in row-level enrichment quality and interpretability.",
  "Gap priority":
    "Priority level of the evidence gap for this brief (for example none to critical).",
  "Source type":
    "Institution/source-origin category (for example regulator, guideline body, registry, study source).",
  "Age focus":
    "Main age group represented in the source (for example adolescent-specific, paediatric broad, all-age).",
  "Geography":
    "Primary geography represented in the source.",
  "UK relevance":
    "How directly useful the source is for UK-first interpretation.",
  "EUR relevance":
    "How relevant the source is for EURneffy opportunity-space interpretation.",
  "EURneffy relevance":
    "How relevant the source is for EURneffy opportunity-space interpretation.",
  "Best use":
    "Recommended strategic role for this source (for example gap identification, message building, context).",
  "Processing status":
    "Pipeline status indicating whether the row analyzed cleanly or had processing/capture limitations.",
  "Key filters":
    "Primary global filters that shape every page. Use these first to define the cohort before interpreting any chart or ranking.",
  "Search":
    "Searches article title, summaries, tags, questions, and selected extract text for fast triage.",
  "Row scope":
    "Controls whether only included in-brief rows, excluded rows, or all rows are shown for QA context.",
  "Analysis readiness":
    "Filters by whether enough source text was captured for meaningful analysis.",
  "Geography":
    "Filters by geography focus to align with UK-first, Europe-second interpretation.",
  "Population":
    "Filters by population directness so teams can separate adolescent-direct evidence from broader proxy evidence.",
  "Quick triage filters":
    "Fast chips for common slices such as UK-direct, high gap value, med/legal cautions, or recrawl risk.",
  "Smart sort":
    "Ranking presets optimized for different decisions: strongest support, highest gap pressure, strongest directness, or highest caution/ingestion risk.",
  "all":
    "Includes all rows, regardless of keep/exclude recommendation.",
  "included":
    "Shows only rows recommended for core in-brief analysis.",
  "excluded":
    "Shows rows filtered out of default analysis, useful for QA and context checks.",
  "ready_only":
    "Only rows with enough captured content for meaningful analysis.",
  "partial_only":
    "Only rows that are partial/not analysis-ready, useful for quality diagnostics and recrawl triage.",
  "all_rows":
    "All rows regardless of analysis-readiness status.",
  "quality_sensitive":
    "Prioritizes analysis-ready rows while retaining some lower-quality context rows.",
  "Direct adolescent evidence":
    "Quick filter for rows that directly reflect adolescent populations rather than broad proxy cohorts.",
  "UK-direct":
    "Quick filter for rows with high UK relevance/directness.",
  "High message value":
    "Quick filter for rows with stronger message-development usefulness.",
  "High gap value":
    "Quick filter for rows that are especially useful for identifying evidence gaps.",
  "Needs KOL input":
    "Quick filter for rows that surface explicit KOL follow-up questions.",
  "Has usable stats":
    "Quick filter for rows with at least one usable quantitative proof point.",
  "Has med/legal cautions":
    "Quick filter for rows carrying med/legal caution flags.",
  "Needs recrawl":
    "Quick filter for likely ingestion/capture issues needing validation before interpretation.",
  "EUR relevant":
    "Quick filter for rows with stronger EURneffy opportunity-space relevance.",
  "EURneffy relevant":
    "Quick filter for rows with stronger EURneffy opportunity-space relevance.",
  "Dosing-specific":
    "Quick filter for rows touching dosing transition themes.",
  "Recognition/response-specific":
    "Quick filter for rows touching recognition and emergency-response themes.",
  "Settings-of-risk-specific":
    "Quick filter for rows touching setting-of-risk themes.",
  "highest_usefulness":
    "Sort by strongest overall evidence usefulness signal first.",
  "highest_gap_value":
    "Sort by strongest gap-analysis usefulness signal first.",
  "highest_eur_relevance":
    "Sort by strongest EURneffy opportunity-space relevance first.",
  "highest_confidence":
    "Sort by highest enrichment confidence first.",
  "most_adolescent_direct":
    "Sort by strongest adolescent directness first.",
  "most_uk_direct":
    "Sort by strongest UK directness first.",
  "most_caution_heavy":
    "Sort by rows with the most caution flags first.",
  "most_likely_ingestion_problem":
    "Sort by rows most likely impacted by source capture/extraction quality issues.",
  "uk_direct":
    "Directly UK-relevant evidence context.",
  "europe_relevant":
    "Europe-relevant evidence that can provide second-tier context when UK evidence is limited.",
  "non_uk_proxy":
    "Non-UK proxy context requiring careful transferability interpretation.",
}

const TOOLTIP_DEEP_DIVE: Record<string, string> = {
  "Source type distribution":
    "What to learn: this reveals which source institutions dominate the current evidence mix. A heavily guideline/regulator-skewed profile usually means strong policy context but weaker behavioural-outcome depth.",
  "Evidence type distribution":
    "What to learn: this shows whether the dataset is driven by primary research, guidance content, or secondary summaries. Use this to judge how much of the story is measured evidence versus contextual direction.",
  "Top data gap tags":
    "What to learn: these are the recurring missing-evidence patterns in this cohort. Prioritize the top tags first because they represent the largest concentration of unresolved decision risk.",
  "Top barrier tags":
    "What to learn: these are the friction points appearing most often across rows. Use this to identify which barriers are systemic versus niche and therefore most important for intervention focus.",
  "Top setting tags":
    "What to learn: this indicates where risk or friction most commonly appears (school, home, travel, etc.). Use it to target setting-specific action rather than generic messaging.",
  "Top EURneffy opportunity tags":
    "What to learn: these are the most frequent EURneffy-relevant opportunity themes under current evidence. Treat this as prioritization guidance for exploration, not proof of claim validity.",
  "Top gap themes (high-priority rows)":
    "What to learn: this isolates the gap themes that dominate the highest-priority rows, so it is the clearest shortlist of unresolved evidence risk. Start with the top two themes and trace their supporting rows to define concrete follow-up actions.",
  "What still needs answering":
    "What to learn: this panel is the practical unanswered-question backlog. Higher-frequency questions indicate repeated uncertainty patterns that should be converted into immediate research or interview tasks.",
  "KOL questions":
    "What to learn: these are expert-facing questions that the current evidence cannot answer confidently. Use the top items to structure interview guides and challenge assumptions with specialist input.",
  "Follow-up research questions":
    "What to learn: these are desk-research tasks that can reduce uncertainty before stakeholder conversations. Prioritize questions that recur across multiple rows because they represent structural evidence gaps.",
  "Missing stats we wish we had":
    "What to learn: this captures the exact quantitative measures missing from the current evidence base. Use these items to define data requests, outcomes tracking, or supplementary analysis briefs.",
  "Best evidence for selected topic":
    "What to learn: this table shows the strongest currently available topic support. Read the top rows first, then verify whether the support is direct adolescent/UK evidence or broader context.",
  "Best gap evidence for selected topic":
    "What to learn: this table shows where the topic is least resolved despite relevance. Use the top rows to identify whether the issue is missing subgroup breakout, missing setting detail, or missing real-world behavior data.",
  "Topic evidence ledger":
    "What to learn: this is the audit trail behind topic summaries and charts. Use it to validate that rankings reflect underlying row evidence rather than isolated outliers.",
  "Barrier overview (weighted)":
    "What to learn: this ranking shows which barrier families carry the heaviest unresolved evidence pressure. High scores indicate areas where both prevalence and gap intensity are elevated.",
  "Top supporting evidence rows":
    "What to learn: these rows represent the best available support inside this barrier context. Use them to separate what is already evidenced from what still requires additional validation.",
  "Top gap rows for barrier context":
    "What to learn: these rows represent the highest unresolved barrier evidence needs. Focus on recurring missing-breakout patterns to define precise research priorities.",
  "Barrier evidence ledger":
    "What to learn: this ledger provides full row-level context for barrier interpretation. Use it when a summary chart looks strong but source-level evidence appears mixed.",
  "Dosing proof points":
    "What to learn: these are the strongest currently available dosing-transition support rows. Review top rows to identify what is directly evidenced versus inferred from broader guidance.",
  "Dosing gaps":
    "What to learn: these rows define the most urgent unresolved dosing-transition uncertainties. Use this list to prioritize where additional adolescent/UK-specific dosing evidence is needed.",
  "Response proof points":
    "What to learn: these rows summarize strongest support for recognition and response behavior interpretation. Use them to confirm which emergency-action patterns are well substantiated.",
  "Response gaps":
    "What to learn: these rows identify the highest-priority unresolved recognition/response issues. Prioritize recurring gaps linked to delayed adrenaline, hesitation, or training uncertainty.",
  "Setting supporting evidence":
    "What to learn: these rows show strongest support across settings-of-risk interpretation. Use this to confirm which setting insights are evidence-backed.",
  "Setting gap evidence":
    "What to learn: these rows show where setting-specific evidence remains incomplete. Prioritize settings with repeated missing breakout patterns.",
  "Opportunity tag ranking":
    "What to learn: this ranking combines frequency and gap intensity to highlight opportunity themes that are both common and evidence-constrained. High-ranking themes warrant focused follow-up before strategic claims.",
  "Top related barriers":
    "What to learn: these are the barrier patterns most tightly linked to the selected opportunity family. Use this to ground opportunity interpretation in observed friction, not abstract framing.",
  "Top caution statements":
    "What to learn: these are recurring guardrails attached to this opportunity family. Treat frequent cautions as hard constraints on interpretation confidence.",
  "Top KOL questions":
    "What to learn: these questions show where expert input is repeatedly required in the opportunity view. Use the top items to design specialist interview objectives.",
  "Top follow-up research questions":
    "What to learn: these questions show where additional published evidence should be gathered first. Recurring items indicate the most persistent research blind spots.",
  "Top missing stats":
    "What to learn: these represent the most frequently missing quantitative anchors in opportunity interpretation. Use them to specify exactly what numbers are needed before prioritization decisions.",
  "EURneffy evidence table":
    "What to learn: this table is the row-level proof base behind opportunity summaries. Open detail on top rows to verify support type, caution context, and unresolved gaps.",
  "Gap evidence drilldown rows":
    "What to learn: this table is the source-level backlog of highest-impact gap evidence. It should be used as the operational queue for follow-up research planning.",
  "KOL question bank":
    "What to learn: this is a prioritized interview backlog derived from repeated gap signals. Use high-frequency items first because they reflect broad unresolved uncertainty.",
  "Follow-up research question bank":
    "What to learn: this is a prioritized desk-research backlog derived from repeated gap signals. High-frequency questions are likely to deliver the biggest uncertainty reduction.",
  "Missing stats bank":
    "What to learn: this is a prioritized list of missing quantitative anchors. Use this to convert vague gaps into measurable data requirements.",
  "Cohort comparison summary":
    "What to learn: this summary quantifies how a cohort definition changes the overall evidence profile. Large deltas show where conclusions are sensitive to inclusion criteria.",
  "Barrier differences (A vs B)":
    "What to learn: these are the biggest barrier shifts between cohorts. Larger positive/negative deltas reveal where one cohort over-indexes on specific friction patterns.",
  "Setting differences (A vs B)":
    "What to learn: these are the biggest setting-of-risk shifts between cohorts. Use this to test whether context assumptions hold under different cohort rules.",
  "Gap differences (A vs B)":
    "What to learn: these are the biggest evidence-gap theme shifts between cohorts. This helps identify which gaps are robust versus cohort-sensitive.",
  "EURneffy opportunity differences (A vs B)":
    "What to learn: these are the biggest opportunity-theme shifts between cohorts. Use this to test how stable opportunity framing is under alternative evidence slices.",
  "Top evidence rows in Cohort A":
    "What to learn: strongest support rows under cohort A definition. Compare with cohort B to understand how selection criteria change the proof base.",
  "Top evidence rows in Cohort B":
    "What to learn: strongest support rows under cohort B definition. Compare with cohort A to identify criteria-driven evidence shifts.",
  "Top gaps in Cohort A":
    "What to learn: highest-priority unresolved gaps under cohort A definition. Compare with cohort B to see which gaps are persistent versus cohort-specific.",
  "Top gaps in Cohort B":
    "What to learn: highest-priority unresolved gaps under cohort B definition. Compare with cohort A to see which gaps are persistent versus cohort-specific.",
  "Average gap signal":
    "What to learn: this reflects the average intensity of unresolved evidence needs in the current cohort. Rising values usually indicate denser and more strategic gap pressure.",
  "Avg gap signal":
    "What to learn: this reflects the average intensity of unresolved evidence needs in the current cohort. Rising values usually indicate denser and more strategic gap pressure.",
  "Missing-breakout burden":
    "What to learn: this combines the five main missing-breakout dimensions into one burden signal. Higher values mean a larger share of rows are missing multiple critical evidence details at once.",
  "Critical gaps":
    "What to learn: this is the percentage share of the cohort carrying the most urgent unresolved evidence needs. A high share indicates immediate follow-up work is required before confident strategic interpretation.",
  "Critical gap share":
    "What to learn: this is the percentage share of the cohort carrying the most urgent unresolved evidence needs. A high share indicates immediate follow-up work is required before confident strategic interpretation.",
  "No adolescent breakout":
    "What to learn: this indicates the cohort share where evidence does not isolate adolescent-specific results. High values imply heavy reliance on proxy populations.",
  "No adolescent breakout share":
    "What to learn: this indicates the cohort share where evidence does not isolate adolescent-specific results. High values imply heavy reliance on proxy populations.",
  "No UK breakout":
    "What to learn: this indicates the cohort share where evidence does not isolate UK-specific results. High values imply transfer risk from non-UK contexts.",
  "No UK breakout share":
    "What to learn: this indicates the cohort share where evidence does not isolate UK-specific results. High values imply transfer risk from non-UK contexts.",
  "No real-world error data":
    "What to learn: this indicates the cohort share where practical misuse/error outcomes are missing. High values weaken confidence in real-world behavior interpretation.",
  "No real-world error data share":
    "What to learn: this indicates the cohort share where practical misuse/error outcomes are missing. High values weaken confidence in real-world behavior interpretation.",
  "No setting-specific data":
    "What to learn: this indicates the cohort share where evidence lacks setting breakout (school/travel/home/sport). High values limit setting-specific action planning.",
  "No setting-specific data share":
    "What to learn: this indicates the cohort share where evidence lacks setting breakout (school/travel/home/sport). High values limit setting-specific action planning.",
  "No equity subgroup data":
    "What to learn: this indicates the cohort share where subgroup equity breakout is missing. High values limit confidence in access/inequality interpretation.",
  "No equity subgroup data share":
    "What to learn: this indicates the cohort share where subgroup equity breakout is missing. High values limit confidence in access/inequality interpretation.",
  "Rows with med/legal flags":
    "What to learn: this indicates the cohort share that requires cautious interpretation controls. High values mean stronger need for conservative framing.",
  "Med/legal flag share":
    "What to learn: this indicates the cohort share that requires cautious interpretation controls. High values mean stronger need for conservative framing.",
  "KOL question signals":
    "What to learn: this indicates the cohort share that explicitly triggers expert follow-up needs. High values imply unresolved interpretation requiring specialist input.",
  "KOL question signal share":
    "What to learn: this indicates the cohort share that explicitly triggers expert follow-up needs. High values imply unresolved interpretation requiring specialist input.",
  "Missing-stat signals":
    "What to learn: this indicates the cohort share that explicitly identifies missing quantitative anchors. High values show where decisions are constrained by absent measurement.",
  "Missing-stat signal share":
    "What to learn: this indicates the cohort share that explicitly identifies missing quantitative anchors. High values show where decisions are constrained by absent measurement.",
  "Gap-heavy rows":
    "What to learn: this shows the cohort share that is more informative for gaps than for direct support. High values indicate a research-prioritization-heavy cohort rather than a proof-heavy cohort.",
  "Gap-heavy share":
    "What to learn: this shows the cohort share that is more informative for gaps than for direct support. High values indicate a research-prioritization-heavy cohort rather than a proof-heavy cohort.",
}

const FIELD_GLOSSARY: Record<string, string> = {
  _row_id: "Unique ID for a source row, used to connect article-level analysis with evidence extracts.",
  _group_id: "Grouping key used for deduplication when multiple rows represent the same underlying source.",
  _input_row_index: "Original import order index used for QA traceability.",
  _source_url: "Original source URL for inspection and validation.",
  _canonical_url: "Normalized URL used for cleaner grouping and deduplication.",
  _input_text_chars: "Captured text length; very low values often indicate partial or stub capture.",
  _input_text_quality_label: "Heuristic quality label (full, partial, stub) for captured source text.",
  _input_text_quality_score_0_100: "Numeric capture-quality score; lower values indicate weaker source capture quality.",
  _input_text_probably_partial: "Flags likely incomplete source capture.",
  _input_text_needs_recrawl: "Flags rows that likely need improved extraction before strategic interpretation.",
  _source_file: "Input file lineage for troubleshooting batch-level capture issues.",
  _processing_status: "Pipeline status for this row (for example ok, partial, error).",
  _prompt_version: "Prompt/version lineage for enrichment traceability.",
  _model: "Model lineage metadata for auditability.",
  _chunk_count: "Number of chunks analyzed for this source.",
  _chunk_response_ids: "Technical chunk-level response identifiers for audit/debug use.",
  _chunk_api_paths: "Technical API metadata for chunk enrichment.",
  _final_response_id: "Technical final synthesis response ID.",
  _final_api_path: "Technical final API path metadata.",
  _last_error_excerpt: "Most recent processing error snippet, if present.",
  article_title_guess: "Best-guess title extracted from the source text.",
  analysis_ready: "Whether enough usable text was captured for meaningful analysis.",
  analysis_ready_reason: "Reason this row is or is not analysis-ready.",
  brief_keep: "Recommended keep/drop decision for the core brief analysis set.",
  brief_filter_out: "Inverse of brief_keep; indicates likely exclusion from core analysis.",
  brief_filter_reason: "Reason this row is included or excluded.",
  brief_usefulness_score_0_100: "Overall strategic usefulness for the EURneffy adolescent brief.",
  brief_message_usefulness_score_0_100: "Usefulness for message-development interpretation.",
  brief_gap_analysis_usefulness_score_0_100: "Usefulness for identifying unresolved evidence gaps.",
  brief_usefulness_label: "Qualitative band for overall usefulness.",
  brief_one_line_takeaway: "One-sentence brief-framed summary of why the source matters.",
  brief_evidence_summary: "Short synthesis of the most relevant evidence in the source.",
  brief_article_kind: "Artifact type of the source (for example guidance page, study page, notice).",
  brief_source_type: "Institution/source-origin class (for example regulator, guideline body, registry, study source).",
  brief_evidence_type: "Evidence category (for example guideline, observational, safety communication).",
  brief_study_design: "Study/source design descriptor where applicable.",
  brief_evidence_strength: "Classification field retained in source data but intentionally hidden from reporting views.",
  brief_evidence_strength_reason: "Detail field retained in source data but intentionally hidden from reporting views.",
  brief_publication_year: "Publication year or best-available year estimate.",
  brief_sample_size: "Sample size or participant count where available.",
  brief_age_focus: "Main age group represented in this source.",
  brief_age_secondary: "Secondary age groups represented.",
  brief_adolescent_specificity_score_0_100: "How directly evidence maps to adolescents/AYA.",
  brief_population_directness: "Qualitative directness to target population.",
  brief_geography_primary: "Primary geography represented.",
  brief_geography_tags: "All geography tags associated with the source.",
  brief_uk_relevance_score_0_100: "How directly useful this source is for UK-first interpretation.",
  brief_europe_relevance_score_0_100: "How relevant this source is for Europe-level context.",
  brief_geography_directness: "Qualitative directness to target geography.",
  brief_audience_primary: "Primary stakeholder audience represented.",
  brief_audience_secondary: "Secondary stakeholder audiences represented.",
  brief_barrier_tags: "High-level barrier themes surfaced by the source.",
  brief_behavioural_driver_tags: "Behavioural mechanisms underlying surfaced barriers.",
  brief_setting_tags: "Settings where burden/risk/friction appears most relevant.",
  brief_dosing_transition_tags: "Dosing-transition signals such as thresholds, switching, and underdosing risk.",
  brief_recognition_response_tags: "Recognition and emergency-response issues surfaced by the source.",
  brief_equity_access_tags: "Equity/access issues such as cost, access, subgroup variation, or deprivation.",
  brief_social_psychology_tags: "Social and psychological burden signals relevant to adolescent behaviour.",
  brief_training_error_tags: "Training and technique failure-mode signals.",
  brief_data_gap_tags: "Structured labels for what evidence is missing.",
  brief_gap_kind_primary: "Primary category of evidence gap highlighted by the source.",
  brief_gap_reason_structured: "Structured reasons explaining the gap signal.",
  brief_gap_priority: "Priority level of this gap for the current brief.",
  brief_gap_summary: "Short narrative summary of the key missing evidence.",
  brief_reports_no_adolescent_breakout: "Flags missing adolescent-specific breakout.",
  brief_reports_no_uk_breakout: "Flags missing UK-specific breakout.",
  brief_reports_no_real_world_error_data: "Flags missing real-world misuse/error data.",
  brief_reports_no_setting_specific_data: "Flags missing setting-specific breakout.",
  brief_reports_no_equity_subgroup_data: "Flags missing equity subgroup breakout.",
  eur_eurneffy_relevance_score_0_100: "How relevant this source is to EURneffy opportunity-space thinking.",
  eur_eurneffy_opportunity_tags: "Structured EURneffy-related opportunity themes inferred from evidence.",
  eur_eurneffy_support_level: "How direct source support is for EURneffy opportunity interpretation.",
  eur_message_routes: "Potential evidence-linked message/opportunity routes (hypothesis-level, not final recommendations).",
  eur_message_cautions: "Caution statements to prevent over-interpretation in EURneffy framing.",
  brief_actionability_for_messaging: "How practically usable the source is for later messaging synthesis.",
  brief_actionability_reason: "Reasoning behind actionability classification.",
  brief_best_use: "Recommended strategic role for this source in workflow.",
  brief_key_statistics: "Key quantitative proof points surfaced from the source.",
  brief_has_usable_stat: "Whether at least one usable quantitative proof point was found.",
  brief_stat_count: "Number of surfaced usable statistics.",
  brief_best_stat_for_slide: "Single strongest proof-point statistic from this source.",
  brief_key_quotes: "Key quote-like textual proof points from the source.",
  brief_best_gap_quote: "Strongest quote/extract illustrating an evidence gap.",
  brief_evidence_extracts: "Curated evidence extracts retained at article level.",
  brief_gap_extracts: "Curated extracts specifically illustrating gaps/uncertainty.",
  brief_cited_bodies_or_sources: "Named institutions or bodies represented/cited by the row.",
  brief_recommended_use_cases: "Recommended practical use cases for this row.",
  brief_med_legal_review_flags: "Signals that medical/legal review may be required.",
  brief_kol_question: "KOL interview question implied by this evidence gap.",
  brief_followup_research_question: "Follow-up desk-research question implied by this row.",
  brief_missing_stat_we_wish_we_had: "Most important missing quantitative metric for decision use.",
  brief_novelty_vs_medical_writer: "How much incremental value this row adds beyond baseline expected coverage.",
  brief_incremental_value_score_0_100: "Numeric incremental-value score versus baseline expected evidence.",
  brief_downstream_aggregation_keys: "Machine-friendly grouping keys for downstream analysis.",
  brief_confidence_0_100: "Overall confidence in row-level enrichment quality and interpretability.",
  extract_rank: "Rank/order of the extract within retained snippets for its source row.",
  extract_text: "Short retained evidence snippet.",
  is_gap_extract: "Whether this snippet is primarily gap-oriented versus support-oriented.",
}

const DYNAMIC_PREFIX_HELP: Array<{ prefix: string; make: (key: string) => string }> = [
  {
    prefix: "brief_pillar_scores.",
    make: (key) => {
      const label = humanizeLabel(key.replace("brief_pillar_scores.", ""))
      return `How strongly this source supports the "${label}" pillar. Higher values indicate stronger thematic support under current interpretation.`
    },
  },
  {
    prefix: "brief_topic_scores.",
    make: (key) => {
      const label = humanizeLabel(key.replace("brief_topic_scores.", ""))
      return `How strongly this source maps to the "${label}" topic. Higher values indicate stronger topic relevance signals.`
    },
  },
  {
    prefix: "brief_fit_assessment.",
    make: (key) => {
      const label = humanizeLabel(key.replace("brief_fit_assessment.", ""))
      return `Compact fit metric "${label}" for fast comparison cards and detail summaries.`
    },
  },
]

const FLAG_PREFIX_CONTEXT: Record<string, string> = {
  flag_pillar_: "pillar relevance",
  flag_topic_: "topic relevance",
  flag_barrier_: "barrier signal",
  flag_setting_: "setting relevance",
  flag_dosing_: "dosing transition signal",
  flag_recognition_: "recognition/response signal",
  flag_equity_: "equity/access signal",
  flag_gap_: "evidence-gap signal",
  flag_eur_: "EURneffy opportunity signal",
}

function normalizeKey(key: string): string {
  return key.trim()
}

function getFlagHelp(key: string): string | undefined {
  const matched = Object.keys(FLAG_PREFIX_CONTEXT).find((prefix) => key.startsWith(prefix))
  if (!matched) return undefined
  const core = key.slice(matched.length)
  const label = humanizeLabel(core)
  return `Quick filter flag for "${label}" ${FLAG_PREFIX_CONTEXT[matched]}. TRUE means this row materially touches this theme; use score/tag fields for nuance.`
}

export function getHelpText(key: string): string | undefined {
  const normalized = normalizeKey(key)
  if (!normalized) return undefined

  if (HELP_TEXT[normalized]) return HELP_TEXT[normalized]
  if (FIELD_GLOSSARY[normalized]) return FIELD_GLOSSARY[normalized]

  for (const entry of DYNAMIC_PREFIX_HELP) {
    if (normalized.startsWith(entry.prefix)) return entry.make(normalized)
  }

  const flagHelp = getFlagHelp(normalized)
  if (flagHelp) return flagHelp

  if (normalized.includes("_")) {
    return `${humanizeLabel(normalized)}: label from the enrichment schema. Hover to see this definition where available; use row detail for full context and cautions.`
  }

  return undefined
}

export function getHelpTooltipText(key: string): string | undefined {
  const normalized = normalizeKey(key)
  const base = getHelpText(normalized) ?? getHelpSummaryText(normalized)
  if (!base) return undefined

  const deepDive =
    TOOLTIP_DEEP_DIVE[normalized] ??
    "What to learn: read the highest values first, then compare with related charts to separate broad background context from the highest-priority evidence gaps. Interpretation tip: treat large values as concentration signals, then validate implications by checking the linked evidence rows and gap summaries."

  return `${base} ${deepDive}`
}

export function getHelpSummaryText(key: string): string | undefined {
  const normalized = normalizeKey(key)
  const base = getHelpText(normalized)
  if (base) return base
  if (!normalized) return undefined

  const label = humanizeLabel(normalized)
  return `This section summarizes ${label} in the current evidence cohort. Use the highest values first to identify the strongest signals, then compare with adjacent sections to understand what is well-supported versus still missing.`
}

export function getMethodologyGlossaryBlocks(): Array<{ title: string; items: Array<{ label: string; text: string }> }> {
  return [
    {
      title: "Pipeline and quality fields",
      items: [
        { label: "_input_text_quality_label", text: getHelpText("_input_text_quality_label") ?? "" },
        { label: "_input_text_chars", text: getHelpText("_input_text_chars") ?? "" },
        { label: "_input_text_needs_recrawl", text: getHelpText("_input_text_needs_recrawl") ?? "" },
        { label: "analysis_ready", text: getHelpText("analysis_ready") ?? "" },
        { label: "_processing_status", text: getHelpText("_processing_status") ?? "" },
      ],
    },
    {
      title: "Core strategic scores",
      items: [
        { label: "brief_usefulness_score_0_100", text: getHelpText("brief_usefulness_score_0_100") ?? "" },
        { label: "brief_message_usefulness_score_0_100", text: getHelpText("brief_message_usefulness_score_0_100") ?? "" },
        { label: "brief_gap_analysis_usefulness_score_0_100", text: getHelpText("brief_gap_analysis_usefulness_score_0_100") ?? "" },
        { label: "brief_adolescent_specificity_score_0_100", text: getHelpText("brief_adolescent_specificity_score_0_100") ?? "" },
        { label: "brief_uk_relevance_score_0_100", text: getHelpText("brief_uk_relevance_score_0_100") ?? "" },
        { label: "brief_confidence_0_100", text: getHelpText("brief_confidence_0_100") ?? "" },
      ],
    },
    {
      title: "Gap intelligence",
      items: [
        { label: "brief_gap_kind_primary", text: getHelpText("brief_gap_kind_primary") ?? "" },
        { label: "brief_gap_reason_structured", text: getHelpText("brief_gap_reason_structured") ?? "" },
        { label: "brief_gap_priority", text: getHelpText("brief_gap_priority") ?? "" },
        { label: "brief_gap_summary", text: getHelpText("brief_gap_summary") ?? "" },
        { label: "brief_kol_question", text: getHelpText("brief_kol_question") ?? "" },
      ],
    },
    {
      title: "EURneffy opportunity interpretation",
      items: [
        { label: "eur_eurneffy_relevance_score_0_100", text: getHelpText("eur_eurneffy_relevance_score_0_100") ?? "" },
        { label: "eur_eurneffy_opportunity_tags", text: getHelpText("eur_eurneffy_opportunity_tags") ?? "" },
        { label: "eur_eurneffy_support_level", text: getHelpText("eur_eurneffy_support_level") ?? "" },
        { label: "eur_message_routes", text: getHelpText("eur_message_routes") ?? "" },
        { label: "eur_message_cautions", text: getHelpText("eur_message_cautions") ?? "" },
      ],
    },
  ]
}

