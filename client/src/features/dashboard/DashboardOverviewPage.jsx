import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { fetchMembers } from '../../services/member.service';
import { fetchFeeReports, fetchDues } from '../../services/fee.service';
import { fetchCommittees } from '../../services/committee.service';
import { fetchReceipts } from '../../services/receipt.service';
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
    myTotalPaid: 0,
    myTotalDue: 0,
    myReceiptsCount: 0,
    loading: true
  });

  const isSuperAdmin = user?.is_global_superadmin;
  const rawRole = activeOrganization?.role || activeOrganization?.user_role || user?.role || 'MEMBER';
  const userRole = String(rawRole).toUpperCase();
  const isManager = isSuperAdmin || ['ORG_OWNER', 'OWNER', 'ADMIN', 'TREASURER', 'MODERATOR'].includes(userRole);

  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      try {
        const [memRes, feeRes, comRes, duesRes, recRes] = await Promise.allSettled([
          fetchMembers(),
          fetchFeeReports(),
          fetchCommittees(),
          fetchDues(),
          fetchReceipts()
        ]);

        const memberCount = memRes.status === 'fulfilled' ? (memRes.value.data?.meta?.totalDocs || memRes.value.data?.docs?.length || (Array.isArray(memRes.value.data) ? memRes.value.data.length : 0)) : 0;
        const totalCollected = feeRes.status === 'fulfilled' ? (feeRes.value.data?.total_collected || 0) : 0;
        const committeeCount = comRes.status === 'fulfilled' ? (comRes.value.data?.length || 0) : 0;

        let myPaid = 0;
        let myDue = 0;
        if (duesRes.status === 'fulfilled') {
          const allDues = duesRes.value.data || [];
          const myDues = allDues.filter(d => {
            const uId = d.member_id?.user_id?._id || d.member_id?.user_id || d.member_id?._id || d.member_id;
            return String(uId) === String(user?._id);
          });
          myPaid = myDues.reduce((acc, curr) => acc + (curr.paid_amount || 0), 0);
          myDue = myDues.reduce((acc, curr) => acc + Math.max(0, (curr.due_amount || 0) + (curr.late_fee || 0) - (curr.paid_amount || 0)), 0);
        }

        let myRecCount = 0;
        if (recRes.status === 'fulfilled') {
          const allRecs = recRes.value.data || [];
          const userName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim().toLowerCase();
          const myRecs = allRecs.filter(r => (r.payer_name || '').toLowerCase().includes(userName));
          myRecCount = myRecs.length;
        }

        if (isMounted) {
          setStats({
            memberCount,
            totalCollected,
            committeeCount,
            myTotalPaid: myPaid,
            myTotalDue: myDue,
            myReceiptsCount: myRecCount,
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
  }, [activeOrganization?._id, user?._id]);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-indigo-950/40 border border-indigo-500/30 p-6 rounded-2xl">
        <div>
          <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950 px-2.5 py-1 rounded-md border border-indigo-800 uppercase tracking-wider">
            {isSuperAdmin ? '👑 Global Super Admin Mode' : isManager ? `🛡️ Management Role: ${userRole}` : '👤 Member Personal Portal'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-2">
            স্বাগতম, {user?.first_name || 'Member'} 👋
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            {isManager
              ? `Managing ${activeOrganization?.name || 'UnionDesk Organization'} ERP operations.`
              : `${activeOrganization?.name || 'UnionDesk BD'} এর ডিজিটাল মেম্বার ড্যাশবোর্ড`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isManager ? (
            <>
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
            </>
          ) : (
            <>
              <Link to="/fees">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                  💳 ফি জমা দিন (Pay Due)
                </Button>
              </Link>
              <Link to="/idcard">
                <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold">
                  🆔 স্মার্ট PVC কার্ড
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* MEMBER KPI GRID */}
      {!isManager ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="!p-5 border-l-4 border-emerald-500 bg-emerald-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase">মোট পরিশোধিত ফি</span>
              <span className="text-lg">💰</span>
            </div>
            <p className="text-3xl font-bold text-emerald-400 font-mono mt-2">
              {formatCurrency(stats.myTotalPaid)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">সর্বশেষ পরিশোধিত কিস্তি সহ</p>
          </Card>

          <Card className="!p-5 border-l-4 border-rose-500 bg-rose-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 uppercase">বর্তমান বকেয়া ফি</span>
              <span className="text-lg">💳</span>
            </div>
            <p className="text-3xl font-bold text-rose-400 font-mono mt-2">
              {formatCurrency(stats.myTotalDue)}
            </p>
            <Link to="/fees" className="text-[11px] text-rose-400 hover:underline font-bold mt-1 block">
              এখনই জমা দিন →
            </Link>
          </Card>

          <Card className="!p-5 border-l-4 border-indigo-500 bg-indigo-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase">ডিজিটাল রসিদ</span>
              <span className="text-lg">🧾</span>
            </div>
            <p className="text-3xl font-bold text-indigo-300 font-mono mt-2">
              {stats.myReceiptsCount} টি
            </p>
            <Link to="/receipts" className="text-[11px] text-indigo-400 hover:underline font-bold mt-1 block">
              রসিদ প্রিন্ট করুন →
            </Link>
          </Card>

          <Card className="!p-5 border-l-4 border-rose-600 bg-rose-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300 uppercase">রক্তদান যোগ্যতা</span>
              <span className="text-lg">🩸</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400 font-mono mt-2">ELIGIBLE</p>
            <Link to="/blood-relief" className="text-[11px] text-rose-300 hover:underline font-bold mt-1 block">
              ব্লাড ডিরেক্টরি ও ক্যাম্পেইন →
            </Link>
          </Card>
        </div>
      ) : (
        /* MANAGER DYNAMIC KPI GRID */
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
      )}

      {/* MEMBER NAVIGATION TILES */}
      {!isManager ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="space-y-3 hover:border-emerald-500/50 transition-all">
            <div className="text-3xl">💳</div>
            <h3 className="font-bold text-slate-100 text-base">ফি জমা ও বকেয়া হিসাব</h3>
            <p className="text-xs text-slate-400">আপনার মাসিক মেম্বারশিপ ফি পরিশোধ করুন এবং পূর্বের পেমেন্ট হিস্ট্রি দেখুন।</p>
            <Link to="/fees" className="text-xs text-emerald-400 hover:underline font-bold block pt-2">
              টাকা জমা দিন →
            </Link>
          </Card>

          <Card className="space-y-3 hover:border-indigo-500/50 transition-all">
            <div className="text-3xl">🧾</div>
            <h3 className="font-bold text-slate-100 text-base">ডিজিটাল পেমেন্ট রসিদ</h3>
            <p className="text-xs text-slate-400">প্রদত্ত সকল ফি ও অনুদানের অফিশিয়াল কিউআর রসিদ ডাউনলোড ও প্রিন্ট করুন।</p>
            <Link to="/receipts" className="text-xs text-indigo-400 hover:underline font-bold block pt-2">
              রসিদ সমূহ দেখুন →
            </Link>
          </Card>

          <Card className="space-y-3 hover:border-purple-500/50 transition-all">
            <div className="text-3xl">🆔</div>
            <h3 className="font-bold text-slate-100 text-base">স্মার্ট পিভিসি আইডি কার্ড</h3>
            <p className="text-xs text-slate-400">আপনার সদস্যপদের ভেরিফায়েড আন্তর্জাতিক মানের স্মার্ট আইডি কার্ড প্রিন্ট করুন।</p>
            <Link to="/idcard" className="text-xs text-purple-400 hover:underline font-bold block pt-2">
              আইডি কার্ড দেখুন →
            </Link>
          </Card>

          <Card className="space-y-3 hover:border-rose-500/50 transition-all">
            <div className="text-3xl">🩸</div>
            <h3 className="font-bold text-slate-100 text-base">ব্লাড ক্যাম্পেইন ও রক্তদান</h3>
            <p className="text-xs text-slate-400">রক্তদানের তথ্য আপডেট করুন ও সংস্থার জরুরি রক্তদাতা ডিরেক্টরি ব্যবহার করুন।</p>
            <Link to="/blood-relief" className="text-xs text-rose-400 hover:underline font-bold block pt-2">
              ব্লাড পোর্টাল খুলুন →
            </Link>
          </Card>

          <Card className="space-y-3 hover:border-amber-500/50 transition-all">
            <div className="text-3xl">💰</div>
            <h3 className="font-bold text-slate-100 text-base">পাবলিক ক্যাম্পেইন ও অনুদান</h3>
            <p className="text-xs text-slate-400">সংস্থার উন্নয়নমূলক ও জরুরি ত্রাণ তহবিলে অনুদান প্রদান করুন।</p>
            <Link to="/donations" className="text-xs text-amber-400 hover:underline font-bold block pt-2">
              ক্যাম্পেইন দেখুন →
            </Link>
          </Card>

          <Card className="space-y-3 hover:border-teal-500/50 transition-all">
            <div className="text-3xl">🗳️</div>
            <h3 className="font-bold text-slate-100 text-base">ভোটিং ও অনলাইন সভা</h3>
            <p className="text-xs text-slate-400">নির্বাচনী ও সাংগঠনিক অনলাইন পোলে মতামত দিন ও রেজোলিউশন দেখুন।</p>
            <Link to="/meetings" className="text-xs text-teal-400 hover:underline font-bold block pt-2">
              অনলাইন পোলে ভোট দিন →
            </Link>
          </Card>
        </div>
      ) : (
        /* MANAGEMENT SHORTCUTS GRID */
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
      )}

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

      {/* Command Palette Modal (Ctrl + K) */}
      <CommandPaletteModal isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
    </div>
  );
};
