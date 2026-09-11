import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SystemSettingsService, BackupSnapshotItem } from '../../services/system-settings.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-sistem-yedekleme',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sistem-yedekleme.component.html',
  styleUrl: './sistem-yedekleme.component.css'
})
export class SistemYedeklemeComponent implements OnInit {
  settingsService = inject(SystemSettingsService);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);

  showRestoreModal = false;
  selectedBackup: BackupSnapshotItem | null = null;
  notificationMessage = '';
  selectedBackupType: 'Tam Sistem Yedeği' | 'Veritabanı & Konfigürasyon' | 'Dil & İçerik Yedeği' = 'Tam Sistem Yedeği';

  backupTypes: ('Tam Sistem Yedeği' | 'Veritabanı & Konfigürasyon' | 'Dil & İçerik Yedeği')[] = [
    'Tam Sistem Yedeği',
    'Veritabanı & Konfigürasyon',
    'Dil & İçerik Yedeği'
  ];

  ngOnInit() {
    this.pageTitleService.setPage('Sistem Yedek & Geri Yükle', 'Veritabanı anlık görüntüleri, geri yükleme noktaları ve yedek yönetimi');
  }

  takeBackupNow() {
    const backup = this.settingsService.createBackup(this.selectedBackupType);
    this.showNotification(this.tsService.translate('Yeni yedek anlık görüntüsü başarıyla oluşturuldu!'));
  }

  openRestoreModal(item: BackupSnapshotItem) {
    this.selectedBackup = item;
    this.showRestoreModal = true;
  }

  closeRestoreModal() {
    this.showRestoreModal = false;
    this.selectedBackup = null;
  }

  confirmRestore() {
    if (!this.selectedBackup) return;
    const confirmMsg = this.tsService.translate('Yedekten geri yükleme işlemi tüm mevcut verilerin üzerine yazacaktır. Devam etmek istediğinize emin misiniz?');
    if (confirm(confirmMsg)) {
      this.closeRestoreModal();
      this.showNotification(this.tsService.translate('Sistem başarıyla geri yüklendi!'));
    }
  }

  deleteBackup(id: number) {
    if (confirm(this.tsService.translate('Bu yedek dosyasını silmek istediğinizden emin misiniz?'))) {
      this.settingsService.deleteBackup(id);
    }
  }

  downloadMockBackup(item: BackupSnapshotItem) {
    // Generate dummy JSON/file download
    const content = JSON.stringify({
      backupName: item.name,
      createdAt: item.createdAt,
      type: item.type,
      checksum: item.checksum,
      system: 'Nova Orion Industrial HVAC Platform v2.8'
    }, null, 2);

    const blob = new Blob([content], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.name.replace('.tar.gz', '.json').replace('.sql.gz', '.json');
    a.click();
    window.URL.revokeObjectURL(url);
  }

  showNotification(msg: string) {
    this.notificationMessage = msg;
    setTimeout(() => {
      this.notificationMessage = '';
    }, 4000);
  }
}
