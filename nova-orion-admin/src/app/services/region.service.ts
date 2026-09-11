import { Injectable, signal } from '@angular/core';

export interface RegionItem {
  id: number;
  code: string;
  name: string;
  description?: string;
  status: 'Aktif' | 'Pasif';
}

@Injectable({
  providedIn: 'root'
})
export class RegionService {
  private regionsList = signal<RegionItem[]>([
    {
      id: 1,
      code: 'APAC',
      name: 'Asya Pasifik',
      description: 'Asya ve Pasifik Okyanusu kıyısındaki ülkeler',
      status: 'Aktif'
    },
    {
      id: 2,
      code: 'EU',
      name: 'Avrupa',
      description: 'Avrupa Kıtası ve Avrupa Birliği ülkeleri',
      status: 'Aktif'
    },
    {
      id: 3,
      code: 'AMER',
      name: 'Amerika',
      description: 'Kuzey ve Güney Amerika ülkeleri ile eyaletleri',
      status: 'Aktif'
    }
  ]);

  regions = this.regionsList.asReadonly();

  addRegion(region: Omit<RegionItem, 'id'>) {
    const current = this.regionsList();
    const newId = current.length > 0 ? Math.max(...current.map(r => r.id)) + 1 : 1;
    this.regionsList.set([...current, { ...region, id: newId }]);
  }

  updateRegion(id: number, updated: Partial<RegionItem>) {
    this.regionsList.set(
      this.regionsList().map(r => 
        r.id === id ? { ...r, ...updated } : r
      )
    );
  }

  deleteRegion(id: number) {
    this.regionsList.set(this.regionsList().filter(r => r.id !== id));
  }

  toggleStatus(id: number) {
    this.regionsList.set(this.regionsList().map(r => 
      r.id === id ? { ...r, status: r.status === 'Aktif' ? 'Pasif' : 'Aktif' } : r
    ));
  }
}
