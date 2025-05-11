import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DurationPipe } from '../../../shared/pipes/duration.pipe';

interface Timesheet {
  taskId: string;
  taskName: string;
  totalMinutes: number;
  notes: string;
  billingType: string;
  projectCode?: string;
  status?: string;
}

@Component({
  selector: 'app-timesheet-entry',
  templateUrl: './timesheet-entry.component.html',
  styleUrls: ['./timesheet-entry.component.css'],
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatTooltipModule,
    DurationPipe
  ]
})
export class TimesheetEntryComponent {
  @Input() entry!: Timesheet;
  
  // Status and billing type class mappers
  getStatusClass(status: string): string {
    if (!status) return 'status-default';
    
    switch (status.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'in progress':
        return 'status-in-progress';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-default';
    }
  }

  getBillingTypeClass(type: string): string {
    if (!type) return 'billing-default';
    
    switch (type.toLowerCase()) {
      case 'billable':
        return 'billing-billable';
      case 'non-billable':
        return 'billing-non-billable';
      case 'internal':
        return 'billing-internal';
      default:
        return 'billing-default';
    }
  }

  getStatusIcon(status: string): string {
    if (!status) return 'help_outline';
    
    switch (status.toLowerCase()) {
      case 'completed':
        return 'check_circle';
      case 'in progress':
        return 'pending_actions';
      case 'pending':
        return 'schedule';
      default:
        return 'help_outline';
    }
  }
}