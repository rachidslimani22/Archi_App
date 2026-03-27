# TP global - Message Board (Parties 1 et 2)

## Objectif

Realiser une application de messagerie en 2 parties:

- **Partie 1**: HTML + CSS + JavaScript
- **Partie 2**: micro-service NodeJS + connexion du front via `fetch`

## Structure du projet

```text
Archi_App/
  client/
    index.html
    styles.css
    script.js
  server/
    index.js
    package.json
  render.yaml
  README.md
```

## Partie 1 - Ce qui est implemente

- Page HTML semantique (`header`, `main`, `section`, `h1`, `h2`, `form`)
- Liste de messages (`ul`)
- Un champ pseudo, un `textarea`, un bouton d'envoi
- Un bouton de mise a jour
- Theme clair/sombre
- Fonctions JS demandees:
  - `fact(n)`
  - `applique(f, tab)`
  - test avec fonction anonyme
- Fonction `update(messages)` pour reconstruire la liste

## Partie 2 - Ce qui est implemente

Serveur Express (`server/index.js`) avec etat en memoire:

- `counter`
- `allMsgs`

Routes:

- `GET /test/*`
- `GET /cpt/query`
- `GET /cpt/inc`
- `GET /cpt/inc?v=XXX`
- `GET /msg/get/*`
- `GET /msg/getAll`
- `GET /msg/nber`
- `GET /msg/post/*?pseudo=...`
- `GET /msg/del/*`
- `GET /health`

Connexion front/serveur:

- chargement initial: `GET /msg/getAll`
- publication: `GET /msg/post/...`
- mise a jour: `GET /msg/getAll`

## Tests manuels faits

- `/test/bonjour`
- `/cpt/query`, `/cpt/inc`, `/cpt/inc?v=5`, `/cpt/inc?v=abc`
- `/msg/getAll`, `/msg/get/0`, `/msg/nber`
- `/msg/post/hello%20world?pseudo=Bob`
- `/msg/del/0`
- test UI: affichage, envoi, mise a jour, changement de theme

## Deploiement Render

Configure via `render.yaml`:

- `rootDir: server`
- `buildCommand: npm install`
- `startCommand: npm start`
- `healthCheckPath: /health`

Le service Render expose a la fois le front et l'API.

## Limites

- donnees non persistantes (memoire serveur)
- routes de mutation en `GET` (choix de l'enonce)

## Amelioration simple proposee

Ajouter une persistance locale des messages dans un fichier JSON (`server/messages.json`) :

- chargement des messages au demarrage du serveur,
- sauvegarde apres chaque `post` et `del`.

## Liens a renseigner

- URL Render: `https://tp2-messageboard.onrender.com`
