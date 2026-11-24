import { Injectable, inject } from '@angular/core';
import { ProjectTypeService } from './project-type.service';
import { CatalogService } from './catalog.service';
import { AuthService } from './auth.service';
import { BrandService } from './brand.service';
import { TranslationService } from './translation.service';

// Rapor filtreleri (AirSelect Gen2 admin ekranları taslağına göre)
export type ReportDimension = 'brand' | 'region' | 'country' | 'system' | 'subSystem' | 'productCategory' | 'buildingType' | 'designMode';
export type ReportFilters = Partial<Record<ReportDimension, string>>;

export const DASHBOARD_DIMENSIONS: ReportDimension[] = ['region', 'country', 'system', 'subSystem', 'productCategory', 'buildingType'];
export const DETAIL_DIMENSIONS: ReportDimension[] = ['brand', 'region', 'country', 'system', 'subSystem', 'productCategory', 'buildingType'];

export type SubSystem = 'heatPump' | 'heatRecovery';
export type DesignMode = 'auto' | 'free';
export type ProjectStatus = 'draft' | 'shared' | 'quoted' | 'won' | 'lost' | 'readOnly';
export type UserType = 'external' | 'internal';

export const PROJECT_STATUSES: ProjectStatus[] = ['draft', 'shared', 'quoted', 'won', 'lost', 'readOnly'];
// Salt okunur durumu, projede devreden çıkmış ürün olduğunda sistemce verilir
export const EDITABLE_STATUSES: ProjectStatus[] = ['draft', 'shared', 'quoted', 'won', 'lost'];

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'Taslak',
  shared: 'Satışla paylaşıldı',
  quoted: 'Teklif verildi',
  won: 'Kazanıldı',
  lost: 'Kaybedildi',
  readOnly: 'Salt okunur'
};

export const SUB_SYSTEM_LABELS: Record<SubSystem, string> = { heatPump: 'Isı pompası', heatRecovery: 'Isı geri kazanımı' };
export const DESIGN_MODE_LABELS: Record<DesignMode, string> = { auto: 'Otomatik Tasarım', free: 'Serbest Tasarım' };

// Hedefler (taslaktaki KPI hedefleri)
export const CONTROLLERS_PER_IDU_TARGET = 0.8;
export const CENTRAL_CONTROLLER_TARGET = '25–30%';

// Katalog > Ürün Grubu id'leri
export const GROUP_JOINT = 1;
export const GROUP_ODU = 2;
export const GROUP_HYDRO = 3;
export const GROUP_IDU = 4;
export const GROUP_SBOX = 5;
export const GROUP_ACCESSORY = 6;

// Projedeki tek ürün satırı
export interface ReportLine {
  productGroupId: number;
  productTypeId: number | null;
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
  company: string;
  projectTypeId: number;
  systemId: number;
  subSystem: SubSystem;
  designMode: DesignMode;
  status: ProjectStatus;
  lines: ReportLine[];
  controllers: number;
  centralController: boolean;
  // R32 güvenlik kontrolünde havalandırma gereken oda sayısı; null = kontrol başarısız
  r32RoomsNeedingVentilation: number | null;
  country: string;
  countryCode: string;
  region: string;
  salesChannel: string;
  userCode: string;
  userName: string;
  userType: UserType;
  createdBy: string;
  createdAt: string; // ISO tarih
  updatedAt: string; // ISO tarih
}

interface CountrySeed {
  name: string;
  code: string;
  region: string;
  weight: number;
  salesChannel: string;
  cities: string[];
  users: { name: string; type: UserType }[];
}

