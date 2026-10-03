import {
  ApplicationConfig,
  provideZoneChangeDetection,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import {
  BellOutline,
  EyeInvisibleOutline,
  EyeOutline,
  HomeOutline,
  LogoutOutline,
  MenuOutline,
  QuestionCircleOutline,
} from '@ant-design/icons-angular/icons';

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
    provideNzIcons([
      BellOutline,
      EyeInvisibleOutline,
      EyeOutline,
      HomeOutline,
      LogoutOutline,
      MenuOutline,
      QuestionCircleOutline,
    ]),
    provideAppInitializer(async () => {
      const auth = inject(AuthService);
      try {
        await auth.init();
      } catch (e) {
        console.error('[AppInit] Auth init failed:', e);
      }
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
