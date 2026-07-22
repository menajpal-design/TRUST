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

export const MemberListPage = () => {
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
      setMembers(res.data);
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Organization Member Directory</h1>
            <p className="text-slate-400 mt-1">Personal details, Membership types, Committee tiers, System roles & Digital QR Cards</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/dashboard">
              <Button variant="secondary">Dashboard</Button>
            </Link>
            <label className="cursor-pointer">
              <span className="inline-flex items-center px-4 py-2 bg-slate-900 border border-slate-700 text-sm font-semibold rounded-lg text-slate-200 hover:bg-slate-800 transition-colors">
                {importing ? 'Importing...' : '📥 Import Excel'}
              </span>
              <input type="file" accept=".xlsx" className="hidden" onChange={handleImportExcel} disabled={importing} />
            </label>
            <Button variant="outline" onClick={handleExportExcel}>
              📤 Export Excel
            </Button>
            <Button onClick={() => setIsAddOpen(true)}>
              + Add New Member
            </Button>
          </div>
        </div>

        {/* Filter Controls */}
        <Card className="!p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-96">
              <Input
                type="text"
                placeholder="Search member name, code, phone or position..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-xs text-slate-400 font-semibold uppercase">Status Filter:</span>
              <select
                className="bg-slate-900 border border-slate-700 text-sm text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING">PENDING</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Members Table */}
        <Card>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No members found. Click "+ Add New Member" to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
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
                    return (
                      <tr key={m._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-xs font-bold text-indigo-400">
                          {m.member_code}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-100">
                            {u ? `${u.first_name} ${u.last_name}` : 'Member'}
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
                        <td className="px-4 py-3.5 font-mono text-xs text-slate-300">
                          {m.role_id?.name || 'MEMBER'}
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
                            🪪 QR
                          </button>
                          <button
                            onClick={() => setEditingMember(m)}
                            className="text-xs text-amber-400 hover:text-amber-300 font-bold"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => setHistoryMemberId(m._id)}
                            className="text-xs text-slate-400 hover:text-slate-200 font-bold"
                          >
                            📜 History
                          </button>
                          <button
                            onClick={() => handleDelete(m._id)}
                            className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                          >
                            Delete
                          </button>
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
    </div>
  );
};
