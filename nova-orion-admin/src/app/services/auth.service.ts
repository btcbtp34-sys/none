import { Injectable, signal, computed } from '@angular/core';

export type UserRole = 'SOFTWARE_ADMIN' | 'SUPER_ADMIN' | 'BUSINESS_ADMIN' | 'REGION_ADMIN' | 'COUNTRY_ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  assignedRegion?: string;
  assignedCountry?: string;
  country?: string;
  assignedLang?: string;
  // Business Admin yalnızca bu markaların verisini görür; boşsa marka kısıtı yok
  brandIds?: number[];
  token?: string;
  avatarInitials: string;
}

// Giriş ekranındaki örnek hesaplar (yetkiler ileride tanımlanacak)
export interface SampleAccount {
  password: string;
  description: string;
  profile: UserProfile;
}

export const SAMPLE_ACCOUNTS: SampleAccount[] = [
  {
    password: 'Software2026!',
    description: 'Global · tüm markalar',
    profile: {
      id: 'sample-software',
      email: 'software.admin@nova-orion.com',
      name: 'Deniz Aksoy',
      role: 'SOFTWARE_ADMIN',
      roleTitle: 'Software Admin (Global)',
      avatarInitials: 'DA',
      token: 'sso-jwt-sample-software-2026'
    }
  },
  {
    password: 'Business2026!',
    description: 'Nova · Avrupa',
    profile: {
      id: 'sample-business',
      email: 'business.admin@nova-orion.com',
      name: 'Selin Aydın',
      role: 'BUSINESS_ADMIN',
      roleTitle: 'Business Admin (Nova)',
      assignedRegion: 'Avrupa',
      brandIds: [1],
      avatarInitials: 'SA',
      token: 'sso-jwt-sample-business-2026'
    }
  },
  {
    password: 'Country2026!',
    description: 'Türkiye · Avrupa',
    profile: {
      id: 'sample-country',
      email: 'country.admin@nova-orion.com',
      name: 'Mehmet Yıldız',
      role: 'COUNTRY_ADMIN',
      roleTitle: 'Country Admin (Türkiye)',
      assignedRegion: 'Avrupa',
      assignedCountry: 'Türkiye',
      assignedLang: 'Türkçe',
      avatarInitials: 'MY',
      token: 'sso-jwt-sample-country-2026'
    }
  }
];

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Pre-configured role profiles for quick SSO testing
  public readonly demoUsers: UserProfile[] = [
    {
      id: 'software-1',
      email: 'softwareadmin@nova.com',
      name: 'Software Admin',
      role: 'SOFTWARE_ADMIN',
      roleTitle: 'Software Admin (Global)',
      avatarInitials: 'SW',
      token: 'sso-jwt-softwareadmin-token-2026'
    },
    {
      id: 'super-1',
      email: 'superadmin@nova.com',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      roleTitle: 'Super Admin (Global)',
      avatarInitials: 'SA',
      token: 'sso-jwt-superadmin-token-2026'
    },
    {
      id: 'business-nova',
      email: 'business.nova@nova.com',
      name: 'Business Admin (Nova)',
      role: 'BUSINESS_ADMIN',
      roleTitle: 'Business Admin (Nova)',
      brandIds: [1],
      avatarInitials: 'BN',
      token: 'sso-jwt-business-nova-token-2026'
    },
    {
      id: 'business-orion',
      email: 'business.orion@nova.com',
      name: 'Business Admin (Orion)',
      role: 'BUSINESS_ADMIN',
      roleTitle: 'Business Admin (Orion)',
      brandIds: [2],
      avatarInitials: 'BO',
      token: 'sso-jwt-business-orion-token-2026'
    },
    {
      id: 'region-1',
      email: 'region.eu@nova.com',
      name: 'Region Admin (Europe)',
      role: 'REGION_ADMIN',
      roleTitle: 'Region Admin (Avrupa)',
      assignedRegion: 'Avrupa',
      avatarInitials: 'RA',
      token: 'sso-jwt-region-eu-token-2026'
    },
    {
      id: 'region-na',
      email: 'region.na@nova.com',
      name: 'Region Admin (North America)',
      role: 'REGION_ADMIN',
      roleTitle: 'Region Admin (Kuzey Amerika)',
      assignedRegion: 'Amerika',
      avatarInitials: 'NA',
      token: 'sso-jwt-region-na-token-2026'
    },
    {
      id: 'country-tr',
      email: 'country.tr@nova.com',
      name: 'Country Admin (TR)',
      role: 'COUNTRY_ADMIN',
      roleTitle: 'Country Admin (Türkiye)',
      assignedRegion: 'Avrupa',
      assignedCountry: 'Türkiye',
      assignedLang: 'Türkçe',
      avatarInitials: 'TR',
      token: 'sso-jwt-country-tr-token-2026'
    },
    {
      id: 'country-de',
      email: 'country.de@nova.com',
      name: 'Country Admin (DE)',
      role: 'COUNTRY_ADMIN',
      roleTitle: 'Country Admin (Almanya)',
      assignedRegion: 'Avrupa',
      assignedCountry: 'Almanya',
      assignedLang: 'Deutsch',
      avatarInitials: 'DE',
      token: 'sso-jwt-country-de-token-2026'
    },
    {
      id: 'country-ca',
      email: 'country.ca@nova.com',
      name: 'Country Admin (CA)',
      role: 'COUNTRY_ADMIN',
      roleTitle: 'Country Admin (Kanada)',
      assignedRegion: 'Amerika',
      assignedCountry: 'Kanada',
      assignedLang: 'English',
      avatarInitials: 'CA',
      token: 'sso-jwt-country-ca-token-2026'
    }
  ];

  // Current active user signal with localStorage persistence (Backoffice)
  currentUser = signal<UserProfile>(this.getInitialUser());
  isLoggedIn = signal<boolean>(this.getInitialLoggedIn());

  // Dedicated Frontend Portal Client Session
  frontendUser = signal<UserProfile | null>(this.getInitialFrontendUser());
  isFrontendLoggedIn = computed(() => this.frontendUser() !== null);

  private getInitialUser(): UserProfile {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('nova_auth_user');
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch (e) {}
    return this.demoUsers[0];
  }

  private getInitialLoggedIn(): boolean {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('nova_auth_logged_in');
        if (saved !== null) {
          return saved === 'true';
        }
      }
    } catch (e) {}
    return true;
  }

  private getInitialFrontendUser(): UserProfile | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('nova_frontend_user');
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch (e) {}
    return null; // Guest by default in frontend
  }

  loginFrontendUser(customData?: Partial<UserProfile>): UserProfile {
    const name = customData?.name || 'Hasan Cavit Koçak';
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'HK';
    const dummy: UserProfile = {
      id: 'fe-user-hk',
      name,
      email: customData?.email || 'hasan.cavit.kocak@nova-orion.com',
      role: 'SUPER_ADMIN',
      roleTitle: customData?.roleTitle || 'Kurumsal Sistem Yöneticisi',
      avatarInitials: initials,
      country: customData?.country || 'Türkiye',
      assignedCountry: customData?.country || 'Türkiye',
      token: 'jwt-fe-' + Date.now()
    };
    this.frontendUser.set(dummy);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('nova_frontend_user', JSON.stringify(dummy));
      }
    } catch (e) {}
    return dummy;
  }

  logoutFrontend(): void {
    this.frontendUser.set(null);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('nova_frontend_user');
      }
    } catch (e) {}
  }

  // Computed helper permissions
  // Software Admin ve Business Admin ekran yetkileri Super Admin ile aynıdır (kısıt yok);
  // Business Admin yalnızca marka bazında sınırlanır (bkz. brandScope)
  isSuperAdmin = computed(() => ['SOFTWARE_ADMIN', 'SUPER_ADMIN', 'BUSINESS_ADMIN'].includes(this.currentUser().role));
  isSoftwareAdmin = computed(() => this.currentUser().role === 'SOFTWARE_ADMIN');
  isBusinessAdmin = computed(() => this.currentUser().role === 'BUSINESS_ADMIN');
  isRegionAdmin = computed(() => this.currentUser().role === 'REGION_ADMIN');
  isCountryAdmin = computed(() => this.currentUser().role === 'COUNTRY_ADMIN');

  // Kullanıcının görebileceği markalar; null = tüm markalar
  brandScope = computed<number[] | null>(() =>
    this.isBusinessAdmin() && this.currentUser().brandIds?.length ? this.currentUser().brandIds! : null
  );

  canSeeBrand(brandId: number | null | undefined): boolean {
    const scope = this.brandScope();
    return !scope || (brandId != null && scope.includes(brandId));
  }

  sampleAccount(email: string): SampleAccount | undefined {
    const trimmed = email.trim().toLowerCase();
    return SAMPLE_ACCOUNTS.find(a => a.profile.email === trimmed);
  }

  // Login via SSO Email
  loginWithEmail(email: string): boolean {
    const trimmed = email.trim().toLowerCase();
    const matchedUser = this.sampleAccount(trimmed)?.profile ?? this.demoUsers.find(u => u.email.toLowerCase() === trimmed);
    
    if (matchedUser) {
      this.currentUser.set(matchedUser);
      this.isLoggedIn.set(true);
      this.persistSession(matchedUser, true);
      return true;
    }

    // Dynamic SSO user creation for unknown company emails
    let role: UserRole = 'COUNTRY_ADMIN';
    let region = 'Avrupa';
    let country = 'Türkiye';
    let lang = 'Türkçe';

    if (trimmed.includes('super') || trimmed.includes('admin')) {
      role = 'SUPER_ADMIN';
    } else if (trimmed.includes('region') || trimmed.includes('eu') || trimmed.includes('apac') || trimmed.includes('amer')) {
      role = 'REGION_ADMIN';
      region = trimmed.includes('apac') ? 'Asya Pasifik' : trimmed.includes('amer') ? 'Amerika' : 'Avrupa';
    }

    const newUser: UserProfile = {
      id: 'sso-' + Date.now(),
      email: trimmed,
      name: trimmed.split('@')[0].replace('.', ' ').toUpperCase(),
      role,
      roleTitle: role === 'SUPER_ADMIN' ? 'Süper Admin' : role === 'REGION_ADMIN' ? `Bölge Yöneticisi (${region})` : `Ülke Yöneticisi (${country})`,
      assignedRegion: role !== 'SUPER_ADMIN' ? region : undefined,
      assignedCountry: role === 'COUNTRY_ADMIN' ? country : undefined,
      assignedLang: role === 'COUNTRY_ADMIN' ? lang : undefined,
      avatarInitials: trimmed.substring(0, 2).toUpperCase(),
      token: 'sso-jwt-dyn-' + Date.now()
    };

    this.currentUser.set(newUser);
    this.isLoggedIn.set(true);
    this.persistSession(newUser, true);
    return true;
  }

  // Switch role directly (demo / quick switcher)
  switchUser(user: UserProfile) {
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
    this.persistSession(user, true);
  }

  logout() {
    this.isLoggedIn.set(false);
    this.persistSession(null, false);
  }

  private persistSession(user: UserProfile | null, loggedIn: boolean) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('nova_auth_logged_in', String(loggedIn));
        if (user) {
          localStorage.setItem('nova_auth_user', JSON.stringify(user));
        } else {
          localStorage.removeItem('nova_auth_user');
        }
      }
    } catch (e) {}
  }

  // Permission helpers
  canManageRegion(regionName: string): boolean {
    if (this.isSuperAdmin()) return true;
    if (this.isRegionAdmin() && this.currentUser().assignedRegion?.toLowerCase() === regionName.toLowerCase()) return true;
    return false;
  }

  canManageCountry(countryName: string): boolean {
    if (this.isSuperAdmin()) return true;
    if (this.isRegionAdmin()) return true; // Region admin can oversee countries in region
    if (this.isCountryAdmin() && this.currentUser().assignedCountry?.toLowerCase() === countryName.toLowerCase()) return true;
    return false;
  }
}
