# Happy Place — version élèves

Happy Place est le dashboard interne de **Bigger Boat**, un cabinet de recrutement fictif. Il réunit les actualités, les idées et demandes des équipes, les points bloquants et les indicateurs.

Ce dépôt contient **le code de l'app à l'identique**, avec une seule différence : la connexion est libre. Tu crées un compte avec ton email, puis tu **choisis ton rôle** (collaborateur, manager ou admin) et ton équipe. Le lien **« Changer de rôle »** en haut de l'écran te permet de tester l'app sous chaque angle.

Chaque groupe installe **sa propre base Supabase**, sans toucher à celle des autres groupes.

---

## Ce qu'il te faut

- Un compte [Supabase](https://supabase.com) (plan gratuit).
- [Node.js](https://nodejs.org) version 20 ou plus (vérifie avec `node -v`).
- Ce dossier sur ton ordinateur.

Compte environ 15 minutes.

---

## 1. Créer le projet Supabase

1. Sur [supabase.com/dashboard](https://supabase.com/dashboard), clique sur **New project**.
2. Donne-lui un nom (par exemple `happy-place-groupe-3`), choisis un mot de passe de base de données et une région en Europe.
3. Attends que le projet soit prêt (1 à 2 minutes).

## 2. Désactiver la confirmation par email

Sans cette étape, chaque inscription attend un email de confirmation.

**Authentication** → **Sign In / Providers** → **Email** → désactive **Confirm email** → **Save**.

## 3. Installer la base de données

1. Ouvre **SQL Editor** → **New query**.
2. Ouvre le fichier `supabase/setup.sql` de ce dossier, copie **tout** son contenu, colle-le, puis clique sur **Run**.
3. Le dernier résultat affiche une liste de tests : **toutes les lignes doivent indiquer `ok = true`**.
4. Ouvre une nouvelle requête, colle le contenu de `supabase/seed.sql` (les données de démo), puis **Run**.

> Tu peux relancer `seed.sql` à tout moment pour remettre les contenus de démo dans leur état de départ. Les comptes créés sont conservés.

## 4. Relier l'app à ta base

1. Dans Supabase, clique sur **Connect** (en haut), ou ouvre **Project Settings** → **API Keys**.
2. Récupère l'**URL du projet** (`https://xxxx.supabase.co`) et la **Publishable key** (`sb_publishable_…`).
3. Dans ce dossier, copie le fichier `.env.example` et renomme la copie en `.env`.
4. Remplace les deux valeurs dans `.env`.

> La clé « publishable » est faite pour être utilisée dans le navigateur. N'utilise **jamais** la clé `secret` ou `service_role` dans ce fichier.

## 5. Lancer l'app

Dans un terminal, depuis ce dossier :

```sh
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000), clique sur **Créer un compte**, puis choisis ton rôle.

---

## Les trois rôles

| Rôle | Ce qu'il peut faire |
|---|---|
| **Collaborateur** | Lit les actualités et les indicateurs, soumet des idées, questions ou problèmes pour son équipe. |
| **Manager** | Valide ou refuse les demandes des équipes qu'il manage, rédige des actualités (en brouillon), suit les points bloquants. |
| **Admin** | Gère tout : contenus, indicateurs, équipes et utilisateurs (espace « Gérer les données »). |

Ces droits sont appliqués **par la base elle-même** (règles RLS de Supabase), pas seulement par l'interface.

La base contient aussi dix membres fictifs de Bigger Boat (`@biggerboat.example`). Ils n'ont pas de compte de connexion : ils peuplent l'écran des utilisateurs et managent certaines équipes.

---

## Pour aller plus loin

- **Commandes utiles** : `npm run build` (version de production), `npm run start` (lance cette version), `npm run typecheck` (vérifie les types).
- **Structure** : les écrans sont dans `src/routes`, les composants dans `src/components`, et la base dans `supabase/migrations` (une migration par évolution, dans l'ordre).
- **Modifier la base** : écris une nouvelle migration SQL plutôt que de modifier les anciennes. Après toute modification d'ENUM, de trigger ou de statut, lance `select * from private.run_smoke_tests();` : toutes les lignes doivent revenir à `ok = true`.
- **Règles du projet** : le fichier `AGENTS.md` liste les conventions à respecter. Donne-le à ton assistant IA de code.
- **Tâches automatiques** : deux tâches tournent chaque nuit dans Supabase (revalidation annuelle des contenus, départs programmés des collaborateurs). Tu les retrouves dans le module **Cron** de Supabase.
- **Mise en ligne** : l'app tourne sur un serveur Node (TanStack Start). Elle se déploie sur Vercel ou Netlify : ajoute `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY` dans les variables d'environnement de l'hébergeur.

## En cas de problème

| Symptôme | Cause probable |
|---|---|
| « Missing Supabase environment variable(s) » | Le fichier `.env` est absent ou mal nommé. Relance `npm run dev` après l'avoir corrigé. |
| « Ce compte attend une confirmation par email » | L'étape 2 n'a pas été faite. Désactive **Confirm email**, puis crée un nouveau compte. |
| « Impossible de charger les équipes » | `setup.sql` n'a pas été exécuté en entier. Relance-le sur un projet neuf. |
| Le dashboard est vide | `seed.sql` n'a pas été exécuté. |
| Un test de `setup.sql` est à `false` | Le script a été lancé deux fois, ou en partie. Le plus simple est de repartir d'un projet Supabase neuf. |

---

### Différences avec l'app d'origine

- **Connexion** : email et mot de passe ouverts à tous, à la place de la connexion Google réservée à une liste blanche.
- **Nouvel écran** `/choisir-role` et lien « Changer de rôle » dans l'en-tête.
- **Nouvelle fonction SQL** `choisir_mon_role` (migration `20261016090000_connexion_libre.sql`). Les règles de sécurité par rôle sont inchangées.
- **Configuration standard** à la place des outils propres à Lovable (`vite.config.ts`, client Supabase).
- **Base installable de zéro** : migrations regroupées dans `supabase/migrations`, espaces de stockage ajoutés, et une ancienne migration inutilisée retirée.
