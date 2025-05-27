// web-admin/src/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Receipt, 
  Users, 
  MessageSquare, 
  Bell, 
  Settings, 
  User,
  X,
  Building2,
  BarChart3,
  FileText
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../../shared/types';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles?: UserRole[];
  badge?: number;
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Despesas',
    href: '/expenses',
    icon: Receipt,
    badge: 5, // Pending expenses count
  },
  {
    name: 'Funcionários',
    href: '/users',
    icon: Users,
    allowedRoles: ['admin', 'gestor'],
  },
  {
    name: 'Mensagens',
    href: '/messages',
    icon: MessageSquare,
    badge: 2, // Unread messages
  },
  {
    name: 'Notificações',
    href: '/notifications',
    icon: Bell,
  },
  {
    name: 'Relatórios',
    href: '/reports',
    icon: BarChart3,
    allowedRoles: ['admin', 'gestor'],
  },
];

const bottomNavigation: NavigationItem[] = [
  {
    name: 'Perfil',
    href: '/profile',
    icon: User,
  },
  {
    name: 'Configurações',
    href: '/settings',
    icon: Settings,
    allowedRoles: ['admin'],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  const isAllowed = (allowedRoles?: UserRole[]) => {
    if (!allowedRoles || !user) return true;
    return allowedRoles.includes(user.role);
  };

  const isActive = (href: string) => {
    return location.pathname === href || 
           (href !== '/dashboard' && location.pathname.startsWith(href));
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">RLS</h2>
                <p className="text-xs text-gray-500">Automação Industrial</p>
              </div>
            </div>
            
            <button
              onClick={() => setOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col justify-between p-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                if (!isAllowed(item.allowedRoles)) return null;
                
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${isActive(item.href)
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <item.icon className={`
                      mr-3 flex-shrink-0 h-5 w-5
                      ${isActive(item.href) ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-900'}
                    `} />
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* Bottom Navigation */}
            <div className="mt-8 pt-4 border-t border-gray-200 space-y-1">
              {bottomNavigation.map((item) => {
                if (!isAllowed(item.allowedRoles)) return null;
                
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${isActive(item.href)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <item.icon className={`
                      mr-3 flex-shrink-0 h-5 w-5
                      ${isActive(item.href) ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-900'}
                    `} />
                    {item.name}
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;