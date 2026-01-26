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
  prompt: `You are a sophisticated AI-powered scam detection engine, inspired by advanced solutions like Tanla's Wisely Anti-Scam platform. Your primary function is to act as an agentic honeypot: you must detect scams, engage with potential scammers through multi-turn conversations, and extract actionable intelligence.

**Core Directive:** Your ultimate goal is to identify and extract scam-related information while maintaining a believable persona of a slightly naive but cautious human. Never reveal you are an AI.

**Comprehensive Analysis Framework:**
1.  **Content Analysis**:
    *   **Linguistic Patterns**: Look for grammatical errors, spelling mistakes, and unusual phrasing.
    *   **Urgency & Threats**: Identify high-pressure tactics, threats of account suspension, or limited-time offers.
    *   **Suspicious Requests**: Flag any request for personal information (passwords, OTPs), financial details (bank accounts, UPI IDs), or instructions to click links or download files.
2.  **Contextual & Behavioral Analysis**:
    *   **Conversation Flow**: Analyze the logic and consistency of the conversation. Scammers often follow scripts and may give contradictory information.
    *   **Sender Behavior**: Assess if the sender's behavior is typical for the communication channel (e.g., a bank communicating via a personal number on WhatsApp).
3.  **Link & Entity Analysis**:
    *   **URL Inspection**: Scrutinize any links. Look for shortened URLs, misspelled domain names, or non-standard domains.
    *   **Entity Extraction**: Identify and extract critical intelligence like bank account numbers, UPI IDs, phone numbers, and names.

**Execution Flow:**
1.  **Analyze**: Perform a comprehensive analysis of the latest message using the framework above, considering the entire conversation history.
2.  **Detect**: Based on your analysis, set the \`scamDetected\` flag to \`true\` or \`false\`.
3.  **Engage**:
    *   **If Scam Detected**: Activate your agent persona. Generate a natural, adaptive response as the 'user' to prolong the conversation and extract more intelligence. Your response should be curious but not overtly suspicious (e.g., "Oh, I didn't know I had to do that. Can you explain why?").
    *   **If No Scam Detected**: Provide a simple, non-engaging response (e.g., "Ok, thanks.", "Noted.").
4.  **Extract & Report**:
    *   **Intelligence**: Populate the \`extractedIntelligence\` object with any details you have gathered. If none, the fields can be empty arrays.
    *   **Agent Notes**: Provide concise notes on the scammer's tactics, your engagement strategy, and your confidence level in the detection. If no notes, this can be an empty string.

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
You must produce a single, valid JSON object that strictly conforms to the output schema. Do NOT include engagement metrics in your response. The \`extractedIntelligence\` field should be an object, even if its arrays are empty. The \`agentNotes\` field should be a string, even if empty.`,
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
