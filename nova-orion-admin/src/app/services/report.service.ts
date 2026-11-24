import { Injectable, inject } from '@angular/core';
import { ProjectTypeService } from './project-type.service';
import { CatalogService } from './catalog.service';
import { AuthService } from './auth.service';
import { BrandService } from './brand.service';
import { TranslationService } from './translation.service';

export type ReportDimension = 'projectType' | 'productType' | 'system' | 'country' | 'region';
export type ReportFilters = Partial<Record<ReportDimension, string>>;

export const REPORT_DIMENSIONS: ReportDimension[] = ['projectType', 'productType', 'system', 'country', 'region'];

// "Diğer" dilimi gibi birden çok değeri toplayan anahtar
export const OTHER_KEY = '__other__';

// Projedeki tek ürün satırı (Detay raporunun bir satırı)
export interface ReportLine {
  productGroup: string;
  productTypeId: number;
  productFamily: string;
  productName: string;
  quantity: number;
}

// Raporlar için kullanıcıların oluşturduğu projeler (demo veri)
export interface ReportProject {
  id: number;
  projectNumber: string;
  projectCode: string;
  name: string;
  projectTypeId: number;
  systemId: number;
  // Satırlardaki ürün tiplerinin tekil listesi (grafik ve filtreler için)
  productTypeIds: number[];
  lines: ReportLine[];
  country: string;
  countryCode: string;
  region: string;
  salesChannel: string;
  userCode: string;
  userName: string;
  createdBy: string;
  createdAt: string; // ISO tarih
}

interface CountrySeed {
  name: string;
  code: string;
  region: string;
  weight: number;
  salesChannel: string;
  cities: string[];
  users: string[];
}

const COUNTRIES: CountrySeed[] = [
  { name: 'Türkiye', code: 'TR', region: 'Avrupa', weight: 9, salesChannel: 'SC-NOVA-EU', cities: ['Istanbul', 'Ankara', 'Izmir', 'Zonguldak'], users: ['İbrahim Köse', 'Ayşe Kaya', 'Mehmet Yıldız'] },
  { name: 'Almanya', code: 'DE', region: 'Avrupa', weight: 7, salesChannel: 'SC-ORION-CE', cities: ['Berlin', 'Munich', 'Hamburg'], users: ['Lukas Schmidt', 'Anna Weber'] },
  { name: 'Birleşik Krallık', code: 'GB', region: 'Avrupa', weight: 4, salesChannel: 'SC-NOVA-EU', cities: ['London', 'Manchester'], users: ['Emma Clarke'] },
  { name: 'Fransa', code: 'FR', region: 'Avrupa', weight: 3, salesChannel: 'SC-NOVA-EU', cities: ['Paris', 'Lyon'], users: ['Sophie Martin'] },
  { name: 'İtalya', code: 'IT', region: 'Avrupa', weight: 2, salesChannel: '', cities: ['Milan', 'Rome'], users: ['Marco Rossi'] },
  { name: 'İspanya', code: 'ES', region: 'Avrupa', weight: 2, salesChannel: '', cities: ['Madrid', 'Barcelona'], users: ['Lucia Garcia'] },
  { name: 'Hollanda', code: 'NL', region: 'Avrupa', weight: 1, salesChannel: '', cities: ['Amsterdam'], users: ['Daan de Vries'] },
  { name: 'Amerika Birleşik Devletleri', code: 'US', region: 'Amerika', weight: 5, salesChannel: 'SC-NOVA-AMER', cities: ['New York', 'Chicago', 'Dallas'], users: ['John Miller', 'Olivia Brown'] },
  { name: 'Kanada', code: 'CA', region: 'Amerika', weight: 3, salesChannel: 'SC-NOVA-AMER', cities: ['Toronto', 'Vancouver'], users: ['Liam Tremblay'] },
  { name: 'Japonya', code: 'JP', region: 'Asya Pasifik', weight: 3, salesChannel: 'SC-APAC-04', cities: ['Tokyo', 'Osaka'], users: ['Kenji Sato'] }
];

