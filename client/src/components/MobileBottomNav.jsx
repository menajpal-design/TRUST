import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { generateFilteredNav } from '../config/navConfig';

export const MobileBottomNav = ({ onOpenAIModal }) => {
  const { user, activeOrganization } = useAuthStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navSections = generateFilteredNav(user, activeOrganization);

  return (
    <>
      {/* Mobile Bottom Fixed Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md h-16 flex items-center justify-around px-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-bold ${
              isActive ? 'text-indigo-400' : 'text-slate-400'
            }`
          }
        >
          <span className="text-lg">🏠</span>
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/chat"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-bold ${
              isActive ? 'text-indigo-400' : 'text-slate-400'
            }`
          }
        >
          <span className="text-lg">💬</span>
          <span>Chat</span>
        </NavLink>

        {/* Center Floating Action Button (AI Copilot) */}
        <button
          onClick={onOpenAIModal}
          className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-600/40 -mt-6 border-2 border-slate-950"
        >
          ✨
        </button>

        <NavLink
          to="/events"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-bold ${
              isActive ? 'text-indigo-400' : 'text-slate-400'
            }`
          }
        >
          <span className="text-lg">🎟️</span>
          <span>Events</span>
        </NavLink>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-200"
        >
          <span className="text-lg">☰</span>
          <span>Menu</span>
        </button>
      </nav>

      {/* Mobile Menu Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-6 overflow-y-auto">
          <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-4">
            <h2 className="text-lg font-bold text-slate-100">All Modules & Navigation</h2>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="text-slate-400 text-xl font-bold p-2"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6 flex-1 pb-10">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 hover:border-indigo-500"
                    >
                      <span className="text-base">{item.icon}</span>
                      <span className="truncate">{item.title}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
