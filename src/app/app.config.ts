import {
  ApplicationConfig,
  provideZoneChangeDetection,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, Router } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideOAuthClient } from 'angular-oauth2-oidc';

import { authInterceptor, AUTH_CONFIG, AuthService } from '@platform/shared';
import { SS_ERROR_MESSAGES, SS_DEFAULT_ERROR_MESSAGES } from '@platform/ui-kit';
import { environment } from '@env/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    provideNzI18n(en_US),
    provideOAuthClient(),
    provideAppInitializer(async () => {
      const auth = inject(AuthService);
      const router = inject(Router);
      await auth.init();

    }),
    {
      provide: AUTH_CONFIG,
      useValue: environment.auth,
    },
    {
      provide: SS_ERROR_MESSAGES,
      useValue: SS_DEFAULT_ERROR_MESSAGES,
    },
  ],
};
