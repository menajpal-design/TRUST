import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { generateFilteredNav } from '../config/navConfig';

export const Sidebar = ({ isCollapsed, onToggle }) => {
  const { user, activeOrganization } = useAuthStore();
  const location = useLocation();
  const [filterText, setFilterText] = useState('');

  const isSuperAdmin = user?.is_global_superadmin;
  const userRole = activeOrganization?.role || user?.role || 'MEMBER';

  const navSections = generateFilteredNav(user, activeOrganization);

  return (
    <aside
      className={`hidden md:flex bg-slate-900/90 border-r border-slate-800 backdrop-blur-md flex-col justify-between transition-all duration-300 z-40 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md shadow-emerald-600/30">
              U
            </div>
            <div className="truncate">
              <span className="font-bold text-slate-100 text-sm flex items-center gap-1 truncate">
                UnionDesk <span className="text-xs">🇧🇩</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 block uppercase font-bold truncate">
                {activeOrganization?.name || 'BD Workspace'}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-bold"
        >
          {isCollapsed ? '➔' : '⬅'}
        </button>
      </div>

      {/* Menu Filter Search (if expanded) */}
      {!isCollapsed && (
        <div className="px-3 pt-3">
          <input
            type="text"
            placeholder="🔍 Filter UnionDesk menu..."
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
      )}

      {/* Grouped Section Menu Items */}
      <nav className="p-3 space-y-4 overflow-y-auto flex-1">
        {navSections.map((section, idx) => {
          const matchingItems = section.items.filter((item) =>
            item.title.toLowerCase().includes(filterText.toLowerCase())
          );
          if (matchingItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1">
                  {section.title}
                </h4>
              )}
              {matchingItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    {!isCollapsed && <span className="truncate">{item.title}</span>}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User Footer Profile Card */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-emerald-400">
              {user?.first_name ? user.first_name[0] : 'U'}
            </div>
            <div className="truncate text-xs">
              <div className="font-bold text-slate-200 truncate">{user?.first_name} {user?.last_name}</div>
              <div className="text-[10px] text-slate-500 truncate">{user?.email}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
