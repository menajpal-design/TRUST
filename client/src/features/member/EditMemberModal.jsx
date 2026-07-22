import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { updateMember } from '../../services/member.service';

export const EditMemberModal = ({ isOpen, onClose, member, onSuccess }) => {
  if (!isOpen || !member) return null;

  const user = member.user_id || {};
  const existingFp = member.fee_profile || {};

  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    phone: member.phone || '',
    address: member.address || '',
    member_code: member.member_code || '',
    membership_type: member.membership_type || 'GENERAL',
    status: member.status || 'ACTIVE',
    committee_level: member.committee_level || 'NONE',
    position_title: member.position_title || 'Member',
    system_role: member.role_id?.name || 'MEMBER',
    custom_permissions: member.custom_permissions || [],
    fee_profile: {
      custom_fee_amount: existingFp.custom_fee_amount !== null && existingFp.custom_fee_amount !== undefined ? existingFp.custom_fee_amount : '',
      fee_frequency: existingFp.fee_frequency || 'MONTHLY',
      fee_start_date: existingFp.fee_start_date ? new Date(existingFp.fee_start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      next_due_date: existingFp.next_due_date ? new Date(existingFp.next_due_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      grace_period_days: existingFp.grace_period_days || 5,
      late_fee_amount: existingFp.late_fee_amount || 10,
      late_fee_type: existingFp.late_fee_type || 'FIXED',
      fee_status: existingFp.fee_status || 'ACTIVE',
      auto_generate_due: existingFp.auto_generate_due !== undefined ? existingFp.auto_generate_due : true,
      auto_send_reminder: existingFp.auto_send_reminder !== undefined ? existingFp.auto_send_reminder : true,
      auto_generate_receipt: existingFp.auto_generate_receipt !== undefined ? existingFp.auto_generate_receipt : true
    },
    change_reason: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      await updateMember(member._id, payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update member');
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
              <h2 className="text-xl font-bold text-slate-100">Edit Member Roles & Fee Profile</h2>
              <p className="text-xs text-indigo-400 font-mono">Member Code: {member.member_code}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-lg font-bold">
              ✕
            </button>
          </div>

          {error && <Alert type="error" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Details */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Personal Details</h3>
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
            </div>

            {/* Fee Profile Configuration */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-indigo-500/40">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>💳</span> Fee Profile Configuration
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Custom Fee Amount ($)</Label>
                  <Input
                    type="number"
                    name="custom_fee_amount"
                    placeholder="Leave empty for Org Default"
                    value={formData.fee_profile.custom_fee_amount}
                    onChange={handleFeeProfileChange}
                  />
                </div>

                <div>
                  <Label>Fee Status</Label>
                  <select
                    name="fee_status"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.fee_profile.fee_status}
                    onChange={handleFeeProfileChange}
                  >
                    <option value="ACTIVE">ACTIVE (Generates Dues)</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="EXEMPT">EXEMPT (No Dues Ever Generated)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              <div className="flex flex-wrap gap-4 pt-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="auto_generate_due"
                    checked={formData.fee_profile.auto_generate_due}
                    onChange={handleFeeProfileChange}
                  />
                  <span>Auto Generate Due</span>
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

            {/* Revision Reason */}
            <div>
              <Label>Reason for Revision (Logged to Audit History)</Label>
              <Input
                type="text"
                name="change_reason"
                placeholder="e.g. Updated fee profile & membership tier"
                value={formData.change_reason}
                onChange={handleChange}
              />
            </div>

            {/* Submit Bar */}
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={loading}>
                Save Changes & Log History
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
