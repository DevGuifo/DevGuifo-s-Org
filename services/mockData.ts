
import { Lapin, Reproduction, Transaction, Sexe, StatutLapin, StatutReproduction, TypeTransaction, Tache, Vaccination, NoteSante, PlanAlimentaire } from '../types';

export const mockLapins: Lapin[] = [
  {
    id: '1',
    nom: 'Roger',
    tatouage: 'ABC-123',
    race: 'Fauve de Bourgogne',
    sexe: Sexe.MALE,
    couleur: 'Roux',
    dateNaissance: '2023-01-15',
    poidsActuel: 4.2,
    poidsHistorique: [
      { date: '2023-04-15', poids: 1.5 },
      { date: '2023-06-15', poids: 2.8 },
      { date: '2023-09-15', poids: 3.5 },
      { date: '2024-01-15', poids: 4.2 }
    ],
    statut: StatutLapin.ACTIF,
    cage: 'A1',
    photoUrl: 'https://picsum.photos/200/200?random=1'
  },
  {
    id: '2',
    nom: 'Bella',
    tatouage: 'DEF-456',
    race: 'Néo-Zélandais',
    sexe: Sexe.FEMELLE,
    couleur: 'Blanc',
    dateNaissance: '2023-02-20',
    poidsActuel: 4.5,
    poidsHistorique: [
      { date: '2023-05-20', poids: 1.8 },
      { date: '2023-08-20', poids: 3.2 },
      { date: '2023-12-20', poids: 4.0 },
      { date: '2024-02-20', poids: 4.5 }
    ],
    statut: StatutLapin.ACTIF,
    cage: 'B1',
    photoUrl: 'https://picsum.photos/200/200?random=2'
  },
  {
    id: '3',
    nom: 'Luna',
    tatouage: 'GHI-789',
    race: 'Californien',
    sexe: Sexe.FEMELLE,
    couleur: 'Blanc/Noir',
    dateNaissance: '2023-03-10',
    poidsActuel: 3.8,
    poidsHistorique: [
      { date: '2023-06-10', poids: 1.6 },
      { date: '2023-09-10', poids: 2.9 },
      { date: '2024-01-10', poids: 3.8 }
    ],
    statut: StatutLapin.ACTIF,
    cage: 'B2',
    photoUrl: 'https://picsum.photos/200/200?random=3'
  },
  {
    id: '4',
    nom: 'Junior 1',
    race: 'Fauve de Bourgogne',
    sexe: Sexe.MALE,
    couleur: 'Roux',
    dateNaissance: '2024-01-05',
    poidsActuel: 2.1,
    pereId: '1',
    mereId: '2',
    poidsHistorique: [
      { date: '2024-02-05', poids: 0.8 },
      { date: '2024-03-05', poids: 2.1 }
    ],
    statut: StatutLapin.ENGRAISSEMENT,
    cage: 'E1',
    photoUrl: 'https://picsum.photos/200/200?random=4'
  }
];

export const mockReproductions: Reproduction[] = [
  {
    id: 'r1',
    pereId: '1',
    mereId: '2',
    dateAccouplement: '2024-01-05',
    dateMiseBasPrevue: '2024-02-05', // +31j
    dateMiseBasReelle: '2024-02-05',
    nombreNes: 8,
    nombreVivants: 7,
    statut: StatutReproduction.SEVRAGE
  },
  {
    id: 'r2',
    pereId: '1',
    mereId: '3',
    dateAccouplement: new Date().toISOString().split('T')[0], // Aujourd'hui
    dateMiseBasPrevue: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    statut: StatutReproduction.ACCOUPLEMENT
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 't1',
    date: '2024-02-01',
    montant: 45.00,
    type: TypeTransaction.DEPENSE,
    categorie: 'Alimentation',
    description: 'Sac de granulés 25kg'
  },
  {
    id: 't2',
    date: '2024-02-15',
    montant: 120.00,
    type: TypeTransaction.VENTE,
    categorie: 'Reproducteur',
    description: 'Vente de 3 lapines'
  }
];

export const mockTaches: Tache[] = [
  {
    id: 'task1',
    titre: 'Palpation Luna',
    dateEcheance: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    terminee: false,
    lapinId: '3',
    type: 'PALPATION'
  },
  {
    id: 'task2',
    titre: 'Vaccin VHD Roger',
    dateEcheance: '2024-03-01',
    terminee: false,
    lapinId: '1',
    type: 'VACCIN'
  }
];

export const mockVaccinations: Vaccination[] = [
  {
    id: 'v1',
    lapinId: '1',
    date: '2023-03-01',
    nomVaccin: 'Filavac VHD K C+V',
    prochainRappel: '2024-03-01',
    veterinaire: 'Dr. Martin'
  },
  {
    id: 'v2',
    lapinId: '2',
    date: '2023-04-15',
    nomVaccin: 'Eravac',
    prochainRappel: '2024-04-15'
  }
];

export const mockNotes: NoteSante[] = [
  {
    id: 'n1',
    lapinId: '3',
    date: '2023-12-10',
    type: 'SYMPTOME',
    contenu: 'Léger écoulement nasal observé le matin.'
  },
  {
    id: 'n2',
    lapinId: '3',
    date: '2023-12-12',
    type: 'TRAITEMENT',
    contenu: 'Nettoyage au sérum physiologique. Surveillance.'
  }
];

export const mockPlansAlimentaires: PlanAlimentaire[] = [
  {
    id: 'p1',
    nourriture: 'Granulés Croissance',
    frequenceJours: 1,
    prochaineDistribution: new Date().toISOString().split('T')[0],
    actif: true
  },
  {
    id: 'p2',
    nourriture: 'Vitamines',
    frequenceJours: 7,
    prochaineDistribution: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    actif: true
  }
];