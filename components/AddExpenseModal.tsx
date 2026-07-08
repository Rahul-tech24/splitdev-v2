'use client';

import { useState } from 'react';
import { createExpense } from '../actions/group.actions';

export default function AddExpenseModal({ groupId }: { groupId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || !amount.trim()) return;

    // Convert string input to a clean number
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount greater than $0.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await createExpense(groupId, description, numericAmount);

      if (!result.success) {
        setError(result.error || 'Failed to add expense.');
        setIsLoading(false);
      } else {
        // Success! Reset form and close modal.
        // Because revalidatePath ran on the server, the ledger behind this modal
        // will instantly redraw with the new receipt at the top!
        setDescription('');
        setAmount('');
        setIsLoading(false);
        setIsOpen(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20 flex items-center space-x-2"
      >
        <span>+ Add Expense</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Add New Expense</h3>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setError(null);
                  setDescription('');
                  setAmount('');
                }}
                className="text-gray-400 hover:text-white text-sm font-medium"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <p className="text-xs text-gray-400 leading-relaxed">
                Record a receipt. This expense will be added to the shared ledger and split among the group.
              </p>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="description" className="block text-xs font-medium text-gray-300 mb-1.5">
                  Description
                </label>
                <input
                  id="description"
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Dinner at Tito's, Hotel booking"
                  className="w-full px-3.5 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white text-sm placeholder-gray-500"
                />
              </div>

              <div>
                <label htmlFor="amount" className="block text-xs font-medium text-gray-300 mb-1.5">
                  Amount ($)
                </label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white text-sm placeholder-gray-500 font-mono"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setError(null);
                    setDescription('');
                    setAmount('');
                  }}
                  className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !description.trim() || !amount.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium rounded-lg text-xs transition-all shadow-lg shadow-blue-500/20 disabled:cursor-not-allowed flex items-center space-x-1.5"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Put on Ledger</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}