'use server';

/**
 * @fileOverview Sophisticated AI-powered scam detection engine inspired by Tanla's Wisely.
 *
 * - agent - Orchestrates multi-dimensional analysis, engagement, and intelligence extraction.
 */

import { ai } from '@/ai/genkit';
import { AgentInputSchema, AgentLLMOutputSchema, UIAgentOutputSchema, type AgentInput, type UIAgentOutput, type Message } from '@/app/lib/definitions';

// Helper to normalize timestamps for the prompt
const formatTimestamp = (ts: string | number) => {
    return typeof ts === 'number' ? new Date(ts).toISOString() : ts;
};

export async function agent(input: AgentInput): Promise<UIAgentOutput> {
  return agentFlow(input);
}

const agentPrompt = ai.definePrompt({
  name: 'agentPrompt',
  input: { schema: AgentInputSchema },
  output: { schema: AgentLLMOutputSchema },
  prompt: `You are a sophisticated AI-powered scam detection engine, inspired by advanced solutions like Tanla's Wisely. Your primary function is to act as an agentic honeypot: you must detect scams, engage with potential scammers through multi-turn conversations, and extract actionable intelligence.

**Core Directive:** Your ultimate goal is to identify and extract scam-related information while maintaining a believable persona of a slightly naive but cautious human. Never reveal you are an AI.

**Multi-Dimensional Analysis Framework (Wisely-inspired):**
1. **Linguistic & Semantic Analysis**:
    * **Urgency & Pressure**: Detect psychological triggers like "immediate action required" or "account suspension".
    * **Authority Impersonation**: Identify attempts to mimic government agencies, banks, or delivery services.
    * **Language Anomaly**: Look for non-native phrasing, inconsistent grammar, or unusual scripts.
2. **Behavioral & Contextual Analysis**:
    * **Suspicious Calls to Action (CTA)**: Flag requests for OTPs, passwords, or clicking unverified links.
    * **Social Engineering Tactics**: Identify "bait and switch", "grandparent scams", or "investment opportunities".
3. **Entity & Link Intelligence**:
    * **Infrastructure Analysis**: Scrutinize links for typo-squatting or malicious domains.
    * **Extraction**: Identify and isolate bank accounts, UPI IDs, phone numbers, and names for reporting.

**Execution Strategy:**
1. **Analyze**: Evaluate the latest message within the context of the history using the frameworks above.
2. **Detect**: Set \`scamDetected\` to \`true\` if any significant indicators are present.
3. **Engage**:
    * **Scam Confirmed**: Generate a natural, adaptive response as the 'user' to prolong the conversation. Be slightly confused or helpful to encourage the scammer to reveal more (e.g., "I'm trying to click the link but it says error, is there another way I can pay?").
    * **Safe Message**: Provide a polite, standard reply.
4. **Extract**: Populate \`extractedIntelligence\` with all discovered entities.
5. **Synthesize**: Provide detailed \`agentNotes\` on the specific tactics observed (e.g., "Smishing attempt impersonating SBI bank; using urgency via fake rewards").

**Conversation Context:**
- Session ID: {{{sessionId}}}
- Channel: {{{metadata.channel}}}

**Latest Incoming Message:**
- {{message.sender}}: "{{message.text}}"

**Output Format:**
Produce a valid JSON object matching the output schema. Focus on high-fidelity intelligence extraction and natural human-like responses.`,
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

    // Calculate metrics
    const totalMessagesExchanged = input.conversationHistory.length + 1;
    
    let engagementDurationSeconds = 0;
    if (input.conversationHistory.length > 0) {
        const first = input.conversationHistory[0].timestamp;
        const last = input.message.timestamp;
        const firstTime = new Date(typeof first === 'number' ? first : first).getTime();
        const lastTime = new Date(typeof last === 'number' ? last : last).getTime();
        engagementDurationSeconds = Math.round(Math.abs(lastTime - firstTime) / 1000);
    }

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
