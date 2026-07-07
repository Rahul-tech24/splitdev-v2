import { verifySession } from '@/lib/session';
import { redirect } from 'next/navigation';

 import Link from 'next/link';

import { Wallet, LogOut, Plus, Users } from 'lucide-react';


export default async function DashboardPage() {
    const session = await verifySession();

    if (!session) {
        redirect('/login');
    }

  // Mock data for tonight. Tomorrow this will be: 
  // const groups = await prisma.group.findMany({ where: { members: { some: { id: userId } } } })
  const mockGroups = [
    { id: '1', name: 'Goa Trip 2026', memberCount: 4 },
    { id: '2', name: 'Apartment 4B', memberCount: 2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
          <Wallet size={24} /> <span>SplitDev</span>
          <h1>Welcome back, {session.name}</h1>
        </div>
        {/* We will wire up the real logout action tomorrow */}
        <Link href="/login" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition">
          <LogOut size={18} /> <span className="text-sm font-medium">Log Out</span>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, {session.name}</h1>
            <p className="text-slate-500 mt-1">Manage your shared expenses and settlements.</p>
          </div>
          <button className="hidden sm:flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm">
            <Plus size={18} /> Create Group
          </button>
        </div>

        {/* Group Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockGroups.map((group) => (
            <Link key={group.id} href={`/groups/${group.id}`} className="group block bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                  <Users size={24} />
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">{group.name}</h2>
              <div className="flex items-center text-sm text-slate-500 gap-4 mt-4">
                <span className="flex items-center gap-1"><Users size={14}/> {group.memberCount} Members</span>
              </div>
            </Link>
          ))}
          
          <button className="flex flex-col items-center justify-center bg-slate-100/50 border-2 border-dashed border-slate-300 rounded-2xl p-6 hover:bg-slate-100 hover:border-indigo-400 transition min-h-[200px]">
            <div className="p-3 bg-white shadow-sm rounded-full text-slate-400 mb-3">
              <Plus size={24} />
            </div>
            <span className="font-semibold text-slate-600">Create New Group</span>
          </button>
        </div>
      </main>
    </div>
  );
}
