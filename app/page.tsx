// File: src/app/page.tsx
'use client';

import React, { useState } from 'react';
import { User, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

// PENTING: Kalau kamu belum punya komponen Alert, hapus import ini
// import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');
    // Hardcoded credentials sederhana
    if (username === 'admin' && password === '1234') {
      router.push('/dashboard'); // Arahkan ke folder dashboard yang baru kita buat
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-slate-950">
      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-lg shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Login</h1>
          <p className="text-gray-500 mt-2 text-sm">Conveyor Digital Twin v1.0</p>
        </div>

        {/* Error Message Manual (Tanpa perlu komponen Alert biar ga error) */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-transparent border-b border-gray-300 py-2 pr-10 focus:outline-none focus:border-purple-600 text-gray-900" 
            />
            <User className="absolute right-0 top-2 text-gray-400 w-5 h-5" />
          </div>
          <div className="relative group">
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-gray-300 py-2 pr-10 focus:outline-none focus:border-purple-600 text-gray-900" 
            />
            <Lock className="absolute right-0 top-2 text-gray-400 w-5 h-5" />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white font-bold py-3 rounded-full hover:bg-purple-700 shadow-md transition-all"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}