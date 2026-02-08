// Robust JSON parsing with fallback repair for Claude API responses
export function parseJsonResponse(text: string): unknown {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // Continue to repair attempts
  }

  // Strip markdown fences
  let cleaned = text.replace(/^```(?:json)?\s*\n?/gm, '').replace(/\n?```\s*$/gm, '');

  // Try parsing stripped version
  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue
  }

  // Try to extract JSON object from surrounding text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  // Fix common issues
  // Remove trailing commas before closing braces/brackets
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

  // Fix single quotes to double quotes (naive but often works)
  // Only do this if there are no double quotes at all
  if (!cleaned.includes('"') && cleaned.includes("'")) {
    cleaned = cleaned.replace(/'/g, '"');
  }

  // Try parsing repaired version
  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue
  }

  // Handle truncated JSON by closing open structures
  let repaired = cleaned;
  const openBraces = (repaired.match(/{/g) || []).length;
  const closeBraces = (repaired.match(/}/g) || []).length;
  const openBrackets = (repaired.match(/\[/g) || []).length;
  const closeBrackets = (repaired.match(/]/g) || []).length;

  // Remove any trailing partial key-value pair
  repaired = repaired.replace(/,\s*"[^"]*"?\s*:?\s*$/, '');
  repaired = repaired.replace(/,\s*$/, '');

  // Close open brackets and braces
  for (let i = 0; i < openBrackets - closeBrackets; i++) {
    repaired += ']';
  }
  for (let i = 0; i < openBraces - closeBraces; i++) {
    repaired += '}';
  }

  try {
    return JSON.parse(repaired);
  } catch (e) {
    throw new Error(`Failed to parse JSON response after repair attempts: ${(e as Error).message}`);
  }
}
