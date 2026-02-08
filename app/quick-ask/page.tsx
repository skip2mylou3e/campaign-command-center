'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { QuickAskMessage } from '@/lib/types';
import { getQuickAskHistory, saveQuickAskMessage } from '@/lib/storage';

const starterQuestions = [
  "Should I use LinkedIn or Google Ads for reaching lawyers in the UK?",
  "What's a realistic budget for a lead gen campaign targeting notaries in BC?",
  "What size images do I need for LinkedIn Sponsored Content?",
  "How do I set up UTM tracking for a HubSpot campaign?",
  "What's a good CTR benchmark for B2B legal tech on Google Search?",
  "We're launching Unity in British Columbia — where should I start?",
  "How do I create a retargeting audience in Meta?",
  "What's the difference between CPC and CPM bidding?",
  "How long should I run a campaign before judging performance?",
  "Should I use Lead Gen Forms on LinkedIn or send people to our website?",
];

export default function QuickAskPage() {
  const [messages, setMessages] = useState<QuickAskMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages(getQuickAskHistory());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (question: string) => {
    if (!question.trim() || isLoading) return;

    const userMessage: QuickAskMessage = {
      id: uuidv4(),
      role: 'user',
      content: question.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    saveQuickAskMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/quick-ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question.trim(),
          history: [...messages, userMessage].slice(-10),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      const assistantMessage: QuickAskMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            assistantMessage.content += chunk;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { ...assistantMessage };
              return updated;
            });
          }
        }
      }

      saveQuickAskMessage(assistantMessage);
    } catch (error) {
      const errorMessage: QuickAskMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: error instanceof Error && error.message.includes('API key')
          ? 'Quick Ask requires an Anthropic API key to work. Please go to Settings to configure one, or try the "Give me a prompt" option in Plan a Campaign — that works without an API key.'
          : `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
      saveQuickAskMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleFeedback = (messageId: string, helpful: boolean) => {
    setMessages(prev =>
      prev.map(m => m.id === messageId ? { ...m, helpful } : m)
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-dd-border px-6 py-4">
        <h1 className="text-2xl font-bold text-dd-slate">Quick Ask</h1>
        <p className="text-sm text-dd-gray mt-1">
          Ask any digital advertising question — get specific, actionable answers tailored to Dye & Durham.
        </p>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Sparkles className="w-12 h-12 text-dd-teal mb-4" />
            <h2 className="text-lg font-semibold text-dd-slate mb-2">
              What can I help you with?
            </h2>
            <p className="text-sm text-dd-gray mb-8 text-center max-w-md">
              Think of me as a knowledgeable colleague who happens to be a digital advertising expert. No question is too basic.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl w-full">
              {starterQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="text-left px-4 py-3 text-sm bg-dd-gray-light text-dd-slate border border-dd-border rounded-lg hover:border-dd-teal hover:text-dd-teal transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-dd-teal text-white'
                      : 'bg-white border border-dd-border text-dd-slate'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  {message.role === 'assistant' && message.content && (
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-dd-border/50">
                      <span className="text-xs text-dd-gray">Was this helpful?</span>
                      <button
                        onClick={() => handleFeedback(message.id, true)}
                        className={`p-1 rounded ${message.helpful === true ? 'text-green-600 bg-green-50' : 'text-dd-gray hover:text-green-600'}`}
                      >
                        <ThumbsUp size={14} />
                      </button>
                      <button
                        onClick={() => handleFeedback(message.id, false)}
                        className={`p-1 rounded ${message.helpful === false ? 'text-red-600 bg-red-50' : 'text-dd-gray hover:text-red-600'}`}
                      >
                        <ThumbsDown size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-dd-border rounded-lg px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-dd-teal rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-dd-teal rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-dd-teal rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-dd-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about digital advertising..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-dd-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-dd-teal focus:border-dd-teal"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="bg-dd-teal text-white px-4 py-3 rounded-lg hover:bg-dd-teal-light disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
