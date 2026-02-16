import { outputTypes } from './data/outputTypes';

interface GuardrailResult {
  pass: boolean;
  message: string;
}

const bannedPhrases = [
  "in today's rapidly",
  'in an era of',
  'in the ever-evolving',
  'game-changing',
  'cutting-edge',
  'leverage synergies',
  'paradigm shift',
  'revolutionize',
  'best-in-class',
  'world-class',
  'synergy',
  'disruptive',
];

function checkBrandName(text: string): GuardrailResult {
  const hasAndSpelled = text.includes('Dye and Durham');
  const hasDnD = /\bD&D\b/.test(text);
  if (hasAndSpelled || hasDnD) {
    return { pass: false, message: 'Brand name error: must be "Dye & Durham" (with ampersand, never "Dye and Durham" or "D&D")' };
  }
  return { pass: true, message: '' };
}

function checkExclamationMarks(text: string): GuardrailResult {
  if (text.includes('!')) {
    return { pass: false, message: 'Exclamation mark detected. Remove for professional tone — energy comes from word choice, not punctuation.' };
  }
  return { pass: true, message: '' };
}

function checkGenericPhrasing(text: string): GuardrailResult {
  const lower = text.toLowerCase();
  const found = bannedPhrases.filter(phrase => lower.includes(phrase));
  if (found.length > 0) {
    return { pass: false, message: `Generic AI phrasing detected: "${found.join('", "')}" — replace with specific, human language.` };
  }
  return { pass: true, message: '' };
}

function checkCTAPresence(text: string): GuardrailResult {
  const ctaIndicators = [
    'learn more', 'discover', 'explore', 'request', 'contact',
    'visit', 'download', 'register', 'book a demo', 'get started',
    'see how', 'find out', 'try', 'sign up', 'schedule', 'watch',
  ];
  const lower = text.toLowerCase();
  const hasCTA = ctaIndicators.some(cta => lower.includes(cta));
  if (!hasCTA) {
    return { pass: false, message: 'No clear call to action detected. Consider adding a CTA.' };
  }
  return { pass: true, message: '' };
}

function checkCharacterLimits(text: string, outputTypeId: string): GuardrailResult {
  const ot = outputTypes.find(o => o.id === outputTypeId);
  if (!ot) return { pass: true, message: '' };

  if (ot.charLimit) {
    const len = text.length;
    if (len > ot.charLimit.max * 1.1) {
      return { pass: false, message: `Content is ${len} characters, exceeding the ${ot.charLimit.max} character limit.` };
    }
  }

  if (ot.wordLimit) {
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    if (wordCount > ot.wordLimit.max * 1.1) {
      return { pass: false, message: `Content is ${wordCount} words, exceeding the ${ot.wordLimit.max} word limit.` };
    }
  }

  return { pass: true, message: '' };
}

export function runGuardrailChecks(content: string, outputTypeId: string): string[] {
  const checks = [
    checkBrandName(content),
    checkExclamationMarks(content),
    checkGenericPhrasing(content),
    checkCTAPresence(content),
    checkCharacterLimits(content, outputTypeId),
  ];

  return checks.filter(c => !c.pass).map(c => c.message);
}
