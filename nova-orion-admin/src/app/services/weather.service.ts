import { Injectable, signal } from '@angular/core';

export interface WeatherItem {
  id: number;
  country: string;
  city: string;
  altitude: number; // Rakım (metre / m)
  summerDryBulb: number; // e.g. 33 (°C)
  winterDryBulb: number; // e.g. -17 (°C)
  status: 'Active' | 'Passive';
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private weatherList = signal<WeatherItem[]>([
    { id: 1, country: 'Kazakhstan', city: 'Shymkent / Шымкент', altitude: 506, summerDryBulb: 33, winterDryBulb: -17, status: 'Active' },
    { id: 2, country: 'Fransa', city: 'Brest', altitude: 42, summerDryBulb: 35, winterDryBulb: -4, status: 'Active' },
    { id: 3, country: 'Fransa', city: 'Bourges', altitude: 153, summerDryBulb: 35, winterDryBulb: -7, status: 'Active' },
    { id: 4, country: 'Fransa', city: 'Châteauroux', altitude: 154, summerDryBulb: 35, winterDryBulb: -7, status: 'Active' },
    { id: 5, country: 'Fransa', city: 'Rouen', altitude: 10, summerDryBulb: 35, winterDryBulb: -7, status: 'Active' },
    { id: 6, country: 'Fransa', city: 'Lens', altitude: 40, summerDryBulb: 35, winterDryBulb: -9, status: 'Active' },
    { id: 7, country: 'Fransa', city: 'Limoges', altitude: 310, summerDryBulb: 35, winterDryBulb: -8, status: 'Active' },
    { id: 8, country: 'Fransa', city: 'Reims', altitude: 83, summerDryBulb: 35, winterDryBulb: -10, status: 'Active' },
    { id: 9, country: 'Fransa', city: 'Quimper', altitude: 28, summerDryBulb: 35, winterDryBulb: -4, status: 'Active' },
    { id: 10, country: 'Fransa', city: 'Poitiers', altitude: 116, summerDryBulb: 35, winterDryBulb: -4, status: 'Active' },
    { id: 11, country: 'Türkiye', city: 'İstanbul', altitude: 39, summerDryBulb: 33, winterDryBulb: 0, status: 'Active' },
    { id: 12, country: 'Türkiye', city: 'Ankara', altitude: 938, summerDryBulb: 36, winterDryBulb: -12, status: 'Active' },
    { id: 13, country: 'Türkiye', city: 'İzmir', altitude: 15, summerDryBulb: 38, winterDryBulb: 2, status: 'Active' },
    { id: 14, country: 'Türkiye', city: 'Antalya', altitude: 45, summerDryBulb: 42, winterDryBulb: 5, status: 'Active' },
    { id: 15, country: 'Almanya', city: 'Berlin', altitude: 34, summerDryBulb: 32, winterDryBulb: -14, status: 'Active' },
    { id: 16, country: 'Almanya', city: 'Münih', altitude: 519, summerDryBulb: 31, winterDryBulb: -16, status: 'Active' }
  ]);

  weatherData = this.weatherList.asReadonly();

  addWeather(item: Omit<WeatherItem, 'id'>) {
    const current = this.weatherList();
    const newId = current.length > 0 ? Math.max(...current.map(w => w.id)) + 1 : 1;
    this.weatherList.set([{ ...item, id: newId }, ...current]);
  }

  updateWeather(id: number, updated: Partial<WeatherItem>) {
    this.weatherList.set(
      this.weatherList().map(w => 
        w.id === id ? { ...w, ...updated } : w
      )
    );
  }

  deleteWeather(id: number) {
    this.weatherList.set(this.weatherList().filter(w => w.id !== id));
  }

  toggleStatus(id: number) {
    this.weatherList.set(this.weatherList().map(w => 
      w.id === id ? { ...w, status: w.status === 'Active' ? 'Passive' : 'Active' } : w
    ));
  }
}
