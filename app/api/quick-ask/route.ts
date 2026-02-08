import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildQuickAskSystemPrompt } from '@/lib/prompts/quickAsk';
import { TeamConfig } from '@/lib/types';

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
    const { message, history } = await request.json();

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    // Build conversation history for Claude
    const conversationMessages: { role: 'user' | 'assistant'; content: string }[] = [];
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-8)) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          conversationMessages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    // Ensure the last message is the new user message
    if (conversationMessages.length === 0 || conversationMessages[conversationMessages.length - 1].content !== message) {
      conversationMessages.push({ role: 'user', content: message });
    }

    // Ensure alternating roles
    const cleanedMessages: { role: 'user' | 'assistant'; content: string }[] = [];
    for (const msg of conversationMessages) {
      if (cleanedMessages.length === 0 || cleanedMessages[cleanedMessages.length - 1].role !== msg.role) {
        cleanedMessages.push(msg);
      }
    }

    // Ensure first message is from user
    if (cleanedMessages.length > 0 && cleanedMessages[0].role !== 'user') {
      cleanedMessages.shift();
    }

    const client = new Anthropic({ apiKey });
    const systemPrompt = buildQuickAskSystemPrompt(DEFAULT_CONFIG);

    const stream = client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: cleanedMessages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && 'delta' in event && 'text' in event.delta) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Quick Ask error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
