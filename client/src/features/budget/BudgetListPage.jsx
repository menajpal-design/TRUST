import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchBudgets, fetchBudgetSummary, deleteBudget } from '../../services/budget.service';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CreateBudgetModal } from './CreateBudgetModal';
import { BudgetHistoryModal } from './BudgetHistoryModal';
import { formatCurrency } from '../../utils/formatCurrency';

export const BudgetListPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [fiscalYear, setFiscalYear] = useState('');
  const [budgetType, setBudgetType] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState(null);

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const [bRes, sRes] = await Promise.all([
        fetchBudgets({ fiscalYear, budgetType }),
        fetchBudgetSummary(fiscalYear)
      ]);
      setBudgets(bRes.data);
      setSummary(sRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, [fiscalYear, budgetType]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget allocation?')) return;
    try {
      await deleteBudget(id);
      loadBudgets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete budget');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">UnionDesk 🇧🇩 Fiscal Budget Governance</h1>
            <p className="text-slate-400 mt-1">Departmental, secretary, and category budget allocations & utilization tracking</p>
          </div>
          <div className="flex gap-3">
            <Link to="/dashboard">
              <Button variant="secondary">Dashboard</Button>
            </Link>
            <Button onClick={() => setIsCreateOpen(true)}>
              + Allocate New Budget
            </Button>
          </div>
        </div>

        {/* Executive Budget Summary */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="!p-5 bg-indigo-950/40 border-indigo-500/40">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Total Allocated Budget</span>
              <p className="text-2xl font-bold font-mono text-slate-100 mt-1">
                {formatCurrency(summary.total_allocated)}
              </p>
            </Card>

            <Card className="!p-5 bg-rose-950/30 border-rose-500/30">
              <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Total Utilized</span>
              <p className="text-2xl font-bold font-mono text-rose-400 mt-1">
                {formatCurrency(summary.total_utilized)}
              </p>
            </Card>

            <Card className="!p-5 bg-emerald-950/30 border-emerald-500/30">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Remaining Balance</span>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {formatCurrency(summary.total_remaining)}
              </p>
            </Card>

            <Card className="!p-5 bg-amber-950/30 border-amber-500/30">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Overall Utilization Rate</span>
              <p className="text-2xl font-bold font-mono text-amber-300 mt-1">
                {summary.overall_utilization_pct}%
              </p>
            </Card>
          </div>
        )}

        {/* Filter Bar */}
        <Card className="!p-4">
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="flex gap-4">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">Fiscal Year:</span>
                <input
                  type="text"
                  placeholder="e.g. 2026"
                  className="bg-slate-900 border border-slate-700 text-sm text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value)}
                />
              </div>

              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">Budget Type:</span>
                <select
                  className="bg-slate-900 border border-slate-700 text-sm text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
                  value={budgetType}
                  onChange={(e) => setBudgetType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="DEPARTMENT">Department Budget</option>
                  <option value="SECRETARY">Secretary Budget</option>
                  <option value="CATEGORY">Category Budget</option>
                </select>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {budgets.length} Budget Allocation(s)
            </span>
          </div>
        </Card>

        {/* Budget Allocation Table */}
        <Card>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : budgets.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No budget allocations recorded. Click "+ Allocate New Budget" to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">FY / Type</th>
                    <th className="px-4 py-3">Department / Purpose</th>
                    <th className="px-4 py-3">Allocated</th>
                    <th className="px-4 py-3">Utilized (Expenses)</th>
                    <th className="px-4 py-3">Remaining Balance</th>
                    <th className="px-4 py-3">Usage Progress</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {budgets.map((b) => {
                    const pct = parseFloat(b.utilization_percentage);
                    const progressColor = pct >= 90 ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';

                    return (
                      <tr key={b._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-xs font-bold text-slate-100 block">{b.fiscal_year}</span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800 inline-block mt-0.5">
                            {b.budget_type}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-100">{b.department_name}</div>
                          <div className="text-xs text-slate-400">{b.title}</div>
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-100">
                          {formatCurrency(b.allocated_amount)}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-rose-400">
                          {formatCurrency(b.utilized_amount)}
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-emerald-400">
                          {formatCurrency(b.remaining_balance)}
                        </td>
                        <td className="px-4 py-3.5 w-40">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                              <div
                                className={`h-full ${progressColor} transition-all`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-mono text-slate-400 shrink-0">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-3">
                          <button
                            onClick={() => setSelectedBudgetId(b._id)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                          >
                            📜 History
                          </button>
                          <button
                            onClick={() => handleDelete(b._id)}
                            className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Modals */}
        <CreateBudgetModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={loadBudgets}
        />

        <BudgetHistoryModal
          isOpen={Boolean(selectedBudgetId)}
          onClose={() => setSelectedBudgetId(null)}
          budgetId={selectedBudgetId}
        />
      </div>
    </div>
  );
};
