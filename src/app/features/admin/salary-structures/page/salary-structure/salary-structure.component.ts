import { Component } from '@angular/core';
import { AdminSalaryStructureComponent } from '../../components/salary-structure/admin-salary-structure.component';

@Component({
  selector: 'app-salary-structure-page',
  standalone: true,
  imports: [AdminSalaryStructureComponent],
  templateUrl: './salary-structure.component.html',
  styleUrl: './salary-structure.component.css',
})
export class SalaryStructureComponent {}
