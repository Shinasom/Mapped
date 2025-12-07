'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/utils/api';

const TRAVEL_STORIES = [
  {
    url: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200&q=80',
    tagline: 'Photos belong on maps, not in folders',
  },
  {
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80',
    tagline: 'Your camera roll, organized by geography',
  },
  {
    url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80',
    tagline: 'Track where youve been, store what you saw',
  },
  {
    url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=1200&q=80',
    tagline: 'Every country, state, city. One map.',
  },
  {
    url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80',
    tagline: 'Pin memories where they happened',
  }
];

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % TRAVEL_STORIES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!formData.phone.match(/^[+]?[0-9]{10,15}$/)) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/signup/', {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirm_password: formData.confirmPassword
      });

      // Success - redirect to login
      router.push('/login?signup=success');
    } catch (err) {
      console.error(err);
      
      // Handle specific errors from backend
      if (err.response?.data?.error === 'email') {
        setError(err.response.data.message);
      } else if (err.response?.data?.error === 'username') {
        setError(err.response.data.message);
      } else if (err.response?.data?.error === 'phone') {
        setError(err.response.data.message);
      } else if (err.response?.data?.error === 'password') {
        setError(err.response.data.message);
      } else {
        setError('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen flex bg-stone-100 overflow-hidden">
      
      {/* Left Side - Carousel (Same as login) */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-stone-900">
        {TRAVEL_STORIES.map((story, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img 
              src={story.url} 
              alt="Travel destination"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
            
            <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
              <h2 className="text-5xl font-serif font-bold mb-8 leading-tight max-w-xl">
                {story.tagline}
              </h2>
              
              <div className="flex gap-3">
                {TRAVEL_STORIES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className={`h-1 transition-all ${
                      idx === currentSlide 
                        ? 'w-12 bg-white' 
                        : 'w-8 bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          
          <div>
            <h1 className="text-4xl font-serif font-bold text-olive-800 mb-2">
              Create Account
            </h1>
            <p className="text-base text-stone-700">
              Start mapping your travels today
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Username
              </label>
              <input 
                type="text" 
                name="username"
                required
                className="w-full px-4 py-3 bg-white border-2 border-stone-300 focus:border-olive-600 outline-none transition-colors"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Email
              </label>
              <input 
                type="email" 
                name="email"
                required
                className="w-full px-4 py-3 bg-white border-2 border-stone-300 focus:border-olive-600 outline-none transition-colors"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input 
                type="tel" 
                name="phone"
                required
                className="w-full px-4 py-3 bg-white border-2 border-stone-300 focus:border-olive-600 outline-none transition-colors"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
              <p className="text-xs text-stone-500 mt-1">One account per phone number</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <input 
                type="password" 
                name="password"
                required
                className="w-full px-4 py-3 bg-white border-2 border-stone-300 focus:border-olive-600 outline-none transition-colors"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <input 
                type="password" 
                name="confirmPassword"
                required
                className="w-full px-4 py-3 bg-white border-2 border-stone-300 focus:border-olive-600 outline-none transition-colors"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border-2 border-red-300 text-red-800 text-sm">
                {error}
              </div>
            )}

            <button 
              onClick={handleSignup}
              disabled={loading}
              className="w-full bg-olive-700 hover:bg-olive-800 text-stone-50 font-bold py-3 transition-colors disabled:opacity-50 border-2 border-olive-900 uppercase tracking-wide"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <div className="space-y-3">
            <div className="text-center text-sm text-stone-600">
              Already have an account?{' '}
              <Link href="/login" className="text-olive-700 font-bold hover:underline">
                Log in
              </Link>
            </div>
            
            <p className="text-xs text-stone-500 text-center leading-relaxed">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}