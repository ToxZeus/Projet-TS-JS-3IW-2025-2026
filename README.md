# Dashboard boursier TS/JS

Application TypeScript sans framework pour visualiser et comparer des actions boursières à partir d'une API REST.

## Objectif

- Récupérer des données boursières via API (`fetch`, `async/await`)
- Afficher un graphique dynamique multi-actions (Chart.js)
- Proposer une interface DOM interactive (sélection, période, chargement)
- Gérer les erreurs proprement (réseau, API, données, utilisateur)
- Conserver une architecture TypeScript claire et maintenable

## Stack technique

- TypeScript
- Chart.js
- Tailwind CSS (CDN pour le style UI)
- Zod (validation runtime des données API)

Source API :
- [https://keligmartin.github.io/api/stocks.json](https://keligmartin.github.io/api/stocks.json)

## Arborescence

- `src/api` : appels HTTP et classes d'erreurs API
- `src/models` : schémas Zod et types TypeScript
- `src/ui` : interface DOM, toasts, export CSV
- `src/charts` : préparation et rendu des données graphiques
- `scripts` : serveur statique pour l'interface web

## Installation et lancement

```bash
npm install
```

### Mode web (recommandé)

```bash
npm run dev:web
```

Puis ouvrir `http://localhost:5500`.

### Build + exécution

```bash
npm run build
npm run start:web
```

## Scripts disponibles

- `npm run dev` : watch TypeScript côté Node (`src/index.ts`)
- `npm run build` : compilation TypeScript vers `dist/`
- `npm run build:watch` : compilation TypeScript en continu
- `npm run start` : exécution du build Node (`dist/index.js`)
- `npm run start:web` : serveur HTTP local sur `localhost:5500`
- `npm run dev:web` : `build:watch` + `start:web` en parallèle
- `npm run check` : vérification TypeScript sans émission
- `npm run test` : exécution des tests

## Fonctionnalités implémentées

- Multi-sélection d'actions (checkboxes)
- Choix de période (`1 semaine`, `1 mois`, `1 an`)
- Choix du type de graphique (`lignes` / `barres`)
- Comparaison de plusieurs actions sur le même graphique
- Double axe Y (prix / volume)
- Mode sombre
- Sauvegarde des préférences (thème, sélection, période, type de graphique)
- Export CSV (sans librairie)
- Notifications toast custom (success / warning / error)

## Checklist des attendus

### Récupération des données

- [x] Appel API REST via `fetch`
- [x] Utilisation de `async/await`
- [x] Typage strict des données reçues (types + validation runtime)

### Affichage graphique

- [x] Représentation visuelle de l'évolution du prix dans le temps
- [x] Graphique lisible
- [x] Graphique dynamique (mise à jour après sélection)
- [x] Graphique changeable (lignes / barres)
- [x] Affichage d'au moins deux actions différentes
- [x] Utilisation d'une bibliothèque autorisée (`Chart.js`)

### Interface utilisateur (DOM)

- [x] Sélection d'une ou plusieurs actions
- [x] Choix d'une période
- [x] Déclenchement du chargement des données
- [x] Interface manipulée en JavaScript/TypeScript via le DOM

### Gestion des erreurs

- [x] Erreurs réseau gérées
- [x] Erreurs API gérées
- [x] Données invalides gérées
- [x] Erreurs utilisateur gérées
- [x] Interception via `try/catch`
- [x] Affichage clair dans l'interface (zone UI + toasts)

### Architecture TypeScript

- [x] TypeScript obligatoire
- [x] Typage strict activé (`strict: true`)
- [x] Interfaces/types pour les données API
- [x] Séparation logique (`api/`, `models/`, `ui/`, `charts/`)
- [x] Code lisible et maintenable

### Bonus

- [x] Mode sombre
- [x] Sauvegarde des préférences utilisateur
- [x] Export tableur (CSV)
- [x] Notions complémentaires (toasts custom, cache de filtres)

### Contraintes techniques

- [x] Projet sans framework
- [x] Utilisation d'une bibliothèque graphique autorisée
- [x] Projet compilable sans erreur TypeScript

