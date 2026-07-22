import React, { useEffect, useState } from 'react';
import { fetchCampaigns, createCampaign, recordDonation, fetchDonations } from '../../services/donation.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { formatCurrency } from '../../utils/formatCurrency';

export const DonationDashboardPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  const [campaignData, setCampaignData] = useState({ title: '', target_amount: '', description: '' });
  const [donationData, setDonationData] = useState({ donor_name: '', donor_email: '', donor_phone: '', amount: '', payment_method: 'CASH', campaign_id: '' });

  const loadData = async () => {
    try {
      const [cRes, dRes] = await Promise.all([fetchCampaigns(), fetchDonations()]);
      setCampaigns(cRes.data);
      setDonations(dRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      await createCampaign({ ...campaignData, target_amount: parseFloat(campaignData.target_amount) });
      setIsCampaignModalOpen(false);
      loadData();
    } catch (e) {
      alert(e.response?.data?.message || 'Error creating campaign');
    }
  };

  const handleRecordDonation = async (e) => {
    e.preventDefault();
    try {
      await recordDonation({
        ...donationData,
        amount: parseFloat(donationData.amount),
        campaign_id: donationData.campaign_id || null
      });
      setIsDonationModalOpen(false);
      loadData();
    } catch (e) {
      alert(e.response?.data?.message || 'Error recording donation');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">UnionDesk 🇧🇩 Donations & Fundraising</h1>
            <p className="text-slate-400 mt-1">Manage public campaigns, track donor contributions & issue instant receipts</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsCampaignModalOpen(true)}>
              + Launch Campaign
            </Button>
            <Button onClick={() => setIsDonationModalOpen(true)}>
              + Record Contribution
            </Button>
          </div>
        </div>

        {/* Active Campaigns Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Active Campaigns</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {campaigns.map((c) => {
              const pct = Math.min(100, Math.round((c.raised_amount / c.target_amount) * 100)) || 0;
              return (
                <Card key={c._id} className="flex flex-col justify-between hover:border-emerald-500/50 transition-all">
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase">{c.status}</span>
                    <h3 className="text-lg font-bold text-slate-100 mt-2">{c.title}</h3>
                    <p className="text-xs text-slate-400 mb-4 line-clamp-2">{c.description}</p>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-400">Raised:</span>
                        <span className="font-bold text-emerald-400">{formatCurrency(c.raised_amount)} / {formatCurrency(c.target_amount)}</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="text-right block text-[10px] text-slate-400 font-mono">{pct}% Funded</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Donations Table */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Recent Donor Ledger</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Receipt No</th>
                  <th className="px-4 py-3">Donor Name</th>
                  <th className="px-4 py-3">Campaign</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {donations.map((d) => (
                  <tr key={d._id}>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-400">{d.receipt_no || '-'}</td>
                    <td className="px-4 py-3 font-bold text-slate-100">{d.donor_name}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{d.campaign_id?.title || 'General Support'}</td>
                    <td className="px-4 py-3 text-xs font-mono">{d.payment_method}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">{formatCurrency(d.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* Campaign Modal */}
        {isCampaignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md">
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Launch Campaign</h2>
                  <button onClick={() => setIsCampaignModalOpen(false)}>✕</button>
                </div>
                <form onSubmit={handleCreateCampaign} className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input type="text" value={campaignData.title} onChange={(e) => setCampaignData({ ...campaignData, title: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Target Amount</Label>
                    <Input type="number" step="0.01" value={campaignData.target_amount} onChange={(e) => setCampaignData({ ...campaignData, target_amount: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input type="text" value={campaignData.description} onChange={(e) => setCampaignData({ ...campaignData, description: e.target.value })} required />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={() => setIsCampaignModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Save Campaign</Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        )}

        {/* Donation Modal */}
        {isDonationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md">
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Record Contribution</h2>
                  <button onClick={() => setIsDonationModalOpen(false)}>✕</button>
                </div>
                <form onSubmit={handleRecordDonation} className="space-y-4">
                  <div>
                    <Label>Donor Name</Label>
                    <Input type="text" value={donationData.donor_name} onChange={(e) => setDonationData({ ...donationData, donor_name: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Contribution Amount</Label>
                    <Input type="number" step="0.01" value={donationData.amount} onChange={(e) => setDonationData({ ...donationData, amount: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Campaign</Label>
                    <select
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5"
                      value={donationData.campaign_id}
                      onChange={(e) => setDonationData({ ...donationData, campaign_id: e.target.value })}
                    >
                      <option value="">General Support Fund</option>
                      {campaigns.map((c) => (
                        <option key={c._id} value={c._id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Payment Method</Label>
                    <select
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg p-2.5"
                      value={donationData.payment_method}
                      onChange={(e) => setDonationData({ ...donationData, payment_method: e.target.value })}
                    >
                      <option value="CASH">Cash</option>
                      <option value="BKASH">bKash</option>
                      <option value="NAGAD">Nagad</option>
                      <option value="BANK">Bank Transfer</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={() => setIsDonationModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Confirm & Issue Receipt</Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
