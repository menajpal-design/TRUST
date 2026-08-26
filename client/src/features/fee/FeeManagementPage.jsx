import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchDues,
  generateMonthlyDues,
  collectFee,
  fetchFeeReports
} from '../../services/fee.service';
import useAuthStore from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Alert } from '../../components/ui/Alert';
import { formatCurrency } from '../../utils/formatCurrency';

export const FeeManagementPage = () => {
  const { user, activeOrganization } = useAuthStore();
  const isSuperAdmin = user?.is_global_superadmin;
  const roleName = String(activeOrganization?.role || activeOrganization?.user_role || user?.role || 'MEMBER').toUpperCase();
  
  // Role Permission Guard: Only Owner, Treasurer, Admin, Moderator or SuperAdmin can collect/manage
  const canManageFees = isSuperAdmin || ['ORG_OWNER', 'OWNER', 'TREASURER', 'ADMIN', 'MODERATOR'].includes(roleName);

  const [dues, setDues] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [generating, setGenerating] = useState(false);

  // Collection Modal state
  const [selectedDue, setSelectedDue] = useState(null);
  const [collectAmount, setCollectAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [collecting, setCollecting] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [successReceipt, setSuccessReceipt] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [duesRes, repRes] = await Promise.all([
        fetchDues({ status: statusFilter, search }),
        canManageFees ? fetchFeeReports() : Promise.resolve({ data: null })
      ]);
      setDues(duesRes.data || []);
      setReports(repRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, search]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateMonthlyDues();
      alert(res.message);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate monthly dues');
    } finally {
      setGenerating(false);
    }
  };

  const handleCollectSubmit = async (e) => {
    e.preventDefault();
    setCollecting(true);
    setModalError(null);

    try {
      const res = await collectFee({
        due_id: selectedDue._id,
        amount: parseFloat(collectAmount),
        payment_method: paymentMethod
      });
      setSuccessReceipt(res.data.receipt);
      loadData();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Payment collection failed');
    } finally {
      setCollecting(false);
    }
  };

  // Filter personal dues for non-management member view
  const displayDues = canManageFees
    ? dues
    : dues.filter(d => {
        const memberUserId = d.member_id?.user_id?._id || d.member_id?.user_id || d.member_id;
        return String(memberUserId) === String(user?._id);
      });

  // Calculate member personal totals
  const myTotalPaid = displayDues.reduce((acc, curr) => acc + (curr.paid_amount || 0), 0);
  const myTotalDue = displayDues.reduce((acc, curr) => acc + Math.max(0, (curr.due_amount || 0) + (curr.late_fee || 0) - (curr.paid_amount || 0)), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                {canManageFees ? `👑 Role: ${roleName} (Collector/Manager)` : '👤 Member Personal View'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">
              {canManageFees ? 'UnionDesk 🇧🇩 Membership Fees Management' : '💳 আমার জমা দেওয়া ফির হিসাব & রিসিট হিস্ট্রি'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {canManageFees
                ? 'Configure dues, custom member rates, collection logs & auto-generate receipts'
                : 'আপনার পরিশোধিত ফি, বকেয়া হিসাব, জমার তারিখ ও ডিজিটাল রিসিট হিস্ট্রি'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Link to="/dashboard">
              <Button variant="secondary" size="sm">Dashboard</Button>
            </Link>
            {canManageFees ? (
              <Button variant="outline" size="sm" onClick={handleGenerate} isLoading={generating}>
                ⚡ Generate Monthly Dues
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                onClick={() => {
                  const unpaidDue = displayDues.find(d => d.status !== 'PAID') || displayDues[0];
                  if (unpaidDue) {
                    const remaining = Math.max(0, unpaidDue.due_amount + unpaidDue.late_fee - unpaidDue.paid_amount);
                    setSelectedDue(unpaidDue);
                    setCollectAmount(remaining > 0 ? remaining.toString() : '200');
                  } else {
                    alert('আপনার বর্তমানে কোনো বকেয়া নেই!');
                  }
                  setSuccessReceipt(null);
                  setModalError(null);
                }}
              >
                💳 টাকা জমা দিন (Pay My Due)
              </Button>
            )}
          </div>
        </div>

        {/* Dashboard Statistics Widget (Admin / Manager) */}
        {canManageFees && reports && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="!p-4 sm:!p-5 bg-emerald-950/40 border-emerald-500/40">
              <span className="text-xs font-bold text-emerald-400 uppercase">Total Collected</span>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono mt-1">{formatCurrency(reports.total_collected)}</p>
            </Card>
            <Card className="!p-4 sm:!p-5 bg-rose-950/40 border-rose-500/40">
              <span className="text-xs font-bold text-rose-400 uppercase">Outstanding Due</span>
              <p className="text-2xl sm:text-3xl font-bold text-rose-400 font-mono mt-1">{formatCurrency(reports.total_due)}</p>
            </Card>
            <Card className="!p-4 sm:!p-5 bg-indigo-950/40 border-indigo-500/40">
              <span className="text-xs font-bold text-indigo-400 uppercase">Collection Rate</span>
              <p className="text-2xl sm:text-3xl font-bold text-indigo-300 font-mono mt-1">{reports.collection_rate}%</p>
            </Card>
            <Card className="!p-4 sm:!p-5 bg-slate-900 border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase">Member Payment Status</span>
              <p className="text-xs text-slate-300 font-mono mt-2">
                Paid: <span className="text-emerald-400 font-bold">{reports.paid_members}</span> | Unpaid: <span className="text-rose-400 font-bold">{reports.unpaid_members}</span>
              </p>
            </Card>
          </div>
        )}

        {/* Personal Financial Summary Card (For Members) */}
        {!canManageFees && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="!p-4 bg-emerald-950/40 border-emerald-500/40">
              <span className="text-xs font-bold text-emerald-400 uppercase">মোট পরিশোধিত ফি (Total Paid)</span>
              <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">{formatCurrency(myTotalPaid)}</p>
            </Card>
            <Card className="!p-4 bg-rose-950/40 border-rose-500/40">
              <span className="text-xs font-bold text-rose-400 uppercase">বর্তমান বকেয়া ফি (Outstanding Due)</span>
              <p className="text-2xl font-bold text-rose-400 font-mono mt-1">{formatCurrency(myTotalDue)}</p>
            </Card>
            <Card className="!p-4 bg-indigo-950/40 border-indigo-500/40">
              <span className="text-xs font-bold text-indigo-400 uppercase">মোট স্টেটমেন্ট সংখ্যা (Records)</span>
              <p className="text-2xl font-bold text-indigo-300 font-mono mt-1">{displayDues.length} মাস</p>
            </Card>
          </div>
        )}

        {/* Search & Status Filter */}
        {canManageFees && (
          <Card className="!p-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="w-full md:w-96">
                <Input
                  type="text"
                  placeholder="Search member code or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="text-xs font-semibold text-slate-400 uppercase">Status:</span>
                <select
                  className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-auto"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="UNPAID">UNPAID</option>
                  <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
                  <option value="PAID">PAID</option>
                  <option value="OVERDUE">OVERDUE</option>
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* Dues & Payment Directory Table */}
        <Card className="!p-0 sm:!p-4 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-100">
              {canManageFees ? 'সকল মেম্বারের ফি কালেকশন লেজার' : 'আমার মেম্বারশিপ ফি ও পেমেন্ট হিস্ট্রি (Personal History)'}
            </h2>
            <span className="text-xs font-mono text-slate-400">{displayDues.length} টি রেকর্ড</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : displayDues.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              {canManageFees ? 'No member dues recorded. Click "⚡ Generate Monthly Dues" to initiate.' : 'আপনার অ্যাকাউন্টে কোনো ফি জমার হিস্ট্রি নেই।'}
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs sm:text-sm text-slate-300 min-w-[650px]">
                <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Member ID</th>
                    <th className="px-4 py-3">Period (মাস)</th>
                    <th className="px-4 py-3">Base Due</th>
                    <th className="px-4 py-3">Paid Amount</th>
                    <th className="px-4 py-3">Payment Channel</th>
                    <th className="px-4 py-3">Payment Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Receipt No</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {displayDues.map((d) => {
                    const remaining = Math.max(0, d.due_amount + d.late_fee - d.paid_amount);
                    return (
                      <tr key={d._id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3.5 font-bold font-mono text-indigo-400">
                          {d.member_id?.member_code || 'MEM-000'}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-slate-200 font-semibold">{d.period}</td>
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-100">{formatCurrency(d.due_amount)}</td>
                        <td className="px-4 py-3.5 font-mono font-bold text-emerald-400">{formatCurrency(d.paid_amount)}</td>
                        <td className="px-4 py-3.5 font-mono text-xs text-slate-300">
                          {d.payment_method ? (
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-bold">
                              {d.payment_method}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-slate-400">
                          {d.payment_date ? new Date(d.payment_date).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            d.status === 'PAID' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs font-mono text-indigo-300">
                          {d.receipt_id ? `#${d.receipt_id.receipt_no || d.receipt_id.receipt_number}` : 'None'}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {d.status !== 'PAID' ? (
                            <button
                              onClick={() => {
                                setSelectedDue(d);
                                setCollectAmount(remaining.toString());
                                setSuccessReceipt(null);
                                setModalError(null);
                              }}
                              className={`px-3 py-1 text-white rounded text-xs font-bold transition-colors ${
                                canManageFees ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md'
                              }`}
                            >
                              {canManageFees ? 'Collect Fee' : '💳 জমা দিন (Pay)'}
                            </button>
                          ) : (
                            <Link to="/receipts">
                              <span className="text-xs text-indigo-400 hover:underline font-bold">
                                🧾 রসিদ
                              </span>
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Collection & Member Payment Modal */}
        {selectedDue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <div className="w-full max-w-md my-8">
              <Card>
                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">
                      {canManageFees ? 'Collect Fee Payment' : '💳 মেম্বারশিপ ফি জমা দিন'}
                    </h3>
                    <p className="text-xs text-indigo-400 font-mono">Member: {selectedDue.member_id?.member_code || 'MEM-0001'}</p>
                  </div>
                  <button onClick={() => setSelectedDue(null)} className="text-slate-400 hover:text-slate-200 text-lg font-bold">
                    ✕
                  </button>
                </div>

                {modalError && <Alert type="error" className="mb-4">{modalError}</Alert>}

                {successReceipt ? (
                  <div className="space-y-4 text-center py-4">
                    <div className="text-4xl animate-bounce">🎉</div>
                    <h4 className="text-base font-bold text-emerald-400">ফি পেমেন্ট সফলভাবে সম্পন্ন হয়েছে!</h4>
                    <p className="text-xs text-slate-300">ডিজিটাল কিউআর কোডসহ রসিদ #{successReceipt.receipt_no || successReceipt.receipt_number} প্রস্তুত।</p>

                    {(successReceipt.qr_code_data || successReceipt.qr_code_url) && (
                      <div className="w-28 h-28 mx-auto bg-white p-2 rounded-xl shadow-lg">
                        <img src={successReceipt.qr_code_data || successReceipt.qr_code_url} alt="Receipt QR" className="w-full h-full object-contain" />
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Link to="/receipts" className="flex-1">
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-500 font-bold text-xs">
                          🧾 আমার রসিদ দেখুন
                        </Button>
                      </Link>
                      <Button variant="secondary" onClick={() => setSelectedDue(null)} className="flex-1 text-xs">
                        উইন্ডো বন্ধ করুন
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCollectSubmit} className="space-y-4">
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-300">
                        <span>ফি পিরিয়ড (মাস):</span>
                        <strong className="text-white font-mono">{selectedDue.period}</strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>নির্ধারিত ফি:</span>
                        <strong className="text-white font-mono">{formatCurrency(selectedDue.due_amount)}</strong>
                      </div>
                      {selectedDue.late_fee > 0 && (
                        <div className="flex justify-between text-slate-300">
                          <span>বিলম্ব ফি:</span>
                          <strong className="text-rose-400 font-mono">{formatCurrency(selectedDue.late_fee)}</strong>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-300 border-t border-slate-800 pt-1.5 font-bold">
                        <span>অবশিষ্ট বকেয়া:</span>
                        <strong className="text-emerald-400 font-mono">
                          {formatCurrency(Math.max(0, selectedDue.due_amount + selectedDue.late_fee - selectedDue.paid_amount))}
                        </strong>
                      </div>
                    </div>

                    <div>
                      <Label>জমা দেওয়ার পরিমাণ (টাকা)</Label>
                      <Input
                        type="number"
                        value={collectAmount}
                        onChange={(e) => setCollectAmount(e.target.value)}
                        required
                        min="1"
                      />
                    </div>

                    <div>
                      <Label>পেমেন্ট মাধ্যম (Payment Method)</Label>
                      <select
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        <option value="BKASH">bKash (বিকাশ)</option>
                        <option value="NAGAD">Nagad (নগদ)</option>
                        <option value="ROCKET">Rocket (রকেট)</option>
                        <option value="BANK">Bank Transfer (ব্যাংক ট্রান্সফার)</option>
                        <option value="CASH">Cash Deposit (নগদ ক্যাশ)</option>
                      </select>
                    </div>

                    {!canManageFees && (
                      <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/60 text-[11px] text-indigo-300 space-y-1">
                        <span className="font-bold block">💡 পেমেন্ট নির্দেশনা:</span>
                        <p>পেমেন্ট সম্পন্ন করার পর তাৎক্ষণিকভাবে আপনার নামে ভেরিফায়েড ডিজিটাল কিউআর রসিদ ইস্যু হবে।</p>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                      <Button type="button" variant="secondary" onClick={() => setSelectedDue(null)}>
                        বাতিল করুন
                      </Button>
                      <Button type="submit" isLoading={collecting} className="bg-emerald-600 hover:bg-emerald-500">
                        {canManageFees ? 'Confirm Payment & Issue Receipt' : 'পেমেন্ট নিশ্চিত করুন'}
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
