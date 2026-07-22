import React, { useState } from 'react';
import {
  fetchIncomeStatementReport,
  fetchExpenseStatementReport,
  fetchBudgetUtilizationReport,
  fetchCommitteeHierarchyReport,
  downloadReportPDF,
  exportReportExcel
} from '../../services/reports.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { formatCurrency } from '../../utils/formatCurrency';

export const ReportsDashboardPage = () => {
  const [activeReport, setActiveReport] = useState('income');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const handleGenerateReport = async () => {
    setLoading(true);
    setReportData(null);
    try {
      let res;
      if (activeReport === 'income') {
        res = await fetchIncomeStatementReport(startDate, endDate);
      } else if (activeReport === 'expense') {
        res = await fetchExpenseStatementReport(startDate, endDate);
      } else if (activeReport === 'budget') {
        res = await fetchBudgetUtilizationReport();
      } else if (activeReport === 'committee') {
        res = await fetchCommitteeHierarchyReport();
      }
      setReportData(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error generating report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">UnionDesk 🇧🇩 Executive Reports & Analytics</h1>
            <p className="text-slate-400 mt-1">Generate income statements, expense statements, budget utilization & committee reports</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => downloadReportPDF(activeReport, startDate, endDate)}>
              📄 Export PDF Stream
            </Button>
            <Button onClick={() => exportReportExcel(activeReport, startDate, endDate)}>
              📊 Export Excel (.xlsx)
            </Button>
          </div>
        </div>

        {/* Report Selector Tabs */}
        <Card className="!p-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex border-b border-slate-800 space-x-6">
              <button
                onClick={() => setActiveReport('income')}
                className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
                  activeReport === 'income' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                💵 Income Statement
              </button>
              <button
                onClick={() => setActiveReport('expense')}
                className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
                  activeReport === 'expense' ? 'border-rose-500 text-rose-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                💸 Expense Statement
              </button>
              <button
                onClick={() => setActiveReport('budget')}
                className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
                  activeReport === 'budget' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                🏛️ Budget Utilization
              </button>
              <button
                onClick={() => setActiveReport('committee')}
                className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
                  activeReport === 'committee' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                👥 Committee Roster
              </button>
            </div>

            {/* Date Filters */}
            <div className="flex items-center gap-3">
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <Button className="mt-5" onClick={handleGenerateReport} isLoading={loading}>
                Generate Report
              </Button>
            </div>
          </div>
        </Card>

        {/* Report Results */}
        <Card>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : !reportData ? (
            <div className="text-center py-12 text-slate-500 text-sm">Select report criteria and click "Generate Report".</div>
          ) : (
            <div className="space-y-6">
              {/* Financial Report Rendering */}
              {(activeReport === 'income' || activeReport === 'expense') && (
                <div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl mb-6 flex justify-between items-center">
                    <span className="text-sm text-slate-300 font-medium">Total Summary Amount:</span>
                    <span className={`text-2xl font-bold font-mono ${activeReport === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(reportData.total_amount)}
                    </span>
                  </div>

                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Particulars / Title</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Payment Method</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {reportData.transactions?.map((t) => (
                        <tr key={t._id}>
                          <td className="px-4 py-3 text-xs text-slate-400">{new Date(t.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 font-bold text-slate-100">{t.title}</td>
                          <td className="px-4 py-3 text-xs text-indigo-400">{t.category}</td>
                          <td className="px-4 py-3 text-xs font-mono">{t.payment_method}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-slate-100">{formatCurrency(t.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Budget Report Rendering */}
              {activeReport === 'budget' && (
                <div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                      <span className="text-xs text-slate-400 block font-semibold">Total Allocated</span>
                      <span className="text-xl font-bold text-slate-100 font-mono">{formatCurrency(reportData.total_allocated)}</span>
                    </div>
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                      <span className="text-xs text-slate-400 block font-semibold">Total Utilized</span>
                      <span className="text-xl font-bold text-rose-400 font-mono">{formatCurrency(reportData.total_utilized)}</span>
                    </div>
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                      <span className="text-xs text-slate-400 block font-semibold">Remaining Funds</span>
                      <span className="text-xl font-bold text-emerald-400 font-mono">{formatCurrency(reportData.total_remaining)}</span>
                    </div>
                  </div>

                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3">FY</th>
                        <th className="px-4 py-3">Allocated</th>
                        <th className="px-4 py-3">Utilized</th>
                        <th className="px-4 py-3 text-right">Remaining</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {reportData.budgets?.map((b) => (
                        <tr key={b._id}>
                          <td className="px-4 py-3 font-bold text-slate-100">{b.department_name}</td>
                          <td className="px-4 py-3 text-xs font-mono">{b.fiscal_year}</td>
                          <td className="px-4 py-3 font-mono">{formatCurrency(b.allocated_amount)}</td>
                          <td className="px-4 py-3 font-mono text-rose-400">{formatCurrency(b.utilized_amount)}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">{formatCurrency(b.remaining_balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Committee Report Rendering */}
              {activeReport === 'committee' && (
                <div className="space-y-4">
                  {reportData.committees?.map((c) => (
                    <div key={c._id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-indigo-400 text-base">{c.name} ({c.code})</h3>
                        <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">{c.committee_type || 'Executive'}</span>
                      </div>
                      <div className="text-xs text-slate-300">
                        {c.members?.map((m, idx) => (
                          <div key={idx} className="py-1 border-t border-slate-800/60 flex justify-between">
                            <span>{m.position_title}: <strong>{m.user_id ? `${m.user_id.first_name} ${m.user_id.last_name}` : 'User'}</strong></span>
                            <span className="text-slate-500 font-mono">{m.user_id?.email}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
