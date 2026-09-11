import { Injectable, signal } from '@angular/core';
import { UserRole } from './auth.service';

export type ContentScope = 'Global' | 'Bölgesel' | 'Ülke';
export type ContentModuleType = 'SSS' | 'Eğitim' | 'Bize Ulaşın';
export type ContentStatus = 'Published' | 'Pending_Approval' | 'Rejected' | 'Draft';

export interface FaqItem {
  id: number;
  moduleType: ContentModuleType;
  question: string; // Question or Topic Title
  answerSnippet: string; // Content / Answer / Description
  hasReferenceLink?: boolean;
  referenceUrl?: string;
  category: string;
  scope: ContentScope;
  targetRegion?: string;
  targetCountry?: string;
  targetCountries?: string[];
  targetRegions?: string[];
  status: ContentStatus;
  viewCount: number;
  createdByRole: UserRole;
  createdBy: string;
  deactivatedInRegions?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private questionsList = signal<FaqItem[]>([
    // SSS items
    {
      id: 1,
      moduleType: 'SSS',
      question: 'Air Select ile yeni proje ve VRF sistemi nasıl başlatılır?',
      answerSnippet: 'Ana sayfadaki Yeni Proje Sihirbazı üzerinden bina tipolojisi ve kat planı yükleyerek tasarım başlatabilirsiniz.',
      hasReferenceLink: true,
      referenceUrl: 'https://docs.nova-orion.com/getting-started',
      category: 'Getting Started',
      scope: 'Global',
      status: 'Published',
      viewCount: 620,
      createdByRole: 'SUPER_ADMIN',
      createdBy: 'Sistem Yöneticisi'
    },
    {
      id: 2,
      moduleType: 'SSS',
      question: '2 Borulu ve 3 Borulu Isı Geri Kazanımlı VRF borulama kuralları nelerdir?',
      answerSnippet: 'Heat Recovery modu için 3 borulu dağıtım manifoldları ve branşman kutuları otomatik hesaplanır.',
      hasReferenceLink: false,
      category: 'VRF Design',
      scope: 'Global',
      status: 'Published',
      viewCount: 840,
      createdByRole: 'SUPER_ADMIN',
      createdBy: 'Sistem Yöneticisi'
    },
    {
      id: 3,
      moduleType: 'SSS',
      question: 'Türkiye enerji verimliliği ve Binalarda Enerji Performansı (BEP-TR) uyumluluk raporu',
      answerSnippet: 'Türkiye iklim verileri ve BEP-TR standartlarına uygun sezonluk COP/EER hesaplama çıktısı Raporlar sekmesinden alınabilir.',
      hasReferenceLink: true,
      referenceUrl: 'https://docs.nova-orion.com/tr-bep',
      category: 'Reports',
      scope: 'Ülke',
      targetRegion: 'Avrupa',
      targetCountry: 'Türkiye',
      status: 'Published',
      viewCount: 410,
      createdByRole: 'COUNTRY_ADMIN',
      createdBy: 'Country Admin (TR)'
    },
    {
      id: 4,
      moduleType: 'SSS',
      question: 'Almanya BAFA Teşvikleri & Isı Pompası Hibrit Entegrasyon Kriterleri',
      answerSnippet: 'Almanya yönetmeliklerine uygun SCOP minimum 4.5 eşik değeri otomatik olarak kontrol edilir.',
      hasReferenceLink: true,
      referenceUrl: 'https://docs.nova-orion.com/de-bafa',
      category: 'Reports',
      scope: 'Ülke',
      targetRegion: 'Avrupa',
      targetCountry: 'Almanya',
      status: 'Pending_Approval', // Needs Region Admin approval
      viewCount: 15,
      createdByRole: 'COUNTRY_ADMIN',
      createdBy: 'Country Admin (DE)'
    },

    // Eğitim Items
    {
      id: 5,
      moduleType: 'Eğitim',
      question: 'Compress 7000i Isı Pompası Devreye Alma ve Hidrolik Bağlantı Video Eğitimi',
      answerSnippet: 'Bu 45 dakikalık kapsamlı video eğitimde hidrolik modül montajı, genleşme tankı boyutlandırması ve ilk çalıştırma adımları anlatılmaktadır.',
      hasReferenceLink: true,
      referenceUrl: 'https://academy.nova-orion.com/courses/compress-7000i',
      category: 'Saha Montaj Eğitimleri',
      scope: 'Global',
      status: 'Published',
      viewCount: 512,
      createdByRole: 'SUPER_ADMIN',
      createdBy: 'Super Admin'
    },
    {
      id: 6,
      moduleType: 'Eğitim',
      question: 'Air Select 3D Borulama ve AutoCAD DXF Export İleri Seviye Tasarım Dersi',
      answerSnippet: 'BIM/Revit ve CAD ortamlarına uyumlu 3D izometrik boru hattı çizimi ve basınç kaybı optimizasyon eğitimi.',
      hasReferenceLink: true,
      referenceUrl: 'https://academy.nova-orion.com/courses/cad-export',
      category: 'Yazılım & Projelendirme',
      scope: 'Bölgesel',
      targetRegion: 'Avrupa',
      status: 'Published',
      viewCount: 395,
      createdByRole: 'REGION_ADMIN',
      createdBy: 'Region Admin (EU)'
    },
    {
      id: 7,
      moduleType: 'Eğitim',
      question: 'Türkiye Bölgesel VRF Borulama ve Gaz Şarjı Saha Eğitimi',
      answerSnippet: 'R410A / R32 gaz şarjı prosedürleri ve vakum testi adımları.',
      hasReferenceLink: false,
      category: 'Saha Montaj Eğitimleri',
      scope: 'Ülke',
      targetRegion: 'Avrupa',
      targetCountry: 'Türkiye',
      status: 'Pending_Approval', // Needs Region Admin approval
      viewCount: 0,
      createdByRole: 'COUNTRY_ADMIN',
      createdBy: 'Country Admin (TR)'
    },

    // Bize Ulaşın Items
    {
      id: 8,
      moduleType: 'Bize Ulaşın',
      question: 'Merkezi Teknik Destek ve Saha Arıza Çağrı Hattı',
      answerSnippet: 'Hafta içi 08:30 - 18:00 saatleri arasında acil devreye alma ve teknik arıza danışmanlığı için: 0850 555 0123 / destek@nova-orion.com',
      hasReferenceLink: true,
      referenceUrl: 'https://nova-orion.com/contact-support',
      category: 'Teknik Destek & Servis',
      scope: 'Global',
      status: 'Published',
      viewCount: 780,
      createdByRole: 'SUPER_ADMIN',
      createdBy: 'Super Admin'
    },
    {
      id: 9,
      moduleType: 'Bize Ulaşın',
      question: 'Avrupa Bölgesi Proje Teklif ve Bayi Dağıtım Masası',
      answerSnippet: 'Ticari bina projeleriniz için doğrudan proje mühendislerimizle iletişime geçin: eu-projects@nova-orion.com',
      hasReferenceLink: true,
      referenceUrl: 'https://nova-orion.com/eu-contact',
      category: 'Satış & Teklif Talepleri',
      scope: 'Bölgesel',
      targetRegion: 'Avrupa',
      status: 'Published',
      viewCount: 320,
      createdByRole: 'REGION_ADMIN',
      createdBy: 'Region Admin (EU)'
    }
  ]);

