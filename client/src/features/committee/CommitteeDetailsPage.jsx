import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchCommitteeDetails, removeCommitteeMember, deleteCommittee, fetchCommittees } from '../../services/committee.service';
import useAuthStore from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { AssignMemberModal } from './AssignMemberModal';
import { ArchiveTermModal } from './ArchiveTermModal';
import { CreateCommitteeModal } from './CreateCommitteeModal';

export const CommitteeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, activeOrganization } = useAuthStore();

  const [committee, setCommittee] = useState(null);
  const [members, setMembers] = useState([]);
  const [history, setHistory] = useState([]);
  const [subordinateCommittees, setSubordinateCommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isCreateSubOpen, setIsCreateSubOpen] = useState(false);

  const isSuperAdmin = user?.is_global_superadmin;
  const userRole = String(activeOrganization?.role || activeOrganization?.user_role || user?.role || 'MEMBER').toUpperCase();
  const canManage = isSuperAdmin || ['ORG_OWNER', 'OWNER', 'ADMIN', 'MODERATOR'].includes(userRole);

  const loadDetails = async () => {
    try {
      const [detailRes, allRes] = await Promise.all([
        fetchCommitteeDetails(id),
        fetchCommittees()
      ]);
      setCommittee(detailRes.data.committee);
      setMembers(detailRes.data.members || []);
      setHistory(detailRes.data.history || []);

      const allList = allRes.data || [];
      const children = allList.filter(c => c.parent_committee_id?._id === id || c.parent_committee_id === id);
      setSubordinateCommittees(children);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch committee details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const handleRemoveMember = async (memberAssignmentId) => {
    if (!window.confirm('Remove this member from the committee?')) return;
    try {
      await removeCommitteeMember(id, memberAssignmentId);
      loadDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleDeleteCommittee = async () => {
    if (!window.confirm('Are you sure you want to delete this committee?')) return;
    try {
      await deleteCommittee(id);
      navigate('/committees');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete committee');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !committee) {
    return (
      <div className="min-h-screen bg-slate-950 p-10 flex flex-col items-center justify-center">
        <Alert type="error" className="max-w-md w-full mb-4">{error || 'Committee not found'}</Alert>
        <Link to="/committees"><Button variant="secondary">Back to Committees</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800 font-bold">
                {committee.code || 'BD-CMT'}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-purple-950 text-purple-300 border border-purple-800">
                🛡️ স্তর: {committee.committee_level || committee.committee_type || 'EXECUTIVE'}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                committee.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
              }`}>
                {committee.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">{committee.name}</h1>
            {committee.parent_committee_id && (
              <p className="text-sm text-indigo-400 mt-1">
                🏛️ মূল অভিভাবক পর্ষদ: <Link to={`/committees/${committee.parent_committee_id._id}`} className="underline font-bold">{committee.parent_committee_id.name}</Link>
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link to="/committees">
              <Button variant="secondary" size="sm">কমিটি তালিকা</Button>
            </Link>
            {canManage && (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsArchiveOpen(true)}>
                  আর্কাইভ মেয়াদ
                </Button>
                <Button size="sm" onClick={() => setIsAssignOpen(true)}>
                  + পদবি / সদস্য নিয়োগ
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Hierarchy Governance Alert */}
        <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-xl text-xs text-indigo-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>🛡️</span>
            <span>
              <strong>Hierarchy Governance Enforced:</strong> উপরের কমিটি নিচের কমিটিকে দেখতে পারবে, পরিচালনা ও সদস্য দিতে পারবে।
            </span>
          </div>
        </div>

        {/* Committee Overview Info */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase">বিবরণ (Description)</h3>
              <p className="text-sm text-slate-200 mt-1">{committee.description || 'কোনো বিবরণ সংযুক্ত নেই।'}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase">কার্যনির্বাহী মেয়াদ (Tenure Term)</h3>
              <p className="text-sm text-slate-200 mt-1">
                {committee.term_start_date ? new Date(committee.term_start_date).toLocaleDateString() : 'N/A'} -{' '}
                {committee.term_end_date ? new Date(committee.term_end_date).toLocaleDateString() : 'বর্তমান'}
              </p>
            </div>
            <div className="flex justify-end items-center">
              {canManage && (
                <Button variant="danger" size="sm" onClick={handleDeleteCommittee}>
                  কমিটি বিলুপ্ত / ডিলিট
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* SUBORDINATE CHILD COMMITTEES SECTION */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <span>🌿</span> এই কমিটির অধীনস্থ শাখা ও সাব-কমিটি সমূহ
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">এই কমিটির অভিভাবকত্বে পরিচালিত সকল আঞ্চলিক ও বিশেষ শাখা</p>
            </div>
            {canManage && (
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                onClick={() => setIsCreateSubOpen(true)}
              >
                + এই কমিটির অধীনে সাব-কমিটি গঠন করুন
              </Button>
            )}
          </div>

          {subordinateCommittees.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm bg-slate-950/50 rounded-xl border border-slate-800">
              এই কমিটির অধীনে এখনো কোনো শাখা কমিটি গঠন করা হয়নি। উপরে "+ এই কমিটির অধীনে সাব-কমিটি গঠন করুন" বাটনে ক্লিক করে শাখা যুক্ত করুন।
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subordinateCommittees.map(sub => (
                <div key={sub._id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-all space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {sub.committee_level || sub.committee_type}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {sub.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-100 text-sm mt-2">{sub.name}</h4>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center">
                    <span className="text-xs font-mono text-slate-400">👥 {sub.member_count || 0} সদস্য</span>
                    <Link to={`/committees/${sub._id}`}>
                      <Button size="sm" variant="secondary" className="text-xs !py-1">
                        দেখুন →
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Members & Dynamic Positions Table */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-100">কমিটি নেতৃত্ব & নির্বাহী পর্ষদ সদস্য</h2>
              <p className="text-xs text-slate-400 mt-0.5">পদমর্যাদার ক্রমানুসারে তালিকাভুক্ত</p>
            </div>
            <span className="text-xs font-mono bg-slate-800 text-indigo-300 px-3 py-1 rounded-lg border border-slate-700">
              {members.length} টি সক্রিয় পদবি
            </span>
          </div>

          {members.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              এই কমিটিতে এখনো কোনো সদস্য নিয়োগ দেওয়া হয়নি। "+ পদবি / সদস্য নিয়োগ" এ ক্লিক করুন।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">ক্রম</th>
                    <th className="px-4 py-3">পদবি (Position)</th>
                    <th className="px-4 py-3">সদস্যের নাম</th>
                    <th className="px-4 py-3">ইমেইল</th>
                    <th className="px-4 py-3">নিয়োগের তারিখ</th>
                    <th className="px-4 py-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {members.map((m) => (
                    <tr key={m._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs text-indigo-400">#{m.position_order}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-100">{m.position_title}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-200">
                        {m.user_id ? `${m.user_id.first_name} ${m.user_id.last_name}` : 'Unknown User'}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-400">{m.user_id?.email || 'N/A'}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-400">
                        {new Date(m.start_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {canManage && (
                          <button
                            onClick={() => handleRemoveMember(m._id)}
                            className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                          >
                            অব্যাহতি
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Historical Terms & Tenure Logs */}
        <Card>
          <h2 className="text-xl font-bold text-slate-100 mb-4">পূর্ববর্তী মেয়াদের আর্কাইভ হিস্ট্রি</h2>

          {history.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">
              পূর্ববর্তী কোনো মেয়াদের আর্কাইভ লগ পাওয়া যায়নি।
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((h) => (
                <div key={h._id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-indigo-400">{h.term_name}</h3>
                    <span className="text-xs text-slate-500">
                      {h.start_date ? new Date(h.start_date).toLocaleDateString() : 'Start'} - {h.end_date ? new Date(h.end_date).toLocaleDateString() : 'End'}
                    </span>
                  </div>
                  {h.notes && <p className="text-xs text-slate-400 mb-3 italic">"{h.notes}"</p>}
                  <div className="text-xs text-slate-400 font-mono">
                    আর্কাইভ সদস্য ({h.members_snapshot?.length || 0}):
                    <div className="flex flex-wrap gap-2 mt-2">
                      {h.members_snapshot.map((snap, idx) => (
                        <span key={idx} className="bg-slate-900 border border-slate-700 text-slate-300 px-2 py-1 rounded">
                          {snap.position_title}: {snap.user_name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <AssignMemberModal
          isOpen={isAssignOpen}
          onClose={() => setIsAssignOpen(false)}
          committeeId={id}
          onSuccess={loadDetails}
        />

        <ArchiveTermModal
          isOpen={isArchiveOpen}
          onClose={() => setIsArchiveOpen(false)}
          committeeId={id}
          onSuccess={loadDetails}
        />

        <CreateCommitteeModal
          isOpen={isCreateSubOpen}
          initialParentId={id}
          onClose={() => setIsCreateSubOpen(false)}
          onSuccess={loadDetails}
        />
      </div>
    </div>
  );
};
