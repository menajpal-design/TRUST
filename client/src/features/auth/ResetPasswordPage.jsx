import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { resetPasswordToken } from '../../services/auth.service';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await resetPasswordToken(token, newPassword);
      setSuccess(response.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-100">Set New Password</h1>
          <p className="text-sm text-slate-400 mt-1">Enter your new secure password below</p>
        </div>

        <Card>
          {error && <Alert type="error" className="mb-4">{error}</Alert>}
          {success && <Alert type="success" className="mb-4">{success}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" isLoading={loading}>
              Reset Password
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
              Back to Login
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};
