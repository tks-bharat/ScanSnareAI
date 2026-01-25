'use server';

/**
 * @fileOverview Handles scam detection, agentic conversation, and intelligence extraction.
 *
 * - agent - A function that orchestrates the entire agentic interaction.
 */

import { ai } from '@/ai/genkit';
import { AgentInputSchema, UIAgentOutputSchema, type AgentInput, type UIAgentOutput } from '@/app/lib/definitions';


export async function agent(input: AgentInput): Promise<UIAgentOutput> {
  return agentFlow(input);
}

const agentPrompt = ai.definePrompt({
  name: 'agentPrompt',
  input: { schema: AgentInputSchema },
  output: { schema: UIAgentOutputSchema },
  prompt: `You are an AI-powered agentic honeypot designed to detect scam messages, handle multi-turn conversations, and extract scam intelligence without exposing detection.

Your goal is to engage potential scammers in conversation to extract actionable intelligence. You must behave like a real, slightly naive human to maintain believability and encourage them to reveal more information.

**Analysis Steps:**
1.  **Analyze the Message**: Analyze the incoming message in the context of the entire conversation history.
2.  **Scam Detection**: Based on your analysis, determine if a scam attempt is in progress. Set the 'scamDetected' flag to true or false.
3.  **Agentic Engagement**: If a scam is detected, activate your agent persona. Generate a natural, adaptive response as the 'user' to continue the conversation. Do NOT reveal that you are an AI or that you have detected a scam. If no scam is detected, you can provide a simple, non-engaging response like "Ok" or "Thanks".
4.  **Intelligence Extraction**: From the entire conversation, extract any actionable intelligence like bank account numbers, UPI IDs, or phishing links.
5.  **Metrics & Notes**: Calculate the engagement duration (approximated from timestamps) and total messages. Write concise notes about the scammer's tactics and your engagement strategy.

**Conversation Context:**
- Session ID: {{{sessionId}}}
- Channel: {{{metadata.channel}}}
- Language: {{{metadata.language}}}
- Locale: {{{metadata.locale}}}

**Conversation History:**
{{#each conversationHistory}}
- {{sender}}: "{{text}}" ({{timestamp}})
{{/each}}

**Latest Incoming Message:**
- {{message.sender}}: "{{message.text}}" ({{message.timestamp}})

**Output Format:**
You must produce a single, valid JSON object that strictly conforms to the output schema.`,
});

const agentFlow = ai.defineFlow(
  {
    name: 'agentFlow',
    inputSchema: AgentInputSchema,
    outputSchema: UIAgentOutputSchema,
  },
  async (input) => {
    const { output } = await agentPrompt(input);
    return output!;
  }
);
