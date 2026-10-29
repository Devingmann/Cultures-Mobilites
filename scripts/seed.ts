/* Seed du site Cultures et Mobilités.
   - Compte admin (mot de passe à changer après la première connexion)
   - Code d'invitation + paramètres du sondage
   - 11 options du sondage « prochaine sortie »
   - 3 premiers articles du journal
   Exécution : bun run scripts/seed.ts
*/
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const db = new PrismaClient();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })
    .toString("hex");
  return `scrypt$${salt}$${hash}`;
}

async function upsertSetting(key: string, value: string) {
  await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
}

const POLL_OPTIONS = [
  { emoji: "🖼", label: "Musée Fabre", description: "Visite guidée & atelier" },
  { emoji: "🎨", label: "MO.CO. Panacée", description: "Art contemporain" },
  { emoji: "🎭", label: "Coulisses de l'Opéra", description: "Visite guidée" },
  { emoji: "📷", label: "Pavillon Populaire / St-Ravy", description: "Expos photo & peinture" },
  { emoji: "🏛", label: "FRAC", description: "Expo « Déséquilibre » & architecture" },
  { emoji: "🌿", label: "Jardin des Plantes", description: "Balade flore & nature" },
  { emoji: "🏛", label: "Pierresvives", description: "Visite guidée / expos" },
  { emoji: "🎬", label: "Cinéma Utopia", description: "Film + visite de la salle de projection" },
  { emoji: "🚐", label: "Excursion à Lodève", description: "Musée & Manufacture de la Savonnerie" },
  { emoji: "🖥", label: "Micro-Folie Mosson", description: "Musée numérique & réalité virtuelle" },
  { emoji: "⛪", label: "Carré Sainte-Anne", description: "Art contemporain dans l'ancienne église néogothique" },
];

