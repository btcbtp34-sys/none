import { Injectable, signal } from '@angular/core';

export type DownloadRegion = 'Global' | 'Avrupa' | 'Asya Pasifik' | 'Amerika';

export interface DownloadItem {
  id: number;
  title: string;
  uploader: string;
  date: string;
  filename: string;
  size: string;
  permission: 'all' | 'logged_in';
  permissionText: string;
  iconType: 'pdf' | 'zip' | 'doc';
  region: DownloadRegion;
  status: 'Aktif' | 'Pasif';
  // Country-level active/passive override flags controlled by Regional Admin
  countryStatus: Record<string, boolean>;
}

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  private downloadsList = signal<DownloadItem[]>([
    {
      id: 1,
      title: 'Nova 2026 HVAC Genel Ürün Kataloğu',
      uploader: 'Super Admin',
      date: '1 Haz 2026',
      filename: 'Nova_HVAC_2026_Catalog_v2.pdf',
      size: '14.8 MB',
      permission: 'all',
      permissionText: 'Tüm Kullanıcılar (Herkes)',
      iconType: 'pdf',
      region: 'Global',
      status: 'Aktif',
      countryStatus: {
        'Türkiye': true,
        'Almanya': true,
        'Birleşik Krallık': true,
        'Fransa': true,
        'Japonya': true,
        'Amerika Birleşik Devletleri': true
      }
    },
    {
      id: 2,
      title: 'AF Serisi VRF & Isı Pompası Teknik Montaj Kılavuzu',
      uploader: 'Super Admin',
      date: '15 Haz 2026',
      filename: 'AF_Series_Installation_Manual_2026.pdf',
      size: '8.4 MB',
      permission: 'logged_in',
      permissionText: 'Sadece Giriş Yapanlar',
      iconType: 'pdf',
      region: 'Avrupa',
      status: 'Aktif',
      countryStatus: {
        'Türkiye': true,
        'Almanya': true,
        'Birleşik Krallık': true,
        'Fransa': true,
        'Avusturya': true,
        'İsviçre': true
      }
    },
    {
      id: 3,
      title: 'MDCI & AF6300A CAD & DWG Çizim Paketi',
      uploader: 'Super Admin',
      date: '4 Tem 2026',
      filename: 'MDCI_AF6300A_CAD_Drawings.zip',
      size: '42.1 MB',
      permission: 'logged_in',
      permissionText: 'Sadece Giriş Yapanlar',
      iconType: 'zip',
      region: 'Avrupa',
      status: 'Aktif',
      countryStatus: {
        'Türkiye': true,
        'Almanya': false,
        'Birleşik Krallık': true,
        'Fransa': true
      }
    },
    {
      id: 4,
      title: 'Americas Commercial HVAC Technical Specs',
      uploader: 'Super Admin',
      date: '12 Tem 2026',
      filename: 'Americas_Commercial_Specs.pdf',
      size: '11.2 MB',
      permission: 'logged_in',
      permissionText: 'Sadece Giriş Yapanlar',
      iconType: 'pdf',
      region: 'Amerika',
      status: 'Aktif',
      countryStatus: {
        'Amerika Birleşik Devletleri': true,
        'Kanada': true
      }
    }
  ]);

  downloads = this.downloadsList.asReadonly();

  addDownload(item: { 
    title: string; 
    permission: 'all' | 'logged_in'; 
    region: DownloadRegion; 
    filename?: string; 
    size?: string 
  }) {
    const current = this.downloadsList();
    const newId = current.length > 0 ? Math.max(...current.map(d => d.id)) + 1 : 1;
    const today = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
    
    const newItem: DownloadItem = {
      id: newId,
      title: item.title,
      uploader: 'Super Admin',
      date: today,
      filename: item.filename || 'Project_Document_2026.pdf',
      size: item.size || '3.5 MB',
      permission: item.permission,
      permissionText: item.permission === 'all' ? 'Tüm Kullanıcılar (Herkes)' : 'Sadece Giriş Yapanlar',
      iconType: item.filename?.endsWith('.zip') ? 'zip' : 'pdf',
      region: item.region,
      status: 'Aktif',
      countryStatus: {}
    };
    
    this.downloadsList.set([newItem, ...current]);
  }

  updateDownload(id: number, updated: Partial<DownloadItem>) {
    this.downloadsList.set(
      this.downloadsList().map(d => {
        if (d.id !== id) return d;
        const newPerm = updated.permission || d.permission;
        return {
          ...d,
          ...updated,
          permissionText: newPerm === 'all' ? 'Tüm Kullanıcılar (Herkes)' : 'Sadece Giriş Yapanlar'
        };
      })
    );
  }

  // Regional Admin toggles active/passive for a specific country in their region
  toggleCountryStatus(downloadId: number, countryName: string) {
    this.downloadsList.set(
      this.downloadsList().map(d => {
        if (d.id !== downloadId) return d;
        const currentMap = d.countryStatus || {};
        const isCurrentActive = currentMap[countryName] !== undefined ? currentMap[countryName] : true;
        return {
          ...d,
          countryStatus: {
            ...currentMap,
            [countryName]: !isCurrentActive
          }
        };
      })
    );
  }

  isCountryActiveForDownload(item: DownloadItem, countryName: string): boolean {
    if (item.status === 'Pasif') return false;
    if (item.countryStatus && item.countryStatus[countryName] !== undefined) {
      return item.countryStatus[countryName];
    }
    return true; // default active
  }

  deleteDownload(id: number) {
    this.downloadsList.set(this.downloadsList().filter(d => d.id !== id));
  }
}
