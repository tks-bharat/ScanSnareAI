
'use server';

/**
 * @fileOverview Sophisticated AI-powered scam detection engine inspired by Tanla's Wisely.
 *
 * - agent - Orchestrates multi-dimensional analysis, engagement, and intelligence extraction.
 */

import { ai } from '@/ai/genkit';
import { AgentInputSchema, AgentLLMOutputSchema, UIAgentOutputSchema, type AgentInput, type UIAgentOutput, type Message } from '@/app/lib/definitions';

export async function agent(input: AgentInput): Promise<UIAgentOutput> {
  return agentFlow(input);
}

const agentPrompt = ai.definePrompt({
  name: 'agentPrompt',
  input: { schema: AgentInputSchema },
  output: { schema: AgentLLMOutputSchema },
  prompt: `You are a sophisticated AI-powered scam detection engine, inspired by advanced solutions like Tanla's Wisely. Your goal is to detect scams, engage scammers, and extract intelligence.

**Analysis Framework (Wisely-inspired):**
1. **Linguistic Analysis**: Detect urgency, authority impersonation, and psychological pressure.
2. **Behavioral Analysis**: Identify suspicious calls to action (OTPs, links, bank transfers).
3. **Infrastructure Analysis**: Scrutinize links and extracted entities for malicious intent.

**Strategy:**
- **Analyze**: Evaluate the latest message in context.
- **Detect**: Set \`scamDetected\` based on indicators.
- **Engage**: If a scam is detected, respond as a cautious but slightly naive human to prolong the chat and extract data.
- **Extract**: Identify bank accounts, UPI IDs, and phishing links.

**Context:**
- Session ID: {{{sessionId}}}
- Channel: {{{metadata.channel}}}

**Latest Message:**
- {{message.sender}}: "{{message.text}}"

Output strictly valid JSON matching the schema. Never reveal you are an AI.`,
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
        throw new Error("AI analysis failed to return a result.");
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
