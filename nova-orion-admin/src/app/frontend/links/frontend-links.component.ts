import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../services/translation.service';
import { ProjectService } from '../../services/project.service';

export interface PortalLink {
  id: string;
  category: string;
  title: string;
  url: string;
  description: string;
  badge: string;
  isExternal: boolean;
}

@Component({
  selector: 'app-frontend-links',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './frontend-links.component.html',
  styleUrl: './frontend-links.component.css'
})
export class FrontendLinksComponent {
  tsService = inject(TranslationService);
  projectService = inject(ProjectService);

  searchQuery = '';
  selectedCategory = 'all';

  categories = [
    { id: 'all', name: 'Tümü' },
    { id: 'portals', name: 'Kurumsal Portallar' },
    { id: 'docs', name: 'Dokümantasyon & Standartlar' },
    { id: 'tools', name: 'Sistem Araçları & API' },
    { id: 'support', name: 'Destek & İletişim' }
  ];

  links: PortalLink[] = [
    {
      id: 'l1',
      category: 'portals',
      title: 'Project Nova Global Portal',
      url: 'https://nova-enterprise.internal/portal',
      description: 'Nova sistem projeleri, saha operasyonları ve merkezi veri izleme ana kapısı.',
      badge: 'Portal',
      isExternal: true
    },
    {
      id: 'l2',
      category: 'portals',
      title: 'Project Orion Enterprise Hub',
      url: 'https://orion-cloud.internal/dashboard',
      description: 'Orion çok uluslu veri akışı, bulut entegrasyonu ve telemetri analiz platformu.',
      badge: 'Hub',
      isExternal: true
    },
    {
      id: 'l3',
      category: 'portals',
      title: 'B2B Partner & Bayi Portalı',
      url: 'https://partner.nova-orion.com',
      description: 'Onaylı iş ortakları ve yetkili bayiler için sipariş, stok ve teklif modülü.',
      badge: 'B2B',
      isExternal: true
    },
    {
      id: 'l4',
      category: 'docs',
      title: 'Saha Kurulum & Montaj Kılavuzu',
      url: 'https://docs.nova-orion.com/installation-guide',
      description: 'Teknik ekipler için standart montaj kuralları, devreye alma ve güvenlik talimatları.',
      badge: 'Kılavuz',
      isExternal: true
    },
    {
      id: 'l5',
      category: 'docs',
      title: 'Global Enerji & Verimlilik Standartları',
      url: 'https://standards.nova-orion.com/energy-compliance',
      description: 'AB ve uluslararası iklimlendirme regülasyonları, ErP ve EcoDesign direktifleri.',
      badge: 'Standart',
      isExternal: true
    },
    {
      id: 'l6',
      category: 'tools',
      title: 'Nova & Orion REST API Dokümantasyonu',
      url: 'https://api.nova-orion.com/v2/swagger',
      description: '3. parti yazılım entegrasyonları için REST/JSON API endpointleri ve Swagger arayüzü.',
      badge: 'API / Dev',
      isExternal: true
    },
    {
      id: 'l7',
      category: 'tools',
      title: 'Telemetri & Canlı Durum İzleme (Status)',
      url: 'https://status.nova-orion.com',
      description: 'Sunucu uptime durumu, API yanıt süreleri ve planlı bakım duyuruları.',
      badge: 'Canlı Durum',
      isExternal: true
    },
    {
      id: 'l8',
      category: 'support',
      title: 'Kurumsal Müşteri Destek Masası (Helpdesk)',
      url: 'https://support.nova-orion.com/tickets',
      description: '7/24 teknik arıza kaydı oluşturma, çağrı takibi ve mühendislik destek hattı.',
      badge: 'Destek',
      isExternal: true
    }
  ];

  get filteredLinks(): PortalLink[] {
    const q = this.searchQuery.toLowerCase().trim();
    return this.links.filter(link => {
      const matchesCat = this.selectedCategory === 'all' || link.category === this.selectedCategory;
      const matchesQuery = !q ||
        link.title.toLowerCase().includes(q) ||
        link.description.toLowerCase().includes(q) ||
        link.url.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }

  copyLink(url: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      alert(this.tsService.translate('Bağlantı panoya kopyalandı!') + `\n${url}`);
    }
  }

  openLink(url: string) {
    window.open(url, '_blank');
  }
}
