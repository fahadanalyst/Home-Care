import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut, 
  ShieldCheck,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';

import { Logo } from './Logo';

export const Sidebar: React.FC = () => {
  const { profile, signOut } = useAuth();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', roles: ['admin', 'manager', 'frontdesk', 'clinical_worker', 'reviewer', 'nurse'] },
    { icon: Users, label: 'Patients', path: '/patients', roles: ['admin', 'manager', 'frontdesk', 'clinical_worker', 'nurse'] },
    { icon: Calendar, label: 'Schedule', path: '/schedule', roles: ['admin', 'manager', 'frontdesk', 'clinical_worker'] },
    { icon: ClipboardList, label: 'Clinical Notes', path: '/notes', roles: ['admin', 'manager', 'clinical_worker', 'nurse'] },
    { icon: FileText, label: 'Clinical Forms', path: '/clinical-forms', roles: ['admin', 'manager', 'clinical_worker', 'nurse', 'reviewer'] },
    { icon: ShieldCheck, label: 'Compliance', path: '/compliance', roles: ['admin', 'reviewer'] },
    { icon: Settings, label: 'User Management', path: '/settings', roles: ['admin'] },
  ];

  const role = profile?.role || 'clinical_worker';
  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <div className="w-64 h-screen bg-white border-r border-zinc-200 flex flex-col">
      <div className="p-6">
        <Logo showText size={40} />
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {filteredItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={clsx(
              'flex items-center gap-3 px-3 py-2 rounded-xl transition-colors',
              location.pathname === item.path
                ? 'bg-partners-blue-dark text-white'
                : 'text-zinc-600 hover:bg-zinc-100'
            )}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-200">
        <div className="flex items-center gap-3 px-3 py-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 font-bold">
            {profile?.full_name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 truncate">{profile?.full_name}</p>
            <p className="text-xs text-zinc-500 capitalize">{profile?.role}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            console.log('Sign Out button clicked');
            signOut();
          }}
          className="flex items-center gap-3 w-full px-3 py-2 text-zinc-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};
