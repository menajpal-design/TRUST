import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import {
  fetchSuperAdminMetrics,
  fetchAllUsers,
  promoteUserRole,
  updateTenantSubscriptionStatus
} from '../../services/superadmin.service';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';

export const SuperAdminDashboardPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'tenants'
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    if (user && !user.is_global_superadmin) {
      // Security Guard for Non-SuperAdmins
      alert('Access Denied: Only Platform Super Admins can access this area.');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mRes, uRes] = await Promise.all([
        fetchSuperAdminMetrics(),
        fetchAllUsers()
      ]);
      setMetrics(mRes.data);
      setUsers(uRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRolePromotion = async (userId, newRole) => {
    try {
      await promoteUserRole(userId, newRole);
      setActionMessage(`Role updated to ${newRole} & audit logged`);
      loadData();
    } catch (e) {
      alert(e.response?.data?.message || 'Role promotion failed');
    }
  };

  const handleStatusChange = async (orgId, status) => {
    try {
      await updateTenantSubscriptionStatus(orgId, status);
      setActionMessage(`Tenant subscription updated to ${status}`);
      loadData();
    } catch (e) {
      alert('Status update failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-purple-950 text-purple-300 border border-purple-800 font-mono px-2 py-0.5 rounded font-bold uppercase">
                👑 Super Admin Console
              </span>
            </div>
            <h1 className="text-3xl font-bold mt-1">Platform Control & System Management</h1>
            <p className="text-slate-400 text-sm mt-0.5">SaaS Multi-tenant provisioning, revenue analytics, role promotion & audit control</p>
          </div>
          <Link to="/dashboard">
            <Button variant="secondary">Back to Workspace</Button>
          </Link>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 gap-6">
          <button
            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'overview' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Platform Revenue & Overview
          </button>
          <button
            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'users' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setActiveTab('users')}
          >
            👤 User Management & Role Promotion
          </button>
          <button
            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'tenants' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setActiveTab('tenants')}
          >
            🏢 Tenant Organizations & Billing
          </button>
        </div>

        {actionMessage && <Alert type="success">{actionMessage}</Alert>}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : activeTab === 'overview' && metrics ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="!p-5 bg-indigo-950/40 border-indigo-500/40">
                <span className="text-xs text-indigo-400 font-semibold uppercase">Total Tenant Organizations</span>
                <p className="text-3xl font-bold text-slate-100 mt-1">{metrics.total_organizations}</p>
              </Card>

              <Card className="!p-5 bg-emerald-950/40 border-emerald-500/40">
                <span className="text-xs text-emerald-400 font-semibold uppercase">Aggregated Platform Revenue</span>
                <p className="text-3xl font-bold text-emerald-400 font-mono mt-1">${metrics.platform_revenue?.toLocaleString() || '0.00'}</p>
              </Card>

              <Card className="!p-5 bg-amber-950/40 border-amber-500/40">
                <span className="text-xs text-amber-400 font-semibold uppercase">Total Registered Users</span>
                <p className="text-3xl font-bold text-slate-100 mt-1">{metrics.total_users}</p>
              </Card>

              <Card className="!p-5 bg-purple-950/40 border-purple-500/40">
                <span className="text-xs text-purple-400 font-semibold uppercase">Active SaaS Subscriptions</span>
                <p className="text-xs text-slate-300 font-mono mt-2">
                  Free: {metrics.active_subscriptions?.FREE} | Starter: {metrics.active_subscriptions?.STARTER} | Pro: {metrics.active_subscriptions?.PRO}
                </p>
              </Card>
            </div>
          </>
        ) : activeTab === 'users' ? (
          /* User Management & Role Promotion Tab */
          <Card>
            <h2 className="text-xl font-bold mb-4">Platform Users & System Role Promotion</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Global Status</th>
                    <th className="px-4 py-3">Tenant Workspaces</th>
                    <th className="px-4 py-3 text-right">System Role Promotion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3.5 font-bold text-slate-100">
                        {u.first_name} {u.last_name}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-300">{u.email}</td>
                      <td className="px-4 py-3.5">
                        {u.is_global_superadmin ? (
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                            👑 Super Admin
                          </span>
                        ) : (
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                            Standard User
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-400">
                        {u.tenants?.length > 0 ? (
                          u.tenants.map((t, idx) => (
                            <span key={idx} className="inline-block bg-slate-900 px-2 py-0.5 rounded mr-1 mb-1 border border-slate-800">
                              {t.org_name} ({t.role_name})
                            </span>
                          ))
                        ) : (
                          'No Workspace'
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <select
                          className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          defaultValue={u.is_global_superadmin ? 'Super Admin' : 'Member'}
                          onChange={(e) => handleRolePromotion(u._id, e.target.value)}
                        >
                          <option value="Super Admin">Super Admin</option>
                          <option value="Admin">Admin</option>
                          <option value="Organization Owner">Organization Owner</option>
                          <option value="Manager">Manager</option>
                          <option value="Finance Manager">Finance Manager</option>
                          <option value="Committee Manager">Committee Manager</option>
                          <option value="Moderator">Moderator</option>
                          <option value="Member">Member</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          /* Tenant Organizations Directory Tab */
          <Card>
            <h2 className="text-xl font-bold mb-4">Registered Organizations & Subscription Control</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Organization Name</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {metrics?.recent_tenants?.map((org) => (
                    <tr key={org._id}>
                      <td className="px-4 py-3 font-bold text-slate-100">{org.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-indigo-400">{org.slug}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 uppercase font-bold">
                          {org.subscription_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => handleStatusChange(org._id, 'ACTIVE')}
                          className="text-xs text-emerald-400 font-bold"
                        >
                          Activate
                        </button>
                        <button
                          onClick={() => handleStatusChange(org._id, 'SUSPENDED')}
                          className="text-xs text-rose-400 font-bold"
                        >
                          Suspend
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
