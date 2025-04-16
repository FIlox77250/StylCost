/*
  # Schéma initial de StylCost

  1. Tables
    - `profiles`
      - Informations utilisateur étendues
      - Lié à auth.users
    - `projects`
      - Projets de mode
      - Lié au profil créateur
    - `materials`
      - Catalogue de matériaux
      - Peut être partagé entre projets
    - `project_materials`
      - Association entre projets et matériaux
      - Stocke les quantités et prix spécifiques

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques pour lecture/écriture par propriétaire
*/

-- Création de la table des profils utilisateurs
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text,
  hourly_rate decimal(10,2) DEFAULT 0,
  default_margin decimal(10,2) DEFAULT 30,
  logo_url text,
  updated_at timestamptz DEFAULT now()
);

-- Création de la table des projets
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  name text NOT NULL,
  description text,
  collection text,
  season text,
  image_url text,
  labor_hours decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Création de la table des matériaux
CREATE TABLE materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  name text NOT NULL,
  type text NOT NULL,
  supplier text,
  image_url text,
  default_price decimal(10,2),
  unit text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Création de la table d'association projets-matériaux
CREATE TABLE project_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  material_id uuid REFERENCES materials(id),
  quantity decimal(10,2) NOT NULL,
  price_per_unit decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activation de la sécurité par ligne (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_materials ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité
CREATE POLICY "Les utilisateurs peuvent lire leur profil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent modifier leur profil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent lire leurs projets"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent créer leurs projets"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs projets"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs projets"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent lire leurs matériaux et les matériaux publics"
  ON materials FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent créer des matériaux"
  ON materials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs matériaux"
  ON materials FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs matériaux"
  ON materials FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent gérer les matériaux de leurs projets"
  ON project_materials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_materials.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Triggers pour mise à jour automatique
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_project_materials_updated_at
  BEFORE UPDATE ON project_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();