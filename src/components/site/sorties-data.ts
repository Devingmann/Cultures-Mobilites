/* Fiches « Sorties & lieux à découvrir » du groupe.
   Données structurées : statut, tarif, horaires, mobilité APIJE, lien Google Maps.
   + Calendrier prévisionnel Décembre 2026 – Juin 2027. */

export type SortieStatus = "prochaine" | "realisee" | "proposition";

export type Sortie = {
  id: string;
  nom: string;
  tagline: string;
  statut: SortieStatus;
  statutLabel: string;
  date?: string;
  periode?: string;
  lieu: string;
  adresse: string;
  paragraphs: string[];
  tarif: string;
  horaires: string;
  mobilite: string;
  illustration?: string;
};

export type RendezVous = {
  mois: string;
  date: string;
  type: "sortie" | "atelier";
  label: string;
  lieu?: string;
  aConfirmer?: boolean;
};

export function mapsUrl(s: Sortie): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${s.nom}, ${s.adresse}`
  )}`;
}

/** Calendrier prévisionnel du groupe Culture et mobilité — Décembre 2026 – Juin 2027 */
export const CALENDRIER: RendezVous[] = [
  { mois: "DÉCEMBRE 2026", date: "Mardi 8 décembre", type: "sortie", label: "Sortie culturelle" },
  { mois: "JANVIER 2027", date: "Jeudi 7 janvier (après-midi)", type: "atelier", label: "Atelier intermédiaire", lieu: "Ganges", aConfirmer: true },
  { mois: "JANVIER 2027", date: "Jeudi 21 janvier", type: "sortie", label: "Sortie culturelle" },
  { mois: "FÉVRIER 2027", date: "Jeudi 4 février (après-midi)", type: "atelier", label: "Atelier intermédiaire", lieu: "Saint-Mathieu-de-Tréviers", aConfirmer: true },
  { mois: "MARS 2027", date: "Jeudi 4 mars", type: "sortie", label: "Sortie culturelle" },
  { mois: "MARS 2027", date: "Jeudi 18 mars (après-midi)", type: "atelier", label: "Atelier intermédiaire", lieu: "Ganges", aConfirmer: true },
  { mois: "AVRIL 2027", date: "Jeudi 22 avril", type: "sortie", label: "Sortie culturelle" },
  { mois: "MAI 2027", date: "Jeudi 20 mai (après-midi)", type: "atelier", label: "Atelier intermédiaire" },
  { mois: "JUIN 2027", date: "Jeudi 3 juin", type: "sortie", label: "Sortie culturelle" },
  { mois: "JUIN 2027", date: "Jeudi 17 juin (après-midi)", type: "atelier", label: "Atelier intermédiaire" },
];

