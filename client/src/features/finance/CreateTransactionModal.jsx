import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { createTransaction } from '../../services/finance.service';

export const CreateTransactionModal = ({ isOpen, onClose, onSuccess, initialType = 'INCOME' }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    type: initialType,
    title: '',
    category: initialType === 'INCOME' ? 'Membership Dues' : 'Operational Expense',
    amount: '',
    payment_method: 'CASH',
    reference_no: '',
    party_name: '',
    notes: '',
    status: 'APPROVED'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createTransaction(formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-100">
              Record {formData.type === 'INCOME' ? 'Income' : 'Expense'} Transaction
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-lg font-bold">
              ✕
            </button>
          </div>

          {error && <Alert type="error" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4 p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                type="button"
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  formData.type === 'INCOME' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'
                }`}
                onClick={() => setFormData({ ...formData, type: 'INCOME', category: 'Membership Dues' })}
              >
                + Income Entry
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  formData.type === 'EXPENSE' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400'
                }`}
                onClick={() => setFormData({ ...formData, type: 'EXPENSE', category: 'Operational Expense' })}
              >
                - Expense Entry
              </button>
            </div>

            <div>
              <Label>Transaction Title</Label>
              <Input
                type="text"
                name="title"
                placeholder="e.g. Annual Membership Fee 2026 / Office Rent"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Input
                  type="text"
                  name="category"
                  placeholder="e.g. Dues, Sponsorship, Utilities"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  name="amount"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Payment Method</Label>
                <select
                  name="payment_method"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.payment_method}
                  onChange={handleChange}
                >
                  <option value="CASH">CASH</option>
                  <option value="BANK_TRANSFER">BANK TRANSFER</option>
                  <option value="CHEQUE">CHEQUE</option>
                  <option value="CARD">CARD</option>
                  <option value="MOBILE_BANKING">MOBILE BANKING</option>
                </select>
              </div>

              <div>
                <Label>Voucher / Reference No</Label>
                <Input
                  type="text"
                  name="reference_no"
                  placeholder="INV-10928 / Chq #892"
                  value={formData.reference_no}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <Label>Payer / Payee Name</Label>
              <Input
                type="text"
                name="party_name"
                placeholder="Name of member or vendor"
                value={formData.party_name}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Approval Status</Label>
              <select
                name="status"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="APPROVED">Auto-Approve & Post to Ledger</option>
                <option value="PENDING">Submit for Manager Approval</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={loading}>
                Record Transaction
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
