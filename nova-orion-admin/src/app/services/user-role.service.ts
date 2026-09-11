import { Injectable, signal } from '@angular/core';

export interface UserRoleItem {
  id: number;
  code: string;
  name: string;
  description: string;
  scope: string;
  userCount: number;
  status: 'Aktif' | 'Pasif';
  permissions: string[];
}

const STORAGE_KEY = 'nova_orion_user_roles';

const INITIAL_ROLES: UserRoleItem[] = [
  {
    id: 1,
    code: 'SUPER_ADMIN',
    name: 'Süper Admin (Global)',
    description: 'Tüm sistem, yapılandırma ve kullanıcı yönetimi tam yetkisi',
    scope: 'Global (Tüm Sistem)',
    userCount: 2,
    status: 'Aktif',
    permissions: ['Tüm Modüller', 'Sistem Yapılandırma', 'Kullanıcı & Rol Yönetimi', 'Yedekleme & Geri Yükleme']
  },
  {
    id: 2,
    code: 'REGION_ADMIN',
    name: 'Bölge Yöneticisi',
    description: 'Belirlenen coğrafi bölgeye bağlı ülkeler ve satış kanalları yönetimi',
    scope: 'Bölge Bazlı',
    userCount: 4,
    status: 'Aktif',
    permissions: ['Bölge Ülkeleri', 'Satış Kanalları', 'Hava Koşulları', 'İçerik Yönetimi']
  },
  {
    id: 3,
    code: 'COUNTRY_ADMIN',
    name: 'Ülke Yöneticisi',
    description: 'Yalnızca atandığı ülkeye ait şehir, hava durumu ve yerel içerik yönetimi',
    scope: 'Ülke Bazlı',
    userCount: 9,
    status: 'Aktif',
    permissions: ['Ülke Şehirleri', 'Hava Durumu Girişi', 'Destek Talepleri']
  },
  {
    id: 4,
    code: 'SALES_REP',
    name: 'Satış Temsilcisi',
    description: 'Satış kanalları, ürün katalogları ve proje tipleri görüntüleme',
    scope: 'Satış Kanalı',
    userCount: 15,
    status: 'Aktif',
    permissions: ['Satış Kanalları İnceleme', 'Proje Tipleri', 'İndirilenler']
  },
  {
    id: 5,
    code: 'TECH_SUPPORT',
    name: 'Teknik Destek',
    description: 'Sıkça Sorulan Sorular, eğitim ve destek dokümanları yönetimi',
    scope: 'Destek & Rehber',
    userCount: 6,
    status: 'Aktif',
    permissions: ['SSS Yönetimi', 'Eğitim Modülleri', 'Bize Ulaşın']
  }
];

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {
  private rolesList = signal<UserRoleItem[]>(this.loadInitialData());

  roles = this.rolesList.asReadonly();

  private loadInitialData(): UserRoleItem[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_ROLES;
  }

  private persist(data: UserRoleItem[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }

  addRole(role: Omit<UserRoleItem, 'id'>) {
    const current = this.rolesList();
    const newId = current.length > 0 ? Math.max(...current.map(r => r.id)) + 1 : 1;
    const updated = [{ ...role, id: newId }, ...current];
    this.rolesList.set(updated);
    this.persist(updated);
  }

  updateRole(id: number, updated: Partial<UserRoleItem>) {
    const next = this.rolesList().map(r =>
      r.id === id ? { ...r, ...updated } : r
    );
    this.rolesList.set(next);
    this.persist(next);
  }

  deleteRole(id: number) {
    const next = this.rolesList().filter(r => r.id !== id);
    this.rolesList.set(next);
    this.persist(next);
  }

  toggleStatus(id: number) {
    const next = this.rolesList().map(r =>
      r.id === id ? { ...r, status: (r.status === 'Aktif' ? 'Pasif' : 'Aktif') as ('Aktif' | 'Pasif') } : r
    );
    this.rolesList.set(next);
    this.persist(next);
  }
}
