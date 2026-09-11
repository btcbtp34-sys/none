import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { SsoLoginComponent } from './components/sso-login/sso-login.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SsoLoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  authService = inject(AuthService);
  router = inject(Router);

  isBackofficeLoginRoute(): boolean {
    const path = typeof window !== 'undefined' ? window.location.pathname : this.router.url;
    if (path.startsWith('/frontend')) {
      return false;
    }
    return this.router.url === '/login' || !this.authService.isLoggedIn();
  }
}
