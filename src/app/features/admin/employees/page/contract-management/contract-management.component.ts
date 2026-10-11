import { Component } from '@angular/core';
import { AdminContractListComponent } from '../../components/contract-list/admin-contract-list.component';

@Component({
  selector: 'app-contract-management',
  standalone: true,
  imports: [AdminContractListComponent],
  templateUrl: './contract-management.component.html',
  styleUrl: './contract-management.component.css',
})
export class ContractManagementComponent {}
