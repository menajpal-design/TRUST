import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { logoutUser, switchOrganization } from '../services/auth.service';
import { Button } from './ui/Button';

export const Navbar = ({ onOpenCommandPalette, onOpenAIModal }) => {
  const { user, activeOrganization, organizations, setAuth, logout } = useAuthStore();
  const navigate = useNavigate();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error(e);
    } finally {
      logout();
    }
  };

  const handleSwitchOrg = async (orgId) => {
    if (orgId === activeOrganization?._id) return;
    setSwitching(true);
    try {
      const response = await switchOrganization(orgId);
      setAuth({
        user,
        activeOrganization: response.data.activeOrganization,
        organizations,
        accessToken: response.data.accessToken
      });
    } catch (err) {
      console.error('Failed to switch tenant', err);
    } finally {
      setSwitching(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 h-16 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Brand / Tenant Switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold hidden sm:inline">Organization:</span>
          <select
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
            value={activeOrganization?._id || ''}
            onChange={(e) => handleSwitchOrg(e.target.value)}
            disabled={switching}
          >
            {organizations.map((org) => (
              <option key={org._id} value={org._id}>
                {org.name} ({org.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <button
        onClick={onOpenCommandPalette}
        className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200 text-xs transition-colors"
      >
        <span>🔍 Search ERP modules or type command...</span>
        <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-300 bg-slate-800 rounded border border-slate-700">
          Ctrl + K
        </kbd>
      </button>

      {/* Right Action Icons & Profile Dropdown */}
      <div className="flex items-center gap-3">
        {/* Quick Create Dropdown */}
        <div className="relative">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsQuickCreateOpen(!isQuickCreateOpen)}
            className="text-xs font-bold"
          >
            + Quick Action
          </Button>

          {isQuickCreateOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-2 z-50 text-xs">
              <Link
                to="/donations"
                className="block px-4 py-2 hover:bg-slate-800 text-slate-200"
                onClick={() => setIsQuickCreateOpen(false)}
              >
                💰 Record Donation
              </Link>
              <Link
                to="/events"
                className="block px-4 py-2 hover:bg-slate-800 text-slate-200"
                onClick={() => setIsQuickCreateOpen(false)}
              >
                🎟️ Schedule Event
              </Link>
              <Link
                to="/members"
                className="block px-4 py-2 hover:bg-slate-800 text-slate-200"
                onClick={() => setIsQuickCreateOpen(false)}
              >
                🪪 Add New Member
              </Link>
              <Link
                to="/finance"
                className="block px-4 py-2 hover:bg-slate-800 text-slate-200"
                onClick={() => setIsQuickCreateOpen(false)}
              >
                💼 Income / Expense Entry
              </Link>
            </div>
          )}
        </div>

        {/* AI Copilot Button */}
        <Button
          size="sm"
          className="bg-gradient-to-r from-indigo-600 to-purple-600 border-none text-xs font-bold hidden sm:inline-flex"
          onClick={onOpenAIModal}
        >
          ✨ AI Copilot
        </Button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 hidden sm:block text-sm"
          title="Toggle Fullscreen"
        >
          ⛶
        </button>

        {/* Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 border border-indigo-400 flex items-center justify-center font-bold text-xs text-white shadow-md">
              {user?.first_name ? user.first_name[0] : 'U'}
            </div>
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs">
              <div className="px-4 py-3 border-b border-slate-800">
                <p className="font-bold text-slate-100">{user?.first_name} {user?.last_name}</p>
                <p className="text-slate-400 font-mono text-[11px] truncate">{user?.email}</p>
                <span className="mt-1 inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {user?.is_global_superadmin ? '👑 Super Admin' : activeOrganization?.role || 'Member'}
                </span>
              </div>

              <Link
                to="/settings"
                className="block px-4 py-2 hover:bg-slate-800 text-slate-200"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                ⚙️ Enterprise Settings
              </Link>
              {user?.is_global_superadmin && (
                <Link
                  to="/superadmin"
                  className="block px-4 py-2 hover:bg-slate-800 text-purple-400 font-bold"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  👑 Super Admin Console
                </Link>
              )}

              <div className="border-t border-slate-800 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-rose-950/50 text-rose-400 font-bold"
                >
                  🚪 Logout Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
