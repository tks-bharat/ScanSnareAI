import { NextResponse } from 'next/server';
import { agent } from '@/ai/flows/agent-flow';
import { AgentInputSchema, type APIResponse } from '@/app/lib/definitions';

/**
 * @fileOverview Public API endpoint for scam analysis and agent interaction.
 * Securely handles incoming messages and returns responses in the requested format.
 */

const API_KEY = process.env.SCAM_SNARE_API_KEY || 'AIzaSyBWqDsYFjj35CyfWf78_qz-bIqbHAMEeeg';

export async function POST(request: Request) {
  // 1. Authentication Check
  const apiKeyHeader = request.headers.get('x-api-key');
  if (apiKeyHeader !== API_KEY) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // 2. Validate Request Body
    const validatedFields = AgentInputSchema.safeParse(body);
    if (!validatedFields.success) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Invalid request format',
        errors: validatedFields.error.flatten() 
      }, { status: 400 });
    }

    // 3. Process with AI Agent
    const result = await agent(validatedFields.data);

    // 4. Return Specified Format
    const response: APIResponse = {
      status: 'success',
      reply: result.agentResponse,
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}
