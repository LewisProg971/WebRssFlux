# Avancement Projet SiteFlux RSS

## Etat Global
- Initialisation Angular: termine
- Script aggregation RSS: termine
- Dashboard filtres + cartes: termine
- Recherche et tri: termine
- Preparation deploiement Vercel: a faire
- Automatisation cron: a faire

## Journal
### 2026-04-03
- Uniformisation visuelle des cartes avec une hauteur fixe pour harmoniser la grille.
- Limitation d'affichage des titres et resumes (line-clamp) pour eviter les cartes disproportionnees.
- Mise en place du bouton de rafraichissement manuel des donnees RSS dans l'interface.

### 2026-03-30
- Mise en place du projet Angular en racine.
- Ajout du script Node de generation RSS vers src/assets/data.json.
- Creation du dashboard responsive avec filtres par pilier.
- Correction des flux instables:
  - Angular -> https://blog.angular.dev/feed
  - Anthropic -> Google News RSS cible anthropic.com/news
  - Rockstar -> Google News RSS cible rockstargames.com/newswire
- Ajout de la recherche plein texte et du tri (recent, ancien, source).
- Limitation des articles a 10 par categorie (30 au total).
- Creation du fichier de suivi des taches: doc/TODO.md.
- Regle actee: mise a jour systematique de ce fichier Avancement a chaque changement significatif.

## Prochaines actions
- Verifier le rendu final mobile/desktop.
- Ajouter un bouton de rafraichissement manuel des donnees.
- Mettre en place le deploiement Vercel et la tache planifiee quotidienne.
