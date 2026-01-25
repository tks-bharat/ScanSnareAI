'use server';

/**
 * @fileOverview Handles scam detection, agentic conversation, and intelligence extraction.
 *
 * - agent - A function that orchestrates the entire agentic interaction.
 * - AgentInput - The input type for the agent function.
 * - UIAgentOutput - The return type for the agent function, intended for UI use.
 * - AgentOutput - The base output type that aligns with the reporting specification.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MessageSchema = z.object({
  sender: z.enum(['scammer', 'user']),
  text: z.string(),
  timestamp: z.string().datetime(),
});

export const AgentInputSchema = z.object({
  sessionId: z.string().describe('Unique session ID for this conversation.'),
  message: MessageSchema.describe('The latest incoming message in the conversation.'),
  conversationHistory: z.array(MessageSchema).describe('All previous messages in the same conversation.'),
  metadata: z.object({
    channel: z.enum(['SMS', 'WhatsApp', 'Email', 'Chat']),
    language: z.string(),
    locale: z.string(),
  }).describe('Optional but recommended metadata.'),
});
export type AgentInput = z.infer<typeof AgentInputSchema>;

export const AgentOutputSchema = z.object({
  status: z.literal('success'),
  scamDetected: z.boolean().describe('Whether a scam attempt was detected.'),
  engagementMetrics: z.object({
    engagementDurationSeconds: z.number().describe('Total duration of the engagement in seconds.'),
    totalMessagesExchanged: z.number().describe('Total number of messages exchanged.'),
  }),
  extractedIntelligence: z.object({
    bankAccounts: z.array(z.string()).optional().describe('Bank accounts extracted from the conversation.'),
    upiIds: z.array(z.string()).optional().describe('UPI IDs extracted from the conversation.'),
    phishingLinks: z.array(z.string()).optional().describe('Phishing links extracted from the conversation.'),
  }),
  agentNotes: z.string().describe('Agent\'s notes about the conversation, including tactics used.'),
});
export type AgentOutput = z.infer<typeof AgentOutputSchema>;

// This is the type returned to the UI, including the agent's conversational response.
const UIAgentOutputSchema = AgentOutputSchema.extend({
    agentResponse: z.string().describe("The AI agent's response to continue the conversation."),
});
export type UIAgentOutput = z.infer<typeof UIAgentOutputSchema>;


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