async function main() {
  // couvertures de démonstration
  const coversDir = path.join(process.cwd(), "public", "covers");
  fs.mkdirSync(coversDir, { recursive: true });
  for (const [src, dst] of [
    ["public/images/hero-wide.png", "public/covers/seed-illustration-sortie.png"],
    ["public/images/journal-art.png", "public/covers/seed-illustration-journal.png"],
    ["public/images/la-fenetre.png", "public/covers/seed-la-fenetre.png"],
  ] as const) {
    const from = path.join(process.cwd(), src);
    const to = path.join(process.cwd(), dst);
    if (fs.existsSync(from)) fs.copyFileSync(from, to);
  }

  // ---- Admin ----
  const adminEmail = "admin@cultures-mobilites.fr";
  let admin = await db.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    admin = await db.user.create({
      data: {
        name: "Équipe Animation",
        email: adminEmail,
        passwordHash: hashPassword("Culture2026!"),
        role: "ADMIN",
      },
    });
    console.log("✔ Admin créé :", adminEmail);
  } else {
    console.log("• Admin déjà présent (mot de passe inchangé)");
  }

  // ---- Paramètres ----
  await upsertSetting("inviteCode", "CULTURE34");
  await upsertSetting("pollOpen", "true");
  await upsertSetting(
    "pollTitle",
    "Prochaine sortie de groupe : quelle(s) activité(s) vous tente(nt) le plus ?"
  );
  console.log("✔ Paramètres en place (code invitation : CULTURE34)");

  // ---- Options du sondage ----
  const existing = await db.pollOption.count();
  if (existing === 0) {
    await db.pollOption.createMany({
      data: POLL_OPTIONS.map((o, i) => ({ ...o, order: i })),
    });
    console.log(`✔ ${POLL_OPTIONS.length} options de sondage créées`);
  } else {
    console.log(`• Sondage déjà peuplé (${existing} options)`);
  }

  // ---- Articles (création idempotente par slug) ----
  type PostSeed = {
    slug: string;
    title: string;
    kind: string;
    coverName?: string;
    authorId: string;
    createdAt: Date;
    content: string;
  };
  const postsData: PostSeed[] = [
        {
          slug: "compte-rendu-temps-de-groupe-6-octobre",
          title: "Compte rendu du temps de groupe du 6 octobre",
          kind: "ARTICLE",
          coverName: "seed-illustration-sortie.png",
          authorId: admin.id,
          createdAt: new Date("2026-10-06T14:00:00"),
          content: `Mardi 6 octobre, de 14 h à 16 h, nous nous sommes retrouvés à la **Maison des Services de Ganges** pour un temps de groupe dédié au projet « Culture et mobilité ». Un projet transversal porté par trois dispositifs : **APIJE Mobilité** (Marie Vincent), la **SCIC IFAD Accompagnement Intégré** (Anne Marie Lamboray) et l'**IFAD SCOP – Parcours Santé Mieux Être** (Leslie Vorstermans).

Après la sortie culturelle à Nîmes, l'objectif était double : partager les ressentis de chacun sur ce qui a été vécu, et préparer ensemble la suite. La météo n'a malheureusement pas permis à tout le monde d'être présent, mais même en petit groupe, plusieurs idées et pistes de réflexion ont émergé.

## Quels outils pour partager nos sorties ?

L'idée d'un **blog ou d'un journal de groupe** a retenu notre attention : un outil qui permet à chacun de participer selon ses envies et ses facilités — article écrit, photos, capsule audio ou vidéo, création artistique. Ce site est né de cette envie !

Quelques questions restent à préciser ensemble :

- À qui s'adresse ce journal : uniquement au groupe, ou à une communauté plus large ?
- Comment respecter le **droit à l'image** et la possibilité de rester anonyme ?
- Quels contenus partager : récits, observations et ressentis liés aux visites, ou aussi des sujets plus personnels ?

## Retour sur la sortie à Nîmes

Le partage a fait émerger des souvenirs différents selon les personnes, autour de trois moments : la découverte des monuments historiques, le temps du repas et la visite du **musée de la Romanité**.

**Ce qui a été apprécié** : la qualité de la visite proposée par Apolline, la guide du musée — sa disponibilité pour répondre aux questions et sa manière de raconter les œuvres. L'atelier collage de fin de visite a aussi été globalement apprécié. Apolline a d'ailleurs présenté nos créations à la directrice du musée, après avoir elle-même apprécié l'intérêt porté par le groupe.

**Ce qui peut être amélioré** : un timing parfois serré (le jeu de piste n'a pas pu être mené jusqu'au bout), un programme à annoncer plus clairement en amont, et la question du repas — apporter son pique-nique doit être rappelé plus nettement pour éviter les disparités. Ces remarques sont précieuses pour les prochaines sorties, en gardant à l'esprit qu'une sortie de groupe comporte toujours des imprévus : *comment faire avec l'imprévu ? comment s'adapter à une dynamique de groupe ?*

## Garder une trace de nos sorties

Pour rassembler les photos, témoignages et créations, un espace partagé est désormais à disposition : le **drive du groupe** sur ce site. Chacun peut y déposer ses images et fichiers, et la galerie les met en valeur.

## Et maintenant ?

Entre chaque sortie culturelle, nous vous proposerons un temps de debrief et un temps pour alimenter le journal — pour faire vivre le projet collectivement. La **sortie de novembre** se prépare dès maintenant : votez dans le sondage pour les activités qui vous tentent, et retrouvons-nous pour choisir le lieu et l'organisation.`,
        },
        {
          slug: "boucle-culturelle-centre-ville",
          title: "La « Boucle Culturelle » : l'après-midi idéale en centre-ville",
          kind: "PHOTO",
          coverName: "seed-illustration-journal.png",
          authorId: admin.id,
          createdAt: new Date("2026-10-27T18:00:00"),
          content: `Pour une après-midi à pied au cœur de Montpellier, voici un **parcours optimisé** qui relie plusieurs étapes culturelles du centre historique. Idéal pour une sortie de groupe en douceur — chaque étape se fait à pied, en 5 à 10 minutes de marche.

## Le parcours

- **Départ — Jardin des Plantes** : une balade nature & histoire au calme, entre les arbres centenaires de l'École de Pharmacie.
- **Étape 2 — MO.CO. Panacée** : à 5-10 minutes à pied en descendant vers l'École de Pharmacie, un lieu dédié à l'art contemporain.
- **Étape 3 — Carré Sainte-Anne** : en plein cœur de l'Écusson, l'ancienne église néogothique accueillant des expositions d'art contemporain.
- **Étape 4 — Musée Fabre** : juste à côté du boulevard Bonne-Nouvelle, le grand musée des beaux-arts de Montpellier.
- **Arrivée — Pavillon Populaire / Opéra Comédie** : sur l'Esplanade, parfait pour finir la journée par un verre en terrasse entre collègues !

Ce parcours croise plusieurs idées déjà proposées au sondage (Jardin des Plantes, MO.CO., Carré Sainte-Anne, Musée Fabre, Pavillon Populaire). À vous de voter pour vos préférées — et si la boucle vous tente, dites-le-nous !`,
        },
        {
          slug: "bienvenue-dans-le-journal-du-groupe",
          title: "Bienvenue dans le journal du groupe",
          kind: "ARTICLE",
          authorId: admin.id,
          createdAt: new Date("2026-10-28T10:00:00"),
          content: `Ce journal est **le nôtre** : il vit des contributions de chacune et chacun. Pas besoin d'être un grand écrivain — il suffit d'avoir envie de partager.

## Les formats possibles

- Un court **récit** écrit : ce qui m'a marqué, ce que j'ai découvert, une anecdote.
- Un **retour en photos** : quelques images commentées d'une sortie ou d'une création.
- Une **capsule audio ou vidéo** : enregistrez-vous en fin de sortie (comme le propose Marie Laure pour les témoignages), déposez-la dans le drive, et attachez-la à un article.
- Une **création artistique** : collage, dessin, écriture… comme à l'atelier du musée de la Romanité !

## Le respect de chacun

Le droit à l'image et la parole de chacun sont au cœur du projet. Quelques repères simples :

- Ne partagez que des photos où les **personnes visibles sont d'accord**.
- Il est toujours possible de rester **anonyme** : parlez-en à un animateur, l'article paraîtra sans votre nom.
- Chacun participe **selon ses envies et ses facilités** : à l'écrit, à l'oral, en images ou en organisation — il y a une place pour tous les talents.

Bonne lecture, et surtout, bonne écriture !`,
        },
        {
          slug: "prochaine-sortie-12-novembre-la-fenetre",
          title: "Prochaine sortie : jeudi 12 novembre au Centre d'Art La Fenêtre",
          kind: "ARTICLE",
          coverName: "seed-la-fenetre.png",
          authorId: admin.id,
          createdAt: new Date(),
          content: `C'est décidé : notre prochaine sortie culturelle aura lieu le **jeudi 12 novembre 2026** au **Centre d'Art La Fenêtre**, installé dans l'aile droite de l'Opéra Comédie, face à la place de la Comédie à Montpellier.

## Une exposition pour décloisonner les disciplines

L'exposition d'automne 2026 explore **l'architecture, le design graphique et l'espace urbain** : design d'objet, typographie, fabrique urbaine… un programme qui fait écho à nos balades urbaines et à notre envie de comprendre la ville autrement.

## Informations pratiques

- **Entrée : 100 % libre** pour toutes et tous
- **Horaires :** du mercredi au samedi, de 13h00 à 18h00
- **Mobilité APIJE :** tramways lignes 1 et 2 (arrêt Comédie)

Leslie Vorstermans se renseigne actuellement sur les **créneaux horaires** précis pour le groupe. Les consignes seront annoncées clairement en amont, comme convenu lors de notre dernier temps de groupe : programme détaillé, pique-nique rappelé, timing assoupli.

Et pour finir en douceur : un **debriefing convivial en terrasse** de la Comédie, juste en face. La fiche complète (plan, horaires, accès) est dans l'onglet **Sorties** du site.

> Le sondage reste ouvert pour préparer les prochaines propositions : musée Fabre, Lodève, MO.CO. Panacée, Pavillon Populaire, Carré Sainte-Anne, Jardin des Plantes… Votez pour celles qui vous tentent !`,
        },
        {
          slug: "compte-rendu-27-novembre",
          title: "Compte rendu du temps de groupe du 27 novembre",
          kind: "ARTICLE",
          authorId: admin.id,
          createdAt: new Date(),
          content: `**Rédaction en cours.** Le compte rendu de notre temps de groupe du 27 novembre est en cours de préparation : il sera publié et complété ici dès qu'il sera finalisé.

En attendant, voici ce qui vous attend d'ici là :

- Notre **sortie du jeudi 12 novembre** au Centre d'Art La Fenêtre — l'annonce complète est dans le journal, la fiche pratique dans l'onglet **Sorties**
- Le **sondage** reste ouvert : votez pour les lieux qui vous tentent pour les prochaines sorties (plusieurs choix possibles)
- Les **photos et créations** peuvent être déposées dans le drive dès maintenant — la galerie les met en valeur pour tout le groupe

*Si vous souhaitez participer à la rédaction de ce compte rendu — une anecdote, un ressenti, une photo commentée — parlez-en aux animateurs : chacun peut écrire dans le journal.*`,
        },
  ];
  let created = 0;
  for (const p of postsData) {
    const exists = await db.post.findUnique({ where: { slug: p.slug } });
    if (!exists) {
      await db.post.create({ data: p });
      created++;
    }
  }
  console.log(created > 0 ? `✔ ${created} article(s) ajouté(s) au journal` : "• Journal déjà à jour");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
