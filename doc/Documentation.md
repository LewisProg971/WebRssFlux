# Document de Conception : Agrégateur de Veille Technologique & Gaming

## 1. Objectif du Projet
Créer une application web (Single Page Application) servant de tableau de bord centralisé pour agréger, catégoriser et afficher automatiquement les flux RSS provenant de diverses sources (Développement, IA, OS, Hardware et Gaming). Le site doit être rapide, mis à jour de manière automatisée, et hébergé gratuitement.

## 2. Catégories de Contenu et Sources RSS
Le contenu est divisé en trois grands piliers. Certaines sources n'ayant pas de flux officiels accessibles, des flux alternatifs fiables (via Reddit ou OpenRSS) sont utilisés.

### A. Écosystème Développement & IA
* **VS Code**
    * *URL :* `https://code.visualstudio.com/feed.xml`
    * *Remarque :* Notes de mises à jour officielles de l'éditeur.
* **JetBrains**
    * *URL :* `https://blog.jetbrains.com/feed/`
    * *Remarque :* Actualités de tous leurs IDE (IntelliJ, WebStorm, etc.).
* **TypeScript**
    * *URL :* `https://devblogs.microsoft.com/typescript/feed/`
    * *Remarque :* Blog officiel de l'équipe TS.
* **Angular**
    * *URL :* `https://blog.angular.dev/rss.xml`
    * *Remarque :* Actualités, nouveautés et mises à jour du framework officiel.
* **Anthropic (Claude)**
    * *URL :* `https://openrss.org/anthropic.com/news`
    * *Remarque :* Actus sur les modèles Claude (via OpenRSS).
* **Google (Gemini / AI)**
    * *URL :* `https://blog.google/technology/ai/rss/`
    * *Remarque :* Blog officiel de Google sur l'IA.
* **Hugging Face**
    * *URL :* `https://huggingface.co/blog/feed.xml`
    * *Remarque :* Indispensable pour l'actualité open-source de l'IA.

### B. Systèmes, OS & Hardware
* **Apple (iOS/macOS)**
    * *URL :* `https://www.apple.com/newsroom/rss-feed.rss`
    * *Remarque :* Le "Newsroom" officiel d'Apple (sorties et maj).
* **Windows**
    * *URL :* `https://blogs.windows.com/feed/`
    * *Remarque :* Blog officiel Microsoft / Mises à jour Windows.
* **Pilotes NVIDIA**
    * *URL :* `https://www.reddit.com/r/nvidia/search.rss?q=flair_name%3A%22Driver%22&restrict_sr=1`
    * *Remarque :* Filtre Reddit ciblant uniquement les annonces de nouveaux pilotes.

### C. Gaming & Bons Plans
* **Jeux Gratuits (Epic Games)**
    * *URL :* `https://www.reddit.com/r/GameDeals/search.rss?q=site:epicgames.com+OR+title:epic&restrict_sr=on&sort=new&t=all`
    * *Remarque :* Filtre Reddit récupérant spécifiquement les bons plans Epic.
* **Steam**
    * *URL :* `https://store.steampowered.com/feeds/news.xml`
    * *Remarque :* Actualités générales de la plateforme.
* **Rockstar Games**
    * *URL :* `https://www.rockstargames.com/newswire.rss`
    * *Remarque :* Actualités officielles (GTA, Red Dead, etc.).

## 3. Architecture et Choix Techniques
Le projet repose sur une architecture de "Pré-génération" (Pre-build) pour contourner les limitations de sécurité des navigateurs (CORS) lors de la lecture des flux RSS, tout en conservant une application Angular rapide et gratuite.

* **Front-End :** **Angular**. Création d'une interface utilisateur dynamique lisant un fichier de données local.
* **Mécanique d'Agrégation (Back-End éphémère) :** Un script **Node.js**. Avant chaque compilation d'Angular, ce script parcourt les URL RSS, extrait les données (Titre, Lien, Date, Résumé) et génère un fichier `data.json` placé dans le dossier `assets` d'Angular.
* **Hébergement :** **Vercel** (Plan Hobby 100 % gratuit).
* **Automatisation (CI/CD) :** Connexion du dépôt GitHub à Vercel. Utilisation d'un "Cron Job" (via GitHub Actions ou Vercel Cron) pour lancer le script Node.js, recompiler Angular, et déployer la nouvelle version automatiquement chaque jour.

## 4. Fonctionnalités Clés de l'Interface (Front-End)
* **Design Épuré :** Interface type "Dashboard" avec une lecture sous forme de cartes d'actualités.
* **Filtrage par Pilier :** Utilisation du système de routing ou de filtres Angular pour afficher "Dev/IA", "OS/Hardware" ou "Gaming".
* **Dark Mode :** Thème sombre (géré via CSS/Tailwind ou Angular Material).
* **Responsive Design :** Interface fluide s'adaptant aux écrans mobiles et bureaux.

## 5. Feuille de Route (Plan d'Action)
* **[FAIT] Étape 1 :** Définition des sources et architecture technique validées.
* **[À FAIRE] Étape 2 :** Initialisation du projet Angular et création du dépôt GitHub.
* **[À FAIRE] Étape 3 :** Développement du script Node.js (Parsing RSS vers JSON).
* **[À FAIRE] Étape 4 :** Création des composants Angular (Services, UI, Filtres) pour lire et afficher le `data.json`.
* **[À FAIRE] Étape 5 :** Déploiement initial sur Vercel.
* **[À FAIRE] Étape 6 :** Configuration de l'automatisation (Cron) pour les mises à jour quotidiennes.