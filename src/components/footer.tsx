
'use client';

import { useState, useEffect } from 'react';

export function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="mt-12 text-center text-sm text-muted-foreground">
      <p>&copy; {year ?? '...'} Scam Snare AI. All rights reserved.</p>
    </footer>
  );
}
