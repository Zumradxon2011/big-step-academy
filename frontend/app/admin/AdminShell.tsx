'use client';

import React, { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f8fafc]">
        {/* Chap Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Asosiy Ish Maydoni (Sidebar kengligicha suriladi) */}
        <div className="lg:pl-72 flex flex-col min-h-screen transition-all">
          <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
