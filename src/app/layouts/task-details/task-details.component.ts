import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
import { LineChartComponent } from '../../line-chart/line-chart.component';

import { AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { LoadingComponent } from '../../loading/loading.component';
import { ToastrService } from 'ngx-toastr';

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
    LineChartComponent,
    MatPaginatorModule,
    LoadingComponent,
  ],
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.css', './task-details.component.scss'],
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
  minRange: number[] = Array.from({ length: 4 }, (_, i) => i * 15);

  editingLogId: number | null = null; // Track the currently editing log ID

  format(num: number) {
    return (num + '').length === 1 ? '0' + num : num + '';
  }

  setTodayDate() {
    const today = new Date();
    this.date = today.toISOString().split('T')[0]; // Convert to 'YYYY-MM-DD'
  }

  isSaving: boolean = false;

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

    this.isSaving = true;
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
          notes: res.notes,
          totalHours: Math.floor(res.totalMinutes / 60),
          totalMin: res.totalMinutes % 60
        };
        this.timesheets = [...this.timesheets, newTimeSheet];
        this.totalTimeInMinutes += res.totalMinutes;
        this.openSnackBar("Time Sheet Added Successfully");
      },
      error: (err: any) => {
        this.toastr.error("Adding Timesheet Failed");
        console.error('Error saving timesheet', err);
        this.isSaving = false;

      },
      complete: () => {
        this.isSaving = false;
      },
    });
  }

  // snackbar
  private _snackBar = inject(MatSnackBar);
  durationInSeconds = 5;
  openSnackBar(message: any) {
    this._snackBar.openFromComponent(SnackbarComponent, {
      duration: this.durationInSeconds * 1000,
      data: {
        message: message,
      },
    });
  }

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private userService: UserService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
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
          this.empId = res.empId;
          if (this.empId) {
            this.getTimesheetsForTask(this.taskId, this.empId); // Call API after setting EmpId
          }
        },
        error: (err: any) =>
          console.log('error while retrieving user profile:\n', err),
      });
    } else {
      this.empId = userDetails().empId;
      if (this.empId) {
        this.getTimesheetsForTask(this.taskId, this.empId); // Call API after setting EmpId
      }
    }

    this.getTaskDetails(this.taskId);
    // this.getTimesheetsForTask(this.taskId, this.empId);
  }

  getTaskDetails(taskId: string) {
    this.isLoading_taskDetails = true;
    this.http.get(`${this.baseURL}/task/${taskId}`).subscribe({
      next: (response: any) => {
        this.taskDetails = response;
        console.log('Task Details:', this.taskDetails);
    this.isLoading_taskDetails = false;

        this.cdr.detectChanges(); // Force update to reflect changes
      },
      error: (error: any) => {
        if (error.status === 404) {
          this.timesheets = [];
        } else {
          console.error('Error fetching task details:', error);
        }
    this.isLoading_taskDetails = false;

      },
    });
  }

  // getTimesheetsForTask(taskId: number): void {
  //   this.isLoading = true;
  //   this.http.get(`${this.baseURL}/timesheet`).subscribe({
  //     next: (response: any) => {
  //       // const oneTimeSheetData = response[0];
  //       // this.startDate = oneTimeSheetData.startDate;
  //       // this.dueDate = oneTimeSheetData.dueDate;
  //       // this.billingType = oneTimeSheetData.billingType;

  //       let timeSheets = response.map((eachSheet: any) => {
  //         this.totalTimeInMinutes += eachSheet.totalMinutes;
  //         return {
  //           ...eachSheet,
  //           isEditing: false,
  //           totalMin: eachSheet.totalMinutes % 60,
  //           totalHours: Math.floor(eachSheet.totalMinutes / 60),
  //         };
  //       });
  //       // this.timesheets = timeSheets;
  //       this.timesheets = [...timeSheets]; // Create a new array reference

  //       console.log('Timesheets:', this.timesheets);
  //       this.cdr.detectChanges(); // Force update to reflect changes

  //       this.isLoading = false;
  //     },
  //     error: (error: any) => {
  //       if (error.status === 404) {
  //         this.timesheets = [];
  //       } else {
  //         console.error('Error fetching timesheets:', error);
  //       }
  //       this.isLoading = false;
  //     },
  //   });
  // }

  getTimesheetsForTask(taskId: string, empId: string): void {
    if (!empId) return; // Ensure EmpId is available before making request

    this.isLoading = true;

    this.http
      .get(`${this.baseURL}/timesheet`, {
        params: { taskId, empId },
      })
      .subscribe({
        next: (response: any) => {
          this.totalTimeInMinutes = 0; // Reset before calculation

          let timeSheets = response.map((eachSheet: any) => {
            this.totalTimeInMinutes += eachSheet.totalMinutes;
            return {
              ...eachSheet,
              isEditing: false,
              totalMin: eachSheet.totalMinutes % 60,
              totalHours: Math.floor(eachSheet.totalMinutes / 60),
            };
          });

          console.log(this.totalTimeInMinutes);

          this.timesheets = [...timeSheets]; // Create a new array reference
          console.log('Timesheets:', this.timesheets);

          this.cdr.detectChanges(); // Force update to reflect changes
          this.isLoading = false;
        },
        error: (error: any) => {
          if (error.status === 404) {
            this.timesheets = [];
              this.cdr.detectChanges(); // Force update when empty
          } else {
            console.error('Error fetching timesheets:', error);
          }
          this.isLoading = false;
        },
      });
  }

  notesOptions = [
    {
      value: 'Complex Story Brainstorming',
      text: 'Complex Story Brainstorming',
    },
    { value: 'Requirements Review', text: 'Requirements Review' },
    { value: 'Estimation', text: 'Estimation' },
    { value: 'Research', text: 'Research' },
    { value: 'Software Design', text: 'Software Design' },
    { value: 'Coding', text: 'Coding' },
    { value: 'Testing', text: 'Testing' },
    { value: 'Demonstrations', text: 'Demonstrations' },
    { value: 'Bug Fix', text: 'Bug Fix' },
    { value: 'Management', text: 'Management' },
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

  // below one is the original

  // editLog(log: any) {
  //   log.isEditing = true;
  //   console.log(log);
  //   const dialogRef = this.dialog.open(EditLogPopupComponent, {
  //     width: '50%',
  //     data: { log },
  //   });

  //   dialogRef.afterClosed().subscribe((updatedLog) => {
  //     console.log(updatedLog);
  //     if (updatedLog) {
  //       const index = this.timesheets.findIndex((t) => t.id === log.id);
  //       console.log(this.timesheets);
  //       console.log(index);
  //       if (index !== -1) {
  //         let previousMinutes = this.timesheets[index].totalMinutes;
  //         let updatedMinutes = updatedLog.totalMinutes;
  //         this.totalTimeInMinutes += updatedMinutes - previousMinutes;
  //         this.timesheets[index].totalMinutes = updatedLog.totalMinutes;
  //         this.timesheets[index].date = updatedLog.date;
  //         this.timesheets[index].notes = updatedLog.notes;

  //       }
  //       console.log(this.timesheets);
  //     }
  //   });
  // }
  editValues: any = {}; // Temporary storage for editing

  editLog(log: any) {
    if (this.editingLogId === log.id) {
      this.updateLog(log);
      // this.editingLogId = null;
    } else {
      this.editingLogId = log.id;
      this.editValues = {
        date: log.date.split('T')[0],
        totalHours: log.totalHours,
        totalMin: log.totalMin,
        notes: log.notes,
      };
      console.log(this.editValues);
    }
  }

  // editLog(log: any) {
  //   // Toggle edit mode: If the same log is clicked, close it; otherwise, open it

  //   console.log(log, this.editingLogId)
  //   if (this.editingLogId === log.id) {
  //     this.updateLog(log);
  //     this.editingLogId = null;
  //   } else {
  //     this.editingLogId = log.id;
  //   }
  // }

  isUpdating = false;

  updateLog(log: any) {
    console.log(log);

    



    // const timesheet = {
    //   date: new Date(log.date),
    //   totalMinutes: log.totalMinutes, // Converts the selected hours to minutes
    //   notes: log.notes,
    // };
    // console.log(this.totalHours, typeof this.totalHours);
    // console.log(this.totalMin, typeof this.totalMin);
    // console.log(timesheet);
    // console.log(log);
    // console.log(this.editValues.totalHours, this.editValues.totalMin);

    const hours = Number(this.editValues.totalHours);
    const minutes = Number(this.editValues.totalMin);

    let updatedLog = {
      ...log,
      date: new Date(this.editValues.date),
      totalHours: hours,
      totalMin: minutes,
      totalMinutes: hours * 60 + minutes,
      notes: this.editValues.notes,
    };

    console.log('Updated Log:', updatedLog);

    const timesheet = {
      notes: updatedLog.notes,
      date: new Date(this.editValues.date),
      totalMinutes: hours * 60 + minutes,
    };

    this.isUpdating = true;
    this.http.put(`${this.baseURL}/timesheet/${log.id}`, timesheet).subscribe({
      next: (res: any) => {
        console.log('Timesheet saved!', res);
        console.log(this.timesheets);
        // this.getTimesheetsForTask(this.taskId, this.empId);
        // Find and update the log in your local array
        const index = this.timesheets.findIndex((l) => l.id === log.id);
        if (index !== -1) {
          let newDate = updatedLog.date;
          newDate.setHours(0, 0, 0, 0);
          const formattedDate = newDate.toLocaleDateString('en-CA') + "T00:00:00"; // 'en-CA' gives YYYY-MM-DD format
          updatedLog = {
            ...updatedLog,
            date: formattedDate
          }
          this.timesheets[index] = { ...updatedLog };
          this.timesheets = [...this.timesheets];
        }
      this.editingLogId = null;
      
      let previousMinutes = log.totalMinutes;
      let updatedMinutes = updatedLog.totalMinutes;
      this.totalTimeInMinutes += updatedMinutes - previousMinutes;


      this.openSnackBar("TimeSheet Updated Successfully");



      },
      error: (err: any) => {
        console.error('Error saving timesheet', err);
      this.editingLogId = null;
      this.isUpdating = false;
      this.toastr.error("TimeSheet Updation Failed")

      },
      complete: () => {
        this.isUpdating = false;
      }
    });
  }

  CloseLog(){
    this.editingLogId = null;
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
        let deletedTimeSheet = this.timesheets.find(
          (each: any) => each.id === deletedId
        );
        this.totalTimeInMinutes -= deletedTimeSheet.totalMinutes;
        this.timesheets = this.timesheets.filter((t) => t.id !== deletedId);

        // this.timesheets = [...this.timesheets]; // Ensure UI refresh
      }
    });
  }

  currentPage = 1;
  pageSize = 7; // Show 1 employee per page

  get paginatedData() {
    if (!this.timesheets || this.timesheets.length === 0) {
      return []; // Return empty array if data is not yet available
    }
    const start = (this.currentPage - 1) * this.pageSize;
    return this.timesheets.slice(start, start + this.pageSize);
  }

  nextPage() {
    if (this.currentPage * this.pageSize < this.timesheets.length) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}
