import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSpinModule } from 'ng-zorro-antd/spin';

const SHARED = [
  CommonModule,
  RouterModule,
  NzLayoutModule,
  NzMenuModule,
  NzButtonModule,
  NzIconModule,
  NzAvatarModule,
  NzDropDownModule,
  NzTableModule,
  NzSpinModule,
];

@NgModule({
  imports: SHARED,
  exports: SHARED,
})
export class SharedModule {}
