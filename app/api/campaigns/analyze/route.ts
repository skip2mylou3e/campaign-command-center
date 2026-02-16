import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: 'Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your environment variables.' },
      { status: 400 }
    );
  }

  try {
    const { freeText, uploadedDocuments } = await request.json();

    if (!freeText?.trim()) {
      return Response.json({ error: 'Description is required' }, { status: 400 });
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: `You are a senior digital advertising strategist at Dye & Durham, a legal technology company operating in Canada, the United Kingdom, and Australia. A team member has described a campaign they want to run. Your job is to identify what key information is missing and ask smart follow-up questions to fill in the gaps.

Analyze their description and generate 4-6 follow-up questions that cover the most important missing details. Focus on these areas (but ONLY ask if the information was NOT already provided):
- Campaign objective / what success looks like
- Target audience specifics (job titles, firm size, pain points)
- Geography / market
- Budget range
- Timeline / urgency
- What specific product or service is being promoted
- Desired outcomes / KPIs
- Any existing assets, past learnings, or constraints

DO NOT ask about things the user already clearly stated. Only ask about gaps.
If reference documents are attached, consider their content when identifying gaps. Do not ask about things already answered in the documents.
Keep questions conversational and friendly — not like a form.

Also suggest a short campaign name based on what they described.

Respond ONLY with valid JSON in this exact format:
{
  "suggestedName": "string — short campaign name, e.g. 'Unity BC Launch Q1'",
  "questions": [
    {
      "id": "string — short key like 'budget', 'audience', 'timeline'",
      "question": "string — the follow-up question, conversational and friendly",
      "hint": "string — a brief example answer to guide them"
    }
  ]
}

No markdown fences. No preamble. No commentary outside the JSON.`,
      messages: [{
        role: 'user',
        content: buildAnalyzeUserMessage(freeText, uploadedDocuments),
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
    console.error('Brief analysis error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze brief' },
      { status: 500 }
    );
  }
}

function buildAnalyzeUserMessage(
  freeText: string,
  uploadedDocuments?: { name: string; docType: string; content: string }[]
): string {
  let message = `Here's what the team member wrote about their campaign:\n\n"${freeText}"`;

  if (uploadedDocuments && uploadedDocuments.length > 0) {
    const docsWithContent = uploadedDocuments.filter(d => d.content?.trim());
    if (docsWithContent.length > 0) {
      message += '\n\n--- ATTACHED REFERENCE DOCUMENTS ---';
      for (const doc of docsWithContent) {
        const typeLabel = doc.docType.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
        message += `\n\n[${typeLabel}] ${doc.name || 'Untitled'}\n${doc.content}`;
      }
    }
  }

  return message;
}
