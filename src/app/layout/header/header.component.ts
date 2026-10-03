import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SsBreadcrumbComponent, SsBreadcrumbItem, SsButtonComponent } from '@platform/ui-kit';
import { HEADER_CRUMB_MAX_ITEMS, LayoutWidthMode } from '@core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SsBreadcrumbComponent, SsButtonComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  @Input() crumbs: SsBreadcrumbItem[] = [];
  @Input() widthMode: LayoutWidthMode = 'wide';
  @Output() menuToggle = new EventEmitter<void>();

  get isMobile(): boolean {
    return this.widthMode === 'mobile';
  }

  get crumbMaxItems(): number {
    return this.widthMode === 'wide' ? 0 : HEADER_CRUMB_MAX_ITEMS;
  }

  get currentLabel(): string {
    return this.crumbs.length ? this.crumbs[this.crumbs.length - 1].label : '';
  }

  get visibleCrumbs(): SsBreadcrumbItem[] {
    return this.crumbMaxItems ? this.crumbs.slice(-this.crumbMaxItems) : this.crumbs;
  }

  emitMenuToggle(): void {
    this.menuToggle.emit();
  }
}
