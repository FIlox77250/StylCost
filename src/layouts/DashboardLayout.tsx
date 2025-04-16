import React from 'react';
import { Navigate, Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Scissors, 
  LayoutDashboard, 
  FolderOpen, 
  Box, 
  UserCircle, 
  LogOut 
} from 'lucide-react';

export default function DashboardLayout() {
  const { session, signOut } = useAuth();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const navigation = [
    { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
    { name: 'Projets', href: '/projects', icon: FolderOpen },
    { name: 'Matériaux', href: '/materials', icon: Box },
    { name: 'Profil', href: '/profile', icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Scissors className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-semibold text-gray-900">StylCost</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        `inline-flex items-center px-1 pt-1 text-sm font-medium ${
                          isActive
                            ? 'border-b-2 border-indigo-500 text-gray-900'
                            : 'text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </NavLink>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => signOut()}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}