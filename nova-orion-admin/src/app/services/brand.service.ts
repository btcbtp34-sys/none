import { Injectable, signal } from '@angular/core';

export type BrandStatus = 'Aktif' | 'Pasif';

export interface BrandItem {
  id: number;
  code: string;
  name: string;
  description: string;
  status: BrandStatus;
}

const STORAGE_KEY = 'nova_orion_brands';

const INITIAL_BRANDS: BrandItem[] = [
  { id: 1, code: 'NOVA', name: 'Nova', description: 'Project Nova markası', status: 'Aktif' },
  { id: 2, code: 'ORION', name: 'Orion', description: 'Project Orion markası', status: 'Aktif' }
];

// Sistem Yönetimi > Markalar: indirilenler, proje tipleri, kategoriler ve kullanıcılar bu markalara bağlanır
@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private brandList = signal<BrandItem[]>(this.loadInitialData());

  brands = this.brandList.asReadonly();

  private loadInitialData(): BrandItem[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback to initial list on parse error
    }
    return INITIAL_BRANDS;
  }

  private persist(data: BrandItem[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }

  // Seçim listelerinde gösterilecek markalar (pasifler hariç, mevcut seçim korunur)
  selectableBrands(selectedIds: number[] = []): BrandItem[] {
    return this.brandList().filter(b => b.status === 'Aktif' || selectedIds.includes(b.id));
  }

  brandName(id: number | null | undefined): string {
    return this.brandList().find(b => b.id === id)?.name ?? '';
  }

  addBrand(item: Omit<BrandItem, 'id'>) {
    const current = this.brandList();
    const newId = current.length > 0 ? Math.max(...current.map(b => b.id)) + 1 : 1;
    const updated = [...current, { ...item, id: newId }];
    this.brandList.set(updated);
    this.persist(updated);
  }

  updateBrand(id: number, updated: Partial<BrandItem>) {
    const next = this.brandList().map(b => (b.id === id ? { ...b, ...updated } : b));
    this.brandList.set(next);
    this.persist(next);
  }

  toggleStatus(id: number) {
    const brand = this.brandList().find(b => b.id === id);
    if (brand) this.updateBrand(id, { status: brand.status === 'Aktif' ? 'Pasif' : 'Aktif' });
  }

  deleteBrand(id: number) {
    const next = this.brandList().filter(b => b.id !== id);
    this.brandList.set(next);
    this.persist(next);
  }
}
