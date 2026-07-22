import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const CommandPaletteModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open triggered from parent or global listener
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { title: '✨ Open AI Copilot Assistant', category: 'AI Copilot', path: '#ai', action: 'modal' },
    { title: '💰 Donations & Campaign Management', category: 'Finance', path: '/donations' },
    { title: '🎟️ Events & QR Ticket Check-In', category: 'Events', path: '/events' },
    { title: '💬 Real-Time Workspaces & Chat', category: 'Communication', path: '/chat' },
    { title: '📊 Executive Reports & PDF Exports', category: 'Reports', path: '/reports' },
    { title: '🧾 Payment Receipts & QR Verification', category: 'Finance', path: '/receipts' },
    { title: '💼 Financial Cashbook & Ledger', category: 'Finance', path: '/finance' },
    { title: '🏛️ Fiscal Budgets & History', category: 'Finance', path: '/budgets' },
    { title: '🪪 Member Directory & QR Cards', category: 'Directory', path: '/members' },
    { title: '👥 Committee Hierarchy & Terms', category: 'Organization', path: '/committees' },
    { title: '⚙️ Organization & Transparency Settings', category: 'Settings', path: '/organizations/settings' },
    { title: '👑 Super Admin Control Console', category: 'System', path: '/superadmin' }
  ];

  const filtered = commands.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (cmd) => {
    onClose();
    if (cmd.path !== '#ai') {
      navigate(cmd.path);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <span className="text-lg">🔍</span>
          <input
            type="text"
            placeholder="Type a command or search module... (Press Esc to close)"
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-sm font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-800 border border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No matching commands found.</div>
          ) : (
            filtered.map((cmd, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(cmd)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-indigo-950/60 hover:border-indigo-500/50 border border-transparent cursor-pointer transition-all"
              >
                <span className="text-sm font-semibold text-slate-200">{cmd.title}</span>
                <span className="text-[10px] font-mono font-bold text-indigo-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {cmd.category}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
