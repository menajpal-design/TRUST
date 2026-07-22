import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchFinanceSummary,
  fetchTransactions,
  fetchCashbook,
  fetchClosings,
  approveTransaction,
  deleteTransaction
} from '../../services/finance.service';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CreateTransactionModal } from './CreateTransactionModal';
import { PeriodClosingModal } from './PeriodClosingModal';
import { formatCurrency } from '../../utils/formatCurrency';

export const FinanceDashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [cashbook, setCashbook] = useState(null);
  const [closings, setClosings] = useState([]);

  const [activeTab, setActiveTab] = useState('transactions');
  const [loading, setLoading] = useState(true);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txType, setTxType] = useState('INCOME');
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, txRes, cbRes, closeRes] = await Promise.all([
        fetchFinanceSummary(),
        fetchTransactions(),
        fetchCashbook(),
        fetchClosings()
      ]);
      setSummary(sumRes.data);
      setTransactions(txRes.data);
      setCashbook(cbRes.data);
      setClosings(closeRes.data);
    } catch (err) {
      console.error('Error loading finance data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id, status) => {
    try {
      await approveTransaction(id, status);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await deleteTransaction(id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Finance & Cash Book Governance</h1>
            <p className="text-slate-400 mt-1">Income, expenses, double-entry cashbook ledger, approval workflows & period closings</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/dashboard">
              <Button variant="secondary">Dashboard</Button>
            </Link>
            <Button variant="outline" onClick={() => setIsClosingModalOpen(true)}>
              🔒 Period Closing
            </Button>
            <Button onClick={() => { setTxType('INCOME'); setIsTxModalOpen(true); }} className="bg-emerald-600 hover:bg-emerald-500">
              + Record Income
            </Button>
            <Button onClick={() => { setTxType('EXPENSE'); setIsTxModalOpen(true); }} className="bg-rose-600 hover:bg-rose-500">
              - Record Expense
            </Button>
          </div>
        </div>

        {/* Finance Executive Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="!p-5 bg-indigo-950/40 border-indigo-500/40">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Total Fund Balance</span>
              <p className="text-2xl font-bold font-mono text-slate-100 mt-1">
                {formatCurrency(summary.current_balance)}
              </p>
              <div className="flex justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-indigo-900/60">
                <span>Cash: {formatCurrency(summary.cash_balance)}</span>
                <span>Bank: {formatCurrency(summary.bank_balance)}</span>
              </div>
            </Card>

            <Card className="!p-5 bg-emerald-950/30 border-emerald-500/30">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Total Revenue / Income</span>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                +{formatCurrency(summary.total_income)}
              </p>
            </Card>

            <Card className="!p-5 bg-rose-950/30 border-rose-500/30">
              <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Total Operational Expense</span>
              <p className="text-2xl font-bold font-mono text-rose-400 mt-1">
                -{formatCurrency(summary.total_expense)}
              </p>
            </Card>

            <Card className="!p-5 bg-amber-950/30 border-amber-500/30">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pending Approvals</span>
              <p className="text-2xl font-bold font-mono text-amber-300 mt-1">
                {summary.pending_approvals_count || 0} Review(s)
              </p>
            </Card>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-6">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'transactions' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📋 All Transactions & Approvals
          </button>
          <button
            onClick={() => setActiveTab('cashbook')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'cashbook' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📖 Cash Book Ledger
          </button>
          <button
            onClick={() => setActiveTab('closings')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'closings' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🔒 Period Closings History
          </button>
        </div>

        {/* Tab Content Workspace */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {/* Tab 1: All Transactions */}
            {activeTab === 'transactions' && (
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Particulars / Category</th>
                        <th className="px-4 py-3">Payment Method</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {transactions.map((t) => (
                        <tr key={t._id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3.5 text-xs text-slate-400">
                            {new Date(t.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                              t.type === 'INCOME' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}>
                              {t.type}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-slate-100">{t.title}</div>
                            <div className="text-xs text-indigo-400">{t.category}</div>
                          </td>
                          <td className="px-4 py-3.5 text-xs font-mono text-slate-400">
                            {t.payment_method} {t.reference_no && `(${t.reference_no})`}
                          </td>
                          <td className={`px-4 py-3.5 font-mono font-bold ${
                            t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                              t.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300' : t.status === 'PENDING' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-rose-950 text-rose-300'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right space-x-2">
                            {t.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleApprove(t._id, 'APPROVED')}
                                  className="text-xs text-emerald-400 hover:underline font-bold"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleApprove(t._id, 'REJECTED')}
                                  className="text-xs text-rose-400 hover:underline font-bold"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDelete(t._id)}
                              className="text-xs text-slate-500 hover:text-slate-300"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Tab 2: Double-Entry Cash Book Ledger */}
            {activeTab === 'cashbook' && cashbook && (
              <Card>
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold text-slate-100">Running Cash Book Ledger</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Opening balance + Inflows - Outflows = Ending balance</p>
                  </div>
                  <div className="flex gap-6 font-mono text-sm">
                    <div>Opening: <span className="font-bold text-slate-200">{formatCurrency(cashbook.opening_balance)}</span></div>
                    <div>Closing: <span className="font-bold text-indigo-400">{formatCurrency(cashbook.closing_balance)}</span></div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Particulars / Category</th>
                        <th className="px-4 py-3">Method</th>
                        <th className="px-4 py-3 text-emerald-400">Inflow (Income)</th>
                        <th className="px-4 py-3 text-rose-400">Outflow (Expense)</th>
                        <th className="px-4 py-3 text-indigo-400">Running Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {cashbook.entries.map((entry) => (
                        <tr key={entry._id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3.5 text-xs text-slate-400">
                            {new Date(entry.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-slate-100">{entry.title}</div>
                            <div className="text-xs text-slate-400">{entry.category}</div>
                          </td>
                          <td className="px-4 py-3.5 text-xs font-mono text-slate-400">{entry.payment_method}</td>
                          <td className="px-4 py-3.5 font-mono text-emerald-400 font-bold">
                            {entry.inflow > 0 ? `+${formatCurrency(entry.inflow)}` : '-'}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-rose-400 font-bold">
                            {entry.outflow > 0 ? `-${formatCurrency(entry.outflow)}` : '-'}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-indigo-400 font-bold">
                            {formatCurrency(entry.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Tab 3: Period Closings Log */}
            {activeTab === 'closings' && (
              <Card>
                <h2 className="text-xl font-bold text-slate-100 mb-4">Historical Daily & Monthly Period Closings</h2>

                {closings.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-sm">
                    No financial closings recorded yet. Click "🔒 Period Closing" to snapshot balances.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-3">Closing Date</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Opening</th>
                          <th className="px-4 py-3 text-emerald-400">Inflows</th>
                          <th className="px-4 py-3 text-rose-400">Outflows</th>
                          <th className="px-4 py-3 text-indigo-400">Closing Balance</th>
                          <th className="px-4 py-3">Closed By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {closings.map((c) => (
                          <tr key={c._id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-4 py-3.5 font-bold text-slate-100">
                              {new Date(c.closing_date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="text-xs px-2.5 py-0.5 rounded font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                                {c.period_type}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-mono text-slate-300">{formatCurrency(c.opening_balance)}</td>
                            <td className="px-4 py-3.5 font-mono text-emerald-400">+{formatCurrency(c.total_income)}</td>
                            <td className="px-4 py-3.5 font-mono text-rose-400">-{formatCurrency(c.total_expense)}</td>
                            <td className="px-4 py-3.5 font-mono font-bold text-indigo-400">{formatCurrency(c.closing_balance)}</td>
                            <td className="px-4 py-3.5 text-xs text-slate-400">
                              {c.closed_by ? `${c.closed_by.first_name} ${c.closed_by.last_name}` : 'System'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            )}
          </>
        )}

        {/* Modals */}
        <CreateTransactionModal
          isOpen={isTxModalOpen}
          onClose={() => setIsTxModalOpen(false)}
          initialType={txType}
          onSuccess={loadData}
        />

        <PeriodClosingModal
          isOpen={isClosingModalOpen}
          onClose={() => setIsClosingModalOpen(false)}
          onSuccess={loadData}
        />
      </div>
    </div>
  );
};
