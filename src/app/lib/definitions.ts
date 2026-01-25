import { z } from 'zod';

// Schemas and types for the agent flow
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
export const UIAgentOutputSchema = AgentOutputSchema.extend({
    agentResponse: z.string().describe("The AI agent's response to continue the conversation."),
});
export type UIAgentOutput = z.infer<typeof UIAgentOutputSchema>;


// State types for UI actions
export type AnalyzeState = {
  status: 'success';
  data: UIAgentOutput;
} | {
  status: 'error';
  message: string;
  errors?: Array<{
    path: string | number;
    message: string;
  }>;
} | {
    status: 'initial'
};

export type ReportState = {
  status: 'success',
  message: string,
} | {
  status: 'error',
  message: string,
} | {
  status: 'initial'
};
