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
- `npm run check` vérifie le typage strict
- `npm run test` lance les tests de parsing, erreurs et service

