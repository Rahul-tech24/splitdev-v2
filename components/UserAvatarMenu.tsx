'use client';

import { useState, useRef, useEffect } from 'react';
import { LogOut, Settings } from 'lucide-react';
import { logoutUser } from '../actions/auth.actions';

export default function UserAvatarMenu({ userName }: { userName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get the first letter of the user's name
  const initial = userName ? userName.charAt(0).toUpperCase() : 'U';

  // Close the dropdown if the user clicks outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* The Avatar Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 cursor-pointer rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg hover:bg-blue-500/20 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      >
        {initial}
      </button>

      {/* The Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-800 bg-gray-900/50">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Signed in as</p>
            <p className="text-sm font-bold text-white truncate">{userName}</p>
          </div>

          {/* Menu Actions */}
          <div className="p-1.5">
            <button 
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <Settings size={16} />
              <span>Profile Settings</span>
            </button>

            {/* The Real Server Action Logout Form */}
            <form action={logoutUser} className="w-full mt-1">
              <button 
                type="submit" 
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}