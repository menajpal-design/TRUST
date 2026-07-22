import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { fetchMemberHistory } from '../../services/member.service';

export const MemberHistoryModal = ({ isOpen, onClose, memberId }) => {
  if (!isOpen || !memberId) return null;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberHistory(memberId)
      .then((res) => setHistory(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [memberId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-lg">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Role & Position History Timeline</h2>
              <p className="text-xs text-slate-400">Immutable audit log of all historical promotions and role updates</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-lg font-bold">
              ✕
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No historical role or position revisions recorded yet.
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {history.map((h) => (
                <div key={h._id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span className="text-indigo-400 font-mono">Role: {h.old_role_name} → {h.new_role_name}</span>
                    <span className="text-slate-500 font-mono">{new Date(h.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="text-slate-200">
                    Position: <span className="line-through text-slate-500">{h.old_position}</span> → <span className="font-bold text-emerald-400">{h.new_position}</span>
                  </div>

                  {h.committee_name && (
                    <div className="text-slate-400 text-[11px]">
                      Committee Tier: <span className="font-mono text-indigo-300">{h.committee_name}</span>
                    </div>
                  )}

                  {h.reason && <p className="text-slate-400 italic text-[11px]">"{h.reason}"</p>}

                  <p className="text-slate-500 text-[10px] pt-1 border-t border-slate-900">
                    Modified By: {h.changed_by ? `${h.changed_by.first_name} ${h.changed_by.last_name}` : 'System'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
