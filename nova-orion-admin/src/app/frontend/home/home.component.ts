import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { TranslationService } from '../../services/translation.service';

import { AuthService } from '../../services/auth.service';

export interface CityWeatherDesign {
  summerDryBulb: number; // °C
  winterDryBulb: number; // °C
  coolingDryBulb: number; // °C
  heatingDryBulb: number; // °C
  coolingWetBulb: number; // °C
  humidity: number; // %
}

export interface CountryData {
  country: string;
  cities: {
    name: string;
    weather: CityWeatherDesign;
  }[];
}

export interface FrontendProject {
  id: string;
  code: string;
  name: string;
  type: string;
  platform: 'nova' | 'orion';
  country: string;
  city?: string;
  crmCode?: string;
  description?: string;
  creator?: string;
  updatedAt: string;
  status: 'Aktif' | 'Tamamlandı' | 'Taslak';
}

@Component({
  selector: 'app-frontend-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class FrontendHomeComponent {
  projectService = inject(ProjectService);
  authService = inject(AuthService);
  tsService = inject(TranslationService);
  router = inject(Router);

  showCreateModal = false;
  showOpenModal = false;
  notificationMessage = '';

  // Country & City Database with ASHRAE / HVAC Design Temperatures
  countryCityDatabase: CountryData[] = [
    {
      country: 'Türkiye',
      cities: [
        { name: 'İstanbul', weather: { summerDryBulb: 33, winterDryBulb: 0, coolingDryBulb: 24, heatingDryBulb: 21, coolingWetBulb: 24, humidity: 50 } },
        { name: 'Ankara', weather: { summerDryBulb: 35, winterDryBulb: -12, coolingDryBulb: 24, heatingDryBulb: 20, coolingWetBulb: 21, humidity: 45 } },
        { name: 'İzmir', weather: { summerDryBulb: 38, winterDryBulb: 2, coolingDryBulb: 24, heatingDryBulb: 22, coolingWetBulb: 25, humidity: 50 } },
        { name: 'Antalya', weather: { summerDryBulb: 40, winterDryBulb: 3, coolingDryBulb: 24, heatingDryBulb: 22, coolingWetBulb: 28, humidity: 55 } },
        { name: 'Bursa', weather: { summerDryBulb: 34, winterDryBulb: -3, coolingDryBulb: 24, heatingDryBulb: 21, coolingWetBulb: 23, humidity: 50 } }
      ]
    },
    {
      country: 'Almanya',
      cities: [
        { name: 'Frankfurt', weather: { summerDryBulb: 32, winterDryBulb: -10, coolingDryBulb: 23, heatingDryBulb: 20, coolingWetBulb: 20, humidity: 50 } },
        { name: 'Berlin', weather: { summerDryBulb: 31, winterDryBulb: -12, coolingDryBulb: 23, heatingDryBulb: 20, coolingWetBulb: 19, humidity: 50 } },
        { name: 'Münih', weather: { summerDryBulb: 30, winterDryBulb: -14, coolingDryBulb: 23, heatingDryBulb: 20, coolingWetBulb: 19, humidity: 50 } },
        { name: 'Hamburg', weather: { summerDryBulb: 29, winterDryBulb: -8, coolingDryBulb: 22, heatingDryBulb: 20, coolingWetBulb: 19, humidity: 55 } }
      ]
    },
    {
      country: 'Fransa',
      cities: [
        { name: 'Paris', weather: { summerDryBulb: 32, winterDryBulb: -5, coolingDryBulb: 24, heatingDryBulb: 21, coolingWetBulb: 21, humidity: 50 } },
        { name: 'Lyon', weather: { summerDryBulb: 34, winterDryBulb: -7, coolingDryBulb: 24, heatingDryBulb: 21, coolingWetBulb: 22, humidity: 50 } },
        { name: 'Marsilya', weather: { summerDryBulb: 35, winterDryBulb: 1, coolingDryBulb: 24, heatingDryBulb: 21, coolingWetBulb: 24, humidity: 55 } }
      ]
    },
    {
      country: 'İngiltere',
      cities: [
        { name: 'Londra', weather: { summerDryBulb: 29, winterDryBulb: -3, coolingDryBulb: 23, heatingDryBulb: 21, coolingWetBulb: 19, humidity: 50 } },
        { name: 'Manchester', weather: { summerDryBulb: 27, winterDryBulb: -4, coolingDryBulb: 22, heatingDryBulb: 20, coolingWetBulb: 18, humidity: 55 } },
        { name: 'Birmingham', weather: { summerDryBulb: 27, winterDryBulb: -4, coolingDryBulb: 22, heatingDryBulb: 20, coolingWetBulb: 18, humidity: 50 } }
      ]
    },
    {
      country: 'İtalya',
      cities: [
        { name: 'Milano', weather: { summerDryBulb: 34, winterDryBulb: -5, coolingDryBulb: 24, heatingDryBulb: 20, coolingWetBulb: 23, humidity: 50 } },
        { name: 'Roma', weather: { summerDryBulb: 35, winterDryBulb: 0, coolingDryBulb: 24, heatingDryBulb: 21, coolingWetBulb: 23, humidity: 50 } }
      ]
    }
  ];

  // New Project Form Data (User specified fields)
  newProjectName = '';
  newProjectCountry = 'Türkiye';
  newProjectCity = 'İstanbul';
  newProjectCode = '';
  newProjectType = 'Ticari';
  newProjectCrmCode = '';
  newProjectDescription = '';

  // Outdoor Design Temperatures
  summerDryBulb: number = 33;
  winterDryBulb: number = 0;

  // Indoor Design Temperatures
  coolingDryBulb: number = 24;
  heatingDryBulb: number = 21;
  coolingWetBulb: number = 24;
  indoorHumidity: number = 50;

  get currentAvailableCities(): string[] {
    const found = this.countryCityDatabase.find(c => c.country === this.newProjectCountry);
    return found ? found.cities.map(ct => ct.name) : [];
  }

  onCountryChange() {
    const cities = this.currentAvailableCities;
    if (cities.length > 0) {
      this.newProjectCity = cities[0];
    }
    this.applyCityWeather();
  }

  onCityChange() {
    this.applyCityWeather();
  }

  applyCityWeather() {
    const country = this.countryCityDatabase.find(c => c.country === this.newProjectCountry);
    if (!country) return;
    const city = country.cities.find(ct => ct.name === this.newProjectCity);
    if (!city) return;

    this.summerDryBulb = city.weather.summerDryBulb;
    this.winterDryBulb = city.weather.winterDryBulb;
    this.coolingDryBulb = city.weather.coolingDryBulb;
    this.heatingDryBulb = city.weather.heatingDryBulb;
    this.coolingWetBulb = city.weather.coolingWetBulb;
    this.indoorHumidity = city.weather.humidity;
  }

  // Search filter for Open Project Modal
  searchQuery = '';

  // Sample Projects
  projects: FrontendProject[] = [
    {
      id: 'p1',
      code: 'PRJ-2026-001',
      name: 'Vadi Kuleleri Merkezi Sistem Projesi',
      type: 'Ticari',
      platform: 'nova',
      country: 'Türkiye',
      city: 'İstanbul',
      creator: 'Hasan Cavit Koçak',
      updatedAt: '10.09.2026 14:20',
      status: 'Aktif'
    },
    {
      id: 'p2',
      code: 'PRJ-2026-002',
      name: 'Frankfurt Central Logistics Hub',
      type: 'Endüstriyel Tesis',
      platform: 'orion',
      country: 'Almanya',
      city: 'Frankfurt',
      creator: 'Hasan Cavit Koçak',
      updatedAt: '09.09.2026 18:45',
      status: 'Aktif'
    },
    {
      id: 'p3',
      code: 'PRJ-2026-003',
      name: 'Ege Yaşam Evleri Konut Projesi',
      type: 'Konut',
      platform: 'nova',
      country: 'Türkiye',
      city: 'İzmir',
      creator: 'Hasan Cavit Koçak',
      updatedAt: '08.09.2026 11:30',
      status: 'Taslak'
    },
    {
      id: 'p4',
      code: 'PRJ-2026-004',
      name: 'Paris Seine Medikal Klinik & Sağlık',
      type: 'Hastane & Sağlık',
      platform: 'orion',
      country: 'Fransa',
      city: 'Paris',
      creator: 'Hasan Cavit Koçak',
      updatedAt: '07.09.2026 09:15',
      status: 'Tamamlandı'
    }
  ];

  get currentPlatformProjects(): FrontendProject[] {
    const currentId = this.projectService.currentProject().id;
    return this.projects.filter(p => p.platform === currentId);
  }

  get filteredProjects(): FrontendProject[] {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.currentPlatformProjects;
    return this.currentPlatformProjects.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q)
    );
  }

  openCreateModal() {
    this.newProjectName = '';
    this.newProjectCode = '';
    this.newProjectCrmCode = '';
    this.newProjectDescription = '';
    this.newProjectType = 'Ticari';
    this.newProjectCountry = 'Türkiye';
    this.newProjectCity = 'İstanbul';
    this.applyCityWeather();
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  saveNewProject() {
    if (!this.newProjectName.trim()) return;

    const code = this.newProjectCode.trim() || `PRJ-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newPrj: FrontendProject = {
      id: 'p' + (this.projects.length + 1),
      code: code,
      name: this.newProjectName.trim(),
      type: this.newProjectType,
      platform: this.projectService.currentProject().id as 'nova' | 'orion',
      country: this.newProjectCountry,
      city: this.newProjectCity,
      crmCode: this.newProjectCrmCode.trim(),
      description: this.newProjectDescription.trim(),
      creator: this.authService.frontendUser()?.name || 'Hasan Cavit Koçak',
      updatedAt: new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      status: 'Aktif'
    };

    this.projects.unshift(newPrj);
    this.showCreateModal = false;

    // Navigate to GoJS Drawing Workspace with project design parameters
    this.router.navigate(['/frontend/drawing', newPrj.id], {
      queryParams: {
        name: newPrj.name,
        code: newPrj.code,
        city: newPrj.city,
        country: newPrj.country,
        outdoor: `${this.summerDryBulb}°C / ${this.winterDryBulb}°C`,
        indoor: `${this.coolingDryBulb}°C / ${this.heatingDryBulb}°C (%${this.indoorHumidity})`
      }
    });
  }

  openOpenModal() {
    this.searchQuery = '';
    this.showOpenModal = true;
  }

  closeOpenModal() {
    this.showOpenModal = false;
  }

  selectProject(prj: FrontendProject) {
    this.showOpenModal = false;
    // Navigate to GoJS Drawing Workspace with selected project details
    this.router.navigate(['/frontend/drawing', prj.id], {
      queryParams: {
        name: prj.name,
        code: prj.code,
        city: prj.city || '',
        country: prj.country || ''
      }
    });
  }

  triggerNotification(msg: string) {
    this.notificationMessage = msg;
    setTimeout(() => {
      if (this.notificationMessage === msg) {
        this.notificationMessage = '';
      }
    }, 3500);
  }
}
