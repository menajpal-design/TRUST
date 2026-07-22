import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { registerUser } from '../../services/auth.service';

export const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    org_name: '',
    org_slug: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...formData, [name]: value };

    // Auto-generate org_slug from org_name if user hasn't edited slug manually
    if (name === 'org_name' && !formData.org_slug_edited) {
      updated.org_slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    if (name === 'org_slug') {
      updated.org_slug_edited = true;
    }

    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await registerUser(formData);
      setSuccess(response.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-3">
            <span className="text-xl font-bold text-white">S</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Register Organization</h1>
          <p className="text-sm text-slate-400 mt-1">Start managing your organization in minutes</p>
        </div>

        <Card>
          {error && <Alert type="error" className="mb-4">{error}</Alert>}
          {success && <Alert type="success" className="mb-4">{success}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  type="text"
                  name="first_name"
                  placeholder="John"
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
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Work Email</Label>
              <Input
                type="email"
                name="email"
                placeholder="john@organization.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                name="password"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <hr className="border-slate-800 my-2" />

            <div>
              <Label>Organization Name</Label>
              <Input
                type="text"
                name="org_name"
                placeholder="Apex Alumni Association"
                value={formData.org_name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Organization Slug / URL Prefix</Label>
              <Input
                type="text"
                name="org_slug"
                placeholder="apex-alumni"
                value={formData.org_slug}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={loading}>
              Create Account & Organization
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};
