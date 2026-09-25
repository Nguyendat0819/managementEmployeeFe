import { AuthConfigOptions } from '@platform/shared';

export const environment = {
  production: true,
  apiBaseUrl: 'http://localhost:8080',
  contextPath: '',
  auth: {
    issuer: 'http://localhost:8180/realms/platform',
    clientId: 'Auth',
    apiBaseUrl: 'http://localhost:8080',
    requireHttps: true,
    debug: false,
    scope: 'openid profile email',
  } as AuthConfigOptions,
};
