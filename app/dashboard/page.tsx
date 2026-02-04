// File: src/app/dashboard/page.tsx
// Ini halaman Dashboard yang tadinya ada di halaman depan
import { Navbar } from '@/components/common/navbar';
import { Dashboard } from '@/components/dashboard';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <Dashboard />
    </main>
  );
}