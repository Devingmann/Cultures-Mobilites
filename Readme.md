# Cultures & Mobilités

> Plateforme web du groupe **Culture et mobilité** — un espace collaboratif pour garder une trace des sorties culturelles, partager photos, créations et témoignages, et décider ensemble des prochaines destinations.

[![Site en production](https://img.shields.io/badge/Site%20en%20production-cultures--mobilite.vercel.app-blue?style=for-the-badge)](https://cultures-mobilite.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql)](https://neon.tech/)

**Projet transversal porté par :**

- APIJE Mobilité
- SCIC IFAD Accompagnement Intégré
- IFAD SCOP Parcours Santé Mieux Être

---

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Installation & lancement local](#installation--lancement-local)
- [Variables d'environnement](#variables-denvironnement)
- [Base de données](#base-de-données)
- [Personnalisation & édition](#personnalisation--édition)
- [API principale](#api-principale)
- [Rôles & permissions](#rôles--permissions)
- [Déploiement](#déploiement)
- [Scripts utiles](#scripts-utiles)
- [Contribution](#contribution)
- [Licence & crédits](#licence--crédits)

---

## Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| **Accueil public** | Présentation du projet, prochaines sorties, appels à rejoindre le groupe |
| **Authentification** | Inscription avec code d'invitation + connexion |
| **Journal du groupe** | Articles, récits, photos commentées, capsules audio/vidéo |
| **Sondage participatif** | Vote multi-choix en temps réel pour choisir la prochaine sortie |
| **Drive / Galerie** | Upload et consultation de fichiers classés par catégories |
| **Espace membres** | Contenu réservé aux utilisateurs connectés |
| **Administration** | Gestion des utilisateurs, statistiques, paramètres du sondage, code d'invitation |

### Catégories de fichiers

| Catégorie | Emoji | Description |
|---|---|---|
| Photo de sortie | 📷 | Photos prises lors des sorties culturelles |
| Création artistique | 🎨 | Œuvres et créations des membres |
| Témoignage / capsule | 🎙 | Témoignages audio/vidéo |
| Document | 📄 | Documents divers (PDF, textes…) |

---

## Stack technique

| Domaine | Technologie |
|---|---|
| **Framework** | Next.js 16 (App Router) + React 19 |
| **Langage** | TypeScript |
| **UI** | Tailwind CSS 4 + shadcn/ui + Lucide React + Framer Motion |
| **Base de données** | PostgreSQL (Neon) + Prisma ORM |
| **Stockage fichiers** | Vercel Blob |
| **Auth** | Sessions custom (cookies + hash) |
| **Runtime possible** | Bun ou Node.js |
| **Déploiement** | Vercel (recommandé) |

---

## Structure du projet

```txt
Cultures-Mobilite/
├── prisma/
│   └── schema.prisma          # Modèles de données
├── public/
│   ├── covers/                # Images de couverture des articles
│   └── images/                # Assets statiques (logo, hero…)
├── src/
│   ├── app/
│   │   ├── api/               # Routes API (auth, files, posts, poll, admin…)
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx           # Page d'accueil
│   ├── components/
│   │   ├── site/              # Composants métier (pages, formulaires, cartes…)
│   │   └── ui/                # Composants shadcn/ui
│   ├── hooks/
│   └── lib/
│       ├── auth.ts            # Logique d'authentification
│       ├── db.ts              # Client Prisma
│       ├── files.ts           # Gestion des uploads & catégories
│       └── utils.ts
├── scripts/                   # Scripts utilitaires
├── seed-neon.js               # Seed de données de démonstration
├── package.json
└── next.config.ts
```

---

## Installation & lancement local

### Prérequis

- **Node.js** ≥ 20 ou **Bun**
- Compte **Neon** (ou autre PostgreSQL) pour la base de données
- Compte **Vercel** (pour Blob storage) recommandé

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/Devingmann/Cultures-Mobilite.git
cd Cultures-Mobilite

# 2. Installer les dépendances
npm install
# ou
bun install

# 3. Configurer les variables d'environnement
cp .env.example .env.local   # (créez le fichier si besoin)
# → renseignez les valeurs (voir section suivante)

# 4. Générer le client Prisma & pousser le schéma
npx prisma generate
npx prisma db push

# 5. (Optionnel) Injecter des données de démonstration
node seed-neon.js

# 6. Lancer le serveur de développement
npm run dev
# → http://localhost:3000
```

---

## Variables d'environnement

Créez un fichier `.env.local` à la racine :

```env
# Base de données (Neon recommandé)
DATABASE_URL="postgresql://..."
DATABASE_URL_POOLED="postgresql://..."   # connection poolée

# Stockage fichiers (Vercel Blob)
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# Autres (selon besoins de déploiement)
# NEXTAUTH_SECRET / etc. ne sont pas utilisés ici (auth custom)
```

> ⚠️ **Important** : Ne committez jamais les fichiers `.env*` (déjà ignorés dans `.gitignore`).

---

## Base de données

### Modèles principaux (Prisma)

| Modèle | Description |
|---|---|
| `User` | Membres et administrateurs |
| `Session` | Sessions de connexion |
| `Setting` | Paramètres globaux (code d'invitation, état du sondage…) |
| `PollOption` + `Vote` | Sondage participatif |
| `FileItem` | Fichiers uploadés (photos, documents…) |
| `Post` | Articles / journal (avec éventuellement un média lié) |

### Commandes utiles

```bash
npx prisma generate          # Régénérer le client
npx prisma db push           # Appliquer le schéma (dev)
npx prisma migrate dev       # Créer une migration
npx prisma studio            # Interface visuelle de la base
```

---

## Personnalisation & édition

### 1. Contenu de la page d'accueil

Le contenu principal se trouve dans les composants sous `src/components/site/`.

Modifiez les textes, titres, descriptions et listes de sorties directement dans ces fichiers React.

### 2. Images & assets

| Emplacement | Usage |
|---|---|
| `public/images/` | Logo, images hero, illustrations |
| `public/covers/` | Couvertures des articles du journal |

Remplacez simplement les fichiers en gardant les mêmes noms, ou mettez à jour les chemins dans le code.

### 3. Catégories de fichiers

Définies dans `src/lib/files.ts` :

```typescript
export const CATEGORIES = {
  PHOTO: { label: "Photo de sortie", emoji: "📷", drive: "photo" },
  CREATION: { label: "Création artistique", emoji: "🎨", drive: "creation" },
  TEMOIGNAGE: { label: "Témoignage / capsule", emoji: "🎙", drive: "temoignage" },
  DOCUMENT: { label: "Document", emoji: "📄", drive: "document" },
} as const;
```

Vous pouvez ajouter, renommer ou modifier les labels et emojis ici.

### 4. Sondage

- **Titre et état d'ouverture** : gérés via les Settings (interface admin ou table `Setting`)
- **Options** : table `PollOption` (modifiables en base ou via seed)

### 5. Styles & design

- **Thème global** : `src/app/globals.css`
- **Composants UI** : `src/components/ui/` (shadcn)
- **Configuration Tailwind** : `tailwind.config.ts`

### 6. Limites d'upload

Dans `src/lib/files.ts` :

```typescript
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 Mo
export const MAX_COVER_SIZE = 10 * 1024 * 1024;
```

---

## API principale

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Inscription (avec code d'invitation) |
| `POST` | `/api/auth/login` | Connexion |
| `POST` | `/api/auth/logout` | Déconnexion |
| `GET` | `/api/auth/me` | Utilisateur courant |
| `GET/POST` | `/api/files` | Liste / Upload de fichiers |
| `GET/DELETE` | `/api/files/[id]` | Détail / Suppression |
| `GET` | `/api/files/[id]/raw` | Téléchargement du fichier |
| `GET/POST` | `/api/posts` | Liste / Création d'articles |
| `GET/PUT/DELETE` | `/api/posts/[slug]` | Article individuel |
| `GET` | `/api/poll` | État du sondage + résultats |
| `POST` | `/api/poll/vote` | Voter |
| `GET` | `/api/admin/stats` | Statistiques (admin) |
| `GET/PUT` | `/api/admin/settings` | Paramètres globaux (admin) |
| `GET/PUT/DELETE` | `/api/admin/users` | Gestion des membres (admin) |

---

## Rôles & permissions

| Rôle | Droits principaux |
|---|---|
| `MEMBER` | Upload, vote, lecture du contenu membres, création de posts |
| `ADMIN` | Tout + gestion utilisateurs, paramètres, statistiques |

> Le code d'invitation est stocké dans la table `Setting` (clé `inviteCode`).

---

## Déploiement

### Vercel (recommandé)

1. Importez le dépôt sur [Vercel](https://vercel.com)
2. Ajoutez les variables d'environnement
3. Le build utilise :

```bash
prisma generate && next build
```

4. Activez **Vercel Blob** pour le stockage des fichiers

> Le projet est configuré en mode **standalone** (`next.config.ts`).

---

## Scripts utiles

```bash
npm run dev          # Développement (port 3000)
npm run build        # Build production
npm run start        # Lancer le build standalone
npm run lint         # ESLint
npm run db:push      # Prisma db push
npm run db:generate  # Prisma generate
npm run db:migrate   # Prisma migrate dev
npm run db:reset     # Reset complet de la base
```

---

## Contribution

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Committez vos changements
4. Poussez et ouvrez une **Pull Request**

> Merci de respecter le style de code existant et de tester localement avant de proposer une PR.

---

## Licence & crédits

Projet développé pour le groupe **Culture et mobilité**.

**Tous droits réservés © 2026.**

### Équipe d'animation

**Maison des Services de Ganges et alentours (34)**

Pour toute question technique ou demande d'évolution, contactez l'équipe d'animation du projet.

---

<p align="center">
  <sub>Fait avec ❤️ pour le groupe Culture et mobilité</sub>
</p>
