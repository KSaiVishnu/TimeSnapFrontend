import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TaskService, TaskCompletion } from '../shared/services/task.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from "../loading/loading.component";

@Component({
  selector: 'app-task-report',
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './task-report.component.html',
  styleUrl: './task-report.component.css'
})
export class TaskReportComponent implements OnInit {
  completedTasks: any[] = [];
  groupedTasks: any;
  currentPage = 1;
  pageSize = 1; // Show 1 employee per page

  selectedMonths: any = 12;

  constructor(private tasksService: TaskService,private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadCompletedTasks();
  }

  loadCompletedTasks() {
    console.log(this.selectedMonths);

    // if(this.selectedMonths == "6") this.selectedMonths = 6;
    // else if (this.selectedMonths == "3") this.selectedMonths = 3;

    this.tasksService.getCompletedTasks(this.selectedMonths).subscribe(
      (data) => {
        console.log(data);
        this.completedTasks = data;
        this.groupedTasks = this.groupTasksByEmployee(this.completedTasks);
        this.cdr.detectChanges(); // Force change detection


      },
      (error) => {
        console.error('Error fetching completed tasks:', error);
      }
    );
  }

  nextPage() {
    if (this.currentPage * this.pageSize < this.groupedTasks.length) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  get paginatedData() {
    if (!this.groupedTasks || this.groupedTasks.length === 0) {
      return []; // Return empty array if data is not yet available
    }
    const start = (this.currentPage - 1) * this.pageSize;
    return this.groupedTasks.slice(start, start + this.pageSize);
  }
  




  groupTasksByEmployee(tasks: any[]): any[] {
    const grouped = tasks.reduce((acc, task) => {
      const key = task.employeeId;
      if (!acc[key]) {
        acc[key] = {
          employeeId: task.employeeId,
          userName: task.userName,
          billingType: task.billingType,
          totalTasksCompleted: 0,
          totalHoursSpent: 0,
          tasks: [],
        };
      }
      acc[key].tasks.push({
        taskId: task.taskId,
        taskName: task.taskName,
        startDate: task.startDate,
        completedDate: task.completedDate,
        totalHours: task.totalHours,
        billingType: task.billingType
      });
      acc[key].totalTasksCompleted++;
      acc[key].totalHoursSpent += task.totalHours;
      return acc;
    }, {} as Record<string, any>);
  
    return Object.values(grouped);
  }
  
  
}
