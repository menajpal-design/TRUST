import React, { useEffect, useState } from 'react';
import {
  fetchDivisions,
  fetchDistricts,
  fetchUpazilas,
  syncBDGeoData,
  importGeoExcel,
  exportGeoExcel
} from '../../services/geo.service';
import { MainLayout } from '../../components/MainLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const LocationManagementPage = () => {
  const [divisions, setDivisions] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState('Dhaka');
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('Dhaka');
  const [upazilas, setUpazilas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchDivisions().then(res => setDivisions(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedDivision) {
      fetchDistricts(selectedDivision).then(res => {
        setDistricts(res.data);
        if (res.data.length > 0) setSelectedDistrict(res.data[0]);
      }).catch(console.error);
    }
  }, [selectedDivision]);

  useEffect(() => {
    if (selectedDistrict) {
      setLoading(true);
      fetchUpazilas(selectedDistrict).then(res => setUpazilas(res.data)).catch(console.error).finally(() => setLoading(false));
    }
  }, [selectedDistrict]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await syncBDGeoData();
      alert(res.message);
    } catch (e) {
      alert('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    try {
      const res = await importGeoExcel(file);
      alert(res.message);
    } catch (e) {
      alert(e.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">UnionDesk 🇧🇩 Location Management</h1>
            <p className="text-slate-400 mt-1">Division, District, Upazila, Union, Ward & Village administrative hierarchy management</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleSync} isLoading={syncing}>
              🔄 Sync BD Geo Data
            </Button>
            <label className="cursor-pointer">
              <span className="inline-flex items-center px-4 py-2 bg-slate-900 border border-slate-700 text-sm font-semibold rounded-lg text-slate-200 hover:bg-slate-800 transition-colors">
                {importing ? 'Importing...' : '📥 Import Excel'}
              </span>
              <input type="file" accept=".xlsx" className="hidden" onChange={handleImport} disabled={importing} />
            </label>
            <Button onClick={() => exportGeoExcel()}>
              📤 Export Excel
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <Card className="!p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Select Division (8):</span>
              <select
                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
              >
                {divisions.map((d) => (
                  <option key={d} value={d}>{d} Division</option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Select District (64):</span>
              <select
                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
              >
                {districts.map((dst) => (
                  <option key={dst} value={dst}>{dst} District</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Location Units Table */}
        <Card>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Division</th>
                    <th className="px-4 py-3">District</th>
                    <th className="px-4 py-3">Upazila</th>
                    <th className="px-4 py-3">Union</th>
                    <th className="px-4 py-3">Ward</th>
                    <th className="px-4 py-3">Village</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {upazilas.map((u, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3.5 font-bold text-slate-100">{selectedDivision}</td>
                      <td className="px-4 py-3.5 text-indigo-400 font-semibold">{selectedDistrict}</td>
                      <td className="px-4 py-3.5 font-bold text-emerald-400">{u}</td>
                      <td className="px-4 py-3.5 text-slate-300">Sample Union</td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-400">Ward 01</td>
                      <td className="px-4 py-3.5 text-slate-400">Sample Village</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};
