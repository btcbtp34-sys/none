import { Injectable, signal } from '@angular/core';

export type CatalogEntity = 'sistem' | 'urun-grubu' | 'urun-tipi' | 'urun-ailesi' | 'urun' | 'versiyon';

export type CatalogStatus = 'Aktif' | 'Pasif';

export interface CatalogItem {
  id: number;
  name: string;
  description: string;
  // Bağlı üst kayıtların id'leri (config.parent ile belirtilen katalog)
  parentIds: number[];
  // Sadece hasProductType olan kataloglarda kullanılır
  productTypeId?: number | null;
  // Sadece hasSystem olan kataloglarda: üst ürün grubunun sistemlerinden seçilenler
  systemIds?: number[];
  // Sadece Ürün kataloğunda kullanılan alanlar
  productFamilyId?: number | null;
  // İlişkiler: uyumlu/bağlı versiyonlar ve geçerli olduğu ülkeler (Ürün ve Ürün Ailesi)
  versionIds?: number[];
  countryIds?: number[];
  // Sadece Ürün Ailesi: kaydın kendi versiyonu (tek seçim)
  ownVersionId?: number | null;
  unbrandedName?: string;
  version?: string;
  imageGroups?: ProductImageGroups;
  dimensions?: ProductDimensions;
  capacity?: ProductCapacity;
  capacityRows?: CapacityRow[];
  status: CatalogStatus;
}

export type CapacityType = 'COOLING' | 'HEATING';

// Kapasite tablosu satırı; sıcaklıklar °C, kapasite ve güç kW
export interface CapacityRow {
  nominalCapacity: number | null;
  type: CapacityType;
  outdoorWb: number | null;
  outdoorDb: number | null;
  totalCapacity: number | null;
  powerInput: number | null;
  combinationRatio: number | null;
  indoorDb: number | null;
  indoorWb: number | null;
}

// Kapasiteler kW, güç tüketimleri W
export interface ProductCapacity {
  nominalCapacity: number | null;
  powerSupply: string;
  coolingCapacity: number | null;
  coolingSensibleCapacity: number | null;
  coolingPowerInput: number | null;
  heatingCapacity: number | null;
  heatingPowerInput: number | null;
}

export type ProductImageGroupKey = 'photo' | 'vector3d' | 'topView' | 'wiring';

// Görsel kaynakları: yüklenen görseller data URL, örnek görseller /images/... yolu
export type ProductImageGroups = Record<ProductImageGroupKey, string[]>;

export const PRODUCT_IMAGE_GROUPS: { key: ProductImageGroupKey; label: string }[] = [
  { key: 'photo', label: 'Photo' },
  { key: 'vector3d', label: '3D Vectorial' },
  { key: 'topView', label: 'Top View' },
  { key: 'wiring', label: 'Wiring Photo' }
];

export function emptyImageGroups(): ProductImageGroups {
  return { photo: [], vector3d: [], topView: [], wiring: [] };
}

// Ölçüler mm, ağırlıklar kg
export interface ProductDimensions {
  width: number | null;
  height: number | null;
  depth: number | null;
  netWeight: number | null;
  grossWeight: number | null;
}

export interface CatalogEntityConfig {
  title: string;
  subtitle: string;
  singular: string;
  parent: CatalogEntity | null;
  parentLabel: string;
  // false: her kayıt tek bir üst kayda bağlanır (1:1)
  multiParent: boolean;
  // true: seçilen ürün grubuna ait bir ürün tipi de seçilir
  hasProductType?: boolean;
  // true: seçilen ürün grubunun bağlı olduğu sistemlerden seçim yapılır
  hasSystem?: boolean;
  // true: kendi versiyonu, uyumlu versiyonlar ve ülke seçimi yapılır
  hasVersionsAndCountries?: boolean;
}

