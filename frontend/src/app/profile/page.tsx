'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function ProfilePage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [profile, setProfile] = useState({
    username: 'Traveler',
    email: 'traveler@mapped.com',
    storageUsed: 0,
    storageLimit: 200 * 1024 * 1024,
    isPremium: false,
    memberSince: 'December 2024'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setAuthorized(true);
      // TODO: Fetch actual user profile from API
    }
  }, [router]);

  if (!authorized) return null;

  const formatStorage = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1);
  };

  const storagePercentage = (profile.storageUsed / profile.storageLimit) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar 
        username={profile.username}
        storageUsed={profile.storageUsed}
        storageLimit={profile.storageLimit}
        isPremium={profile.isPremium}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{profile.username}</h1>
              <p className="text-gray-500">{profile.email}</p>
              <div className="flex gap-2 mt-3">
                {profile.isPremium ? (
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-bold px-3 py-1 rounded-full">
                    ⭐ Premium Member
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-sm font-semibold px-3 py-1 rounded-full">
                    🆓 Free Account
                  </span>
                )}
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-600 text-sm font-semibold px-3 py-1 rounded-full">
                  📅 Joined {profile.memberSince}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Storage Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>💾</span>
            <span>Storage & Usage</span>
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Photos Storage</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatStorage(profile.storageUsed)} / {formatStorage(profile.storageLimit)} MB
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    storagePercentage > 90 
                      ? 'bg-red-500' 
                      : storagePercentage > 70 
                      ? 'bg-yellow-500' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-500'
                  }`}
                  style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {profile.isPremium 
                  ? 'You have 5 GB of premium storage for photos' 
                  : 'Free tier includes 200 MB of photo storage'}
              </p>
            </div>

            {!profile.isPremium && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⭐</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">Upgrade to Premium</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Get 5 GB storage, unlimited locations, and premium features
                    </p>
                    <button 
                      onClick={() => alert('Premium upgrade coming soon!')}
                      className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-bold px-4 py-2 rounded-lg transition-all shadow-md"
                    >
                      Upgrade Now
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>⚙️</span>
            <span>Account Settings</span>
          </h2>

          <div className="space-y-4">
            <SettingItem 
              icon="👤"
              label="Username"
              value={profile.username}
              action="Change"
              onAction={() => alert('Username change coming soon!')}
            />
            <SettingItem 
              icon="📧"
              label="Email"
              value={profile.email}
              action="Change"
              onAction={() => alert('Email change coming soon!')}
            />
            <SettingItem 
              icon="🔒"
              label="Password"
              value="••••••••"
              action="Change"
              onAction={() => alert('Password change coming soon!')}
            />
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>🎨</span>
            <span>Preferences</span>
          </h2>

          <div className="space-y-4">
            <ToggleSetting 
              label="Email Notifications"
              description="Receive updates about your travel progress"
              enabled={false}
            />
            <ToggleSetting 
              label="Show Location Labels"
              description="Display names on map by default"
              enabled={true}
            />
            <ToggleSetting 
              label="Auto-save Progress"
              description="Automatically sync your map data"
              enabled={true}
            />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
            <span>⚠️</span>
            <span>Danger Zone</span>
          </h2>
          <p className="text-sm text-red-700 mb-4">
            These actions are permanent and cannot be undone
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => {
                if (confirm('Are you sure you want to clear all your map data? This cannot be undone!')) {
                  alert('Clear data feature coming soon!');
                }
              }}
              className="w-full md:w-auto bg-white hover:bg-red-50 text-red-600 font-semibold px-6 py-2 rounded-lg border-2 border-red-300 transition-colors"
            >
              Clear All Map Data
            </button>
            <button 
              onClick={() => {
                if (confirm('Are you sure you want to delete your account? All data will be lost forever!')) {
                  alert('Account deletion coming soon!');
                }
              }}
              className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors ml-0 md:ml-3"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingItem({ 
  icon, 
  label, 
  value, 
  action, 
  onAction 
}: { 
  icon: string; 
  label: string; 
  value: string; 
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-500">{value}</p>
        </div>
      </div>
      <button 
        onClick={onAction}
        className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
      >
        {action}
      </button>
    </div>
  );
}

function ToggleSetting({ 
  label, 
  description, 
  enabled 
}: { 
  label: string; 
  description: string; 
  enabled: boolean;
}) {
  const [isEnabled, setIsEnabled] = useState(enabled);

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={() => setIsEnabled(!isEnabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isEnabled ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isEnabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}