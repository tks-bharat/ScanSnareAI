import { z } from 'zod';

// Schemas and types for the agent flow
const MessageSchema = z.object({
  sender: z.enum(['scammer', 'user']),
  text: z.string(),
  // Support both ISO strings and numeric timestamps (ms)
  timestamp: z.union([
    z.string().datetime({ message: "Invalid ISO-8601 datetime format" }),
    z.number().describe('Unix timestamp in milliseconds')
  ]),
});
export type Message = z.infer<typeof MessageSchema>;

export const AgentInputSchema = z.object({
  sessionId: z.string().describe('Unique session ID for this conversation.'),
  message: MessageSchema.describe('The latest incoming message in the conversation.'),
  conversationHistory: z.array(MessageSchema).describe('All previous messages in the same conversation.'),
  metadata: z.object({
    channel: z.enum(['SMS', 'WhatsApp', 'Email', 'Chat']),
    language: z.string(),
    locale: z.string(),
  }).describe('Contextual metadata about the message channel.'),
});
export type AgentInput = z.infer<typeof AgentInputSchema>;

// This is the full output from the agent, including the response to the user and metrics.
export const UIAgentOutputSchema = z.object({
    scamDetected: z.boolean().describe('Whether a scam attempt was detected.'),
    engagementMetrics: z.object({
      engagementDurationSeconds: z.number().describe('Total duration of the engagement in seconds.'),
      totalMessagesExchanged: z.number().describe('Total number of messages exchanged.'),
    }),
    extractedIntelligence: z.object({
      bankAccounts: z.array(z.string()).optional().nullable().describe('Bank accounts extracted.'),
      upiIds: z.array(z.string()).optional().nullable().describe('UPI IDs extracted.'),
      phishingLinks: z.array(z.string()).optional().nullable().describe('Phishing links extracted.'),
    }).optional().nullable(),
    agentNotes: z.string().optional().nullable().describe("Agent's analysis notes."),
    agentResponse: z.string().describe("The AI agent's response to continue the conversation."),
});
export type UIAgentOutput = z.infer<typeof UIAgentOutputSchema>;

// This is the output from the LLM, without the metrics that we will calculate in code.
export const AgentLLMOutputSchema = UIAgentOutputSchema.omit({ engagementMetrics: true });
export type AgentLLMOutput = z.infer<typeof AgentLLMOutputSchema>;

// API Specific Response Format
export const APIResponseSchema = z.object({
    status: z.literal('success'),
    reply: z.string().describe("The AI agent's response."),
});
export type APIResponse = z.infer<typeof APIResponseSchema>;

// State types for UI actions
export type AnalyzeState = {
  status: 'success';
  data: UIAgentOutput;
  originalMessage: string;
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
