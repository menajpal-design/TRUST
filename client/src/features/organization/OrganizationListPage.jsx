import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyOrganizations } from '../../services/organization.service';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CreateOrganizationModal } from './CreateOrganizationModal';
import useAuthStore from '../../store/useAuthStore';

export const OrganizationListPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { activeOrganization } = useAuthStore();

  const loadOrganizations = async () => {
    try {
      const res = await fetchMyOrganizations();
      setOrganizations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Organization Directory</h1>
            <p className="text-slate-400 mt-1">Manage and access all your subscribed multi-tenant organizations</p>
          </div>
          <div className="flex gap-3">
            <Link to="/dashboard">
              <Button variant="secondary">Back to Dashboard</Button>
            </Link>
            <Button onClick={() => setIsModalOpen(true)}>
              + Create Organization
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => {
              const isActive = activeOrganization?._id === org._id;
              return (
                <Card key={org._id} className="flex flex-col justify-between hover:border-indigo-500/50 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center font-bold text-indigo-400">
                        {org.logo_url ? (
                          <img src={org.logo_url} alt={org.name} className="w-full h-full object-cover" />
                        ) : (
                          org.name.charAt(0)
                        )}
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        isActive ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isActive ? 'Active Tenant' : org.user_role}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-100">{org.name}</h2>
                    <p className="text-sm font-mono text-indigo-400 mt-0.5">/{org.slug}</p>
                    {org.org_code && <p className="text-xs text-slate-500 mt-1">Code: {org.org_code}</p>}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Currency: {org.settings?.currency || 'USD'}
                    </span>
                    <Link to={`/organizations/settings?org_id=${org._id}`}>
                      <Button variant="outline" size="sm">
                        Settings
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <CreateOrganizationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadOrganizations}
        />
      </div>
    </div>
  );
};
