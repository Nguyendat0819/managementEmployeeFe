import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { AdminPayrollRunComponent } from '../../components/payroll-run/admin-payroll-run.component';

@Component({
  selector: 'app-payroll-run-page',
  standalone: true,
  imports: [AdminPayrollRunComponent],
  templateUrl: './payroll-run.component.html',
  styleUrl: './payroll-run.component.css',
})
export class PayrollRunComponent {
  readonly detailRunId = toSignal(
    inject(ActivatedRoute).paramMap.pipe(
      map((params) => {
        const value = params.get('runId');
        if (!value) return null;
        const id = Number(value);
        return Number.isInteger(id) && id > 0 ? id : null;
      }),
    ),
    { initialValue: null },
  );
}
