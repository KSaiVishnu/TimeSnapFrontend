import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TaskUploadComponent } from '../../authorizeDemo/admin/import/task-upload/task-upload.component';
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
import { EditAssigneeNamesComponent } from '../../edit-assignee-names/edit-assignee-names.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { environment } from '../../../environments/environment';
import { AddTaskPopupComponent } from '../../add-task-popup/add-task-popup.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TaskService, UpdateTask } from '../../shared/services/task.service';
import { AnyAaaaRecord } from 'dns';
import { ErrorHandlerService } from '../../shared/services/error-handler.service';
import { LoadingComponent } from '../../loading/loading.component';

// export const ELEMENT_DATA: any = [];

enum ApiStatus {
  INITIAL = 'INITIAL',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

@Component({
  selector: 'app-tasks',
  imports: [
    FormsModule,
    CommonModule,
    MatTabsModule,
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
    MatProgressBarModule,
    MatInputModule,
    MatSelectModule,
    LoadingComponent,
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

  allAssignees: { userName: string; employeeId: string; email: string }[] = []; // Store all users

  selectedDate = 'all';
  searchText = '';
  searchTaskId = '';
  selectedType = 'all';

  dragging = false;

  //   showDatePicker = false;
  // showTimePicker = false;

  // selectedDateForTask: string = '';
  // selectedTimeForTask: string = '';

  // onDateSelected() {
  //   console.log('Date selected:', this.selectedDateForTask);
  // }

  // onTimeSelected() {
  //   console.log('Time selected:', this.selectedTimeForTask);
  // }

  // saveTaskLog(task: any) {
  //   const log = {
  //     taskId: task.id,
  //     date: this.selectedDateForTask,
  //     time: this.selectedTimeForTask
  //   };

  //   console.log('Saving task log:', log);
  //   // Call your API or service here to save the log

  //   // Reset UI
  //   this.showDatePicker = false;
  //   this.showTimePicker = false;
  //   this.selectedDateForTask = '';
  //   this.selectedTimeForTask = '';
  // }

  showTimePicker = false;
  selectedDateForTask: string = '';
  selectedTimeForTask: string = '';
  timeOptions: string[] = ['1hr', '2hr', '3hr', '4hr', '5hr'];

  openDatePicker(input: HTMLInputElement) {
    input.click(); // triggers native date picker
  }

  onDateSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedDateForTask = input.value;
    console.log('Date selected:', this.selectedDateForTask);
  }

  onTimeSelected() {
    console.log('Time selected:', this.selectedTimeForTask);
  }

  saveTaskLog(task: any) {
    const log = {
      taskId: task.id,
      date: this.selectedDateForTask,
      time: this.selectedTimeForTask,
    };
    console.log('Saving task log:', log);

    // Reset
    this.selectedDateForTask = '';
    this.selectedTimeForTask = '';
    this.showTimePicker = false;
  }

  // Fetch all assignees from the UserEmployee table (API call)
  fetchAssignees() {
    this.http
      .get<{ userName: string; employeeId: string; email: string }[]>(
        `${this.baseURL}/user-employee`
      )
      .subscribe((data) => {
        this.allAssignees = data;
        console.log(this.allAssignees);
      });
  }

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

      this.http.post(`${this.baseURL}/timesheet`, timesheetEntry).subscribe({
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
    this.http.get(`${this.baseURL}/tasks/${taskId}/timesheets`).subscribe({
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
    private tasksService: TaskService,
    private errorHandler: ErrorHandlerService,
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

  openAddTaskPopup() {
    let allAssignees = this.allAssignees;
    let billingType = 'Billable';
    // console.log("iuytgf");

    let userDetails = {
      name: this.name,
      email: this.email,
      empId: this.empId,
    };

    const dialogRef = this.dialog.open(AddTaskPopupComponent, {
      width: '50%',
      data: { allAssignees, billingType, isEmployee: true, userDetails },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.status === 'success') {
        console.log(result.task);
        const newTask = {
          ...result.task[0],
          status: 0,
          completedDate: null,
        };
        console.log(newTask);
        this.allTasks = [...this.allTasks, newTask];
        console.log(this.allTasks);
        this.applyFilters();
      }
    });
  }
  searchControl = new FormControl('');

  ngOnInit() {
    this.currentStatus = 'loading';
    let userDetails = this.userService.getUserDetails();
    console.log(userDetails());
    if (!userDetails()) {
      this.userService.getUserProfile().subscribe({
        next: (res: any) => {
          this.name = res.fullName;
          this.email = res.email;
          this.empId = res.empId;
          // this.fetchTasks();
          this.loadTasks();
        },
        error: (err: any) =>
          console.log('error while retrieving user profile:\n', err),
      });
    } else {
      this.name = userDetails().fullName;
      this.email = userDetails().email;
      this.empId = userDetails().empId;
      // this.fetchTasks();
      this.loadTasks();
      // Apply search filtering in real-time
      this.searchControl.valueChanges.subscribe(() => {
        this.applyFilters();
      });
    }

    this.range.valueChanges.subscribe(() => {
      this.categorizeTasks();
    });

    this.fetchAssignees();
  }

  pendingTasks: any = [];
  inProgressTasks: any = [];
  completedTasks: any = [];

  filteredPendingTasks: any[] = []; // These will be modified when filtering
  filteredInProgressTasks: any[] = [];
  filteredCompletedTasks: any[] = [];

  filterTasks() {
    const search = this.searchText.toLowerCase();

    this.filteredPendingTasks = this.pendingTasks.filter((task: any) =>
      task.taskName.toLowerCase().includes(search)
    );

    this.filteredInProgressTasks = this.inProgressTasks.filter((task: any) =>
      task.taskName.toLowerCase().includes(search)
    );

    this.filteredCompletedTasks = this.completedTasks.filter((task: any) =>
      task.taskName.toLowerCase().includes(search)
    );

    const searchByTaskId = this.searchTaskId.toLowerCase();

    this.filteredPendingTasks = this.pendingTasks.filter((task: any) =>
      task.taskId.toLowerCase().includes(searchByTaskId)
    );

    this.filteredInProgressTasks = this.inProgressTasks.filter((task: any) =>
      task.taskId.toLowerCase().includes(searchByTaskId)
    );

    this.filteredCompletedTasks = this.completedTasks.filter((task: any) =>
      task.taskId.toLowerCase().includes(searchByTaskId)
    );
  }

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
  allTasks: any[] = []; // Stores all tasks fetched from API

  fetchTasks() {
    if (!this.empId) {
      console.log('EmpId is undefined, cannot fetch tasks.');
      return;
    }
    this.loading = true; // Show skeletons while fetching data

    this.http.get<any[]>(`${this.baseURL}/tasks/${this.empId}`).subscribe({
      next: (res: any) => {
        this.pendingTasks = [];
        this.inProgressTasks = [];
        this.completedTasks = [];

        console.log(res);

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

        this.filteredPendingTasks = [...this.pendingTasks];
        this.filteredInProgressTasks = [...this.inProgressTasks];
        this.filteredCompletedTasks = [...this.completedTasks];

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

  // STARTED HERE

  // loadTasks() {
  //   this.tasksService.getTasks(this.empId).subscribe((tasks: any[]) => {
  //     this.loading = false;
  //     this.allTasks = tasks;
  //     console.log(this.allTasks);
  //     this.applyFilters(); // Apply filters initially
  //   });
  // }

  apiStatus: ApiStatus = ApiStatus.INITIAL;
  errorMessage: string = '';
  errorStatus: number | null = null;

  private handleError(error: HttpErrorResponse) {
    const errorInfo = this.errorHandler.getErrorMessage(error);
    this.errorStatus = errorInfo.status;
    this.errorMessage = errorInfo.message;
  }

  loadTasks() {
    this.apiStatus = ApiStatus.IN_PROGRESS;

    this.tasksService.getTasks(this.empId).subscribe({
      next: (tasks: any[]) => {
        this.apiStatus = ApiStatus.SUCCESS;
        this.allTasks = tasks;
        console.log('Tasks loaded successfully:', this.allTasks);
        this.applyFilters(); // Apply filters initially
      },
      error: (error) => {
        this.apiStatus = ApiStatus.FAILURE;
        console.error('Error loading tasks:', error);
        this.handleError(error);
        // alert('Failed to load tasks. Please try again later.');
      },
    });
  }

  onRetry() {
    this.loadTasks();
  }

  applyFilters() {
    let filtered = [...this.allTasks];

    // Search by task name
    const searchText = this.searchText.toLowerCase();
    if (searchText) {
      filtered = filtered.filter((task) =>
        task.taskName.toLowerCase().includes(searchText)
      );
    }

    const searchByTaskId = this.searchTaskId.toLowerCase();
    if (searchByTaskId) {
      filtered = filtered.filter((task) =>
        task.taskId.toLowerCase().includes(searchByTaskId)
      );
    }

    // Filter by due date

    // if (this.selectedDate === 'today') {
    //   filtered = filtered.filter(
    //     (task) =>
    //       new Date(task.dueDate).toDateString() === new Date().toDateString()
    //   );
    // } else if (this.selectedDate === 'week') {
    //   const today = new Date();
    //   const weekEnd = new Date(today);
    //   weekEnd.setDate(today.getDate() + 7);
    //   console.log(weekEnd);
    //   filtered = filtered.filter(
    //     (task) =>
    //       new Date(task.dueDate) >= today && new Date(task.dueDate) <= weekEnd
    //   );
    // } else if (this.selectedDate === 'month') {
    //   const today = new Date();
    //   const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    //   filtered = filtered.filter(
    //     (task) =>
    //       new Date(task.dueDate) >= today && new Date(task.dueDate) <= monthEnd
    //   );
    // }

    if (this.selectedDate === 'today') {
      filtered = filtered.filter((task) => {
        const taskDueDate = new Date(task.dueDate).toDateString();
        const todayDate = new Date().toDateString();
        return taskDueDate === todayDate;
      });
    } else if (this.selectedDate === 'week') {
      const today = new Date();
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() + 7);

      // Normalize the time to ensure only the date is compared
      const todayDate = new Date(today.setHours(0, 0, 0, 0)).getTime();
      const weekEndDate = new Date(weekEnd.setHours(0, 0, 0, 0)).getTime();

      filtered = filtered.filter((task) => {
        const taskDueDate = new Date(task.dueDate).setHours(0, 0, 0, 0); // Strip the time part
        return taskDueDate >= todayDate && taskDueDate <= weekEndDate;
      });
    } else if (this.selectedDate === 'month') {
      const today = new Date();
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      // Normalize the time to ensure only the date is compared
      const todayDate = new Date(today.setHours(0, 0, 0, 0)).getTime();
      const monthEndDate = new Date(monthEnd.setHours(0, 0, 0, 0)).getTime();

      filtered = filtered.filter((task) => {
        const taskDueDate = new Date(task.dueDate).setHours(0, 0, 0, 0); // Strip the time part
        return taskDueDate >= todayDate && taskDueDate <= monthEndDate;
      });
    }

    if (this.selectedType === 'Billable') {
      filtered = filtered.filter((task) => task.billingType === 'Billable');
    } else if (this.selectedType === 'Non-Billable') {
      filtered = filtered.filter((task) => task.billingType === 'Non-Billable');

      console.log(this.selectedType);
    }

    // Categorize into 3 status groups
    this.pendingTasks = filtered.filter((t) => t.status === 0);
    this.inProgressTasks = filtered.filter((t) => t.status === 1);
    this.completedTasks = filtered.filter((t) => t.status === 2);
  }

  onFilterChange() {
    this.applyFilters();
  }

  onClearFilters() {
    console.log('d');
    this.selectedDate = 'all';
    this.searchText = '';
    this.searchTaskId = '';
    this.selectedType = 'all';
    this.applyFilters();
  }

  // onFilterChange() {
  //   this.tasksService
  //     .getFilteredTasks(
  //       this.empId,
  //       this.searchText,
  //       this.selectedDate,
  //       this.selectedType
  //     )
  //     .subscribe((data) => {
  //       this.tasks = data;
  //       this.categorizeTasks_1();
  //     });
  // }

  categorizeTasks_1() {
    this.pendingTasks = this.tasks.filter((task) => task.status === 0);
    this.inProgressTasks = this.tasks.filter((task) => task.status === 1);
    this.completedTasks = this.tasks.filter((task) => task.status === 2);

    console.log(this.pendingTasks);
    console.log(this.inProgressTasks);
    console.log(this.completedTasks);
  }

  // ENDED HERE.

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

  onCompleteTask(task: any) {
    const updateTask: UpdateTask = {
      status: 2,
      completedDate: new Date().toISOString(), // Set completedDate only if status is 2
    };

    task.status = 2;
    task.completedDate = new Date().toISOString();

    console.log(task);
    console.log(this.allTasks);
    console.log(updateTask);
    console.log(task.taskId, this.empId);

    this.tasksService
      .updateTaskStatus(task.taskId, this.empId, updateTask)
      .subscribe({
        next: (response) => {
          console.log('Task updated successfully:', response);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error updating task:', error);
        },
      });
  }

  onSaveTask(task: any) {
    console.log(task);
    // let updatedTask = {
    //   id: task.id,
    //   task: task.task,
    //   assignee: task.assignee,
    //   startDate: task.startDate,
    //   dueDate: task.dueDate,
    //   status: this.taskStatusMap1[task.status],
    //   // status:task.status,
    //   billingType: task.billingType,
    //   empId: task.empId,
    //   taskID: task.taskID,
    // };
    // console.log('Updating Task:', updatedTask);

    const updateTask: UpdateTask = {
      status: task.status,
      completedDate: task.status === 2 ? new Date().toISOString() : undefined, // Set completedDate only if status is 2
    };

    if (task.status === 2) {
      task.completedDate = new Date().toISOString();
    }

    console.log(updateTask);
    console.log(task.taskId, this.empId);

    this.tasksService
      .updateTaskStatus(task.taskId, this.empId, updateTask)
      .subscribe({
        next: (response) => {
          console.log('Task updated successfully:', response);
        },
        error: (error) => {
          console.error('Error updating task:', error);
        },
      });

    // this.http.put(`${this.baseURL}/tasks/${task.id}`, updatedTask).subscribe({
    //   next: (response: any) => {
    //     console.log('Task updated:', response);

    //     // this.pendingTasks = this.pendingTasks.filter((task: any) => task.status == 0);
    //     // this.inProgressTasks = this.inProgressTasks.filter((task: any) => task.status == 1);
    //     // this.completedTasks = this.completedTasks.filter((task: any) => task.status == 2);

    //     this.pendingTasks = this.pendingTasks.filter((task: any) => {
    //       if (task.status == 0) {
    //         return true;
    //       } else if (task.status == 1) {
    //         this.inProgressTasks.push(task);
    //         return false;
    //       } else {
    //         this.completedTasks.push(task);
    //         return false;
    //       }
    //     });

    //     this.inProgressTasks = this.inProgressTasks.filter((task: any) => {
    //       if (task.status == 0) {
    //         this.pendingTasks.push(task);
    //         return false;
    //       } else if (task.status == 1) {
    //         return true;
    //       } else {
    //         this.completedTasks.push(task);
    //         return false;
    //       }
    //     });

    //     this.completedTasks = this.completedTasks.filter((task: any) => {
    //       if (task.status == 0) {
    //         this.pendingTasks.push(task);
    //         return false;
    //       } else if (task.status == 1) {
    //         this.inProgressTasks.push(task);
    //         return false;
    //       } else {
    //         return true;
    //       }
    //     });

    //     console.log(this.pendingTasks);
    //     console.log(this.inProgressTasks);
    //     console.log(this.completedTasks);

    //     // this.fetchTasks();
    //     // this.fetchTasks();
    //     // alert('Task updated successfully!');
    //     // Remove the task from the old list

    //     // console.log(this.tasks);
    //     // this.filterTasksAfterSaving(updatedTask);

    //     // this.tasks = this.tasks.filter(t => t.id !== task.id);
    //     // let updatedTask1 = {
    //     //   ...updatedTask,
    //     //   hh: 0,
    //     //   mm: 0,
    //     //   ss: 0,
    //     //   isRunning: false,
    //     //   timerId: null
    //     // };
    //     // this.tasks.push(updatedTask1);
    //     // this.categorizeTasks();

    //     // location.reload();
    //     //  Update the task locally without refreshing
    //     // let index = this.tasks.findIndex(t => t.id === task.id);
    //     // if (index !== -1) {
    //     //   this.tasks[index] = { ...this.tasks[index], ...updatedTask };
    //     // }
    //   },
    //   error: (err) => {
    //     console.error('Error updating task:', err);
    //     alert('Error updating task');
    //   },
    // });
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
      movedTask.previousStatus = this.getStatusFromContainer(
        event.previousContainer.id
      );
      movedTask.status = this.getStatusFromContainer(event.container.id);

      console.log(event.previousContainer.data);

      this.onSaveTask(movedTask);

      // console.log(this.getStatusFromContainer(event.container.id));
      // console.log(event.container.id);
      // console.log(event);
    }
  }
  // dragging: boolean = false;

  goToTaskDetails(task: any) {
    console.log(task);
    this.router.navigate(['tasks', task.taskId]); // Correct path format
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
