import React, { useEffect, useState } from 'react';
import { fetchReceipts } from '../../services/receipt.service';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { CreateReceiptModal } from './CreateReceiptModal';
import { formatCurrency } from '../../utils/formatCurrency';

export const ReceiptListPage = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const loadReceipts = async () => {
    setLoading(true);
    try {
      const res = await fetchReceipts(search);
      setReceipts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, [search]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">UnionDesk 🇧🇩 Official Payment Receipts</h1>
            <p className="text-slate-400 mt-1">Issue, print, and verify digital QR receipts for member fees and donations</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            + Issue New Receipt
          </Button>
        </div>

        {/* Filter Bar */}
        <Card className="!p-4">
          <div className="max-w-md">
            <Input
              type="text"
              placeholder="Search by receipt # or payer name..."
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
          ) : receipts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">No receipts found. Click "+ Issue New Receipt".</div>
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
                  {receipts.map((r) => (
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
