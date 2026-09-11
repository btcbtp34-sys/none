import { Routes } from '@angular/router';
import { SsoLoginComponent } from './components/sso-login/sso-login.component';
import { BackofficeLayoutComponent } from './components/backoffice-layout/backoffice-layout.component';
import { DilYonetimiComponent } from './components/dil-yonetimi/dil-yonetimi.component';
import { DilBakimiComponent } from './components/dil-bakimi/dil-bakimi.component';
import { IndirilenlerComponent } from './components/indirilenler/indirilenler.component';
import { BolgelerComponent } from './components/bolgeler/bolgeler.component';
import { UlkelerComponent } from './components/ulkeler/ulkeler.component';
import { SatisKanallariComponent } from './components/satis-kanallari/satis-kanallari.component';
import { HavaKosullariComponent } from './components/hava-kosullari/hava-kosullari.component';
import { ProjeTipleriComponent } from './components/proje-tipleri/proje-tipleri.component';
import { OrganizasyonelRollerComponent } from './components/organizasyonel-roller/organizasyonel-roller.component';
import { KullaniciYonetimiComponent } from './components/kullanici-yonetimi/kullanici-yonetimi.component';
import { ParametrelerComponent } from './components/parametreler/parametreler.component';
import { SistemYedeklemeComponent } from './components/sistem-yedekleme/sistem-yedekleme.component';
import { SssKategorileriComponent } from './components/sss-kategorileri/sss-kategorileri.component';
import { SikcaSorulanSorularComponent } from './components/sikca-sorulan-sorular/sikca-sorulan-sorular.component';
import { EgitimComponent } from './components/egitim/egitim.component';
import { BizeUlasinComponent } from './components/bize-ulasin/bize-ulasin.component';
import { ModullerComponent } from './components/moduller/moduller.component';

// Frontend Portal Components
import { FrontendLayoutComponent } from './frontend/frontend-layout/frontend-layout.component';
import { FrontendHomeComponent } from './frontend/home/home.component';
import { FrontendDownloadsComponent } from './frontend/downloads/frontend-downloads.component';
import { FrontendFaqComponent } from './frontend/faq/frontend-faq.component';
import { FrontendLanguageComponent } from './frontend/language/frontend-language.component';
import { FrontendLinksComponent } from './frontend/links/frontend-links.component';
import { FrontendLoginComponent } from './frontend/auth/frontend-login.component';
import { FrontendRegisterComponent } from './frontend/auth/frontend-register.component';
import { FrontendDrawingComponent } from './frontend/drawing/frontend-drawing.component';

export const routes: Routes = [
  // Standalone Frontend Authentication Pages
  { path: 'frontend/login', component: FrontendLoginComponent },
  { path: 'frontend/register', component: FrontendRegisterComponent },

  // Standalone Drawing Canvas Workspace (Dedicated CAD Layout, GoJS)
  { path: 'frontend/drawing', component: FrontendDrawingComponent },
  { path: 'frontend/drawing/:id', component: FrontendDrawingComponent },

  // Frontend Portal Routes (Completely separate layout, zero backoffice sidebar/header)
  {
    path: 'frontend',
    component: FrontendLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: FrontendHomeComponent },
      { path: 'linkler', component: FrontendLinksComponent },
      { path: 'links', redirectTo: 'linkler', pathMatch: 'full' },
      { path: 'indirilenler', component: FrontendDownloadsComponent },
      { path: 'downloads', redirectTo: 'indirilenler', pathMatch: 'full' },
      { path: 'sikca-sorulan-sorular', component: FrontendFaqComponent },
      { path: 'faq', redirectTo: 'sikca-sorulan-sorular', pathMatch: 'full' },
      { path: 'dil-degistirme', component: FrontendLanguageComponent },
      { path: 'dil-secimi', redirectTo: 'dil-degistirme', pathMatch: 'full' },
      { path: 'language', redirectTo: 'dil-degistirme', pathMatch: 'full' }
    ]
  },

  // Backoffice Login Page
  { path: 'login', component: SsoLoginComponent },

  // Backoffice Admin Pages (Inside BackofficeLayout with Sidebar + Admin Header)
  {
    path: '',
    component: BackofficeLayoutComponent,
    children: [
      { path: '', redirectTo: 'dil-yonetimi', pathMatch: 'full' },
      { path: 'dil-yonetimi', component: DilYonetimiComponent },
      { path: 'dil-bakimi', component: DilBakimiComponent },
      { path: 'indirilenler', component: IndirilenlerComponent },
      { path: 'bolgeler', component: BolgelerComponent },
      { path: 'ulkeler', component: UlkelerComponent },
      { path: 'satis-kanallari', component: SatisKanallariComponent },
      { path: 'hava-kosullari', component: HavaKosullariComponent },
      { path: 'proje-tipleri', component: ProjeTipleriComponent },
      { path: 'proje-tipi', redirectTo: 'proje-tipleri', pathMatch: 'full' },
      { path: 'moduller', component: ModullerComponent },
      { path: 'modules', redirectTo: 'moduller', pathMatch: 'full' },
      { path: 'kategoriler', component: SssKategorileriComponent },
      { path: 'sss-kategorileri', redirectTo: 'kategoriler', pathMatch: 'full' },
      { path: 'sikca-sorulan-sorular', component: SikcaSorulanSorularComponent },
      { path: 'egitim', component: EgitimComponent },
      { path: 'bize-ulasin', component: BizeUlasinComponent },
      { path: 'organizasyonel-roller', component: OrganizasyonelRollerComponent },
      { path: 'roller', redirectTo: 'organizasyonel-roller', pathMatch: 'full' },
      { path: 'kullanici-yonetimi', component: KullaniciYonetimiComponent },
      { path: 'kullanicilar', redirectTo: 'kullanici-yonetimi', pathMatch: 'full' },
      { path: 'parametreler', component: ParametrelerComponent },
      { path: 'sistem-yedekleme', component: SistemYedeklemeComponent },
      { path: 'yedek-ve-geri-yukle', redirectTo: 'sistem-yedekleme', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'dil-yonetimi' }
];
