import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Breadcrumbs } from './Breadcrumbs';
import { MobileBottomNav } from './MobileBottomNav';
import { AIAssistantModal } from './AIAssistantModal';
import { CommandPaletteModal } from './ui/CommandPaletteModal';

export const MainLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Dynamic Desktop Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Top Navbar */}
        <Navbar
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenAIModal={() => setIsAIModalOpen(true)}
        />

        {/* Dynamic Route Breadcrumbs */}
        <Breadcrumbs />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation & Drawer */}
      <MobileBottomNav onOpenAIModal={() => setIsAIModalOpen(true)} />

      {/* AI Copilot Modal */}
      <AIAssistantModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />

      {/* Command Palette Modal (Ctrl + K) */}
      <CommandPaletteModal isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
    </div>
  );
};
