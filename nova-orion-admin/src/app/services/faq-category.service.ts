import { Injectable, signal } from '@angular/core';

export type CategoryModuleType = 'SSS' | 'Eğitim' | 'Bize Ulaşın';

export interface FaqCategoryItem {
  id: number;
  no: string;
  name: string;
  module: CategoryModuleType;
  description: string;
  status: 'Aktif' | 'Pasif';
}

@Injectable({
  providedIn: 'root'
})
export class FaqCategoryService {
  private categoriesList = signal<FaqCategoryItem[]>([
    { id: 1, no: '#1', name: 'Getting Started', module: 'SSS', description: 'Başlangıç ve genel kullanım rehberleri', status: 'Aktif' },
    { id: 2, no: '#2', name: 'VRF Design', module: 'SSS', description: 'VRF sistem tasarım ve projelendirme soru ve yanıtları', status: 'Aktif' },
    { id: 3, no: '#3', name: 'Multi-Split', module: 'SSS', description: 'Multi-Split klima seçim ve konfigürasyon kuralları', status: 'Aktif' },
    { id: 4, no: '#4', name: 'Reports', module: 'SSS', description: 'Teknik raporlama, hesaplama ve çıktı alma işlemleri', status: 'Aktif' },
    { id: 5, no: '#5', name: 'Troubleshooting', module: 'SSS', description: 'Hata kodları, sorun giderme ve teknik çözümler', status: 'Aktif' },
    { id: 6, no: '#6', name: 'Saha Montaj Eğitimleri', module: 'Eğitim', description: 'VRF ve Isı Pompası saha montaj ve devreye alma eğitim modülleri', status: 'Aktif' },
    { id: 7, no: '#7', name: 'Yazılım & Projelendirme', module: 'Eğitim', description: 'Air Select yazılımı eğitim videoları ve tasarım ipuçları', status: 'Aktif' },
    { id: 8, no: '#8', name: 'Teknik Destek & Servis', module: 'Bize Ulaşın', description: 'Bölgesel yetkili teknik servis ve çağrı merkezi iletişim talepleri', status: 'Aktif' },
    { id: 9, no: '#9', name: 'Satış & Teklif Talepleri', module: 'Bize Ulaşın', description: 'Satış kanalı danışmanlığı ve kurumsal proje teklif başvuruları', status: 'Aktif' }
  ]);

  categories = this.categoriesList.asReadonly();

  getCategoriesByModule(module: CategoryModuleType): FaqCategoryItem[] {
    return this.categoriesList().filter(c => c.module === module);
  }

  addCategory(item: Omit<FaqCategoryItem, 'id' | 'no'>) {
    const current = this.categoriesList();
    const newId = current.length > 0 ? Math.max(...current.map(c => c.id)) + 1 : 1;
    const newItem: FaqCategoryItem = {
      ...item,
      id: newId,
      no: `#${newId}`
    };
    this.categoriesList.set([...current, newItem]);
  }

  updateCategory(id: number, updated: Partial<FaqCategoryItem>) {
    this.categoriesList.set(
      this.categoriesList().map(c => 
        c.id === id ? { ...c, ...updated } : c
      )
    );
  }

  deleteCategory(id: number) {
    this.categoriesList.set(this.categoriesList().filter(c => c.id !== id));
  }

  toggleStatus(id: number) {
    this.categoriesList.set(
      this.categoriesList().map(c => 
        c.id === id ? { ...c, status: c.status === 'Aktif' ? 'Pasif' : 'Aktif' } : c
      )
    );
  }
}
