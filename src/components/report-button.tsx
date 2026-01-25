
'use client'

import { useFormStatus, useFormState } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { reportToGuvi, type ReportState } from '@/app/actions';
import type { DetectScamIntentAndActivateAgentOutput } from '@/ai/flows/detect-scam-intent-and-activate-agent';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

function ReportSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant="outline">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Reporting...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          Report to GUVI
        </>
      )}
    </Button>
  );
}

const initialState: ReportState = {
    status: 'initial'
};

export function ReportButton({ extractedData }: { extractedData: DetectScamIntentAndActivateAgentOutput }) {
  const { toast } = useToast();
  // Bind the extractedData to the server action
  const reportWithData = reportToGuvi.bind(null, extractedData);
  const [state, formAction] = useFormState(reportWithData, initialState);
  
  useEffect(() => {
    if (state.status === 'success') {
      toast({ title: 'Report Sent', description: state.message });
    } else if (state.status === 'error') {
      toast({ variant: 'destructive', title: 'Reporting Failed', description: state.message });
    }
  }, [state, toast]);

  return (
    <form action={formAction}>
      <ReportSubmitButton />
    </form>
  )
}