const COUNTRIES: CountrySeed[] = [
  { name: 'Türkiye', code: 'TR', region: 'Avrupa', weight: 9, salesChannel: 'SC-NOVA-EU', cities: ['Istanbul', 'Ankara', 'Izmir', 'Zonguldak'], users: [{ name: 'İbrahim Köse', type: 'external' }, { name: 'Ayşe Kaya', type: 'external' }, { name: 'Mehmet Yıldız', type: 'internal' }, { name: 'Can Arslan', type: 'external' }] },
  { name: 'Almanya', code: 'DE', region: 'Avrupa', weight: 7, salesChannel: 'SC-ORION-CE', cities: ['Berlin', 'Munich', 'Hamburg'], users: [{ name: 'Lukas Schmidt', type: 'external' }, { name: 'Anna Weber', type: 'internal' }, { name: 'Jonas Fischer', type: 'external' }] },
  { name: 'Birleşik Krallık', code: 'GB', region: 'Avrupa', weight: 4, salesChannel: 'SC-NOVA-EU', cities: ['London', 'Manchester'], users: [{ name: 'Emma Clarke', type: 'external' }, { name: 'Oliver Hughes', type: 'internal' }] },
  { name: 'Fransa', code: 'FR', region: 'Avrupa', weight: 3, salesChannel: 'SC-NOVA-EU', cities: ['Paris', 'Lyon'], users: [{ name: 'Sophie Martin', type: 'external' }] },
  { name: 'İtalya', code: 'IT', region: 'Avrupa', weight: 2, salesChannel: '', cities: ['Milan', 'Rome'], users: [{ name: 'Marco Rossi', type: 'external' }] },
  { name: 'İspanya', code: 'ES', region: 'Avrupa', weight: 2, salesChannel: '', cities: ['Madrid', 'Barcelona'], users: [{ name: 'Lucia Garcia', type: 'external' }] },
  { name: 'Hollanda', code: 'NL', region: 'Avrupa', weight: 1, salesChannel: '', cities: ['Amsterdam'], users: [{ name: 'Daan de Vries', type: 'external' }] },
  { name: 'Amerika Birleşik Devletleri', code: 'US', region: 'Amerika', weight: 5, salesChannel: 'SC-NOVA-AMER', cities: ['New York', 'Chicago', 'Dallas'], users: [{ name: 'John Miller', type: 'external' }, { name: 'Olivia Brown', type: 'internal' }] },
  { name: 'Kanada', code: 'CA', region: 'Amerika', weight: 3, salesChannel: 'SC-NOVA-AMER', cities: ['Toronto', 'Vancouver'], users: [{ name: 'Liam Tremblay', type: 'external' }] },
  { name: 'Japonya', code: 'JP', region: 'Asya Pasifik', weight: 3, salesChannel: 'SC-APAC-04', cities: ['Tokyo', 'Osaka'], users: [{ name: 'Kenji Sato', type: 'external' }, { name: 'Yuki Mori', type: 'internal' }] }
];

const COMPANY_SUFFIXES = ['Mechanical', 'HVAC Engineering', 'Climate Solutions', 'Contracting', 'Building Services'];

// Ürün tipi id'si (Katalog > Ürün Tipi) → ürün grubu, aile ve model adları
const PRODUCTS_BY_TYPE: Record<number, { group: number; families: { name: string; models: string[] }[] }> = {
  1: { group: GROUP_ODU, families: [{ name: 'AF5301', models: ['25-3', '35-3', '50-3'] }, { name: 'AF5300', models: ['71-3 O'] }] },
  2: { group: GROUP_ODU, families: [{ name: 'AF4300', models: ['71-1', '100-1', '140-1'] }] },
  3: { group: GROUP_ODU, families: [{ name: 'AF-MV', models: ['120-3 O', '160-3 O'] }] },
  4: { group: GROUP_IDU, families: [{ name: 'AF-4C', models: ['56-2 P', '112-2 P'] }] },
  5: { group: GROUP_IDU, families: [{ name: 'AF2', models: ['22-1 W', '36-1 W'] }] },
  6: { group: GROUP_IDU, families: [{ name: 'AF-FS', models: ['71-1 F'] }] },
  7: { group: GROUP_IDU, families: [{ name: 'AF-DC', models: ['56-1 D', '90-1 D'] }] }
};

