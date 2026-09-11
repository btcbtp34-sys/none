import { Component, inject, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { TranslationService, SupportedLang } from '../../services/translation.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-frontend-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './frontend-layout.component.html',
  styleUrl: './frontend-layout.component.css'
})
export class FrontendLayoutComponent implements OnInit {
  projectService = inject(ProjectService);
  authService = inject(AuthService);
  tsService = inject(TranslationService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  elementRef = inject(ElementRef);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const p = params['project'];
      if (p === 'nova' || p === 'orion') {
        this.projectService.setProject(p);
      }
    });
  }

  showLangDropdown = false;

  languages: { code: SupportedLang; label: string; name: string; flagUrl: string }[] = [
    { code: 'tr', label: 'TR', name: 'Türkçe', flagUrl: 'flags/tr.svg' },
    { code: 'en', label: 'EN', name: 'English', flagUrl: 'flags/gb.svg' },
    { code: 'de', label: 'DE', name: 'Deutsch', flagUrl: 'flags/de.svg' },
    { code: 'fr', label: 'FR', name: 'Français', flagUrl: 'flags/fr.svg' }
  ];

  get currentLangObj() {
    return this.languages.find(l => l.code === this.tsService.currentLang()) || this.languages[0];
  }

  setLang(lang: SupportedLang, event?: Event) {
    if (event) event.stopPropagation();
    this.tsService.setLanguage(lang);
    this.showLangDropdown = false;
  }

  toggleLangDropdown(event: Event) {
    event.stopPropagation();
    this.showLangDropdown = !this.showLangDropdown;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showLangDropdown = false;
    }
  }

  logout() {
    this.authService.logoutFrontend();
    this.router.navigate(['/frontend/home']);
  }
}
