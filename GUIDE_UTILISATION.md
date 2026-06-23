# 🗑️ WasteManager — Guide d'utilisation

Application web de gestion des déchets pour entreprises de collecte.  
**Stack technique :** React 19 + Vite + Tailwind CSS v4 (frontend) | Node.js + Express 5 + MongoDB/NeDB (backend)

---

## 📋 Table des matières

1. [Prérequis](#1--prérequis)
2. [Installation](#2--installation)
3. [Lancement de l'application](#3--lancement-de-lapplication)
4. [Comptes par défaut](#4--comptes-par-défaut)
5. [Cas d'utilisation — Client](#5--cas-dutilisation--client)
6. [Cas d'utilisation — Staff](#6--cas-dutilisation--staff)
7. [Cas d'utilisation — Admin](#7--cas-dutilisation--admin)
8. [Structure des routes](#8--structure-des-routes)
9. [API Backend](#9--api-backend)
10. [Dépannage](#10--dépannage)

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

## 4. Comptes par défaut

### Admin (créé automatiquement au premier lancement)

| Champ | Valeur |
|-------|--------|
| Email | `admin@wastemanager.com` |
| Mot de passe | `admin123` |

> ⚠️ **Changez ce mot de passe immédiatement en production !**

### Créer un compte Staff ou Client

1. Allez sur http://localhost:5173/register
2. Remplissez le formulaire (nom, email, mot de passe, téléphone, adresse)
3. Le rôle par défaut est `client`
4. L'admin peut ensuite changer le rôle via la page `/users`

---

## 5. Cas d'utilisation — Client

### 5.1 Inscription

1. Ouvrez http://localhost:5173/register
2. Remplissez : **Nom**, **Email**, **Mot de passe**, **Téléphone**, **Adresse**
3. Cliquez sur **S'inscrire**
4. Redirection automatique vers `/client-dashboard`

### 5.2 Connexion

1. Ouvrez http://localhost:5173/login
2. Entrez votre email et mot de passe
3. Cliquez sur **Se connecter**
4. Redirection vers `/client-dashboard`

### 5.3 Tableau de bord client (`/client-dashboard`)

- **Abonnement actif** : Voir le type, le statut de paiement, la date de fin
- **Statistiques** : Nombre de collectes, sites, abonnements
- **Historique** : Liste des collectes récentes

### 5.4 Créer un abonnement (`/abonnements`)

1. Cliquez sur **Abonnements** dans le menu
2. Choisissez un plan :

| Plan | Prix | Description |
|------|------|-------------|
| Hebdomadaire | 25 USD/sem | Collecte chaque semaine |
| Mensuel | 80 USD/mois | Collecte chaque mois |
| Annuel | 800 USD/an | Collecte chaque année |

3. Activez le toggle **Organisation** si vous êtes une entreprise (+30%)
4. Choisissez un **mode de paiement** :
   - Carte de crédit
   - PayPal
   - Lumicash
   - Dépôt au siège
5. Cliquez sur **Souscrire**

### 5.5 Gérer ses sites (`/sites`)

1. Cliquez sur **Sites** dans le menu
2. Cliquez sur **Ajouter un site**
3. Remplissez : nom, adresse, type, coordonnées GPS
4. Le site est lié à votre compte

### 5.6 Profil (`/profile`)

- Voir et modifier vos informations personnelles
- Changer votre mot de passe

---

## 6. Cas d'utilisation — Staff

### 6.1 Connexion

1. Connectez-vous avec vos identifiants staff
2. Redirection vers `/staff-dashboard`

### 6.2 Tableau de bord staff (`/staff-dashboard`)

Le dashboard staff comporte **3 onglets** :

#### Onglet 1 : Vue d'ensemble
- Statistiques globales (collectes, sites, abonnements)
- Graphiques de performance

#### Onglet 2 : Clients & Paiements
- Liste des clients inscrits
- Statut des paiements (en attente, payé, en retard)
- Filtres par statut

#### Onglet 3 : Collectes
- Liste des collectes à gérer
- Créer une nouvelle collecte
- Modifier le statut d'une collecte (planifiée → en cours → terminée)

### 6.3 Gérer les collectes (`/collectes`)

1. Cliquez sur **Collectes** dans le menu
2. **Créer** : Choisir le site, le véhicule, la date, le type de déchet
3. **Modifier** : Changer le statut, la date, les détails
4. **Supprimer** : Supprimer une collecte (si autorisé)

### 6.4 Gérer les véhicules (`/vehicules`)

1. Cliquez sur **Véhicules** dans le menu
2. **Ajouter** : Immatriculation, type, capacité, statut
3. **Modifier** : Mettre à jour les informations
4. **Supprimer** : Retirer un véhicule

### 6.5 Gérer les sites (`/sites`)

- Voir tous les sites
- Ajouter/modifier des sites
- Pas de suppression (admin uniquement)

### 6.6 Voir les abonnements (`/abonnements`)

- Consulter les abonnements des clients
- Voir les statuts de paiement

---

## 7. Cas d'utilisation — Admin

### 7.1 Connexion

1. Connectez-vous avec `admin@wastemanager.com` / `admin123`
2. Redirection vers `/dashboard`

### 7.2 Tableau de bord admin (`/dashboard`)

- **Statistiques complètes** : Utilisateurs, collectes, sites, abonnements
- **Vue d'ensemble** de l'activité de l'entreprise

### 7.3 Gestion des utilisateurs (`/users`)

1. Cliquez sur **Utilisateurs** dans le menu
2. **Liste** : Voir tous les utilisateurs (clients, staff, admin)
3. **Créer** : Ajouter un nouvel utilisateur avec un rôle spécifique
4. **Modifier** : Changer le rôle, les informations d'un utilisateur
5. **Supprimer** : Supprimer un utilisateur du système
6. **Changer le rôle** : Promouvoir un client en staff, ou rétrograder un staff

### 7.4 Gestion des sites (`/sites`)

- CRUD complet (Créer, Lire, Modifier, Supprimer)
- Vue de tous les sites de tous les clients

### 7.5 Gestion des véhicules (`/vehicules`)

- CRUD complet
- Suivi de la flotte de véhicules

### 7.6 Gestion des collectes (`/collectes`)

- CRUD complet
- Assignation des collectes aux véhicules
- Suivi des statuts

### 7.7 Gestion des abonnements (`/abonnements`)

- Voir tous les abonnements
- Suivre les paiements
- Gérer les expirations

### 7.8 Profil (`/profile`)

- Voir et modifier ses informations personnelles
- Changer son mot de passe

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