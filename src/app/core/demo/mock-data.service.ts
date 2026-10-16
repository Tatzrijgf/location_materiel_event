import { Injectable, inject } from '@angular/core';
import { StorageService } from '../storage.service';
import { daysInclusive, type Article, type Categorie, type Reservation, type ReservationStatut, type User } from '../models';

const SEEDED_KEY = 'seeded';
const LOUeur_ID = 'u_loueur';

interface ArticleSeed {
  id: string;
  nom: string;
  description: string;
  categorie: Categorie;
  prixJour: number;
  caution: number;
  quantiteTotale: number;
}

const ARTICLE_SEEDS: readonly ArticleSeed[] = [
  { id: 'a1', nom: 'Chaise pliante', description: 'Chaise pliante blanche, empilable.', categorie: 'CHAISES', prixJour: 2.5, caution: 20, quantiteTotale: 200 },
  { id: 'a2', nom: 'Chaise Napoléon', description: 'Chaise Napoléon dorée pour réception.', categorie: 'CHAISES', prixJour: 4, caution: 30, quantiteTotale: 120 },
  { id: 'a3', nom: 'Table ronde 8 places', description: 'Table ronde 180 cm avec pied central.', categorie: 'AUTRE', prixJour: 6, caution: 40, quantiteTotale: 40 },
  { id: 'a4', nom: 'Chapiteau 5x10 m', description: 'Chapiteau professionnel avec parois.', categorie: 'AUTRE', prixJour: 120, caution: 500, quantiteTotale: 4 },
  { id: 'a5', nom: 'Bâche 6x8 m', description: 'Bâche résistante pour extérieur.', categorie: 'BACHES', prixJour: 25, caution: 80, quantiteTotale: 10 },
  { id: 'a6', nom: 'Barnum 3x3 m', description: 'Barnum pliable pour stand.', categorie: 'BACHES', prixJour: 35, caution: 100, quantiteTotale: 8 },
  { id: 'a7', nom: 'Sono 1000 W', description: 'Système sono complet avec table de mixage.', categorie: 'SONO', prixJour: 90, caution: 300, quantiteTotale: 5 },
  { id: 'a8', nom: 'Enceinte amplifiée', description: 'Enceinte active 300 W sur pied.', categorie: 'SONO', prixJour: 60, caution: 200, quantiteTotale: 6 },
  { id: 'a9', nom: 'Micro sans fil', description: 'Micro HF avec récepteur.', categorie: 'SONO', prixJour: 18, caution: 60, quantiteTotale: 12 },
  { id: 'a10', nom: 'Éclairage LED', description: 'Projecteur LED RGB pilotable.', categorie: 'AUTRE', prixJour: 45, caution: 150, quantiteTotale: 9 },
  { id: 'a11', nom: 'Groupe électrogène', description: 'Groupe électrogène 6 kVA silencieux.', categorie: 'AUTRE', prixJour: 70, caution: 250, quantiteTotale: 3 },
  { id: 'a12', nom: 'Nappes et housses', description: 'Lot de nappes et housses assorties.', categorie: 'AUTRE', prixJour: 3, caution: 10, quantiteTotale: 300 },
];

interface ReservationSeed {
  id: string;
  articleId: string;
  dateDebut: string;
  dateFin: string;
  quantite: number;
  statut: ReservationStatut;
}

const RESERVATION_SEEDS: readonly ReservationSeed[] = [
  { id: 'r1', articleId: 'a1', dateDebut: '2026-11-01', dateFin: '2026-11-03', quantite: 50, statut: 'EN_ATTENTE' },
  { id: 'r2', articleId: 'a7', dateDebut: '2026-11-05', dateFin: '2026-11-07', quantite: 1, statut: 'CONFIRMEE' },
  { id: 'r3', articleId: 'a4', dateDebut: '2026-10-20', dateFin: '2026-10-22', quantite: 1, statut: 'EN_COURS' },
  { id: 'r4', articleId: 'a5', dateDebut: '2026-09-10', dateFin: '2026-09-12', quantite: 2, statut: 'TERMINEE' },
  { id: 'r5', articleId: 'a2', dateDebut: '2026-12-01', dateFin: '2026-12-02', quantite: 30, statut: 'ANNULEE' },
  { id: 'r6', articleId: 'a9', dateDebut: '2026-11-15', dateFin: '2026-11-16', quantite: 4, statut: 'EN_ATTENTE' },
];

/**
 * Loads a demo dataset into `localStorage` on first launch and can restore it.
 */
@Injectable({ providedIn: 'root' })
export class MockDataService {
  private readonly storage = inject(StorageService);

  seedIfEmpty(): void {
    if (this.storage.has(SEEDED_KEY)) {
      return;
    }
    this.reset();
  }

  reset(): void {
    const users: User[] = [
      { id: 'u_admin', name: 'Administrateur', email: 'admin@demo.com', password: 'demo1234', role: 'ADMIN', actif: true },
      { id: 'u_client', name: 'Client Démo', email: 'client@demo.com', password: 'demo1234', role: 'CLIENT', actif: true },
      { id: LOUeur_ID, name: 'Loueur Démo', email: 'loueur@demo.com', password: 'demo1234', role: 'LOUEUR', actif: true },
    ];

    const articles: Article[] = ARTICLE_SEEDS.map((seed) => ({
      ...seed,
      quantiteDisponible: seed.quantiteTotale,
      photo: `https://picsum.photos/seed/${seed.id}/400/300`,
      loueurId: LOUeur_ID,
      statut: 'DISPONIBLE',
    }));

    const byId = new Map(articles.map((article) => [article.id, article]));
    const reservations: Reservation[] = RESERVATION_SEEDS.map((seed) => {
      const article = byId.get(seed.articleId)!;
      const days = daysInclusive(seed.dateDebut, seed.dateFin);
      return {
        id: seed.id,
        articleId: seed.articleId,
        clientId: 'u_client',
        loueurId: article.loueurId,
        dateDebut: seed.dateDebut,
        dateFin: seed.dateFin,
        quantite: seed.quantite,
        prixTotal: article.prixJour * days * seed.quantite,
        caution: article.caution * seed.quantite,
        statut: seed.statut,
        createdAt: new Date().toISOString(),
      };
    });

    this.storage.set('users', users);
    this.storage.set('articles', articles);
    this.storage.set('reservations', reservations);
    this.storage.set('availabilities', []);
    this.storage.set(SEEDED_KEY, { at: new Date().toISOString() });
  }
}