  questions = this.questionsList.asReadonly();

  getItemsByModule(module: ContentModuleType): FaqItem[] {
    return this.questionsList().filter(q => q.moduleType === module);
  }

  addQuestion(item: Omit<FaqItem, 'id' | 'viewCount'>) {
    const current = this.questionsList();
    const newId = current.length > 0 ? Math.max(...current.map(q => q.id)) + 1 : 1;
    const newItem: FaqItem = {
      ...item,
      id: newId,
      viewCount: 0,
      deactivatedInRegions: []
    };
    this.questionsList.set([newItem, ...current]);
  }

  updateQuestion(id: number, updated: Partial<FaqItem>) {
    this.questionsList.set(
      this.questionsList().map(q => 
        q.id === id ? { ...q, ...updated } : q
      )
    );
  }

  deleteQuestion(id: number) {
    this.questionsList.set(this.questionsList().filter(q => q.id !== id));
  }

  toggleStatus(id: number) {
    this.questionsList.set(
      this.questionsList().map(q => {
        if (q.id !== id) return q;
        const newStatus: ContentStatus = q.status === 'Published' ? 'Draft' : 'Published';
        return { ...q, status: newStatus };
      })
    );
  }

  // Region Admin approval actions
  approveItem(id: number) {
    this.questionsList.set(
      this.questionsList().map(q => 
        q.id === id ? { ...q, status: 'Published' } : q
      )
    );
  }

  rejectItem(id: number) {
    this.questionsList.set(
      this.questionsList().map(q => 
        q.id === id ? { ...q, status: 'Rejected' } : q
      )
    );
  }

  // Region Admin deactivating a question/item for their region
  toggleRegionDeactivation(id: number, regionName: string) {
    this.questionsList.set(
      this.questionsList().map(q => {
        if (q.id !== id) return q;
        const deactList = q.deactivatedInRegions || [];
        const isCurrentlyDeactivated = deactList.includes(regionName);
        const updatedList = isCurrentlyDeactivated 
          ? deactList.filter(r => r !== regionName)
          : [...deactList, regionName];
        return { ...q, deactivatedInRegions: updatedList };
      })
    );
  }

  isDeactivatedInRegion(item: FaqItem, regionName: string): boolean {
    return !!item.deactivatedInRegions?.includes(regionName);
  }
}
