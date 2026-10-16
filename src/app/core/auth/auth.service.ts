import { Injectable, computed, inject, signal } from '@angular/core';
import { StorageService } from '../storage.service';
import { newId, type Role, type User } from '../models';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export class EmailAlreadyUsedError extends Error {
  constructor() {
    super('Cet email est déjà utilisé.');
    this.name = 'EmailAlreadyUsedError';
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Email ou mot de passe incorrect.');
    this.name = 'InvalidCredentialsError';
  }
}

const USERS_KEY = 'users';
const SESSION_KEY = 'session';

export function homeUrlForRole(role: Role): string {
  return role === 'ADMIN' ? '/admin' : '/catalogue';
}

/**
 * Mocked, browser-only authentication. Users and the current session are stored
 * as plain JSON in `localStorage`; passwords are kept in clear text on purpose
 * (this is a demo, not a security boundary).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storage = inject(StorageService);

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly role = computed<Role | null>(() => this.currentUser()?.role ?? null);

  loadSession(): void {
    const session = this.storage.get<{ userId: string } | null>(SESSION_KEY, null);
    if (!session) {
      this.currentUser.set(null);
      return;
    }
    const user = this.findUserById(session.userId) ?? null;
    this.currentUser.set(user);
    if (!user) {
      this.storage.remove(SESSION_KEY);
    }
  }

  async register(payload: RegisterPayload): Promise<User> {
    const users = this.users();
    const email = payload.email.trim().toLowerCase();
    if (users.some((candidate) => candidate.email.toLowerCase() === email)) {
      throw new EmailAlreadyUsedError();
    }
    const user: User = {
      id: newId('u'),
      name: payload.name.trim(),
      email,
      password: payload.password,
      role: payload.role,
      actif: true,
    };
    users.push(user);
    this.saveUsers(users);
    this.startSession(user);
    return user;
  }

  async login(credentials: AuthCredentials): Promise<User> {
    const email = credentials.email.trim().toLowerCase();
    const user = this.users().find(
      (candidate) => candidate.email.toLowerCase() === email && candidate.password === credentials.password,
    );
    if (!user) {
      throw new InvalidCredentialsError();
    }
    this.startSession(user);
    return user;
  }

  async logout(): Promise<void> {
    this.storage.remove(SESSION_KEY);
    this.currentUser.set(null);
  }

  users(): User[] {
    return this.storage.get<User[]>(USERS_KEY, []);
  }

  saveUsers(users: User[]): void {
    this.storage.set(USERS_KEY, users);
  }

  findUserById(id: string): User | undefined {
    return this.users().find((user) => user.id === id);
  }

  private startSession(user: User): void {
    this.storage.set(SESSION_KEY, { userId: user.id, createdAt: new Date().toISOString() });
    this.currentUser.set(user);
  }
}
