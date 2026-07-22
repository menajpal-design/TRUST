import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { fetchMemberFeeProfile } from '../../services/fee.service';
import { formatCurrency } from '../../utils/formatCurrency';

export const MemberProfileModal = ({ isOpen, onClose, member }) => {
  if (!isOpen || !member) return null;

  const [feeProfileData, setFeeProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberFeeProfile(member._id)
      .then((res) => setFeeProfileData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [member._id]);

  const user = member.user_id || {};
  const summary = feeProfileData?.summary || {};
  const history = feeProfileData?.payment_history || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-xl my-8">
        <Card className="max-h-[90vh] overflow-y-auto pr-2">
          <div className="flex justify-between items-start mb-4 border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase">
                {member.member_code}
              </span>
              <h2 className="text-xl font-bold text-slate-100">{user.first_name} {user.last_name}</h2>
              <p className="text-xs text-slate-400">{user.email} | {member.phone || 'No phone'}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-lg font-bold">
              ✕
            </button>
          </div>

          {/* Fee Profile Summary Widgets */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Financial Metrics Cards */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Current Due</span>
                  <span className="text-lg font-bold font-mono text-rose-400">{formatCurrency(summary.current_due)}</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Paid</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">{formatCurrency(summary.total_paid)}</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Outstanding</span>
                  <span className="text-lg font-bold font-mono text-amber-400">{formatCurrency(summary.outstanding_balance)}</span>
                </div>
              </div>

              {/* Fee Profile Configuration Metadata */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
                <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-[11px]">Fee Profile Setup</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>Fee Status: <strong className="text-white">{member.fee_profile?.fee_status || 'ACTIVE'}</strong></div>
                  <div>Frequency: <strong className="text-white">{member.fee_profile?.fee_frequency || 'MONTHLY'}</strong></div>
                  <div>Custom Fee: <strong className="text-white">{member.fee_profile?.custom_fee_amount !== null ? formatCurrency(member.fee_profile?.custom_fee_amount) : 'Org Default'}</strong></div>
                  <div>Next Due Date: <strong className="text-white">{summary.next_due_date ? new Date(summary.next_due_date).toLocaleDateString() : 'N/A'}</strong></div>
                </div>
              </div>

              {/* Digital QR Code Card */}
              {member.qr_code_data && (
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-indigo-500/40 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-400 block">Verified Digital Membership Card</span>
                    <span className="text-sm font-bold text-slate-100 block">{member.member_code}</span>
                    <span className="text-xs text-slate-400 block">{member.position_title || 'Member'}</span>
                  </div>
                  <div className="w-16 h-16 bg-white p-1 rounded-lg">
                    <img src={member.qr_code_data} alt="Member QR" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}

              {/* Payment & Receipt History Timeline */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-200 text-sm">Payment & Receipt History</h4>
                {history.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No fee payment history recorded yet.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {history.map((h) => (
                      <div key={h._id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-200 block">Period: {h.period}</span>
                          <span className="text-slate-400 text-[11px]">Paid: {formatCurrency(h.paid_amount)} via {h.payment_method}</span>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            h.status === 'PAID' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}>
                            {h.status}
                          </span>
                          {h.receipt_id && (
                            <span className="text-[10px] font-mono text-indigo-400 block mt-1">
                              Receipt #{h.receipt_id.receipt_number}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
