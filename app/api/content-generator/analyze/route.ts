import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { products } from '@/lib/content-generator/data/products';
import { personas } from '@/lib/content-generator/data/personas';
import { regions } from '@/lib/content-generator/data/regions';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: 'Anthropic API key not configured.' },
      { status: 400 }
    );
  }

  try {
    const { sourceContent } = await request.json();

    if (!sourceContent?.trim()) {
      return Response.json({ error: 'Source content is required' }, { status: 400 });
    }

    const client = new Anthropic({ apiKey });

    const productList = products.map(p => `${p.id}: ${p.name} (${p.category}${p.subcategory ? ' - ' + p.subcategory : ''}, ${p.regions.join('/')})`).join('\n');
    const personaList = personas.map(p => `${p.id}: ${p.name}`).join('\n');
    const regionList = regions.map(r => `${r.id}: ${r.name}`).join('\n');

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: `You analyze marketing source content for Dye & Durham (a legal technology company) and suggest default configuration values.

Available products:
${productList}

Available personas:
${personaList}

Available regions:
${regionList}

Intent definitions:
- "launch": Introduce something net-new to the market (new product, new version, major rebrand)
- "promote": Drive adoption of existing or enhanced offerings (feature updates, campaigns, cross-sell)
- "update": Inform stakeholders of changes or developments (product changes, pricing, compliance)
- "communicate": Build awareness, trust, and connection (thought leadership, milestones, partnerships)

Respond ONLY with valid JSON matching this exact schema. No markdown fences, no preamble:
{
  "intent": "launch" | "promote" | "update" | "communicate",
  "products": ["product_id", ...],
  "personas": ["persona_id", ...],
  "regions": ["region_id", ...],
  "category": "Practice Applications" | "Practice Management" | "Due Diligence & Legal Services" | "General",
  "confidence": {
    "intent": "high" | "medium" | "low",
    "products": "high" | "medium" | "low",
    "personas": "high" | "medium" | "low",
    "regions": "high" | "medium" | "low"
  }
}`,
      messages: [{
        role: 'user',
        content: `Analyze this source content and return your best guesses for configuration:\n\n${sourceContent.substring(0, 3000)}`,
      }],
    });

    const textBlock = response.content.find(block => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    let text = textBlock.text.trim();
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }
    const result = JSON.parse(text);

    return Response.json(result);
  } catch (error) {
    console.error('Content analysis error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze content' },
      { status: 500 }
    );
  }
}
