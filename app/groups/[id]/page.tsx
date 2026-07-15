import { verifySession } from '../../../lib/session';
import { redirect } from 'next/navigation';
import prisma from '../../../lib/prisma';
import Link from 'next/link';
import InviteMemberModal from '../../../components/InviteMemberModal';
import AddExpenseModal from '../../../components/AddExpenseModal';
import { calculateSettlements } from '../../../lib/settlement';
import DeleteExpenseButton from '../../../components/DeleteExpenseButton';

// Next.js 15+ requires params to be treated as a Promise
export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Authenticate at the Front Door
  const session = await verifySession();
  if (!session) {
    redirect('/login');
  }

  // 2. Resolve the URL parameter promise
  const resolvedParams = await params;
  const groupId = resolvedParams.id;

  // 3. The Secure Anti-IDOR Query
  const group = await prisma.group.findFirst({
    where: {
      id: groupId,
      members: {
        some: {
          id: session.userId, // MUST be a member to see this group
        },
      },
    },
    include: {
      members: true, // Fetch members to display avatars
      expenses: {
        include: {
          paidBy: true, // Fetch who paid for each expense
          shares: true, // IMPORTANT: Fetch the exact shares for the Greedy Algorithm
        },
        orderBy: {
          createdAt: 'desc', // Show newest expenses at the top
        },
      },
    },
  });

  // 4. Security Kick: If group is null (doesn't exist OR user not a member), boot them out
  if (!group) {
    redirect('/dashboard');
  }

  // Calculate total group spend
  const totalSpend = group.expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // 5. RUN THE GREEDY SETTLEMENT ALGORITHM
  // We feed our raw members and expenses (including the new shares!) into your JS Data Structures engine
  const settlements = calculateSettlements(group.members, group.expenses);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top Navigation / Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-white transition-colors flex items-center space-x-1 text-sm bg-gray-800/80 px-3 py-1.5 rounded-lg border border-gray-700"
            >
              <span>&larr;</span>
              <span>Dashboard</span>
            </Link>
            <div className="h-4 w-px bg-gray-800" />
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
              <span>{group.name}</span>
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full font-medium">
              {group.members.length} {group.members.length === 1 ? 'Member' : 'Members'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            {/* Spend Summary */}
            <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div>
                <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Group Spend</h2>
                <p className="text-3xl font-extrabold text-white mt-1">${totalSpend.toFixed(2)}</p>
              </div>
              <AddExpenseModal groupId={group.id} members={group.members} />
            </div>

            {/* Ledger History */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
                <h3 className="font-semibold text-white">Ledger History</h3>
                <span className="text-xs text-gray-500">{group.expenses.length} records</span>
              </div>

              {group.expenses.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-400 text-sm">No expenses recorded yet.</p>
                  <p className="text-gray-600 text-xs mt-1">Click "+ Add Expense" to put the first receipt on the table.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800/60">
                  {group.expenses.map((expense) => (
                    <div key={expense.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-gray-800/30 transition-colors">
                      
                      {/* Left Side: Avatar and Details */}
                      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
                          {expense.paidBy.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate">{expense.description}</p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            Paid by <span className="text-blue-400 font-medium">{expense.paidBy.name}</span> &bull; {new Date(expense.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {/* Right Side: Amount and Delete Button */}
                      <div className="flex items-center justify-end space-x-4 shrink-0">
                        <span className="text-lg font-bold text-white text-right w-24 tabular-nums">
                          ${expense.amount.toFixed(2)}
                        </span>
                        
                        <div className="w-8 flex justify-end shrink-0">
                          {expense.paidById === session.userId ? (
                            <DeleteExpenseButton expenseId={expense.id} groupId={group.id} />
                          ) : (
                            <div className="w-8 h-8"></div>
                          )}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Group Members Sidebar */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Group Members</h3>
                <InviteMemberModal groupId={group.id} />
              </div>
              <div className="space-y-3">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-800/40 border border-gray-800/80">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-xs font-bold text-white">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white leading-none">{member.name}</p>
                        <p className="text-[11px] text-gray-500 mt-1">{member.email}</p>
                      </div>
                    </div>
                    {member.id === session.userId && <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded font-medium">You</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Settlement Engine Widget */}
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-6 shadow-xl shadow-blue-950/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white flex items-center space-x-2 text-sm tracking-wide">
                  <span>⚡ SETTLEMENT ENGINE</span>
                </h3>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-mono">Greedy Algo</span>
              </div>
              <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                Calculated in real-time. Follow these exact transactions to settle all group debts.
              </p>
              {settlements.length === 0 ? (
                <div className="p-4 bg-gray-900/60 border border-gray-800/80 rounded-lg text-center">
                  <p className="text-xs font-medium text-emerald-400 flex items-center justify-center space-x-1.5"><span>✓</span><span>All balances are settled!</span></p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {settlements.map((tx, index) => (
                    <div key={index} className="p-3 bg-gray-900/80 border border-blue-500/20 rounded-lg flex items-center justify-between text-xs shadow-inner">
                      <div className="flex items-center space-x-2 overflow-hidden">
                        <span className="font-bold text-red-400 truncate max-w-[80px]">{tx.from}</span>
                        <span className="text-gray-500 text-[10px]">&rarr;</span>
                        <span className="font-bold text-emerald-400 truncate max-w-[80px]">{tx.to}</span>
                      </div>
                      <span className="font-mono font-bold text-white bg-blue-600/20 border border-blue-500/30 px-2 py-1 rounded">
                        ${tx.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
