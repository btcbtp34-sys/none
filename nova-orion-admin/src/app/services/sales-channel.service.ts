import { Injectable, signal } from '@angular/core';

export interface SalesChannelItem {
  id: number;
  // Kanalın görünen adı (alan adı geçmişten kalma)
  brandName: string;
  // Kanalın atandığı marka (Sistem Yönetimi > Markalar)
  brandId: number | null;
  code: string;
  countries: string[];
  region?: string;
  status: 'Aktif' | 'Pasif';
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SalesChannelService {
  private channelsList = signal<SalesChannelItem[]>([
    {
      id: 1,
      brandName: 'Nova Climate Solutions',
      brandId: 1,
      code: 'SC-NOVA-EU',
      countries: ['Türkiye', 'Almanya', 'Birleşik Krallık', 'Fransa'],
      region: 'Avrupa',
      status: 'Aktif',
      description: 'Nova kurumsal iklimlendirme ve merkezi sistem dağıtım kanalı'
    },
    {
      id: 2,
      brandName: 'Orion Air Systems',
      brandId: 2,
      code: 'SC-ORION-CE',
      countries: ['Almanya', 'Avusturya', 'İsviçre'],
      region: 'Avrupa',
      status: 'Aktif',
      description: 'Orta Avrupa iklimlendirme ve yetkili satış distribütörü'
    },
    {
      id: 3,
      brandName: 'Nova HVAC Americas Network',
      brandId: 1,
      code: 'SC-NOVA-AMER',
      countries: ['Amerika Birleşik Devletleri', 'Kanada'],
      region: 'Amerika',
      status: 'Aktif',
      description: 'Kuzey Amerika ticari bina ve VRF projelendirme kanalı'
    },
    {
      id: 4,
      brandName: 'Orion APAC Commercial',
      brandId: 2,
      code: 'SC-APAC-04',
      countries: ['Japonya', 'Avustralya', 'Singapur'],
      region: 'Asya Pasifik',
      status: 'Aktif',
      description: 'Asya Pasifik bölgesi merkezi soğutma ve distribütör ağı'
    }
  ]);

  channels = this.channelsList.asReadonly();

  addChannel(channel: Omit<SalesChannelItem, 'id'>) {
    const current = this.channelsList();
    const newId = current.length > 0 ? Math.max(...current.map(c => c.id)) + 1 : 1;
    this.channelsList.set([{ ...channel, id: newId }, ...current]);
  }

  updateChannel(id: number, updated: Partial<SalesChannelItem>) {
    this.channelsList.set(
      this.channelsList().map(c => 
        c.id === id ? { ...c, ...updated } : c
      )
    );
  }

  deleteChannel(id: number) {
    this.channelsList.set(this.channelsList().filter(c => c.id !== id));
  }

  toggleStatus(id: number) {
    this.channelsList.set(
      this.channelsList().map(c => 
        c.id === id ? { ...c, status: c.status === 'Aktif' ? 'Pasif' : 'Aktif' } : c
      )
    );
  }
}
