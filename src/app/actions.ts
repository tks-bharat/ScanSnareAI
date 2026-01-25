
'use server';

import { detectScamIntentAndActivateAgent, type DetectScamIntentAndActivateAgentOutput } from '@/ai/flows/detect-scam-intent-and-activate-agent';
import { z } from 'zod';

const schema = z.object({
  message: z.string().min(10, { message: 'Message must be at least 10 characters long.' }),
});

export type AnalyzeState = {
  status: 'success';
  data: DetectScamIntentAndActivateAgentOutput;
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

export async function analyzeMessage(prevState: AnalyzeState, formData: FormData): Promise<AnalyzeState> {
  const validatedFields = schema.safeParse({
    message: formData.get('message'),
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

  try {
    const result = await detectScamIntentAndActivateAgent({ message: validatedFields.data.message });
    return {
      status: 'success',
      data: result,
    };
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: 'An unexpected error occurred while analyzing the message. Please try again.',
    };
  }
}


export type ReportState = {
  status: 'success',
  message: string,
} | {
  status: 'error',
  message: string,
} | {
  status: 'initial'
};

export async function reportToGuvi(
  extractedData: DetectScamIntentAndActivateAgentOutput,
  sessionId: string,
  prevState: ReportState, 
  formData: FormData
): Promise<ReportState> {
  const payload = {
    isScam: extractedData.isScam,
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
        return { status: 'error', message: `Server responded with ${response.status}. Check console for details.` };
    }

    return { status: 'success', message: 'Successfully reported intelligence data.' };

  } catch (error) {
    console.error('Network error while reporting to GUVI:', error);
    return { status: 'error', message: 'A network error occurred. Could not send report.' };
  }
}
