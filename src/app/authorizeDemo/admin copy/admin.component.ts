import { Component } from '@angular/core';
import { FileUploadComponent } from './file-upload/file-upload.component';
import {  MatTabsModule } from '@angular/material/tabs';

import { ChangeDetectionStrategy } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';

import { AllTasksComponent } from "./all-tasks/all-tasks.component";
import { AllTimesheetsComponent } from "./all-timesheets/all-timesheets.component";
import { EmployeesComponent } from "./employees/employees.component";
import { BillableComponent } from "./billable/billable.component";
import { NonBillableComponent } from "./non-billable/non-billable.component";
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DummyTimesheetComponent } from "../../dummy-timesheet/dummy-timesheet.component";

@Component({
  selector: 'app-admin',
  imports: [
    FileUploadComponent,
    MatTabsModule,
    AllTasksComponent,
    AllTimesheetsComponent,
    EmployeesComponent,
    BillableComponent,
    NonBillableComponent,
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
    DummyTimesheetComponent
],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent {

}
