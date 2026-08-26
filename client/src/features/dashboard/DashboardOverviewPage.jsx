import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { fetchMembers } from '../../services/member.service';
import { fetchFeeReports } from '../../services/fee.service';
import { fetchCommittees } from '../../services/committee.service';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CommandPaletteModal } from '../../components/ui/CommandPaletteModal';
import { formatCurrency } from '../../utils/formatCurrency';

export const DashboardOverviewPage = () => {
  const { user, activeOrganization, organizations } = useAuthStore();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const [stats, setStats] = useState({
    memberCount: 0,
    totalCollected: 0,
    committeeCount: 0,
    loading: true
  });

  const isSuperAdmin = user?.is_global_superadmin;
  const userRole = activeOrganization?.role || user?.role || 'MEMBER';

  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      try {
        const [memRes, feeRes, comRes] = await Promise.allSettled([
          fetchMembers(),
          fetchFeeReports(),
          fetchCommittees()
        ]);

        const memberCount = memRes.status === 'fulfilled' ? (memRes.value.data?.meta?.totalDocs || memRes.value.data?.docs?.length || 0) : 0;
        const totalCollected = feeRes.status === 'fulfilled' ? (feeRes.value.data?.total_collected || 0) : 0;
        const committeeCount = comRes.status === 'fulfilled' ? (comRes.value.data?.length || 0) : 0;

        if (isMounted) {
          setStats({
            memberCount,
            totalCollected,
            committeeCount,
            loading: false
          });
        }
      } catch (e) {
        console.error('Failed to load dashboard stats', e);
        if (isMounted) setStats(s => ({ ...s, loading: false }));
      }
    };

    loadStats();
    return () => { isMounted = false; };
  }, [activeOrganization?._id]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 p-6 rounded-2xl">
        <div>
          <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950 px-2.5 py-1 rounded-md border border-indigo-800 uppercase tracking-wider">
            {isSuperAdmin ? '👑 Global Super Admin Mode' : `🛡️ Active Role: ${userRole}`}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-2">
            Welcome back, {user?.first_name || 'Leader'} 👋
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Managing <strong className="text-emerald-400">{activeOrganization?.name || 'UnionDesk Organization'}</strong> ERP operations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/fees">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
              💳 Membership Fees
            </Button>
          </Link>
          <Link to="/reports">
            <Button size="sm" variant="secondary">
              📊 Executive Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Dynamic KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="!p-5 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Members</span>
            <span className="text-lg">🪪</span>
          </div>
          <p className="text-3xl font-bold text-slate-100 font-mono mt-2">
            {stats.loading ? '...' : stats.memberCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Registered in workspace</p>
        </Card>

        <Card className="!p-5 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Dues Collected</span>
            <span className="text-lg">💰</span>
          </div>
          <p className="text-3xl font-bold text-emerald-400 font-mono mt-2">
            {stats.loading ? '...' : formatCurrency(stats.totalCollected)}
          </p>
          <p className="text-[11px] text-emerald-400 mt-1">Verified cashbook ledger</p>
        </Card>

        <Card className="!p-5 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Active Committees</span>
            <span className="text-lg">👥</span>
          </div>
          <p className="text-3xl font-bold text-purple-300 font-mono mt-2">
            {stats.loading ? '...' : stats.committeeCount}
          </p>
          <p className="text-[11px] text-purple-400 mt-1">Structured tiers</p>
        </Card>

        <Card className="!p-5 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">System Status</span>
            <span className="text-lg">⚡</span>
          </div>
          <p className="text-3xl font-bold text-emerald-400 font-mono mt-2">LIVE</p>
          <p className="text-[11px] text-slate-400 mt-1">Database synced</p>
        </Card>
      </div>

      {/* Management Shortcuts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="space-y-3">
          <div className="text-2xl">💳</div>
          <h3 className="font-bold text-slate-100 text-base">Membership Dues Ledger</h3>
          <p className="text-xs text-slate-400">Generate monthly dues, record collections, and issue official receipts.</p>
          <Link to="/fees" className="text-xs text-emerald-400 hover:underline font-bold block pt-2">
            Manage Fees & Receipts →
          </Link>
        </Card>

        <Card className="space-y-3">
          <div className="text-2xl">🎟️</div>
          <h3 className="font-bold text-slate-100 text-base">Events & Gate Check-In</h3>
          <p className="text-xs text-slate-400">Schedule summits, issue QR tickets, and check-in attendees.</p>
          <Link to="/events" className="text-xs text-indigo-400 hover:underline font-bold block pt-2">
            Open Event Studio →
          </Link>
        </Card>

        <Card className="space-y-3">
          <div className="text-2xl">📊</div>
          <h3 className="font-bold text-slate-100 text-base">Audit & Financial Reports</h3>
          <p className="text-xs text-slate-400">Export income, expense, and committee roster reports to PDF & Excel.</p>
          <Link to="/reports" className="text-xs text-indigo-400 hover:underline font-bold block pt-2">
            View Analytics Dashboard →
          </Link>
        </Card>
      </div>

      {/* Super Admin Quick Controls (If SuperAdmin) */}
      {isSuperAdmin && (
        <Card className="border-purple-500/40 bg-purple-950/20 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-purple-300 text-sm flex items-center gap-2">
              👑 Global Super Admin System Controls
            </h3>
            <Link to="/superadmin">
              <Button size="sm" variant="outline" className="border-purple-500 text-purple-300">
                Super Admin Console
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block font-semibold">Total System Organizations</span>
              <strong className="text-lg text-white font-mono">{organizations.length}</strong>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block font-semibold">Global System Status</span>
              <strong className="text-lg text-emerald-400 font-mono">ALL SYSTEMS OPERATIONAL</strong>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block font-semibold">Active Tenant Context</span>
              <strong className="text-lg text-indigo-400 font-mono truncate block">{activeOrganization?.name}</strong>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Action Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-100 text-sm">🪪 Member Directory & PVC Studio</h3>
            <span className="text-xs text-indigo-400 font-mono">{stats.memberCount} Members</span>
          </div>
          <p className="text-xs text-slate-400">Search members, update details, or print PVC Smart ID cards with QR validation.</p>
          <div className="flex gap-4 pt-2">
            <Link to="/members" className="text-xs text-indigo-400 hover:underline font-bold">
              Manage Members →
            </Link>
            <Link to="/idcard" className="text-xs text-purple-400 hover:underline font-bold">
              Print PVC ID Cards →
            </Link>
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-100 text-sm">👥 Committee Hierarchy Tiers</h3>
            <span className="text-xs text-indigo-400 font-mono">{stats.committeeCount} Active Tiers</span>
          </div>
          <p className="text-xs text-slate-400">Structure Central, District, and Upazila committee leadership terms.</p>
          <Link to="/committees" className="text-xs text-indigo-400 hover:underline font-bold block pt-2">
            View Committees →
          </Link>
        </Card>
      </div>

      {/* Command Palette Modal (Ctrl + K) */}
      <CommandPaletteModal isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
    </div>
  );
};
