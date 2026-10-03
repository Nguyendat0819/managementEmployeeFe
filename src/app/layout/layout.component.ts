import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import {
  COMPACT_MAX_HEIGHT,
  DENSITY_ATTRIBUTE,
  DENSITY_COMPACT,
  HEADER_FULL_CRUMB_WIDTH,
  LayoutWidthMode,
  MOBILE_MAX_WIDTH,
} from '@core';
import { MenuItem } from '@core/menu/menu-item.model';
import { MenuService } from '@core/menu/menu.service';
import { HeaderComponent } from './header/header.component';
import { SsBreadcrumbItem } from '@platform/ui-kit';
import { SidebarComponent } from './sidebar/sidebar.component';
import {BreadcrumbBuilderService} from '../core/breadcrumb/breadcrumb-builder.service';
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly menu = inject(MenuService);

  collapsed = false;
  isMobile = false;
  mobileOpen = false;
  widthMode: LayoutWidthMode = 'wide';
  crumbs: SsBreadcrumbItem[] = [];

  private mql?: MediaQueryList;
  private routerSub?: Subscription;
  private readonly onMqlChange = (event: MediaQueryListEvent) => this.applyMobile(event.matches);
  private readonly onResize = () => this.applyViewport();
  /** Template đọc trực tiếp: <ss-breadcrumb [items]="breadcrumb.crumbs()">. */
  protected readonly breadcrumb = inject(BreadcrumbBuilderService);
  ngOnInit(): void {
    this.mql = window.matchMedia('(max-width: 767.98px)');
    this.applyMobile(this.mql.matches);
    this.mql.addEventListener('change', this.onMqlChange);
    this.applyViewport();
    window.addEventListener('resize', this.onResize);
    this.crumbs = this.buildCrumbs(this.router.url);

    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.mobileOpen = false;
        this.crumbs = this.buildCrumbs((event as NavigationEnd).urlAfterRedirects);
      });
  }

  ngOnDestroy(): void {
    this.mql?.removeEventListener('change', this.onMqlChange);
    window.removeEventListener('resize', this.onResize);
    this.routerSub?.unsubscribe();
  }

  toggleSidebar(): void {
    if (this.isMobile) {
      this.mobileOpen = !this.mobileOpen;
      return;
    }
    this.collapsed = !this.collapsed;
  }

  closeMobileMenu(): void {
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

  private buildCrumbs(url: string): SsBreadcrumbItem[] {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const trail = this.findMenuTrail(cleanUrl, this.menu.getMenu());
    return trail.length ? trail : [{ label: 'Trang chủ', path: '/dashboard' }];
  }

  private findMenuTrail(
    url: string,
    items: MenuItem[],
    parents: SsBreadcrumbItem[] = [],
  ): SsBreadcrumbItem[] {
    for (const item of items) {
      const current = [...parents, { label: item.label, path: item.path }];
      if (
        item.path === url ||
        (!!item.path && item.path !== '/' && url.startsWith(`${item.path}/`))
      ) {
        return current;
      }
      if (item.children?.length) {
        const childTrail = this.findMenuTrail(url, item.children, current);
        if (childTrail.length) return childTrail;
      }
    }
    return [];
  }
}
