import { Injectable } from '@angular/core';
import { MenuItem } from './menu-item.model';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly items: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Trang chủ',
      icon: 'home',
      path: '/dashboard',
      order: 10,
    },
  ];

  getMenu(): MenuItem[] {
    return this.items
      .map((item) => ({
        ...item,
        children: item.children ? [...item.children].sort((a, b) => a.order - b.order) : undefined,
      }))
      .sort((a, b) => a.order - b.order);
  }
}
