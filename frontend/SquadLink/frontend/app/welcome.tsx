'use client';

import { Navigation } from '@/components/welcome/Navigation';
import { HeroSection } from '@/components/welcome/HeroSection';
import { AnimatedBackground } from '@/components/welcome/AnimatedBackground';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <AnimatedBackground />
      <Navigation />
      <HeroSection />
    </div>
  );
}
