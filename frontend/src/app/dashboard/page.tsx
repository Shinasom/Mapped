'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/utils/api';

interface DashboardStats {
  countries: number;
  states: number;
  districts: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    countries: 0,
    states: 0,
    districts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('Traveler');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/locations/my-map/');
      setStats({
        countries: res.data.countries?.length || 0,
        states: res.data.states?.length || 0,
        districts: res.data.districts?.length || 0,
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalLocations = stats.countries + stats.states + stats.districts;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-center">
          <div className="text-5xl mb-3">🗺</div>
          <p className="text-stone-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100">
      
      <div className="bg-olive-700 text-stone-50 border-b-4 border-olive-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-3xl font-serif font-bold mb-2">
            Hello, {username}
          </h1>
          <p className="text-olive-200 text-lg">
            {totalLocations} {totalLocations === 1 ? 'location' : 'locations'} explored
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border-2 border-stone-300 p-5">
            <div className="text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">Countries</div>
            <div className="text-4xl font-bold text-olive-800">{stats.countries}</div>
          </div>
          <div className="bg-white border-2 border-stone-300 p-5">
            <div className="text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">States</div>
            <div className="text-4xl font-bold text-olive-800">{stats.states}</div>
          </div>
          <div className="bg-white border-2 border-stone-300 p-5">
            <div className="text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">Districts</div>
            <div className="text-4xl font-bold text-olive-800">{stats.districts}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-olive-800 border-2 border-olive-950 p-8 text-stone-50">
              <h2 className="text-2xl font-serif font-bold mb-3">Explore the map</h2>
              <p className="text-olive-200 mb-6 leading-relaxed">
                Mark locations you've visited. Your journey is uniquely yours.
              </p>
              <Link
                href="/map"
                className="inline-block bg-stone-50 text-olive-900 px-8 py-3 font-bold hover:bg-stone-100 transition-colors border-2 border-olive-950"
              >
                Open Map →
              </Link>
            </div>

            <div className="bg-white border-2 border-stone-300 p-6">
              <h3 className="text-lg font-bold text-stone-800 mb-4 border-b-2 border-stone-200 pb-2">Recent Activity</h3>
              
              <div className="text-center py-12">
                <div className="text-5xl mb-3 opacity-30">📍</div>
                <p className="text-stone-500 text-sm">Nothing yet</p>
                <Link
                  href="/map"
                  className="inline-block mt-3 text-olive-700 font-semibold text-sm hover:underline"
                >
                  Start marking locations
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            
            <div className="bg-white border-2 border-stone-300 p-5">
              <h3 className="text-sm font-bold text-stone-800 mb-3 uppercase tracking-wide">Storage</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-600">Photos</span>
                    <span className="font-mono text-stone-900">0 / 200 MB</span>
                  </div>
                  <div className="w-full bg-stone-200 h-2">
                    <div className="bg-olive-600 h-full" style={{ width: '0%' }}/>
                  </div>
                </div>
                <button
                  onClick={() => alert('Premium upgrade coming soon!')}
                  className="w-full bg-amber-100 border-2 border-amber-300 text-amber-900 text-xs font-bold py-2 hover:bg-amber-200 transition-colors"
                >
                  UPGRADE TO 5GB
                </button>
              </div>
            </div>

            <div className="bg-stone-200 border-2 border-stone-400 p-5">
              <div className="flex gap-3">
                <div className="text-2xl">💡</div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm mb-1">Tip</h4>
                  <p className="text-xs text-stone-700 leading-relaxed">
                    Mark a district and the state + country are automatically added. No manual work needed.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-stone-300 p-5">
              <h3 className="text-sm font-bold text-stone-800 mb-3 uppercase tracking-wide">Quick Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-600">Total</span>
                  <span className="font-mono font-bold text-stone-900">{totalLocations}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Coverage</span>
                  <span className="font-mono font-bold text-stone-900">0.1%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Since</span>
                  <span className="font-mono font-bold text-stone-900">Dec 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}