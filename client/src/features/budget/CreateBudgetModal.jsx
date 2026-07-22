import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { createBudget } from '../../services/budget.service';

export const CreateBudgetModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    title: '',
    fiscal_year: new Date().getFullYear().toString(),
    budget_type: 'DEPARTMENT',
    department_name: '',
    allocated_amount: '',
    notes: '',
    status: 'APPROVED'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'allocated_amount' ? parseFloat(value) || '' : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createBudget(formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to allocate budget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-100">Create Budget Allocation</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-lg font-bold">
              ✕
            </button>
          </div>

          {error && <Alert type="error" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Budget Title</Label>
              <Input
                type="text"
                name="title"
                placeholder="FY 2026 Departmental Allocation"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fiscal Year</Label>
                <Input
                  type="text"
                  name="fiscal_year"
                  placeholder="2026"
                  value={formData.fiscal_year}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Budget Type</Label>
                <select
                  name="budget_type"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.budget_type}
                  onChange={handleChange}
                >
                  <option value="DEPARTMENT">DEPARTMENT BUDGET</option>
                  <option value="SECRETARY">SECRETARY DISCRETIONARY</option>
                  <option value="CATEGORY">CATEGORY SPECIFIC</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Department / Secretary Name</Label>
              <Input
                type="text"
                name="department_name"
                placeholder="e.g. Executive Board, Welfare Committee, IT Dept"
                value={formData.department_name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Allocated Amount ($)</Label>
              <Input
                type="number"
                step="0.01"
                name="allocated_amount"
                placeholder="5000.00"
                value={formData.allocated_amount}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Notes & Purpose</Label>
              <Input
                type="text"
                name="notes"
                placeholder="Approved during annual general board meeting"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={loading}>
                Allocate Budget
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
