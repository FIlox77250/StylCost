import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Scissors } from 'lucide-react';

export default function AuthLayout() {
  const { session } = useAuth();
  const location = useLocation();

  if (session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-white rounded-full shadow-md mb-4">
            <Scissors className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">StylCost</h1>
          <p className="text-gray-600 mt-2">Votre assistant de gestion de coûts pour la mode</p>
        </div>
        <div className="bg-white shadow-xl rounded-lg p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}