
import LoginForm from '@/components/LoginForm';
import Link from 'next/link';


export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Create an account</h2>
          <p className="text-slate-500 mt-2">Start splitting expenses today.</p>
        </div>
        
        {/* We drop our interactive Client Component island in here */}
        <LoginForm />

        <p className="text-center mt-8 text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
            Log in
          </Link>
        </p>
        
      </div>
    </div>
  );
}