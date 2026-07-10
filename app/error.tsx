'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('System Crash:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6 text-center">
      <div className="bg-gray-900 border border-red-500/20 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-red-500/10">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">System Malfunction</h2>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
          Our servers encountered an unexpected logic error. We've logged the issue.
        </p>
        
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => reset()}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-all"
          >
            Attempt Reboot
          </button>
          <Link
            href="/dashboard"
            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 px-4 rounded-lg transition-all"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
