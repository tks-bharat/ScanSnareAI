'use server';

import { agent } from '@/ai/flows/agent-flow';
import { z } from 'zod';
import type { AnalyzeState, ReportState, UIAgentOutput, Message } from '@/app/lib/definitions';

const analyzeSchema = z.object({
  message: z.string().min(1, { message: 'Message cannot be empty.' }),
  conversationHistory: z.string(), // JSON string
  sessionId: z.string(),
});


export async function analyzeMessage(prevState: AnalyzeState, formData: FormData): Promise<AnalyzeState> {
  const validatedFields = analyzeSchema.safeParse({
    message: formData.get('message'),
    conversationHistory: formData.get('conversationHistory'),
    sessionId: formData.get('sessionId'),
  });

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: 'Invalid form data.',
      errors: validatedFields.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    };
  }

  const { message, sessionId } = validatedFields.data;
  const conversationHistory = JSON.parse(validatedFields.data.conversationHistory) as Message[];

  try {
    const result = await agent({ 
      sessionId,
      message: {
        sender: 'scammer',
        text: message,
        timestamp: new Date().toISOString()
      },
      conversationHistory,
      metadata: {
        channel: 'Chat',
        language: 'English',
        locale: 'IN'
      }
    });
    return {
      status: 'success',
      data: result,
      originalMessage: message,
    };
  } catch (error: any) {
    console.error(error);
    return {
      status: 'error',
      message: error.message || 'An unexpected error occurred while analyzing the message.',
    };
  }
}

export async function reportToGuvi(
  extractedData: UIAgentOutput,
  sessionId: string,
  prevState: ReportState, 
  formData: FormData
): Promise<ReportState> {
  const payload = {
    status: 'success',
    scamDetected: extractedData.scamDetected,
    engagementMetrics: extractedData.engagementMetrics,
    extractedIntelligence: extractedData.extractedIntelligence,
    agentNotes: extractedData.agentNotes,
    sessionId: sessionId,
  };

  try {
    const response = await fetch('https://hackathon.guvi.in/api/updateHoneyPotFinalResult', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Failed to report to GUVI:', response.status, errorBody);
        return { status: 'error', message: `Server responded with ${response.status}.` };
    }

    return { status: 'success', message: 'Intelligence successfully reported to platform.' };

  } catch (error) {
    console.error('Network error while reporting to GUVI:', error);
    return { status: 'error', message: 'A network error occurred while sending the report.' };
  }
}
