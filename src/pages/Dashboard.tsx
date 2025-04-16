import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PlusCircle, TrendingUp, Clock, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    { name: 'Projets actifs', value: '12', icon: TrendingUp },
    { name: 'Heures ce mois', value: '164', icon: Clock },
    { name: 'Revenu mensuel', value: '3,250€', icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {user?.email?.split('@')[0]}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Voici un aperçu de vos projets et statistiques
          </p>
        </div>
        <Link
          to="/projects/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Nouveau projet
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="relative bg-white pt-5 px-4 pb-6 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
            >
              <dt>
                <div className="absolute bg-indigo-500 rounded-md p-3">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                  {stat.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </dd>
            </div>
          );
        })}
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Projets récents
          </h3>
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="text-center text-gray-500">
              <p>Aucun projet récent</p>
              <Link
                to="/projects"
                className="mt-2 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Voir tous les projets
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}