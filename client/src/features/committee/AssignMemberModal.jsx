import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { assignCommitteeMember } from '../../services/committee.service';
import useAuthStore from '../../store/useAuthStore';

export const AssignMemberModal = ({ isOpen, onClose, committeeId, onSuccess }) => {
  if (!isOpen) return null;

  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    user_id: user?._id || '',
    position_title: '',
    position_order: 10,
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'position_order' ? parseInt(value, 10) || 99 : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await assignCommitteeMember(committeeId, formData);
      onSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign committee member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-100">Assign Member & Position</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-lg font-bold">
              ✕
            </button>
          </div>

          {error && <Alert type="error" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>User ID / Member Reference</Label>
              <Input
                type="text"
                name="user_id"
                placeholder="MongoDB User ObjectId"
                value={formData.user_id}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Dynamic Position Title</Label>
              <Input
                type="text"
                name="position_title"
                placeholder="e.g. Chairman, General Secretary, Treasurer"
                value={formData.position_title}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Hierarchy Priority Order (1 = Highest)</Label>
              <Input
                type="number"
                name="position_order"
                placeholder="1 for Chairman, 2 for VP, 99 for Member"
                value={formData.position_order}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>End Date (Optional)</Label>
                <Input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={loading}>
                Assign Position
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
