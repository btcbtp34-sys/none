import { Injectable, signal } from '@angular/core';

export interface SalesChannelItem {
  id: number;
  brandName: string;
  code: string;
  countries: string[];
  region?: string;
  products: string[];
  status: 'Aktif' | 'Pasif';
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SalesChannelService {
  // Available global products catalog that can be selected
  public readonly availableProducts: string[] = [
    'AF4300A A (R410) (AF4300A A (R410))',
    'AF5300A (AF5300A)',
    'AF5300A C (AF5300A C)',
    'AF5301A (AF5301A)',
    'AF5301A C (AF5301A C)',
    'AF6300A C (AF6300A C)',
    'MDCI (MDCI)'
  ];

  private channelsList = signal<SalesChannelItem[]>([
    {
      id: 1,
      brandName: 'Nova Climate Solutions',
      code: 'SC-NOVA-EU',
      countries: ['Türkiye', 'Almanya', 'Birleşik Krallık', 'Fransa'],
      region: 'Avrupa',
      products: ['AF4300A A (R410) (AF4300A A (R410))', 'AF5300A (AF5300A)', 'MDCI (MDCI)'],
      status: 'Aktif',
      description: 'Nova kurumsal iklimlendirme ve merkezi sistem dağıtım kanalı'
    },
    {
      id: 2,
      brandName: 'Orion Air Systems',
      code: 'SC-ORION-CE',
      countries: ['Almanya', 'Avusturya', 'İsviçre'],
      region: 'Avrupa',
      products: ['AF5300A C (AF5300A C)', 'AF5301A (AF5301A)', 'AF5301A C (AF5301A C)'],
      status: 'Aktif',
      description: 'Orta Avrupa iklimlendirme ve yetkili satış distribütörü'
    },
    {
      id: 3,
      brandName: 'Nova HVAC Americas Network',
      code: 'SC-NOVA-AMER',
      countries: ['Amerika Birleşik Devletleri', 'Kanada'],
      region: 'Amerika',
      products: ['AF6300A C (AF6300A C)', 'MDCI (MDCI)'],
      status: 'Aktif',
      description: 'Kuzey Amerika ticari bina ve VRF projelendirme kanalı'
    },
    {
      id: 4,
      brandName: 'Orion APAC Commercial',
      code: 'SC-APAC-04',
      countries: ['Japonya', 'Avustralya', 'Singapur'],
      region: 'Asya Pasifik',
      products: ['AF4300A A (R410) (AF4300A A (R410))', 'AF6300A C (AF6300A C)'],
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
