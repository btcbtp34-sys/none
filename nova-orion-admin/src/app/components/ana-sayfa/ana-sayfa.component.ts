import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';

// Backoffice ana sayfası: seçili projenin (Nova / Orion) adı, projeye özel siyah-beyaz fotoğrafın üzerinde
@Component({
  selector: 'app-ana-sayfa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ana-sayfa.component.html',
  styleUrl: './ana-sayfa.component.css'
})
export class AnaSayfaComponent implements OnInit {
  projectService = inject(ProjectService);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);

  project = this.projectService.currentProject;

  ngOnInit() {
    this.pageTitleService.setPage('Ana Sayfa', '');
  }
}