// Ürün tipi id'si (Katalog > Ürün Tipi) → ürün grubu, aile ve model adları
const PRODUCTS_BY_TYPE: Record<number, { group: string; families: { name: string; models: string[] }[] }> = {
  1: { group: 'Dış Ünite', families: [{ name: 'AF5301', models: ['25-3', '35-3', '50-3'] }, { name: 'AF5300', models: ['71-3 O'] }] },
  2: { group: 'Dış Ünite', families: [{ name: 'AF4300', models: ['71-1', '100-1', '140-1'] }] },
  3: { group: 'Dış Ünite', families: [{ name: 'AF-MV', models: ['120-3 O', '160-3 O'] }] },
  4: { group: 'İç Ünite', families: [{ name: 'AF-4C', models: ['56-2 P', '112-2 P'] }] },
  5: { group: 'İç Ünite', families: [{ name: 'AF2', models: ['22-1 W', '36-1 W'] }] },
  6: { group: 'İç Ünite', families: [{ name: 'AF-FS', models: ['71-1 F'] }] },
  7: { group: 'İç Ünite', families: [{ name: 'AF-DC', models: ['56-1 D', '90-1 D'] }] }
};

// Proje tipi id'leri: 1 Konut … 8 AVM (Proje Tipi seed'i); ağırlıklar dağılımı gerçekçi kılar
const PROJECT_TYPE_WEIGHTS = [10, 7, 3, 4, 3, 6, 2, 3];
// Sistem id'leri: 1 Bire-bir Split, 2 Multi Split, 3 Ticari Splits, 4 VRF
const SYSTEM_WEIGHTS = [8, 5, 4, 9];
// Ürün tipi id'leri: 1 R32 … 7 Kanal
const PRODUCT_TYPE_WEIGHTS = [9, 4, 6, 7, 8, 2, 5];

const PROJECT_COUNT = 84;

// Sabit tohumlu rastgele sayı üreteci: demo verisi her açılışta aynı kalır
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function weightedPick(weights: number[], rnd: () => number): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rnd() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r < 0) return i;
  }
  return weights.length - 1;
}

function pick<T>(list: T[], rnd: () => number): T {
  return list[Math.floor(rnd() * list.length)];
}

// Kullanıcı kodu kişiye sabittir: ülke kodu + 5 hane
function userCodeOf(countryCode: string, userName: string): string {
  let hash = 0;
  for (const ch of userName) hash = (hash * 31 + ch.charCodeAt(0)) % 100000;
  return countryCode + String(hash).padStart(5, '0');
}

function buildLines(typeIds: number[], rnd: () => number): ReportLine[] {
  const lines: ReportLine[] = [];
  typeIds.forEach(typeId => {
    const def = PRODUCTS_BY_TYPE[typeId];
    const family = pick(def.families, rnd);
    const models = [...family.models];
    const lineCount = Math.min(models.length, 1 + Math.floor(rnd() * 2));
    for (let i = 0; i < lineCount; i++) {
      const model = models.splice(Math.floor(rnd() * models.length), 1)[0];
      lines.push({
        productGroup: def.group,
        productTypeId: typeId,
        productFamily: family.name,
        productName: `${family.name} ${model}`,
        quantity: 1 + Math.floor(rnd() * 24)
      });
    }
  });
  return lines;
}

