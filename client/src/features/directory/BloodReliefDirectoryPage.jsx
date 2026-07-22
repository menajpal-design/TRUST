import React, { useEffect, useState } from 'react';
import { fetchMembers } from '../../services/member.service';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

export const BloodReliefDirectoryPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bloodGroup, setBloodGroup] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchMembers({ search });
        setMembers(res.data.docs || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [search]);

  const filteredMembers = members.filter(m => {
    if (!bloodGroup) return true;
    return (m.blood_group || 'O+').toUpperCase() === bloodGroup.toUpperCase();
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">🩸 Emergency Blood & Relief Directory</h1>
          <p className="text-slate-400 mt-1">Instant blood donor lookup by group & geographic area during medical emergencies</p>
        </div>

        {/* Blood Group Filter Bar */}
        <Card className="!p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                <button
                  key={bg}
                  onClick={() => setBloodGroup(bg)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all border ${
                    bloodGroup === bg
                      ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-900/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {bg === '' ? 'ALL GROUPS' : `🩸 ${bg}`}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-64">
              <Input placeholder="Search donor name, location..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </Card>

        {/* Donors Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">No blood donors match the selected criteria.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((m) => (
              <Card key={m._id} className="!p-5 space-y-3 relative">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-rose-400 font-mono px-3 py-1 bg-rose-950/60 border border-rose-800 rounded-xl">
                    🩸 {m.blood_group || 'O+'}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                    AVAILABLE DONOR
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-100">{m.user_id?.first_name} {m.user_id?.last_name}</h3>
                  <p className="text-xs text-slate-400">{m.position_title} • Code: {m.member_code}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 text-xs space-y-1 font-mono text-slate-300">
                  <div>📍 Location: {m.address || 'Dhaka, Bangladesh'}</div>
                  <div>📞 Phone: <strong>{m.phone || m.user_id?.phone || '+880 1700-000000'}</strong></div>
                </div>

                <a
                  href={`tel:${m.phone || '+8801700000000'}`}
                  className="block w-full text-center py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-all"
                >
                  📞 Call Emergency Donor
                </a>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
