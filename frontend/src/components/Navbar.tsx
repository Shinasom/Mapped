'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface NavbarProps {
  username?: string;
  storageUsed?: number;
  storageLimit?: number;
  isPremium?: boolean;
}

export default function Navbar({ 
  username = 'Traveler',
  storageUsed = 0,
  storageLimit = 200 * 1024 * 1024,
  isPremium = false 
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const formatStorage = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(1);
  };

  const storagePercentage = (storageUsed / storageLimit) * 100;

  const navLinks = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/map', label: 'Explorer' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-[1001] bg-stone-50 border-b-2 border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <span className="text-2xl font-serif font-bold text-olive-700 tracking-tight">
                Mapped
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-1.5 font-medium text-sm transition-colors ${
                    pathname === link.href
                      ? 'text-olive-800 bg-olive-100'
                      : 'text-stone-600 hover:text-olive-700'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {isPremium && (
                <div className="hidden md:flex items-center gap-1.5 bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold px-2.5 py-1 tracking-wide">
                  PREMIUM
                </div>
              )}

              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-stone-100 transition-colors"
                >
                  <div className="w-7 h-7 bg-olive-600 flex items-center justify-center text-white font-bold text-sm">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block font-medium text-stone-700 text-sm">{username}</span>
                  <svg 
                    className={`w-3 h-3 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border-2 border-stone-300 shadow-xl py-1">
                    
                    <div className="px-3 py-2 border-b-2 border-stone-200 bg-stone-50">
                      <p className="text-sm font-semibold text-stone-900">{username}</p>
                      <p className="text-xs text-stone-500">
                        {isPremium ? 'Premium Member' : 'Free Account'}
                      </p>
                    </div>

                    <div className="px-3 py-3 border-b-2 border-stone-200">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium text-stone-600">Storage</span>
                        <span className="text-xs font-bold text-stone-900">
                          {formatStorage(storageUsed)} / {formatStorage(storageLimit)} MB
                        </span>
                      </div>
                      <div className="w-full bg-stone-200 h-1.5">
                        <div 
                          className={`h-full ${
                            storagePercentage > 90 
                              ? 'bg-red-600' 
                              : storagePercentage > 70 
                              ? 'bg-amber-500' 
                              : 'bg-olive-600'
                          }`}
                          style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
                      >
                        <span>Settings</span>
                      </Link>
                      
                      {!isPremium && (
                        <button
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-700 hover:bg-amber-50"
                          onClick={() => alert('Premium upgrade coming soon!')}
                        >
                          <span className="font-semibold">Upgrade</span>
                        </button>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                      >
                        <span>Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-1.5 hover:bg-stone-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div 
            ref={menuRef}
            className="md:hidden border-t-2 border-stone-200 bg-stone-50"
          >
            <div className="px-4 py-2 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 font-medium text-sm ${
                    pathname === link.href
                      ? 'text-olive-800 bg-olive-100'
                      : 'text-stone-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[1001] bg-stone-50 border-t-2 border-stone-200">
        <div className="flex justify-around items-center h-14">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                pathname === link.href
                  ? 'text-olive-800 bg-olive-50'
                  : 'text-stone-500'
              }`}
            >
              <span className="text-xs font-semibold tracking-wide uppercase">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}