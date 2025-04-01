import { Component } from '@angular/core';
import { TaskReportComponent } from "../../../task-report/task-report.component";

@Component({
  selector: 'app-reports',
  imports: [TaskReportComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {

}
