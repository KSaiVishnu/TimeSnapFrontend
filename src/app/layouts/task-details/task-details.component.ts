import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AddLogModalComponent } from '../add-log-modal/add-log-modal.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule, DatePipe } from '@angular/common';
import { MinutesToHoursPipe } from '../../shared/pipes/minutes-to-hours.pipe';
import { EditLogPopupComponent } from '../../edit-log-popup/edit-log-popup.component';
import { DeleteTimesheetPopupComponent } from '../../delete-timesheet-popup/delete-timesheet-popup.component';
import { time } from 'console';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../snackbar/snackbar.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-task-details',
  imports: [
    MatCardModule,
    MatIconModule,
    MatTableModule,
    DatePipe,
    MinutesToHoursPipe,
    FormsModule,
    CommonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.css',
})
export class TaskDetailsComponent implements OnInit {
  taskId: any;
  // name: string = '';
  // email: string = '';
  empId: string = '';
  startDate: any;
  dueDate: any;
  billingType: any;
  totalTimeInMinutes = 0;

  timesheets: any[] = [];
  taskDetails: any = {};

  isLoading = true;
  isLoading_taskDetails = true;

  date: string = '';

  totalHours: number = 1; // Default to 1 hour
  totalMin: number = 0;
  hoursRange: number[] = Array.from({ length: 13 }, (_, i) => i); // Generates hours 1-12
  minRange: number[] = Array.from({ length: 60 }, (_, i) => i);

  editingLogId: number | null = null; // Track the currently editing log ID

  format(num: number) {
    return (num + '').length === 1 ? '0' + num : num + '';
  }

  setTodayDate() {
    const today = new Date();
    this.date = today.toISOString().split('T')[0]; // Convert to 'YYYY-MM-DD'
  }

  save() {
    const timesheet = {
      empId: this.empId,
      taskId: this.taskId,
      date: this.date,
      // endTime: this.endTime,
      totalMinutes: Number(this.totalHours * 60) + Number(this.totalMin), // Converts the selected hours to minutes
      notes: this.notesValue,
    };
    console.log(this.totalHours, typeof this.totalHours);
    console.log(this.totalMin, typeof this.totalMin);

    console.log(timesheet);

    this.http.post(`${this.baseURL}/timesheet/addlog`, timesheet).subscribe({
      next: (res: any) => {
        console.log('Timesheet saved!', res);

        const newTimeSheet = {
          billingType: res.task.billingType,
          date: res.date,
          dueDate: res.task.dueDate,
          empId: res.empId,
          id: res.id,
          startDate: res.startDate,
          taskId: res.task.id,
          taskName: res.task.task,
          totalMinutes: res.totalMinutes,
          userName: res.task.assignee,
          notes: res.notes
        };
        this.timesheets = [...this.timesheets, newTimeSheet];
        this.openSnackBar();
      },
      error: (err: any) => {
        console.error('Error saving timesheet', err);
      },
    });
  }

