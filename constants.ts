import { Sexe, StatutLapin } from './types';

export const RACES_COMMUNES = [
  "Néo-Zélandais",
  "Californien",
  "Géant des Flandres",
  "Fauve de Bourgogne",
  "Papillon",
  "Rex",
  "Bélier Français",
  "Argenté de Champagne",
  "Hybride Chair"
];

export const STATUS_LABELS: Record<StatutLapin, string> = {
  [StatutLapin.ACTIF]: "Actif (Reproducteur)",
  [StatutLapin.ENGRAISSEMENT]: "Engraissement",
  [StatutLapin.QUARANTAINE]: "Quarantaine",
  [StatutLapin.VENDU]: "Vendu",
  [StatutLapin.DECEDE]: "Décédé"
};

export const SEXE_LABELS: Record<Sexe, string> = {
  [Sexe.MALE]: "Mâle",
  [Sexe.FEMELLE]: "Femelle"
};

// Durée de gestation moyenne (jours)
export const DUREE_GESTATION = 31;
// Date de palpation après accouplement (jours)
export const JOURS_PALPATION = 12;
// Pose du nid avant mise bas (jours)
export const JOURS_NID_AVANT_MB = 3;
// Age de sevrage (semaines)
export const SEMAINES_SEVRAGE = 6;