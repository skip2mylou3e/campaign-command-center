import { CGEInput } from './types';
import { buildBrandSystemPrompt, brandVoice } from './data/brandVoice';
import { products } from './data/products';
import { personas } from './data/personas';
import { regions } from './data/regions';
import { outputTypes } from './data/outputTypes';
import { buildWebsiteContextString } from './data/websiteContext';
import { supplementaryDocTypes } from './data/intentConfig';

export function buildExportablePrompt(input: CGEInput): string {
  const sections: string[] = [];

  // 1. Role + Brand Voice
  sections.push(buildBrandSystemPrompt());

  // 2. Supplementary doc usage instructions
  if (input.supplementaryDocs.length > 0) {
    sections.push(`\n=== SUPPLEMENTARY DOCUMENT USAGE ===\n\n${brandVoice.supplementaryDocUsageInstructions}`);
  }

  // 3. Source Content
  sections.push(`\n=== SOURCE CONTENT ===

The following is the source document to transform into marketing content:

---
${input.sourceContent}
---`);

  // 4. Supplementary Documents
  if (input.supplementaryDocs.length > 0) {
    sections.push('\n=== SUPPORTING DOCUMENTS ===');
    for (const doc of input.supplementaryDocs) {
      const typeInfo = supplementaryDocTypes.find(t => t.id === doc.typeLabel);
      const label = typeInfo?.label || doc.typeLabel;
      const usage = typeInfo?.aiUsage || '';
      sections.push(`\n--- ${label.toUpperCase()} ${usage ? `(${usage})` : ''} ---\n${doc.content}`);
    }
  }

  // 5. Product Context
  const selectedProducts = products.filter(p => input.selectedProducts.includes(p.id));
  if (selectedProducts.length > 0) {
    sections.push(`\n=== PRODUCT CONTEXT ===

Target product(s): ${selectedProducts.map(p => p.fullName).join(', ')}

${selectedProducts.map(p => {
  let detail = `${p.fullName}`;
  if (p.tagline) detail += `\nTagline: ${p.tagline}`;
  if (p.valueProposition) detail += `\nValue Proposition: ${p.valueProposition}`;
  if (p.keyBenefits?.length) detail += `\nKey Benefits:\n${p.keyBenefits.map(b => `- ${b}`).join('\n')}`;
  detail += `\nCategory: ${p.category}${p.subcategory ? ` - ${p.subcategory}` : ''}`;
  detail += `\nRegions: ${p.regions.join(', ')}`;
  return detail;
}).join('\n\n')}`);
  }

  // 6. Website Context
  if (input.selectedRegions.length > 0) {
    const websiteCtx = buildWebsiteContextString(input.selectedRegions);
    sections.push(`\n=== WEBSITE & PRODUCT REFERENCE DATA ===\n\n${websiteCtx}`);
  }

  // 7. Target Audience
  if (input.targetAudience.length > 0) {
    const audienceLabels: Record<string, string> = {
      existing_customers: 'Existing Customers (tone: excitement about what\'s new, emphasis on upgrade value and continuity)',
      prospects: 'Prospects (tone: productivity and efficiency, competitive alternative positioning)',
      trade_industry: 'Trade & Industry (tone: reinforce investment and leadership, demonstrate innovation)',
      internal_colleagues: 'Internal Colleagues (tone: educate and motivate, equip frontline staff)',
    };
    sections.push(`\n=== TARGET AUDIENCE ===\n\n${input.targetAudience.map(a => `- ${audienceLabels[a] || a}`).join('\n')}`);
  }

  // 8. Persona Context
  const selectedPersonas = personas.filter(p => input.selectedPersonas.includes(p.id));
  if (selectedPersonas.length > 0) {
    sections.push(`\n=== TARGET PERSONAS ===\n\n${selectedPersonas.map(p => `
TARGET PERSONA: ${p.name}
- Pain points: ${p.painPoints.join(', ')}
- Motivations: ${p.motivations.join(', ')}
- Language: ${p.language}
- Decision factors: ${p.decisionFactors.join(', ')}
- Content angle: ${p.contentAngle}
${p.regionalNote ? `- Regional note: ${p.regionalNote}` : ''}`).join('\n')}`);
  }

  // 9. Region Context
  const selectedRegions = regions.filter(r => input.selectedRegions.includes(r.id));
  if (selectedRegions.length > 0) {
    sections.push(`\n=== TARGET REGIONS ===\n\n${selectedRegions.map(r => `
REGIONAL CONTEXT: ${r.name}
- Spelling: ${r.spelling}
- Legal context: ${r.legalContext}
- Market references: ${r.marketReferences}
- Currency: ${r.currency}
- Key products: ${r.keyProducts}
- Compliance: ${r.compliance}`).join('\n')}`);
  }

  // 10. Output specifications
  const selectedOutputTypes = outputTypes.filter(o => input.selectedOutputTypes.includes(o.id));
  sections.push(`\n=== CONTENT TO GENERATE ===

Please generate the following ${selectedOutputTypes.length} content assets. For each asset, follow the format specifications exactly.

${selectedOutputTypes.map((ot, i) => {
  let spec = `${i + 1}. ${ot.label}`;
  if (ot.wordLimit) spec += `\n   Target length: ${ot.wordLimit.min}-${ot.wordLimit.max} words`;
  if (ot.charLimit) spec += `\n   Target length: ${ot.charLimit.min}-${ot.charLimit.max} characters`;
  spec += `\n   Format: ${ot.formatNotes}`;
  spec += `\n   Description: ${ot.description}`;
  return spec;
}).join('\n\n')}

Tone emphasis: ${input.toneEmphasis === 'purposeful' ? 'More Purposeful' : input.toneEmphasis === 'energizer' ? 'More Energizer' : 'Balanced'}
Campaign context: ${input.campaignContext || 'None specified'}`);

  // 11. Quality requirements
  sections.push(`\n=== QUALITY REQUIREMENTS ===

Before finalising each piece of content, verify:
1. Company name is always "Dye & Durham" (ampersand, never "and")
2. No exclamation marks in professional content
3. No generic AI phrases ("in today's rapidly evolving landscape," "leverage synergies," "cutting-edge," "game-changing")
4. Every piece has a clear call to action
5. Character/word counts are within specified ranges
6. Active voice throughout
7. Regional spelling matches target region (Canadian/British/Australian English)
8. Customer outcomes are emphasised over feature lists

For each content asset, include a "REVIEWER NOTES" section that flags:
- Any claims that need verification or source attribution
- Suggested image direction or visual assets
- Items requiring compliance or legal review
- Content that references specific data or statistics
- Any assumptions made where the source content was ambiguous

Target quality: 80% ready — polished and professional, requiring only light human review before publishing.

Separate each output with: === OUTPUT: [Output Type Name] ===`);

  return sections.join('\n');
}
