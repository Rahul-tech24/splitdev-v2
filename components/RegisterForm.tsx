'use client'; // The Network Boundary! This tells Next.js to ship this JS to the browser.

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation, NOT next/router
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
      // Calling the backend directly from the frontend
      const result = await registerUser(name, email, password);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        // Successfully inserted into PostgreSQL. Send them to login.
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
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required 
          className="w-full border border-slate-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
          placeholder="David Goggins" 
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
          className="w-full border border-slate-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
          placeholder="stayhard@example.com" 
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
          className="w-full border border-slate-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
          placeholder="••••••••" 
        />
      </div>
      
      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3.5 px-4 rounded-lg transition"
      >
        {isLoading ? 'Forging Account...' : 'Create Account'}
      </button>
    </form>
  );
}