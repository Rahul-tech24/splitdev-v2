'use client';

import { useState } from 'react';
import { createExpense } from '../actions/group.actions';
import toast from 'react-hot-toast';
import { CheckSquare, DollarSign, Calculator } from 'lucide-react';

export default function AddExpenseModal({
  groupId,
  members
}: {
  groupId: string;
  members: { id: string; name: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Split State
  const [splitType, setSplitType] = useState<'equal' | 'exact'>('equal');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(members.map(m => m.id));
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});

  const parsedAmount = parseFloat(amount) || 0;

  function handleCheckboxChange(memberId: string) {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  }

  function handleExactAmountChange(memberId: string, val: string) {
    setExactAmounts(prev => ({ ...prev, [memberId]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || parsedAmount <= 0) return;
    
    if (selectedMembers.length === 0) {
      toast.error("You must select at least one person!");
      return;
    }

    let finalShares: { userId: string, amountOwed: number }[] = [];

    if (splitType === 'equal') {
      // Penny-perfect rounding logic to prevent 33.33 + 33.33 + 33.33 = 99.99
      let totalAssigned = 0;
      finalShares = selectedMembers.map((id, index) => {
        let share = Math.round((parsedAmount / selectedMembers.length) * 100) / 100;
        if (index === selectedMembers.length - 1) {
          share = Math.round((parsedAmount - totalAssigned) * 100) / 100; // Last person takes the penny difference
        } else {
          totalAssigned += share;
        }
        return { userId: id, amountOwed: share };
      });
    } else {
      // Exact split logic
      finalShares = selectedMembers.map(id => ({
        userId: id,
        amountOwed: parseFloat(exactAmounts[id] || '0')
      }));
      
      const sum = finalShares.reduce((acc, curr) => acc + curr.amountOwed, 0);
      if (Math.abs(sum - parsedAmount) > 0.01) {
        toast.error(`Exact shares must perfectly add up to $${parsedAmount.toFixed(2)}`);
        return;
      }
    }

    setIsLoading(true);

    try {
      const result = await createExpense(groupId, description, parsedAmount, finalShares);

      if (!result.success) {
        toast.error(result.error || 'Failed to add expense.');
      } else {
        toast.success('Expense added to ledger!');
        setDescription('');
        setAmount('');
        setExactAmounts({});
        setSelectedMembers(members.map(m => m.id));
        setIsOpen(false);
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const currentExactSum = selectedMembers.reduce((acc, id) => acc + (parseFloat(exactAmounts[id] || '0')), 0);
  const exactDifference = parsedAmount - currentExactSum;
  const equalShareDisplay = selectedMembers.length > 0 ? (parsedAmount / selectedMembers.length).toFixed(2) : '0.00';

  return (
    <>
      {}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20 flex items-center space-x-2"
      >
        <span>+ Add Expense</span>
      </button>

      {}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Add New Expense</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white text-sm font-medium"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Description</label>
                <input
                  type="text" 
                  required 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Dinner at Tito's"
                  className="w-full px-3.5 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white text-sm placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Total Amount ($)</label>
                <input
                  type="number" 
                  step="0.01" 
                  required 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white text-sm placeholder-gray-500 font-mono"
                />
              </div>

              {}
              <div className="pt-2">
                <div className="flex p-1 bg-gray-800 rounded-lg mb-4">
                  <button
                    type="button"
                    onClick={() => setSplitType('equal')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-1.5 text-xs font-medium rounded-md transition-colors ${splitType === 'equal' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
                  >
                    <Calculator size={14} /> <span>Split Equally</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitType('exact')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-1.5 text-xs font-medium rounded-md transition-colors ${splitType === 'exact' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
                  >
                    <DollarSign size={14} /> <span>Exact Amounts</span>
                  </button>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-gray-300 mb-3">
                  <CheckSquare size={14} className="text-blue-400"/> Select Members to Split:
                </label>

                {}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {members.map((member) => (
                    <div key={member.id} className={`flex items-center justify-between p-2.5 rounded-lg transition-colors border ${selectedMembers.includes(member.id) ? 'bg-gray-800/80 border-gray-700' : 'bg-transparent border-transparent hover:bg-gray-800/40'}`}>
                      
                      <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <input 
                          type="checkbox"
                          checked={selectedMembers.includes(member.id)}
                          onChange={() => handleCheckboxChange(member.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-gray-900"
                        />
                        <span className={`text-sm font-medium ${selectedMembers.includes(member.id) ? 'text-white' : 'text-gray-500'}`}>
                          {member.name}
                        </span>
                      </label>

                      {selectedMembers.includes(member.id) && (
                        <div className="shrink-0 w-24">
                          {splitType === 'equal' ? (
                            <span className="block text-right text-sm font-mono text-gray-400">
                              ${equalShareDisplay}
                            </span>
                          ) : (
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={exactAmounts[member.id] || ''}
                                onChange={(e) => handleExactAmountChange(member.id, e.target.value)}
                                className="w-full pl-6 pr-2 py-1 bg-gray-900 border border-gray-700 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none text-white text-xs font-mono text-right"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {}
                {splitType === 'exact' && (
                  <div className={`mt-3 p-2.5 rounded-lg text-xs font-medium flex justify-between items-center ${Math.abs(exactDifference) < 0.01 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                    <span>Math Check:</span>
                    <span className="font-mono">
                      {Math.abs(exactDifference) < 0.01 
                        ? 'Perfectly balanced' 
                        : `${exactDifference > 0 ? '+' : ''}$${exactDifference.toFixed(2)} remaining`}
                    </span>
                  </div>
                )}
              </div>

              {}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-800">
                <button
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit" 
                  disabled={isLoading || !description.trim() || parsedAmount <= 0 || selectedMembers.length === 0 || (splitType === 'exact' && Math.abs(exactDifference) > 0.01)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/30 disabled:text-white/50 text-white font-medium rounded-lg text-xs transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none"
                >
                  {isLoading ? 'Saving...' : 'Add to Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}