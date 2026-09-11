import { Injectable, signal } from '@angular/core';

export interface UserManagementItem {
  id: number;
  name: string;
  email: string;
  roleCode: string;
  roleTitle: string;
  scope: string;
  status: 'Aktif' | 'Pasif';
  lastLogin: string;
  avatarInitials: string;
}

const STORAGE_KEY = 'nova_orion_user_management';

const INITIAL_USERS: UserManagementItem[] = [
  {
    id: 1,
    name: 'Hakan Koçak',
    email: 'hakan.kocak@nova.com',
    roleCode: 'SUPER_ADMIN',
    roleTitle: 'Süper Admin (Global)',
    scope: 'Global (Tüm Sistem)',
    status: 'Aktif',
    lastLogin: '10.09.2026 14:10',
    avatarInitials: 'HK'
  },
  {
    id: 2,
    name: 'Elena Rostova',
    email: 'elena.rostova@orion.com',
    roleCode: 'REGION_ADMIN',
    roleTitle: 'Bölge Yöneticisi',
    scope: 'Avrupa',
    status: 'Aktif',
    lastLogin: '10.09.2026 11:45',
    avatarInitials: 'ER'
  },
  {
    id: 3,
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@nova.com',
    roleCode: 'COUNTRY_ADMIN',
    roleTitle: 'Ülke Yöneticisi',
    scope: 'Türkiye',
    status: 'Aktif',
    lastLogin: '09.09.2026 18:20',
    avatarInitials: 'AY'
  },
  {
    id: 4,
    name: 'Stefan Müller',
    email: 'stefan.mueller@orion.com',
    roleCode: 'COUNTRY_ADMIN',
    roleTitle: 'Ülke Yöneticisi',
    scope: 'Almanya',
    status: 'Aktif',
    lastLogin: '09.09.2026 16:30',
    avatarInitials: 'SM'
  },
  {
    id: 5,
    name: 'Claire Dupont',
    email: 'claire.dupont@nova.com',
    roleCode: 'SALES_REP',
    roleTitle: 'Satış Temsilcisi',
    scope: 'Fransa',
    status: 'Aktif',
    lastLogin: '08.09.2026 12:15',
    avatarInitials: 'CD'
  },
  {
    id: 6,
    name: 'Kenji Sato',
    email: 'kenji.sato@orion.com',
    roleCode: 'REGION_ADMIN',
    roleTitle: 'Bölge Yöneticisi',
    scope: 'Asya Pasifik',
    status: 'Aktif',
    lastLogin: '07.09.2026 09:10',
    avatarInitials: 'KS'
  }
];

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private usersList = signal<UserManagementItem[]>(this.loadInitialData());

  users = this.usersList.asReadonly();

  private loadInitialData(): UserManagementItem[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_USERS;
  }

  private persist(data: UserManagementItem[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }

  addUser(user: Omit<UserManagementItem, 'id' | 'avatarInitials'>) {
    const current = this.usersList();
    const newId = current.length > 0 ? Math.max(...current.map(u => u.id)) + 1 : 1;
    const parts = user.name.trim().split(' ');
    const initials = parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : user.name.substring(0, 2).toUpperCase();

    const updated = [{ ...user, id: newId, avatarInitials: initials }, ...current];
    this.usersList.set(updated);
    this.persist(updated);
  }

  updateUser(id: number, updated: Partial<UserManagementItem>) {
    const next = this.usersList().map(u => {
      if (u.id !== id) return u;
      let initials = u.avatarInitials;
      if (updated.name) {
        const parts = updated.name.trim().split(' ');
        initials = parts.length > 1
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : updated.name.substring(0, 2).toUpperCase();
      }
      return { ...u, ...updated, avatarInitials: initials };
    });
    this.usersList.set(next);
    this.persist(next);
  }

  deleteUser(id: number) {
    const next = this.usersList().filter(u => u.id !== id);
    this.usersList.set(next);
    this.persist(next);
  }

  toggleStatus(id: number) {
    const next = this.usersList().map(u =>
      u.id === id ? { ...u, status: (u.status === 'Aktif' ? 'Pasif' : 'Aktif') as ('Aktif' | 'Pasif') } : u
    );
    this.usersList.set(next);
    this.persist(next);
  }
}
