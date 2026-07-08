import { verifySession } from '../../lib/session';
import { redirect } from 'next/navigation';
import CreateGroupForm from '../../components/CreateGroupForm';
import Link from 'next/link';

export default async function CreateGroupPage() {
  // 1. Enforce Server-Side Authentication at the Front Door
  const session = await verifySession();
  if (!session) {
    redirect('/login');
  }

  // 2. Render the UI Shell and embed the Interactive Form Island
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/dashboard" className="text-2xl font-bold tracking-tight text-white hover:text-gray-300 transition-colors">
            Split<span className="text-blue-500">Dev</span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Create a New Group
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Set up a shared ledger for trips, rent, or dining out.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-900 py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-800">
          <CreateGroupForm />
        </div>
      </div>
    </div>
  );
}