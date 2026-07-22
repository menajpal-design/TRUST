import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { verifyEmailToken } from '../../services/auth.service';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('Missing verification token');
      setLoading(false);
      return;
    }

    verifyEmailToken(token)
      .then((res) => {
        setSuccess(res.message);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Email verification failed');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md">
        <Card className="text-center">
          <h1 className="text-2xl font-bold text-slate-100 mb-4">Email Verification</h1>

          {loading && <p className="text-slate-400">Verifying your token...</p>}
          {error && <Alert type="error" className="mb-4">{error}</Alert>}
          {success && <Alert type="success" className="mb-4">{success}</Alert>}

          {!loading && (
            <Link to="/login">
              <Button className="w-full mt-4">Go to Login</Button>
            </Link>
          )}
        </Card>
      </div>
    </div>
  );
};
