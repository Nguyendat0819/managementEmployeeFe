import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { logError } from './app/core/log/logger';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => logError(err));
