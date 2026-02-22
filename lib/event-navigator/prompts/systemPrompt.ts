import { TierModelAssumptions, ObjectiveParams, ScoredEvent } from '../types';
import { competitors } from '../data/competitors';
import { ddHistory } from '../data/history';
import { strategicContext } from '../data/strategicContext';

export function buildEventNavigatorSystemPrompt(
  assumptions: TierModelAssumptions,
  scoredEvents: ScoredEvent[]
): string {
  const sections: string[] = [];

  // 1. Role definition
  sections.push(`=== ROLE ===
You are a senior field marketing strategist for Dye & Durham (D&D), a global legal technology company. Your task is to analyze industry events and recommend the most strategically valuable ones based on the user's objectives.

D&D provides technology solutions for lawyers, conveyancers, and financial services professionals across Canada, UK, and Australia. Key products include Unity (conveyancing/real estate), practice management tools, property search, lending technology, AML/CTF compliance, due diligence, corporate search, and entity management.`);

  // 2. Tier model configuration
  sections.push(`=== TIER MODEL CONFIGURATION ===
The following weighted scoring model is currently active:

Criteria (ID | Label | Weight):
${assumptions.criteria.map(c => `- ${c.id} | ${c.label} | Weight: ${c.weight}/10 | ${c.description}`).join('\n')}

Tier Thresholds (max possible score = ${5 * assumptions.criteria.reduce((s, c) => s + c.weight, 0)}):
- ${assumptions.tierDefinitions.tier1.label}: Score >= ${assumptions.thresholds.tier1}
- ${assumptions.tierDefinitions.tier2.label}: Score ${assumptions.thresholds.tier2}-${assumptions.thresholds.tier1 - 1}
- ${assumptions.tierDefinitions.tier3.label}: Score < ${assumptions.thresholds.tier2}

Score Anchors:
${assumptions.criteria.map(c =>
  `${c.label}: Low(1)="${c.anchors.low}" | Mid(3)="${c.anchors.mid}" | High(5)="${c.anchors.high}"`
).join('\n')}`);

  // 3. Event catalog (scored)
  const catalogSummary = scoredEvents.map(e =>
    `${e.id} | ${e.country} | ${e.name} | ${e.city} | ${e.dates} | ${e.tier} (${e.tierScore}/${5 * assumptions.criteria.reduce((s, c) => s + c.weight, 0)}) | Products: ${e.relevantProducts.join(', ')} | Attendees: ${e.estimatedAttendees} | Competitors: ${e.competitorsPresent.join(', ') || 'None known'}`
  ).join('\n');

  sections.push(`=== EVENT CATALOG (${scoredEvents.length} scored events) ===
${catalogSummary}`);

  // 4. Competitive intelligence
  const compSummary = competitors.map(c =>
    `${c.name} (${c.markets.join('/')}) - Threat: ${c.threatLevel} - ${c.description}\n  Events: ${c.knownEventPresence.map(p => `${p.eventId} (${p.role}${p.confirmed ? '' : ', unconfirmed'})`).join(', ') || 'None catalogued'}${c.ownedEvents.length > 0 ? `\n  Owned: ${c.ownedEvents.map(o => o.name).join(', ')}` : ''}`
  ).join('\n\n');

  sections.push(`=== COMPETITIVE INTELLIGENCE (${competitors.length} competitors) ===
${compSummary}`);

  // 5. D&D attendance history
  const histSummary = ddHistory.map(h =>
    `${h.id} | ${h.eventId} | ${h.eventName} | ${h.dates} | ${h.role} | ${h.details}`
  ).join('\n');

  sections.push(`=== D&D ATTENDANCE HISTORY (${ddHistory.length} records) ===
${histSummary}`);

  // 6. Strategic context
  sections.push(`=== STRATEGIC CONTEXT ===
Themes:
${strategicContext.themes.map(t =>
  `- ${t.name}: ${t.description} (Events: ${t.relevantEvents.join(', ')})`
).join('\n')}

Key Deadlines:
${strategicContext.deadlines.map(d =>
  `- ${d.name} (${d.date}): ${d.impact}`
).join('\n')}

Counter-Programming:
${strategicContext.counterProgramming.map(cp =>
  `- THREAT: ${cp.threat} -> COUNTER AT: ${cp.counterAt.join(', ')}`
).join('\n')}`);

  // 7. Output format
  sections.push(`=== OUTPUT FORMAT ===
You MUST respond with valid JSON only (no markdown, no code fences). Use this exact structure:

{
  "strategicBrief": "3-5 sentence strategy overview addressing the user's objective",
  "keyInsight": "One non-obvious strategic observation the user might not have considered",
  "competitiveAlert": "Most urgent competitive dynamic relevant to this objective",
  "timeline": [{"date": "Mar 10", "event": "BLTF", "type": "confirmed|target|deadline"}],
  "recommendations": [
    {
      "eventId": "UK-1",
      "matchScore": 96,
      "whyThisEvent": "2-3 sentences explaining strategic fit",
      "recommendedApproach": ["Step 1", "Step 2", "Step 3"],
      "productsToShowcase": ["Unity", "Property Search"],
      "thoughtLeadershipAngle": "Suggested topic",
      "competitorsToWatch": ["Landmark"],
      "timingNote": "Urgency context or null",
      "draftOutreachEmail": "Subject: ...\\n\\nDear [Organizer],\\n\\n..."
    }
  ]
}

Rules:
- Recommend 8-15 events, ranked by strategic value (matchScore 0-100)
- matchScore should reflect overall strategic fit, not just tier score
- Consider competitive dynamics, timing, D&D history, and the user's stated objective
- Include at least one event from each market the user mentions
- Flag any counter-programming opportunities against competitor events
- Include a draftOutreachEmail for top 3 recommendations only
- Timeline should include confirmed D&D events, recommended targets, and relevant deadlines`);

  return sections.join('\n\n');
}

