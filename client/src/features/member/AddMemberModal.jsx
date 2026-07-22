import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { createMember } from '../../services/member.service';

export const AddMemberModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    member_code: '',
    membership_type: 'GENERAL',
    joined_date: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
    committee_level: 'NONE',
    position_title: 'Member',
    system_role: 'MEMBER',
    custom_permissions: [],
    fee_profile: {
      custom_fee_amount: '',
      fee_frequency: 'MONTHLY',
      fee_start_date: new Date().toISOString().split('T')[0],
      next_due_date: new Date().toISOString().split('T')[0],
      grace_period_days: 5,
      late_fee_amount: 10,
      late_fee_type: 'FIXED',
      fee_status: 'ACTIVE',
      auto_generate_due: true,
      auto_send_reminder: true,
      auto_generate_receipt: true
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const availablePermissions = [
    { key: 'members:create', label: 'Create Members' },
    { key: 'members:edit', label: 'Edit Members' },
    { key: 'members:delete', label: 'Delete Members' },
    { key: 'finance:read', label: 'View Finance' },
    { key: 'finance:approve', label: 'Approve Expenses' },
    { key: 'events:manage', label: 'Manage Events' },
    { key: 'notices:manage', label: 'Manage Notices' },
    { key: 'committees:manage', label: 'Manage Committees' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFeeProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      fee_profile: {
        ...formData.fee_profile,
        [name]: type === 'checkbox' ? checked : value
      }
    });
  };

  const handlePermissionToggle = (key) => {
    const exists = formData.custom_permissions.includes(key);
    let updated = [];
    if (exists) {
      updated = formData.custom_permissions.filter(k => k !== key);
    } else {
      updated = [...formData.custom_permissions, key];
    }
    setFormData({ ...formData, custom_permissions: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      fee_profile: {
        ...formData.fee_profile,
        custom_fee_amount: formData.fee_profile.custom_fee_amount !== '' ? parseFloat(formData.fee_profile.custom_fee_amount) : null
      }
    };

    try {
      await createMember(payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl my-8">
        <Card className="max-h-[90vh] overflow-y-auto pr-2">
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900/90 py-2 backdrop-blur-sm z-10 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Add New Organization Member</h2>
              <p className="text-xs text-slate-400">Complete personal, organizational, fee profile & permissions setup</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-lg font-bold">
              ✕
            </button>
          </div>

          {error && <Alert type="error" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Personal Information */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">✔ Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input type="text" name="last_name" value={formData.last_name} onChange={handleChange} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email Address</Label>
                  <Input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Section 2: Membership Fee Configuration */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-indigo-500/40">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>💳</span> Membership Fee Profile Configuration
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Custom Monthly Fee Amount ($)</Label>
                  <Input
                    type="number"
                    name="custom_fee_amount"
                    placeholder="Leave empty to use Org Default"
                    value={formData.fee_profile.custom_fee_amount}
                    onChange={handleFeeProfileChange}
                  />
                </div>

                <div>
                  <Label>Fee Frequency</Label>
                  <select
                    name="fee_frequency"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.fee_profile.fee_frequency}
                    onChange={handleFeeProfileChange}
                  >
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="HALF_YEARLY">Half-Yearly</option>
                    <option value="YEARLY">Yearly</option>
                    <option value="ONE_TIME">One-Time</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fee Status</Label>
                  <select
                    name="fee_status"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                    value={formData.fee_profile.fee_status}
                    onChange={handleFeeProfileChange}
                  >
                    <option value="ACTIVE">ACTIVE (Generates Dues)</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="EXEMPT">EXEMPT (No Dues Ever Generated)</option>
                  </select>
                </div>

                <div>
                  <Label>Next Due Date</Label>
                  <Input
                    type="date"
                    name="next_due_date"
                    value={formData.fee_profile.next_due_date}
                    onChange={handleFeeProfileChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Late Fee Amount ($)</Label>
                  <Input
                    type="number"
                    name="late_fee_amount"
                    value={formData.fee_profile.late_fee_amount}
                    onChange={handleFeeProfileChange}
                  />
                </div>

                <div>
                  <Label>Late Fee Type</Label>
                  <select
                    name="late_fee_type"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.fee_profile.late_fee_type}
                    onChange={handleFeeProfileChange}
                  >
                    <option value="FIXED">Fixed Amount</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="auto_generate_due"
                    checked={formData.fee_profile.auto_generate_due}
                    onChange={handleFeeProfileChange}
                  />
                  <span>Auto Generate Monthly Due</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="auto_send_reminder"
                    checked={formData.fee_profile.auto_send_reminder}
                    onChange={handleFeeProfileChange}
                  />
                  <span>Auto Send Reminder</span>
                </label>
              </div>
            </div>

            {/* Submit Action Bar */}
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={loading}>
                Save Member & Fee Profile
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
