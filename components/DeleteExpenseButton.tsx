'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { deleteExpense } from '../actions/expense.actions';

export default function DeleteExpenseButton({ expenseId, groupId }: { expenseId: string, groupId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  async function handleConfirmDelete() {
    setIsDeleting(true);
    
    try {
      const result = await deleteExpense(expenseId, groupId);
      
      if (result.success) {
        toast.success("Receipt erased from ledger.");
        setShowModal(false); // Close the modal
      } else {
        toast.error(result.error || "Failed to delete.");
        setIsDeleting(false); 
      }
    } catch (err) {
      toast.error("Network error.");
      setIsDeleting(false);
    }
  }

  return (
    <>
      {/* The Subtly Visible Trash Can */}
      <button 
        onClick={() => setShowModal(true)}
        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        title="Delete Expense"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
        </svg>
      </button>

      {/* The Custom Dark Mode Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-sm w-full p-6 shadow-2xl relative">
            
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            
            <h3 className="text-lg font-bold text-white text-center mb-2">Erase Receipt?</h3>
            
            <p className="text-sm text-gray-400 text-center mb-6 leading-relaxed">
              This will permanently delete this expense. The Settlement Engine will instantly recalculate all debts.
            </p>
            
            {}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg text-sm transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Erasing...</span>
                  </>
                ) : (
                  <span>Yes, Erase it</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}