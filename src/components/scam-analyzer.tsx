'use client';

import { useEffect, useRef, useActionState, useState } from 'react';
import { analyzeMessage } from '@/app/actions';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/submit-button';
import { useToast } from '@/hooks/use-toast';
import { ResultSection } from './result-section';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import type { AnalyzeState } from '@/app/lib/definitions';

const initialState: AnalyzeState = {
  status: 'initial',
};

type Message = {
  sender: 'scammer' | 'user';
  text: string;
  timestamp: string;
};

export default function ScamAnalyzer() {
  const [state, formAction] = useActionState(analyzeMessage, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [sessionId, setSessionId] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');

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
    if (state.status === 'success' && state.data) {
        setConversationHistory(prev => [
            ...prev,
            {
                sender: 'scammer', // The message from the input is from the 'scammer'
                text: currentMessage,
                timestamp: new Date().toISOString(),
            },
            {
                sender: 'user', // The agent's response is from the 'user' (our side)
                text: state.data.agentResponse,
                timestamp: new Date().toISOString(),
            }
        ]);
        setCurrentMessage('');
        formRef.current?.reset();
    }
  }, [state, toast, currentMessage]);

  const messageError = state.status === 'error' && state.errors?.find((e) => e.path === 'message')?.message;

  return (
    <div className="space-y-8">
      {conversationHistory.length > 0 && (
        <Card>
            <CardContent className="pt-6 space-y-4 max-h-96 overflow-y-auto">
                {conversationHistory.map((msg, index) => (
                    <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-start' : 'items-end'}`}>
                        <Badge variant={msg.sender === 'user' ? 'default': 'secondary'} className='mb-1'>{msg.sender}</Badge>
                        <div className={`rounded-lg p-3 text-base ${msg.sender === 'user' ? 'bg-primary/10' : 'bg-secondary'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
      )}

      <form ref={formRef} action={formAction} className="space-y-4" onSubmit={() => setCurrentMessage(formRef.current?.message.value)}>
        <input type="hidden" name="conversationHistory" value={JSON.stringify(conversationHistory)} />
        <input type="hidden" name="sessionId" value={sessionId} />
        <div className="grid w-full gap-2">
          <Label htmlFor="message">Enter message to analyze</Label>
          <Textarea
            id="message"
            name="message"
            placeholder="Paste the suspicious message here..."
            className="min-h-[120px] text-base bg-card"
            aria-describedby="message-error"
            aria-invalid={!!messageError}
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
