import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { ArrowLeft, PlusCircle, FileText, Clock, Calculator } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface Project {
  id: string;
  name: string;
  description: string;
  collection: string;
  season: string;
  image_url: string;
  labor_hours: number;
}

interface Material {
  id: string;
  name: string;
  quantity: number;
  price_per_unit: number;
  unit: string;
}

interface Profile {
  hourly_rate: number;
  default_margin: number;
  logo_url: string | null;
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [laborHours, setLaborHours] = useState(0);
  const [margin, setMargin] = useState(30);
  const [showLaborModal, setShowLaborModal] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) throw projectError;

      // Fetch materials
      const { data: materialsData, error: materialsError } = await supabase
        .from('project_materials')
        .select(`
          id,
          quantity,
          price_per_unit,
          materials (
            name,
            unit
          )
        `)
        .eq('project_id', id);

      if (materialsError) throw materialsError;

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('hourly_rate, default_margin, logo_url')
        .single();

      if (profileError) throw profileError;

      setProject(projectData);
      setMaterials(materialsData || []);
      setProfile(profileData);
      setLaborHours(projectData.labor_hours || 0);
      setMargin(profileData.default_margin || 30);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du chargement du projet');
    } finally {
      setLoading(false);
    }
  };

  const calculateCosts = () => {
    const materialCost = materials.reduce(
      (sum, mat) => sum + mat.quantity * mat.price_per_unit,
      0
    );
    const laborCost = laborHours * (profile?.hourly_rate || 30);
    const totalCost = materialCost + laborCost;
    const marginAmount = totalCost * (margin / 100);
    const suggestedPrice = totalCost + marginAmount;

    return {
      materialCost,
      laborCost,
      totalCost,
      marginAmount,
      suggestedPrice
    };
  };

  const generatePDF = async () => {
    if (!project || !materials.length) return;

    const doc = new jsPDF();
    const costs = calculateCosts();

    // Add header
    doc.setFontSize(24);
    doc.text('Fiche Technique', 105, 20, { align: 'center' });

    // Project info
    doc.setFontSize(14);
    doc.text(`Projet: ${project.name}`, 20, 40);
    doc.text(`Collection: ${project.collection || 'N/A'}`, 20, 50);
    doc.text(`Saison: ${project.season || 'N/A'}`, 20, 60);

    // Add image if exists
    if (project.image_url) {
      try {
        const response = await fetch(project.image_url);
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        doc.addImage(imageUrl, 'JPEG', 20, 70, 80, 80);
      } catch (error) {
        console.error('Error loading image:', error);
      }
    }

    // Materials list
    doc.setFontSize(12);
    doc.text('Matériaux:', 20, 170);
    let y = 180;
    materials.forEach((material, index) => {
      doc.text(`${index + 1}. ${material.name}: ${material.quantity} ${material.unit} (${material.price_per_unit}€/unité)`, 30, y);
      y += 10;
    });

    // Costs
    y += 10;
    doc.text('Coûts:', 20, y);
    y += 10;
    doc.text(`Matériaux: ${costs.materialCost.toFixed(2)}€`, 30, y);
    y += 10;
    doc.text(`Main d'œuvre (${laborHours}h × ${profile?.hourly_rate || 30}€/h): ${costs.laborCost.toFixed(2)}€`, 30, y);
    y += 10;
    doc.text(`Coût total: ${costs.totalCost.toFixed(2)}€`, 30, y);
    y += 10;
    doc.text(`Marge (${margin}%): ${costs.marginAmount.toFixed(2)}€`, 30, y);
    y += 10;
    doc.text(`Prix de vente conseillé: ${costs.suggestedPrice.toFixed(2)}€`, 30, y);

    // Save PDF
    doc.save(`fiche-technique-${project.name}.pdf`);
    toast.success('Fiche technique générée avec succès');
  };

  const updateLaborHours = async (hours: number) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ labor_hours: hours })
        .eq('id', id);

      if (error) throw error;

      setLaborHours(hours);
      toast.success('Temps de travail mis à jour');
      setShowLaborModal(false);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!project) {
    return <div>Projet non trouvé</div>;
  }

  const costs = calculateCosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {project.collection} - {project.season}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowLaborModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Clock className="w-4 h-4 mr-2" />
            Temps de travail
          </button>
          <button
            onClick={generatePDF}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FileText className="w-4 h-4 mr-2" />
            Fiche technique
          </button>
          <button
            onClick={() => {/* TODO: Ajouter matériau */}}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Ajouter un matériau
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Informations
          </h2>
          {project.image_url && (
            <img
              src={project.image_url}
              alt={project.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
          <p className="text-gray-500">{project.description}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Coûts
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Matériaux</span>
              <span className="font-medium">{costs.materialCost.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Main d'œuvre ({laborHours}h)</span>
              <span className="font-medium">{costs.laborCost.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Marge ({margin}%)</span>
              <span className="font-medium">{costs.marginAmount.toFixed(2)}€</span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center text-lg font-medium">
                <span>Prix de vente conseillé</span>
                <span>{costs.suggestedPrice.toFixed(2)}€</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Matériaux
            </h2>
            {materials.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Matériau
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix unitaire
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {materials.map((material) => (
                      <tr key={material.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {material.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {material.quantity} {material.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {material.price_per_unit}€
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(material.quantity * material.price_per_unit).toFixed(2)}€
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                <p>Aucun matériau ajouté</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showLaborModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Temps de travail
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="labor_hours" className="block text-sm font-medium text-gray-700">
                  Heures de travail
                </label>
                <input
                  type="number"
                  id="labor_hours"
                  value={laborHours}
                  onChange={(e) => setLaborHours(parseFloat(e.target.value))}
                  min="0"
                  step="0.5"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowLaborModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Annuler
                </button>
                <button
                  onClick={() => updateLaborHours(laborHours)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}