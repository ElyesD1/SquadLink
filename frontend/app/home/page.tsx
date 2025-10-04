'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { useEffect } from 'react';
import Image from 'next/image';
import { FiLogOut, FiUsers, FiZap } from 'react-icons/fi';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const handleLogout = () => {
    // Clear remember me data when user manually logs out
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
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              SquadLink
            </h1>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 hover:border-red-500/50 text-white px-6 py-3 rounded-xl transition-all hover:bg-white/10"
          >
            <FiLogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Welcome to Your Squad, <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                {session?.user?.name || 'Gamer'}
              </span>!
            </h2>
            <p className="text-gray-400 text-lg">
              Your dashboard is under construction. Stay tuned for epic features! 🎮
            </p>
          </div>

          {/* Coming Soon Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-purple-500/50">
                <FiUsers className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Find Squads</h3>
              <p className="text-gray-400">Coming Soon</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-indigo-500/50">
                <FiZap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI Matchmaking</h3>
              <p className="text-gray-400">Coming Soon</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-pink-800 rounded-xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-pink-500/50">
                <FiUsers className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Your Profile</h3>
              <p className="text-gray-400">Coming Soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
