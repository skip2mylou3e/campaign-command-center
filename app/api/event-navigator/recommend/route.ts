import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildEventNavigatorSystemPrompt, buildUserPrompt } from '@/lib/event-navigator/prompts/systemPrompt';
import { TierModelAssumptions, ObjectiveParams, ScoredEvent } from '@/lib/event-navigator/types';

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: 'Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your environment variables.' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const params: ObjectiveParams = body.params;
    const assumptions: TierModelAssumptions = body.assumptions;
    const scoredEvents: ScoredEvent[] = body.scoredEvents;

    if (!params?.objective) {
      return Response.json({ error: 'Objective is required' }, { status: 400 });
    }

    const client = new Anthropic({ apiKey });
    const systemPrompt = buildEventNavigatorSystemPrompt(assumptions, scoredEvents);
    const userPrompt = buildUserPrompt(params);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const stream = client.messages.stream({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 8000,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
          });

          stream.on('text', (text) => {
            controller.enqueue(encoder.encode(text));
          });

          await stream.finalMessage();
          controller.close();
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Recommendation generation failed';
          controller.enqueue(encoder.encode(`__STREAM_ERROR__${errorMsg}`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Event navigator recommendation error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
