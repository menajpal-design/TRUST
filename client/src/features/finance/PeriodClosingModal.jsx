import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { executePeriodClosing } from '../../services/finance.service';

export const PeriodClosingModal = ({ isOpen, onClose, onSuccess, initialPeriod = 'DAILY' }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    period_type: initialPeriod,
    closing_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await executePeriodClosing(formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to execute period closing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-100">
              Execute {formData.period_type} Financial Closing
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-lg font-bold">
              ✕
            </button>
          </div>

          {error && <Alert type="error" className="mb-4">{error}</Alert>}

          <p className="text-xs text-indigo-300 mb-4 bg-indigo-950/50 p-3 rounded-lg border border-indigo-800">
            ℹ️ Period closing calculates opening balance, total inflows/outflows, and freezes the closing balance for auditing.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Closing Type</Label>
              <select
                name="period_type"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.period_type}
                onChange={handleChange}
              >
                <option value="DAILY">DAILY CLOSING</option>
                <option value="MONTHLY">MONTHLY CLOSING</option>
              </select>
            </div>

            <div>
              <Label>Closing Date</Label>
              <Input
                type="date"
                name="closing_date"
                value={formData.closing_date}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Closing Notes & Audit Remarks</Label>
              <Input
                type="text"
                name="notes"
                placeholder="Verified against physical cash drawer & bank statement"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={loading}>
                Confirm Closing
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
