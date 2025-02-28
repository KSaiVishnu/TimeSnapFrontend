import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DeleteTaskPopupComponent } from '../../../delete-task-popup/delete-task-popup.component';
import { EditTaskPopupComponent } from '../../../edit-task-popup/edit-task-popup.component';
import {MatIconModule} from '@angular/material/icon';
import { EditAssigneeNamesComponent } from "../../../edit-assignee-names/edit-assignee-names.component";
import { AddTaskPopupComponent } from '../../../add-task-popup/add-task-popup.component';
import {MatInputModule} from '@angular/material/input';
import { environment } from '../../../../environments/environment';

// const ELEMENT_DATA: any = [];

@Component({
  selector: 'app-all-tasks',
  imports: [MatInputModule,MatTableModule, MatPaginatorModule, FormsModule, CommonModule, MatIconModule, EditAssigneeNamesComponent],
  providers: [provideNativeDateAdapter()],
  templateUrl: './all-tasks.component.html',
  styleUrls: ['./all-tasks.component.css'],
})
export class AllTasksComponent implements AfterViewInit, OnInit {
  displayedColumns: string[] = [
    'task',
    'assigneeNames',
    'startDate',
    'dueDate',
    'billingType',
    'actions',
  ];
  dataSource = new MatTableDataSource<any>();
  // dataSource:any;

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  baseURL = environment.apiBaseUrl;

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  ngOnInit(): void {
    this.fetchTasks();
    this.fetchAssignees(); // Fetch data when component loads
  }

  tasks: any[] = [];
  groupedTasks: any[] = [];

  allAssignees: { userName: string; employeeId: string }[] = []; // Store all users

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
    const task = this.groupedTasks.find((t) => t.taskID === taskID);
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

  fetchTasks() {
    this.http.get<any[]>(`${this.baseURL}/tasks`).subscribe({
      next: (res: any) => {
        console.log(res);
        this.tasks = res;
        const groupedTasks = this.tasks.reduce((acc, task) => {
          let existingTask = acc.find(
            (t: { taskID: any }) => t.taskID === task.taskID
          );

          // Ensure assignee is an array of objects, each with assignee and empId
          const assigneeArray = Array.isArray(task.assignee)
            ? task.assignee
            : [{ assignee: task.assignee, empId: task.empId }]; // If not an array, create it

          if (existingTask) {
            // Merge assignees and prevent duplicates
            existingTask.assignee = [
              ...new Set([...existingTask.assignee, ...assigneeArray]),
            ];
          } else {
            acc.push({
              task: task.task,
              assignee: assigneeArray,
              startDate: task.startDate,
              dueDate: task.dueDate,
              billingType: task.billingType,
              taskID: task.taskID,
              isEditing: false, // Track edit mode
              searchTerm: '',
              showSuggestions: false,
              filteredAssignees: [], // Filtered list
            });
          }

          return acc;
        }, []);

        this.groupedTasks = groupedTasks;
        // this.dataSource = groupedTasks;
        this.dataSource = new MatTableDataSource(groupedTasks);
        // if (this.paginator) {
        this.dataSource.paginator = this.paginator;
        // }
        console.log(groupedTasks);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  // Fetch all assignees from the UserEmployee table (API call)
  fetchAssignees() {
    this.http
      .get<{ userName: string; employeeId: string }[]>(
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
      const dialogRef = this.dialog.open(AddTaskPopupComponent, {
        width: '50%',
        data: { allAssignees },
      });
    
      dialogRef.afterClosed().subscribe((result) => {
        if (result === 'success') {
          this.fetchTasks(); // Refresh the task list
        }
      });
    }

  openEditTaskPopup(task: any) {
    let allAssignees = this.allAssignees;
    const dialogRef = this.dialog.open(EditTaskPopupComponent, {
      width: '50%',
      data: { allAssignees, task },
    });

    // dialogRef.afterClosed().subscribe((result) => {
    //   if (result === 'success') {
    //     this.fetchTasks(); // Refresh the task list
    //   }
    // });
  }

  openDeleteTaskPopup(task: any) {
    console.log(task);
    // let allAssignees = this.allAssignees;
    this.dialog.open(DeleteTaskPopupComponent, {
      width: '50%',
      data: { task },
    });
  }
}
