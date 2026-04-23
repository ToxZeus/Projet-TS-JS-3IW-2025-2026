# Projet TS/JS 3IW

Ce jalon couvre uniquement:

- architecture TypeScript
- récupération des données via API distante

API source utilisée:

- https://keligmartin.github.io/api/stocks.json

## Architecture

- `src/models` types et validation runtime des données API
- `src/api` appels réseau `fetch` avec `async/await`
- `src/ui` affichage (console pour ce jalon)
- `src/charts` transformation des données en séries exploitables

## Scripts

- `npm run dev` lance la récupération des données en mode watch
- `npm run build` compile TypeScript
- `npm start` exécute le build compilé
- `npm run start:web` lance un serveur HTTP local pour l'interface web
- `npm run check` vérifie le typage strict
- `npm run test` lance les tests de parsing, erreurs et service

## Lancer l'interface web

Pour tester `index.html`, il faut passer par un serveur HTTP local.

1. Exécuter `npm run start:web`
2. Ouvrir `http://localhost:5500`

Ne pas ouvrir `index.html` directement en `file://...`, sinon le navigateur bloque les modules JavaScript avec une erreur CORS.

