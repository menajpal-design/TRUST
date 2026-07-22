import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { createReceipt } from '../../services/receipt.service';

export const CreateReceiptModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    payer_name: '',
    payer_email: '',
    amount: '',
    payment_method: 'CASH',
    description: ''
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
      await createReceipt(formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue receipt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-100">Issue New Payment Receipt</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-lg font-bold">
              ✕
            </button>
          </div>

          {error && <Alert type="error" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Payer Name</Label>
              <Input
                type="text"
                name="payer_name"
                placeholder="Full name of person / organization"
                value={formData.payer_name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Payer Email Address</Label>
              <Input
                type="email"
                name="payer_email"
                placeholder="email@domain.com"
                value={formData.payer_email}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount Received ($)</Label>
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
            </div>

            <div>
              <Label>Particulars / Payment Description</Label>
              <Input
                type="text"
                name="description"
                placeholder="e.g. Annual Membership Fee 2026 / Event Ticket"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={loading}>
                Generate Receipt & QR Code
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
