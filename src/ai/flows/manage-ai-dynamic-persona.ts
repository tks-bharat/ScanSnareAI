'use server';

/**
 * @fileOverview Manages the AI agent's dynamic persona by adjusting responses based on scammer messages.
 *
 * - manageAIDynamicPersona - A function that handles the dynamic persona management process.
 * - ManageAIDynamicPersonaInput - The input type for the manageAIDynamicPersona function.
 * - ManageAIDynamicPersonaOutput - The return type for the manageAIDynamicPersona function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ManageAIDynamicPersonaInputSchema = z.object({
  scammerMessage: z.string().describe('The latest message from the scammer.'),
  agentPersona: z.string().describe('The current persona of the AI agent.'),
  conversationHistory: z
    .string()
    .optional()
    .describe('The history of the conversation with the scammer.'),
});
export type ManageAIDynamicPersonaInput = z.infer<typeof ManageAIDynamicPersonaInputSchema>;

const ManageAIDynamicPersonaOutputSchema = z.object({
  updatedPersona: z
    .string()
    .describe('The updated persona of the AI agent based on the scammer message.'),
  agentResponse: z
    .string()
    .describe('The AI agent response based on the updated persona.'),
});
export type ManageAIDynamicPersonaOutput = z.infer<typeof ManageAIDynamicPersonaOutputSchema>;

export async function manageAIDynamicPersona(
  input: ManageAIDynamicPersonaInput
): Promise<ManageAIDynamicPersonaOutput> {
  return manageAIDynamicPersonaFlow(input);
}

const adjustPersonaPrompt = ai.definePrompt({
  name: 'adjustPersonaPrompt',
  input: {schema: ManageAIDynamicPersonaInputSchema},
  output: {schema: ManageAIDynamicPersonaOutputSchema},
  prompt: `You are an AI agent designed to engage with scammers. Your goal is to maintain a believable persona to extract information from them.

  Current Persona: {{{agentPersona}}}

  Scammer's Message: {{{scammerMessage}}}

  Conversation History: {{{conversationHistory}}}

  Based on the scammer's message and the conversation history, adjust your persona to be more believable and engaging. Consider the scammer's communication style, tone, and any revealed information.

  Provide an updated persona and a response that aligns with the updated persona. The response should be conversational and aimed at continuing the engagement with the scammer.

  Output the updated persona and the AI agent response in a structured format.

  {{zodFormat instruction=ManageAIDynamicPersonaOutputSchema}}
  `,
});

const manageAIDynamicPersonaFlow = ai.defineFlow(
  {
    name: 'manageAIDynamicPersonaFlow',
    inputSchema: ManageAIDynamicPersonaInputSchema,
    outputSchema: ManageAIDynamicPersonaOutputSchema,
  },
  async input => {
    const {output} = await adjustPersonaPrompt(input);
    return output!;
  }
);
