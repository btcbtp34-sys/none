import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-backoffice-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './backoffice-layout.component.html',
  styleUrl: './backoffice-layout.component.css'
})
export class BackofficeLayoutComponent {
  projectService = inject(ProjectService);
}
