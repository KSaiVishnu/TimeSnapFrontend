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
  selector: 'app-edit-employee-popup',
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
  templateUrl: './edit-employee-popup.component.html',
  styleUrl: './edit-employee-popup.component.css'
})
export class EditEmployeePopupComponent {
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

  employee: any = {
  id: null,
  employeeId: '',
  userName: '',
  email: '',
};


  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<EditEmployeePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { employee: any }
  ) {
    console.log('Received data:', data);
      if (data && data.employee) {
    this.employee = { ...data.employee };
  }

  }

  baseURL = environment.apiBaseUrl;

  close() {
    this.dialogRef.close();
  }

update() {
  this.isUpdating = true;

  this.http.put(`${this.baseURL}/user-employee/${this.employee.id}`, this.employee).subscribe({
    next: (res: any) => {
      console.log(res);
      this.toastr.success('Employee updated successfully');
      this.dialogRef.close(this.employee);
    },
    error: (err: any) => {
      this.toastr.error('Failed to update employee');
      console.error(err);
    },
    complete: () => {
      this.isUpdating = false;
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
        message: 'TimeSheet Updated Successfully',
      },
    });
  }
}
