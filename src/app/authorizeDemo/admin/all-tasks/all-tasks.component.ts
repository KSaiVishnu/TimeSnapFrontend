import { CommonModule } from '@angular/common';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import {
  Component,
  AfterViewInit,
  ViewChild,
  OnInit,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DeleteTaskPopupComponent } from '../../../delete-task-popup/delete-task-popup.component';
import { EditTaskPopupComponent } from '../../../edit-task-popup/edit-task-popup.component';
import { MatIconModule } from '@angular/material/icon';
import { EditAssigneeNamesComponent } from '../../../edit-assignee-names/edit-assignee-names.component';
import { AddTaskPopupComponent } from '../../../add-task-popup/add-task-popup.component';
import { MatInputModule } from '@angular/material/input';
import { environment } from '../../../../environments/environment';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingComponent } from '../../../loading/loading.component';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';

enum ApiStatus {
  INITIAL = 'INITIAL',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

@Component({
  selector: 'app-all-tasks',
  imports: [
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    FormsModule,
    CommonModule,
    MatIconModule,
    EditAssigneeNamesComponent,
    MatProgressSpinnerModule,
    LoadingComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './all-tasks.component.html',
  styleUrls: ['./all-tasks.component.css'],
})
export class AllTasksComponent implements AfterViewInit, OnInit {
  displayedColumns: string[] = [
    'taskId',
    'task',
    'assigneeNames',
    'startDate',
    'dueDate',
    // 'billingType',
    'actions',
  ];
  dataSource = new MatTableDataSource<any>();
  // dataSource:any;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private errorHandler: ErrorHandlerService
  ) {}

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  baseURL = environment.apiBaseUrl;

  @Input() billingType = '';

  currentlyEditingTaskId: number | null = null; // Track which row is in editing mode

  isLoading = true;

  apiStatus: ApiStatus = ApiStatus.INITIAL;
  errorMessage: string = '';
  errorStatus: number | null = null;


  searchQuery: string = '';
  filteredTasksData: any[] = [];


  setEditingTask(taskId: number | null) {
    this.currentlyEditingTaskId = taskId;
  }

  updateAssigneeNames(task: any, updatedAssignees: string[]) {
    console.log(task.assignees);
    console.log(updatedAssignees);
    let result = updatedAssignees.map((each: any) => {
      return {
        fullName: each.assignee || each.fullName,
        empId: each.empId,
      };
    });
    task.assignees = result;
    console.log(task.assignees)
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  ngOnInit() {
    console.log(this.billingType);
    this.fetchAssignees(); // Fetch data when component loads
    this.fetchTasks();
  }

  tasks: any[] = [];
  groupedTasks: any;

  allAssignees: { userName: string; employeeId: string; email: string }[] = []; // Store all users

  toggleEdit(task: any) {
    // console.log(task);
    this.groupedTasks.map((task: any) => {
      task.isEditing = false;
    });
    task.isEditing = true;
  }

  closeTask(task: any) {
    // console.log(task);
    task.isEditing = false;
  }

  removeAssignee(taskID: string, index: number) {
    const task = this.groupedTasks.find((t: any) => t.taskID === taskID);
    if (task) {
      task.assignee.splice(index, 1);
    }
  }

  saveTaskChanges(task: any) {
    // console.log(task);

    var assignee = task.assignee.map((each: any) => {
      return {
        assigneeName: each.assignee,
        empId: each.empId,
      };
    });
    // console.log(assignee);

    this.http
      .put<any>(`${this.baseURL}/tasks/update-task/${task.taskID}`, {
        assignees: assignee,
      })
      .subscribe({
        next: (response) => {
          console.log('Task updated successfully');
        },
        error: (err) => {
          console.log('Error updating task:', err);
        },
      });
    this.closeTask(task);
  }


  filterTasks(){
    const query = this.searchQuery.toLowerCase();
    this.filteredTasksData = this.tasks.filter(task =>
      task.taskId.toLowerCase().includes(query)
    );
    this.dataSource = new MatTableDataSource(this.filteredTasksData);
    this.dataSource.paginator = this.paginator;
  }

  fetchTasks() {
    let params = new HttpParams();

    if (this.billingType) {
      params = params.set('billingType', this.billingType);
    }

    console.log(params);

    this.apiStatus = ApiStatus.IN_PROGRESS;
    this.http.get<any[]>(`${this.baseURL}/tasks`, { params }).subscribe({
      next: (res: any) => {
        console.log(res);
        // res = [];
        this.apiStatus = ApiStatus.SUCCESS;
        this.tasks = res;
        this.filteredTasksData = res;

        this.cdr.detectChanges(); // Forces UI to update

        this.dataSource = new MatTableDataSource(this.filteredTasksData);
        this.dataSource.paginator = this.paginator;
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
        this.apiStatus = ApiStatus.FAILURE;
        this.handleError(err);
        this.cdr.detectChanges(); // Forces UI update
      },
    });
  }

  private handleError(error: HttpErrorResponse) {
    const errorInfo = this.errorHandler.getErrorMessage(error);
    this.errorStatus = errorInfo.status;
    this.errorMessage = errorInfo.message;
  }

  onRetry() {
    this.fetchTasks();
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

  filterAssignees(task: any) {
    if (!task.searchTerm) {
      task.filteredAssignees = [];
      return;
    }
    task.filteredAssignees = this.allAssignees.filter(
      (user: any) =>
        !task.assignee.some(
          (a: { empId: string }) => a.empId === user.employeeId
        )
    );
    task.filteredAssignees = task.filteredAssignees.filter((a: any) =>
      a.userName.toLowerCase().includes(task.searchTerm.toLowerCase())
    );
    console.log(task.filteredAssignees);
  }

  selectAssignee(
    task: any,
    assignee: { userName: string; employeeId: string }
  ) {
    task.assignee.push({
      assignee: assignee.userName,
      empId: assignee.employeeId,
    });
    task.searchTerm = '';
    task.showSuggestions = false;
    task.filteredAssignees = [];
  }

  editTask(task: any) {
    console.log(task);
  }

  deleteTask(taskId: any) {
    console.log(taskId);
  }

  openAddTaskPopup() {
    let allAssignees = this.allAssignees;
    let billingType = this.billingType;

    const dialogRef = this.dialog.open(AddTaskPopupComponent, {
      width: '50%',
      data: { allAssignees, billingType },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.status === 'success') {
        this.fetchTasks(); // Refresh the task list
      }
      // if (result === 'success') {
      //   this.fetchTasks(); // Refresh the task list
      // }
    });
  }

  openEditTaskPopup(task: any) {
    let allAssignees = this.allAssignees;
    console.log(allAssignees);
    console.log(task);
    const dialogRef = this.dialog.open(EditTaskPopupComponent, {
      width: '50%',
      data: { allAssignees, task },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'success') {
        this.fetchTasks(); // Refresh the task list
      }
    });
  }

  openDeleteTaskPopup(task: any) {
    console.log(task);
    // let allAssignees = this.allAssignees;
    const dialogRef = this.dialog.open(DeleteTaskPopupComponent, {
      width: '50%',
      data: { task },
    });

    dialogRef.afterClosed().subscribe((deletedTaskId: number) => {
      console.log(deletedTaskId);
      console.log(this.tasks);
      if (deletedTaskId) {
        this.tasks = this.tasks.filter((t) => t.taskId !== deletedTaskId);
      }

      this.dataSource = new MatTableDataSource(this.tasks);
      this.dataSource.paginator = this.paginator;
      console.log(this.tasks);
    });
  }
}
