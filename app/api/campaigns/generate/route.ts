import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildFullPlanSystemPrompt, buildBriefContext } from '@/lib/prompts/fullPlan';
import { TeamConfig } from '@/lib/types';
import platformsData from '@/data/platforms.json';

export const maxDuration = 60;

const DEFAULT_CONFIG: TeamConfig = {
  crmPlatform: 'HubSpot',
  hubspotTier: 'Professional',
  salesCrm: 'Salesforce',
  hubspotSalesforceSync: 'Active',
  websitePlatform: 'HubSpot CMS',
  analyticsPlatform: 'Google Analytics 4',
  adAccountsActive: [],
  creativeTools: ['Canva'],
  landingPageCapability: 'Can build in HubSpot',
  primaryBrandColors: '#0A1F3F, #00A5B5',
  brandToneOfVoice: 'Professional, trustworthy, clear.',
  defaultLegalReviewTime: '2 weeks',
  teamSize: '2',
  teamExperienceLevel: 'Beginner',
  standardBudgetApproval: 'Manager approval required for spend over $5,000',
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: 'Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your environment variables.' },
      { status: 400 }
    );
  }

  try {
    const { brief } = await request.json();

    if (!brief) {
      return Response.json({ error: 'Campaign brief is required' }, { status: 400 });
    }

    const client = new Anthropic({ apiKey });
    const systemPrompt = buildFullPlanSystemPrompt(DEFAULT_CONFIG);
    const briefContext = buildBriefContext(brief);

    // Build the user message with brief and platform data
    const platformContext = JSON.stringify(platformsData, null, 2);

    const userMessage = `Here is the campaign brief. Generate a complete campaign plan following the JSON schema exactly.

CAMPAIGN BRIEF:
${briefContext}

PLATFORM REFERENCE DATA:
${platformContext}

Generate the comprehensive campaign plan now. Return ONLY valid JSON matching the schema in your system prompt.`;

    // Use streaming API to avoid Vercel function timeout.
    // Streaming keeps the connection alive as long as data flows,
    // so the 60s timeout only applies between chunks, not total time.
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16384,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          stream.on('text', (text) => {
            controller.enqueue(encoder.encode(text));
          });

          await stream.finalMessage();
          controller.close();
        } catch (err) {
          // Send error as a special prefix so client can detect it
          const errMsg = err instanceof Error ? err.message : 'Stream error';
          controller.enqueue(encoder.encode(`__STREAM_ERROR__${errMsg}`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Plan generation error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to generate plan' },
      { status: 500 }
    );
  }
}
