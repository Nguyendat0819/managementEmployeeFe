import { Injectable, inject, signal } from '@angular/core';
import { MenuItem } from './menu-item.model';
import { MenuApiService, MenuRecord } from './menu-api.service';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly api = inject(MenuApiService);
  private readonly items = signal<MenuItem[]>([]);

  getMenu(): MenuItem[] {
    return this.items();
  }

  loadCurrentMenu(): void {
    this.api.current().subscribe({
      next: (response) => this.items.set(this.toTree(response.data)),
      error: () => this.items.set([]),
    });
  }

  private toTree(records: MenuRecord[]): MenuItem[] {
    const byCode = new Map<string, MenuItem>();
    const parentCodes = new Map<string, string | null>();
    records.forEach((record) => byCode.set(record.menuCode, {
      id: record.menuCode,
      label: record.label,
      icon: record.icon,
      iconColor: record.iconColor ?? undefined,
      path: record.path ?? undefined,
      order: record.sortOrder,
      children: [],
    }));
    records.forEach(record => {
      const parentCode = record.parentCode?.trim();
      parentCodes.set(record.menuCode, parentCode && byCode.has(parentCode) && parentCode !== record.menuCode ? parentCode : null);
    });

    const roots: MenuItem[] = [];
    records.forEach((record) => {
      const item = byCode.get(record.menuCode)!;
      const parentCode = parentCodes.get(record.menuCode);
      const parent = parentCode ? byCode.get(parentCode) : undefined;
      if (parent) parent.children!.push(item);
      else roots.push(item);
    });
    const sort = (items: MenuItem[]): MenuItem[] => items
      .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))
      .map((item) => ({ ...item, children: item.children?.length ? sort(item.children) : undefined }));
    return sort(roots);
  }
}
