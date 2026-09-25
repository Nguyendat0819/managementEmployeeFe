import { Routes } from '@angular/router';
import { authGuard } from '@core';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./remote-entry/remote-entry.module').then((m) => m.RemoteEntryModule),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
