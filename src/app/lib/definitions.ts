import type { UIAgentOutput } from '@/ai/flows/agent-flow';

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
