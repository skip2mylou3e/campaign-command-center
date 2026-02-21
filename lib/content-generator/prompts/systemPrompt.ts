import { CGEInput, GeneratedOutput, OutputCategory } from '../types';
import { buildBrandSystemPrompt, brandVoice } from '../data/brandVoice';
import { products } from '../data/products';
import { personas } from '../data/personas';
import { regions } from '../data/regions';
import { outputTypes } from '../data/outputTypes';
import { buildWebsiteContextString } from '../data/websiteContext';
import { supplementaryDocTypes } from '../data/intentConfig';

export function buildCGESystemPrompt(input: CGEInput): string {
  const sections: string[] = [];

  // 1. Brand identity + voice + writing rules
  sections.push(buildBrandSystemPrompt());

  // 2. Supplementary doc usage instructions (if docs provided)
  if (input.supplementaryDocs.length > 0) {
    sections.push(`\n${brandVoice.supplementaryDocUsageInstructions}`);
  }

  // 3. Product context
  const selectedProducts = products.filter(p => input.selectedProducts.includes(p.id));
  if (selectedProducts.length > 0) {
    sections.push(`\n=== PRODUCT CONTEXT ===\n${selectedProducts.map(p => {
      let detail = `${p.fullName} (${p.category}${p.subcategory ? ' - ' + p.subcategory : ''})`;
      if (p.tagline) detail += `\nTagline: ${p.tagline}`;
      if (p.valueProposition) detail += `\nValue Proposition: ${p.valueProposition}`;
      if (p.keyBenefits?.length) detail += `\nKey Benefits: ${p.keyBenefits.join('; ')}`;
      detail += `\nRegions: ${p.regions.join(', ')}`;
      if (p.notes) detail += `\nNote: ${p.notes}`;
      return detail;
    }).join('\n\n')}`);
  }

  // 4. Website context
  if (input.selectedRegions.length > 0) {
    sections.push(`\n=== WEBSITE & PRODUCT REFERENCE DATA ===\n${buildWebsiteContextString(input.selectedRegions)}`);
  }

  // 5. Persona context
  const selectedPersonas = personas.filter(p => input.selectedPersonas.includes(p.id));
  if (selectedPersonas.length > 0) {
    sections.push(`\n=== TARGET PERSONAS ===\n${selectedPersonas.map(p => `
${p.name}:
- Pain points: ${p.painPoints.join(', ')}
- Motivations: ${p.motivations.join(', ')}
- Language: ${p.language}
- Decision factors: ${p.decisionFactors.join(', ')}
- Content angle: ${p.contentAngle}
${p.regionalNote ? `- Regional note: ${p.regionalNote}` : ''}`).join('\n')}`);
  }

  // 6. Region context
  const selectedRegions = regions.filter(r => input.selectedRegions.includes(r.id));
  if (selectedRegions.length > 0) {
    sections.push(`\n=== TARGET REGIONS ===\n${selectedRegions.map(r => `
${r.name}: ${r.spelling}
Legal: ${r.legalContext}
Market: ${r.marketReferences}
Currency: ${r.currency}
Compliance: ${r.compliance}`).join('\n')}`);
  }

  // 7. Quality guardrails
  sections.push(`\n=== QUALITY GUARDRAILS ===
- Company name is ALWAYS "Dye & Durham" (ampersand, never "and")
- No exclamation marks in professional content
- No generic AI phrases: "in today's rapidly evolving landscape," "leverage synergies," "cutting-edge," "game-changing"
- Every piece must have a clear call to action
- Respect character/word count limits exactly
- Use active voice throughout
- Regional spelling must match target region
- Lead with customer outcomes over feature lists
- Target quality: 80% ready — polished and professional, requiring only light human review`);

  return sections.join('\n');
}

export function buildChannelUserPrompt(
  input: CGEInput,
  channelGroup: OutputCategory,
): string {
  const sections: string[] = [];

  // Source content
  sections.push(`=== SOURCE CONTENT ===\n\n${input.sourceContent}`);

  // Supplementary documents
  if (input.supplementaryDocs.length > 0) {
    sections.push('\n=== SUPPLEMENTARY DOCUMENTS ===');
    for (const doc of input.supplementaryDocs) {
      const typeInfo = supplementaryDocTypes.find(t => t.id === doc.typeLabel);
      sections.push(`\n--- ${typeInfo?.label.toUpperCase() || doc.typeLabel} ---\n${doc.content}`);
    }
  }

  // Target info
  const selectedProducts = products.filter(p => input.selectedProducts.includes(p.id));
  sections.push(`\nTARGET PRODUCT(S): ${selectedProducts.map(p => p.fullName).join(', ') || 'General / Master Brand'}`);

  const audienceLabels: Record<string, string> = {
    existing_customers: 'Existing Customers',
    prospects: 'Prospects',
    trade_industry: 'Trade & Industry',
    internal_colleagues: 'Internal Colleagues',
  };
  sections.push(`TARGET AUDIENCE: ${input.targetAudience.map(a => audienceLabels[a] || a).join(', ') || 'Not specified'}`);
  sections.push(`TONE EMPHASIS: ${input.toneEmphasis === 'purposeful' ? 'More Purposeful' : input.toneEmphasis === 'energizer' ? 'More Energizer' : 'Balanced'}`);
  if (input.campaignContext) {
    sections.push(`CAMPAIGN CONTEXT: ${input.campaignContext}`);
  }

  // Channel-specific generation instructions
  const channelOutputs = outputTypes.filter(
    o => o.category === channelGroup && input.selectedOutputTypes.includes(o.id)
  );
  sections.push(getChannelInstructions(channelGroup, channelOutputs));

  return sections.join('\n');
}

