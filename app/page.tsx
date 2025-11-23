// File: src/app/page.tsx (Server Component - with Client sections)

import { Navbar } from '@/components/common/navbar';
import { Dashboard } from '@/components/dashboard';

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <Dashboard />
    </main>
  );
}