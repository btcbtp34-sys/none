import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DownloadService, DownloadItem, DownloadRegion } from '../../services/download.service';
import { AuthService } from '../../services/auth.service';
import { RegionService } from '../../services/region.service';
import { CountryService, CountryItem } from '../../services/country.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-indirilenler',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './indirilenler.component.html',
  styleUrl: './indirilenler.component.css'
})
export class IndirilenlerComponent implements OnInit {
  downloadService = inject(DownloadService);
  authService = inject(AuthService);
  regionService = inject(RegionService);
  countryService = inject(CountryService);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);

  showModal = false;
  showCountryStatusModal = false;
  activeManagingItemId: number | null = null;
  isDragging = false;

  get activeManagingItem(): DownloadItem | null {
    if (!this.activeManagingItemId) return null;
    return this.downloadService.downloads().find(d => d.id === this.activeManagingItemId) || null;
  }

  // Search & Filter
  searchQuery = '';
  filterRegion = 'ALL';

  // Form Fields (Only Super Admin can upload)
  selectedFile: File | null = null;
  formTitle = '';
  formSize = '';
  formRegion: DownloadRegion = 'Global';
  formPermission: 'all' | 'logged_in' = 'all';

  ngOnInit() {
    this.pageTitleService.setPage('Downloads', 'Kullanıcı dokümanları, PDF rehberler ve indirilebilir dosyalar');
  }

  // Filtered downloads based on 3-tier roles
  get visibleDownloads(): DownloadItem[] {
    const user = this.authService.currentUser();
    const query = this.searchQuery.trim().toLowerCase();

    return this.downloadService.downloads().filter(item => {
      // 1. Role-based Scope Filtering
      if (this.authService.isCountryAdmin() && user.assignedCountry) {
        // Country Admin: Only sees files active for their country
        if (item.region !== 'Global' && item.region !== user.assignedRegion) return false;
        if (!this.downloadService.isCountryActiveForDownload(item, user.assignedCountry)) return false;
      } else if (this.authService.isRegionAdmin() && user.assignedRegion) {
        // Region Admin: Sees Global files and files assigned to their region
        if (item.region !== 'Global' && item.region !== user.assignedRegion) return false;
      }

      // 2. Region Dropdown Filter
      if (this.filterRegion !== 'ALL' && item.region !== this.filterRegion) {
        return false;
      }

      // 3. Search Query Filter
      if (query) {
        const matches = 
          item.title.toLowerCase().includes(query) ||
          item.filename.toLowerCase().includes(query) ||
          item.region.toLowerCase().includes(query) ||
          item.uploader.toLowerCase().includes(query);
        if (!matches) return false;
      }

      return true;
    });
  }

  // Countries for Regional Admin management
  get regionCountries(): string[] {
    const user = this.authService.currentUser();
    if (this.authService.isRegionAdmin() && user.assignedRegion) {
      return this.countryService.getCountriesByRegion(user.assignedRegion).map((c: CountryItem) => c.name);
    }
    if (this.activeManagingItem) {
      if (this.activeManagingItem.region === 'Global') {
        return this.countryService.countries().map((c: CountryItem) => c.name);
      }
      return this.countryService.getCountriesByRegion(this.activeManagingItem.region).map((c: CountryItem) => c.name);
    }
    return this.countryService.countries().map((c: CountryItem) => c.name);
  }

  openUploadModal() {
    // Only Super Admin can upload
    if (!this.authService.isSuperAdmin()) return;
    this.selectedFile = null;
    this.formTitle = '';
    this.formSize = '';
    this.formRegion = 'Global';
    this.formPermission = 'all';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedFile = null;
  }

  openCountryStatusModal(item: DownloadItem) {
    this.activeManagingItemId = item.id;
    this.showCountryStatusModal = true;
  }

  closeCountryStatusModal() {
    this.showCountryStatusModal = false;
    this.activeManagingItemId = null;
  }

  toggleCountryAvailability(countryName: string) {
    if (!this.activeManagingItemId) return;
    this.downloadService.toggleCountryStatus(this.activeManagingItemId, countryName);
  }

  isCountryActive(countryName: string): boolean {
    const item = this.activeManagingItem;
    if (!item) return true;
    return this.downloadService.isCountryActiveForDownload(item, countryName);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  handleFile(file: File) {
    this.selectedFile = file;
    if (!this.formTitle) {
      this.formTitle = file.name.replace(/\.[^/.]+$/, "");
    }
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    this.formSize = `${sizeInMB} MB`;
  }

  saveFile() {
    if (!this.authService.isSuperAdmin()) return;
    if (!this.formTitle.trim()) return;

    const fileName = this.selectedFile ? this.selectedFile.name : `${this.formTitle.trim()}.pdf`;
    const fileSize = this.formSize.trim() || '2.4 MB';

    this.downloadService.addDownload({
      title: this.formTitle.trim(),
      filename: fileName,
      size: fileSize,
      region: this.formRegion,
      permission: this.formPermission
    });

    this.closeModal();
  }

  deleteFile(id: number) {
    if (!this.authService.isSuperAdmin()) return;
    if (confirm('Bu dosyayı silmek istediğinizden emin misiniz?')) {
      this.downloadService.deleteDownload(id);
    }
  }

  downloadFile(item: DownloadItem) {
    alert(`"${item.title}" (${item.filename}) indiriliyor...`);
  }
}
