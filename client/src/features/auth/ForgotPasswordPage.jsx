import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { sendForgotPassword } from '../../services/auth.service';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await sendForgotPassword(email);
      setSuccess(response.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-100">Forgot Password</h1>
          <p className="text-sm text-slate-400 mt-1">Enter your registered email to receive a reset link</p>
        </div>

        <Card>
          {error && <Alert type="error" className="mb-4">{error}</Alert>}
          {success && <Alert type="success" className="mb-4">{success}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="name@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" isLoading={loading}>
              Send Reset Link
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Remember your password?{' '}
            <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
              Back to Login
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};
