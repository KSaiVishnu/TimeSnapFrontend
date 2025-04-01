import { Component } from '@angular/core';
import {  MatTabsModule } from '@angular/material/tabs';
import { AllTasksComponent } from "../all-tasks/all-tasks.component";
import { AllTimesheetsComponent } from '../all-timesheets/all-timesheets.component';

@Component({
  selector: 'app-non-billable',
  imports: [MatTabsModule, AllTasksComponent, AllTimesheetsComponent],
  templateUrl: './non-billable.component.html',
  styleUrl: './non-billable.component.css'
})
export class NonBillableComponent {

}
