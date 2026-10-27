import { Component, inject, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService, SupportedLang } from '../../services/translation.service';
import { AuthService, UserProfile } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  projectService = inject(ProjectService);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);
  authService = inject(AuthService);
  router = inject(Router);
  elementRef = inject(ElementRef);

  activeProject = this.projectService.currentProject;

  showLangDropdown = false;
  showUserRoleDropdown = false;

  languages: { name: string; codeBadge: string; code: SupportedLang; flagUrl: string }[] = [
    { name: 'Türkçe', codeBadge: 'TR', code: 'tr', flagUrl: 'flags/tr.svg' },
    { name: 'English', codeBadge: 'GB', code: 'en', flagUrl: 'flags/gb.svg' },
    { name: 'Deutsch', codeBadge: 'DE', code: 'de', flagUrl: 'flags/de.svg' },
    { name: 'Français', codeBadge: 'FR', code: 'fr', flagUrl: 'flags/fr.svg' }
  ];

  get currentLangObj(): { name: string; codeBadge: string; code: SupportedLang; flagUrl: string } {
    const found = this.languages.find(l => l.code === this.tsService.currentLang());
    return found || this.languages[0];
  }

  // "Bölge Yöneticisi (Avrupa)" gibi unvanlarda rol ve parantez içi bölge/ülke ayrı çevrilir
  roleTitle(title: string): string {
    if (this.tsService.currentLang() === 'tr') return title;
    const match = /^(.*?)\s*\((.*)\)$/.exec(title ?? '');
    if (!match) return this.tsService.translate(title);
    return `${this.tsService.translate(match[1])} (${this.tsService.translate(match[2])})`;
  }

  toggleLangDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.showLangDropdown = !this.showLangDropdown;
    this.showUserRoleDropdown = false;
  }

  selectLang(lang: { name: string; codeBadge: string; code: SupportedLang }, event: MouseEvent) {
    event.stopPropagation();
    this.tsService.setLanguage(lang.code);
    this.showLangDropdown = false;
  }

  toggleUserRoleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.showUserRoleDropdown = !this.showUserRoleDropdown;
    this.showLangDropdown = false;
  }

  switchRole(user: UserProfile, event: MouseEvent) {
    event.stopPropagation();
    this.authService.switchUser(user);
    this.showUserRoleDropdown = false;
  }

  navigateToFrontend(project: 'nova' | 'orion', event?: MouseEvent) {
    if (event) {
      event.preventDefault();
    }
    this.projectService.setProject(project);
    window.open(`/frontend/home?project=${project}`, '_blank');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showLangDropdown = false;
      this.showUserRoleDropdown = false;
    }
  }
}
