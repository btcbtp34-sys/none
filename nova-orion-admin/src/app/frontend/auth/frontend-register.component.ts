import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { TranslationService, SupportedLang } from '../../services/translation.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-frontend-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './frontend-register.component.html',
  styleUrl: './frontend-register.component.css'
})
export class FrontendRegisterComponent {
  projectService = inject(ProjectService);
  tsService = inject(TranslationService);
  authService = inject(AuthService);
  router = inject(Router);
  elementRef = inject(ElementRef);

  showLangDropdown = false;

  fullName = '';
  email = '';
  company = '';
  country = 'Türkiye';
  jobPosition = '';
  privacyAccepted = false;
  termsAccepted = false;

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  countries = ['Türkiye', 'Almanya', 'Fransa', 'İngiltere', 'İtalya', 'İspanya', 'Hollanda', 'Avusturya'];

  languages: { code: SupportedLang; label: string; name: string; flagUrl: string }[] = [
    { code: 'tr', label: 'TR', name: 'Türkçe', flagUrl: 'flags/tr.svg' },
    { code: 'en', label: 'EN', name: 'English', flagUrl: 'flags/gb.svg' },
    { code: 'de', label: 'DE', name: 'Deutsch', flagUrl: 'flags/de.svg' },
    { code: 'fr', label: 'FR', name: 'Français', flagUrl: 'flags/fr.svg' }
  ];

  get currentLangObj() {
    return this.languages.find(l => l.code === this.tsService.currentLang()) || this.languages[0];
  }

  toggleLangDropdown(event: Event) {
    event.stopPropagation();
    this.showLangDropdown = !this.showLangDropdown;
  }

  setLang(lang: SupportedLang, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.tsService.setLanguage(lang);
    this.showLangDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showLangDropdown = false;
    }
  }

  onSubmit() {
    this.errorMessage = '';

    if (!this.fullName.trim() || !this.email.trim() || !this.company.trim() || !this.jobPosition.trim()) {
      this.errorMessage = this.tsService.translate('Lütfen tüm zorunlu alanları doldurunuz ve onay kutularını işaretleyiniz.');
      return;
    }

    if (!this.privacyAccepted || !this.termsAccepted) {
      this.errorMessage = this.tsService.translate('Lütfen tüm zorunlu alanları doldurunuz ve onay kutularını işaretleyiniz.');
      return;
    }

    this.isSubmitting = true;

    setTimeout(() => {
      this.isSubmitting = false;
      this.successMessage = this.tsService.translate('Kayıt başarıyla oluşturuldu!');

      // Set user session in auth service
      this.authService.loginFrontendUser({
        name: this.fullName.trim(),
        email: this.email.trim(),
        country: this.country,
        roleTitle: `${this.company.trim()} (${this.jobPosition.trim()})`
      });

      setTimeout(() => {
        this.router.navigate(['/frontend/home']);
      }, 1000);
    }, 600);
  }
}
