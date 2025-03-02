import { Component, Inject } from '@angular/core';
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
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-add-log-modal',
  standalone: true,
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
  templateUrl: './add-log-modal.component.html',
  styleUrls: ['./add-log-modal.component.css'],
})
export class AddLogModalComponent {
  date: string = '';
  // endTime: Date = new Date();
  
  // startTimeString: string = this.formatDateTimeLocal(this.startTime);
  // endTimeString: string = this.formatDateTimeLocal(this.endTime);

  // dateString: Date = this.date;
  // endTimeString: Date = this.endTime;


  totalHours: number = 1; // Default to 1 hour
  totalMin: number = 0;
  hoursRange: number[] = Array.from({ length: 13 }, (_, i) => i); // Generates hours 1-12
  minRange:number[] = Array.from({length: 60}, (_, i) => i);

  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<AddLogModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { empId: number; taskId: number }
  ) {
    this.setTodayDate();
  }

    baseURL = environment.apiBaseUrl;

  setTodayDate() {
    const today = new Date();
    this.date = today.toISOString().split('T')[0]; // Convert to 'YYYY-MM-DD'
  }

  formatDateTimeLocal(date: Date): string {
    return date.toISOString().slice(0, 16); // Extracts 'YYYY-MM-DDTHH:mm'
  }

  format(num: number) {
    return (num + '').length === 1 ? '0' + num : num + '';
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    const timesheet = {
      empId: this.data.empId,
      taskId: this.data.taskId,
      date: this.date,
      // endTime: this.endTime,
      totalMinutes: Number(this.totalHours * 60) + Number(this.totalMin), // Converts the selected hours to minutes
    };
    console.log(this.totalHours,typeof(this.totalHours));
    console.log(this.totalMin, typeof(this.totalMin));

    console.log(timesheet);

    this.http.post(`${this.baseURL}/timesheet/addlog`, timesheet).subscribe({
      next: (res: any) => {
        console.log('Timesheet saved!', res);
        this.dialogRef.close(res); // Send deleted ID back
      },
      error: (err: any) => {
        console.error('Error saving timesheet', err);
      },
    });
    // this.dialogRef.close();

  }
}
