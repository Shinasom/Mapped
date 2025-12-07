'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

// Dynamic import for Map (No SSR)
const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center space-y-4">
        <div className="text-6xl animate-bounce">🗺️</div>
        <h2 className="text-2xl font-bold text-gray-800">Loading your world...</h2>
        <div className="flex gap-2 justify-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse delay-75"></div>
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  )
});

export default function MapPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [userProfile, setUserProfile] = useState({
    username: 'Traveler',
    storageUsed: 0,
    storageLimit: 200 * 1024 * 1024,
    isPremium: false
  });

  useEffect(() => {
    // Simple Client-side Protection
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setAuthorized(true);
      // TODO: Fetch actual user profile from API
      // For now using defaults
    }
  }, [router]);

  if (!authorized) return null;

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <Navbar 
        username={userProfile.username}
        storageUsed={userProfile.storageUsed}
        storageLimit={userProfile.storageLimit}
        isPremium={userProfile.isPremium}
      />
      
      {/* Map Container - Account for navbar height (64px) and mobile bottom nav (64px on mobile) */}
      <main className="relative flex-1 h-[calc(100vh-64px)] md:h-[calc(100vh-64px)]">
        <Map />
      </main>
    </div>
  );
}