  // snackbar
  private _snackBar = inject(MatSnackBar);
  durationInSeconds = 5;
  openSnackBar() {
    this._snackBar.openFromComponent(SnackbarComponent, {
      duration: this.durationInSeconds * 1000,
      data: {
        message: 'Time Sheet Added Successfully',
      },
    });
  }

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private userService: UserService,
    private dialog: MatDialog
  ) {
    this.setTodayDate();
  }

  baseURL = environment.apiBaseUrl;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.taskId = params.get('id');
    });

    let userDetails = this.userService.getUserDetails();
    console.log(userDetails());
    if (!userDetails()) {
      this.userService.getUserProfile().subscribe({
        next: (res: any) => {
          // this.name = res.fullName;
          // this.email = res.email;
          this.empId = res.empId;
          // console.log("Through API")
        },
        error: (err: any) =>
          console.log('error while retrieving user profile:\n', err),
      });
    } else {
      // this.name = userDetails().fullName;
      // this.email = userDetails().email;
      this.empId = userDetails().empId;
    }

    this.getTaskDetails(this.taskId);
    this.getTimesheetsForTask(this.taskId);
  }

  getTaskDetails(taskId: number) {
    this.isLoading_taskDetails = true;
    this.http.get(`${this.baseURL}/tasks/details/${taskId}`).subscribe({
      next: (response: any) => {
        this.taskDetails = response;
        console.log('Task Details:', this.taskDetails);
      },
      error: (error: any) => {
        if (error.status === 404) {
          this.timesheets = [];
        } else {
          console.error('Error fetching task details:', error);
        }
      },
    });
    this.isLoading_taskDetails = false;
  }

  getTimesheetsForTask(taskId: number): void {
    this.isLoading = true;
    this.http.get(`${this.baseURL}/tasks/${taskId}/timesheets`).subscribe({
      next: (response: any) => {
        // const oneTimeSheetData = response[0];
        // this.startDate = oneTimeSheetData.startDate;
        // this.dueDate = oneTimeSheetData.dueDate;
        // this.billingType = oneTimeSheetData.billingType;

        let timeSheets = response.map((eachSheet: any) => {
          this.totalTimeInMinutes += eachSheet.totalMinutes;
          return {
            ...eachSheet,
            isEditing: false,
            totalMin: eachSheet.totalMinutes % 60,
            totalHours: Math.floor(eachSheet.totalMinutes / 60),
          };
        });
        this.timesheets = timeSheets;

        console.log('Timesheets:', this.timesheets);
        this.isLoading = false;
      },
      error: (error: any) => {
        if (error.status === 404) {
          this.timesheets = [];
        } else {
          console.error('Error fetching timesheets:', error);
        }
        this.isLoading = false;
      },
    });
  }

  notesOptions = [
    { value: 'Complex Story Brainstorming', text: 'Complex Story Brainstorming' },
    { value: 'Requirements Review', text: 'Requirements Review' },
    { value: 'Estimation', text: 'Estimation' },
    { value: 'Research', text: 'Research' },
    { value: 'Software Design', text: 'Software Design' },
    { value: 'Coding', text: 'Coding' },
    { value: 'Testing', text: 'Testing' },
    { value: 'Demonstrations', text: 'Demonstrations' },
    { value: 'Bug Fix', text: 'Bug Fix' },
    { value: 'Management', text: 'Management' }
  ];
  
  notesValue: string = 'Coding'; // Default selected value
  

  openAddLogModal(empId: any, taskId: any) {
    console.log(empId);
    const dialogRef = this.dialog.open(AddLogModalComponent, {
      width: '50%',
      data: { empId, taskId },
    });

    dialogRef.afterClosed().subscribe((timeSheet: any) => {
      // console.log(this.timesheets);
      // console.log(timeSheet);
      const newTimeSheet = {
        billingType: timeSheet.task.billingType,
        date: timeSheet.date,
        dueDate: timeSheet.task.dueDate,
        empId: timeSheet.empId,
        id: timeSheet.id,
        startDate: timeSheet.startDate,
        taskId: timeSheet.task.id,
        taskName: timeSheet.task.task,
        totalMinutes: timeSheet.totalMinutes,
        userName: timeSheet.task.assignee,
      };
      this.timesheets = [...this.timesheets, newTimeSheet];
    });
  }

  editLog(log: any) {
    log.isEditing = true;
    console.log(log);
    const dialogRef = this.dialog.open(EditLogPopupComponent, {
      width: '50%',
      data: { log },
    });

    dialogRef.afterClosed().subscribe((updatedLog) => {
      console.log(updatedLog);
      if (updatedLog) {
        const index = this.timesheets.findIndex((t) => t.id === log.id);
        console.log(this.timesheets);
        console.log(index);
        if (index !== -1) {
          this.timesheets[index].totalMinutes = updatedLog.totalMinutes;
          this.timesheets[index].date = updatedLog.date;
        }
        console.log(this.timesheets);
      }
    });
  }

  // editLog(logId: number): void {
  //   this.editingLogId = this.editingLogId === logId ? null : logId; // Toggle edit mode for the selected log


  //   const timesheet = {
  //     date: new Date(this.date),
  //     totalMinutes: Number(this.totalHours * 60) + Number(this.totalMin), // Converts the selected hours to minutes
  //   };
  //   console.log(this.totalHours, typeof this.totalHours);
  //   console.log(this.totalMin, typeof this.totalMin);

  //   console.log(timesheet);

  //   this.http
  //     .put(`${this.baseURL}/timesheet/${logId}`, timesheet)
  //     .subscribe({
  //       next: (res: any) => {
  //         console.log('Timesheet saved!', res);
  
  //       },
  //       error: (err: any) => {
  //         console.error('Error saving timesheet', err);
  //       },
  //     });
  // }


  // editLog(log: any): void {
  //   if (this.editingLogId === log.id) {
  //     // If already editing, save the data
  //     const timesheet = {
  //       date: new Date(log.date), // Use the selected date
  //       totalMinutes: Number(log.totalHours) * 60 + Number(log.totalMin), // Convert hours to minutes
  //     };
  
  //     console.log('Saving timesheet:', timesheet);
  
  //     this.http.put(`${this.baseURL}/timesheet/${log.id}`, timesheet).subscribe({
  //       next: (res: any) => {
  //         console.log('Timesheet saved!', res);
  //         this.editingLogId = null; // Exit edit mode after saving
  //       },
  //       error: (err: any) => {
  //         console.error('Error saving timesheet', err);
  //       },
  //     });
  //   } else {
  //     // Enable edit mode
  //     this.editingLogId = log.id;
  //   }
  // }
  

  // editLog(log: any): void {
  //   if (this.editingLogId === log.id) {
  //     // If already editing, save the data
  //     const updatedTimesheet = {
  //       ...log,
  //       date: new Date(log.date), // Ensure correct date format
  //       totalMinutes: Number(log.totalHours) * 60 + Number(log.totalMin),
  //     };
  
  //     console.log('Saving timesheet:', updatedTimesheet);
  
  //     this.http.put(`${this.baseURL}/timesheet/${log.id}`, updatedTimesheet).subscribe({
  //       next: (res: any) => {
  //         console.log('Timesheet saved!', res);
  
  //         // Find the index of the timesheet and update the array
  //         const index = this.timesheets.findIndex(t => t.id === log.id);
  //         // if (index !== -1) {
  //         //   // this.timesheets[index] = { ...updatedTimesheet }; // Update the UI manually/
  //         //   this.timesheets[index] = updatedTimesheet
  //         //   // this.timesheets = [...this.timesheets];
  //         //   console.log(this.timesheets);
  //         // }

  //         if (index !== -1) {
  //           this.timesheets[index] = { ...this.timesheets[index], ...updatedTimesheet };
  //         }
  
  //         this.editingLogId = null; // Exit edit mode
  //       },
  //       error: (err: any) => {
  //         console.error('Error saving timesheet', err);
  //       },
  //     });
  //   } else {
  //     // Enable edit mode
  //     this.editingLogId = log.id;
  //   }
  // }
  




  // editLog(log: any): void {
  //   if (this.editingLogId === log.id) {
  //     const updatedTimesheet = {
  //       id: log.id,
  //       date: log.date.split('T')[0], // Ensure correct date format
  //       totalMinutes: (parseInt(log.totalHours, 10) * 60) + parseInt(log.totalMin, 10), // Convert to number
  //     };
  
  //     console.log('Saving timesheet:', updatedTimesheet);
  
  //     this.http.put(`${this.baseURL}/timesheet/${log.id}`, updatedTimesheet).subscribe({
  //       next: (res: any) => {
  //         console.log('Timesheet saved!', res);
          
  //         // Update the local array to reflect changes immediately
  //         const index = this.timesheets.findIndex(t => t.id === log.id);
  //         if (index !== -1) {
  //           this.timesheets[index] = { ...this.timesheets[index], ...updatedTimesheet };
  //         }
  
  //         this.editingLogId = null; // Exit edit mode
  //       },
  //       error: (err: any) => {
  //         console.error('Error saving timesheet', err);
  //       },
  //     });
  //   } else {
  //     this.editingLogId = log.id;
  //   }
  // }
  


  deleteLog(logId: any) {
    console.log(logId);
    const dialogRef = this.dialog.open(DeleteTimesheetPopupComponent, {
      width: '50%',
      data: { id: logId },
    });
    dialogRef.afterClosed().subscribe((deletedId) => {
      if (deletedId) {
        this.timesheets = this.timesheets.filter((t) => t.id !== deletedId);
        // this.timesheets = [...this.timesheets]; // Ensure UI refresh
      }
    });
  }
}
