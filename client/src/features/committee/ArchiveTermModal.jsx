import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { archiveCommitteeTerm } from '../../services/committee.service';

export const ArchiveTermModal = ({ isOpen, onClose, committeeId, onSuccess }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    term_name: `Tenure ${new Date().getFullYear()} - ${new Date().getFullYear() + 2}`,
    notes: '',
    new_term_start_date: new Date().toISOString().split('T')[0],
    new_term_end_date: ''
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
      const res = await archiveCommitteeTerm(committeeId, formData);
      onSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to archive committee term');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-100">Archive Committee Term</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-lg font-bold">
              ✕
            </button>
          </div>

          {error && <Alert type="error" className="mb-4">{error}</Alert>}

          <p className="text-xs text-amber-400 mb-4 bg-amber-950/40 p-3 rounded-lg border border-amber-800">
            ⚠️ Archiving will save a permanent historical snapshot of current active members and reset committee positions for the new term.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Term Identifier / Name</Label>
              <Input
                type="text"
                name="term_name"
                value={formData.term_name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Notes & Remarks</Label>
              <Input
                type="text"
                name="notes"
                placeholder="Key achievements during this tenure"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>New Term Start Date</Label>
                <Input
                  type="date"
                  name="new_term_start_date"
                  value={formData.new_term_start_date}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>New Term End Date</Label>
                <Input
                  type="date"
                  name="new_term_end_date"
                  value={formData.new_term_end_date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" isLoading={loading}>
                Archive & Start New Term
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
