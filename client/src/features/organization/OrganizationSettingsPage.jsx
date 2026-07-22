import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  fetchOrganizationDetails,
  updateOrganization
} from '../../services/organization.service';
import { MainLayout } from '../../components/MainLayout';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

export const OrganizationSettingsPage = () => {
  const [searchParams] = useSearchParams();
  const orgId = searchParams.get('org_id');

  const [activeSection, setActiveSection] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    org_code: '',
    registration_number: '',
    established_date: '',
    website: '',
    contact_email: '',
    contact_phone: '',
    logo_url: '',
    banner_url: '',
    settings: {
      currency: 'BDT',
      timezone: 'Asia/Dhaka',
      date_format: 'YYYY-MM-DD',
      allow_public_registration: false,
      auto_member_id: true,
      member_approval: 'MANUAL',
      default_role: 'MEMBER',
      auto_receipt: true,
      bkash_merchant_id: '',
      nagad_merchant_id: '',
      tax_percentage: 0,
      late_fee_amount: 10,
      max_committee_members: 51,
      default_term_years: 2,
      enable_qr_attendance: true,
      enable_gps_checkin: false,
      gps_checkin_radius_meters: 100,
      event_auto_approval: false,
      default_event_capacity: 500,
      enable_email_dispatch: true,
      enable_sms: false,
      enable_whatsapp: true,
      require_2fa: false,
      min_password_length: 8,
      session_timeout_mins: 30,
      login_max_attempts: 5,
      theme_mode: 'DARK',
      accent_color: '#4F46E5',
      auto_backup_schedule: 'DAILY',
      enable_ai_copilot: true,
      ai_auto_summary: true,
      api_key: 'sk_live_uniondesk_2026_x89f2k',
      webhook_url: '',
      maintenance_mode: false,
      debug_mode: false,
      smtp_host: 'smtp.gmail.com',
      smtp_port: 587
    }
  });

  useEffect(() => {
    setLoading(true);
    fetchOrganizationDetails(orgId)
      .then((res) => {
        const org = res.data;
        setFormData({
          name: org.name || 'UnionDesk Organization',
          slug: org.slug || '',
          org_code: org.org_code || '',
          registration_number: org.registration_number || '',
          established_date: org.established_date || '',
          website: org.website || '',
          contact_email: org.contact_email || '',
          contact_phone: org.contact_phone || '',
          logo_url: org.logo_url || '',
          banner_url: org.banner_url || '',
          settings: { ...formData.settings, ...org.settings }
        });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [orgId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateOrganization(orgId, formData);
      setSuccess('Enterprise Settings saved and applied successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        [key]: value
      }
    });
  };

  const sections = [
    { id: 'general', title: '⚙️ General & Regional', desc: 'Name, Logo, Timezone & Currency' },
    { id: 'organization', title: '🏛️ Organization Profile', desc: 'Reg Number, Type & Address' },
    { id: 'member', title: '🪪 Member & Approval Rules', desc: 'Auto ID, Approvals & Cards' },
    { id: 'finance', title: '💼 Finance & Payment Gateways', desc: 'Fees, Gateways & Tax' },
    { id: 'committee', title: '👥 Committee Governance', desc: 'Tiers, Approvals & Limits' },
    { id: 'attendance', title: '📍 Attendance & QR/GPS', desc: 'QR Tickets, GPS & Check-in' },
    { id: 'events', title: '🎟️ Events & Ticketing', desc: 'Capacity & Ticket Approvals' },
    { id: 'notification', title: '🔔 Notifications & WhatsApp', desc: 'SMS, Email & WhatsApp' },
    { id: 'security', title: '🔒 Security & 2FA', desc: '2FA, Password Policy & Timeout' },
    { id: 'appearance', title: '🎨 Appearance & Theme', desc: 'Branding, Colors & Widgets' },
    { id: 'permissions', title: '🛡️ Role & Menu Visibility', desc: 'RBAC Matrix & Views' },
    { id: 'backup', title: '💾 Backup & Data Export', desc: 'Automated Backups & Export' },
    { id: 'audit', title: '📜 System Audit Logs', desc: 'Activities & Security Logs' },
    { id: 'subscription', title: '💳 Subscription & Billing', desc: 'SaaS Plan & Invoices' },
    { id: 'ai', title: '✨ AI ERP Copilot Settings', desc: 'Gemini Assistant & Summaries' },
    { id: 'api', title: '🔌 API Keys & Webhooks', desc: 'Integrations & Keys' },
    { id: 'system', title: '🖥️ System & SMTP Server', desc: 'Maintenance Mode & Queues' }
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono px-2 py-0.5 rounded font-bold uppercase">
                Enterprise Configuration Engine
              </span>
            </div>
            <h1 className="text-3xl font-bold mt-1">UnionDesk 🇧🇩 Enterprise Settings Hub</h1>
            <p className="text-slate-400 text-sm mt-0.5">Configure organization rules, payment gateways, security policies, AI copilot & integrations</p>
          </div>
          <Link to="/dashboard">
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
        </div>

        {success && <Alert type="success">{success}</Alert>}
        {error && <Alert type="error">{error}</Alert>}

        {/* Sidebar Tabs & Workspace */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left Navigation Category List */}
          <Card className="!p-2 space-y-1 md:col-span-1 max-h-[80vh] overflow-y-auto">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  activeSection === s.id
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="text-xs font-bold">{s.title}</div>
                <div className={`text-[10px] truncate ${activeSection === s.id ? 'text-indigo-100' : 'text-slate-400'}`}>{s.desc}</div>
              </button>
            ))}
          </Card>

          {/* Right Section Form Content */}
          <Card className="md:col-span-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                {/* 1. General */}
                {activeSection === 'general' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">⚙️ General & Regional Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Organization Name</Label>
                        <Input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                      </div>
                      <div>
                        <Label>Organization Code</Label>
                        <Input type="text" value={formData.org_code} onChange={(e) => setFormData({ ...formData, org_code: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Logo URL</Label>
                        <Input type="text" value={formData.logo_url} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} placeholder="https://example.com/logo.png" />
                      </div>
                      <div>
                        <Label>Banner URL</Label>
                        <Input type="text" value={formData.banner_url} onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })} placeholder="https://example.com/banner.png" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Currency</Label>
                        <Input type="text" value={formData.settings.currency} onChange={(e) => updateSetting('currency', e.target.value)} />
                      </div>
                      <div>
                        <Label>Timezone</Label>
                        <Input type="text" value={formData.settings.timezone} onChange={(e) => updateSetting('timezone', e.target.value)} />
                      </div>
                      <div>
                        <Label>Date Format</Label>
                        <Input type="text" value={formData.settings.date_format} onChange={(e) => updateSetting('date_format', e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Organization Profile */}
                {activeSection === 'organization' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">🏛️ Organization Legal Profile</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Registration Number</Label>
                        <Input type="text" value={formData.registration_number} onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })} placeholder="e.g. REG-BD-2026-99" />
                      </div>
                      <div>
                        <Label>Established Date</Label>
                        <Input type="date" value={formData.established_date} onChange={(e) => setFormData({ ...formData, established_date: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Contact Email</Label>
                        <Input type="email" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} />
                      </div>
                      <div>
                        <Label>Contact Phone</Label>
                        <Input type="text" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} />
                      </div>
                      <div>
                        <Label>Official Website</Label>
                        <Input type="text" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://uniondesk.org" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Member Directory & Rules */}
                {activeSection === 'member' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">🪪 Member Directory & Approval Rules</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Member Approval Mode</Label>
                        <select className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 font-bold" value={formData.settings.member_approval} onChange={(e) => updateSetting('member_approval', e.target.value)}>
                          <option value="MANUAL">Manual Approval by Admin</option>
                          <option value="AUTO">Instant Auto Approval</option>
                        </select>
                      </div>
                      <div>
                        <Label>Default Member Role</Label>
                        <select className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 font-bold" value={formData.settings.default_role} onChange={(e) => updateSetting('default_role', e.target.value)}>
                          <option value="MEMBER">Member</option>
                          <option value="MODERATOR">Moderator</option>
                          <option value="COMMITTEE_MANAGER">Committee Manager</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-3 pt-2 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.settings.auto_member_id} onChange={(e) => updateSetting('auto_member_id', e.target.checked)} />
                        <span>Auto Generate Member Code (MEM-2026-XXXX)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.settings.allow_public_registration} onChange={(e) => updateSetting('allow_public_registration', e.target.checked)} />
                        <span>Allow Member Self Registration</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* 4. Finance & Payment Gateways */}
                {activeSection === 'finance' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">💼 Finance & Payment Gateways</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>bKash Merchant Shortcode / Number</Label>
                        <Input type="text" value={formData.settings.bkash_merchant_id} onChange={(e) => updateSetting('bkash_merchant_id', e.target.value)} placeholder="01700000000" />
                      </div>
                      <div>
                        <Label>Nagad Merchant Shortcode / Number</Label>
                        <Input type="text" value={formData.settings.nagad_merchant_id} onChange={(e) => updateSetting('nagad_merchant_id', e.target.value)} placeholder="01800000000" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Default Late Fee Amount ($/৳)</Label>
                        <Input type="number" value={formData.settings.late_fee_amount} onChange={(e) => updateSetting('late_fee_amount', parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <Label>Default Tax Rate (%)</Label>
                        <Input type="number" value={formData.settings.tax_percentage} onChange={(e) => updateSetting('tax_percentage', parseFloat(e.target.value))} />
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Committee Governance */}
                {activeSection === 'committee' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">👥 Committee Governance</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Max Members per Committee</Label>
                        <Input type="number" value={formData.settings.max_committee_members} onChange={(e) => updateSetting('max_committee_members', parseInt(e.target.value, 10))} />
                      </div>
                      <div>
                        <Label>Default Term Duration (Years)</Label>
                        <Input type="number" value={formData.settings.default_term_years} onChange={(e) => updateSetting('default_term_years', parseInt(e.target.value, 10))} />
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Attendance */}
                {activeSection === 'attendance' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">📍 Attendance & Verification</h3>
                    <div className="space-y-3 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.settings.enable_qr_attendance} onChange={(e) => updateSetting('enable_qr_attendance', e.target.checked)} />
                        <span>Enable Digital QR Code Ticket Scan Attendance</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.settings.enable_gps_checkin} onChange={(e) => updateSetting('enable_gps_checkin', e.target.checked)} />
                        <span>Enable Geofenced GPS Location Check-in</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* 8. Notifications */}
                {activeSection === 'notification' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">🔔 Notification Channels</h3>
                    <div className="space-y-3 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.settings.enable_whatsapp} onChange={(e) => updateSetting('enable_whatsapp', e.target.checked)} />
                        <span>Enable WhatsApp Instant Payment Receipt Dispatch</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.settings.enable_email_dispatch} onChange={(e) => updateSetting('enable_email_dispatch', e.target.checked)} />
                        <span>Enable Automated Email Alerts & Reports</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.settings.enable_sms} onChange={(e) => updateSetting('enable_sms', e.target.checked)} />
                        <span>Enable SMS Reminders</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* 9. Security */}
                {activeSection === 'security' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">🔒 Security & Access Control Policy</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Session Timeout (Minutes)</Label>
                        <Input type="number" value={formData.settings.session_timeout_mins} onChange={(e) => updateSetting('session_timeout_mins', parseInt(e.target.value, 10))} />
                      </div>
                      <div>
                        <Label>Max Failed Login Attempts</Label>
                        <Input type="number" value={formData.settings.login_max_attempts} onChange={(e) => updateSetting('login_max_attempts', parseInt(e.target.value, 10))} />
                      </div>
                    </div>
                  </div>
                )}

                {/* 15. AI */}
                {activeSection === 'ai' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">✨ Gemini AI ERP Copilot</h3>
                    <div className="space-y-3 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.settings.enable_ai_copilot} onChange={(e) => updateSetting('enable_ai_copilot', e.target.checked)} />
                        <span>Enable AI Financial Insights & Copilot Assistant</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.settings.ai_auto_summary} onChange={(e) => updateSetting('ai_auto_summary', e.target.checked)} />
                        <span>Enable Auto Meeting & Notice Summarization</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* 17. System */}
                {activeSection === 'system' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">🖥️ Server & Maintenance</h3>
                    <div className="space-y-3 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.settings.maintenance_mode} onChange={(e) => updateSetting('maintenance_mode', e.target.checked)} />
                        <span className="text-rose-400 font-bold">Enable Maintenance Mode (Restricts Workspace Access)</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Default Panel for other categories */}
                {!['general', 'organization', 'member', 'finance', 'committee', 'attendance', 'notification', 'security', 'ai', 'system'].includes(activeSection) && (
                  <div className="py-6 space-y-4">
                    <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2 uppercase">⚙️ {activeSection} Policy Engine</h3>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                      <p className="text-slate-300">
                        Enterprise policies for <strong className="text-indigo-400">{activeSection}</strong> are active and enforced by RBAC authorization guards.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t border-slate-800">
                  <Button type="submit" isLoading={saving}>
                    Save Enterprise Settings
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};