export function buildUserPrompt(params: ObjectiveParams): string {
  const parts: string[] = [];

  parts.push(`OBJECTIVE: ${params.objective}`);

  if (params.markets.length > 0) {
    const marketLabels = params.markets.map(m => {
      if (m === 'Canada' && params.canadaProvinces.length > 0) {
        return `Canada (${params.canadaProvinces.join(', ')})`;
      }
      return m;
    });
    parts.push(`MARKETS: ${marketLabels.join(', ')}`);
    if (params.canadaProvinces.length > 0) {
      parts.push(`CANADA PROVINCE FOCUS: ${params.canadaProvinces.join(', ')} — prioritize events in these provinces. Canadian events include city+province data (e.g. "Toronto ON", "Vancouver BC", "Calgary AB", "Montreal QC").`);
    }
  }
  if (params.products.length > 0) {
    parts.push(`PRODUCTS OF INTEREST: ${params.products.join(', ')}`);
  }
  if (params.audiences.length > 0) {
    parts.push(`TARGET AUDIENCES: ${params.audiences.join(', ')}`);
  }
  const timeframeLabels: Record<string, string> = {
    q1: 'Q1 2026 (Jan-Mar)',
    q2: 'Q2 2026 (Apr-Jun)',
    q3: 'Q3 2026 (Jul-Sep)',
    q4: 'Q4 2026 (Oct-Dec)',
  };
  if (params.timeframe.length > 0) {
    const tfDisplay = params.timeframe.length === 4
      ? 'Full Year 2026'
      : params.timeframe.map(q => timeframeLabels[q] || q.toUpperCase()).join(', ');
    parts.push(`TIMEFRAME: ${tfDisplay}`);
  } else {
    parts.push('TIMEFRAME: Full Year 2026');
  }
  parts.push(`BUDGET LEVEL: ${params.budget}`);
  if (params.participation.length > 0) {
    parts.push(`PREFERRED PARTICIPATION: ${params.participation.join(', ')}`);
  }

  parts.push('\nPlease analyze the event catalog and provide your strategic recommendations in the specified JSON format.');

  return parts.join('\n');
}
