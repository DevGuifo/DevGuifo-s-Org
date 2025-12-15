
export enum Sexe {
  MALE = 'MALE',
  FEMELLE = 'FEMELLE'
}

export enum StatutLapin {
  ACTIF = 'ACTIF',
  VENDU = 'VENDU',
  DECEDE = 'DECEDE',
  QUARANTAINE = 'QUARANTAINE',
  ENGRAISSEMENT = 'ENGRAISSEMENT'
}

export interface PoidsMesure {
  date: string;
  poids: number;
}

export interface Lapin {
  id: string;
  nom: string;
  tatouage?: string;
  race: string;
  sexe: Sexe;
  couleur: string;
  dateNaissance: string; // ISO Date
  poidsActuel: number; // en kg
  poidsHistorique?: PoidsMesure[];
  pereId?: string;
  mereId?: string;
  photoUrl?: string;
  statut: StatutLapin;
  cage: string;
}

export enum StatutReproduction {
  ACCOUPLEMENT = 'ACCOUPLEMENT',
  GESTATION = 'GESTATION',
  MISE_BAS = 'MISE_BAS',
  SEVRAGE = 'SEVRAGE',
  TERMINE = 'TERMINE'
}

export interface Reproduction {
  id: string;
  pereId: string;
  mereId: string;
  dateAccouplement: string;
  dateMiseBasPrevue: string;
  dateMiseBasReelle?: string;
  nombreNes?: number;
  nombreVivants?: number;
  statut: StatutReproduction;
}

export enum TypeTransaction {
  VENTE = 'VENTE',
  ACHAT = 'ACHAT',
  DEPENSE = 'DEPENSE' // Alimentation, véto, matériel
}

export interface Transaction {
  id: string;
  date: string;
  montant: number;
  type: TypeTransaction;
  categorie: string;
  description: string;
}

export interface Tache {
  id: string;
  titre: string;
  dateEcheance: string;
  terminee: boolean;
  lapinId?: string;
  type: 'VACCIN' | 'PALPATION' | 'NID' | 'SEVRAGE' | 'ALIMENTATION' | 'AUTRE';
}

export interface Vaccination {
  id: string;
  lapinId: string;
  date: string;
  nomVaccin: string; // ex: Filavac, Eravac
  lot?: string;
  prochainRappel?: string;
  veterinaire?: string;
}

export type TypeNote = 'OBSERVATION' | 'SYMPTOME' | 'VETO' | 'TRAITEMENT';

export interface NoteSante {
  id: string;
  lapinId: string;
  date: string;
  type: TypeNote;
  contenu: string;
}

export interface PlanAlimentaire {
  id: string;
  nourriture: string; // ex: Granulés, Foin, Légumes
  frequenceJours: number; // Tous les X jours
  prochaineDistribution: string; // Date ISO
  actif: boolean;
}

export type NotificationType = 'ALERT' | 'INFO' | 'SUCCESS';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: NotificationType;
  linkTo?: string; // Pour rediriger vers une vue spécifique
}