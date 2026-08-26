import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { generateFilteredNav } from '../config/navConfig';

export const Sidebar = ({ isCollapsed, onToggle }) => {
  const { user, activeOrganization } = useAuthStore();
  const location = useLocation();
  const [filterText, setFilterText] = useState('');

  const navSections = generateFilteredNav(user, activeOrganization);

  return (
    <aside
      className={`hidden md:flex flex-col bg-slate-950 border-r border-slate-800/60 z-40 flex-shrink-0 sidebar-transition ${
        isCollapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
      style={{ height: '100vh', position: 'sticky', top: 0 }}
    >
      {/* Brand Header */}
      <div className={`flex items-center border-b border-slate-800/60 h-16 flex-shrink-0 ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'}`}>
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-emerald-600/30 flex-shrink-0">
          U
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <div className="font-bold text-slate-100 text-sm flex items-center gap-1 leading-tight">
              UnionDesk <span>🇧🇩</span>
            </div>
            <div className="text-[10px] font-semibold text-emerald-400 font-mono uppercase truncate leading-tight mt-0.5">
              {activeOrganization?.name || 'BD Workspace'}
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all text-xs flex-shrink-0"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Search Filter */}
      {!isCollapsed && (
        <div className="px-3 py-3 flex-shrink-0">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Filter modules..."
              className="w-full pl-7 pr-3 py-2 bg-slate-900/80 border border-slate-800/60 rounded-xl text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/60 focus:border-indigo-500/40 transition-all"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {navSections.map((section, idx) => {
          const matchingItems = section.items.filter(item =>
            item.title.toLowerCase().includes(filterText.toLowerCase())
          );
          if (matchingItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-0.5">
              {!isCollapsed && (
                <p className="text-[9px] font-extrabold text-slate-600 uppercase tracking-widest px-3 py-1">
                  {section.title}
                </p>
              )}
              {matchingItems.map((item) => {
                const isActive = location.pathname === item.path ||
                  (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    title={isCollapsed ? item.title : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                      isActive
                        ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-600/20'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    <span className={`text-sm flex-shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`}>
                      {item.icon}
                    </span>
                    {!isCollapsed && <span className="truncate">{item.title}</span>}
                    {!isCollapsed && isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      {!isCollapsed && (
        <div className="border-t border-slate-800/60 p-3 flex-shrink-0">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all ${
                isActive
                  ? 'bg-indigo-950/80 border border-indigo-500/50 shadow-lg shadow-indigo-950/40 text-slate-100'
                  : 'hover:bg-slate-900/80 text-slate-300'
              }`
            }
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 border border-indigo-500/40 flex items-center justify-center font-bold text-xs text-white flex-shrink-0 shadow-md">
              {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="text-xs font-bold text-slate-200 truncate flex items-center gap-1.5">
                <span>{user?.first_name} {user?.last_name}</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-mono truncate">
                👤 আমার প্রোফাইল
              </div>
            </div>
          </NavLink>
        </div>
      )}
    </aside>
  );
};
