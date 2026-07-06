# 🗑️ WasteManager — Guide d'utilisation

Application web de gestion des déchets pour entreprises de collecte.  
**Stack technique :** React 19 + Vite + Tailwind CSS v4 (frontend) | Node.js + Express 5 + MongoDB/NeDB (backend)

---

## 📋 Table des matières

1. [Prérequis](#1--prérequis)
2. [Installation](#2--installation)
3. [Lancement de l'application](#3--lancement-de-lapplication)
4. [Comptes de test et parcours utilisateur](#4--comptes-de-test-et-parcours-utilisateur)
5. [Scénarios de test](#5--scenarios-de-test)
6. [Cas d'utilisation — Client](#6--cas-dutilisation--client)
7. [Cas d'utilisation — Staff](#7--cas-dutilisation--staff)
8. [Cas d'utilisation — Admin](#8--cas-dutilisation--admin)
9. [Structure des routes](#9--structure-des-routes)
10. [API Backend](#10--api-backend)
11. [Dépannage](#11--dépannage)

---

## 1. Prérequis

| Outil | Version requise | Vérification |
|-------|----------------|--------------|
| Node.js | ≥ 18 | `node --version` |
| npm | ≥ 9 | `npm --version` |
| Git | ≥ 2 | `git --version` |

> **Note :** MongoDB Atlas est utilisé comme base de données principale. Si la connexion échoue, l'application bascule automatiquement sur NeDB (base en mémoire locale — les données seront perdues au redémarrage).

---

## 2. Installation

```bash
# Cloner le projet
git clone <url-du-depot>
cd waste-management-app

# Installer les dépendances backend
cd server
npm install

# Installer les dépendances frontend
cd ../client
npm install
```

---

## 3. Lancement de l'application

### Démarrer le backend (API)

```bash
cd server
npm run dev
```

Le serveur démarre sur **http://localhost:5000**.

- `npm run dev` → utilise `nodemon` (redémarrage automatique)
- `npm start` → mode production (Node.js standard)

### Démarrer le frontend (interface web)

```bash
cd client
npm run dev
```

Le frontend démarre sur **http://localhost:5173**.

### Vérifier que tout fonctionne

1. Ouvrez http://localhost:5173 dans votre navigateur
2. Vous devriez voir la page d'accueil (Landing Page)
3. Vérifiez la santé du backend : http://localhost:5000/api/health

### Commandes utiles

| Commande | Description |
|----------|-------------|
| `cd server && npm run dev` | Démarrer le backend |
| `cd client && npm run dev` | Démarrer le frontend |
| `cd client && npm run build` | Build de production |
| `cd client && npm run preview` | Prévisualiser le build |

---

## 4. Comptes de test et parcours utilisateur

### Comptes recommandés

| Rôle | Email | Mot de passe | Utilisation principale |
|------|-------|--------------|------------------------|
| Admin | `admin@wastemanager.com` | `admin123` | Gestion globale, utilisateurs, sites, véhicules, collectes, abonnements |
| Staff | `staff@wastemanager.com` | `staff123` | Dashboard staff, collectes, véhicules, sites, profil |
| Client | `client@wastemanager.com` | `client123` | Dashboard client, abonnements, sites, profil |

> Le compte admin est créé automatiquement au premier lancement. Les comptes staff et client peuvent être créés via l'inscription, puis l'admin peut ajuster le rôle si nécessaire.

### Création d'un compte staff ou client

1. Ouvrez http://localhost:5173/register
2. Remplissez le formulaire avec :
   - Nom complet : `Lucas Martin` / `Julie Moreau` / `Sophie Durand`
   - Email : `staff@wastemanager.com` ou `client@wastemanager.com`
   - Mot de passe : `staff123` ou `client123`
   - Téléphone : `+33 6 12 34 56 78`
   - Adresse : `15 Rue des Archives, 75003 Paris`
3. Cliquez sur **S'inscrire**
4. Le compte est créé en tant que client par défaut
5. Si vous voulez un compte staff, connectez-vous en admin et modifiez le rôle depuis `/users`

### Si l'utilisateur a déjà créé son compte

1. Ouvrez http://localhost:5173/login
2. Entrez l'email et le mot de passe de l'un des comptes ci-dessus
3. Cliquez sur **Se connecter**
4. L'utilisateur est redirigé vers le tableau de bord correspondant à son rôle

---

## 5. Scénarios de test

### Scénario 1 — Parcours Admin complet
1. Démarrez le backend et le frontend, puis ouvrez http://localhost:5173
2. Connectez-vous en admin :
   - Email : `admin@wastemanager.com`
   - Mot de passe : `admin123`
3. Accédez à `/dashboard` et vérifiez les statistiques globales
4. Allez sur `/users` et :
   - créez `Sophie Dupont` / `sophie.dupont@wastemanager.com` / `sophie123`
   - créez `Romain Bernard` / `romain.bernard@wastemanager.com` / `romain123`
   - changez le rôle de `client@wastemanager.com` en `staff` si nécessaire
5. Allez sur `/sites` et créez un site :
   - Nom : `Entrepôt Sud`
   - Adresse : `55 Avenue de la République, 92110 Clichy`
   - Type : `Déchargement`
6. Allez sur `/vehicules` et ajoutez un véhicule :
   - Plaque : `RV-9001`
   - Marque / Modèle : `Volvo FM`
   - Type : `Benne`
   - Capacité : `2500 kg`
   - Statut : `Disponible`
7. Allez sur `/collectes` et créez une collecte :
   - Site : `Entrepôt Sud`
   - Véhicule : `RV-9001 / Volvo FM`
   - Statut : `Planifiée`
8. Vérifiez `/abonnements` et notez que les plans sont affichés correctement
9. Ouvrez `/profile`, mettez à jour le téléphone et l'adresse puis enregistrez
10. Déconnectez-vous et reconnectez-vous pour valider que les modifications ont bien été conservées

### Scénario 2 — Parcours Staff
1. Connectez-vous en staff :
   - Email : `staff@wastemanager.com`
   - Mot de passe : `staff123`
2. Accédez à `/staff-dashboard`
3. Vérifiez les onglets : Vue d'ensemble, Clients & Paiements, Collectes
4. Allez sur `/collectes`, sélectionnez une collecte et changez son statut en `En cours`
5. Allez sur `/vehicules` et mettez à jour le statut d'un véhicule, par exemple `En maintenance`
6. Allez sur `/sites`, modifiez un site existant et enregistrez les changements
7. Ouvrez `/profile`, modifiez le téléphone et l'adresse, puis déconnectez-vous

### Scénario 3 — Parcours Client
1. Connectez-vous en client :
   - Email : `client@wastemanager.com`
   - Mot de passe : `client123`
2. Accédez à `/client-dashboard` et vérifiez le résumé des collectes et abonnements
3. Allez sur `/abonnements`, choisissez `Plan mensuel` et sélectionnez `PayPal`
4. Allez sur `/sites` et ajoutez un nouveau site :
   - Nom : `Site centre-ville`
   - Adresse : `12 Boulevard Saint-Germain, 75005 Paris`
   - Type : `Collecte sélective`
5. Ouvrez `/profile`, mettez à jour votre numéro de téléphone et adresse
6. Déconnectez-vous pour vérifier la fin de session

---

## 6. Cas d'utilisation — Client

### 5.1 Parcours client

1. Connectez-vous en tant que client :
   - Email : `client@wastemanager.com`
   - Mot de passe : `client123`
2. Accédez à `/client-dashboard`
3. Vérifiez les statistiques de votre compte et l'historique des collectes
4. Allez sur `/abonnements` pour souscrire :
   - `Plan hebdomadaire` — 25 USD/sem
   - `Plan mensuel` — 80 USD/mois
   - `Plan annuel` — 800 USD/an
   - Mode de paiement : `Carte de crédit`, `PayPal`, `Lumicash`, `Dépôt au siège`
5. Allez sur `/sites` pour ajouter un site client
6. Allez sur `/profile` pour mettre à jour :
   - Nom, email, téléphone, adresse
   - Mot de passe
7. Déconnectez-vous via le bouton dans l'en-tête

### Exemples de données à créer pour un client

- Site : `Site centre-ville`
  - Adresse : `12 Boulevard Saint-Germain, 75005 Paris`
  - Type : `Collecte sélective`
  - Coordonnées GPS : `48.852968, 2.349902`
- Abonnement : `Mensuel`, `PayPal`

---

## 6. Cas d'utilisation — Staff

### 6.1 Parcours staff

1. Connectez-vous en tant que staff :
   - Email : `staff@wastemanager.com`
   - Mot de passe : `staff123`
2. Accédez à `/staff-dashboard`
3. Vérifiez les onglets : Vue d'ensemble, Clients & Paiements, Collectes
4. Allez sur `/collectes` pour créer ou modifier des collectes
5. Allez sur `/vehicules` pour ajouter un véhicule ou mettre à jour un statut
6. Allez sur `/sites` pour consulter et modifier des sites
7. Allez sur `/profile` pour mettre à jour vos informations
8. Déconnectez-vous via le bouton dans l'en-tête

### Exemples de données de test pour le staff

- Véhicule : `SN-1122 / Renault Master`
  - Type : `Benne`
  - Capacité : `1200 kg`
  - Statut : `Disponible`
- Véhicule : `CA-7703 / Iveco Daily`
  - Type : `Compact`
  - Capacité : `900 kg`
  - Statut : `En maintenance`
- Site : `Local de recyclage Nord`
  - Adresse : `8 Rue du Nord, 93500 Pantin`
  - Type : `Recyclage`
- Collecte : `Collecte tri sélectif`
  - Statut : `Planifiée` / `En cours` / `Terminée`

---

## 7. Cas d'utilisation — Admin

### 7.1 Parcours admin

1. Connectez-vous en tant qu'admin :
   - Email : `admin@wastemanager.com`
   - Mot de passe : `admin123`
2. Accédez à `/dashboard`
3. Vérifiez les statistiques globales de l'application
4. Allez sur `/users` pour :
   - Créer un utilisateur : `Sophie Dupont`, `sophie.dupont@wastemanager.com`, `sophie123`, rôle `client`
   - Modifier un utilisateur : changer `client@wastemanager.com` en `staff`
   - Supprimer un utilisateur de test
5. Allez sur `/sites` pour créer ou modifier un site global
6. Allez sur `/vehicules` pour ajouter un véhicule de flotte
7. Allez sur `/collectes` pour affecter des collectes aux véhicules
8. Allez sur `/abonnements` pour vérifier les plans et les paiements
9. Allez sur `/profile` pour mettre à jour les informations de l'admin
10. Déconnectez-vous via le bouton dans l'en-tête

### Exemples de données de test pour l'admin

- Utilisateur staff : `Camille Lefèvre`, `camille.lefevre@wastemanager.com`, `camille123`, rôle `staff`
- Utilisateur client : `Romain Bernard`, `romain.bernard@wastemanager.com`, `romain123`, rôle `client`
- Site : `Entrepôt Sud`
  - Adresse : `55 Avenue de la République, 92110 Clichy`
  - Type : `Déchargement`
- Collecte : `Collecte industrielle`
  - Véhicule : `RV-9001 / Volvo FM`
  - Statut : `En cours`

---

## 8. Structure des routes

### Frontend (React Router)

| Route | Accès | Description |
|-------|-------|-------------|
| `/` | Public | Page d'accueil (Landing Page) |
| `/login` | Public | Connexion |
| `/register` | Public | Inscription |
| `/debug-mongo` | Public | Diagnostic MongoDB |
| `/dashboard` | Admin | Tableau de bord admin |
| `/staff-dashboard` | Staff | Tableau de bord staff |
| `/client-dashboard` | Client | Tableau de bord client |
| `/users` | Admin | Gestion des utilisateurs |
| `/sites` | Tous | Gestion des sites |
| `/collectes` | Admin, Staff | Gestion des collectes |
| `/vehicules` | Admin, Staff | Gestion des véhicules |
| `/abonnements` | Tous | Gestion des abonnements |
| `/profile` | Tous | Mon profil |

### Redirection automatique après connexion

| Rôle | Redirection |
|------|-------------|
| Admin | `/dashboard` |
| Staff | `/staff-dashboard` |
| Client | `/client-dashboard` |

---

## 9. API Backend

### Base URL : `http://localhost:5000/api`

### Authentification

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/auth/register` | Inscription | Non |
| POST | `/auth/login` | Connexion | Non |
| GET | `/auth/me` | Profil utilisateur connecté | Oui |

### Utilisateurs

| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| GET | `/users` | Liste des utilisateurs | admin, staff |
| POST | `/users` | Créer un utilisateur | admin |
| PUT | `/users/:id` | Modifier un utilisateur | admin |
| DELETE | `/users/:id` | Supprimer un utilisateur | admin |

### Sites

| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| GET | `/sites` | Liste des sites | Tous (filtré pour clients) |
| POST | `/sites` | Créer un site | Tous |
| PUT | `/sites/:id` | Modifier un site | admin, staff |
| DELETE | `/sites/:id` | Supprimer un site | admin |

### Collectes

| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| GET | `/collectes` | Liste des collectes | admin, staff |
| POST | `/collectes` | Créer une collecte | admin, staff |
| PUT | `/collectes/:id` | Modifier une collecte | admin, staff |
| DELETE | `/collectes/:id` | Supprimer une collecte | admin |

### Véhicules

| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| GET | `/vehicles` | Liste des véhicules | admin, staff |
| POST | `/vehicles` | Ajouter un véhicule | admin, staff |
| PUT | `/vehicles/:id` | Modifier un véhicule | admin, staff |
| DELETE | `/vehicles/:id` | Supprimer un véhicule | admin |

### Abonnements

| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| GET | `/subscriptions` | Liste des abonnements | Tous (filtré pour clients) |
| POST | `/subscriptions` | Créer un abonnement | Tous |
| GET | `/subscriptions/pricing` | Tarifs publics | Public |

### Dashboard

| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| GET | `/dashboard` | Statistiques globales | admin, staff |

---

## 10. Dépannage

### Le serveur ne démarre pas

```
❌ Erreur: Cannot find module '...'
```

**Solution :** Réinstallez les dépendances :
```bash
cd server && npm install
cd ../client && npm install
```

### Erreur de connexion MongoDB

Si vous voyez `⚠️ Utilisation de MongoDB en mémoire locale` :

1. Vérifiez votre connexion internet
2. Vérifiez les identifiants MongoDB dans `server/.env`
3. Sur MongoDB Atlas, ajoutez votre IP dans **Network Access** (ou `0.0.0.0/0` pour le développement)
4. Consultez le diagnostic : http://localhost:5000/api/debug/mongo

### Le frontend ne se connecte pas au backend

1. Vérifiez que le backend tourne sur http://localhost:5000
2. Vérifiez la configuration CORS (elle est ouverte en développement)
3. Vérifiez que `client/src/services/api.js` a `baseURL: 'http://localhost:5000/api'`

### Erreur CORS

Le serveur accepte toutes les origines en développement (`cors()`). Si vous modifiez la configuration, assurez-vous que le port 5173 est autorisé.

### Données perdues après redémarrage

C'est normal si vous utilisez NeDB (mode local). Les données ne sont persistées que si MongoDB Atlas est connecté. Configurez `server/.env` avec un `MONGO_URI` valide pour la persistence.

### Voir les logs MongoDB

Ouvrez http://localhost:5000/api/debug/mongo pour voir les logs détaillés de connexion.

---

## 📁 Structure du projet

```
waste-management-app/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── components/        # Composants réutilisables
│   │   │   ├── Layout.jsx     # Mise en page avec sidebar
│   │   │   ├── Sidebar.jsx    # Navigation latérale
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Gestion de l'état auth
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx      # Admin
│   │   │   ├── StaffDashboardPage.jsx  # Staff
│   │   │   ├── ClientDashboardPage.jsx # Client
│   │   │   ├── SitesPage.jsx
│   │   │   ├── CollectesPage.jsx
│   │   │   ├── VehiculesPage.jsx
│   │   │   ├── AbonnementsPage.jsx
│   │   │   ├── UsersPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── services/
│   │   │   └── api.js        # Axios + JWT interceptors
│   │   └── App.jsx            # Routes React Router
│   └── vite.config.js
│
├── server/                    # Backend Node.js
│   ├── controllers/           # Logique métier
│   │   ├── authController.js
│   │   ├── siteController.js
│   │   ├── collecteController.js
│   │   ├── vehicleController.js
│   │   ├── subscriptionController.js
│   │   ├── userController.js
│   │   └── dashboardController.js
│   ├── models/                # Schémas Mongoose
│   │   ├── User.js
│   │   ├── Site.js
│   │   ├── Collecte.js
│   │   ├── Vehicle.js
│   │   └── Subscription.js
│   ├── routes/                # Routes Express
│   │   ├── auth.js
│   │   ├── sites.js
│   │   ├── collectes.js
│   │   ├── vehicles.js
│   │   ├── subscriptions.js
│   │   ├── users.js
│   │   └── dashboard.js
│   ├── middleware/
│   │   └── auth.js            # JWT + RBAC
│   ├── utils/
│   │   ├── database.js        # Connexion MongoDB
│   │   ├── adapter.js         # Adaptateur Mongoose/NeDB
│   │   └── logger.js          # Logs MongoDB
│   ├── index.js               # Point d'entrée
│   └── .env                   # Variables d'environnement
│
└── GUIDE_UTILISATION.md       # Ce guide
```

---

## 🔐 Rôles et permissions

| Action | Admin | Staff | Client |
|--------|:-----:|:-----:|:------:|
| Voir le dashboard | ✅ Admin | ✅ Staff | ✅ Client |
| Gérer les utilisateurs | ✅ CRUD | 👁 Lecture | ❌ |
| Gérer les sites | ✅ CRUD | ✅ CRUD | 👁 Lecture + Création |
| Gérer les collectes | ✅ CRUD | ✅ CRUD | ❌ |
| Gérer les véhicules | ✅ CRUD | ✅ CRUD | ❌ |
| Gérer les abonnements | 👁 Tous | 👁 Tous | 👁 Les siens + Création |
| Modifier son profil | ✅ | ✅ | ✅ |

**Légende :**
- ✅ CRUD = Créer, Lire, Modifier, Supprimer
- 👁 Lecture = Voir uniquement
- ❌ = Accès refusé

---

*Dernière mise à jour : Juin 2026*