import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCommittees, seedBDCommittees } from '../../services/committee.service';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CreateCommitteeModal } from './CreateCommitteeModal';

export const CommitteeListPage = () => {
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadCommittees = async () => {
    try {
      const res = await fetchCommittees(filterStatus);
      setCommittees(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommittees();
  }, [filterStatus]);

  const handleSeedBD = async () => {
    try {
      const res = await seedBDCommittees();
      alert(res.message);
      loadCommittees();
    } catch (err) {
      alert(err.response?.data?.message || 'Seeding failed');
    }
  };

  const getCommitteeTypeBadge = (type) => {
    const badgeMap = {
      NATIONAL: '🇧🇩 National Committee',
      DIVISION: '🏢 Division Committee',
      DISTRICT: '📍 District Committee',
      UPAZILA: '🏛️ Upazila Committee',
      UNION: '🚩 Union Committee',
      WARD: '🔢 Ward Committee',
      VILLAGE: '🏡 Village Committee',
      SCHOOL: '🏫 School Committee',
      COLLEGE: '🎓 College Committee',
      MOSQUE: '🕌 Mosque Committee',
      MARKET: '🏬 Market Committee',
      WOMEN: '👩 Women\'s Committee',
      YOUTH: '⚡ Youth Committee'
    };
    return badgeMap[type] || type || 'Committee';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">UnionDesk 🇧🇩 Committee Hierarchy</h1>
            <p className="text-slate-400 mt-1">National, Division, District, Upazila, Union, Ward, Village & Specialized Committees</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/dashboard">
              <Button variant="secondary">Dashboard</Button>
            </Link>
            <Button variant="outline" onClick={handleSeedBD}>
              🇧🇩 Seed BD 13-Tier Hierarchy
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              + Create Committee
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Status Filter:</span>
            <select
              className="bg-slate-950 border border-slate-700 text-sm text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="DISSOLVED">Dissolved</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        {/* Grid Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : committees.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-slate-400 text-sm">No committees found. Click "🇧🇩 Seed BD 13-Tier Hierarchy" or "+ Create Committee".</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {committees.map((committee) => (
              <Card key={committee._id} className="flex flex-col justify-between hover:border-indigo-500/50 transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold uppercase">
                      {committee.code || 'BD-CMT'}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {committee.status}
                    </span>
                  </div>

                  <span className="inline-block text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                    {getCommitteeTypeBadge(committee.committee_type)}
                  </span>

                  <div>
                    <h3 className="text-xl font-bold text-slate-100">{committee.name}</h3>
                    {committee.description && (
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2">{committee.description}</p>
                    )}
                  </div>

                  {committee.parent_committee_id && (
                    <div className="text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                      <span>Parent Tier: </span>
                      <span className="text-indigo-400 font-medium">{committee.parent_committee_id.name}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="font-bold text-slate-200">{committee.member_count}</span> Members Assigned
                  </div>
                  <Link to={`/committees/${committee._id}`}>
                    <Button variant="secondary" size="sm">
                      View Details →
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        <CreateCommitteeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadCommittees}
        />
      </div>
    </div>
  );
};
