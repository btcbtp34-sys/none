import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ProjectService } from '../../services/project.service';
import { DownloadService } from '../../services/download.service';
import { CountryService } from '../../services/country.service';
import { RegionService } from '../../services/region.service';
import { SalesChannelService } from '../../services/sales-channel.service';
import { ProjectTypeService } from '../../services/project-type.service';
import { UserRoleService } from '../../services/user-role.service';
import { UserManagementService } from '../../services/user-management.service';
import { SystemSettingsService } from '../../services/system-settings.service';
import { FaqService } from '../../services/faq.service';
import { FaqCategoryService } from '../../services/faq-category.service';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';

export type CategoryId = 'system' | 'support' | 'users' | 'settings';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  router = inject(Router);
  projectService = inject(ProjectService);
  downloadService = inject(DownloadService);
  countryService = inject(CountryService);
  regionService = inject(RegionService);
  salesChannelService = inject(SalesChannelService);
  projectTypeService = inject(ProjectTypeService);
  userRoleService = inject(UserRoleService);
  userMgmtService = inject(UserManagementService);
  settingsService = inject(SystemSettingsService);
  faqService = inject(FaqService);
  faqCatService = inject(FaqCategoryService);
  authService = inject(AuthService);
  tsService = inject(TranslationService);

  activeProject = this.projectService.currentProject;

  // Search & Accordion State
  searchQuery = signal<string>('');
  openCategory = signal<CategoryId | null>('system');

  categoryItemsMap: Record<CategoryId, string[]> = {
    system: [
      'Dil Yönetimi',
      'Dil Bakımı',
      'İndirilenler',
      'Bölgeler',
      'Ülkeler',
      'Satış Kanalları',
      'Hava Koşulları',
      'Proje Tipi'
    ],
    support: [
      'Kategoriler',
      'SSS',
      'Eğitim',
      'Bize Ulaşın'
    ],
    users: [
      'Organizasyonel Roller',
      'Kullanıcı Yönetimi'
    ],
    settings: [
      'Parametreler',
      'Sistem Yedek & Geri Yükle'
    ]
  };

  ngOnInit() {
    this.syncCategoryWithRoute(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (!this.searchQuery().trim()) {
        this.syncCategoryWithRoute(event.urlAfterRedirects || event.url);
      }
    });
  }

  private syncCategoryWithRoute(url: string) {
    if (url.includes('roller') || url.includes('kullanici')) {
      this.openCategory.set('users');
    } else if (url.includes('parametre') || url.includes('yedek')) {
      this.openCategory.set('settings');
    } else if (url.includes('kategori') || url.includes('sikca') || url.includes('egitim') || url.includes('ulasin')) {
      this.openCategory.set('support');
    } else {
      this.openCategory.set('system');
    }
  }

  toggleCategory(cat: CategoryId) {
    if (this.openCategory() === cat) {
      this.openCategory.set(null);
    } else {
      this.openCategory.set(cat);
    }
  }

  isCategoryOpen(cat: CategoryId): boolean {
    if (this.searchQuery().trim()) {
      return this.categoryHasMatches(cat);
    }
    return this.openCategory() === cat;
  }

  matchesSearch(titleKey: string): boolean {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return true;

    const directMatch = titleKey.toLowerCase().includes(q);
    const translatedMatch = this.tsService.translate(titleKey).toLowerCase().includes(q);
    return directMatch || translatedMatch;
  }

  categoryHasMatches(cat: CategoryId): boolean {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return true;

    const items = this.categoryItemsMap[cat] || [];
    return items.some(item => this.matchesSearch(item));
  }

  hasAnyMatches(): boolean {
    if (!this.searchQuery().trim()) return true;
    const cats: CategoryId[] = ['system', 'support', 'users', 'settings'];
    return cats.some(c => this.categoryHasMatches(c));
  }

  clearSearch() {
    this.searchQuery.set('');
    this.syncCategoryWithRoute(this.router.url);
  }

  toggleProject() {
    this.projectService.toggleProject();
  }
}
