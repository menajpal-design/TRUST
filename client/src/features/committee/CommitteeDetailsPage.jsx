import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchCommitteeDetails, removeCommitteeMember, deleteCommittee } from '../../services/committee.service';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { AssignMemberModal } from './AssignMemberModal';
import { ArchiveTermModal } from './ArchiveTermModal';

export const CommitteeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [committee, setCommittee] = useState(null);
  const [members, setMembers] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  const loadDetails = async () => {
    try {
      const res = await fetchCommitteeDetails(id);
      setCommittee(res.data.committee);
      setMembers(res.data.members);
      setHistory(res.data.history);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                {committee.code || 'MAIN'}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                committee.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
              }`}>
                {committee.status}
              </span>
            </div>
            <h1 className="text-3xl font-bold">{committee.name}</h1>
            {committee.parent_committee_id && (
              <p className="text-sm text-indigo-400 mt-1">
                Parent Committee: <Link to={`/committees/${committee.parent_committee_id._id}`} className="underline">{committee.parent_committee_id.name}</Link>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link to="/committees">
              <Button variant="secondary">Back to List</Button>
            </Link>
            <Button variant="outline" onClick={() => setIsArchiveOpen(true)}>
              Archive Term
            </Button>
            <Button onClick={() => setIsAssignOpen(true)}>
              + Assign Member
            </Button>
          </div>
        </div>

        {/* Committee Overview Info */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase">Description</h3>
              <p className="text-sm text-slate-200 mt-1">{committee.description || 'No description added.'}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase">Active Term</h3>
              <p className="text-sm text-slate-200 mt-1">
                {committee.term_start_date ? new Date(committee.term_start_date).toLocaleDateString() : 'N/A'} -{' '}
                {committee.term_end_date ? new Date(committee.term_end_date).toLocaleDateString() : 'Present'}
              </p>
            </div>
            <div className="flex justify-end items-center">
              <Button variant="danger" size="sm" onClick={handleDeleteCommittee}>
                Delete Committee
              </Button>
            </div>
          </div>
        </Card>

        {/* Members & Dynamic Positions Table */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Committee Leadership & Positions</h2>
              <p className="text-xs text-slate-400 mt-0.5">Sorted by dynamic position hierarchy order</p>
            </div>
            <span className="text-xs font-mono bg-slate-800 text-indigo-300 px-3 py-1 rounded-lg border border-slate-700">
              {members.length} Active Positions
            </span>
          </div>

          {members.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No members assigned to this committee yet. Click "+ Assign Member" to add positions.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Position Title</th>
                    <th className="px-4 py-3">Member Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Assigned Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
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
                        <button
                          onClick={() => handleRemoveMember(m._id)}
                          className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                        >
                          Remove
                        </button>
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
          <h2 className="text-xl font-bold text-slate-100 mb-4">Historical Committee Terms</h2>

          {history.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">
              No historical terms recorded yet. Use "Archive Term" to snapshot past committee leaderships.
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
                    Archived Members ({h.members_snapshot?.length || 0}):
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
      </div>
    </div>
  );
};
