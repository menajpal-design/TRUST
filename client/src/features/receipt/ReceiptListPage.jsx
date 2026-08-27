import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchReceipts } from '../../services/receipt.service';
import useAuthStore from '../../store/useAuthStore';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { CreateReceiptModal } from './CreateReceiptModal';
import { formatCurrency } from '../../utils/formatCurrency';

export const ReceiptListPage = () => {
  const { user, activeOrganization } = useAuthStore();
  const isSuperAdmin = user?.is_global_superadmin;
  const userRole = String(activeOrganization?.role || activeOrganization?.user_role || user?.role || 'MEMBER').toUpperCase();
  const canManageReceipts = isSuperAdmin || ['ORG_OWNER', 'OWNER', 'ADMIN', 'TREASURER', 'MODERATOR'].includes(userRole);

  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const loadReceipts = async () => {
    setLoading(true);
    try {
      const res = await fetchReceipts(search);
      setReceipts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, [search]);

  // If member, filter personal receipts
  const displayReceipts = canManageReceipts
    ? receipts
    : receipts.filter(r => {
        const userEmail = (user?.email || '').trim().toLowerCase();
        const payerEmail = (r.payer_email || '').trim().toLowerCase();
        if (userEmail && payerEmail && userEmail === payerEmail) return true;

        const userName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim().toLowerCase();
        const pName = (r.payer_name || '').trim().toLowerCase();
        return (userName && pName && (pName.includes(userName) || userName.includes(pName)));
      });

  const totalReceiptsAmount = displayReceipts.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                {canManageReceipts ? `👑 Role: ${userRole} (Receipt Manager)` : '👤 Member Personal Receipts'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">
              {canManageReceipts ? 'UnionDesk 🇧🇩 Official Payment Receipts' : '🧾 আমার পেমেন্ট ও ফির রসিদ হিসাব (My Receipts)'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {canManageReceipts
                ? 'Issue, print, and verify digital QR receipts for member fees and donations'
                : 'আপনার পরিশোধিত সকল ফি ও অনুদানের ডিজিটাল কিউআর রসিদ তালিকা ও প্রিন্ট কপি'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/dashboard">
              <Button variant="secondary" size="sm">Dashboard</Button>
            </Link>
            {canManageReceipts ? (
              <Button size="sm" onClick={() => setIsModalOpen(true)}>
                + Issue New Receipt
              </Button>
            ) : (
              <Link to="/fees">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                  💳 ফি জমা দিন (Pay Due)
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Member Personal Receipt Summary */}
        {!canManageReceipts && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="!p-4 bg-emerald-950/40 border-emerald-500/40">
              <span className="text-xs font-bold text-emerald-400 uppercase">মোট রসিদকৃত অর্থ (Total Paid)</span>
              <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">{formatCurrency(totalReceiptsAmount)}</p>
            </Card>
            <Card className="!p-4 bg-indigo-950/40 border-indigo-500/40">
              <span className="text-xs font-bold text-indigo-400 uppercase">মোট ডিজিটাল রসিদ সংখ্যা</span>
              <p className="text-2xl font-bold text-indigo-300 font-mono mt-1">{displayReceipts.length} টি</p>
            </Card>
            <Card className="!p-4 bg-slate-900 border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase">ভেরিফিকেশন স্ট্যাটাস</span>
              <p className="text-sm font-bold text-emerald-400 mt-2">🔒 100% QR ভেরিফায়েড রসিদ</p>
            </Card>
          </div>
        )}

        {/* Filter Bar */}
        <Card className="!p-4">
          <div className="max-w-md">
            <Input
              type="text"
              placeholder={canManageReceipts ? "Search by receipt # or payer name..." : "রসিদ নম্বর বা বিবরণ দিয়ে খুঁজুন..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </Card>

        {/* Table List */}
        <Card>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : displayReceipts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              {canManageReceipts ? 'No receipts found. Click "+ Issue New Receipt".' : 'আপনার নামে কোনো পেমেন্ট রসিদ পাওয়া যায়নি।'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Receipt No</th>
                    <th className="px-4 py-3">Payer</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Payment Method</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Issue Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {displayReceipts.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-indigo-400">
                        {r.receipt_no}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-100">
                        {r.payer_name}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-400 max-w-xs truncate">
                        {r.description}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-mono text-slate-300">
                        {r.payment_method}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-emerald-400">
                        {formatCurrency(r.amount)}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-400">
                        {new Date(r.issue_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-3">
                        <button
                          onClick={() => setSelectedReceipt(r)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                        >
                          👁️ View / Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Create Receipt Modal */}
        <CreateReceiptModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadReceipts}
        />

        {/* View / Print Receipt Modal */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Official Payment Receipt</h3>
                  <p className="text-xs font-mono text-indigo-400">{selectedReceipt.receipt_no}</p>
                </div>
                <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-slate-200 text-lg font-bold">
                  ✕
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between"><span>Payer Name:</span><strong className="text-white">{selectedReceipt.payer_name}</strong></div>
                <div className="flex justify-between"><span>Payment Method:</span><strong className="text-white">{selectedReceipt.payment_method}</strong></div>
                <div className="flex justify-between"><span>Issue Date:</span><strong className="text-white">{new Date(selectedReceipt.issue_date).toLocaleDateString()}</strong></div>
                <div className="flex justify-between border-t border-slate-800 pt-2 text-sm">
                  <span>Total Amount Paid:</span>
                  <strong className="text-emerald-400 font-mono">{formatCurrency(selectedReceipt.amount)}</strong>
                </div>
              </div>

              {selectedReceipt.qr_code_url && (
                <div className="text-center space-y-2">
                  <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl">
                    <img src={selectedReceipt.qr_code_url} alt="Receipt QR" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono uppercase">Verified QR Receipt Token</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                <Button variant="secondary" onClick={() => setSelectedReceipt(null)}>
                  Close
                </Button>
                <Button onClick={() => window.print()}>
                  🖨️ Print Receipt
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