export const CATALOG_ENTITIES: Record<CatalogEntity, CatalogEntityConfig> = {
  'versiyon': {
    title: 'Versiyon',
    subtitle: 'Ürünlere bağlanabilen versiyonların yönetimi',
    singular: 'Versiyon',
    parent: null,
    parentLabel: '',
    multiParent: false
  },
  'sistem': {
    title: 'Sistem',
    subtitle: 'Katalogda tanımlı sistemlerin yönetimi',
    singular: 'Sistem',
    parent: null,
    parentLabel: '',
    multiParent: false
  },
  'urun-grubu': {
    title: 'Ürün Grubu',
    subtitle: 'Sistemlere bağlı ürün gruplarının yönetimi',
    singular: 'Ürün Grubu',
    parent: 'sistem',
    parentLabel: 'SİSTEM',
    multiParent: true
  },
  'urun-tipi': {
    title: 'Ürün Tipi',
    subtitle: 'Ürün gruplarına bağlı ürün tiplerinin yönetimi',
    singular: 'Ürün Tipi',
    parent: 'urun-grubu',
    parentLabel: 'ÜRÜN GRUBU',
    multiParent: false,
    hasSystem: true
  },
  'urun-ailesi': {
    title: 'Ürün Ailesi',
    subtitle: 'Ürün gruplarına bağlı ürün ailelerinin yönetimi',
    singular: 'Ürün Ailesi',
    parent: 'urun-grubu',
    parentLabel: 'ÜRÜN GRUBU',
    multiParent: false,
    hasProductType: true,
    hasSystem: true,
    hasVersionsAndCountries: true
  },
  'urun': {
    title: 'Ürün',
    subtitle: 'Ürün grubu, tipi ve ailesine göre ürünlerin yönetimi',
    singular: 'Ürün',
    parent: 'urun-grubu',
    parentLabel: 'ÜRÜN GRUBU',
    multiParent: false,
    hasProductType: true
  }
};

const STORAGE_KEY = 'nova_orion_catalog_v15';

// [OutdoorDBc, TCkW, PIkW, IndoorWbc]; diğer sütunlar tüm satırlarda aynı
const SAMPLE_AF5301A_CAPACITY_ROWS: CapacityRow[] = [
  [0, 22.78169154229, 3.2913190948247, 14],
  [0, 27.24059701493, 4.10323174397403, 16],
  [0, 31.17850746269, 4.33271302717158, 18],
  [0, 32.81253731343, 4.67672252061021, 19],
  [0, 33.92955223881, 4.7482841797189, 20],
  [0, 35.18577114428, 5.05540450608472, 22],
  [0, 35.80099502488, 5.03916736143925, 24],
  [2, 22.7816915422885, 3.35460516712888, 14],
  [2, 27.2405970149253, 4.11270802975688, 16],
  [2, 31.1785074626865, 4.48211692466026, 18],
  [2, 32.8125373134328, 4.94179991044237, 19],
  [2, 33.9295522388059, 4.79500060612208, 20],
  [2, 35.1857711442786, 5.09327270463217, 22],
  [2, 35.8009950248756, 5.11927245558609, 24]
].map(([outdoorDb, totalCapacity, powerInput, indoorWb]) => ({
  nominalCapacity: 25.2,
  type: 'COOLING' as CapacityType,
  outdoorWb: null,
  outdoorDb,
  totalCapacity,
  powerInput,
  combinationRatio: 200,
  indoorDb: null,
  indoorWb
}));

const SAMPLE_AF5301A_IMAGES: ProductImageGroups = {
  photo: ['/images/catalog/af5301a-photo.svg'],
  vector3d: ['/images/catalog/af5301a-3d-vectorial.svg'],
  topView: ['/images/catalog/af5301a-top-view.svg'],
  wiring: ['/images/catalog/af5301a-wiring.svg']
};

