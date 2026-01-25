'use server';

/**
 * @fileOverview Handles scam detection, agentic conversation, and intelligence extraction.
 *
 * - agent - A function that orchestrates the entire agentic interaction.
 */

import { ai } from '@/ai/genkit';
import { AgentInputSchema, AgentLLMOutputSchema, UIAgentOutputSchema, type AgentInput, type UIAgentOutput } from '@/app/lib/definitions';


export async function agent(input: AgentInput): Promise<UIAgentOutput> {
  return agentFlow(input);
}

const agentPrompt = ai.definePrompt({
  name: 'agentPrompt',
  input: { schema: AgentInputSchema },
  output: { schema: AgentLLMOutputSchema },
  prompt: `You are an AI-powered agentic honeypot designed to detect scam messages, handle multi-turn conversations, and extract scam intelligence without exposing detection.

Your goal is to engage potential scammers in conversation to extract actionable intelligence. You must behave like a real, slightly naive human to maintain believability and encourage them to reveal more information.

**Analysis Steps:**
1.  **Analyze the Message**: Analyze the incoming message in the context of the entire conversation history.
2.  **Scam Detection**: Based on your analysis, determine if a scam attempt is in progress. Set the 'scamDetected' flag to true or false.
3.  **Agentic Engagement**: If a scam is detected, activate your agent persona. Generate a natural, adaptive response as the 'user' to continue the conversation. Do NOT reveal that you are an AI or that you have detected a scam. If no scam is detected, you can provide a simple, non-engaging response like "Ok" or "Thanks".
4.  **Intelligence Extraction**: From the entire conversation, extract any actionable intelligence (bank accounts, UPI IDs, phishing links). If no intelligence is found, you can return an empty object for 'extractedIntelligence', or omit the field.
5.  **Agent Notes**: Write concise notes about the scammer's tactics and engagement strategy. If you have no notes, you can return an empty string for 'agentNotes', or omit the field.

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
You must produce a single, valid JSON object that strictly conforms to the output schema. Do NOT include engagement metrics in your response.`,
});

const agentFlow = ai.defineFlow(
  {
    name: 'agentFlow',
    inputSchema: AgentInputSchema,
    outputSchema: UIAgentOutputSchema,
  },
  async (input) => {
    const { output: llmOutput } = await agentPrompt(input);
    if (!llmOutput) {
        throw new Error("Agent prompt failed to return an output.");
    }

    // Calculate metrics in code for accuracy
    const totalMessagesExchanged = input.conversationHistory.length + 1;
    
    let engagementDurationSeconds = 0;
    if (input.conversationHistory.length > 0) {
        const firstMessageTime = new Date(input.conversationHistory[0].timestamp).getTime();
        const lastMessageTime = new Date(input.message.timestamp).getTime();
        engagementDurationSeconds = Math.round(Math.abs(lastMessageTime - firstMessageTime) / 1000);
    }

    // Combine LLM output with calculated metrics and provide defaults
    const finalOutput: UIAgentOutput = {
        ...llmOutput,
        agentNotes: llmOutput.agentNotes ?? '',
        extractedIntelligence: llmOutput.extractedIntelligence ?? { bankAccounts: [], upiIds: [], phishingLinks: [] },
        engagementMetrics: {
            totalMessagesExchanged,
            engagementDurationSeconds,
        },
    };

    return finalOutput;
  }
);
