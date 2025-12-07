'use client';
import { useState } from 'react';
import api, { setAuthToken } from '../utils/api';

interface AuthModalProps {
  onLoginSuccess: () => void;
}

export default function AuthModal({ onLoginSuccess }: AuthModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Call Django Token Endpoint
      const response = await api.post('/token/', {
        username,
        password,
      });

      // 2. Save Token
      const { access } = response.data;
      setAuthToken(access);
      
      // 3. Close Modal & Notify Parent
      onLoginSuccess();
      
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Welcome Back 🌍</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input 
              type="text" 
              className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
            />
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <button 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-all"
          >
            {loading ? 'Logging in...' : 'Start Mapping'}
          </button>
        </form>
        
        <div className="mt-4 text-center text-xs text-gray-500">
          (Use your superuser: admin / admin123)
        </div>
      </div>
    </div>
  );
}