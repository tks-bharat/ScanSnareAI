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
import { Fingerprint } from 'lucide-react';

const initialState: AnalyzeState = {
  status: 'initial',
};

type Message = {
  sender: 'scammer' | 'user';
  text: string;
  timestamp: string;
};

export default function ScamAnalyzer({ initialSessionId }: { initialSessionId?: string }) {
  const [state, formAction] = useActionState(analyzeMessage, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [sessionId, setSessionId] = useState(initialSessionId || '');
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);

  useEffect(() => {
    if (!sessionId) {
      setSessionId(crypto.randomUUID());
    }
  }, [sessionId]);

  useEffect(() => {
    if (state.status === 'error' && state.message && !state.errors) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: state.message,
      });
    }
    if (state.status === 'success' && state.data) {
        // Prevent adding duplicates if the effect runs multiple times.
        if (conversationHistory.length > 0 && conversationHistory[conversationHistory.length - 1].text === state.data.agentResponse) {
            return;
        }

        setConversationHistory(prev => [
            ...prev,
            {
                sender: 'scammer',
                text: state.originalMessage,
                timestamp: new Date().toISOString(),
            },
            {
                sender: 'user',
                text: state.data.agentResponse,
                timestamp: new Date().toISOString(),
            }
        ]);
        formRef.current?.reset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, toast]);

  const messageError = state.status === 'error' && state.errors?.find((e) => e.path === 'message')?.message;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border/50">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Fingerprint className="h-4 w-4" />
          <span className="font-medium">Session ID:</span>
          <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{sessionId}</code>
        </div>
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
          Wisely Mode Active
        </Badge>
      </div>

      {conversationHistory.length > 0 && (
        <Card className="border-2 border-primary/10 shadow-lg">
            <CardContent className="pt-6 space-y-4 max-h-96 overflow-y-auto">
                {conversationHistory.map((msg, index) => (
                    <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-start' : 'items-end'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <Badge variant={msg.sender === 'user' ? 'default': 'secondary'} className='text-[10px] h-4 px-1'>
                            {msg.sender === 'user' ? 'Agent (You)' : 'Suspect'}
                          </Badge>
                        </div>
                        <div className={`rounded-2xl px-4 py-2.5 text-sm max-w-[85%] ${msg.sender === 'user' ? 'bg-primary text-primary-foreground rounded-tl-none shadow-sm' : 'bg-secondary text-secondary-foreground rounded-tr-none border shadow-sm'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
      )}

      <form ref={formRef} action={formAction} className="space-y-4">
        <input type="hidden" name="conversationHistory" value={JSON.stringify(conversationHistory)} />
        <input type="hidden" name="sessionId" value={sessionId} />
        <div className="grid w-full gap-2">
          <Label htmlFor="message" className="text-base font-semibold">Incoming Message Content</Label>
          <Textarea
            id="message"
            name="message"
            placeholder="Paste the suspicious message (SMS, WhatsApp, etc.) here for multi-dimensional analysis..."
            className="min-h-[140px] text-base bg-card border-2 focus-visible:ring-primary transition-all shadow-inner"
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
