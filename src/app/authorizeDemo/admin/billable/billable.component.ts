import { Component } from '@angular/core';
import {  MatTabsModule } from '@angular/material/tabs';
import { AllTasksComponent } from "../all-tasks/all-tasks.component";
import { AllTimesheetsComponent } from '../all-timesheets/all-timesheets.component';

@Component({
  selector: 'app-billable',
  imports: [MatTabsModule, AllTasksComponent, AllTimesheetsComponent],
  templateUrl: './billable.component.html',
  styleUrl: './billable.component.css'
})
export class BillableComponent {

}
