import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyReceiptToken } from '../../services/receipt.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatCurrency';

export const PublicVerifyReceiptPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    verifyReceiptToken(token)
      .then((res) => {
        setVerificationResult(res.data);
      })
      .catch((err) => {
        setVerificationResult({
          valid: false,
          message: err.response?.data?.message || 'Invalid or tampered receipt verification token'
        });
      })
      .finally(() => setLoading(false));
  }, [token]);

  const receiptInfo = verificationResult?.receipt;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="text-center space-y-6">
          <div>
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-600/30 mb-2">
              U
            </div>
            <h1 className="text-xl font-bold text-slate-100">UnionDesk 🇧🇩 Verification Portal</h1>
            <p className="text-xs text-slate-400 mt-0.5">Authenticity Verification for Financial Payment Receipts</p>
          </div>

          {loading ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : !token ? (
            <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-xl text-rose-300 text-xs">
              ⚠️ No receipt verification token provided in URL.
            </div>
          ) : verificationResult?.valid ? (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                <span>✓</span> OFFICIAL VERIFIED PAYMENT RECEIPT
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Receipt Number:</span>
                  <span className="font-mono font-bold text-slate-100">{receiptInfo.receipt_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Received From:</span>
                  <span className="font-bold text-slate-200">{receiptInfo.payer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Amount Paid:</span>
                  <span className="font-mono font-bold text-emerald-400">{formatCurrency(receiptInfo.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Payment Method:</span>
                  <span className="font-mono text-slate-300">{receiptInfo.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Particulars:</span>
                  <span className="text-slate-300">{receiptInfo.description}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 text-[11px] text-slate-400">
                  <span>Issued Date:</span>
                  <span>{new Date(receiptInfo.issue_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-xl text-rose-300 text-xs font-bold">
              ❌ {verificationResult?.message || 'Verification Failed'}
            </div>
          )}

          <div className="pt-2">
            <Link to="/login">
              <Button variant="secondary" className="w-full text-xs font-bold">
                Return to UnionDesk Portal
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
