# TODO Projet SiteFlux RSS

## Regle de suivi
- A chaque changement significatif du projet, mettre a jour doc/Avancement.md.
- Mettre a jour ce fichier TODO quand une tache passe de "A faire" a "En cours" puis "Fait".

## A faire
- [ ] Mettre en place le deploiement Vercel.
- [ ] Configurer une mise a jour automatique quotidienne (Cron).
- [ ] Verifier le rendu final sur mobile et desktop.
- [ ] Ajouter une section "sante des flux" (nombre de sources OK/KO).
- [ ] Affiner la regle d'exclusion Windows Insider selon les besoins (liste blanche/noire par source).

## En cours
- [ ] Aucun

## Fait
- [x] Initialiser le projet Angular.
- [x] Creer le script d'agregation RSS vers src/assets/data.json.
- [x] Ajouter filtres, recherche et tri dans le dashboard.
- [x] Limiter les articles a 10 par categorie.
- [x] Stabiliser les flux RSS en erreur (Angular, Anthropic, Rockstar).
- [x] Ajouter un bouton de rafraichissement manuel des donnees.
- [x] Coloriser les badges par categorie (Dev/OS/Gaming).
- [x] Limiter les descriptions avec line-clamp pour l'homogeneite des cartes.
- [x] Ajouter le mode "A lire plus tard" avec favoris locaux.
- [x] Afficher les dates en format relatif ("il y a 2 heures").
- [x] Renforcer la resilience RSS (timeout par flux + warnings non bloquants).
