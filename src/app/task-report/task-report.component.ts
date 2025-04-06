import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TaskService, TaskCompletion } from '../shared/services/task.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../loading/loading.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../shared/services/error-handler.service';

enum ApiStatus {
  INITIAL = 'INITIAL',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

@Component({
  selector: 'app-task-report',
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './task-report.component.html',
  styleUrl: './task-report.component.css',
})
export class TaskReportComponent implements OnInit {
  selectedMonths: number = 12;
  paginatedData: any;
  groupedTasks: any[] = [];
  completedTasks: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  apiStatus: ApiStatus = ApiStatus.INITIAL;
  errorMessage: string = '';
  errorStatus: number | null = null;

  constructor(
    private tasksService: TaskService,
    private errorHandler: ErrorHandlerService, // Injected error handler service
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCompletedTasks();
  }

  loadCompletedTasks(): void {
    this.apiStatus = ApiStatus.IN_PROGRESS;
    this.tasksService.getCompletedTasks(this.selectedMonths).subscribe({
      next: (data) => {
        // data = [];
        this.completedTasks = data;
        this.groupedTasks = this.groupTasksByEmployee(this.completedTasks);
        this.currentPage = 1;
        this.paginateData();
        this.apiStatus = ApiStatus.SUCCESS;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.apiStatus = ApiStatus.FAILURE;
        const errorInfo = this.errorHandler.getErrorMessage(error); // Used reusable error handler
        this.errorStatus = errorInfo.status;
        this.errorMessage = errorInfo.message;
        this.cdr.detectChanges();
      },
    });
  }

  getDaysDifference(startDate: string, completedDate: string): number {
    const start = new Date(startDate);
    const completed = new Date(completedDate);
    const diffTime = Math.abs(completed.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
  }

  onRetry(): void {
    this.loadCompletedTasks();
  }

  paginateData(): void {
    const startIdx = (this.currentPage - 1) * this.pageSize;
    this.paginatedData = this.groupedTasks.slice(
      startIdx,
      startIdx + this.pageSize
    );
    // this.paginatedData = [];
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateData();
    }
  }

  nextPage(): void {
    if (this.currentPage * this.pageSize < this.groupedTasks.length) {
      this.currentPage++;
      this.paginateData();
    }
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
        billingType: task.billingType,
      });
      acc[key].totalTasksCompleted++;
      acc[key].totalHoursSpent += task.totalHours;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  }
}
