import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FileUploadComponent } from '../../authorizeDemo/admin/file-upload/file-upload.component';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';

import { MatTabsModule } from '@angular/material/tabs';
import { TimesheetComponent } from '../timesheet/timesheet.component';

import { MatDialog } from '@angular/material/dialog';
import { AddLogModalComponent } from '../add-log-modal/add-log-modal.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PieChartComponent } from '../pie-chart/pie-chart.component';

// import {
//   CdkDragDrop,
//   // CdkDropList,
//   // CdkDrag,
//   DragDropModule ,
//   moveItemInArray,
//   transferArrayItem
// } from '@angular/cdk/drag-drop';

import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

import { MatTable, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { EditAssigneeNamesComponent } from "../../edit-assignee-names/edit-assignee-names.component";
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { environment } from '../../../environments/environment';


// export const ELEMENT_DATA: any = [];

@Component({
  selector: 'app-tasks',
  imports: [
    FormsModule,
    CommonModule,
    FileUploadComponent,
    MatTabsModule,
    TimesheetComponent,
    MatProgressSpinnerModule,
    PieChartComponent,
    // CdkDropList,
    // CdkDrag,
    DragDropModule,
    MatTableModule,
    MatIconModule,
    MatFormFieldModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    EditAssigneeNamesComponent,
    MatProgressBarModule
],
  providers: [provideNativeDateAdapter()],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
})
export class TasksComponent {
  tasks: any[] = [];
  isPanelOpen = false;
  selectedTask: any = null;
  timesheetId: any;

  currentStatus: string = 'initial';

  timesheets: any[] = [];

  baseURL = environment.apiBaseUrl;

  // @ViewChild('table', { static: true }) table: MatTable<any> | undefined;
  // displayedColumns: string[] = [
  //   'task',
  //   'status',
  //   'startDate',
  //   'dueDate',
  //   'save',
  // ];
  // ELEMENT_DATA: any = [];
  // dataSource: any = [];

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  // drop(event: CdkDragDrop<string>) {
  //   const previousIndex = this.dataSource.findIndex(
  //     (d: any) => d === event.item.data
  //   );

  //   moveItemInArray(this.dataSource, previousIndex, event.currentIndex);
  //   this.table!.renderRows();
  // }

  onChangeStatus(event: any) {
    console.log(event, event.target, event.target.value);
  }

  clickHandler(task: any) {
    if (!task.isStarted) {
      let startTime = new Date();
      const formattedDateTime = startTime
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');
      console.log(formattedDateTime);

      //Query For retreiving time in IST.
      // SELECT StartTime AT TIME ZONE 'UTC' AT TIME ZONE 'India Standard Time' AS starttime,* FROM Timesheets

      const timesheetEntry = {
        empId: this.empId,
        taskId: task.id,
        startTime: new Date().toISOString().slice(0, 19),
        endDate: null,
        totalMinutes: 0,
      };

      this.http
        .post(`${this.baseURL}/timesheet`, timesheetEntry)
        .subscribe({
          next: (res: any) => {
            this.timesheetId = res.id;
          },
          error: (err: any) =>
            console.log('error while adding time sheet:\n', err),
        });
    }

    task.isStarted = true;
    if (task.status != '2') {
      task.status = '1';
    }
    if (!task.isRunning) {
      task.timerId = setInterval(() => {
        task.ss++;
        if (task.ss >= 60) {
          task.mm++;
          task.ss = 0;
        }
        if (task.mm >= 60) {
          task.hh++;
          task.mm = 0;
        }
      }, 1000);

      // Need To call POST API. -> Start API...
      // const timesheet = {
      //   taskId: task.id,
      //   empId: this.empId
      // };

      // this.http.post(`/start`,  timesheet )
      // .subscribe((res: any) => {
      //   this.timesheetId = res.id;
      // });
    } else {
      clearInterval(task.timerId);
      task.timerId = null;
    }
    task.isRunning = !task.isRunning;
  }

  onStopTask(task: any) {
    let totalMinutes = task.hh * 60 + task.mm + task.ss / 60;

    task.isStarted = false;
    clearInterval(task.timerId);
    task.timerId = null;
    task.isRunning = false;
    task.hh = 0;
    task.mm = 0;
    task.ss = 0;

    let endTime = new Date().toISOString();
    // const formattedDateTime = endTime.toISOString();
    // console.log(endTime, typeof(endTime));
    //  endTime = this.formatDateTime(new Date().toISOString());
    // console.log(endTime,typeof(endTime));

    this.http
      .put(`${this.baseURL}/timesheet/${this.timesheetId}`, {
        endTime,
        totalMinutes,
      })
      .subscribe({
        next: (res: any) => {
          console.log('End Time Updated:', res);
        },
        error: (err: any) =>
          console.log('error while Updating Time Sheet:\n', err),
      });
  }

  format(num: number) {
    return (num + '').length === 1 ? '0' + num : num + '';
  }

  getTimesheetsForTask(taskId: number): void {
    this.http
      .get(`${this.baseURL}/tasks/${taskId}/timesheets`)
      .subscribe({
        next: (response: any) => {
          this.timesheets = response;
          console.log('Timesheets:', this.timesheets);
        },
        error: (error: any) => {
          if (error.status === 404) {
            this.timesheets = [];
          } else {
            console.error('Error fetching timesheets:', error);
          }
        },
      });
  }

  openTask(task: any) {
    this.selectedTask = task;
    this.isPanelOpen = true;
    this.getTimesheetsForTask(task.id);
  }

  closePanel() {
    this.isPanelOpen = false;
  }

  taskStatusMap: { [key: number]: string } = {
    0: 'NotStarted',
    1: 'InProgress',
    2: 'Completed',
  };

  convertStatus(status: number): string {
    return this.taskStatusMap[status] || 'NotStarted'; // Default to 'NotStarted'
  }

  taskStatusMap1: { [key: number]: number } = {
    0: 0,
    1: 1,
    2: 2,
  };

  convertStatus1(status: number): number {
    return this.taskStatusMap1[status] || 0; // Default to 'NotStarted'
  }

  name: any;
  email: any;
  empId: any;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService,
    private dialog: MatDialog,
    private router: Router
  ) {
    // var form = this.authService.getForm();
    //   this.name = form.fullName
    //   console.log(form)
    // this.userService.getUserProfile().subscribe({
    //   next: (res: any) => {
    //     this.name = res.fullName;
    //     this.email = res.email;
    //     this.empId = res.empId;
    //   },
    //   error: (err: any) =>
    //     console.log('error while retrieving user profile:\n', err),
    // });
    // console.log("Constructor");
    // console.log(this.empId);
  }

  openAddLogModal(empId: any, taskId: any) {
    console.log(empId);
    this.dialog.open(AddLogModalComponent, {
      width: '50%',
      data: { empId, taskId },
    });
  }

  ngOnInit() {
    this.currentStatus = 'loading';
    let userDetails = this.userService.getUserDetails();
    console.log(userDetails());
    if(!userDetails()){
      this.userService.getUserProfile().subscribe({
        next: (res: any) => {
          this.name = res.fullName;
          this.email = res.email;
          this.empId = res.empId;
          this.fetchTasks();
        },
        error: (err: any) =>
          console.log('error while retrieving user profile:\n', err),
      });
    }
    else{
      this.name = userDetails().fullName;
      this.email = userDetails().email;
      this.empId = userDetails().empId;
      this.fetchTasks();
    }

    this.range.valueChanges.subscribe(() => {
      this.categorizeTasks();
    });
  }

  pendingTasks: any = [];
  inProgressTasks: any = [];
  completedTasks: any = [];

  categorizeTasks() {
    const startDate = this.range.value.start
      ? new Date(this.range.value.start)
      : null;
    const endDate = this.range.value.end
      ? new Date(this.range.value.end)
      : null;

    if (startDate) {
      startDate.setHours(0, 0, 0, 0); // Set to 00:00:00
    }

    if (endDate) {
      endDate.setHours(23, 59, 59, 999); // Optional: Set to end of the day
    }

    // console.log(startDate, endDate)

    let filteredTasks = [];

    filteredTasks = this.tasks.filter((task) => {
      console.log(task);
      const taskStartDate = new Date(task.startDate);
      const tastEndDate = new Date(task.dueDate);

      // console.log(taskStartDate, tastEndDate, startDate, endDate);

      return (
        ((!startDate || taskStartDate >= startDate) &&
          (!endDate || taskStartDate <= endDate)) ||
        ((!startDate || tastEndDate >= startDate) &&
          (!endDate || tastEndDate <= endDate))
      );
    });

    this.pendingTasks = filteredTasks.filter((t) => t.status === 0);
    this.inProgressTasks = filteredTasks.filter((t) => t.status === 1);
    this.completedTasks = filteredTasks.filter((t) => t.status === 2);

    console.log(this.pendingTasks);
    // this.dataSource = [...this.pendingTasks];

    // this.dataSource = this.pendingTasks.map((each:any) => {
    //   return({
    //     task:each.task,
    //     status: each.status,
    //     startDate: each.startDate,
    //     dueDate: each.dueDate,
    //     save:'saved'
    //   })
    // })

    if (this.pendingTasks.length > 0) {
      this.currentStatus = 'success';
    } else {
      this.currentStatus = 'no-tasks';
    }
  }
loading = true;

  fetchTasks() {
    if (!this.empId) {
      console.log('EmpId is undefined, cannot fetch tasks.');
      return;
    }
    this.loading = true; // Show skeletons while fetching data
    

    this.http
      .get<any[]>(`${this.baseURL}/tasks/${this.empId}`)
      .subscribe({
        next: (res: any) => {
          this.pendingTasks = [];
          this.inProgressTasks = [];
          this.completedTasks = [];

          const data = res.map((eachItem: any) => {
            console.log(eachItem);
            if (eachItem.status === 'NotStarted') {
              this.pendingTasks = eachItem.tasks;
            } else if (eachItem.status === 'InProgress') {
              this.inProgressTasks = eachItem.tasks;
            } else if (eachItem.status === 'Completed') {
              this.completedTasks = eachItem.tasks;
            }
            this.tasks = [...this.tasks, ...eachItem.tasks];
            console.log(eachItem.tasks);
          });

          console.log(this.pendingTasks);
          console.log(this.inProgressTasks);
          console.log(this.completedTasks);

          if (this.tasks.length > 0) {
            this.currentStatus = 'success';
          } else {
            this.currentStatus = 'no-tasks';
          }
          

          this.loading = false; // Hide skeletons when data is loaded


          // this.tasks = res.map((task: any) => ({
          //   ...task,
          //   hh: 0,
          //   mm: 0,
          //   ss: 0,
          //   isRunning: false,
          //   isStarted: false,
          //   timerId: null,
          // }));
          // this.categorizeTasks();

          // console.log(this.tasks);
        },
        error: (err) => {
          console.log(err);
          this.loading = false; // Hide skeletons when data is loaded

        },
      });
  }

  // filterTasksAfterSaving(updatedTask:any){
  //   this.tasks = this.tasks.filter(t => t.id !== updatedTask.id);
  //   console.log(this.tasks);

  //   let updatedTask1 = {
  //     ...updatedTask,
  //     hh: 0,
  //     mm: 0,
  //     ss: 0,
  //     isRunning: false,
  //     timerId: null
  //   };
  //   this.tasks.push(updatedTask1);
  //   this.categorizeTasks();
  // }

  onSaveTask(task: any) {
    console.log(task);
    let updatedTask = {
      id: task.id,
      task: task.task,
      assignee: task.assignee,
      startDate: task.startDate,
      dueDate: task.dueDate,
      status: this.taskStatusMap1[task.status],
      // status:task.status,
      billingType: task.billingType,
      empId: task.empId,
      taskID: task.taskID,
    };

    console.log('Updating Task:', updatedTask);

    this.http
      .put(`${this.baseURL}{/tasks/${task.id}`, updatedTask)
      .subscribe({
        next: (response: any) => {
          console.log('Task updated:', response);
          // this.fetchTasks();
          // alert('Task updated successfully!');
          // Remove the task from the old list

          // console.log(this.tasks);
          // this.filterTasksAfterSaving(updatedTask);

          // this.tasks = this.tasks.filter(t => t.id !== task.id);
          // let updatedTask1 = {
          //   ...updatedTask,
          //   hh: 0,
          //   mm: 0,
          //   ss: 0,
          //   isRunning: false,
          //   timerId: null
          // };
          // this.tasks.push(updatedTask1);
          // this.categorizeTasks();

          // location.reload();
          //  Update the task locally without refreshing
          // let index = this.tasks.findIndex(t => t.id === task.id);
          // if (index !== -1) {
          //   this.tasks[index] = { ...this.tasks[index], ...updatedTask };
          // }
        },
        error: (err) => {
          console.error('Error updating task:', err);
          alert('Error updating task');
        },
      });
  }

  // drop(event: CdkDragDrop<any[]>) {
  //   if (event.previousContainer === event.container) {
  //     moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  //   } else {
  //     transferArrayItem(
  //       event.previousContainer.data,
  //       event.container.data,
  //       event.previousIndex,
  //       event.currentIndex
  //     );
  //   }
  // }

  //   drop(event: CdkDragDrop<any[]>) {
  //     console.log("Dropped Event:", event);
  //     console.log("Previous Container:", event.previousContainer.data);
  //     console.log("Current Container:", event.container.data);
  //     console.log("Item Moved:", event.item.data); // Ensure this logs the correct task

  //     const movedTask = event.item.data; // Get the moved task
  //     if (!movedTask) {
  //       console.error("Task data is undefined!");
  //       return;
  //     }

  //     // Remove from previous container
  //     event.previousContainer.data.splice(event.previousIndex, 1);

  //     // Update status if needed (example: moving to 'In Progress')
  //     movedTask.status = 1; // Change this based on your columns

  //     // Add to new container
  //     event.container.data.splice(event.currentIndex, 0, movedTask);

  //     this.pendingTasks = [...this.pendingTasks]; // If moving in 'To Do' list
  // this.inProgressTasks = [...this.inProgressTasks]; // If moving in 'In Progress'
  // this.completedTasks = [...this.completedTasks]; // If moving in 'Completed'

  //   }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      // If dropped in the same container, just reorder
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      // If dropped in a different container, transfer
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Update status after moving
      const movedTask = event.container.data[event.currentIndex];
      movedTask.status = this.getStatusFromContainer(event.container.id);

      this.onSaveTask(movedTask);

      // console.log(this.getStatusFromContainer(event.container.id));
      // console.log(event.container.id);
      // console.log(event);
    }
  }
  dragging: boolean = false;

  goToTaskDetails(id: any) {
    console.log(id);
    this.router.navigate(['tasks', id]); // Correct path format
  }
  

  getStatusFromContainer(containerId: string): number {
    switch (containerId) {
      case 'todoContainer':
        return 0; // Not Started
      case 'inProgressContainer':
        return 1; // In Progress
      case 'completedContainer':
        return 2; // Completed
      default:
        return 0;
    }
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return '';

    let date = new Date(dateString);

    let istOffset = 5.5 * 60 * 60 * 1000;
    let istDate = new Date(date.getTime() + istOffset);

    return istDate.toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }

  formatDateTime1(dateString: string): string {
    if (!dateString) return '';

    let date = new Date(dateString);

    // let istOffset = 5.5 * 60 * 60 * 1000;
    // let istDate = new Date(date.getTime() + istOffset);

    let istDate = new Date(date.getTime());

    return istDate.toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }

  // formatTime(dateString: string): string {
  //   if (!dateString) return '';

  //   let date = new Date(dateString);

  //   // Convert UTC to IST (+5:30)
  //   let istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
  //   let istDate = new Date(date.getTime() + istOffset);

  //   return istDate.toLocaleString('en-IN', {
  //     hour: '2-digit',
  //     minute: '2-digit',
  //     second: '2-digit',
  //     hour12: true, // Set false for 24-hour format
  //   });
  // }

  // formatDate(dateString: string): string {
  //   if (!dateString) return '';

  //   let date = new Date(dateString);

  //   // Convert UTC to IST (+5:30)
  //   let istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
  //   let istDate = new Date(date.getTime() + istOffset);

  //   return istDate.toLocaleString('en-IN', {
  //     year: 'numeric',
  //     month: '2-digit',
  //     day: '2-digit',
  //     hour12: true, // Set false for 24-hour format
  //   });
  // }

  roundOf(min: any) {
    return Math.round(min);
  }
  clearDateRange() {
    this.range.reset(); // Clears selected dates
  }
  isDateSelected(): boolean {
    return !!this.range.value.start || !!this.range.value.end;
  }
}
