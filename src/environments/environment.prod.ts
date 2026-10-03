import { AuthConfigOptions } from '@platform/shared';

export const environment = {
  production: true,
  apiBaseUrl: 'http://localhost:8080',
  contextPath: 'employee-service',
  auth: {
    apiBaseUrl: 'http://localhost:8080',
    loginPath: '/employee-service/api/auth/login',
    mePath: '/employee-service/api/auth/me',
    storageKey: 'employee-service.auth',
  } as AuthConfigOptions,
};
