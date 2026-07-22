export const NAV_SECTIONS = [
  {
    title: 'Dashboard',
    items: [
      { id: 'dashboard', title: 'Overview Dashboard', path: '/dashboard', icon: '📊', roles: ['ALL'] }
    ]
  },
  {
    title: 'Organization',
    items: [
      { id: 'locations', title: 'Location Management', path: '/locations', icon: '📍', roles: ['ALL'] },
      { id: 'committees', title: 'Committees & Hierarchy', path: '/committees', icon: '👥', roles: ['ALL'] },
      { id: 'documents', title: 'Constitution & Vault', path: '/documents', icon: '📂', roles: ['ALL'] }
    ]
  },
  {
    title: 'Members & Directory',
    items: [
      { id: 'members', title: 'Member Directory', path: '/members', icon: '🪪', roles: ['ALL'] },
      { id: 'idcard', title: 'Smart PVC ID Studio', path: '/idcard', icon: '🆔', roles: ['ALL'] },
      { id: 'blood-relief', title: 'Emergency Blood Directory', path: '/blood-relief', icon: '🩸', roles: ['ALL'] }
    ]
  },
  {
    title: 'Communication & Governance',
    items: [
      { id: 'notices', title: 'Notice Board & Alerts', path: '/notices', icon: '📢', roles: ['ALL'] },
      { id: 'meetings', title: 'MoM & E-Voting Polls', path: '/meetings', icon: '📋', roles: ['ALL'] },
      { id: 'events', title: 'Events & QR Tickets', path: '/events', icon: '🎟️', roles: ['ALL'] },
      { id: 'chat', title: 'Real-Time Workspaces', path: '/chat', icon: '💬', roles: ['ALL'] }
    ]
  },
  {
    title: 'Finance & Fees',
    items: [
      { id: 'fees', title: 'Membership Fees', path: '/fees', icon: '💳', roles: ['ALL'] },
      { id: 'donations', title: 'Donations & Campaigns', path: '/donations', icon: '💰', roles: ['ALL'] },
      { id: 'finance', title: 'Cashbook & Ledger', path: '/finance', icon: 'ALL' },
      { id: 'budgets', title: 'Fiscal Budgets', path: '/budgets', icon: '🏛️', roles: ['ALL'] },
      { id: 'receipts', title: 'Payment Receipts', path: '/receipts', icon: '🧾', roles: ['ALL'] }
    ]
  },
  {
    title: 'Reports & Analytics',
    items: [
      { id: 'reports', title: 'Executive Reports', path: '/reports', icon: '📈', roles: ['ALL'] }
    ]
  },
  {
    title: 'Settings',
    items: [
      { id: 'settings', title: 'Enterprise Settings', path: '/settings', icon: '⚙️', roles: ['ALL'] }
    ]
  },
  {
    title: 'Administration',
    items: [
      { id: 'superadmin', title: 'Super Admin Control', path: '/superadmin', icon: '👑', roles: ['SUPERADMIN'] }
    ]
  }
];

export const generateFilteredNav = (user, activeOrg) => {
  const isSuperAdmin = user?.is_global_superadmin;
  const rawRole = activeOrg?.role || activeOrg?.user_role || user?.role || 'MEMBER';
  const normRole = String(rawRole).toUpperCase();

  return NAV_SECTIONS.map((section) => {
    const filteredItems = section.items.filter((item) => {
      if (isSuperAdmin) return true;
      if (!item.roles || item.roles.includes('ALL') || item.roles === 'ALL') return true;
      if (item.roles.includes('SUPERADMIN') && !isSuperAdmin) return false;
      return item.roles.some(r => r.toUpperCase() === normRole || normRole.includes(r.toUpperCase()));
    });

    return {
      ...section,
      items: filteredItems
    };
  }).filter((section) => section.items.length > 0);
};
