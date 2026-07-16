// Grok Agent - xAI Integration for CAT Email Agent
// Grok uses OpenAI-compatible API format

interface Message {
 role: 'user' | 'assistant';
 content: string;
}

interface EmailOperation {
 operation: string;
 target?: string;
 details?: Record<string, unknown>;
}

// Using fetch to call Grok API (OpenAI-compatible endpoint)
async function callGrokAPI(messages: Array<{ role: string; content: string }>, systemPrompt: string): Promise<string> {
 const apiKey = process.env.GROK_API_KEY;

 if (!apiKey) {
 throw new Error('GROK_API_KEY environment variable not set');
 }

 const response = await fetch('https://api.x.ai/openai/v1/chat/completions', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${apiKey}`,
 },
 body: JSON.stringify({
 model: 'grok-2-latest',
 messages: [
 { role: 'system', content: systemPrompt },
 ...messages,
 ],
 temperature: 0.7,
 max_tokens: 2000,
 }),
 });

 if (!response.ok) {
 const error = await response.text();
 throw new Error(`Grok API error: ${response.status} - ${error}`);
 }

 const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
 return data.choices?.[0]?.message?.content || '';
}

export async function runGrokAgent(userMessage: string, conversationHistory: Message[] = []): Promise<string> {
 const systemPrompt = `You are CAT Email Agent - a privacy-first email management assistant powered by Grok.

You help users manage their Gmail inbox using natural language commands.

AVAILABLE OPERATIONS:
- search: Find emails by sender, subject, date, or keywords
- delete: Permanently delete emails
- archive: Move emails to archive
- spam: Mark as spam
- send: Compose and send emails
- block: Add senders to local block list
- remember: Save email templates or preferences

PRIVACY RULES (CRITICAL):
- NEVER store, retain, or transmit email content beyond this conversation
- NEVER share data with third parties
- NEVER analyze patterns for profiling
- NEVER track user behavior
- All data is processed in-memory only
- Delete everything after the operation completes

RESPONSE FORMAT:
Respond with JSON containing:
{
 "operation": "search|delete|archive|spam|send|block|remember",
 "target": "email address or search query",
 "details": { "additional": "parameters" },
 "explanation": "What we're doing and privacy guarantees"
}

Ensure every response includes privacy assurance.`;

 const messages = conversationHistory.map(m => ({
 role: m.role,
 content: m.content,
 }));

 messages.push({ role: 'user', content: userMessage });

 try {
 const response = await callGrokAPI(messages, systemPrompt);

 // Clean up response - remove markdown code blocks if present
 const cleanedMessage = response
 .replace(/```json\n?/g, '')
 .replace(/```\n?/g, '')
 .trim();

 return cleanedMessage;
 } catch (error) {
 if (error instanceof Error) {
 throw new Error(`Grok agent error: ${error.message}`);
 }
 throw error;
 }
}

export function parseGrokResponse(response: string): EmailOperation {
 try {
 // Try to extract JSON from response
 const jsonMatch = response.match(/\{[\s\S]*\}/);
 if (!jsonMatch) {
 return {
 operation: 'search',
 details: { query: response }
 };
 }
 return JSON.parse(jsonMatch[0]);
 } catch {
 return {
 operation: 'search',
 details: { query: response }
 };
 }
}

export function getGrokSystemPrompt(): string {
 return `You are CAT Email Agent - a privacy-first email management assistant powered by Grok (xAI).

Privacy is your highest priority. You MUST:
- Never store email content
- Never analyze patterns
- Never share data
- Never track behavior
- Process everything in-memory only

Help users manage Gmail with natural language commands and witty responses.`;
}
