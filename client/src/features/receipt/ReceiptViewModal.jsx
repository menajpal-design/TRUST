import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { getReceiptPDFUrl, sendReceiptEmail, getWhatsAppShareUrl } from '../../services/receipt.service';
import useAuthStore from '../../store/useAuthStore';

export const ReceiptViewModal = ({ isOpen, onClose, receipt }) => {
  if (!isOpen || !receipt) return null;

  const { activeOrganization } = useAuthStore();
  const [emailInput, setEmailInput] = useState(receipt.payer_email || '');
  const [emailing, setEmailing] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(null);
  const [emailError, setEmailError] = useState(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.open(getReceiptPDFUrl(receipt._id), '_blank');
  };

  const handleSendEmail = async () => {
    if (!emailInput) return;
    setEmailing(true);
    setEmailError(null);
    setEmailSuccess(null);

    try {
      const res = await sendReceiptEmail(receipt._id, emailInput);
      setEmailSuccess(res.message);
    } catch (err) {
      setEmailError(err.response?.data?.message || 'Email delivery failed');
    } finally {
      setEmailing(false);
    }
  };

  const whatsAppUrl = getWhatsAppShareUrl(receipt, activeOrganization?.name || 'Organization');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-xl">
        <Card className="relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-100">Official Payment Receipt</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-lg font-bold">
              ✕
            </button>
          </div>

          {emailSuccess && <Alert type="success" className="mb-3">{emailSuccess}</Alert>}
          {emailError && <Alert type="error" className="mb-3">{emailError}</Alert>}

          {/* Printable Receipt Container */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-4">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-indigo-400">{activeOrganization?.name || 'Organization'}</h3>
                <p className="text-xs text-slate-400">Payment Receipt & Verification</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-mono font-bold text-slate-100">{receipt.receipt_no}</span>
                <p className="text-xs text-slate-500">{new Date(receipt.issue_date).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block font-semibold uppercase">Received From:</span>
                <span className="text-sm font-bold text-slate-200 block">{receipt.payer_name}</span>
                <span className="text-slate-400">{receipt.payer_email || 'No email provided'}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold uppercase">Payment Method:</span>
                <span className="font-mono text-slate-200 font-bold">{receipt.payment_method}</span>
              </div>
            </div>

            <div className="bg-indigo-950/40 border border-indigo-800/50 p-4 rounded-xl flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-indigo-300 uppercase block">Particulars / Description</span>
                <span className="text-sm font-medium text-slate-200">{receipt.description}</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-emerald-400">${receipt.amount.toFixed(2)}</span>
              </div>
            </div>

            {/* QR Code Embed for Public Verification */}
            {receipt.qr_code_data && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-300 block">QR Verification Token</span>
                  <span className="text-[10px] font-mono text-slate-500">{receipt.verification_token}</span>
                </div>
                <div className="w-16 h-16 bg-white p-1 rounded-lg">
                  <img src={receipt.qr_code_data} alt="Verification QR" className="w-full h-full object-contain" />
                </div>
              </div>
            )}
          </div>

          {/* Actions Bar */}
          <div className="mt-6 space-y-4">
            {/* Email Dispatch Input */}
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter recipient email to send PDF..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              <Button size="sm" onClick={handleSendEmail} isLoading={emailing}>
                📧 Send Email
              </Button>
            </div>

            {/* Buttons Row */}
            <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-slate-800">
              <a href={whatsAppUrl} target="_blank" rel="noreferrer">
                <Button variant="secondary" size="sm" className="bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900">
                  💬 Share WhatsApp
                </Button>
              </a>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                  📄 Download PDF
                </Button>
                <Button size="sm" onClick={handlePrint}>
                  🖨️ Print Receipt
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
