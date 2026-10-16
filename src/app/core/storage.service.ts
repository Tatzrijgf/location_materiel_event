import { Injectable } from '@angular/core';

/**
 * Thin wrapper around the browser `localStorage` used as the only persistence
 * layer of the application. All keys are namespaced with the `lme.` prefix.
 * Access is defensive so the service never throws when storage is unavailable.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly prefix = 'lme.';

  private get store(): Storage | null {
    try {
      return typeof localStorage === 'undefined' ? null : localStorage;
    } catch {
      return null;
    }
  }

  private k(key: string): string {
    return `${this.prefix}${key}`;
  }

  get<T>(key: string, fallback: T): T {
    const store = this.store;
    if (!store) {
      return fallback;
    }
    const raw = store.getItem(this.k(key));
    if (raw === null) {
      return fallback;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  set<T>(key: string, value: T): void {
    const store = this.store;
    if (!store) {
      return;
    }
    store.setItem(this.k(key), JSON.stringify(value));
  }

  remove(key: string): void {
    this.store?.removeItem(this.k(key));
  }

  has(key: string): boolean {
    const store = this.store;
    return store ? store.getItem(this.k(key)) !== null : false;
  }

  clear(): void {
    const store = this.store;
    if (!store) {
      return;
    }
    const keys: string[] = [];
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key);
      }
    }
    keys.forEach((key) => store.removeItem(key));
  }
}
