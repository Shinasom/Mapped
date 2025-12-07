'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Dynamic import for Map (No SSR)
const Map = dynamic(() => import('../../components/Map'), { 
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-blue-50 text-blue-600 animate-pulse">
      Loading your world...
    </div>
  )
});

export default function MapPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Simple Client-side Protection
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) return null; // Or a loading spinner

  return (
    <main className="relative min-h-screen">
      <Map />
    </main>
  );
}