// Ürün tipi olmayan yardımcı ürünler (kollektör, SBox, hidro kutusu)
const EXTRA_PRODUCTS: { group: number; family: string; models: string[]; chance: number }[] = [
  { group: GROUP_JOINT, family: 'AF-J', models: ['Y-01', 'Y-02', 'H-04'], chance: 0.7 },
  { group: GROUP_SBOX, family: 'AF-SB', models: ['4', '8'], chance: 0.25 },
  { group: GROUP_HYDRO, family: 'AF-HB', models: ['80', '140'], chance: 0.12 }
];

const ODU_TYPES = [1, 2, 3];
const IDU_TYPES = [4, 5, 6, 7];
const ODU_WEIGHTS = [9, 4, 6];
const IDU_WEIGHTS = [7, 8, 2, 5];
// Proje tipi id'leri: 1 Konut … 8 AVM (Proje Tipi seed'i)
const PROJECT_TYPE_WEIGHTS = [10, 7, 6, 5, 3, 6, 4, 3];
// Sistem id'leri: 1 Bire-bir Split, 2 Multi Split, 3 Ticari Splits, 4 VRF
const SYSTEM_WEIGHTS = [3, 2, 2, 9];
const STATUS_WEIGHTS = [3, 2, 3, 2, 1];

const PROJECT_COUNT = 640;
const FIRST_DAY = Date.UTC(2025, 0, 1);
const LAST_DAY = Date.UTC(2026, 10, 24);
const DAY = 86400000;

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

function isoDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

// Kullanıcı kodu kişiye sabittir: ülke kodu + 5 hane
function userCodeOf(countryCode: string, userName: string): string {
  let hash = 0;
  for (const ch of userName) hash = (hash * 31 + ch.charCodeAt(0)) % 100000;
  return countryCode + String(hash).padStart(5, '0');
}

function addTypeLines(lines: ReportLine[], typeId: number, unitCount: number, rnd: () => number) {
  const def = PRODUCTS_BY_TYPE[typeId];
  const family = pick(def.families, rnd);
  const models = [...family.models];
  const lineCount = Math.min(models.length, 1 + Math.floor(rnd() * 2));
  let remaining = unitCount;
  for (let i = 0; i < lineCount; i++) {
    const model = models.splice(Math.floor(rnd() * models.length), 1)[0];
    const quantity = i === lineCount - 1 ? remaining : Math.max(1, Math.round(remaining * (0.3 + rnd() * 0.4)));
    remaining -= quantity;
    if (quantity <= 0) continue;
    lines.push({ productGroupId: def.group, productTypeId: typeId, productFamily: family.name, productName: `${family.name} ${model}`, quantity });
  }
}

