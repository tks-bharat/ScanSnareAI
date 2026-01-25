'use server';

/**
 * @fileOverview Extracts actionable intelligence from the AI agent's conversation with the scammer.
 *
 * - extractActionableIntelligence - A function that handles the extraction process.
 * - ExtractActionableIntelligenceInput - The input type for the extractActionableIntelligence function.
 * - ExtractActionableIntelligenceOutput - The return type for the extractActionableIntelligence function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractActionableIntelligenceInputSchema = z.object({
  conversation: z
    .string()
    .describe('The complete conversation between the AI agent and the scammer.'),
});
export type ExtractActionableIntelligenceInput = z.infer<
  typeof ExtractActionableIntelligenceInputSchema
>;

const ExtractActionableIntelligenceOutputSchema = z.object({
  bankAccountDetails: z
    .array(z.string())
    .describe('List of bank account details extracted from the conversation.'),
  upiIDs: z
    .array(z.string())
    .describe('List of UPI IDs extracted from the conversation.'),
  phishingLinks: z
    .array(z.string())
    .describe('List of phishing links extracted from the conversation.'),
  phoneNumbers: z
    .array(z.string())
    .describe('List of phone numbers extracted from the conversation.'),
  suspiciousKeywords: z
    .array(z.string())
    .describe('List of suspicious keywords extracted from the conversation.'),
});
export type ExtractActionableIntelligenceOutput = z.infer<
  typeof ExtractActionableIntelligenceOutputSchema
>;

export async function extractActionableIntelligence(
  input: ExtractActionableIntelligenceInput
): Promise<ExtractActionableIntelligenceOutput> {
  return extractActionableIntelligenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractActionableIntelligencePrompt',
  input: {schema: ExtractActionableIntelligenceInputSchema},
  output: {schema: ExtractActionableIntelligenceOutputSchema},
  prompt: `You are a security analyst tasked with extracting actionable intelligence from a conversation between an AI agent and a scammer.

  Analyze the following conversation and extract the following information:

  - Bank account details
  - UPI IDs
  - Phishing links
  - Phone numbers
  - Suspicious keywords

  Return the extracted information in a structured JSON format that conforms to the output schema.

  Conversation: {{{conversation}}}
`,
});

const extractActionableIntelligenceFlow = ai.defineFlow(
  {
    name: 'extractActionableIntelligenceFlow',
    inputSchema: ExtractActionableIntelligenceInputSchema,
    outputSchema: ExtractActionableIntelligenceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
