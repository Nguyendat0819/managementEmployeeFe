import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { UiKitModule } from '../shared/ui-kit.module';
import { templateRoute } from '@features/template/template.routes';

/**
 * ĐIỂM DUY NHẤT shell nạp: loadRemoteModule(url, './Module').then(m => m.RemoteEntryModule)
 * Tên lớp 'RemoteEntryModule' là KHẾ ƯỚC CỐ ĐỊNH cho mọi MFE.
 */
const remoteRoutes: Routes = [
  { path: 'template', children: templateRoute },
];

@NgModule({
  imports: [SharedModule, UiKitModule, FormsModule, RouterModule.forChild(remoteRoutes)],
  exports: [RouterModule],
})
export class RemoteEntryModule {}
