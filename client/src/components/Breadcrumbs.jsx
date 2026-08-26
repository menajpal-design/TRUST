import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const routeNameMap = {
  dashboard: 'Dashboard',
  members: 'Member Directory',
  fees: 'Fees & Dues',
  finance: 'Finance Ledger',
  receipts: 'Receipts',
  budgets: 'Budgets',
  reports: 'Reports',
  events: 'Events',
  notices: 'Notice Board',
  meetings: 'Meetings',
  chat: 'Workspaces',
  donations: 'Donations',
  committees: 'Committee Hierarchy',
  locations: 'Locations',
  idcard: 'ID Card Studio',
  documents: 'Documents',
  settings: 'Settings',
  superadmin: 'Super Admin',
  'blood-relief': 'Blood Relief Directory',
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 py-2.5 px-4 sm:px-6 border-b border-slate-800/40 bg-slate-950/50 overflow-x-auto whitespace-nowrap">
      <Link to="/dashboard" className="hover:text-slate-300 transition-colors flex items-center gap-1 flex-shrink-0">
        <span className="text-xs">🏠</span>
        <span>Home</span>
      </Link>

      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNameMap[name] || name.charAt(0).toUpperCase() + name.slice(1);

        return (
          <React.Fragment key={routeTo}>
            <span className="text-slate-700 flex-shrink-0">/</span>
            {isLast ? (
              <span className="text-indigo-400 font-semibold flex-shrink-0">{displayName}</span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-slate-300 transition-colors flex-shrink-0"
              >
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
