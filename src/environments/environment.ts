import { AuthConfigOptions } from '@platform/shared';

export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080',
  contextPath: '',
  auth: {
    issuer: 'http://localhost:8180/realms/platform',
    clientId: 'Auth',
    apiBaseUrl: 'http://localhost:8080',
    requireHttps: false,
    debug: true,
    scope: 'openid profile email',
  } as AuthConfigOptions,
};
