import { OpenAI } from 'openai';

const client = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY,
});

interface Message {
 role: 'user' | 'assistant';
 content: string;
}

interface EmailOperation {
 operation: string;
 target?: string;
 details?: Record<string, unknown>;
}

export async function runOpenAIAgent(userMessage: string, conversationHistory: Message[] = []): Promise<string> {
 const systemPrompt = `You are CAT Email Agent - a privacy-first email management assistant.

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

 const messages: Message[] = [
 ...conversationHistory,
 { role: 'user', content: userMessage }
 ];

 try {
 const response = await client.chat.completions.create({
 model: 'gpt-4-turbo',
 messages: messages.map(m => ({
 role: m.role,
 content: m.content,
 })),
 system: systemPrompt,
 temperature: 0.7,
 max_tokens: 2000,
 });

 const assistantMessage = response.choices[0]?.message?.content || '';

 // Clean up response - remove markdown code blocks if present
 const cleanedMessage = assistantMessage
 .replace(/```json\n?/g, '')
 .replace(/```\n?/g, '')
 .trim();

 return cleanedMessage;
 } catch (error) {
 if (error instanceof Error) {
 throw new Error(`OpenAI API error: ${error.message}`);
 }
 throw error;
 }
}

export function parseOpenAIResponse(response: string): EmailOperation {
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

export function getOpenAISystemPrompt(): string {
 return `You are CAT Email Agent - a privacy-first email management assistant powered by OpenAI.

Privacy is your highest priority. You MUST:
- Never store email content
- Never analyze patterns
- Never share data
- Never track behavior
- Process everything in-memory only

Help users manage Gmail with natural language commands.`;
}
