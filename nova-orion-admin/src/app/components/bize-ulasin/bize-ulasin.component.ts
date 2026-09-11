import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FaqService, FaqItem, ContentScope, ContentStatus } from '../../services/faq.service';
import { FaqCategoryService } from '../../services/faq-category.service';
import { RegionService } from '../../services/region.service';
import { CountryService } from '../../services/country.service';
import { AuthService } from '../../services/auth.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';

export interface CountryNode {
  code: string;
  name: string;
  checked: boolean;
}

export interface RegionNode {
  name: string;
  code: string;
  expanded: boolean;
  countries: CountryNode[];
}

@Component({
  selector: 'app-bize-ulasin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bize-ulasin.component.html',
  styleUrl: './bize-ulasin.component.css'
})
export class BizeUlasinComponent implements OnInit {
  faqService = inject(FaqService);
  faqCatService = inject(FaqCategoryService);
  regionService = inject(RegionService);
  countryService = inject(CountryService);
  authService = inject(AuthService);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);

  showModal = false;
  editingId: number | null = null;

  // Filters
  searchQuery = '';
  selectedCategory = 'Tüm Kategoriler';
  selectedStatus = 'Tüm Durumlar';
  selectedScopeFilter = 'Tüm Kapsamlar';

  // Form State
  formTitle = '';
  formCategory = '';
  formContactInfo = '';
  formReferenceUrl = '';

  // Scope & Country Treeview State (Global open, regions collapsed by default)
  treeSearch = '';
  globalExpanded = true;
  regionTree: RegionNode[] = [];

  ngOnInit() {
    this.pageTitleService.setPage('Bize Ulaşın', 'Teknik destek, bayi ve müşteri hizmetleri iletişim kanalları yönetimi');
    this.initRegionTree();
  }

  getInitialTreeData(): RegionNode[] {
    return [
      {
        name: 'Avrupa',
        code: 'EU',
        expanded: false,
        countries: [
          { code: 'DE', name: 'Almanya', checked: true },
          { code: 'ES', name: 'İspanya', checked: true },
          { code: 'FR', name: 'Fransa', checked: true },
          { code: 'IT', name: 'İtalya', checked: true },
          { code: 'TR', name: 'Türkiye', checked: true },
          { code: 'GB', name: 'Birleşik Krallık', checked: true },
          { code: 'NL', name: 'Hollanda', checked: true },
          { code: 'AT', name: 'Avusturya', checked: true },
          { code: 'PL', name: 'Polonya', checked: true },
          { code: 'CH', name: 'İsviçre', checked: true }
        ]
      },
      {
        name: 'Amerika',
        code: 'AMER',
        expanded: false,
        countries: [
          { code: 'US', name: 'Amerika Birleşik Devletleri', checked: true },
          { code: 'CA', name: 'Kanada', checked: true },
          { code: 'BR', name: 'Brezilya', checked: true },
          { code: 'MX', name: 'Meksika', checked: true },
          { code: 'AR', name: 'Arjantin', checked: true }
        ]
      },
      {
        name: 'Asya Pasifik',
        code: 'APAC',
        expanded: false,
        countries: [
          { code: 'JP', name: 'Japonya', checked: true },
          { code: 'CN', name: 'Çin', checked: true },
          { code: 'KR', name: 'Güney Kore', checked: true },
          { code: 'AU', name: 'Avustralya', checked: true },
          { code: 'SG', name: 'Singapur', checked: true },
          { code: 'IN', name: 'Hindistan', checked: true }
        ]
      },
      {
        name: 'Orta Doğu & Afrika',
        code: 'MENA',
        expanded: false,
        countries: [
          { code: 'AE', name: 'Birleşik Arap Emirlikleri', checked: true },
          { code: 'SA', name: 'Suudi Arabistan', checked: true },
          { code: 'EG', name: 'Mısır', checked: true },
          { code: 'QA', name: 'Katar', checked: true }
        ]
      }
    ];
  }

  initRegionTree(selectedCountries?: string[], scope?: ContentScope, targetRegion?: string, targetCountry?: string) {
    this.regionTree = this.getInitialTreeData();
    const user = this.authService.currentUser();

    if (this.authService.isCountryAdmin() && user.assignedCountry) {
      const assigned = user.assignedCountry.toLowerCase();
      this.regionTree.forEach(r => {
        r.countries.forEach(c => {
          c.checked = c.name.toLowerCase() === assigned;
        });
        r.expanded = r.countries.some(c => c.checked);
      });
      return;
    }

    if (this.authService.isRegionAdmin() && user.assignedRegion) {
      const reg = user.assignedRegion.toLowerCase();
      this.regionTree.forEach(r => {
        const isUserRegion = r.name.toLowerCase().includes(reg) || reg.includes(r.name.toLowerCase());
        r.expanded = isUserRegion;
        r.countries.forEach(c => {
          c.checked = isUserRegion;
        });
      });
      return;
    }

    if (selectedCountries && selectedCountries.length > 0) {
      const set = new Set(selectedCountries.map(s => s.toLowerCase()));
      this.regionTree.forEach(r => {
        r.countries.forEach(c => {
          c.checked = set.has(c.name.toLowerCase());
        });
        if (r.countries.some(c => c.checked)) r.expanded = true;
      });
    } else if (scope === 'Ülke' && targetCountry) {
      this.regionTree.forEach(r => {
        r.countries.forEach(c => {
          c.checked = c.name.toLowerCase() === targetCountry.toLowerCase();
        });
        if (r.countries.some(c => c.checked)) r.expanded = true;
      });
    } else if (scope === 'Bölgesel' && targetRegion) {
      this.regionTree.forEach(r => {
        const match = r.name.toLowerCase().includes(targetRegion.toLowerCase()) || targetRegion.toLowerCase().includes(r.name.toLowerCase());
        r.expanded = match;
        r.countries.forEach(c => {
          c.checked = match;
        });
      });
    } else {
      this.selectAllTree();
    }
  }

  isGlobalChecked(): boolean {
    return this.regionTree.every(r => r.countries.every(c => c.checked));
  }

  isGlobalIndeterminate(): boolean {
    const total = this.regionTree.reduce((sum, r) => sum + r.countries.length, 0);
    const checked = this.regionTree.reduce((sum, r) => sum + r.countries.filter(c => c.checked).length, 0);
    return checked > 0 && checked < total;
  }

  toggleGlobal() {
    if (this.authService.isCountryAdmin()) return;
    const shouldCheck = !this.isGlobalChecked();
    this.regionTree.forEach(r => {
      r.countries.forEach(c => c.checked = shouldCheck);
    });
  }

  isRegionChecked(r: RegionNode): boolean {
    return r.countries.length > 0 && r.countries.every(c => c.checked);
  }

  isRegionIndeterminate(r: RegionNode): boolean {
    const checkedCount = r.countries.filter(c => c.checked).length;
    return checkedCount > 0 && checkedCount < r.countries.length;
  }

  toggleRegion(r: RegionNode) {
    if (this.authService.isCountryAdmin()) return;
    const shouldCheck = !this.isRegionChecked(r);
    r.countries.forEach(c => c.checked = shouldCheck);
  }

  toggleCountry(c: CountryNode) {
    if (this.authService.isCountryAdmin()) return;
    c.checked = !c.checked;
  }

  selectAllTree() {
    if (this.authService.isCountryAdmin()) return;
    this.regionTree.forEach(r => r.countries.forEach(c => c.checked = true));
  }

  clearTree() {
    if (this.authService.isCountryAdmin()) return;
    this.regionTree.forEach(r => r.countries.forEach(c => c.checked = false));
  }

  getSelectedCountries(): string[] {
    const list: string[] = [];
    this.regionTree.forEach(r => {
      r.countries.forEach(c => {
        if (c.checked) list.push(c.name);
      });
    });
    return list;
  }

  getCalculatedScope(): ContentScope {
    if (this.isGlobalChecked()) return 'Global';
    
    const fullRegions = this.regionTree.filter(r => this.isRegionChecked(r));
    const emptyRegions = this.regionTree.filter(r => r.countries.every(c => !c.checked));
    
    if (fullRegions.length === 1 && emptyRegions.length === (this.regionTree.length - 1)) {
      return 'Bölgesel';
    }

    return 'Ülke';
  }

  getSelectedScopeSummary(): string {
    const count = this.getSelectedCountries().length;
    const total = this.regionTree.reduce((sum, r) => sum + r.countries.length, 0);

    if (count === 0) return 'Hiçbir Ülke Seçilmedi';
    if (count === total) return 'Global (Tüm Dünya - 25 Ülke)';

    const scope = this.getCalculatedScope();
    if (scope === 'Bölgesel') {
      const fullRegion = this.regionTree.find(r => this.isRegionChecked(r));
      return `Bölgesel (${fullRegion?.name || 'Bölge'} - ${count} Ülke)`;
    }

    if (count === 1) {
      return `Ülke: ${this.getSelectedCountries()[0]}`;
    }

    return `Özel Ülke Kapsamı (${count} Ülke Seçildi)`;
  }

  isCountryVisible(c: CountryNode): boolean {
    if (!this.treeSearch.trim()) return true;
    return c.name.toLowerCase().includes(this.treeSearch.trim().toLowerCase());
  }

  isRegionVisible(r: RegionNode): boolean {
    if (!this.treeSearch.trim()) return true;
    const q = this.treeSearch.trim().toLowerCase();
    if (r.name.toLowerCase().includes(q)) return true;
    return r.countries.some(c => c.name.toLowerCase().includes(q));
  }

  get availableCategories(): string[] {
    return this.faqCatService.getCategoriesByModule('Bize Ulaşın').map(c => c.name);
  }

  get pendingApprovalCount(): number {
    return this.faqService.getItemsByModule('Bize Ulaşın').filter(q => q.status === 'Pending_Approval').length;
  }

  get filteredContacts(): FaqItem[] {
    const user = this.authService.currentUser();
    const q = this.searchQuery.trim().toLowerCase();

    return this.faqService.getItemsByModule('Bize Ulaşın').filter(item => {
      if (this.authService.isCountryAdmin() && user.assignedCountry) {
        if (item.scope === 'Ülke') {
          const hasCountry = item.targetCountries?.includes(user.assignedCountry) || 
            item.targetCountry?.toLowerCase() === user.assignedCountry.toLowerCase();
          if (!hasCountry) return false;
        }
        if (item.scope === 'Bölgesel' && item.targetRegion?.toLowerCase() !== user.assignedRegion?.toLowerCase()) return false;
      } else if (this.authService.isRegionAdmin() && user.assignedRegion) {
        if (item.scope === 'Bölgesel' && item.targetRegion?.toLowerCase() !== user.assignedRegion.toLowerCase()) return false;
        if (item.scope === 'Ülke' && item.targetRegion?.toLowerCase() !== user.assignedRegion.toLowerCase()) return false;
      }

      const matchesSearch = !q || 
        item.question.toLowerCase().includes(q) || 
        item.answerSnippet.toLowerCase().includes(q) ||
        (item.targetCountry && item.targetCountry.toLowerCase().includes(q)) ||
        (item.targetCountries && item.targetCountries.some(tc => tc.toLowerCase().includes(q)));

      const matchesCat = this.selectedCategory === 'Tüm Kategoriler' || item.category === this.selectedCategory;
      const matchesStatus = this.selectedStatus === 'Tüm Durumlar' || item.status === this.selectedStatus;
      const matchesScope = this.selectedScopeFilter === 'Tüm Kapsamlar' || item.scope === this.selectedScopeFilter;

      return matchesSearch && matchesCat && matchesStatus && matchesScope;
    });
  }

  openAddModal() {
    this.editingId = null;
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(item: FaqItem) {
    this.editingId = item.id;
    this.formTitle = item.question;
    this.formContactInfo = item.answerSnippet;
    this.formCategory = item.category;
    this.formReferenceUrl = item.referenceUrl || '';
    this.initRegionTree(item.targetCountries, item.scope, item.targetRegion, item.targetCountry);
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
  }

  resetForm() {
    this.formTitle = '';
    const cats = this.availableCategories;
    this.formCategory = cats.length > 0 ? cats[0] : 'Teknik Destek & Servis';
    this.formContactInfo = '';
    this.formReferenceUrl = '';
    this.treeSearch = '';
    this.initRegionTree();
  }

  saveContact() {
    if (!this.formTitle.trim() || !this.formContactInfo.trim()) return;

    const user = this.authService.currentUser();
    const initialStatus: ContentStatus = this.authService.isCountryAdmin() ? 'Pending_Approval' : 'Published';

    const selectedCountries = this.getSelectedCountries();
    const calculatedScope = this.getCalculatedScope();
    const primaryRegion = this.regionTree.find(r => r.countries.some(c => c.checked))?.name || 'Avrupa';
    const primaryCountry = selectedCountries.length === 1 ? selectedCountries[0] : (selectedCountries[0] || 'Türkiye');

    if (this.editingId) {
      this.faqService.updateQuestion(this.editingId, {
        question: this.formTitle.trim(),
        answerSnippet: this.formContactInfo.trim(),
        category: this.formCategory,
        scope: calculatedScope,
        targetRegion: calculatedScope !== 'Global' ? primaryRegion : undefined,
        targetCountry: calculatedScope === 'Ülke' ? primaryCountry : undefined,
        targetCountries: selectedCountries,
        referenceUrl: this.formReferenceUrl.trim(),
        hasReferenceLink: !!this.formReferenceUrl.trim()
      });
    } else {
      this.faqService.addQuestion({
        moduleType: 'Bize Ulaşın',
        question: this.formTitle.trim(),
        answerSnippet: this.formContactInfo.trim(),
        category: this.formCategory,
        scope: calculatedScope,
        targetRegion: calculatedScope !== 'Global' ? primaryRegion : undefined,
        targetCountry: calculatedScope === 'Ülke' ? primaryCountry : undefined,
        targetCountries: selectedCountries,
        referenceUrl: this.formReferenceUrl.trim(),
        hasReferenceLink: !!this.formReferenceUrl.trim(),
        status: initialStatus,
        createdByRole: user.role,
        createdBy: user.name + ` (${user.roleTitle})`
      });
    }

    this.closeModal();
  }

  deleteContact(id: number) {
    if (confirm('Bu iletişim kanalını silmek istediğinizden emin misiniz?')) {
      this.faqService.deleteQuestion(id);
    }
  }

  approveContact(id: number) {
    this.faqService.approveItem(id);
  }

  rejectContact(id: number) {
    this.faqService.rejectItem(id);
  }

  toggleRegionDeactivation(item: FaqItem) {
    const userRegion = this.authService.currentUser().assignedRegion || 'Avrupa';
    this.faqService.toggleRegionDeactivation(item.id, userRegion);
  }

  isDeactivatedInUserRegion(item: FaqItem): boolean {
    const userRegion = this.authService.currentUser().assignedRegion || 'Avrupa';
    return this.faqService.isDeactivatedInRegion(item, userRegion);
  }
}
