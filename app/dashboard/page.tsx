import { verifySession } from '../../lib/session';
import { redirect } from 'next/navigation';
import prisma from '../../lib/prisma';
import Link from 'next/link';
import { Wallet } from 'lucide-react';
import UserAvatarMenu from '../../components/UserAvatarMenu';


export default async function DashboardPage() {
  // 1. Verify Authentication
  const session = await verifySession();
  if (!session) {
    redirect('/login');
  }

  // 2. Query PostgreSQL directly for this user's groups
  const groups = await prisma.group.findMany({
    where: {
      members: {
        some: {
          id: session.userId,
        },
      },
    },
    include: {
      members: true, // Fetch members so we can display the member count
    },
  });
  console.log('Fetched Groups:', groups);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">

           <nav className="bg-gray-900/50 border-b border-gray-800 px-6 py-4 flex justify-between items-center backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2 text-blue-500 font-bold text-xl tracking-tight">
          <Wallet size={24} /> <span className="text-white">Split<span className="text-blue-500">Dev</span></span>
        </div>
        
       
      </nav>

          <div className="flex items-center space-x-4">
            
            <Link
              href="/create-group"
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20 flex items-center space-x-1"
            >
              <span>+ Create Group</span>
            </Link>
             <UserAvatarMenu userName={session.name} />
          </div>
        </div>
      </header>

      {/* Main Content Arena */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Your Groups</h1>
            <p className="text-sm text-gray-400 mt-1">
              Select a group to manage expenses or settle debts.
            </p>
          </div>
        </div>

        {/* Dynamic Group Grid */}
        {groups.length === 0 ? (
          /* Empty State */
          <div className="bg-gray-900/40 border border-dashed border-gray-800 rounded-xl p-12 text-center max-w-xl mx-auto mt-12">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20 text-xl font-bold">
              group
            </div>
            <h3 className="text-lg font-medium text-white">No groups created yet</h3>
            <p className="text-gray-400 text-sm mt-1 mb-6">
              You haven't joined or created any expense groups. Get started by creating your first ledger.
            </p>
            <Link
              href="/create-group"
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm transition-all shadow-lg shadow-blue-500/20"
            >
              + Create Your First Group
            </Link>
          </div>
        ) : (
          /* Group Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="block bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 hover:bg-gray-800/50 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg group-hover:scale-105 transition-transform">
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs bg-gray-800 text-gray-300 px-2.5 py-1 rounded-full border border-gray-700 font-medium">
                    {group.members.length} {group.members.length === 1 ? 'Member' : 'Members'}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {group.name}
                </h3>

                <div className="mt-6 pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-500">
                  <span>Click to open ledger</span>
                  <span className="text-blue-400 font-medium group-hover:translate-x-1 transition-transform inline-block">
                    View Arena &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}