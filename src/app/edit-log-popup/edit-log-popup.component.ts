import { Component, EventEmitter, Inject, Output } from '@angular/core';
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
  ],
  templateUrl: './edit-log-popup.component.html',
  styleUrl: './edit-log-popup.component.css',
})
export class EditLogPopupComponent {

  @Output() logUpdated = new EventEmitter<any>(); // Notify parent component


  date: Date = new Date();
  totalHours: number = 1; // Default to 1 hour
  totalMin: number = 0;
  timeSheetId: any;

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


  hoursRange: number[] = Array.from({ length: 13 }, (_, i) => i); // Generates hours 1-12
  minRange: number[] = Array.from({ length: 60 }, (_, i) => i);

  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<EditLogPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { log: any }
  ) {
    console.log('Received data:', data);

    if (data?.log) {
      this.date = data.log.date.split('T')[0]; // Extract only 'YYYY-MM-DD'
      this.totalHours = Math.floor(data.log.totalMinutes / 60); // Extract hours
      this.totalMin = data.log.totalMinutes % 60; // Extract remaining minutes
      this.timeSheetId = data.log.id;
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

    this.http
      .put(`${this.baseURL}/timesheet/${this.timeSheetId}`, timesheet)
      .subscribe({
        next: (res: any) => {
          console.log('Timesheet saved!', res);
          this.logUpdated.emit(timesheet); // 🔹 Notify parent about update
          this.dialogRef.close(timesheet); // Pass updated data on close
  
        },
        error: (err: any) => {
          console.error('Error saving timesheet', err);
          this.dialogRef.close(timesheet); // Pass updated data on close
        },
      });

    // this.dialogRef.close(timesheet);
  }
}