const INITIAL_CATALOG: Record<CatalogEntity, CatalogItem[]> = {
  'versiyon': ['V4', 'V6', 'V6+', 'V8', 'UNI', 'RAC', 'SCAC', 'MULTI'].map((name, i) => ({
    id: i + 1,
    name,
    description: '',
    parentIds: [],
    status: 'Aktif' as CatalogStatus
  })),
  'sistem': [
    { id: 1, name: 'Bire-bir Split', description: 'Bir dış üniteye bir iç ünite bağlanan split sistemler', parentIds: [], status: 'Aktif' },
    { id: 2, name: 'Multi Split', description: 'Bir dış üniteye birden fazla iç ünite bağlanan split sistemler', parentIds: [], status: 'Aktif' },
    { id: 3, name: 'Ticari Splits', description: 'Ticari uygulamalara yönelik split sistemler', parentIds: [], status: 'Aktif' },
    { id: 4, name: 'VRF', description: 'Değişken soğutucu akışkan debili sistemler', parentIds: [], status: 'Aktif' }
  ],
  'urun-grubu': [
    { id: 1, name: 'Dağıtıcı Kollektör', description: '', parentIds: [4], status: 'Aktif' },
    { id: 2, name: 'Dış Ünite', description: '', parentIds: [1, 3, 4], status: 'Aktif' },
    { id: 3, name: 'Hidro Kutusu', description: '', parentIds: [4], status: 'Aktif' },
    { id: 4, name: 'İç Ünite', description: '', parentIds: [1, 3, 4], status: 'Aktif' },
    { id: 5, name: 'SBox', description: '', parentIds: [4], status: 'Aktif' },
    { id: 6, name: 'Aksesuar', description: '', parentIds: [4], status: 'Aktif' }
  ],
  'urun-tipi': [
    // Örnek veride her tip, ürün grubunun tüm sistemlerine bağlı başlar
    { id: 1, name: 'R32', description: '', parentIds: [2], systemIds: [1, 3, 4], status: 'Aktif' },
    { id: 2, name: 'R410', description: '', parentIds: [2], systemIds: [1, 3, 4], status: 'Aktif' },
    { id: 3, name: 'Mini VRF', description: '', parentIds: [2], systemIds: [1, 3, 4], status: 'Aktif' },
    { id: 4, name: 'Kaset', description: '', parentIds: [4], systemIds: [1, 3, 4], status: 'Aktif' },
    { id: 5, name: 'Duvar', description: '', parentIds: [4], systemIds: [1, 3, 4], status: 'Aktif' },
    { id: 6, name: 'Yer', description: '', parentIds: [4], systemIds: [1, 3, 4], status: 'Aktif' },
    { id: 7, name: 'Kanal', description: '', parentIds: [4], systemIds: [1, 3, 4], status: 'Aktif' }
  ],
  'urun-ailesi': [
    { id: 1, name: 'AF5301', description: '', parentIds: [2], systemIds: [1, 3, 4], status: 'Aktif' },
    { id: 2, name: 'AF4300', description: '', parentIds: [2], systemIds: [1, 3, 4], status: 'Aktif' },
    { id: 3, name: 'AF2', description: '', parentIds: [4], systemIds: [1, 3, 4], status: 'Aktif' },
    { id: 4, name: 'AF', description: '', parentIds: [4], systemIds: [1, 3, 4], status: 'Aktif' }
  ],
  'urun': ['25-3', '28-3', '33-3', '40-3', '45-3', '50-3', '56-3', '62-3', '67-3', '73-3'].map((model, i) => ({
    id: i + 1,
    name: `AF5301A ${model}`,
    description: '',
    parentIds: [2],
    productTypeId: null,
    productFamilyId: 1,
    unbrandedName: '',
    version: '',
    // İlk ürün, görsel sekmesinin dolu halini göstermek için örnek görsellerle gelir
    imageGroups: i === 0 ? SAMPLE_AF5301A_IMAGES : emptyImageGroups(),
    capacityRows: i === 0 ? SAMPLE_AF5301A_CAPACITY_ROWS : [],
    status: 'Aktif' as CatalogStatus
  }))
};

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private catalog = signal<Record<CatalogEntity, CatalogItem[]>>(this.loadInitialData());

  items(entity: CatalogEntity): CatalogItem[] {
    return this.catalog()[entity];
  }

  getItem(entity: CatalogEntity, id: number): CatalogItem | undefined {
    return this.items(entity).find(i => i.id === id);
  }

  itemName(entity: CatalogEntity, id: number | null | undefined): string {
    return id ? this.getItem(entity, id)?.name ?? '' : '';
  }

  // Ürün grubuna ait ürün tipleri
  // Ürün grubunun bağlı olduğu sistemler
  groupSystemOptions(groupId: number | null): CatalogItem[] {
    const group = groupId !== null ? this.getItem('urun-grubu', groupId) : undefined;
    if (!group) return [];
    return this.items('sistem').filter(s => group.parentIds.includes(s.id));
  }

  // Ürün tipi seçiliyse tipin sistemleri, değilse ürün grubunun sistemleri
  systemOptions(groupId: number | null, typeId: number | null): CatalogItem[] {
    const type = typeId ? this.getItem('urun-tipi', typeId) : undefined;
    if (!type) return this.groupSystemOptions(groupId);
    return this.items('sistem').filter(s => type.systemIds?.includes(s.id));
  }

  productTypeOptions(groupId: number | null): CatalogItem[] {
    if (groupId === null) return [];
    return this.items('urun-tipi').filter(t => t.parentIds.includes(groupId));
  }

  // Ürün grubuna ait; tipi boş ya da seçilen tiple aynı olan ürün aileleri
  productFamilyOptions(groupId: number | null, typeId: number | null): CatalogItem[] {
    if (groupId === null) return [];
    return this.items('urun-ailesi').filter(
      f => f.parentIds.includes(groupId) && (!f.productTypeId || f.productTypeId === typeId)
    );
  }

  private loadInitialData(): Record<CatalogEntity, CatalogItem[]> {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...INITIAL_CATALOG, ...parsed };
        }
      }
    } catch {
      // Fallback to initial catalog on parse error
    }
    return INITIAL_CATALOG;
  }

  // Kalıcı kayıt başarısız olursa (ör. görsellerle depolama kotası dolarsa) false döner
  private commit(next: Record<CatalogEntity, CatalogItem[]>): boolean {
    this.catalog.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return true;
    } catch {
      return false;
    }
  }

  addItem(entity: CatalogEntity, item: Omit<CatalogItem, 'id'>): { id: number; persisted: boolean } {
    const current = this.catalog()[entity];
    const newId = current.length > 0 ? Math.max(...current.map(i => i.id)) + 1 : 1;
    const persisted = this.commit({ ...this.catalog(), [entity]: [{ ...item, id: newId }, ...current] });
    return { id: newId, persisted };
  }

  updateItem(entity: CatalogEntity, id: number, updated: Partial<CatalogItem>): boolean {
    const list = this.catalog()[entity].map(i => (i.id === id ? { ...i, ...updated } : i));
    return this.commit({ ...this.catalog(), [entity]: list });
  }

  toggleStatus(entity: CatalogEntity, id: number) {
    const item = this.catalog()[entity].find(i => i.id === id);
    if (item) {
      this.updateItem(entity, id, { status: item.status === 'Aktif' ? 'Pasif' : 'Aktif' });
    }
  }

  deleteItem(entity: CatalogEntity, id: number) {
    const next = { ...this.catalog(), [entity]: this.catalog()[entity].filter(i => i.id !== id) };

    // Silinen kaydı, ona bağlı alt kayıtlardan da kaldır
    (Object.keys(next) as CatalogEntity[])
      .filter(key => CATALOG_ENTITIES[key].parent === entity)
      .forEach(key => {
        next[key] = next[key].map(i =>
          i.parentIds.includes(id) ? { ...i, parentIds: i.parentIds.filter(p => p !== id) } : i
        );
      });

    // Silinen ürün tipini, onu kullanan kayıtlardan da kaldır
    if (entity === 'urun-tipi') {
      (Object.keys(next) as CatalogEntity[])
        .filter(key => CATALOG_ENTITIES[key].hasProductType)
        .forEach(key => {
          next[key] = next[key].map(i => (i.productTypeId === id ? { ...i, productTypeId: null } : i));
        });
    }

    // Silinen sistemi, sistem seçimi olan kayıtlardan da kaldır
    if (entity === 'sistem') {
      (Object.keys(next) as CatalogEntity[])
        .filter(key => CATALOG_ENTITIES[key].hasSystem)
        .forEach(key => {
          next[key] = next[key].map(i =>
            i.systemIds?.includes(id) ? { ...i, systemIds: i.systemIds.filter(s => s !== id) } : i
          );
        });
    }

    // Silinen versiyonu ürünlerden ve ürün ailelerinden de kaldır
    if (entity === 'versiyon') {
      (['urun', 'urun-ailesi'] as CatalogEntity[]).forEach(key => {
        next[key] = next[key].map(i => ({
          ...i,
          versionIds: i.versionIds?.filter(v => v !== id),
          ownVersionId: i.ownVersionId === id ? null : i.ownVersionId
        }));
      });
    }

    // Silinen ürün ailesini ürünlerden de kaldır
    if (entity === 'urun-ailesi') {
      next['urun'] = next['urun'].map(i => (i.productFamilyId === id ? { ...i, productFamilyId: null } : i));
    }

    this.commit(next);
  }
}
