import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, UserProfile } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';
import { TranslationService, SupportedLang } from '../../services/translation.service';

export type LoginStep = 'PORTAL_CHOICE' | 'EMAIL' | 'PASSWORD' | 'PROJECT_CHOICE';

@Component({
  selector: 'app-sso-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sso-login.component.html',
  styleUrl: './sso-login.component.css'
})
export class SsoLoginComponent {
  authService = inject(AuthService);
  projectService = inject(ProjectService);
  tsService = inject(TranslationService);
  router = inject(Router);

  // Languages
  languages: { code: SupportedLang; label: string; flag: string }[] = [
    { code: 'tr', label: 'TR', flag: '🇹🇷' },
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'de', label: 'DE', flag: '🇩🇪' },
    { code: 'fr', label: 'FR', flag: '🇫🇷' }
  ];

  // Steps
  step: LoginStep = 'PORTAL_CHOICE';
  loginType: 'PARTNER' | 'EMPLOYEE' = 'PARTNER';

  // Form Fields
  email = 'partner@nova-orion.com';
  password = 'Password2026!';
  showPassword = false;
  selectedProject: 'nova' | 'orion' = 'nova';

  errorMessage = '';
  isProcessing = false;
  isFocused = false;

  constructor() {
    this.tsService.setLanguage('tr');
  }

  setLang(lang: SupportedLang) {
    this.tsService.setLanguage(lang);
  }

  // Step 0 -> Step 1
  selectLoginType(type: 'PARTNER' | 'EMPLOYEE') {
    this.loginType = type;
    this.errorMessage = '';
    if (type === 'PARTNER') {
      this.email = 'partner@nova-orion.com';
      this.password = 'Partner2026!';
    } else {
      this.email = 'superadmin@nova.com';
      this.password = 'Admin2026!';
    }
    this.step = 'EMAIL';
  }

  // Step 1 -> Step 2
  goToPassword() {
    this.errorMessage = '';
    const trimmed = this.email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      this.errorMessage = this.tsService.translate('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }

    this.isProcessing = true;
    setTimeout(() => {
      this.isProcessing = false;
      this.step = 'PASSWORD';
    }, 250);
  }

  // Step 2 -> Step 3
  goToProjectChoice() {
    this.errorMessage = '';
    if (!this.password.trim()) {
      this.errorMessage = this.tsService.translate('Lütfen şifrenizi giriniz.');
      return;
    }

    this.isProcessing = true;
    setTimeout(() => {
      this.isProcessing = false;
      this.step = 'PROJECT_CHOICE';
    }, 250);
  }

  // Step 3 -> Completion
  selectProject(proj: 'nova' | 'orion') {
    this.selectedProject = proj;
  }

  completeLogin() {
    this.isProcessing = true;
    setTimeout(() => {
      // 1. Set the active project (Nova or Orion)
      this.projectService.setProject(this.selectedProject);

      // 2. Authenticate the user
      this.authService.loginWithEmail(this.email);

      this.isProcessing = false;

      // 3. Navigate to application dashboard
      this.router.navigate(['/dil-yonetimi']);
    }, 300);
  }

  // Navigation Backwards
  backToPortalChoice() {
    this.step = 'PORTAL_CHOICE';
    this.errorMessage = '';
  }

  backToEmail() {
    this.step = 'EMAIL';
    this.errorMessage = '';
  }

  backToPassword() {
    this.step = 'PASSWORD';
    this.errorMessage = '';
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }
}
