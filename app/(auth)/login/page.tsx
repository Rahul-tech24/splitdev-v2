import { verifySession } from '../../../lib/session';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import Link from 'next/link';

export default async function LoginPage() {
  // 1. AUTH GUARD: If they are already signed in, teleport them to the arena!
  const session = await verifySession();
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-blue-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-white hover:text-gray-300 transition-colors">
            Split<span className="text-blue-500">Dev</span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Sign in to access your ledgers and settlement engines.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-900 py-8 px-6 shadow-2xl sm:rounded-xl sm:px-10 border border-gray-800">
          
          {/* Interactive Client Island */}
          <LoginForm />

          <div className="mt-6 pt-6 border-t border-gray-800/80 text-center">
            <p className="text-xs text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                Create Account
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}