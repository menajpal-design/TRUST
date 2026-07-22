import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { fetchBudgetDetails } from '../../services/budget.service';

export const BudgetHistoryModal = ({ isOpen, onClose, budgetId }) => {
  if (!isOpen || !budgetId) return null;

  const [history, setHistory] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudgetDetails(budgetId)
      .then((res) => {
        setBudget(res.data.budget);
        setHistory(res.data.history);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [budgetId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-100">
              Budget Revision History
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-lg font-bold">
              ✕
            </button>
          </div>

          {budget && (
            <p className="text-xs text-indigo-400 font-mono mb-4">
              Department: {budget.department_name} ({budget.fiscal_year})
            </p>
          )}

          {loading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">
              No historical revisions recorded.
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {history.map((h) => (
                <div key={h._id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-indigo-400">{h.action}</span>
                    <span className="text-slate-500 font-mono">
                      {new Date(h.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-slate-300">
                    Allocation changed: <span className="line-through text-slate-500">${h.old_amount.toFixed(2)}</span> → <span className="font-bold text-emerald-400">${h.new_amount.toFixed(2)}</span>
                  </div>
                  {h.notes && <p className="text-slate-400 italic">"{h.notes}"</p>}
                  <p className="text-slate-500 text-[10px]">
                    By: {h.modified_by ? `${h.modified_by.first_name} ${h.modified_by.last_name}` : 'System'}
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