function buildProjects(): ReportProject[] {
  const rnd = seededRandom(20261118);
  const list: ReportProject[] = [];
  for (let i = 1; i <= PROJECT_COUNT; i++) {
    const country = COUNTRIES[weightedPick(COUNTRIES.map(c => c.weight), rnd)];
    const city = pick(country.cities, rnd);
    const projectTypeId = weightedPick(PROJECT_TYPE_WEIGHTS, rnd) + 1;
    const systemId = weightedPick(SYSTEM_WEIGHTS, rnd) + 1;

    const typeCount = 1 + Math.floor(rnd() * 3);
    const productTypeIds: number[] = [];
    while (productTypeIds.length < typeCount) {
      const id = weightedPick(PRODUCT_TYPE_WEIGHTS, rnd) + 1;
      if (!productTypeIds.includes(id)) productTypeIds.push(id);
    }
    productTypeIds.sort((a, b) => a - b);

    const month = 1 + Math.floor(rnd() * 11);
    const day = 1 + Math.floor(rnd() * 28);
    const userName = pick(country.users, rnd);
    // Çoğu projeyi hesabın sahibi oluşturur; bazılarını aynı ülkedeki başka bir kullanıcı
    const createdBy = rnd() < 0.8 ? userName : pick(country.users, rnd);
    const dealer = 1 + Math.floor(rnd() * 12);

    list.push({
      id: i,
      projectNumber: `${country.code}-${country.code}${String(dealer).padStart(4, '0')}-2026-${String(100 + i).padStart(5, '0')}`,
      projectCode: `PJK-${String(i).padStart(3, '0')}`,
      name: `${city} ${String(1000 + i * 7)}`,
      projectTypeId,
      systemId,
      productTypeIds,
      lines: buildLines(productTypeIds, rnd),
      country: country.name,
      countryCode: country.code,
      region: country.region,
      salesChannel: country.salesChannel,
      userCode: userCodeOf(country.code, userName),
      userName,
      createdBy,
      createdAt: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    });
  }
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private projectTypeService = inject(ProjectTypeService);
  private catalogService = inject(CatalogService);
  private authService = inject(AuthService);
  private tsService = inject(TranslationService);
  private brandService = inject(BrandService);

  readonly projects: ReportProject[] = buildProjects();

  // Rol kapsamı: Business Admin kendi markası, Region Admin kendi bölgesi, Country Admin kendi ülkesi
  scopedProjects(): ReportProject[] {
    const user = this.authService.currentUser();
    return this.projects.filter(p => {
      if (!this.authService.canSeeBrand(this.brandIdOf(p))) return false;
      if (this.authService.isRegionAdmin() && user.assignedRegion && p.region !== user.assignedRegion) return false;
      if (this.authService.isCountryAdmin() && user.assignedCountry && p.country !== user.assignedCountry) return false;
      return true;
    });
  }

  // Projenin markası, proje tipinin bağlı olduğu markadır
  brandIdOf(p: ReportProject): number | null | undefined {
    return this.projectTypeService.projectTypes().find(t => t.id === p.projectTypeId)?.brandId;
  }

  brandName(p: ReportProject): string {
    return this.brandService.brandName(this.brandIdOf(p) ?? null) || '-';
  }

  keysOf(p: ReportProject, dim: ReportDimension): string[] {
    switch (dim) {
      case 'projectType': return [String(p.projectTypeId)];
      case 'productType': return p.productTypeIds.map(String);
      case 'system': return [String(p.systemId)];
      case 'country': return [p.country];
      case 'region': return [p.region];
    }
  }

  labelOf(dim: ReportDimension, key: string): string {
    if (key === OTHER_KEY) return this.tsService.translate('Diğer');
    const id = Number(key);
    switch (dim) {
      case 'projectType': {
        const type = this.projectTypeService.projectTypes().find(t => t.id === id);
        return type ? this.tsService.translate(type.value) : '—';
      }
      case 'productType':
        return this.tsService.translate(this.catalogService.getItem('urun-tipi', id)?.name ?? '—');
      case 'system':
        return this.tsService.translate(this.catalogService.getItem('sistem', id)?.name ?? '—');
      default:
        return this.tsService.translate(key);
    }
  }

  dimensionTitle(dim: ReportDimension): string {
    return {
      projectType: 'Proje Tipi',
      productType: 'Ürün Tipi',
      system: 'Sistem',
      country: 'Ülke',
      region: 'Bölge'
    }[dim];
  }

  // except verilirse o boyutun filtresi yok sayılır (grafik kendi dilimlerini göstermeye devam eder)
  matches(p: ReportProject, filters: ReportFilters, except?: ReportDimension): boolean {
    return (Object.keys(filters) as ReportDimension[]).every(dim =>
      dim === except || this.keysOf(p, dim).includes(filters[dim]!)
    );
  }

  // Kapsamdaki projelerde geçen değerler, çoktan aza sıralı
  optionsFor(dim: ReportDimension): { key: string; label: string }[] {
    const counts = new Map<string, number>();
    this.scopedProjects().forEach(p => this.keysOf(p, dim).forEach(k => counts.set(k, (counts.get(k) ?? 0) + 1)));
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([key]) => ({ key, label: this.labelOf(dim, key) }));
  }
}
