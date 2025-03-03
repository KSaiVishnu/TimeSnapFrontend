import { Component } from '@angular/core';
import { FileUploadComponent } from './file-upload/file-upload.component';
import {  MatTabsModule } from '@angular/material/tabs';

import { ChangeDetectionStrategy } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';

import { AllTasksComponent } from "./all-tasks/all-tasks.component";
import { AllTimesheetsComponent } from "./all-timesheets/all-timesheets.component";
import { EmployeesComponent } from "./employees/employees.component";

@Component({
  selector: 'app-admin',
  imports: [
    FileUploadComponent,
    MatTabsModule,
    AllTasksComponent,
    AllTimesheetsComponent,
    EmployeesComponent
],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent {

}
