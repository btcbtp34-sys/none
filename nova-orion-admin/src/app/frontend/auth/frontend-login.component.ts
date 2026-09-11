import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { TranslationService, SupportedLang } from '../../services/translation.service';
import { AuthService } from '../../services/auth.service';

export type FeLoginStep = 'PORTAL_CHOICE' | 'EMAIL' | 'PASSWORD';

@Component({
  selector: 'app-frontend-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './frontend-login.component.html',
  styleUrl: './frontend-login.component.css'
})
export class FrontendLoginComponent {
  projectService = inject(ProjectService);
  tsService = inject(TranslationService);
  authService = inject(AuthService);
  router = inject(Router);
  elementRef = inject(ElementRef);

  step: FeLoginStep = 'PORTAL_CHOICE';
  loginType: 'PARTNER' | 'EMPLOYEE' = 'PARTNER';

  email = 'ahmet.yilmaz@partner.com';
  password = '';
  showPassword = false;
  isFocused = false;
  isProcessing = false;
  errorMessage = '';

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

  selectLoginType(type: 'PARTNER' | 'EMPLOYEE') {
    this.loginType = type;
    if (type === 'PARTNER') {
      this.email = 'ahmet.yilmaz@partner.com';
    } else {
      this.email = 'hasan.cavit.kocak@nova-orion.com';
    }
    this.password = 'password123';
    this.step = 'EMAIL';
    this.errorMessage = '';
  }

  goToPassword() {
    this.errorMessage = '';
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email || !emailPattern.test(this.email.trim())) {
      this.errorMessage = this.tsService.translate('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }

    this.isProcessing = true;
    setTimeout(() => {
      this.isProcessing = false;
      this.step = 'PASSWORD';
    }, 300);
  }

  completeLogin() {
    this.errorMessage = '';
    this.isProcessing = true;

    setTimeout(() => {
      this.isProcessing = false;

      // Log in the user directly to Frontend
      let userName = 'Hasan Cavit Koçak';
      let roleTitle = 'Kurumsal Sistem Yöneticisi';

      if (this.loginType === 'PARTNER') {
        userName = this.email.includes('@') ? this.email.split('@')[0].replace('.', ' ').toUpperCase() : 'Ahmet Yılmaz';
        roleTitle = 'B2B İş Ortağı (Partner)';
      } else {
        userName = 'Hasan Cavit Koçak';
        roleTitle = 'Kurumsal Sistem Yöneticisi';
      }

      this.authService.loginFrontendUser({
        name: userName,
        email: this.email.trim() || 'hasan.cavit.kocak@nova-orion.com',
        roleTitle
      });

      // Navigate directly into Frontend Home
      this.router.navigate(['/frontend/home']);
    }, 400);
  }

  backToPortalChoice() {
    this.step = 'PORTAL_CHOICE';
    this.errorMessage = '';
  }

  backToEmail() {
    this.step = 'EMAIL';
    this.password = '';
    this.errorMessage = '';
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }
}
