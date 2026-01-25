'use client'

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { reportToGuvi } from '@/app/actions';
import type { UIAgentOutput } from '@/app/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useActionState } from 'react';
import type { ReportState } from '@/app/lib/definitions';

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

export function ReportButton({ extractedData, sessionId }: { extractedData: UIAgentOutput, sessionId: string }) {
  const { toast } = useToast();
  // Bind the extractedData and sessionId to the server action
  const reportWithData = reportToGuvi.bind(null, extractedData, sessionId);
  const [state, formAction] = useActionState(reportWithData, initialState);
  
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
