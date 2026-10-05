import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@platform/shared';
import { MenuService } from '@core/menu/menu.service';
import { MenuItem } from '@core/menu/menu-item.model';
import { PermissionService } from '@core/services/permission.service';
import { SharedModule } from '@shared/shared.module';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggleCollapsed = new EventEmitter<void>();
  @Output() navigate = new EventEmitter<void>();

  protected readonly auth = inject(AuthService);
  protected readonly menuService = inject(MenuService);
  private readonly permissionService = inject(PermissionService);
  protected readonly menuItems = this.filterMenu(this.menuService.getMenu());
  private readonly router = inject(Router);

  openMap: Record<string, boolean> = {};

  get displayName(): string {
    const claims = this.auth.claims;
    return (
      this.stringClaim(claims, 'user', 'userName', 'username', 'name', 'preferred_username') ??
      'HRM User'
    );
  }

  get roleName(): string {
    const roles = this.auth.claims['roles'];
    if (Array.isArray(roles) && typeof roles[0] === 'string') return roles[0];
    return this.stringClaim(this.auth.claims, 'role') ?? 'Nhân sự';
  }

  isActive(item: MenuItem): boolean {
    if (!item.path) return false;
    const url = this.router.url.split('?')[0].split('#')[0];
    return url === item.path || (item.path !== '/' && url.startsWith(`${item.path}/`));
  }

  emitToggleCollapsed(): void {
    this.toggleCollapsed.emit();
  }

  onNavigate(): void {
    this.navigate.emit();
  }

  trackById(_index: number, item: MenuItem): string {
    return item.id;
  }

  navigateTo(item: MenuItem): void {
    if (!item.path) return;
    void this.router.navigateByUrl(item.path);
    this.onNavigate();
  }

  onOpenChange(id: string, open: boolean): void {
    if (!open) {
      const next = { ...this.openMap };
      delete next[id];
      this.openMap = next;
      return;
    }

    const next: Record<string, boolean> = {};
    for (const ancestor of this.ancestorsOf(id)) next[ancestor] = true;
    next[id] = true;
    this.openMap = next;
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login'], { replaceUrl: true });
  }

  private ancestorsOf(id: string): string[] {
    const found: string[] = [];

    const walk = (items: MenuItem[], trail: string[]): boolean => {
      for (const item of items) {
        if (item.id === id) {
          found.push(...trail);
          return true;
        }
        if (item.children?.length && walk(item.children, [...trail, item.id])) return true;
      }
      return false;
    };

    walk(this.menuItems, []);
    return found;
  }

  private filterMenu(items: MenuItem[]): MenuItem[] {
    return items.reduce<MenuItem[]>((visible, item) => {
      const children = item.children ? this.filterMenu(item.children) : undefined;
      const isAllowed = this.permissionService.canAccess(item);
      const hasVisibleChildren = !!children?.length;

      if (isAllowed && (!item.children?.length || hasVisibleChildren)) {
        visible.push({ ...item, children });
      }

      return visible;
    }, []);
  }

  private stringClaim(claims: Record<string, unknown>, ...keys: string[]): string | null {
    for (const key of keys) {
      const value = claims[key];
      if (typeof value === 'string' && value.trim()) return value;
    }
    return null;
  }
}
