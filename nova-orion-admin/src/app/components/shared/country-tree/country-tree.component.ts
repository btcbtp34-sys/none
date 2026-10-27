import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegionService, RegionItem } from '../../../services/region.service';
import { CountryService, CountryItem } from '../../../services/country.service';
import { TranslationService } from '../../../services/translation.service';

type SelectionState = 'all' | 'some' | 'none';

// Global > Bölge > Ülke checkbox ağacı; seçili ülke id'leri [(selectedIds)] ile bağlanır
@Component({
  selector: 'app-country-tree',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './country-tree.component.html',
  styleUrl: './country-tree.component.css'
})
export class CountryTreeComponent {
  regionService = inject(RegionService);
  countryService = inject(CountryService);
  tsService = inject(TranslationService);

  @Input() selectedIds: number[] = [];
  @Output() selectedIdsChange = new EventEmitter<number[]>();

  expandedRegionIds = new Set<number>();

  regionCountries(region: RegionItem): CountryItem[] {
    return this.countryService.getCountriesByRegion(region.name);
  }

  private get allCountryIds(): number[] {
    return this.regionService.regions().flatMap(r => this.regionCountries(r).map(c => c.id));
  }

  private selectionState(ids: number[]): SelectionState {
    const selected = ids.filter(id => this.selectedIds.includes(id)).length;
    if (selected === 0) return 'none';
    return selected === ids.length ? 'all' : 'some';
  }

  get globalState(): SelectionState {
    return this.selectionState(this.allCountryIds);
  }

  regionState(region: RegionItem): SelectionState {
    return this.selectionState(this.regionCountries(region).map(c => c.id));
  }

  private emit(ids: number[]) {
    this.selectedIds = ids;
    this.selectedIdsChange.emit(ids);
  }

  // Hepsi seçiliyse kaldırır, değilse hepsini seçer
  private toggleCountries(ids: number[], state: SelectionState) {
    this.emit(state === 'all'
      ? this.selectedIds.filter(id => !ids.includes(id))
      : [...new Set([...this.selectedIds, ...ids])]);
  }

  toggleGlobal() {
    this.toggleCountries(this.allCountryIds, this.globalState);
  }

  toggleRegion(region: RegionItem) {
    this.toggleCountries(this.regionCountries(region).map(c => c.id), this.regionState(region));
  }

  isCountrySelected(id: number): boolean {
    return this.selectedIds.includes(id);
  }

  toggleCountry(id: number) {
    this.emit(this.isCountrySelected(id)
      ? this.selectedIds.filter(c => c !== id)
      : [...this.selectedIds, id]);
  }

  toggleRegionExpanded(region: RegionItem) {
    if (this.expandedRegionIds.has(region.id)) {
      this.expandedRegionIds.delete(region.id);
    } else {
      this.expandedRegionIds.add(region.id);
    }
  }
}
