import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildCGESystemPrompt, buildChannelUserPrompt, buildFeedbackUserPrompt, formatPreviousOutputsAsAssistant } from '@/lib/content-generator/prompts/systemPrompt';
import { GeneratedOutput, OutputCategory } from '@/lib/content-generator/types';

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
    const input = body.input;
    const channelGroup: string = body.channelGroup;
    const regeneration: { feedback: string; previousOutputs: GeneratedOutput[] } | undefined = body.regeneration;

    if (!input?.sourceContent) {
      return Response.json({ error: 'Source content is required' }, { status: 400 });
    }

    if (!channelGroup) {
      return Response.json({ error: 'Channel group is required' }, { status: 400 });
    }

    const client = new Anthropic({ apiKey });
    const systemPrompt = buildCGESystemPrompt(input);
    const userPrompt = buildChannelUserPrompt(input, channelGroup as OutputCategory);

    // Blog needs more tokens for 1,500-2,000 word posts
    const maxTokens = channelGroup === 'blog' ? 8000 : 4000;

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          let fullText = '';
          let continuationAttempts = 0;
          const maxContinuations = 3;

          // Build messages — multi-turn for regeneration, single-turn for initial generation
          const messages: Anthropic.MessageParam[] = regeneration
            ? [
                { role: 'user', content: userPrompt },
                { role: 'assistant', content: formatPreviousOutputsAsAssistant(regeneration.previousOutputs) },
                { role: 'user', content: buildFeedbackUserPrompt(regeneration.feedback, channelGroup as OutputCategory) },
              ]
            : [
                { role: 'user', content: userPrompt },
              ];

          while (continuationAttempts <= maxContinuations) {
            const stream = client.messages.stream({
              model: 'claude-sonnet-4-20250514',
              max_tokens: maxTokens,
              system: systemPrompt,
              messages,
            });

            let chunkText = '';

            stream.on('text', (text) => {
              chunkText += text;
              controller.enqueue(encoder.encode(text));
            });

            const finalMsg = await stream.finalMessage();
            fullText += chunkText;

            // Check if we hit max tokens and need to continue
            if (finalMsg.stop_reason === 'max_tokens' && continuationAttempts < maxContinuations) {
              continuationAttempts++;
              // Add the partial response and a continuation prompt
              messages.push(
                { role: 'assistant', content: fullText },
                { role: 'user', content: 'Continue generating from where you left off. Do not repeat any content you have already produced. Pick up exactly where you stopped.' }
              );
            } else {
              break;
            }
          }

          controller.close();
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Content generation failed';
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
    console.error('Content generation error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to generate content' },
      { status: 500 }
    );
  }
}
