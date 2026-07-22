import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { logoutUser, switchOrganization } from '../../services/auth.service';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Sidebar } from '../../components/Sidebar';
import { AIAssistantModal } from '../../components/AIAssistantModal';
import { CommandPaletteModal } from '../../components/ui/CommandPaletteModal';

export const DashboardOverviewPage = () => {
  const { user, activeOrganization, organizations, setAuth, logout } = useAuthStore();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const isSuperAdmin = user?.is_global_superadmin;
  const userRole = activeOrganization?.role || user?.role || 'MEMBER';

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Dynamic Role-Based Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {/* Command Palette Search Trigger */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-3 px-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200 text-xs transition-colors"
            >
              <span>🔍 Search or type command...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-300 bg-slate-800 rounded border border-slate-700">
                Ctrl + K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* AI Copilot Trigger */}
            <Button
              size="sm"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 border-none text-xs font-bold"
              onClick={() => setIsAIModalOpen(true)}
            >
              ✨ AI Copilot
            </Button>

            {/* Tenant Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Tenant:</span>
              <select
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>

        {/* Dashboard Workspace */}
        <main className="p-6 md:p-10 space-y-8 flex-1 overflow-y-auto">
          {/* Welcome Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 p-6 rounded-2xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 uppercase">
                  {isSuperAdmin ? '👑 Super Admin View' : `${userRole} Dashboard`}
                </span>
              </div>
              <h1 className="text-3xl font-bold mt-1 text-slate-100">
                Welcome back, {user?.first_name} {user?.last_name}!
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Workspace Context: <span className="text-indigo-400 font-semibold">{activeOrganization?.name}</span> ({activeOrganization?.slug})
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setIsCommandPaletteOpen(true)} variant="secondary" size="sm">
                🔍 Quick Command (Ctrl+K)
              </Button>
            </div>
          </div>

          {/* ROLE-SPECIFIC DASHBOARDS */}
          {isSuperAdmin ? (
            /* 1. SUPER ADMIN DASHBOARD VIEW */
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="!p-5 bg-purple-950/30 border-purple-500/40">
                  <span className="text-xs font-bold text-purple-400 uppercase">Platform Control</span>
                  <p className="text-2xl font-bold text-slate-100 mt-1">Super Admin Console</p>
                  <Link to="/superadmin" className="text-xs text-purple-400 hover:underline font-bold mt-2 block">
                    Manage Platform →
                  </Link>
                </Card>
                <Card className="!p-5 bg-emerald-950/30 border-emerald-500/40">
                  <span className="text-xs font-bold text-emerald-400 uppercase">Revenue Analytics</span>
                  <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">Aggregated Ledger</p>
                  <Link to="/reports" className="text-xs text-emerald-400 hover:underline font-bold mt-2 block">
                    View Reports →
                  </Link>
                </Card>
              </div>
            </div>
          ) : userRole === 'TREASURER' ? (
            /* 2. FINANCE MANAGER DASHBOARD VIEW */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="!p-5 bg-emerald-950/30 border-emerald-500/40">
                  <span className="text-xs font-bold text-emerald-400 uppercase">Today's Income Ledger</span>
                  <p className="text-3xl font-bold font-mono text-emerald-400 mt-1">$0.00</p>
                  <Link to="/finance" className="text-xs text-emerald-400 hover:underline font-bold mt-3 block">
                    View Cashbook →
                  </Link>
                </Card>
                <Card className="!p-5 bg-rose-950/30 border-rose-500/40">
                  <span className="text-xs font-bold text-rose-400 uppercase">Today's Expenses</span>
                  <p className="text-3xl font-bold font-mono text-rose-400 mt-1">$0.00</p>
                  <Link to="/budgets" className="text-xs text-rose-400 hover:underline font-bold mt-3 block">
                    Check Budgets →
                  </Link>
                </Card>
                <Card className="!p-5 bg-indigo-950/30 border-indigo-500/40">
                  <span className="text-xs font-bold text-indigo-400 uppercase">Payment Receipts</span>
                  <p className="text-3xl font-bold font-mono text-indigo-300 mt-1">QR Verified</p>
                  <Link to="/receipts" className="text-xs text-indigo-400 hover:underline font-bold mt-3 block">
                    Issue Receipts →
                  </Link>
                </Card>
              </div>
            </div>
          ) : (
            /* 3. DEFAULT OWNER / ADMIN / MEMBER DASHBOARD VIEW */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="!p-6 space-y-3">
                <span className="text-2xl">💰</span>
                <h3 className="text-lg font-bold text-slate-100">Donations & Fundraising</h3>
                <p className="text-xs text-slate-400">Launch campaigns, track donor contributions & issue instant receipts.</p>
                <Link to="/donations" className="text-xs text-indigo-400 hover:underline font-bold block pt-2">
                  Access Campaigns →
                </Link>
              </Card>

              <Card className="!p-6 space-y-3">
                <span className="text-2xl">🎟️</span>
                <h3 className="text-lg font-bold text-slate-100">Events & QR Tickets</h3>
                <p className="text-xs text-slate-400">RSVP events, generate QR tickets, and check-in attendees.</p>
                <Link to="/events" className="text-xs text-indigo-400 hover:underline font-bold block pt-2">
                  Access Events →
                </Link>
              </Card>

              <Card className="!p-6 space-y-3">
                <span className="text-2xl">💬</span>
                <h3 className="text-lg font-bold text-slate-100">Real-Time Chat</h3>
                <p className="text-xs text-slate-400">Private, group, and committee chat channels with file sharing.</p>
                <Link to="/chat" className="text-xs text-indigo-400 hover:underline font-bold block pt-2">
                  Open Chat Workspace →
                </Link>
              </Card>

              <Card className="!p-6 space-y-3">
                <span className="text-2xl">📊</span>
                <h3 className="text-lg font-bold text-slate-100">Executive Reports</h3>
                <p className="text-xs text-slate-400">Generate PDF streams, Excel exports, and printable financial statements.</p>
                <Link to="/reports" className="text-xs text-indigo-400 hover:underline font-bold block pt-2">
                  Generate Reports →
                </Link>
              </Card>

              <Card className="!p-6 space-y-3">
                <span className="text-2xl">🪪</span>
                <h3 className="text-lg font-bold text-slate-100">Member Directory</h3>
                <p className="text-xs text-slate-400">Manage member profiles, membership tiers, positions, and digital QR cards.</p>
                <Link to="/members" className="text-xs text-indigo-400 hover:underline font-bold block pt-2">
                  View Members →
                </Link>
              </Card>

              <Card className="!p-6 space-y-3">
                <span className="text-2xl">👥</span>
                <h3 className="text-lg font-bold text-slate-100">Committees & Hierarchy</h3>
                <p className="text-xs text-slate-400">Structure Central, District, and Upazila committee leadership terms.</p>
                <Link to="/committees" className="text-xs text-indigo-400 hover:underline font-bold block pt-2">
                  View Committees →
                </Link>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistantModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />

      {/* Command Palette Modal (Ctrl + K) */}
      <CommandPaletteModal isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
    </div>
  );
};
