import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../services/translation.service';
import { ProjectService } from '../../services/project.service';

export interface DownloadItem {
  id: string;
  title: string;
  category: string;
  format: 'PDF' | 'ZIP' | 'DWG' | 'EXE';
  size: string;
  date: string;
  platform: 'nova' | 'orion' | 'all';
  downloadCount: number;
}

@Component({
  selector: 'app-frontend-downloads',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './frontend-downloads.component.html',
  styleUrl: './frontend-downloads.component.css'
})
export class FrontendDownloadsComponent {
  tsService = inject(TranslationService);
  projectService = inject(ProjectService);

  searchQuery = '';
  selectedCategory = 'Tümü';
  downloadingId: string | null = null;
  downloadSuccessMessage = '';

  downloads: DownloadItem[] = [
    {
      id: 'd1',
      title: 'Project Nova 2026 Ürün & Sistem Genel Kataloğu',
      category: 'Katalog',
      format: 'PDF',
      size: '14.2 MB',
      date: '01.09.2026',
      platform: 'nova',
      downloadCount: 1240
    },
    {
      id: 'd2',
      title: 'Project Orion Kurumsal Platform Entegrasyon Rehberi',
      category: 'Kılavuz',
      format: 'PDF',
      size: '6.8 MB',
      date: '28.08.2026',
      platform: 'orion',
      downloadCount: 890
    },
    {
      id: 'd3',
      title: 'Sistem Hesaplama & Borulama CAD Çizim Kütüphanesi',
      category: 'Teknik Çizim',
      format: 'DWG',
      size: '42.5 MB',
      date: '15.08.2026',
      platform: 'all',
      downloadCount: 3120
    },
    {
      id: 'd4',
      title: 'Merkezi Kontrolör Firmware & Güncelleme Paketi v3.2',
      category: 'Yazılım',
      format: 'ZIP',
      size: '128 MB',
      date: '05.09.2026',
      platform: 'all',
      downloadCount: 540
    },
    {
      id: 'd5',
      title: 'Enerji Verimliliği & Standart Uyumluluk Sertifikaları',
      category: 'Sertifika',
      format: 'PDF',
      size: '3.4 MB',
      date: '12.07.2026',
      platform: 'all',
      downloadCount: 760
    }
  ];

  get filteredDownloads(): DownloadItem[] {
    const currentPlatform = this.projectService.currentProject().id;
    return this.downloads.filter(item => {
      const matchPlatform = item.platform === 'all' || item.platform === currentPlatform;
      const matchCategory = this.selectedCategory === 'Tümü' || item.category === this.selectedCategory;
      const matchSearch = !this.searchQuery.trim() ||
        item.title.toLowerCase().includes(this.searchQuery.toLowerCase().trim()) ||
        item.category.toLowerCase().includes(this.searchQuery.toLowerCase().trim());
      return matchPlatform && matchCategory && matchSearch;
    });
  }

  downloadFile(item: DownloadItem) {
    this.downloadingId = item.id;
    setTimeout(() => {
      item.downloadCount++;
      this.downloadingId = null;
      this.downloadSuccessMessage = `${item.title} indirildi.`;
      setTimeout(() => {
        this.downloadSuccessMessage = '';
      }, 3000);
    }, 1000);
  }
}
