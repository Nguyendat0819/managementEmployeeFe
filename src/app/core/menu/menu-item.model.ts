export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  iconColor?: string;
  path?: string;
  order: number;
  children?: MenuItem[];

  roles?: string[];
  permissions?: string[];
}
