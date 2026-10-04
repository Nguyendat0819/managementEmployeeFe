import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {
  COMPACT_MAX_HEIGHT,
  DENSITY_ATTRIBUTE,
  DENSITY_COMPACT,
  HEADER_FULL_CRUMB_WIDTH,
  LayoutWidthMode,
  MOBILE_MAX_WIDTH,
} from '@core';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { BreadcrumbBuilderService } from '../core/breadcrumb/breadcrumb-builder.service';
import {SharedModule} from '../shared/shared.module';
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent, SharedModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  protected readonly breadcrumb = inject(BreadcrumbBuilderService);

  collapsed = false;
  isMobile = false;
  mobileOpen = false;
  widthMode: LayoutWidthMode = 'wide';
  private mql?: MediaQueryList;
  private readonly onMqlChange = (event: MediaQueryListEvent) => this.applyMobile(event.matches);
  private readonly onResize = () => this.applyViewport();
  ngOnInit(): void {
    this.mql = window.matchMedia('(max-width: 767.98px)');
    this.applyMobile(this.mql.matches);
    this.mql.addEventListener('change', this.onMqlChange);
    this.applyViewport();
    window.addEventListener('resize', this.onResize);
  }

  ngOnDestroy(): void {
    this.mql?.removeEventListener('change', this.onMqlChange);
    window.removeEventListener('resize', this.onResize);
  }

  toggleSidebar(): void {
    if (this.isMobile) {
      this.mobileOpen = !this.mobileOpen;
      return;
    }
    this.collapsed = !this.collapsed;
  }

  closeMobile(): void {
    this.mobileOpen = false;
  }

  private applyMobile(isMobile: boolean): void {
    this.isMobile = isMobile;
    if (!isMobile) {
      this.mobileOpen = false;
    }
    this.applyViewport();
  }

  private applyViewport(): void {
    const width = window.innerWidth;
    if (width <= MOBILE_MAX_WIDTH) this.widthMode = 'mobile';
    else this.widthMode = width >= HEADER_FULL_CRUMB_WIDTH ? 'wide' : 'medium';

    const compact = window.innerHeight <= COMPACT_MAX_HEIGHT;
    if (compact) document.documentElement.dataset[DENSITY_ATTRIBUTE] = DENSITY_COMPACT;
    else delete document.documentElement.dataset[DENSITY_ATTRIBUTE];
  }
}
