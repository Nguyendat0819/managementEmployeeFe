import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  // Form Controls
  SsButtonComponent,
  SsInputComponent,
  SsTextareaComponent,
  SsInputGroupComponent,
  SsSelectComponent,
  SsMultiselectComponent,
  SsRadioComponent,
  SsCheckboxComponent,
  SsSwitchComponent,
  SsProgressBarComponent,
  SsDatepickerComponent,
  SsInputNumberComponent,
  SsCurrencyComponent,
  SsPercentComponent,
  SsChipsComponent,
  SsUploadComponent,
  SsDialogComponent,
  SsPopupComponent,

  // Data Display
  SsDataTableComponent,
  SsCardComponent,
  SsTreeTableComponent,
  SsTagComponent,
  SsBadgeComponent,
  SsDescriptionsComponent,

  // Navigation
  SsTabComponent,
  SsTabsComponent,
  SsBreadcrumbComponent,

  // Feedback
  SsAlertComponent,
  SsSpinComponent,
  SsLoadingOverlayComponent,
  SsTooltipComponent,
} from '@platform/ui-kit';

const UI_KIT_COMPONENTS = [
  // Form Controls
  SsButtonComponent,
  SsInputComponent,
  SsTextareaComponent,
  SsInputGroupComponent,
  SsSelectComponent,
  SsMultiselectComponent,
  SsRadioComponent,
  SsCheckboxComponent,
  SsSwitchComponent,
  SsProgressBarComponent,
  SsDatepickerComponent,
  SsInputNumberComponent,
  SsCurrencyComponent,
  SsPercentComponent,
  SsChipsComponent,
  SsUploadComponent,
  SsDialogComponent,
  SsPopupComponent,

  // Data Display
  SsDataTableComponent,
  SsCardComponent,
  SsTreeTableComponent,
  SsTagComponent,
  SsBadgeComponent,
  SsDescriptionsComponent,

  // Navigation
  SsTabComponent,
  SsTabsComponent,
  SsBreadcrumbComponent,

  // Feedback
  SsAlertComponent,
  SsSpinComponent,
  SsLoadingOverlayComponent,
  SsTooltipComponent,
];

/**
 * UiKitModule gom và tái xuất toàn bộ các component chuẩn từ `@platform/ui-kit`.
 * Cho phép các module và standalone components import tiện lợi qua `@shared`.
 */
@NgModule({
  imports: [...UI_KIT_COMPONENTS],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ...UI_KIT_COMPONENTS,
  ],
})
export class UiKitModule {}