import { verifySession } from '../lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function HomePage() {
  // 1. SMART ROUTING: If they are already logged in, teleport them straight to the Dashboard!
  const session = await verifySession();
  if (session) {
    redirect('/dashboard');
  }

  // 2. Otherwise, render the public landing page for new users
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      
      {/* Top Navigation */}
      <header className="border-b border-gray-800/80 bg-gray-900/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-extrabold tracking-tight text-white">
              Split<span className="text-blue-500">Dev</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-mono">
              v1.0
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
            >
              Get Started &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-20 text-center max-w-5xl mx-auto">
        
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 bg-gray-900 border border-gray-800 px-3 py-1 rounded-full text-xs text-gray-300 mb-8 animate-in fade-in duration-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Powered by a Greedy Debt Simplification Algorithm</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
          Split expenses with <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
            mathematical precision.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl leading-relaxed">
          No more cluttered spreadsheets or endless back-and-forth bank transfers. 
          SplitDev tracks shared ledgers and calculates the exact minimum transactions required to settle all debts.
        </p>

        {/* Call to Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-xl shadow-blue-500/20 text-center text-base"
          >
            Create Your First Ledger
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white font-semibold rounded-xl border border-gray-800 transition-all text-center text-base"
          >
            Access Existing Account
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 text-left w-full">
          
          <div className="p-6 bg-gray-900/50 border border-gray-800/80 rounded-xl hover:border-gray-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold mb-4">
              ⚡
            </div>
            <h3 className="text-lg font-semibold text-white">Greedy Settlement Engine</h3>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              Our two-pointer algorithm actively cancels out mutual debts, reducing 20+ group transfers down to 2 or 3 clean payments.
            </p>
          </div>

          <div className="p-6 bg-gray-900/50 border border-gray-800/80 rounded-xl hover:border-gray-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold mb-4">
              🔒
            </div>
            <h3 className="text-lg font-semibold text-white">IDOR-Protected Ledgers</h3>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              Every route and database query is heavily safeguarded. Nobody touches a financial ledger unless their user ID is wired to the group.
            </p>
          </div>

          <div className="p-6 bg-gray-900/50 border border-gray-800/80 rounded-xl hover:border-gray-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold mb-4">
              🚀
            </div>
            <h3 className="text-lg font-semibold text-white">Real-Time Server Actions</h3>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              Built on Next.js App Router and PostgreSQL. Add receipts and invite members instantly with zero API boilerplate or loading lag.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-gray-950 py-8 text-center text-xs text-gray-600">
        <p>Built with relentless discipline &bull; Next.js App Router &bull; TypeScript &bull; PostgreSQL &bull; Prisma</p>
      </footer>

    </div>
  );
}