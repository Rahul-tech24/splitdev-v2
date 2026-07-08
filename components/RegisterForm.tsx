'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '../actions/auth.actions';

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await registerUser(name, email, password);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        router.push('/login'); 
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-medium">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">Full Name</label>
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required 
          className="w-full px-3.5 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white text-sm placeholder-gray-500 transition-all" 
          placeholder="David Goggins" 
        />
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">Email Address</label>
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
          className="w-full px-3.5 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white text-sm placeholder-gray-500 transition-all" 
          placeholder="stayhard@example.com" 
        />
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">Password</label>
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
          className="w-full px-3.5 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white text-sm placeholder-gray-500 transition-all" 
          placeholder="••••••••" 
        />
      </div>
      
      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg shadow-blue-500/20 text-sm disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Forging Account...</span>
          </>
        ) : (
          <span>Create Account</span>
        )}
      </button>
    </form>
  );
}