import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMembers, exportMembersExcel, importMembersExcel, deleteMember } from '../../services/member.service';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { AddMemberModal } from './AddMemberModal';
import { EditMemberModal } from './EditMemberModal';
import { MemberHistoryModal } from './MemberHistoryModal';
import { MemberProfileModal } from './MemberProfileModal';
import useAuthStore from '../../store/useAuthStore';

export const MemberListPage = () => {
  const { user: currentUser, activeOrganization } = useAuthStore();
  const isSuperAdmin = currentUser?.is_global_superadmin;
  const userRole = String(activeOrganization?.role || activeOrganization?.user_role || currentUser?.role || 'MEMBER').toUpperCase();

  // Role Permission Guard: Only Owner, Admin, Treasurer, Moderator or SuperAdmin can view full directory
  const canManageMembers = isSuperAdmin || ['ORG_OWNER', 'OWNER', 'ADMIN', 'TREASURER', 'MODERATOR'].includes(userRole);

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalDocs: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [historyMemberId, setHistoryMemberId] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [importing, setImporting] = useState(false);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const res = await fetchMembers({ search, status, page, limit: 10 });
      setMembers(res.data || []);
      if (res.meta) setMeta(res.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [search, status, page]);

  const handleExportExcel = () => {
    exportMembersExcel();
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    try {
      const res = await importMembersExcel(file);
      alert(res.message);
      loadMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Excel import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member record?')) return;
    try {
      await deleteMember(id);
      loadMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete member');
    }
  };

  // Find personal member record if regular MEMBER
  const myMemberRecord = members.find(m => {
    const u = m.user_id;
    return u && (u._id === currentUser?._id || u === currentUser?._id || u.email === currentUser?.email);
  }) || (members.length > 0 ? members[0] : null);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
              {canManageMembers ? `👑 Role: ${userRole} (Management Access)` : '👤 Member Personal Profile'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">
            {canManageMembers ? 'Organization Member Directory' : '👤 আমার প্রোফাইল & ডিজিটাল মেম্বার আইডি'}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            {canManageMembers
              ? 'Personal details, Membership types, Committee tiers, System roles & Digital QR Cards'
              : 'আপনার ব্যক্তিগত তথ্য, মেম্বারশিপ স্ট্যাটাস, স্মার্ট PVC আইডি কার্ড ও পেমেন্ট হিস্ট্রি'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link to="/dashboard">
            <Button variant="secondary" size="sm">Dashboard</Button>
          </Link>
          {canManageMembers && (
            <>
              <label className="cursor-pointer">
                <span className="inline-flex items-center px-3 py-1.5 bg-slate-900 border border-slate-700 text-xs font-semibold rounded-lg text-slate-200 hover:bg-slate-800 transition-colors">
                  {importing ? 'Importing...' : '📥 Import Excel'}
                </span>
                <input type="file" accept=".xlsx" className="hidden" onChange={handleImportExcel} disabled={importing} />
              </label>
              <Button variant="outline" size="sm" onClick={handleExportExcel}>
                📤 Export Excel
              </Button>
              <Button size="sm" onClick={() => setIsAddOpen(true)}>
                + Add New Member
              </Button>
            </>
          )}
        </div>
      </div>

      {/* NON-MANAGER MEMBER PERSONAL PROFILE VIEW */}
      {!canManageMembers && (
        <div className="space-y-6">
          <Card className="!p-6 bg-slate-900 border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 border-2 border-emerald-400 flex items-center justify-center font-bold text-2xl text-white shadow-xl">
                {currentUser?.first_name ? currentUser.first_name[0] : 'M'}
              </div>
              <div className="text-center sm:text-left space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
                  {currentUser?.first_name} {currentUser?.last_name}
                </h2>
                <p className="text-xs text-indigo-400 font-mono font-bold">
                  Member Code: {myMemberRecord?.member_code || 'MEM-2026-0001'}
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    STATUS: {myMemberRecord?.status || 'ACTIVE'}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    SYSTEM ROLE: MEMBER
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-xs uppercase font-bold block">Email Address</span>
                <strong className="text-slate-200 font-mono">{currentUser?.email}</strong>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-xs uppercase font-bold block">Membership Tier</span>
                <strong className="text-indigo-400">{myMemberRecord?.membership_type || 'GENERAL MEMBER'}</strong>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-xs uppercase font-bold block">Committee Position</span>
                <strong className="text-emerald-400">{myMemberRecord?.position_title || 'Member'}</strong>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-800">
              <Link to="/idcard">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 border-none font-bold text-xs">
                  🆔 Smart PVC ID Studio
                </Button>
              </Link>
              <Link to="/fees">
                <Button variant="outline" className="text-xs font-bold border-emerald-500 text-emerald-400">
                  💳 View My Fee Payment History
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* AUTHORIZED MANAGER DIRECTORY TABLE */}
      {canManageMembers && (
        <>
          {/* Search & Filter Bar */}
          <Card className="!p-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="w-full md:w-96">
                <Input
                  type="text"
                  placeholder="Search member code, name or email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="text-xs font-semibold text-slate-400 uppercase">Filter Status:</span>
                <select
                  className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-auto"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="PENDING">PENDING</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Members Table */}
          <Card className="!p-0 sm:!p-4 overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No members found. Click "+ Add New Member" to create one.
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs sm:text-sm text-slate-300 min-w-[700px]">
                  <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Member ID</th>
                      <th className="px-4 py-3">Full Name & Contact</th>
                      <th className="px-4 py-3">Type & Tier</th>
                      <th className="px-4 py-3">Position</th>
                      <th className="px-4 py-3">System Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {members.map((m) => {
                      const u = m.user_id;
                      const isOwner = m.is_default_tenant || m.role_id?.name === 'ORG_OWNER' || m.role_id?.name === 'OWNER';
                      const isSelf = currentUser && u && (u._id === currentUser._id || u === currentUser._id || u.email === currentUser.email);
                      const isProtected = isOwner || isSelf;

                      return (
                        <tr key={m._id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3.5 font-mono text-xs font-bold text-indigo-400">
                            {m.member_code}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-slate-100">
                              {u ? `${u.first_name || ''} ${u.last_name || ''}` : 'Member'}
                            </div>
                            <div className="text-xs text-slate-400">{u?.email}</div>
                            {m.phone && <div className="text-[11px] text-slate-500">{m.phone}</div>}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-xs font-semibold text-slate-200 block">{m.membership_type || 'GENERAL'}</span>
                            {m.committee_level !== 'NONE' && (
                              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-800">
                                {m.committee_level}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-slate-200">
                            {m.position_title || 'Member'}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs">
                            <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                              {m.role_id?.name || 'MEMBER'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                              m.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right space-x-2">
                            <button
                              onClick={() => setSelectedMember(m)}
                              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                            >
                              🪪 View Profile
                            </button>
                            <button
                              onClick={() => setEditingMember(m)}
                              className="text-xs text-amber-400 hover:text-amber-300 font-bold"
                            >
                              ✏️ Edit & Role
                            </button>
                            <button
                              onClick={() => setHistoryMemberId(m._id)}
                              className="text-xs text-slate-400 hover:text-slate-200 font-bold"
                            >
                              📜 History
                            </button>
                            {isProtected ? (
                              <span className="text-xs text-slate-500 font-mono italic cursor-not-allowed" title="Protected Account">
                                🛡️ Protected
                              </span>
                            ) : (
                              <button
                                onClick={() => handleDelete(m._id)}
                                className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>
                Page {meta.page} of {meta.totalPages} ({meta.totalDocs} Members)
              </span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <Button variant="secondary" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Modals */}
      <AddMemberModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={loadMembers}
      />

      <EditMemberModal
        isOpen={Boolean(editingMember)}
        onClose={() => setEditingMember(null)}
        member={editingMember}
        onSuccess={loadMembers}
      />

      <MemberHistoryModal
        isOpen={Boolean(historyMemberId)}
        onClose={() => setHistoryMemberId(null)}
        memberId={historyMemberId}
      />

      <MemberProfileModal
        isOpen={Boolean(selectedMember)}
        onClose={() => setSelectedMember(null)}
        member={selectedMember}
      />
    </div>
  );
};
