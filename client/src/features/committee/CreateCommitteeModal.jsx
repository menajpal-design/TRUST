import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { createCommittee, fetchCommittees } from '../../services/committee.service';
import { UnionDeskGeoSelector } from '../../components/UnionDeskGeoSelector';

export const CreateCommitteeModal = ({ isOpen, onClose, onSuccess, initialParentId = '' }) => {
  if (!isOpen) return null;

  const [parentCommittees, setParentCommittees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    committee_level: 'CENTRAL',
    committee_type: 'EXECUTIVE',
    parent_committee_id: initialParentId || '',
    duration_years: 2,
    term_start_date: new Date().toISOString().split('T')[0],
    term_end_date: '',
    status: 'ACTIVE',
    description: '',
    geo_location: {
      division: '',
      district: '',
      upazila: '',
      municipality_city_corp: '',
      union_name: '',
      ward_no: '',
      village: '',
      mohalla: '',
      custom_area: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCommittees()
      .then((res) => {
        const list = res.data || [];
        setParentCommittees(list);
        if (initialParentId) {
          const parent = list.find(p => p._id === initialParentId);
          if (parent) {
            const pLevel = parent.committee_level || parent.committee_type || 'CENTRAL';
            const defaultChild = getRecommendedChildLevel(pLevel);
            setFormData(prev => ({
              ...prev,
              parent_committee_id: initialParentId,
              committee_level: defaultChild,
              committee_type: defaultChild
            }));
          }
        }
      })
      .catch(console.error);
  }, [initialParentId]);

  const getRecommendedChildLevel = (parentLevel) => {
    switch (parentLevel) {
      case 'CENTRAL':
      case 'NATIONAL':
      case 'EXECUTIVE':
        return 'DIVISION';
      case 'DIVISION':
        return 'DISTRICT';
      case 'DISTRICT':
        return 'UPAZILA';
      case 'CITY_CORPORATION':
        return 'CITY_CORPORATION_WARD';
      case 'UPAZILA':
        return 'UNION';
      case 'UNION':
        return 'WARD';
      default:
        return 'SUB';
    }
  };

  const getAvailableLevelsForParent = (parentId) => {
    if (!parentId) {
      return [
        { value: 'CENTRAL', label: '🇧🇩 কেন্দ্রীয় কমিটি (Central / National)' },
        { value: 'DIVISION', label: '🏢 বিভাগীয় কমিটি (Division)' },
        { value: 'DISTRICT', label: '📍 জেলা কমিটি (District)' },
        { value: 'CITY_CORPORATION', label: '🏙️ সিটি কর্পোরেশন কমিটি (City Corporation)' },
        { value: 'UPAZILA', label: '🏛️ উপজেলা কমিটি (Upazila)' },
        { value: 'UNION', label: '🚩 ইউনিয়ন পরিষদ কমিটি (Union Parishad)' },
        { value: 'CITY_CORPORATION_WARD', label: '🔢 সিটি কর্পোরেশন ওয়ার্ড (City Corp Ward)' },
        { value: 'WARD', label: '🏡 ইউনিয়ন ওয়ার্ড / গ্রাম (Union Ward / Village)' },
        { value: 'SPECIALIZED', label: '⚡ বিশেষ / উপকমিটি (Specialized / Sub)' }
      ];
    }

    const parent = parentCommittees.find(p => p._id === parentId);
    const pLevel = parent?.committee_level || parent?.committee_type || 'CENTRAL';

    const childMap = {
      CENTRAL: [
        { value: 'DIVISION', label: '🏢 বিভাগীয় কমিটি (Division)' },
        { value: 'DISTRICT', label: '📍 জেলা কমিটি (District)' },
        { value: 'CITY_CORPORATION', label: '🏙️ সিটি কর্পোরেশন কমিটি (City Corporation)' },
        { value: 'UPAZILA', label: '🏛️ উপজেলা কমিটি (Upazila)' },
        { value: 'UNION', label: '🚩 ইউনিয়ন পরিষদ কমিটি (Union)' },
        { value: 'CITY_CORPORATION_WARD', label: '🔢 সিটি কর্পোরেশন ওয়ার্ড (City Corp Ward)' },
        { value: 'WARD', label: '🏡 ইউনিয়ন ওয়ার্ড (Ward)' },
        { value: 'SPECIALIZED', label: '⚡ বিশেষ উপকমিটি (Specialized / Sub)' }
      ],
      NATIONAL: [
        { value: 'DIVISION', label: '🏢 বিভাগীয় কমিটি (Division)' },
        { value: 'DISTRICT', label: '📍 জেলা কমিটি (District)' },
        { value: 'CITY_CORPORATION', label: '🏙️ সিটি কর্পোরেশন কমিটি (City Corporation)' },
        { value: 'UPAZILA', label: '🏛️ উপজেলা কমিটি (Upazila)' },
        { value: 'UNION', label: '🚩 ইউনিয়ন পরিষদ কমিটি (Union)' },
        { value: 'SPECIALIZED', label: '⚡ বিশেষ উপকমিটি (Specialized / Sub)' }
      ],
      DIVISION: [
        { value: 'DISTRICT', label: '📍 জেলা কমিটি (District Committee)' },
        { value: 'CITY_CORPORATION', label: '🏙️ সিটি কর্পোরেশন কমিটি (City Corporation)' },
        { value: 'UPAZILA', label: '🏛️ উপজেলা কমিটি (Upazila Committee)' },
        { value: 'UNION', label: '🚩 ইউনিয়ন কমিটি (Union Committee)' },
        { value: 'SPECIALIZED', label: '⚡ বিভাগীয় উপকমিটি (Division Sub-Committee)' }
      ],
      DISTRICT: [
        { value: 'UPAZILA', label: '🏛️ উপজেলা কমিটি (Upazila Committee)' },
        { value: 'CITY_CORPORATION', label: '🏙️ সিটি কর্পোরেশন কমিটি (City Corporation)' },
        { value: 'UNION', label: '🚩 ইউনিয়ন কমিটি (Union Committee)' },
        { value: 'SPECIALIZED', label: '⚡ জেলা উপকমিটি (District Sub-Committee)' }
      ],
      CITY_CORPORATION: [
        { value: 'CITY_CORPORATION_WARD', label: '🔢 সিটি কর্পোরেশন ওয়ার্ড কমিটি (City Corp Ward)' },
        { value: 'WARD', label: '🔢 ওয়ার্ড কমিটি (Ward Committee)' },
        { value: 'SPECIALIZED', label: '⚡ কর্পোরেশন উপকমিটি (Sub-Committee)' }
      ],
      UPAZILA: [
        { value: 'UNION', label: '🚩 ইউনিয়ন পরিষদ কমিটি (Union Parishad Committee)' },
        { value: 'WARD', label: '🔢 পৌরসভা / উপজেলা ওয়ার্ড (Municipality Ward)' },
        { value: 'SPECIALIZED', label: '⚡ উপজেলা উপকমিটি (Upazila Sub-Committee)' }
      ],
      UNION: [
        { value: 'WARD', label: '🏡 ইউনিয়ন ওয়ার্ড কমিটি (Union Ward Committee)' },
        { value: 'VILLAGE', label: '🏡 গ্রাম কমিটি (Village Committee)' },
        { value: 'SPECIALIZED', label: '⚡ ইউনিয়ন উপকমিটি (Union Sub-Committee)' }
      ],
      CITY_CORPORATION_WARD: [
        { value: 'SPECIALIZED', label: '⚡ ওয়ার্ড উপকমিটি (Ward Sub-Committee)' }
      ],
      WARD: [
        { value: 'VILLAGE', label: '🏡 গ্রাম কমিটি (Village Committee)' },
        { value: 'SPECIALIZED', label: '⚡ ওয়ার্ড উপকমিটি (Ward Sub-Committee)' }
      ]
    };

    return childMap[pLevel] || [{ value: 'SPECIALIZED', label: '⚡ উপকমিটি (Sub-Committee)' }];
  };

  const handleParentChange = (e) => {
    const parentId = e.target.value;
    const available = getAvailableLevelsForParent(parentId);
    setFormData(prev => ({
      ...prev,
      parent_committee_id: parentId,
      committee_level: available[0]?.value || 'CENTRAL',
      committee_type: available[0]?.value || 'EXECUTIVE'
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'committee_level') {
      setFormData({ ...formData, committee_level: value, committee_type: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      parent_committee_id: formData.parent_committee_id || null,
      duration_years: parseInt(formData.duration_years, 10) || 2
    };

    try {
      await createCommittee(payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create committee');
    } finally {
      setLoading(false);
    }
  };

  const availableLevels = getAvailableLevelsForParent(formData.parent_committee_id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl my-8">
        <Card className="max-h-[90vh] overflow-y-auto pr-2">
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900/90 py-2 backdrop-blur-sm z-10 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-100">🌿 নতুন সাংগঠনিক কমিটি গঠন করুন</h2>
              <p className="text-xs text-slate-400">জাতীয়, বিভাগ, জেলা, উপজেলা, ইউনিয়ন, ওয়ার্ড ও সিটি কর্পোরেশন স্তরভিত্তিক কমিটি</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-lg font-bold">
              ✕
            </button>
          </div>

          {error && <Alert type="error" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Basic Information */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">কমিটি পরিচয় ও স্তর নির্ধারণ</h3>
              
              <div>
                <Label>অভিভাবক / মূল কমিটি (Parent Hierarchy)</Label>
                <select
                  name="parent_committee_id"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-indigo-500/50 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                  value={formData.parent_committee_id}
                  onChange={handleParentChange}
                >
                  <option value="">🚫 কোনোটি নয় (শীর্ষ জাতীয় / কেন্দ্রীয় কমিটি)</option>
                  {parentCommittees.map((c) => (
                    <option key={c._id} value={c._id}>
                      🏛️ {c.name} [{c.committee_level || c.committee_type}]
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-indigo-300 mt-1 block">
                  💡 প্যারেন্ট কমিটি সিলেক্ট করলে স্বয়ংক্রিয়ভাবে তার অধীনস্থ অনুমোদিত স্তরগুলো ফিল্টার হবে।
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>কমিটির স্তর (Committee Hierarchy Tier)</Label>
                  <select
                    name="committee_level"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                    value={formData.committee_level}
                    onChange={handleChange}
                  >
                    {availableLevels.map((lvl) => (
                      <option key={lvl.value} value={lvl.value}>
                        {lvl.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>কমিটির ধরন (Category / Type)</Label>
                  <select
                    name="committee_type"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={formData.committee_type}
                    onChange={handleChange}
                  >
                    <option value={formData.committee_level}>মূল নির্বাহী পর্ষদ ({formData.committee_level})</option>
                    <option value="WOMEN">👩 মহিলা উইং / কমিটি</option>
                    <option value="YOUTH">⚡ যুব উইং / তরুণ পরিষদ</option>
                    <option value="MARKET">🏬 ব্যবসায়ী সমিতি / মার্কেট কমিটি</option>
                    <option value="MOSQUE">🕌 মসজিদ পরিচালনা কমিটি</option>
                    <option value="SCHOOL">🏫 স্কুল পরিচালনা কমিটি</option>
                    <option value="COLLEGE">🎓 কলেজ পরিচালনা কমিটি</option>
                    <option value="SUB">📑 বিশেষ উপকমিটি (Sub-Committee)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>কমিটির নাম (Committee Name)</Label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="যেমন: ফরিদপুর জেলা কার্যকরী পরিষদ"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label>কমিটি কোড (Code)</Label>
                  <Input
                    type="text"
                    name="code"
                    placeholder="যেমন: FAR-DIST-2026"
                    value={formData.code}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Bangladesh 9-Tier Geo Location */}
            <UnionDeskGeoSelector
              value={formData.geo_location}
              onChange={(geo) => setFormData({ ...formData, geo_location: geo })}
            />

            {/* Section 3: Duration, Term Dates & Status */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Duration & Tenure Term</h3>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Committee Duration (Years)</Label>
                  <Input
                    type="number"
                    name="duration_years"
                    value={formData.duration_years}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label>Term Start Date</Label>
                  <Input
                    type="date"
                    name="term_start_date"
                    value={formData.term_start_date}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label>Term End Date</Label>
                  <Input
                    type="date"
                    name="term_end_date"
                    value={formData.term_end_date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <Label>Committee Status</Label>
                <select
                  name="status"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="DISSOLVED">DISSOLVED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={loading}>
                Create Committee
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
