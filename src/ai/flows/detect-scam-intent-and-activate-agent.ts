'use server';

/**
 * @fileOverview Detects scam intent in incoming messages and activates an AI agent to engage with the scammer.
 *
 * - detectScamIntentAndActivateAgent - A function that handles the scam detection and agent activation process.
 * - DetectScamIntentAndActivateAgentInput - The input type for the detectScamIntentAndActivateAgent function.
 * - DetectScamIntentAndActivateAgentOutput - The return type for the detectScamIntentAndActivateAgent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectScamIntentAndActivateAgentInputSchema = z.object({
  message: z.string().describe('The incoming message to analyze for scam intent.'),
});
export type DetectScamIntentAndActivateAgentInput = z.infer<typeof DetectScamIntentAndActivateAgentInputSchema>;

const DetectScamIntentAndActivateAgentOutputSchema = z.object({
  isScam: z.boolean().describe('Whether the message is likely a scam.'),
  agentResponse: z.string().describe('The AI agent response to engage the scammer.'),
  extractedIntelligence: z.object({
    bankAccountDetails: z.string().optional().describe('Bank account details extracted from the conversation.'),
    upiIds: z.string().optional().describe('UPI IDs extracted from the conversation.'),
    phishingLinks: z.string().optional().describe('Phishing links extracted from the conversation.'),
    phoneNumbers: z.string().optional().describe('Phone numbers extracted from the conversation.'),
    suspiciousKeywords: z.array(z.string()).optional().describe('Suspicious keywords found in the conversation.'),
  }).describe('Extracted intelligence from the conversation.'),
  engagementMetrics: z.object({
    turns: z.number().describe('The number of turns in the conversation.'),
  }).describe('Engagement metrics of the conversation.'),
  agentNotes: z.string().describe('Notes from the AI agent about the conversation.'),
});
export type DetectScamIntentAndActivateAgentOutput = z.infer<typeof DetectScamIntentAndActivateAgentOutputSchema>;

export async function detectScamIntentAndActivateAgent(
  input: DetectScamIntentAndActivateAgentInput
): Promise<DetectScamIntentAndActivateAgentOutput> {
  return detectScamIntentAndActivateAgentFlow(input);
}

const detectScamIntentPrompt = ai.definePrompt({
  name: 'detectScamIntentPrompt',
  input: {schema: DetectScamIntentAndActivateAgentInputSchema},
  output: {schema: DetectScamIntentAndActivateAgentOutputSchema},
  prompt: `You are an AI agent designed to detect scam attempts and engage with scammers.

  Analyze the following message for scam intent:
  Message: {{{message}}}

  Based on the message, determine if it is likely a scam. If it is, generate an AI agent response to engage the scammer, extract any actionable intelligence, and provide engagement metrics and agent notes.

  Output a JSON object that conforms to the output schema.`,
});

const detectScamIntentAndActivateAgentFlow = ai.defineFlow(
  {
    name: 'detectScamIntentAndActivateAgentFlow',
    inputSchema: DetectScamIntentAndActivateAgentInputSchema,
    outputSchema: DetectScamIntentAndActivateAgentOutputSchema,
  },
  async input => {
    const {output} = await detectScamIntentPrompt(input);
    return output!;
  }
);
