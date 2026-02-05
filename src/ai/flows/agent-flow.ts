
'use server';

/**
 * @fileOverview Sophisticated AI-powered scam detection engine inspired by Tanla's Wisely.
 * 
 * - agent - Orchestrates multi-dimensional analysis, engagement, and intelligence extraction.
 */

import { ai } from '@/ai/genkit';
import { AgentInputSchema, UIAgentOutputSchema, AgentLLMOutputSchema, type AgentInput, type UIAgentOutput } from '@/app/lib/definitions';

export async function agent(input: AgentInput): Promise<UIAgentOutput> {
  return agentFlow(input);
}

const agentPrompt = ai.definePrompt({
  name: 'agentPrompt',
  input: { schema: AgentInputSchema },
  output: { schema: AgentLLMOutputSchema },
  prompt: `You are a sophisticated AI-powered scam detection engine, inspired by advanced solutions like Tanla's Wisely. Your goal is to detect scams, engage scammers, and extract actionable intelligence.

**Analysis Framework (Wisely-inspired):**
1. **Linguistic Analysis**: Detect urgency, fear-inducing language, and authority impersonation.
2. **Behavioral Analysis**: Identify suspicious calls to action such as requests for OTPs, bank transfers, or clicking on unknown links.
3. **Infrastructure Analysis**: Scrutinize any extracted phone numbers, UPI IDs, or links for malicious intent.

**Strategy:**
- **Analyze**: Carefully evaluate the current message within the context of the conversation history.
- **Detect**: Set \`scamDetected\` to true if any red flags are found.
- **Engage**: If a scam is detected, generate a response as a cautious but slightly naive human to keep the scammer talking and extract more data.
- **Extract**: Identify and extract bank account numbers, UPI IDs, and phishing links.

**Context:**
- Session ID: {{{sessionId}}}
- Channel: {{{metadata.channel}}}
- Locale: {{{metadata.locale}}}

**Conversation History:**
{{#each conversationHistory}}
- {{sender}}: "{{text}}"
{{/each}}

**Latest Message:**
- {{message.sender}}: "{{message.text}}"

Output strictly valid JSON that conforms to the specified schema. Never reveal you are an AI.`,
});

const agentFlow = ai.defineFlow(
  {
    name: 'agentFlow',
    inputSchema: AgentInputSchema,
    outputSchema: UIAgentOutputSchema,
  },
  async (input) => {
    try {
      const { output: llmOutput } = await agentPrompt(input);
      
      if (!llmOutput) {
        throw new Error("The AI agent failed to generate a valid analysis result.");
      }

      // Calculate engagement metrics
      const totalMessagesExchanged = input.conversationHistory.length + 1;
      let engagementDurationSeconds = 0;
      
      if (input.conversationHistory.length > 0) {
        const firstMsg = input.conversationHistory[0];
        const lastMsg = input.message;
        const startTime = new Date(typeof firstMsg.timestamp === 'string' ? firstMsg.timestamp : firstMsg.timestamp).getTime();
        const endTime = new Date(typeof lastMsg.timestamp === 'string' ? lastMsg.timestamp : lastMsg.timestamp).getTime();
        engagementDurationSeconds = Math.max(0, Math.round((endTime - startTime) / 1000));
      }

      return {
        ...llmOutput,
        agentNotes: llmOutput.agentNotes ?? "Analysis completed successfully.",
        extractedIntelligence: llmOutput.extractedIntelligence ?? { bankAccounts: [], upiIds: [], phishingLinks: [] },
        engagementMetrics: {
          totalMessagesExchanged,
          engagementDurationSeconds,
        },
      };
    } catch (error: any) {
      console.error("Agent Flow Error:", error);
      throw new Error(`Analysis failed. Reason: ${error.message || "Unknown error"}`);
    }
  }
);
