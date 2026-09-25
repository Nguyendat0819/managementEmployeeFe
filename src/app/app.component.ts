import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Root STANDALONE (bắt buộc cho bootstrapApplication) — chỉ là vỏ khi chạy độc lập.
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
export class AppComponent {}
