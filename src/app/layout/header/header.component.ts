import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SsBreadcrumbComponent, SsBreadcrumbItem, SsButtonComponent } from '@platform/ui-kit';
import { HEADER_CRUMB_MAX_ITEMS, LayoutWidthMode } from '@core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, SsBreadcrumbComponent, SsButtonComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly defaultBreadcrumbItems: SsBreadcrumbItem[] = [
    { label: 'Trang chủ', path: '/dashboard' },
  ];

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
    return this.breadcrumbItems.length
      ? this.breadcrumbItems[this.breadcrumbItems.length - 1].label
      : '';
  }

  get breadcrumbItems(): SsBreadcrumbItem[] {
    return this.crumbs.length ? this.crumbs : this.defaultBreadcrumbItems;
  }

  emitMenuToggle(): void {
    this.menuToggle.emit();
  }
}