function buildProjects(): ReportProject[] {
  const rnd = seededRandom(20261124);
  const list: ReportProject[] = [];
  for (let i = 1; i <= PROJECT_COUNT; i++) {
    const country = COUNTRIES[weightedPick(COUNTRIES.map(c => c.weight), rnd)];
    const city = pick(country.cities, rnd);
    const projectTypeId = weightedPick(PROJECT_TYPE_WEIGHTS, rnd) + 1;
    const systemId = weightedPick(SYSTEM_WEIGHTS, rnd) + 1;
    const isVrf = systemId === 4;

    // Büyük projeler VRF'tir; split sistemlerde ünite sayısı küçüktür
    const idu = isVrf ? 8 + Math.floor(rnd() * 140) : 1 + Math.floor(rnd() * 8);
    const odu = isVrf ? Math.max(1, Math.round(idu / (4 + rnd() * 8))) : Math.max(1, Math.round(idu / (1 + rnd() * 3)));

    const lines: ReportLine[] = [];
    addTypeLines(lines, ODU_TYPES[weightedPick(ODU_WEIGHTS, rnd)], odu, rnd);
    const iduTypeA = IDU_TYPES[weightedPick(IDU_WEIGHTS, rnd)];
    const iduTypeB = IDU_TYPES[weightedPick(IDU_WEIGHTS, rnd)];
    if (iduTypeA !== iduTypeB && idu > 3 && rnd() < 0.55) {
      const split = Math.max(1, Math.round(idu * (0.4 + rnd() * 0.3)));
      addTypeLines(lines, iduTypeA, split, rnd);
      addTypeLines(lines, iduTypeB, idu - split, rnd);
    } else {
      addTypeLines(lines, iduTypeA, idu, rnd);
    }
    if (isVrf) {
      EXTRA_PRODUCTS.filter(x => rnd() < x.chance).forEach(x => {
        lines.push({
          productGroupId: x.group,
          productTypeId: null,
          productFamily: x.family,
          productName: `${x.family} ${pick(x.models, rnd)}`,
          quantity: x.group === GROUP_JOINT ? Math.max(1, Math.round(idu * 0.8)) : 1 + Math.floor(rnd() * 4)
        });
      });
    }

    // Kontrol cihazları: çoğu projede ünite başına; bazı projelerde hiç yok
    const ctrlRoll = rnd();
    const controllers = ctrlRoll < 0.12 ? 0 : ctrlRoll < 0.6 ? idu : Math.round(idu * (0.2 + rnd() * 0.5));
    const centralController = isVrf && rnd() < 0.08;
    if (controllers > 0) {
      lines.push({ productGroupId: GROUP_ACCESSORY, productTypeId: null, productFamily: 'AF-RC', productName: 'AF-RC 1 Remote', quantity: controllers });
    }
    if (centralController) {
      lines.push({ productGroupId: GROUP_ACCESSORY, productTypeId: null, productFamily: 'AF-CC', productName: 'AF-CC 64 Central', quantity: 1 });
    }

    const created = FIRST_DAY + Math.floor(Math.pow(rnd(), 1.4) * (LAST_DAY - FIRST_DAY) / DAY) * DAY;
    const createdAt = isoDate(LAST_DAY - (created - FIRST_DAY));
    // Güncellenme tarihi oluşturmadan birkaç gün sonra; bugünü geçerse oluşturma günü kalır
    const updatedMs = Date.parse(createdAt) + Math.floor(Math.pow(rnd(), 2) * 30) * DAY;
    const updatedAt = updatedMs > LAST_DAY ? createdAt : isoDate(updatedMs);

    // Devreden çıkmış ürün içeren eski projeler salt okunur olur
    const old = Date.parse(createdAt) < Date.UTC(2025, 6, 1);
    const status: ProjectStatus = old && rnd() < 0.18 ? 'readOnly' : EDITABLE_STATUSES[weightedPick(STATUS_WEIGHTS, rnd)];

    const user = pick(country.users, rnd);
    const createdBy = rnd() < 0.85 ? user.name : pick(country.users, rnd).name;
    const dealer = 1 + Math.floor(rnd() * 12);
    const r32Roll = rnd();

    list.push({
      id: i,
      projectNumber: `${country.code}-${country.code}${String(dealer).padStart(4, '0')}-${createdAt.slice(0, 4)}-${String(100 + i).padStart(5, '0')}`,
      projectCode: `PJK-${String(i).padStart(3, '0')}`,
      name: `${city} ${String(1000 + i * 7)}`,
      company: `${city} ${pick(COMPANY_SUFFIXES, rnd)}`,
      projectTypeId,
      systemId,
      subSystem: isVrf && rnd() < 0.26 ? 'heatRecovery' : 'heatPump',
      designMode: rnd() < 0.68 ? 'auto' : 'free',
      status,
      lines,
      controllers,
      centralController,
      r32RoomsNeedingVentilation: r32Roll < 0.06 ? null : r32Roll < 0.3 ? 1 + Math.floor(rnd() * 3) : 0,
      country: country.name,
      countryCode: country.code,
      region: country.region,
      salesChannel: country.salesChannel,
      userCode: userCodeOf(country.code, user.name),
      userName: user.name,
      userType: user.type,
      createdBy,
      createdAt,
      updatedAt
    });
  }
  return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || b.id - a.id);
}

// Bölge + marka → business admin (taslak; tanımlanmamış olanlar boş)
const BUSINESS_ADMINS: Record<string, string> = {
  'Avrupa|1': 'Selin Aydın',
  'Avrupa|2': 'Markus Bauer',
  'Asya Pasifik|2': 'Hiro Tanaka',
  'Amerika|1': 'Daniel Brooks'
};

