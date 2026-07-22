import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { createOrganization } from '../../services/organization.service';

export const CreateOrganizationModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    org_code: '',
    contact_email: '',
    contact_phone: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...formData, [name]: value };

    if (name === 'name' && !formData.slug_edited) {
      updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    if (name === 'slug') {
      updated.slug_edited = true;
    }

    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await createOrganization(formData);
      onSuccess(response.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg">
        <Card className="relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-100">Create New Organization</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 text-lg font-bold"
            >
              ✕
            </button>
          </div>

          {error && <Alert type="error" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Organization Name</Label>
              <Input
                type="text"
                name="name"
                placeholder="Global Commerce Association"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Organization Slug / Subdomain</Label>
              <Input
                type="text"
                name="slug"
                placeholder="global-commerce"
                value={formData.slug}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Organization Code</Label>
                <Input
                  type="text"
                  name="org_code"
                  placeholder="GCA-2026"
                  value={formData.org_code}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Contact Phone</Label>
                <Input
                  type="text"
                  name="contact_phone"
                  placeholder="+1 (555) 019-2831"
                  value={formData.contact_phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <Label>Contact Email</Label>
              <Input
                type="email"
                name="contact_email"
                placeholder="admin@gca.org"
                value={formData.contact_email}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={loading}>
                Create Organization
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
