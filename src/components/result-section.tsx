
import type { DetectScamIntentAndActivateAgentOutput } from '@/ai/flows/detect-scam-intent-and-activate-agent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ReportButton } from './report-button';
import {
  ShieldAlert,
  ShieldCheck,
  Bot,
  Landmark,
  Link as LinkIcon,
  Phone,
  Hash,
  BarChart,
  ClipboardPenLine,
  Wallet,
} from 'lucide-react';
import type { ReactNode } from 'react';

type ResultItemProps = {
  icon: ReactNode;
  label: string;
  value: string | string[] | number | undefined | null;
};

function ResultItem({ icon, label, value }: ResultItemProps) {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return null;
  }

  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 text-muted-foreground">{icon}</div>
      <div className="flex-1">
        <p className="font-medium text-foreground">{label}</p>
        {Array.isArray(value) ? (
          <div className="flex flex-wrap gap-2 mt-1">
            {value.map((item, index) => (
              <Badge key={index} variant="secondary" className="font-normal text-sm">{item}</Badge>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground break-words">{value}</p>
        )}
      </div>
    </div>
  );
}

export function ResultSection({ data }: { data: DetectScamIntentAndActivateAgentOutput }) {
  const { isScam, agentResponse, extractedIntelligence, engagementMetrics, agentNotes } = data;

  const intelligenceItems = [
    {
      icon: <Landmark className="h-5 w-5" />,
      label: 'Bank Account Details',
      value: extractedIntelligence.bankAccountDetails,
    },
    {
      icon: <Wallet className="h-5 w-5" />,
      label: 'UPI IDs',
      value: extractedIntelligence.upiIds,
    },
    {
      icon: <LinkIcon className="h-5 w-5" />,
      label: 'Phishing Links',
      value: extractedIntelligence.phishingLinks,
    },
    {
      icon: <Phone className="h-5 w-5" />,
      label: 'Phone Numbers',
      value: extractedIntelligence.phoneNumbers,
    },
    {
      icon: <Hash className="h-5 w-5" />,
      label: 'Suspicious Keywords',
      value: extractedIntelligence.suspiciousKeywords,
    },
  ];

  const hasIntelligence = intelligenceItems.some(item => item.value && (!Array.isArray(item.value) || item.value.length > 0));

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <Alert variant={isScam ? 'destructive' : 'default'} className="bg-card border-2">
        {isScam ? <ShieldAlert className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5 text-green-600" />}
        <AlertTitle className="text-lg font-semibold">
          {isScam ? 'Scam Intent Detected' : 'No Scam Intent Detected'}
        </AlertTitle>
        <AlertDescription>
          {isScam ? 'The message shows strong indicators of a potential scam.' : 'The message appears to be safe.'}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-primary" />
            <span>AI Agent Response</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-base italic">"{agentResponse}"</p>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className='flex flex-col'>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span>Extracted Intelligence</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 flex-1">
             {hasIntelligence ? (
               intelligenceItems.map((item, index) => <ResultItem key={index} {...item} />)
             ) : (
                <p className="text-muted-foreground text-sm h-full flex items-center justify-center">No specific intelligence data was extracted.</p>
             )}
          </CardContent>
        </Card>

        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                    <BarChart className="h-6 w-6 text-primary" />
                    <span>Engagement</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ResultItem icon={<ClipboardPenLine className="h-5 w-5" />} label="Conversation Turns" value={engagementMetrics.turns} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                    <ClipboardPenLine className="h-6 w-6 text-primary" />
                    <span>Agent Notes</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{agentNotes}</p>
                </CardContent>
            </Card>
        </div>
      </div>
      {isScam && (
        <div className="mt-8 text-center border-t pt-6">
            <p className="text-sm text-muted-foreground mb-4">Help improve scam detection by reporting this incident.</p>
            <ReportButton extractedData={data} />
        </div>
      )}
    </div>
  );
}
