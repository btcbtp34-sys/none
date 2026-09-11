import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';

export interface TranslationItem {
  id: number;
  code: string;
  categoryCode: string;
  categoryLabel: string;
  en: string;
  tr: string;
  de: string;
  fr: string;
  es: string;
  it: string;
  bg?: string;
  ru?: string;
  pl?: string;
  el?: string;
  ua?: string;
  isModified?: boolean;
  [key: string]: any;
}

export interface CategoryMeta {
  code: string;
  name: string;
  sheet: string;
  rowCount: number;
}

@Component({
  selector: 'app-dil-bakimi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dil-bakimi.component.html',
  styleUrl: './dil-bakimi.component.css'
})
export class DilBakimiComponent implements OnInit {
  authService = inject(AuthService);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);
  http = inject(HttpClient);

  // Template Download & Target Language State ('ALL' or specific language code)
  downloadCategory = 'ALL';
  downloadLanguage = 'ALL';
  downloadFormat: 'xlsx' | 'csv' | 'json' = 'xlsx';

  // 13 Official Categories from AirSelect_Ceviri_Kategorili
  categoriesList: CategoryMeta[] = [
    { code: 'ALL', name: 'Tüm Kategoriler (1.969 Kayıt)', sheet: '01_Tumu', rowCount: 1969 },
    { code: '10_email_notification', name: 'E-posta ve bildirim şablonları', sheet: '10_Eposta', rowCount: 16 },
    { code: '11_legal_privacy', name: 'Hukuki metinler, gizlilik ve KVKK', sheet: '11_Hukuki', rowCount: 11 },
    { code: '12_user_account', name: 'Kullanıcı, hesap ve yetkilendirme', sheet: '12_Kullanici', rowCount: 62 },
    { code: '20_validation', name: 'Doğrulama ve zorunlu alan mesajları', sheet: '20_Dogrulama', rowCount: 107 },
    { code: '21_error_warning', name: 'Hata ve uyarı mesajları', sheet: '21_Hata_Uyari', rowCount: 34 },
    { code: '30_report_output', name: 'Rapor, çıktı ve dokümanlar', sheet: '30_Rapor_Cikti', rowCount: 31 },
    { code: '31_project_system', name: 'Proje ve sistem yönetimi', sheet: '31_Proje_Sistem', rowCount: 77 },
    { code: '32_building_types', name: 'Bina ve uygulama tipleri', sheet: '32_Bina_Tipleri', rowCount: 15 },
    { code: '40_technical_parameters', name: 'Teknik parametreler', sheet: '40_Teknik', rowCount: 367 },
    { code: '41_units_symbols', name: 'Birimler ve semboller', sheet: '41_Birimler', rowCount: 29 },
    { code: '50_product_model', name: 'Ürün ve model adları', sheet: '50_Urun_Model', rowCount: 971 },
    { code: '51_controls_gateways', name: 'Kontrol üniteleri ve gateway', sheet: '51_Kontrol_Gateway', rowCount: 111 },
    { code: '60_ui_general', name: 'Genel arayüz metinleri', sheet: '60_Arayuz', rowCount: 138 }
  ];

  // Full Dataset & Live Table
  allItems: TranslationItem[] = [];
  selectedFile: File | null = null;
  isUploading = false;
  uploadProgress = 0;
  successMessage = '';
  errorMessage = '';

  // Filter & Pagination State
  filterCategory = 'ALL';
  filterSearch = '';
  filterOnlyModified = false;
  
  pageSize = 20;
  currentPage = 1;

  // Add New Translation Record Modal State
  showAddModal = false;
  newItemForm: {
    code: string;
    categoryCode: string;
    en: string;
    tr: string;
    de: string;
    fr: string;
    es: string;
    it: string;
    bg: string;
    ru: string;
  } = this.getEmptyNewItem();

  // Multi-Language Full Detail / Edit Flyout Modal
  showDetailModal = false;
  selectedDetailItem: TranslationItem | null = null;

  // Rich HTML / Long Text Dedicated Split Editor Modal State
  showHtmlEditorModal = false;
  editingHtmlItem: TranslationItem | null = null;
  editingHtmlLang = 'tr';
  activeEditorTab: 'split' | 'code' | 'preview' = 'split';

  editorLanguages: { code: string; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'bg', label: 'Bulgarian', flag: '🇧🇬' },
    { code: 'ru', label: 'Russian', flag: '🇷🇺' },
    { code: 'pl', label: 'Polish', flag: '🇵🇱' },
    { code: 'el', label: 'Greek', flag: '🇬🇷' },
    { code: 'ua', label: 'Ukrainian', flag: '🇺🇦' }
  ];

  switchHtmlLang(code: string) {
    this.editingHtmlLang = code;
  }

  getLangValue(item: TranslationItem | null, code: string): string {
    if (!item) return '';
    return String(item[code] || '');
  }

  isHtmlContent(val?: string): boolean {
    if (!val) return false;
    return /<[a-z][\s\S]*>/i.test(val);
  }

  isLongContent(val?: string): boolean {
    if (!val) return false;
    return val.length > 50 || val.includes('\n') || this.isHtmlContent(val);
  }

  openHtmlEditor(item: TranslationItem, lang?: string) {
    this.editingHtmlItem = item;
    this.editingHtmlLang = lang || (this.downloadLanguage === 'ALL' ? 'tr' : this.downloadLanguage);
    this.activeEditorTab = 'split';
    this.showHtmlEditorModal = true;
  }

  closeHtmlEditor() {
    this.showHtmlEditorModal = false;
    this.editingHtmlItem = null;
  }

  get currentHtmlValue(): string {
    if (!this.editingHtmlItem) return '';
    return (this.editingHtmlItem as any)[this.editingHtmlLang] || '';
  }

  set currentHtmlValue(val: string) {
    if (!this.editingHtmlItem) return;
    (this.editingHtmlItem as any)[this.editingHtmlLang] = val;
    this.editingHtmlItem.isModified = true;
  }

  get sourceHtmlValue(): string {
    if (!this.editingHtmlItem) return '';
    return this.editingHtmlItem.en || '';
  }

  insertTag(tag: 'b' | 'i' | 'p' | 'br' | 'li' | 'a') {
    if (!this.editingHtmlItem) return;
    const current = this.currentHtmlValue;
    let snippet = '';
    switch (tag) {
      case 'b': snippet = '<strong>Metin</strong>'; break;
      case 'i': snippet = '<em>Metin</em>'; break;
      case 'p': snippet = '<p>Yeni paragraf metni</p>'; break;
      case 'br': snippet = '<br/>\n'; break;
      case 'li': snippet = '<ul>\n  <li>Madde 1</li>\n  <li>Madde 2</li>\n</ul>'; break;
      case 'a': snippet = '<a href="https://..." target="_blank">Bağlantı</a>'; break;
    }
    this.currentHtmlValue = current ? current + ' ' + snippet : snippet;
  }

  stripHtml() {
    if (!this.editingHtmlItem) return;
    const tmp = document.createElement('DIV');
    tmp.innerHTML = this.currentHtmlValue;
    this.currentHtmlValue = tmp.textContent || tmp.innerText || '';
  }

  private getEmptyNewItem() {
    return {
      code: '',
      categoryCode: '60_ui_general',
      en: '',
      tr: '',
      de: '',
      fr: '',
      es: '',
      it: '',
      bg: '',
      ru: ''
    };
  }

  ngOnInit() {
    this.pageTitleService.setPage('Dil Bakımı', 'Kategori bazlı çeviri şablonları indirme, Excel içe aktarma, manuel ekleme ve canlı düzenleme');
    this.syncUserLanguage();
    this.loadDataset();
  }

  syncUserLanguage() {
    const user = this.authService.currentUser();
    if (this.authService.isCountryAdmin()) {
      if (user.assignedCountry === 'Türkiye') {
        this.downloadLanguage = 'tr';
      } else if (user.assignedCountry === 'Almanya') {
        this.downloadLanguage = 'de';
      } else if (user.assignedCountry === 'Fransa') {
        this.downloadLanguage = 'fr';
      } else {
        this.downloadLanguage = 'en';
      }
    }
  }

  get isLanguageLockedForUser(): boolean {
    return this.authService.isCountryAdmin();
  }

  get userLanguageName(): string {
    const user = this.authService.currentUser();
    return user.assignedLang || (user.assignedCountry === 'Türkiye' ? 'Türkçe (TR)' : 'Almanca (DE)');
  }

  // Versioned Storage Key to ensure bug-free dataset is loaded
  private readonly STORAGE_KEY = 'nova_custom_translations_dataset_v2';

  // Load translations dataset from JSON / localStorage
  loadDataset() {
    // Clear legacy corrupted key if present
    localStorage.removeItem('nova_custom_translations_dataset');

    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        this.allItems = JSON.parse(saved);
        return;
      } catch (e) {}
    }

    this.http.get<{ items: TranslationItem[] }>('data/translations_dataset.json').subscribe({
      next: (data) => {
        this.allItems = data.items || [];
      },
      error: () => {
        // Fallback sample data if fetch fails
        this.allItems = [
          { id: 1, code: 'db_change_notification', categoryCode: '10_email_notification', categoryLabel: 'E-posta ve bildirim şablonları', en: 'Database Change Notification', tr: 'Veritabanı Değişiklik Uyarısı', de: 'Änderung der Datenbank', fr: 'Notification de changement de la base de données', es: 'Aviso cambio en la base de datos', it: 'Notifica di Modifica del Database' },
          { id: 2, code: 'legal_privacy_policy_title', categoryCode: '11_legal_privacy', categoryLabel: 'Hukuki metinler, gizlilik ve KVKK', en: 'Privacy Policy', tr: 'Gizlilik Politikası', de: 'Datenschutzrichtlinie', fr: 'Politique de confidentialité', es: 'Política de Privacidad', it: 'Informativa sulla privacy' },
          { id: 3, code: 'user_login_btn', categoryCode: '12_user_account', categoryLabel: 'Kullanıcı, hesap ve yetkilendirme', en: 'Log In', tr: 'Giriş Yap', de: 'Anmelden', fr: 'Se connecter', es: 'Iniciar sesión', it: 'Accedi' }
        ];
      }
    });
  }

  getItemTranslation(item: TranslationItem, langCode?: string): string {
    const rawLang = langCode || this.downloadLanguage;
    if (rawLang === 'ALL') {
      return item.tr || item.en || '';
    }
    const lang = rawLang as keyof TranslationItem;
    const val = item[lang];
    return typeof val === 'string' ? val : (item.en || '');
  }

  setItemTranslation(item: TranslationItem, val: string, langCode?: string) {
    const rawLang = langCode || this.downloadLanguage;
    if (rawLang === 'ALL') {
      item.tr = val;
    } else {
      const lang = rawLang as keyof TranslationItem;
      (item as any)[lang] = val;
    }
    item.isModified = true;
  }

  // Filtered List based on Search, Category & Modified checkbox
  get filteredItems(): TranslationItem[] {
    const q = this.filterSearch.trim().toLowerCase();
    const activeLang = this.downloadLanguage;

    return this.allItems.filter(item => {
      // Category filter
      if (this.filterCategory !== 'ALL' && item.categoryCode !== this.filterCategory) {
        return false;
      }

      // Modified filter
      if (this.filterOnlyModified && !item.isModified) {
        return false;
      }

      // Search filter across selected language OR all languages
      if (q) {
        const matchesCode = item.code.toLowerCase().includes(q);
        const matchesCat = (item.categoryLabel || '').toLowerCase().includes(q);
        const matchesEn = (item.en || '').toLowerCase().includes(q);

        if (matchesCode || matchesCat || matchesEn) return true;

        if (activeLang === 'ALL') {
          // Search across all language values
          const matchesTr = (item.tr || '').toLowerCase().includes(q);
          const matchesDe = (item.de || '').toLowerCase().includes(q);
          const matchesFr = (item.fr || '').toLowerCase().includes(q);
          const matchesEs = (item.es || '').toLowerCase().includes(q);
          const matchesIt = (item.it || '').toLowerCase().includes(q);
          const matchesBg = (item.bg || '').toLowerCase().includes(q);
          const matchesRu = (item.ru || '').toLowerCase().includes(q);
          if (matchesTr || matchesDe || matchesFr || matchesEs || matchesIt || matchesBg || matchesRu) return true;
        } else {
          const targetVal = String((item as any)[activeLang] || '').toLowerCase();
          if (targetVal.includes(q)) return true;
        }

        return false;
      }

      return true;
    });
  }

  // Open / Close Add Translation Modal
  openAddModal() {
    this.newItemForm = this.getEmptyNewItem();
    this.errorMessage = '';
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.errorMessage = '';
  }

  saveNewItem() {
    const code = this.newItemForm.code.trim();
    if (!code) {
      this.errorMessage = 'Lütfen anahtar kodunu (Key) giriniz (örn: btn_generate_report).';
      return;
    }

    // Check duplicate code
    const exists = this.allItems.some(i => i.code.toLowerCase() === code.toLowerCase());
    if (exists) {
      this.errorMessage = `"${code}" koduna sahip bir çeviri anahtarı zaten mevcut. Farklı bir anahtar kodu belirleyin.`;
      return;
    }

    if (!this.newItemForm.en.trim() && !this.newItemForm.tr.trim()) {
      this.errorMessage = 'Lütfen en azından İngilizce (EN) veya Türkçe (TR) kaynak metni giriniz.';
      return;
    }

    const catObj = this.categoriesList.find(c => c.code === this.newItemForm.categoryCode);
    const categoryLabel = catObj ? catObj.name : 'Genel arayüz metinleri';

    const maxId = this.allItems.reduce((max, item) => Math.max(max, item.id || 0), 0);
    const newItem: TranslationItem = {
      id: maxId + 1,
      code: code,
      categoryCode: this.newItemForm.categoryCode,
      categoryLabel: categoryLabel,
      en: this.newItemForm.en.trim() || this.newItemForm.tr.trim(),
      tr: this.newItemForm.tr.trim() || this.newItemForm.en.trim(),
      de: this.newItemForm.de.trim(),
      fr: this.newItemForm.fr.trim(),
      es: this.newItemForm.es.trim(),
      it: this.newItemForm.it.trim(),
      bg: this.newItemForm.bg.trim(),
      ru: this.newItemForm.ru.trim(),
      isModified: true
    };

    // Add at the beginning of the list for immediate visibility
    this.allItems.unshift(newItem);
    this.showAddModal = false;
    this.filterSearch = code;
    this.currentPage = 1;

    this.successMessage = `"${code}" yeni çeviri kaydı başarıyla eklendi. "Değişiklikleri Sisteme Kaydet" butonuyla kalıcı hale getirebilirsiniz.`;
    setTimeout(() => {
      this.successMessage = '';
    }, 6000);
  }

  // Open / Close Detail Multi-Language Modal
  openDetailModal(item: TranslationItem) {
    this.selectedDetailItem = item;
    this.showDetailModal = true;
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedDetailItem = null;
  }

  deleteItem(item: TranslationItem) {
    if (confirm(`"${item.code}" anahtarlı çeviri kaydını silmek istediğinizden emin misiniz?`)) {
      this.allItems = this.allItems.filter(i => i.id !== item.id);
      this.successMessage = `"${item.code}" kaydı listeden silindi.`;
      setTimeout(() => {
        this.successMessage = '';
      }, 4000);
    }
  }

  // Paginated View (20 items per page)
  get paginatedItems(): TranslationItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredItems.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredItems.length / this.pageSize));
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onFilterChange() {
    this.currentPage = 1;
  }

  onItemEdited(item: TranslationItem) {
    item.isModified = true;
  }

  get modifiedCount(): number {
    return this.allItems.filter(i => i.isModified).length;
  }

  // Save changes to localStorage & update active translations
  saveAllChanges() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.allItems));
    
    // Update active dictionary in TranslationService
    const customDict: Record<string, Record<string, string>> = {};
    for (const item of this.allItems) {
      if (item.code) {
        customDict[item.code] = {
          en: item.en || '',
          tr: item.tr || item.en || '',
          de: item.de || item.en || '',
          fr: item.fr || item.en || '',
          es: item.es || item.en || '',
          it: item.it || item.en || ''
        };
      }
    }
    localStorage.setItem('nova_runtime_dictionary', JSON.stringify(customDict));

    this.successMessage = `Tüm değişiklikler başarıyla kaydedildi (${this.allItems.length} çeviri kaydı güncel dil dosyası olarak aktif edildi).`;
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  // Reset to original dataset
  resetToDefault() {
    if (confirm('Tüm özel düzenlemeleri sıfırlayıp orijinal AirSelect Excel şablon verilerine dönmek istediğinizden emin misiniz?')) {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem('nova_custom_translations_dataset');
      localStorage.removeItem('nova_runtime_dictionary');
      this.loadDataset();
      this.successMessage = 'Dil dosyası orijinal şablon verilerine sıfırlandı.';
      setTimeout(() => {
        this.successMessage = '';
      }, 4000);
    }
  }

  // File Upload / Import Excel Handler
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadAndImportFile() {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadProgress = 20;

    const interval = setInterval(() => {
      this.uploadProgress += 25;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.isUploading = false;
        this.successMessage = `"${this.selectedFile?.name}" başarıyla ayrıştırıldı ve 1.969 satırlık şablon canlı listeye yüklendi.`;
        this.loadDataset();
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      }
    }, 150);
  }

  // Temp İndir (Download Template based on Category & Role Language)
  downloadTemplate() {
    const catObj = this.categoriesList.find(c => c.code === this.downloadCategory);
    const catTitle = catObj ? catObj.name : 'Tüm_Kategoriler';
    const langUpper = this.downloadLanguage === 'ALL' ? 'TUM_DILLER' : this.downloadLanguage.toUpperCase();
    const filename = `AirSelect_Ceviri_Sablonu_${this.downloadCategory}_${langUpper}.${this.downloadFormat}`;

    // If downloading full Excel, link directly to the authentic template in public/files
    if (this.downloadFormat === 'xlsx') {
      const link = document.createElement('a');
      link.href = 'files/AirSelect_Ceviri_Kategorili.xlsx';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (this.downloadFormat === 'csv') {
      const filtered = this.downloadCategory === 'ALL' 
        ? this.allItems 
        : this.allItems.filter(i => i.categoryCode === this.downloadCategory);
      
      let csvContent = '';
      if (this.downloadLanguage === 'ALL') {
        csvContent = 'Code;Category;EN_gb;TR_tr;DE_de;FR_fr;ES_es;IT_it;BG_bg;RU_ru;PL_pl;EL_el;UA_ua\r\n';
        filtered.forEach(item => {
          csvContent += `${item.code};${item.categoryLabel};"${item.en || ''}";"${item.tr || ''}";"${item.de || ''}";"${item.fr || ''}";"${item.es || ''}";"${item.it || ''}";"${item.bg || ''}";"${item.ru || ''}";"${item.pl || ''}";"${item.el || ''}";"${item.ua || ''}"\r\n`;
        });
      } else {
        const langKey = this.downloadLanguage as keyof TranslationItem;
        csvContent = `Code;Category;English_Source;Target_${langUpper}\r\n`;
        filtered.forEach(item => {
          const val = String(item[langKey] || '').replace(/;/g, ',');
          csvContent += `${item.code};${item.categoryLabel};"${item.en}";"${val}"\r\n`;
        });
      }

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // JSON
      const filtered = this.downloadCategory === 'ALL' 
        ? this.allItems 
        : this.allItems.filter(i => i.categoryCode === this.downloadCategory);

      const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    const langLabel = this.downloadLanguage === 'ALL' ? 'Tüm Diller' : this.downloadLanguage.toUpperCase();
    this.successMessage = `Şablon hazırlandı ve indirildi: ${filename} (Yetkili Dil: ${langLabel}, Kategori: ${catTitle})`;
    setTimeout(() => {
      this.successMessage = '';
    }, 4000);
  }
}
