import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { addMember, updateMember } from '../../services/member.service';

export const AddEditMemberModal = ({ isOpen, onClose, member = null, onSuccess }) => {
  if (!isOpen) return null;

  const isEdit = Boolean(member && member._id);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    member_code: '',
    phone: '',
    blood_group: '',
    emergency_contact: '',
    address: '',
    status: 'ACTIVE'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (member) {
      setFormData({
        first_name: member.user_id?.first_name || '',
        last_name: member.user_id?.last_name || '',
        email: member.user_id?.email || '',
        member_code: member.member_code || '',
        phone: member.phone || '',
        blood_group: member.blood_group || '',
        emergency_contact: member.emergency_contact || '',
        address: member.address || '',
        status: member.status || 'ACTIVE'
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        member_code: '',
        phone: '',
        blood_group: '',
        emergency_contact: '',
        address: '',
        status: 'ACTIVE'
      });
    }
  }, [member]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEdit) {
        await updateMember(member._id, formData);
      } else {
        await addMember(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save member record');
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
              {isEdit ? 'Edit Member Details' : 'Add New Member'}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-lg font-bold">
              ✕
            </button>
          </div>

          {error && <Alert type="error" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Last Name</Label>
                <Input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isEdit}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Member ID Code (Optional)</Label>
                <Input
                  type="text"
                  name="member_code"
                  placeholder="Auto-generated if blank"
                  value={formData.member_code}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Member Status</Label>
                <select
                  name="status"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PENDING">PENDING</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone Number</Label>
                <Input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Blood Group</Label>
                <Input
                  type="text"
                  name="blood_group"
                  placeholder="A+, O+, B-, etc."
                  value={formData.blood_group}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <Label>Emergency Contact</Label>
              <Input
                type="text"
                name="emergency_contact"
                placeholder="Name & Contact Phone"
                value={formData.emergency_contact}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Address</Label>
              <Input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={loading}>
                {isEdit ? 'Save Changes' : 'Add Member'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
