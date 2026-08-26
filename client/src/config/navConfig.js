export const NAV_SECTIONS = [
  {
    title: 'Dashboard',
    items: [
      { id: 'dashboard', title: 'Overview Dashboard', path: '/dashboard', icon: '📊', roles: ['ALL'] },
      { id: 'profile', title: 'আমার প্রোফাইল (My Profile)', path: '/profile', icon: '👤', roles: ['ALL'] }
    ]
  },
  {
    title: 'Organization & Administration',
    items: [
      { id: 'locations', title: 'Location Management', path: '/locations', icon: '📍', roles: ['ORG_OWNER', 'OWNER', 'ADMIN'] },
      { id: 'committees', title: 'Committees & Hierarchy', path: '/committees', icon: '👥', roles: ['ORG_OWNER', 'OWNER', 'ADMIN', 'MODERATOR'] },
      { id: 'documents', title: 'Constitution & Vault', path: '/documents', icon: '📂', roles: ['ORG_OWNER', 'OWNER', 'ADMIN'] }
    ]
  },
  {
    title: 'Members & ID Studio',
    items: [
      { id: 'members', title: 'Member Directory', path: '/members', icon: '🪪', roles: ['ORG_OWNER', 'OWNER', 'ADMIN', 'TREASURER', 'MODERATOR'] },
      { id: 'idcard', title: 'Smart PVC ID Studio', path: '/idcard', icon: '🆔', roles: ['ALL'] },
      { id: 'blood-relief', title: 'ব্লাড ক্যাম্পেইন ও ডিরেক্টরি', path: '/blood-relief', icon: '🩸', roles: ['ALL'] }
    ]
  },
  {
    title: 'Communication & Governance',
    items: [
      { id: 'notices', title: 'Notice Board & Alerts', path: '/notices', icon: '📢', roles: ['ALL'] },
      { id: 'meetings', title: 'ভোটিং ও মিটিং (E-Voting)', path: '/meetings', icon: '🗳️', roles: ['ALL'] },
      { id: 'events', title: 'Events & QR Tickets', path: '/events', icon: '🎟️', roles: ['ALL'] },
      { id: 'chat', title: 'Real-Time Workspaces', path: '/chat', icon: '💬', roles: ['ALL'] }
    ]
  },
  {
    title: 'Finance & Payments',
    items: [
      { id: 'fees', title: 'ফি জমা ও হিসাব (My Fees)', path: '/fees', icon: '💳', roles: ['ALL'] },
      { id: 'receipts', title: 'আমার রসিদ হিসাব (Receipts)', path: '/receipts', icon: '🧾', roles: ['ALL'] },
      { id: 'donations', title: 'পাবলিক ক্যাম্পেইন (Donations)', path: '/donations', icon: '💰', roles: ['ALL'] },
      { id: 'finance', title: 'Cashbook & Ledger', path: '/finance', icon: '💼', roles: ['ORG_OWNER', 'OWNER', 'ADMIN', 'TREASURER', 'AUDITOR'] },
      { id: 'budgets', title: 'Fiscal Budgets', path: '/budgets', icon: '🏛️', roles: ['ORG_OWNER', 'OWNER', 'ADMIN', 'TREASURER'] }
    ]
  },
  {
    title: 'Reports & Analytics',
    items: [
      { id: 'reports', title: 'Executive Reports', path: '/reports', icon: '📈', roles: ['ORG_OWNER', 'OWNER', 'ADMIN', 'TREASURER', 'MODERATOR', 'AUDITOR'] }
    ]
  },
  {
    title: 'Settings',
    items: [
      { id: 'settings', title: 'Enterprise Settings', path: '/settings', icon: '⚙️', roles: ['ORG_OWNER', 'OWNER', 'ADMIN'] }
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