export const SORTIES: Sortie[] = [
  {
    id: "la-fenetre",
    nom: "Centre d'Art La Fenêtre",
    tagline: "Architecture, Design Graphique & Espace Urbain",
    statut: "proposition",
    statutLabel: "À proposer au groupe",
    periode: "Exposition d'automne 2026",
    lieu: "Montpellier — Place de la Comédie",
    adresse: "Aile droite de l'Opéra Comédie, Place de la Comédie, 34000 Montpellier",
    paragraphs: [
      "Installé dans l'aile droite de l'Opéra Orchestre National, face à la place de la Comédie, le centre d'art La Fenêtre décloisonne les disciplines en explorant l'architecture, le design d'objet, la typographie et la fabrique urbaine.",
      "Une visite idéale pour relier marche urbaine, découverte spatiale et debriefing convivial en terrasse de la Comédie.",
    ],
    tarif: "100 % gratuit pour toutes et tous",
    horaires: "Du mercredi au samedi, de 13h00 à 18h00",
    mobilite: "Tramways lignes 1 et 2 (arrêt Comédie)",
    illustration: "/images/la-fenetre.png",
  },
  {
    id: "musee-fabre",
    nom: "Musée Fabre",
    tagline: "« Le design selon Pierre Paulin (1927-2009) » — rétrospective majeure",
    statut: "proposition",
    statutLabel: "À proposer au groupe",
    periode: "Derniers jours — prolongation en cours",
    lieu: "Montpellier — Boulevard Bonne Nouvelle",
    adresse: "39 Boulevard Bonne Nouvelle, 34000 Montpellier",
    paragraphs: [
      "Première grande exposition du musée Fabre dédiée au design du XXe siècle, en partenariat avec le Mobilier National : près de 100 pièces historiques, des fauteuils sculpturaux aux formes organiques que le public peut parfois tester.",
      "Les célèbres assises iconiques (Mushroom, Ribbon, Orange Slice) et le fumoir Pompidou de l'Élysée : un choc visuel entre les toiles classiques du musée et la modernité des années 1970.",
    ],
    tarif: "Tarif groupe insertion négocié : 6 € — minimas sociaux gratuits",
    horaires: "Du mardi au dimanche, 10h-18h (fermé le lundi)",
    mobilite: "Tram 1 et 2 (arrêt Comédie ou Corum)",
  },
  {
    id: "lodeve",
    nom: "Musée de Lodève & Savonnerie Nationale",
    tagline: "« Anouck Manzoni – Anagogie » & Atelier de Tapis de l'Élysée",
    statut: "proposition",
    statutLabel: "À proposer au groupe",
    periode: "Du 19 septembre 2026 au 3 janvier 2027",
    lieu: "Lodève — cœur de ville",
    adresse: "Square Georges Auric, 34700 Lodève",
    paragraphs: [
      "Dans le splendide Hôtel du Cardinal de Fleury, Anouck Manzoni fait dialoguer ses toiles organiques avec les collections de géologie : un dialogue poétique entre pigments sédimentés et fossiles de dinosaures.",
      "À quelques pas, l'atelier de la Manufacture de la Savonnerie — unique antenne nationale — dévoile les liciers tissant les tapis d'apparat des palais républicains.",
    ],
    tarif: "8 € (tarif groupe) — minibus APIJE",
    horaires: "Mar-dim, 10h30-13h et 14h-18h — Savonnerie : jeudis et vendredis à 14h sur réservation",
    mobilite: "Minibus solidaire APIJE Mobilité depuis Ganges (35 min) ou car liO 661 / 680",
  },
  {
    id: "moco-panacee",
    nom: "MO.CO. Panacée",
    tagline: "« June Crespo – Pulsation » & « Fantôme de mon opéra »",
    statut: "proposition",
    statutLabel: "À proposer au groupe",
    periode: "Nouvelle grande saison dès le 5 décembre 2026",
    lieu: "Montpellier — Écusson",
    adresse: "14 Rue de l'École de Pharmacie, 34000 Montpellier",
    paragraphs: [
      "Ancien Collège Royal de Médecine fondé au XVIIIe siècle, la Panacée est un espace d'art d'avant-garde convivial : art contemporain sculptural, grande verrière lumineuse et café associatif dans la cour arborée.",
      "L'exposition de June Crespo mêle métal, résine et textiles. La cour pavée ombragée offre un cadre serein pour débriefer entre participants.",
    ],
    tarif: "100 % gratuit",
    horaires: "Du mercredi au dimanche, de 11h à 18h",
    mobilite: "Tram 1 (arrêt Louis Blanc) ou tram 4 (Albert 1er)",
  },
  {
    id: "pavillon-populaire",
    nom: "Pavillon Populaire",
    tagline: "« Premières fois / Premières photos » — commissariat Luce Lebart",
    statut: "proposition",
    statutLabel: "À proposer au groupe",
    periode: "Espace Photographique des débuts de la photographie",
    lieu: "Montpellier — Esplanade Charles de Gaulle",
    adresse: "Esplanade Charles de Gaulle, 34000 Montpellier",
    paragraphs: [
      "Édifice néoclassique somptueux retraçant les balbutiements de la photographie mondiale : des inventions optiques du XIXe siècle aux premiers clichés de Martin Parr et Bernard Plossu.",
      "Au bout des allées bordées de platanes de l'Esplanade, à 2 minutes du musée Fabre et de la Comédie.",
    ],
    tarif: "100 % gratuit",
    horaires: "Du mardi au dimanche, 10h-13h et 14h-18h",
    mobilite: "Tramways 1 et 2 (arrêt Comédie)",
  },
  {
    id: "carre-sainte-anne",
    nom: "Carré Sainte-Anne",
    tagline: "Nef néogothique & installations monumentales",
    statut: "proposition",
    statutLabel: "À proposer au groupe",
    periode: "Centre d'art contemporain municipal",
    lieu: "Montpellier — Écusson",
    adresse: "2 Rue Sainte-Anne, 34000 Montpellier",
    paragraphs: [
      "Ancienne église désacralisée du XIXe siècle dont les vitraux illuminent des œuvres monumentales : l'un des lieux les plus spectaculaires de l'Écusson.",
      "Ses voûtes en croisée d'ogives culminant à plus de 20 mètres accueillent des artistes contemporains d'envergure internationale — accessible au détour des ruelles piétonnes.",
    ],
    tarif: "100 % gratuit",
    horaires: "Du mardi au dimanche, 13h-18h",
    mobilite: "100 % piéton dans le quartier Sainte-Anne",
  },
  {
    id: "jardin-des-plantes",
    nom: "Jardin des Plantes de Montpellier",
    tagline: "Botanique historique, allée des Bambous & Orangerie",
    statut: "proposition",
    statutLabel: "À proposer au groupe",
    periode: "Ouvert toute l'année — créé en 1593 par Henri IV",
    lieu: "Montpellier — Boulevard Henri IV",
    adresse: "Boulevard Henri IV, 34000 Montpellier",
    paragraphs: [
      "Le plus vieux jardin botanique de France : 4,5 hectares de calme et de fraîcheur ombragée, fondé pour la Faculté de Médecine par Pierre Richer de Belleval.",
      "Lieu paisible idéal pour un temps d'accueil détendu, un pique-nique sous les arbres centenaires et une initiation au dessin de nature.",
    ],
    tarif: "100 % gratuit",
    horaires: "Du mardi au dimanche, 12h-18h (fermé le lundi)",
    mobilite: "Tram 1 (arrêt Albert 1er - Cathédrale) ou tram 4",
  },
  {
    id: "musee-romanite",
    nom: "Musée de la Romanité & Jardins de la Fontaine",
    tagline: "Parcours romain & atelier collage avec Apolline",
    statut: "realisee",
    statutLabel: "Sortie réalisée",
    date: "Mardi 6 octobre 2026",
    periode: "Notre sortie de référence",
    lieu: "Nîmes — face aux Arènes",
    adresse: "16 Boulevard des Arènes, 30000 Nîmes",
    paragraphs: [
      "Le souvenir marquant de notre journée à Nîmes : 5 000 pièces antiques, la mosaïque de Bellérophon et l'atelier collage de fin de visite avec Apolline — un modèle d'accueil pour nos futures sorties.",
      "La façade en drap de verre de 7 000 lames signée Elizabeth de Portzamparc fait face aux Arènes. Pour la suite, nous garderons une gestion du temps assouplie.",
    ],
    tarif: "Tarif groupe conventionné insertion : 6 €",
    horaires: "Tous les jours sauf le mardi, 10h-18h",
    mobilite: "Train liO TER (gare Nîmes Centre à 5 min) ou minibus",
  },
];

export const PROCHAINE = SORTIES.find((s) => s.statut === "prochaine");
export const PROPOSITIONS = SORTIES.filter((s) => s.statut === "proposition");
export const REALISEES = SORTIES.filter((s) => s.statut === "realisee");
