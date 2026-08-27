import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCommittees } from '../../services/committee.service';
import useAuthStore from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { CreateCommitteeModal } from './CreateCommitteeModal';

export const CommitteeListPage = () => {
  const { user, activeOrganization } = useAuthStore();
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('tree'); // 'tree' | 'grid'
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState('');

  const isSuperAdmin = user?.is_global_superadmin;
  const userRole = String(activeOrganization?.role || activeOrganization?.user_role || user?.role || 'MEMBER').toUpperCase();
  const canManageCommittees = isSuperAdmin || ['ORG_OWNER', 'OWNER', 'ADMIN', 'MODERATOR'].includes(userRole);

  const loadCommittees = async () => {
    setLoading(true);
    try {
      const res = await fetchCommittees(filterStatus);
      setCommittees(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommittees();
  }, [filterStatus]);

  const handleOpenCreateModal = (parentId = '') => {
    setSelectedParentId(parentId);
    setIsModalOpen(true);
  };

  const getCommitteeTypeBadge = (type) => {
    const badgeMap = {
      NATIONAL: '🇧🇩 জাতীয় / কেন্দ্রীয় কমিটি',
      CENTRAL: '🇧🇩 কেন্দ্রীয় কার্যনির্বাহী পর্ষদ',
      DIVISION: '🏢 বিভাগীয় কমিটি',
      DISTRICT: '📍 জেলা কমিটি',
      CITY_CORPORATION: '🏙️ সিটি কর্পোরেশন কমিটি',
      UPAZILA: '🏛️ উপজেলা কমিটি',
      UNION: '🚩 ইউনিয়ন পরিষদ কমিটি',
      CITY_CORPORATION_WARD: '🔢 সিটি কর্পোরেশন ওয়ার্ড কমিটি',
      WARD: '🏡 ইউনিয়ন ওয়ার্ড / গ্রাম কমিটি',
      VILLAGE: '🏡 গ্রাম কমিটি',
      SCHOOL: '🏫 বিদ্যালয় কমিটি',
      COLLEGE: '🎓 কলেজ কমিটি',
      MOSQUE: '🕌 মসজিদ কমিটি',
      MARKET: '🏬 মার্কেট / বণিক সমিতি',
      WOMEN: '👩 মহিলা উইং',
      YOUTH: '⚡ যুব উইং',
      SPECIALIZED: '⚡ বিশেষ উপকমিটি',
      SUB: '📑 সাব-কমিটি'
    };
    return badgeMap[type] || type || 'কমিটি';
  };

  const getTierColor = (level) => {
    switch (level) {
      case 'NATIONAL':
      case 'CENTRAL':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'DIVISION':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'DISTRICT':
        return 'bg-indigo-950 text-indigo-300 border-indigo-800';
      case 'CITY_CORPORATION':
        return 'bg-cyan-950 text-cyan-300 border-cyan-800';
      case 'UPAZILA':
        return 'bg-teal-950 text-teal-300 border-teal-800';
      case 'UNION':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'CITY_CORPORATION_WARD':
      case 'WARD':
      case 'VILLAGE':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  // Build hierarchy tree
  const rootCommittees = committees.filter(c => !c.parent_committee_id);
  const getChildCommittees = (parentId) => committees.filter(c => c.parent_committee_id?._id === parentId);

  const filteredCommittees = committees.filter(c => {
    const matchesLevel = !filterLevel || c.committee_level === filterLevel || c.committee_type === filterLevel;
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.code && c.code.toLowerCase().includes(search.toLowerCase()));
    return matchesLevel && matchesSearch;
  });

  const renderTreeNode = (committee, depth = 0) => {
    const children = getChildCommittees(committee._id);
    const tier = committee.committee_level || committee.committee_type || 'CENTRAL';

    return (
      <div key={committee._id} className="space-y-3">
        <div
          className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border transition-all ${
            depth === 0
              ? 'bg-slate-900/90 border-indigo-500/40 shadow-lg shadow-indigo-950/20'
              : depth === 1
              ? 'bg-slate-900/60 border-slate-700 ml-4 md:ml-6'
              : depth === 2
              ? 'bg-slate-900/40 border-slate-800 ml-8 md:ml-12'
              : 'bg-slate-950/60 border-slate-800/80 ml-12 md:ml-16'
          }`}
        >
          <div className="flex items-start md:items-center gap-3">
            <span className="text-xl">
              {depth === 0 ? '👑' : depth === 1 ? '🏢' : depth === 2 ? '📍' : depth === 3 ? '🏛️' : '🚩'}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getTierColor(tier)}`}>
                  {getCommitteeTypeBadge(tier)}
                </span>
                <span className="text-xs font-mono text-indigo-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {committee.code || 'CMT-CODE'}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {committee.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100 mt-1">{committee.name}</h3>
              {committee.description && (
                <p className="text-xs text-slate-400 line-clamp-1">{committee.description}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
            <span className="text-xs text-slate-300 font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              👥 <strong>{committee.member_count || 0}</strong> সদস্য
            </span>
            <span className="text-xs text-emerald-400 font-mono bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800/60">
              🌿 <strong>{children.length}</strong> টি শাখা কমিটি
            </span>

            {canManageCommittees && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-indigo-500 text-indigo-300 hover:bg-indigo-950/40"
                onClick={() => handleOpenCreateModal(committee._id)}
              >
                + নতুন সাব-কমিটি গঠন
              </Button>
            )}

            <Link to={`/committees/${committee._id}`}>
              <Button size="sm" variant="secondary" className="text-xs">
                বিস্তারিত ও সদস্য তালিকা →
              </Button>
            </Link>
          </div>
        </div>

        {/* Recursive Children Sub-Tree */}
        {children.length > 0 && (
          <div className="space-y-2 border-l-2 border-dashed border-indigo-500/20 pl-2 md:pl-4">
            {children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                🏛️ Multi-Tier Committee Governance
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">কমিটি হায়ারার্কি & স্তরভিত্তিক সাংগঠনিক পর্ষদ</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              কেন্দ্রীয়, বিভাগ, জেলা, উপজেলা, ইউনিয়ন, ওয়ার্ড ও সিটি কর্পোরেশন স্তরভিত্তিক প্রশাসনিক চেইন
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/dashboard">
              <Button variant="secondary" size="sm">Dashboard</Button>
            </Link>
            {canManageCommittees && (
              <Button size="sm" onClick={() => handleOpenCreateModal('')}>
                + নতুন কমিটি গঠন
              </Button>
            )}
          </div>
        </div>

        {/* Control Bar: View Switcher & Filters */}
        <Card className="!p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('tree')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'tree' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🌳 হায়ারার্কি ট্রি ভিউ (Tree View)
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📋 গ্রিড তালিকা (Grid Cards)
              </button>
            </div>

            {/* Tier & Search Filters */}
            <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl justify-end">
              <Input
                placeholder="কমিটির নাম বা কোড দিয়ে খুঁজুন..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="!py-1.5 !text-xs max-w-xs"
              />
              <select
                className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-2 focus:outline-none"
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
              >
                <option value="">সকল স্তর (All Tiers)</option>
                <option value="CENTRAL">কেন্দ্রীয় পর্ষদ (Central)</option>
                <option value="DIVISION">বিভাগীয় কমিটি (Division)</option>
                <option value="DISTRICT">জেলা কমিটি (District)</option>
                <option value="CITY_CORPORATION">সিটি কর্পোরেশন (City Corp)</option>
                <option value="UPAZILA">উপজেলা কমিটি (Upazila)</option>
                <option value="UNION">ইউনিয়ন কমিটি (Union)</option>
                <option value="CITY_CORPORATION_WARD">সিটি কর্পোরেশন ওয়ার্ড</option>
                <option value="WARD">ইউনিয়ন ওয়ার্ড / গ্রাম (Ward)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Committee Tree / Grid Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : committees.length === 0 ? (
          <Card className="text-center py-12 space-y-3">
            <p className="text-slate-400 text-sm">কোনো সাংগঠনিক কমিটি এখনো গঠন করা হয়নি।</p>
            {canManageCommittees && (
              <Button size="sm" onClick={() => handleOpenCreateModal('')}>
                + প্রথম কেন্দ্রীয় বা প্রধান কমিটি গঠন করুন
              </Button>
            )}
          </Card>
        ) : viewMode === 'tree' ? (
          /* Tree Hierarchy View */
          <div className="space-y-4">
            <div className="text-xs font-mono text-indigo-300">
              📊 মোট {committees.length} টি কমিটি সক্রিয়ভাবে চেইন সিস্টেমে সংযুক্ত রয়েছে
            </div>
            {rootCommittees.length === 0 ? (
              <div className="space-y-3">
                {committees.map(c => renderTreeNode(c, 0))}
              </div>
            ) : (
              rootCommittees.map(root => renderTreeNode(root, 0))
            )}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommittees.map((committee) => {
              const tier = committee.committee_level || committee.committee_type || 'CENTRAL';
              return (
                <Card key={committee._id} className="flex flex-col justify-between hover:border-indigo-500/50 transition-all !p-5 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold uppercase">
                        {committee.code || 'BD-CMT'}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {committee.status}
                      </span>
                    </div>

                    <span className={`inline-block text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${getTierColor(tier)}`}>
                      {getCommitteeTypeBadge(tier)}
                    </span>

                    <div>
                      <h3 className="text-lg font-bold text-slate-100">{committee.name}</h3>
                      {committee.description && (
                        <p className="text-slate-400 text-xs mt-1 line-clamp-2">{committee.description}</p>
                      )}
                    </div>

                    {committee.parent_committee_id && (
                      <div className="text-xs text-slate-400 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                        <span>মূল অভিভাবক পর্ষদ:</span>
                        <span className="text-indigo-400 font-bold">{committee.parent_committee_id.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                      <span>👥 {committee.member_count || 0} জন সদস্য</span>
                      <span>🌿 {committee.subordinate_count || 0} টি অধীনস্থ শাখা</span>
                    </div>

                    <div className="flex gap-2 pt-1">
                      {canManageCommittees && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs border-indigo-500 text-indigo-300"
                          onClick={() => handleOpenCreateModal(committee._id)}
                        >
                          + সাব-কমিটি
                        </Button>
                      )}
                      <Link to={`/committees/${committee._id}`} className="flex-1">
                        <Button variant="secondary" size="sm" className="w-full text-xs font-bold">
                          বিস্তারিত →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <CreateCommitteeModal
          isOpen={isModalOpen}
          initialParentId={selectedParentId}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedParentId('');
          }}
          onSuccess={loadCommittees}
        />
      </div>
    </div>
  );
};
