'use client';

import { useEffect, useRef, useActionState, useState } from 'react';
import { analyzeMessage, type AnalyzeState } from '@/app/actions';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/submit-button';
import { useToast } from '@/hooks/use-toast';
import { ResultSection } from './result-section';

const initialState: AnalyzeState = {
  status: 'initial',
};

export default function ScamAnalyzer() {
  const [state, formAction] = useActionState(analyzeMessage, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    // Generate a unique session ID when the component mounts
    setSessionId(crypto.randomUUID());
  }, []);

  useEffect(() => {
    if (state.status === 'error' && state.message && !state.errors) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: state.message,
      });
    }
    if (state.status === 'success') {
      // Do not reset the form to allow user to see their input
    }
  }, [state, toast]);

  const messageError = state.status === 'error' && state.errors?.find((e) => e.path === 'message')?.message;

  return (
    <div className="space-y-8">
      <form ref={formRef} action={formAction} className="space-y-4">
        <div className="grid w-full gap-2">
          <Label htmlFor="message">Enter message to analyze</Label>
          <Textarea
            id="message"
            name="message"
            placeholder="Paste the suspicious message here..."
            className="min-h-[120px] text-base bg-card"
            aria-describedby="message-error"
            aria-invalid={!!messageError}
            key={state.status === 'success' ? Date.now() : 'static-key'} // Not resetting, but can be used to force re-render if needed
          />
          {messageError && (
            <p id="message-error" className="text-sm font-medium text-destructive">
              {messageError}
            </p>
          )}
        </div>
        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>

      {state.status === 'success' && state.data && (
        <ResultSection data={state.data} sessionId={sessionId} />
      )}
    </div>
  );
}
