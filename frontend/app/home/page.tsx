'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      // Redirect directly to profile - no game selection needed
      router.push('/profile');
    }
  }, [status, router]);

  // Show loading while redirecting
  return <LoadingScreen />;
}
