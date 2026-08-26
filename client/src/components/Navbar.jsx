import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { logoutUser, switchOrganization } from '../services/auth.service';
import { Button } from './ui/Button';

export const Navbar = ({ onOpenCommandPalette, onToggleMobileMenu }) => {
  const { user, activeOrganization, organizations, setAuth, logout } = useAuthStore();
  const navigate = useNavigate();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    try { await logoutUser(); } catch (e) { console.error(e); } finally { logout(); }
  };

  const handleSwitchOrg = async (orgId) => {
    if (orgId === activeOrganization?._id) return;
    setSwitching(true);
    try {
      const response = await switchOrganization(orgId);
      setAuth({ user, activeOrganization: response.data.activeOrganization, organizations, accessToken: response.data.accessToken });
    } catch (err) {
      console.error('Failed to switch tenant', err);
    } finally {
      setSwitching(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  return (
    <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-30 gap-3">

      {/* Left — Mobile Menu + Org Switcher */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all text-base flex-shrink-0"
          title="Open Navigation"
        >
          ☰
        </button>

        {/* Brand mark (mobile only) */}
        <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-md md:hidden flex-shrink-0">
          U
        </div>

        {/* Org switcher */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="hidden sm:block text-[11px] font-semibold text-slate-500 whitespace-nowrap">Workspace:</span>
          <select
            className="bg-slate-900 border border-slate-800/60 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 font-semibold max-w-[150px] sm:max-w-[220px] truncate transition-all hover:border-slate-700 cursor-pointer"
            value={activeOrganization?._id || ''}
            onChange={(e) => handleSwitchOrg(e.target.value)}
            disabled={switching}
          >
            {organizations.map((org) => (
              <option key={org._id} value={org._id} className="bg-slate-900">
                {org.name} — {org.role}
              </option>
            ))}
          </select>
          {switching && <span className="text-[10px] text-indigo-400 animate-pulse font-semibold hidden sm:block">Switching…</span>}
        </div>
      </div>

      {/* Center — Global Search */}
      <button
        onClick={onOpenCommandPalette}
        className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-900/80 border border-slate-800/60 hover:border-slate-700 rounded-xl text-slate-500 hover:text-slate-300 text-xs transition-all duration-200 min-w-0 max-w-xs group"
      >
        <span className="group-hover:scale-110 transition-transform">🔍</span>
        <span className="flex-1 text-left truncate">Search modules, commands…</span>
        <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-800 rounded-md border border-slate-700 flex-shrink-0">
          ⌘K
        </kbd>
      </button>

      {/* Right — Actions + Profile */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-all text-sm"
          title="Toggle Fullscreen"
        >
          ⛶
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/80 transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 border-2 border-indigo-500/40 flex items-center justify-center font-bold text-xs text-white shadow-md group-hover:border-indigo-400/60 transition-all">
              {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-200 leading-tight">
                {user?.first_name || 'User'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono leading-tight">
                {user?.is_global_superadmin ? '👑 SuperAdmin' : activeOrganization?.role || 'MEMBER'}
              </div>
            </div>
            <span className="hidden sm:block text-slate-500 text-xs">▾</span>
          </button>

          {isProfileMenuOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />

              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-60 bg-slate-900 border border-slate-800/60 rounded-2xl shadow-2xl shadow-slate-950/80 py-2 z-50 animate-fadein">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-slate-800/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-sm text-white shadow-md flex-shrink-0">
                      {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-100 text-sm leading-tight truncate">{user?.first_name} {user?.last_name}</p>
                      <p className="text-slate-500 font-mono text-[10px] truncate">{user?.email}</p>
                      <span className="mt-1 inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                        {user?.is_global_superadmin ? '👑 Super Admin' : activeOrganization?.role || 'MEMBER'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800/60 hover:text-slate-100 transition-colors"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <span>⚙️</span>
                    <span>Organization Settings</span>
                  </Link>

                  {user?.is_global_superadmin && (
                    <Link
                      to="/superadmin"
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-purple-400 hover:bg-purple-950/40 hover:text-purple-300 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <span>👑</span>
                      <span>Super Admin Console</span>
                    </Link>
                  )}
                </div>

                <div className="border-t border-slate-800/60 py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors"
                  >
                    <span>🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
