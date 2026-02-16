import { CampaignBrief, TeamConfig } from './types';
import platformsData from '../data/platforms.json';

// Client-side prompt assembly for "Give me a prompt" mode
// No API call needed — builds a comprehensive prompt from brief + config + platform data

export function buildExportablePrompt(brief: CampaignBrief, config: TeamConfig): string {
  const geoCodes = extractGeoCodes(brief.geography);
  const relevantPlatforms = platformsData.platforms.filter(p =>
    Array.isArray(p.geographies) && p.geographies.some((g: string) => geoCodes.includes(g))
  );

  const sections: string[] = [];

  sections.push(`You are an expert digital advertising strategist. I need you to create a comprehensive campaign plan for a digital advertising campaign. Please read all of the context below carefully before generating the plan.`);

  // Company context
  sections.push(`\n## ABOUT OUR COMPANY\n`);
  sections.push(`- Company: Dye & Durham`);
  sections.push(`- Industry: Legal technology`);
  sections.push(`- Markets: ${brief.geography.join(', ')}`);
  sections.push(`- Products: Conveyancing/title search, practice management, corporate services, due diligence, payments/fintech`);
  sections.push(`- CRM/Marketing Platform: ${config.crmPlatform} (${config.hubspotTier})`);
  sections.push(`- Sales CRM: ${config.salesCrm}`);
  sections.push(`- HubSpot-Salesforce Sync: ${config.hubspotSalesforceSync}`);
  sections.push(`- Active Ad Accounts: ${config.adAccountsActive.length > 0 ? config.adAccountsActive.join(', ') : 'None yet'}`);
  sections.push(`- Team Experience Level: ${config.teamExperienceLevel}`);
  sections.push(`- Team Size Managing Campaigns: ${config.teamSize}`);
  sections.push(`- Creative Tools Available: ${config.creativeTools.length > 0 ? config.creativeTools.join(', ') : 'None specified'}`);
  sections.push(`- Landing Page Capability: ${config.landingPageCapability}`);
  sections.push(`- Default Legal Review Time: ${config.defaultLegalReviewTime}`);

  // Brief
  sections.push(`\n## THE CAMPAIGN BRIEF\n`);
  sections.push(`Campaign Name: ${brief.campaignName}`);
  sections.push(`Objective: ${brief.objective}${brief.objectiveDetail ? ` — ${brief.objectiveDetail}` : ''}`);
  sections.push(`What We're Promoting: ${brief.promoting}`);
  sections.push(`Target Audience: ${brief.targetAudience}`);
  sections.push(`Geography: ${brief.geography.join(', ')}${brief.geographyDetail ? ` (${brief.geographyDetail})` : ''}`);
  sections.push(`Product Area: ${brief.productArea}`);
  sections.push(`Timeframe: ${brief.timeframeStart || 'Not specified'} to ${brief.timeframeEnd || 'Not specified'}`);
  sections.push(`Budget Range: ${brief.budgetRange}`);
  sections.push(`Currency: ${brief.currency}`);
  sections.push(`Key Topics/Themes: ${brief.topicsThemes}`);
  sections.push(`Desired Outcomes/KPIs: ${brief.desiredOutcomes.join(', ')}`);

  if (brief.existingAssets) sections.push(`Existing Assets: ${brief.existingAssets}`);
  if (brief.competitorContext) sections.push(`Competitor Context: ${brief.competitorContext}`);
  if (brief.pastLearnings) sections.push(`Past Campaign Learnings: ${brief.pastLearnings}`);
  if (brief.internalConstraints) sections.push(`Internal Constraints: ${brief.internalConstraints}`);
  if (brief.additionalContext) sections.push(`Additional Context: ${brief.additionalContext}`);

  if (brief.freeText) {
    sections.push(`\nAdditional context in the team member's own words:`);
    sections.push(`"${brief.freeText}"`);
  }

  if (brief.uploadedDocuments && brief.uploadedDocuments.length > 0) {
    sections.push(`\n## UPLOADED REFERENCE DOCUMENTS\n`);
    sections.push(`The following reference documents were provided. Use their content to inform your recommendations:\n`);
    for (const doc of brief.uploadedDocuments) {
      if (!doc.content.trim()) continue;
      const typeLabel = doc.docType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      sections.push(`### [${typeLabel}] ${doc.name || doc.filename || 'Untitled'}`);
      sections.push(doc.content);
      sections.push('');
    }
  }

  // Platform reference data
  sections.push(`\n## PLATFORM REFERENCE DATA\n`);
  sections.push(`Here is reference data for the advertising platforms available in our markets. Use this to ground your recommendations in realistic benchmarks:\n`);

  for (const platform of relevantPlatforms) {
    sections.push(`### ${platform.name}`);
    sections.push(`- Best for: ${platform.best_for}`);
    sections.push(`- DIY Difficulty: ${platform.diy_difficulty}`);
    sections.push(`- Key Formats: ${platform.key_formats.join(', ')}`);
    if ('typical_b2b_legal_cpc' in platform) {
      const cpc = platform.typical_b2b_legal_cpc as Record<string, string>;
      sections.push(`- Typical B2B Legal CPC: ${Object.entries(cpc).map(([k, v]) => `${k}: ${v}`).join(', ')}`);
    }
    if ('typical_b2b_legal_ctr' in platform) {
      sections.push(`- Typical B2B Legal CTR: ${platform.typical_b2b_legal_ctr}`);
    }
    if (platform.learning_phase) {
      sections.push(`- Learning Phase: ${platform.learning_phase}`);
    }
    sections.push(`- Notes: ${platform.notes}`);
    sections.push('');
  }

  // Instructions
  sections.push(`## WHAT I NEED YOU TO PRODUCE\n`);
  sections.push(`Please generate a comprehensive digital advertising campaign plan with ALL of the following sections. Be specific, actionable, and tailored to our company context. Do not be vague or generic.

1. **Executive Summary** — 2-3 paragraph overview, brief quality assessment, confidence level, and total estimated investment.

2. **Channel Strategy** — For each recommended channel:
   - Why this channel for THIS campaign (specific rationale)
   - Role in the funnel (awareness / consideration / conversion)
   - Recommended ad formats with exact dimensions, file requirements, and character limits
   - Budget allocation (percentage and dollar/pound amount)
   - Expected performance benchmarks (CPC, CPM, CTR, conversion rate) specific to B2B legal tech
   - COPY-PASTE READY targeting parameters (exact job titles, industries, company sizes, geography settings, exclusions)
   - DIY difficulty rating with honest explanation
   - Step-by-step setup instructions for someone who has never used the platform
   - 2-3 example ad headlines and body copy tailored to this campaign
   - Pre-built UTM parameter strings

3. **Audience Strategy** — Segments with per-platform targeting parameters, audience size estimates, retargeting strategy, lookalike audience recommendations, and who to exclude.

4. **Creative & Content Requirements** — For each required asset: dimensions, file formats, character limits, example copy, Canva template search terms, landing page checklist, UTM parameters for all channels, and A/B testing plan.

5. **Budget & Resources** — Total budget with channel breakdown, learning phase budget, campaign duration, internal labor estimate (hours/week with feasibility assessment), tools needed with costs, and a three-way cost comparison: full DIY, DIY with freelancer support, and full-service agency equivalent.

6. **Timeline & Execution** — Phase-by-phase plan with tasks, owners, effort estimates, dependencies, and key milestones. Account for creative production, legal review (${config.defaultLegalReviewTime}), platform approval times, and learning phase.

7. **Measurement & Reporting** — KPIs with targets and benchmark ranges, tracking setup instructions specific to ${config.crmPlatform}, reporting cadence, what "good" vs "needs attention" looks like for each metric, and attribution model recommendation.

8. **Risks & Considerations** — Campaign-specific risks with mitigations, and geography-specific compliance requirements (CASL for Canada, ASA/CAP/GDPR for UK, ACL/SPAM Act for Australia).

9. **Readiness Check** — Assess what prerequisites need to be in place before this campaign can launch. For each item: what it is, status, why it matters, step-by-step instructions to set it up (specific to our tools), estimated time, and who does it.

10. **Quick-Start Priorities** — The top 3 highest-impact actions, a minimum viable campaign version (one channel, minimum budget), a half-budget version, and a "2 hours per week" version.

IMPORTANT GUIDELINES:
- Evaluate ALL available platforms objectively based on this campaign's goals, audience, budget, and team capability. Do NOT default to LinkedIn and Google — consider Meta, YouTube, industry publications, programmatic, and any other platform that fits. Only recommend LinkedIn and/or Google when they are genuinely the best fit for the specific campaign need.
- Every recommendation should include not just WHAT to do but WHY it matters and HOW to do it step-by-step
- Be specific to B2B legal technology — "solicitors in the UK" not "your target audience"
- Include realistic benchmarks for legal tech B2B, not generic B2B numbers
- Reference our actual tools (${config.crmPlatform}, ${config.creativeTools.join(', ')}) in all instructions
- If our budget seems too low for the objective, say so honestly
- If a channel is too complex for our team's experience level, recommend alternatives or suggest a freelancer with cost estimate
- When providing targeting parameters, make them copy-paste ready for the actual platform interface`);

  return sections.join('\n');
}

function extractGeoCodes(geographies: string[]): string[] {
  const codes: string[] = [];
  for (const geo of geographies) {
    const lower = geo.toLowerCase();
    if (lower.includes('canada') || lower === 'ca') codes.push('CA');
    if (lower.includes('united kingdom') || lower.includes('uk') || lower === 'gb') codes.push('UK');
    if (lower.includes('australia') || lower === 'au') codes.push('AU');
  }
  if (codes.length === 0) return ['CA', 'UK', 'AU'];
  return Array.from(new Set(codes));
}
