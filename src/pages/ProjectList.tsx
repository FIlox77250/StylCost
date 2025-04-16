import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search } from 'lucide-react';

export default function ProjectList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projets</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez vos projets de mode et leurs coûts
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

      <div className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un projet..."
          className="ml-2 flex-1 border-0 focus:ring-0 focus:outline-none text-sm"
        />
      </div>

      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        <div className="p-6 text-center text-gray-500">
          <p>Aucun projet trouvé</p>
          <p className="mt-1 text-sm">
            Commencez par créer un nouveau projet
          </p>
        </div>
      </div>
    </div>
  );
}