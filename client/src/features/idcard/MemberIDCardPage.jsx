import React, { useEffect, useState } from 'react';
import { fetchMembers } from '../../services/member.service';
import { useAuthStore } from '../../store/useAuthStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const MemberIDCardPage = () => {
  const { activeOrganization } = useAuthStore();
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchMembers();
        const docs = res.data.docs || [];
        setMembers(docs);
        if (docs.length > 0) setSelectedMember(docs[0]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8 print:p-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-3xl font-bold">🆔 Smart PVC Member ID Card Studio</h1>
            <p className="text-slate-400 mt-1">Generate printable CR80 standard smart ID cards with QR codes & member info</p>
          </div>
          <Button onClick={handlePrint}>
            🖨️ Print PVC ID Card
          </Button>
        </div>

        {/* Member Selector */}
        <Card className="!p-4 print:hidden">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-400 uppercase">Select Member:</span>
            <select
              className="bg-slate-900 border border-slate-700 text-sm text-slate-200 rounded-lg px-3 py-2 flex-1"
              value={selectedMember?._id || ''}
              onChange={(e) => {
                const target = members.find(m => m._id === e.target.value);
                if (target) setSelectedMember(target);
              }}
            >
              {members.map(m => (
                <option key={m._id} value={m._id}>
                  {m.user_id?.first_name} {m.user_id?.last_name} ({m.member_code}) — {m.position_title}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Printable PVC ID Card Container */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : !selectedMember ? (
          <div className="text-center py-12 text-slate-500 text-sm">No member selected.</div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center py-6">
            {/* FRONT SIDE (CR80 Standard PVC 3.375" x 2.125") */}
            <div className="w-[340px] h-[520px] bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950 rounded-2xl border-2 border-indigo-500/40 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>

              {/* Organization Header */}
              <div className="text-center border-b border-indigo-500/30 pb-3">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">
                  {activeOrganization?.name || 'UnionDesk 🇧🇩 Bangladesh'}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono mt-0.5">Official Membership Smart ID</span>
              </div>

              {/* Photo & Basic Details */}
              <div className="flex flex-col items-center text-center space-y-3 my-auto">
                <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-indigo-500/50 p-1 overflow-hidden shadow-inner">
                  {selectedMember.user_id?.avatar_url ? (
                    <img src={selectedMember.user_id.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-indigo-400">
                      {selectedMember.user_id?.first_name?.[0]}
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-slate-100">{selectedMember.user_id?.first_name} {selectedMember.user_id?.last_name}</h2>
                  <span className="text-xs font-bold text-indigo-400 block font-mono mt-0.5">{selectedMember.position_title || 'Member'}</span>
                </div>
              </div>

              {/* Card Footer Meta */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Member ID:</span>
                  <span className="font-bold text-indigo-300">{selectedMember.member_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Committee:</span>
                  <span className="font-bold text-slate-200">{selectedMember.committee_level || 'General'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Blood Group:</span>
                  <span className="font-bold text-rose-400">{selectedMember.blood_group || 'O+'}</span>
                </div>
              </div>
            </div>

            {/* BACK SIDE (CR80 Standard PVC 3.375" x 2.125") */}
            <div className="w-[340px] h-[520px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl border-2 border-slate-700/40 p-6 flex flex-col justify-between shadow-2xl relative text-center">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Digital Verification QR</span>
              </div>

              {/* QR Code */}
              <div className="my-auto flex flex-col items-center space-y-3">
                {selectedMember.qr_code_data ? (
                  <div className="w-40 h-40 bg-white p-2 rounded-xl border border-slate-700 shadow-md">
                    <img src={selectedMember.qr_code_data} alt="QR Code" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-40 h-40 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center text-xs text-slate-500 font-mono">QR Unavailable</div>
                )}
                <span className="text-[10px] font-mono text-slate-400 block max-w-xs">Scan to verify authentic membership status & attendance token</span>
              </div>

              <div className="border-t border-slate-800 pt-3 text-[10px] text-slate-500 font-mono">
                Property of {activeOrganization?.name || 'UnionDesk BD'}. If found, please return to organization authority.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
