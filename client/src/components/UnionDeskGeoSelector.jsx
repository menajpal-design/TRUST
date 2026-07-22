import React, { useEffect, useState } from 'react';
import { fetchDivisions, fetchDistricts, fetchUpazilas } from '../services/geo.service';
import { Label } from './ui/Label';
import { Input } from './ui/Input';

export const UnionDeskGeoSelector = ({ value = {}, onChange }) => {
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);

  const [geoData, setGeoData] = useState({
    division: value.division || 'Dhaka',
    district: value.district || 'Dhaka',
    upazila: value.upazila || 'Savar',
    municipality_city_corp: value.municipality_city_corp || '',
    union_name: value.union_name || '',
    ward_no: value.ward_no || '',
    village: value.village || '',
    mohalla: value.mohalla || '',
    custom_area: value.custom_area || ''
  });

  useEffect(() => {
    fetchDivisions().then(res => setDivisions(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (geoData.division) {
      fetchDistricts(geoData.division).then(res => setDistricts(res.data)).catch(console.error);
    }
  }, [geoData.division]);

  useEffect(() => {
    if (geoData.district) {
      fetchUpazilas(geoData.district).then(res => setUpazilas(res.data)).catch(console.error);
    }
  }, [geoData.district]);

  const handleChange = (field, val) => {
    const updated = { ...geoData, [field]: val };
    setGeoData(updated);
    if (onChange) onChange(updated);
  };

  return (
    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>🇧🇩</span> UnionDesk Administrative Geo-Structure
        </h3>
        <span className="text-[10px] font-mono text-slate-500 font-bold">9-Tier BD Geo Hierarchy</span>
      </div>

      {/* Tier 1, 2, 3: Division, District, Upazila */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <Label>Division (8)</Label>
          <select
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={geoData.division}
            onChange={(e) => handleChange('division', e.target.value)}
          >
            {divisions.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <Label>District (64)</Label>
          <select
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={geoData.district}
            onChange={(e) => handleChange('district', e.target.value)}
          >
            {districts.map((dst) => (
              <option key={dst} value={dst}>{dst}</option>
            ))}
          </select>
        </div>

        <div>
          <Label>Upazila (495+)</Label>
          <select
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={geoData.upazila}
            onChange={(e) => handleChange('upazila', e.target.value)}
          >
            {upazilas.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tier 4, 5, 6: Municipality/City Corp, Union, Ward */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <Label>Municipality / City Corp</Label>
          <Input
            type="text"
            placeholder="e.g. Dhaka North City Corp / Pourashava"
            value={geoData.municipality_city_corp}
            onChange={(e) => handleChange('municipality_city_corp', e.target.value)}
          />
        </div>

        <div>
          <Label>Union</Label>
          <Input
            type="text"
            placeholder="e.g. Tetuljhora Union"
            value={geoData.union_name}
            onChange={(e) => handleChange('union_name', e.target.value)}
          />
        </div>

        <div>
          <Label>Ward No.</Label>
          <Input
            type="text"
            placeholder="e.g. Ward 04"
            value={geoData.ward_no}
            onChange={(e) => handleChange('ward_no', e.target.value)}
          />
        </div>
      </div>

      {/* Tier 7, 8, 9: Village, Mohalla, Custom Area */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <Label>Village</Label>
          <Input
            type="text"
            placeholder="e.g. Hemayetpur Village"
            value={geoData.village}
            onChange={(e) => handleChange('village', e.target.value)}
          />
        </div>

        <div>
          <Label>Mohalla</Label>
          <Input
            type="text"
            placeholder="e.g. Purba Para"
            value={geoData.mohalla}
            onChange={(e) => handleChange('mohalla', e.target.value)}
          />
        </div>

        <div>
          <Label>Custom Area Boundary</Label>
          <Input
            type="text"
            placeholder="e.g. Block-B Sector 2"
            value={geoData.custom_area}
            onChange={(e) => handleChange('custom_area', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
