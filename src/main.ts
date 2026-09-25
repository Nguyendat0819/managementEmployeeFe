import 'zone.js';
import { logError } from './app/core/log/logger';

import('./bootstrap')
  .catch((err) => logError(err));
