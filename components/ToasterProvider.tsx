'use client';

import { Toaster } from 'react-hot-toast';

export default function ToasterProvider() {
  return (
    <Toaster 
      position="bottom-right" 
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1f2937', // gray-800
          color: '#fff',
          border: '1px solid #374151', // gray-700
          fontSize: '14px',
          fontWeight: '500',
        },
        success: {
          iconTheme: {
            primary: '#10b981', // emerald-500
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444', // red-500
            secondary: '#fff',
          },
        },
      }} 
    />
  );
}
