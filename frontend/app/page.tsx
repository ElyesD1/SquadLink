'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Navigation } from '@/components/welcome/Navigation';
import { HeroSection } from '@/components/welcome/HeroSection';
import { AnimatedBackground } from '@/components/welcome/AnimatedBackground';
import { FeaturesSection } from '@/components/welcome/FeaturesSection';
import { Footer } from '@/components/welcome/Footer';
import { storage } from '@/lib/storage';

export default function WelcomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Check if user has remember me enabled and valid session
    if (status === 'loading') return; // Still loading
    
    const rememberMe = storage.getRememberMe();
    const autoLoginData = storage.getAutoLogin();
    
    if (rememberMe && session && autoLoginData) {
      // User is logged in and has remember me enabled, redirect to home
      router.push('/home');
    } else if (rememberMe && !session) {
      // Remember me is enabled but no session, clear auto login data
      storage.clearAutoLogin();
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <AnimatedBackground />
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
}
