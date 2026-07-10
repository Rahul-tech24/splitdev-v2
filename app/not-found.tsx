

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-9xl font-extrabold text-gray-800 tracking-tighter">404</h1>
      <h2 className="text-2xl font-bold text-white mt-4 mb-2">Ledger Not Found</h2>
      <p className="text-gray-400 mb-8 max-w-md">
        The ledger or endpoint you are looking for has been erased or never existed in our database.
      </p>
      <Link
        href="/dashboard"
        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg shadow-blue-500/20"
      >
        Back to Safety
      </Link>
    </div>
  );
}
