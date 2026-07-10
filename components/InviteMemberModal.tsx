'use client';

import { useState } from 'react';
import { inviteMember } from '../actions/group.actions';
import toast from 'react-hot-toast';

export default function InviteMemberModal({ groupId }: { groupId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await inviteMember(groupId, email);

      if (!result.success) {
        toast.error(result.error || 'Failed to invite user.');
        setError(result.error || 'Failed to invite user.');
        setIsLoading(false);
      } else {
        // Success! Reset input and close the popup.
        // Because the Server Action ran revalidatePath, the page behind this modal
        // will automatically refresh and show the new member!
        setEmail('');
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
        className="text-xs text-blue-400 hover:text-blue-300 font-medium bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md transition-colors"
      >
        + Invite
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Invite a Friend</h3>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setError(null);
                  setEmail('');
                }}
                className="text-gray-400 hover:text-white text-sm font-medium"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <p className="text-xs text-gray-400 leading-relaxed">
                Enter the email address of a registered SplitDev user to add them to this group ledger.
              </p>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-300 mb-1.5">
                  User Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., rahul@test.com"
                  className="w-full px-3.5 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-white text-sm placeholder-gray-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setError(null);
                    setEmail('');
                  }}
                  className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium rounded-lg text-xs transition-all shadow-lg shadow-blue-500/20 disabled:cursor-not-allowed flex items-center space-x-1.5"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Add Member</span>
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