
import ScamAnalyzer from '@/components/scam-analyzer';
import { ShieldCheck } from 'lucide-react';
import { Footer } from '@/components/footer';

export default async function Home(props: { searchParams: Promise<{ sessionId?: string }> }) {
  const searchParams = await props.searchParams;
  const initialSessionId = searchParams.sessionId;

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-4xl">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Scam Snare AI
            </h1>
          </div>
          <p className="text-muted-foreground">
            Sophisticated AI-powered scam detection designed by Tan.
          </p>
        </header>

        <ScamAnalyzer initialSessionId={initialSessionId} />

        <Footer />
      </div>
    </main>
  );
}
