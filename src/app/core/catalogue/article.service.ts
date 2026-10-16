import { Injectable, inject, signal } from '@angular/core';
import { StorageService } from '../storage.service';
import { newId, type Article, type ArticleStatut, type Categorie } from '../models';

const ARTICLES_KEY = 'articles';
const AVAILABILITIES_KEY = 'availabilities';

export interface ArticleInput {
  nom: string;
  description: string;
  categorie: Categorie;
  prixJour: number;
  caution: number;
  quantiteTotale: number;
  quantiteDisponible: number;
  photo: string;
  statut: ArticleStatut;
}

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private readonly storage = inject(StorageService);
  private readonly _articles = signal<Article[]>(this.storage.get<Article[]>(ARTICLES_KEY, []));

  readonly articles = this._articles.asReadonly();

  reload(): void {
    this._articles.set(this.storage.get<Article[]>(ARTICLES_KEY, []));
  }

  getById(id: string): Article | undefined {
    return this._articles().find((article) => article.id === id);
  }

  byLoueur(loueurId: string): Article[] {
    return this._articles().filter((article) => article.loueurId === loueurId);
  }

  create(input: ArticleInput, loueurId: string): Article {
    const article: Article = { id: newId('a'), loueurId, ...input };
    this._articles.update((list) => [...list, article]);
    this.persist();
    return article;
  }

  update(id: string, input: ArticleInput): void {
    this._articles.update((list) =>
      list.map((article) => (article.id === id ? { ...article, ...input } : article)),
    );
    this.persist();
  }

  setStatut(id: string, statut: ArticleStatut): void {
    this._articles.update((list) =>
      list.map((article) => (article.id === id ? { ...article, statut } : article)),
    );
    this.persist();
  }

  remove(id: string): void {
    this._articles.update((list) => list.filter((article) => article.id !== id));
    this.persist();
    this.storage.set(
      AVAILABILITIES_KEY,
      this.storage
        .get<{ articleId: string }[]>(AVAILABILITIES_KEY, [])
        .filter((plage) => plage.articleId !== id),
    );
  }

  private persist(): void {
    this.storage.set(ARTICLES_KEY, this._articles());
  }
}