export type ReportPeriodMode = 'monthly' | 'yearly';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private projectTypeService = inject(ProjectTypeService);
  private catalogService = inject(CatalogService);
  private authService = inject(AuthService);
  private brandService = inject(BrandService);
  private tsService = inject(TranslationService);

  readonly projects: ReportProject[] = buildProjects();

  readonly lastDay = isoDate(LAST_DAY);
  readonly firstDay = isoDate(FIRST_DAY);

  // Projenin markası, proje tipinin bağlı olduğu markadır
  brandIdOf(p: ReportProject): number | null {
    return this.projectTypeService.projectTypes().find(t => t.id === p.projectTypeId)?.brandId ?? null;
  }

  brandName(p: ReportProject): string {
    return this.brandService.brandName(this.brandIdOf(p)) || '-';
  }

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

  keysOf(p: ReportProject, dim: ReportDimension): string[] {
    switch (dim) {
      case 'brand': return [String(this.brandIdOf(p))];
      case 'region': return [p.region];
      case 'country': return [p.country];
      case 'system': return [String(p.systemId)];
      case 'subSystem': return [p.subSystem];
      case 'productCategory': return [...new Set(p.lines.map(l => String(l.productGroupId)))];
      case 'buildingType': return [String(p.projectTypeId)];
      case 'designMode': return [p.designMode];
    }
  }

  labelOf(dim: ReportDimension, key: string): string {
    const id = Number(key);
    switch (dim) {
      case 'brand': return this.brandService.brandName(id) || '—';
      case 'system': return this.tsService.translate(this.catalogService.getItem('sistem', id)?.name ?? '—');
      case 'subSystem': return this.tsService.translate(SUB_SYSTEM_LABELS[key as SubSystem] ?? key);
      case 'productCategory': return this.groupName(id);
      case 'buildingType': {
        const type = this.projectTypeService.projectTypes().find(t => t.id === id);
        return type ? this.tsService.translate(type.value) : '—';
      }
      case 'designMode': return this.tsService.translate(DESIGN_MODE_LABELS[key as DesignMode] ?? key);
      default: return this.tsService.translate(key);
    }
  }

  groupName(id: number): string {
    return this.tsService.translate(this.catalogService.getItem('urun-grubu', id)?.name ?? '—');
  }

  dimensionTitle(dim: ReportDimension): string {
    return {
      brand: 'Marka',
      region: 'Bölge',
      country: 'Ülke',
      system: 'Sistem',
      subSystem: 'Alt sistem',
      productCategory: 'Ürün kategorisi',
      buildingType: 'Bina tipi',
      designMode: 'Tasarım modu'
    }[dim];
  }

  matches(p: ReportProject, filters: ReportFilters, except?: ReportDimension): boolean {
    return (Object.keys(filters) as ReportDimension[]).every(dim =>
      dim === except || !filters[dim] || this.keysOf(p, dim).includes(filters[dim]!)
    );
  }

  // Kapsamdaki projelerde geçen değerler; ülke listesi seçili bölgeyle daraltılabilir
  optionsFor(dim: ReportDimension, within: ReportProject[] = this.scopedProjects()): { key: string; label: string }[] {
    const counts = new Map<string, number>();
    within.forEach(p => this.keysOf(p, dim).forEach(k => counts.set(k, (counts.get(k) ?? 0) + 1)));
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([key]) => ({ key, label: this.labelOf(dim, key) }));
  }

  // Dönem: aylık 'YYYY-MM', yıllık 'YYYY'
  inPeriod(p: ReportProject, mode: ReportPeriodMode, period: string): boolean {
    return mode === 'monthly' ? p.createdAt.startsWith(period + '-') : p.createdAt.startsWith(period);
  }

  previousPeriod(mode: ReportPeriodMode, period: string): string {
    if (mode === 'yearly') return String(Number(period) - 1);
    const [y, m] = period.split('-').map(Number);
    return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
  }

  periodOptions(mode: ReportPeriodMode): string[] {
    const first = new Date(FIRST_DAY);
    const last = new Date(LAST_DAY);
    const list: string[] = [];
    if (mode === 'yearly') {
      for (let y = last.getUTCFullYear(); y >= first.getUTCFullYear(); y--) list.push(String(y));
      return list;
    }
    for (let y = last.getUTCFullYear(), m = last.getUTCMonth() + 1; y > first.getUTCFullYear() || (y === first.getUTCFullYear() && m >= first.getUTCMonth() + 1);) {
      list.push(`${y}-${String(m).padStart(2, '0')}`);
      m--;
      if (m === 0) { m = 12; y--; }
    }
    return list;
  }

  periodLabel(mode: ReportPeriodMode, period: string): string {
    if (mode === 'yearly') return period;
    const [y, m] = period.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString(this.locale, { month: 'long', year: 'numeric', timeZone: 'UTC' });
  }

  monthShort(month: number): string {
    return new Date(Date.UTC(2026, month - 1, 1)).toLocaleDateString(this.locale, { month: 'short', timeZone: 'UTC' });
  }

  get locale(): string {
    return { tr: 'tr-TR', en: 'en-GB', de: 'de-DE', fr: 'fr-FR' }[this.tsService.currentLang()] ?? 'en-GB';
  }

  formatDate(iso: string): string {
    return new Date(iso + 'T00:00:00Z').toLocaleDateString(this.locale, { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
  }

  formatNumber(value: number, digits = 0): string {
    return value.toLocaleString(this.locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }

  // 48.200 → 48,2k
  formatCompact(value: number): string {
    return value >= 10000 ? this.formatNumber(value / 1000, 1) + 'k' : this.formatNumber(value);
  }

  unitsOf(p: ReportProject, group: number): number {
    return p.lines.filter(l => l.productGroupId === group).reduce((sum, l) => sum + l.quantity, 0);
  }

  totalUnits(p: ReportProject): number {
    return p.lines.reduce((sum, l) => sum + l.quantity, 0);
  }

  businessAdmin(region: string, brandId: number | null): string {
    return BUSINESS_ADMINS[`${region}|${brandId}`] ?? '';
  }

  productTypeName(id: number): string {
    return this.tsService.translate(this.catalogService.getItem('urun-tipi', id)?.name ?? '-');
  }

  // Proje × ürün satırı dökümü (Detay tablosuyla aynı 18 sütun); kategori verilirse yalnız o kategorinin satırları
  detailRows(projects: ReportProject[], productCategory?: string): string[][] {
    const t = (k: string) => this.tsService.translate(k);
    const header = [
      'Proje Numarası', 'Kullanıcı Kodu', 'Oluşturma Tarihi', 'Kullanıcı Adı', 'Marka', 'Bölge', 'Ülke Kodu', 'Satış Kanalı',
      'Proje Kodu', 'Proje Adı', 'Projeyi Oluşturan', 'Proje Tipi', 'Sistem', 'Ürün Grubu', 'Ürün Tipi', 'Ürün Ailesi', 'Ürün Adı', 'Adet'
    ].map(t);
    const rows = [header];
    projects.forEach(p => p.lines
      .filter(l => !productCategory || String(l.productGroupId) === productCategory)
      .forEach(l => rows.push([
        p.projectNumber, p.userCode, p.createdAt, p.userName, this.brandName(p), t(p.region), p.countryCode, p.salesChannel || '-',
        p.projectCode, p.name, p.createdBy, this.labelOf('buildingType', String(p.projectTypeId)), this.labelOf('system', String(p.systemId)),
        this.groupName(l.productGroupId), l.productTypeId ? this.productTypeName(l.productTypeId) : '-',
        l.productFamily, l.productName, String(l.quantity)
      ])));
    return rows;
  }

  // Excel'in Türkçe karakterleri doğru açması için BOM'lu, noktalı virgül ayraçlı CSV indirir
  downloadCsv(fileName: string, rows: string[][]) {
    const escape = (v: string) => (/[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
    const csv = '﻿' + rows.map(r => r.map(escape).join(';')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
}
