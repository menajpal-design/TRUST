import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { createCommittee, fetchCommittees } from '../../services/committee.service';
import { UnionDeskGeoSelector } from '../../components/UnionDeskGeoSelector';

export const CreateCommitteeModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const [parentCommittees, setParentCommittees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    committee_level: 'CENTRAL',
    committee_type: 'EXECUTIVE',
    parent_committee_id: '',
    duration_years: 2,
    term_start_date: new Date().toISOString().split('T')[0],
    term_end_date: '',
    status: 'ACTIVE',
    description: '',
    geo_location: {
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Savar',
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
      .then((res) => setParentCommittees(res.data))
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl my-8">
        <Card className="max-h-[90vh] overflow-y-auto pr-2">
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900/90 py-2 backdrop-blur-sm z-10 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Create UnionDesk 🇧🇩 Committee</h2>
              <p className="text-xs text-slate-400">Configure hierarchy, Bangladesh geo-locations, duration & term dates</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-lg font-bold">
              ✕
            </button>
          </div>

          {error && <Alert type="error" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Basic Information */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Committee Identity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Committee Name</Label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="e.g. Faridpur District Committee"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label>Committee Code</Label>
                  <Input
                    type="text"
                    name="code"
                    placeholder="e.g. FAR-DIST"
                    value={formData.code}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Committee Level</Label>
                  <select
                    name="committee_level"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.committee_level}
                    onChange={handleChange}
                  >
                    <option value="CENTRAL">Central Level</option>
                    <option value="DIVISION">Division Level</option>
                    <option value="DISTRICT">District Level</option>
                    <option value="UPAZILA">Upazila Level</option>
                    <option value="UNION">Union Level</option>
                    <option value="WARD">Ward Level</option>
                    <option value="VILLAGE">Village Level</option>
                    <option value="SPECIALIZED">Specialized Tier</option>
                  </select>
                </div>

                <div>
                  <Label>Committee Type</Label>
                  <select
                    name="committee_type"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.committee_type}
                    onChange={handleChange}
                  >
                    <option value="NATIONAL">🇧🇩 National Committee</option>
                    <option value="DIVISION">🏢 Division Committee</option>
                    <option value="DISTRICT">📍 District Committee</option>
                    <option value="UPAZILA">🏛️ Upazila Committee</option>
                    <option value="UNION">🚩 Union Committee</option>
                    <option value="WARD">🔢 Ward Committee</option>
                    <option value="VILLAGE">🏡 Village Committee</option>
                    <option value="SCHOOL">🏫 School Committee</option>
                    <option value="COLLEGE">🎓 College Committee</option>
                    <option value="MOSQUE">🕌 Mosque Committee</option>
                    <option value="MARKET">🏬 Market Committee</option>
                    <option value="WOMEN">👩 Women's Committee</option>
                    <option value="YOUTH">⚡ Youth Committee</option>
                    <option value="EXECUTIVE">Executive Board</option>
                    <option value="SUB">Sub-Committee</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Parent Committee (Hierarchy)</Label>
                <select
                  name="parent_committee_id"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.parent_committee_id}
                  onChange={handleChange}
                >
                  <option value="">None (Top-Level Parent)</option>
                  {parentCommittees.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.code || 'BD-CMT'})
                    </option>
                  ))}
                </select>
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
