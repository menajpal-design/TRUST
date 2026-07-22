import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { loginUser } from '../../services/auth.service';
import useAuthStore from '../../store/useAuthStore';

export const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    org_slug: ''
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
      const response = await loginUser(formData);
      setAuth({
        user: response.data.user,
        activeOrganization: response.data.activeOrganization,
        organizations: response.data.organizations,
        accessToken: response.data.accessToken
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-3">
            <span className="text-xl font-bold text-white">S</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Welcome Back</h1>
          <p className="text-sm text-slate-400 mt-1">Sign in to your organization account</p>
        </div>

        <Card>
          {error && <Alert type="error" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                name="email"
                placeholder="name@organization.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label className="mb-0">Password</Label>
                <Link to="/forgot-password" className="text-xs text-indigo-400 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <Input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Organization Slug (Optional)</Label>
              <Input
                type="text"
                name="org_slug"
                placeholder="e.g. rotary-club"
                value={formData.org_slug}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" className="w-full" isLoading={loading}>
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 font-semibold hover:underline">
              Create an Organization
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};
