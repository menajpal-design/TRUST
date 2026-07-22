import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const routeNameMap = {
    dashboard: 'Dashboard',
    donations: 'Donations & Campaigns',
    events: 'Events & QR Tickets',
    chat: 'Workspaces & Chat',
    reports: 'Executive Reports',
    receipts: 'Payment Receipts',
    finance: 'Finance & Ledger',
    budgets: 'Fiscal Budgets',
    members: 'Member Directory',
    committees: 'Committee Hierarchy',
    organizations: 'Organizations',
    settings: 'Settings',
    superadmin: 'Super Admin Control'
  };

  return (
    <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 py-2 px-6 bg-slate-950/40 border-b border-slate-900">
      <Link to="/dashboard" className="hover:text-slate-200 transition-colors">
        🏠 Home
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNameMap[name] || name;

        return (
          <React.Fragment key={routeTo}>
            <span className="text-slate-600">/</span>
            {isLast ? (
              <span className="text-indigo-400 font-bold capitalize">{displayName}</span>
            ) : (
              <Link to={routeTo} className="hover:text-slate-200 transition-colors capitalize">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
