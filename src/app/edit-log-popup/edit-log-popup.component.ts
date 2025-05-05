import { Component, EventEmitter, inject, Inject, Output } from '@angular/core';
import {
  MatDialogRef,
  MatDialogModule,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../snackbar/snackbar.component';

@Component({
  selector: 'app-edit-log-popup',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './edit-log-popup.component.html',
  styleUrl: './edit-log-popup.component.css',
})
export class EditLogPopupComponent {
  @Output() logUpdated = new EventEmitter<any>(); // Notify parent component

  date: any = new Date();
  totalHours: number = 1; // Default to 1 hour
  totalMin: number = 0;
  timeSheetId: any;

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

  hoursRange: number[] = Array.from({ length: 13 }, (_, i) => i); // Generates hours 1-12
  // minRange: number[] = Array.from({ length: 60 }, (_, i) => i);
  minRange: number[] = Array.from({ length: 4 }, (_, i) => i * 15);

  isUpdating: boolean = false;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<EditLogPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { log: any }
  ) {
    console.log('Received data:', data);

    if (data?.log) {
      console.log('data.log.date:', data.log.date);
      // this.date = data.log.date.split('T')[0]; // Extract only 'YYYY-MM-DD'
      console.log('data.log.date:', data.log.date);

      const rawDate = data.log.date;

      if (rawDate instanceof Date) {
        const year = rawDate.getFullYear();
        const month = String(rawDate.getMonth() + 1).padStart(2, '0');
        const day = String(rawDate.getDate()).padStart(2, '0');
        this.date = `${year}-${month}-${day}`;
      } else if (typeof rawDate === 'string') {
        this.date = rawDate.split('T')[0]; // Safe if it's a string
      }

      this.totalHours = Math.floor(data.log.totalMinutes / 60); // Extract hours
      this.totalMin = data.log.totalMinutes % 60; // Extract remaining minutes
      // this.timeSheetId = data.log.id;

      this.timeSheetId = data.log.timesheetId;
      
      this.notesValue = data.log.notes;
    }
  }

  baseURL = environment.apiBaseUrl;

  format(num: number) {
    return (num + '').length === 1 ? '0' + num : num + '';
  }

  close() {
    this.dialogRef.close();
  }

  update() {
    const timesheet = {
      date: new Date(this.date),
      totalMinutes: Number(this.totalHours * 60) + Number(this.totalMin), // Converts the selected hours to minutes
      notes: this.notesValue,
    };
    console.log(this.totalHours, typeof this.totalHours);
    console.log(this.totalMin, typeof this.totalMin);

    console.log(timesheet);

    this.isUpdating = true;
    this.http
      .put(`${this.baseURL}/timesheet/${this.timeSheetId}`, timesheet)
      .subscribe({
        next: (res: any) => {
          console.log('Timesheet saved!', res);
          this.logUpdated.emit(timesheet); // 🔹 Notify parent about update
          this.dialogRef.close(timesheet); // Pass updated data on close
          this.openSnackBar();
        },
        error: (err: any) => {
          this.toastr.error('TimeSheet Updation Failed');
          console.error('Error saving timesheet', err);
          this.dialogRef.close(timesheet); // Pass updated data on close
        },
        complete: () => {
          this.isUpdating = false;
        },
      });

    // this.dialogRef.close(timesheet);
  }

  // snackbar
  private _snackBar = inject(MatSnackBar);
  durationInSeconds = 5;
  openSnackBar() {
    this._snackBar.openFromComponent(SnackbarComponent, {
      duration: this.durationInSeconds * 1000,
      data: {
        message: 'TimeSheet Updated Successfully',
      },
    });
  }
}
