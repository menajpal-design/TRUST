import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Breadcrumbs } from './Breadcrumbs';
import { MobileBottomNav } from './MobileBottomNav';
import { CommandPaletteModal } from './ui/CommandPaletteModal';

export const MainLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Desktop Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">

        {/* Sticky Navbar */}
        <Navbar
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Breadcrumbs */}
        <Breadcrumbs />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto pb-20 md:pb-6">
          <div className="max-w-[1400px] mx-auto w-full animate-fadein">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Command Palette Modal */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
};
