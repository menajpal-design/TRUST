import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchDues,
  generateMonthlyDues,
  collectFee,
  fetchFeeReports
} from '../../services/fee.service';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Alert } from '../../components/ui/Alert';
import { formatCurrency } from '../../utils/formatCurrency';

export const FeeManagementPage = () => {
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
        fetchFeeReports()
      ]);
      setDues(duesRes.data);
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">UnionDesk 🇧🇩 Membership Fees Management</h1>
            <p className="text-slate-400 mt-1">Configure dues, custom member rates, collection logs & auto-generate receipts</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/dashboard">
              <Button variant="secondary">Dashboard</Button>
            </Link>
            <Button variant="outline" onClick={handleGenerate} isLoading={generating}>
              ⚡ Generate Monthly Dues
            </Button>
          </div>
        </div>

        {/* Dashboard Statistics Widget */}
        {reports && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="!p-5 bg-emerald-950/40 border-emerald-500/40">
              <span className="text-xs font-bold text-emerald-400 uppercase">Total Collected</span>
              <p className="text-3xl font-bold text-emerald-400 font-mono mt-1">{formatCurrency(reports.total_collected)}</p>
            </Card>
            <Card className="!p-5 bg-rose-950/40 border-rose-500/40">
              <span className="text-xs font-bold text-rose-400 uppercase">Outstanding Due</span>
              <p className="text-3xl font-bold text-rose-400 font-mono mt-1">{formatCurrency(reports.total_due)}</p>
            </Card>
            <Card className="!p-5 bg-indigo-950/40 border-indigo-500/40">
              <span className="text-xs font-bold text-indigo-400 uppercase">Collection Rate</span>
              <p className="text-3xl font-bold text-indigo-300 font-mono mt-1">{reports.collection_rate}%</p>
            </Card>
            <Card className="!p-5 bg-slate-900 border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase">Member Payment Status</span>
              <p className="text-xs text-slate-300 font-mono mt-2">
                Paid: <span className="text-emerald-400 font-bold">{reports.paid_members}</span> | Unpaid: <span className="text-rose-400 font-bold">{reports.unpaid_members}</span>
              </p>
            </Card>
          </div>
        )}

        {/* Search & Status Filter */}
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
                className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

        {/* Dues Directory Table */}
        <Card>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : dues.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">No member dues recorded. Click "⚡ Generate Monthly Dues" to initiate.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Member ID</th>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3">Due Amount</th>
                    <th className="px-4 py-3">Paid Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Receipt</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {dues.map((d) => {
                    const remaining = Math.max(0, d.due_amount + d.late_fee - d.paid_amount);
                    return (
                      <tr key={d._id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3.5 font-bold font-mono text-indigo-400">
                          {d.member_id?.member_code || 'MEM-000'}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-slate-300">{d.period}</td>
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-100">{formatCurrency(d.due_amount)}</td>
                        <td className="px-4 py-3.5 font-mono font-bold text-emerald-400">{formatCurrency(d.paid_amount)}</td>
                        <td className="px-4 py-3.5">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            d.status === 'PAID' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs font-mono text-indigo-300">
                          {d.receipt_id ? `#${d.receipt_id.receipt_number}` : 'None'}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {d.status !== 'PAID' && (
                            <button
                              onClick={() => {
                                setSelectedDue(d);
                                setCollectAmount(remaining.toString());
                                setSuccessReceipt(null);
                                setModalError(null);
                              }}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-colors"
                            >
                              Collect Fee
                            </button>
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

        {/* Collection Modal */}
        {selectedDue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <div className="w-full max-w-md my-8">
              <Card>
                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">Collect Fee Payment</h3>
                    <p className="text-xs text-indigo-400 font-mono">Member: {selectedDue.member_id?.member_code}</p>
                  </div>
                  <button onClick={() => setSelectedDue(null)} className="text-slate-400 hover:text-slate-200 text-lg font-bold">
                    ✕
                  </button>
                </div>

                {modalError && <Alert type="error" className="mb-4">{modalError}</Alert>}

                {successReceipt ? (
                  <div className="space-y-4 text-center py-4">
                    <div className="text-3xl">🎉</div>
                    <h4 className="text-base font-bold text-emerald-400">Payment Collected Successfully!</h4>
                    <p className="text-xs text-slate-300">Receipt #{successReceipt.receipt_number} issued with digital QR code.</p>

                    {successReceipt.qr_code_url && (
                      <div className="w-24 h-24 mx-auto bg-white p-1 rounded-lg">
                        <img src={successReceipt.qr_code_url} alt="Receipt QR" className="w-full h-full object-contain" />
                      </div>
                    )}

                    <Button onClick={() => setSelectedDue(null)} className="w-full">
                      Close Window
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleCollectSubmit} className="space-y-4">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                      <div className="flex justify-between text-slate-300">
                        <span>Period Due:</span>
                        <strong className="text-white">{selectedDue.period}</strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Base Due:</span>
                        <strong className="text-white">{formatCurrency(selectedDue.due_amount)}</strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Late Fee:</span>
                        <strong className="text-rose-400">{formatCurrency(selectedDue.late_fee)}</strong>
                      </div>
                    </div>

                    <div>
                      <Label>Collection Amount</Label>
                      <Input
                        type="number"
                        value={collectAmount}
                        onChange={(e) => setCollectAmount(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label>Payment Channel</Label>
                      <select
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        <option value="CASH">Cash</option>
                        <option value="BKASH">bKash</option>
                        <option value="NAGAD">Nagad</option>
                        <option value="BANK">Bank Transfer</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                      <Button type="button" variant="secondary" onClick={() => setSelectedDue(null)}>
                        Cancel
                      </Button>
                      <Button type="submit" isLoading={collecting}>
                        Confirm Payment & Issue Receipt
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
