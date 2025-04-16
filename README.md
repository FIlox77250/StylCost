# 👗 StylCost — Assistant de production pour stylistes

**StylCost** est une application moderne destinée aux **styliste·s et étudiant·e·s en école de mode**.  
Elle facilite la **gestion des projets de création textile**, le **calcul des coûts de production**, et la **génération automatique de fiches techniques PDF professionnelles**.

---

## ✨ Fonctionnalités principales

- 🔐 Authentification (Inscription & Connexion sécurisée)
- 📁 Création et gestion de projets multiples
- 🧵 Ajout de matériaux avec quantité, prix unitaire, fournisseur
- ⏱️ Estimation du temps de travail + coût horaire
- 💰 Calcul automatique :
  - Coût total matériaux
  - Coût main d’œuvre
  - Prix de revient + Prix de vente conseillé avec marge
- 🖼️ Upload d’image de la création
- 📄 Génération automatique d’une fiche technique PDF stylée
- 📦 Base de données des matériaux réutilisables
- 🌐 Scraping intelligent :
  - Suggestion de **prix moyen en ligne** via Supabase Edge Function
  - Scraping de Mondial Tissus selon un mot-clé tissu
- 🎨 UI/UX moderne, responsive et élégante (React + TailwindCSS)

---

## 🔧 Stack technique

| Frontend         | Backend/API                   | Autres outils      |
|------------------|-------------------------------|--------------------|
| React (TypeScript) | Supabase (auth, DB, storage)   | TailwindCSS        |
| Vite              | Supabase Edge Functions (Deno) | jsPDF / react-pdf  |
| Zustand (state)   | Cheerio / Deno DOM            |                    |

---

## 🚀 Lancer l'application en local

### 1. Cloner le projet

```bash
git clone https://github.com/Filox77250/stylcost.git
cd stylcost
```
