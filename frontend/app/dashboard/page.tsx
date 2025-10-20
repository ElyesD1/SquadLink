'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { useEffect } from 'react';
import Image from 'next/image';
import { FiLogOut } from 'react-icons/fi';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const handleLogout = () => {
    storage.clearAutoLogin();
    signOut({ callbackUrl: '/' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0118] via-[#1A0B2E] to-[#0A0118] flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0A0118] via-[#1A0B2E] to-[#0A0118]">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[100px] -top-48 -left-48 animate-pulse" />
        <div className="absolute w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[100px] -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen p-6">
        {/* Header */}
        <header className="max-w-7xl mx-auto flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="relative bg-gradient-to-br from-purple-600/20 to-indigo-600/20 backdrop-blur-xl border border-white/20 rounded-xl p-3">
              <Image
                src="/logo.png"
                alt="SquadLink"
                width={32}
                height={32}
                className="w-8 h-8"
              />
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">SquadLink</h1>
              <p className="text-white/60 text-sm">Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-white/80 text-sm">
              Welcome, {session?.user?.name || session?.user?.email}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Welcome to SquadLink!
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-8">
            Your game preferences have been saved. The main dashboard features are coming soon!
          </p>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">🚧 Under Development</h3>
            <p className="text-white/80">
              We're working hard to bring you the best gaming community experience. 
              Features like squad formation, player matching, and communication tools are coming soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}