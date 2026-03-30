# SiteFlux RSS

Tableau de bord Angular pour agreger automatiquement des flux RSS sur trois piliers:
- Dev & IA
- OS & Hardware
- Gaming

## Lancer en local

```bash
npm install
npm run start
```

Application disponible sur `http://localhost:4200`.

## Workflow RSS

Le script Node agrege les flux et ecrit le resultat dans `src/assets/data.json`.

```bash
npm run rss:build
```

Le script est lance automatiquement pendant:
- `npm run start`
- `npm run build`

## Fonctions UI

- Filtrage par pilier
- Recherche plein texte (titre, source, resume)
- Tri (plus recents, plus anciens, par source)
- Theme sombre responsive

## Build et tests

```bash
npm run build
npm run test
```

## Documentation projet

- Conception: `doc/Documentation.md`
- Suivi avancement: `doc/Avancement.md`