function getChannelInstructions(
  channelGroup: OutputCategory,
  selectedOutputs: typeof outputTypes,
): string {
  const toneSettings: Record<OutputCategory, string> = {
    linkedin_social: 'Tone mix: Purposeful = MEDIUM | Changemaker = LOW | Energizer = HIGH',
    email: 'Tone mix: Purposeful = MEDIUM | Changemaker = LOW | Energizer = LOW',
    ads: 'Tone mix: Purposeful = LOW | Changemaker = MEDIUM | Energizer = HIGH',
    blog: 'Tone mix: Purposeful = HIGH | Changemaker = LOW | Energizer = MEDIUM',
    sales_internal: 'Tone mix: Purposeful = HIGH | Changemaker = MEDIUM | Energizer = LOW',
    website: 'Tone mix: Purposeful = MEDIUM | Changemaker = MEDIUM | Energizer = MEDIUM',
  };

  const channelNames: Record<OutputCategory, string> = {
    linkedin_social: 'LINKEDIN + SOCIAL MEDIA',
    email: 'EMAIL CAMPAIGNS',
    ads: 'DIGITAL ADVERTISING',
    blog: 'BLOG + THOUGHT LEADERSHIP',
    sales_internal: 'SALES ENABLEMENT + INTERNAL',
    website: 'WEBSITE',
  };

  let instructions = `\n=== CHANNEL: ${channelNames[channelGroup]} ===\n${toneSettings[channelGroup]}\n\nGenerate the following ${selectedOutputs.length} content asset(s):\n`;

  for (const ot of selectedOutputs) {
    instructions += `\n--- ${ot.label} ---`;
    if (ot.wordLimit) instructions += `\nTarget: ${ot.wordLimit.min}-${ot.wordLimit.max} words`;
    if (ot.charLimit) instructions += `\nTarget: ${ot.charLimit.min}-${ot.charLimit.max} characters`;
    instructions += `\nFormat: ${ot.formatNotes}`;
    instructions += `\nDescription: ${ot.description}\n`;
  }

  instructions += `
FORMATTING RULES:
- Separate each output with: === OUTPUT: [Output Type Name] ===
- Include a REVIEWER NOTES section at the end of each output that flags:
  * Claims needing verification or source attribution
  * Suggested image direction
  * Items requiring compliance or legal review
  * Assumptions made where source content was ambiguous
- Do NOT start any content with "Exciting news!" or "We're thrilled to announce"
- Use emoji sparingly (max 2-3 per social post, none in email/ads/blog)
- Format for readability: line breaks between thoughts, not wall-of-text paragraphs`;

  // Channel-specific extra instructions
  if (channelGroup === 'linkedin_social') {
    instructions += `\n- Write in first person plural ("we") for company posts
- First 210 characters of LinkedIn posts must be a compelling hook (the "see more" fold)
- Include 2-3 relevant hashtags per LinkedIn post
- Twitter/X must be under 280 characters
- Instagram caption needs 5-8 hashtags`;
  } else if (channelGroup === 'email') {
    instructions += `\n- Provide 3 subject line options per email (6-10 words each, A/B/C test options)
- Preview text: 40-90 characters, complements but doesn't repeat the subject line
- Sign-off: "The Dye & Durham Team" unless a specific sender is appropriate
- Include [First Name] personalization token where appropriate
- Include placeholder for unsubscribe link`;
  } else if (channelGroup === 'ads') {
    instructions += `\n- STRICT character limits — ad platforms will truncate
- Include the product/solution name in at least one headline
- Include "Dye & Durham" in at least one headline or description
- No exclamation marks
- Vary angles across variations (feature, benefit, social proof)
- Front-load the value proposition`;
  } else if (channelGroup === 'blog') {
    instructions += `\n- DO NOT start with "In today's..." or any generic AI opening
- Use subheadings (H2/H3) to break up content
- Include 1-2 pull quotes or statistics for visual highlighting
- Suggest internal links to other Dye & Durham content
- SEO: incorporate target keyword 3-5 times naturally
- Suggest 5-8 related keywords`;
  }

  return instructions;
}

export function buildFeedbackUserPrompt(feedback: string, channelGroup: OutputCategory): string {
  const channelNames: Record<OutputCategory, string> = {
    linkedin_social: 'LinkedIn + Social Media',
    email: 'Email Campaigns',
    ads: 'Digital Advertising',
    blog: 'Blog + Thought Leadership',
    sales_internal: 'Sales Enablement + Internal',
    website: 'Website',
  };

  return `=== REVISION REQUEST ===

The user has reviewed your ${channelNames[channelGroup]} content and wants changes:

"${feedback}"

Regenerate ALL outputs for this channel group, incorporating the feedback above. Requirements:
- Apply the requested changes across all outputs in this channel group
- Maintain the same === OUTPUT: [Output Type Name] === delimiters between outputs
- Continue following all brand voice guidelines, quality guardrails, and format requirements
- Include updated REVIEWER NOTES for each output
- Do NOT explain what you changed — just produce the revised content`;
}

export function formatPreviousOutputsAsAssistant(outputs: GeneratedOutput[]): string {
  return outputs
    .map(o => `=== OUTPUT: ${o.outputTypeLabel} ===\n${o.content}`)
    .join('\n\n');
}
