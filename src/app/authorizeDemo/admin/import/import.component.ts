import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorklogLeavesComponent } from "./worklog-leaves/worklog-leaves.component";
import { TimesheetUploadComponent } from "./timesheet-upload/timesheet-upload.component";
import { TaskUploadComponent } from './task-upload/task-upload.component';
import { LeavesUploadComponent } from "../../../leaves-upload/leaves-upload.component";

@Component({
  selector: 'app-import',
  imports: [FormsModule, CommonModule, WorklogLeavesComponent, TimesheetUploadComponent, TaskUploadComponent, LeavesUploadComponent],
  templateUrl: './import.component.html',
  styleUrl: './import.component.css'
})
export class ImportComponent {
  selectedOption: string = 'tasks'; // Default selection

}
