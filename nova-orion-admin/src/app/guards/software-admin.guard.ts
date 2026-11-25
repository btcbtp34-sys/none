import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Markalar ve Ayarlar sayfaları yalnızca Software Admin'e açıktır; diğer roller ana sayfaya yönlenir
export const softwareAdminGuard: CanActivateFn = () => {
  return inject(AuthService).isSoftwareAdmin() || inject(Router).createUrlTree(['/']);
};

// Bu adresler softwareAdminGuard ile korunur (rol değişince açık sayfadan çıkmak için)
export const SOFTWARE_ADMIN_PATHS = ['/markalar', '/parametreler', '/sistem-yedekleme'];

// Bölgeler ve Doğrulama Motoru sayfaları Country Admin'e kapalıdır
export const notCountryAdminGuard: CanActivateFn = () => {
  return !inject(AuthService).isCountryAdmin() || inject(Router).createUrlTree(['/']);
};
