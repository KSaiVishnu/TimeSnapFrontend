import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { HostListener } from '@angular/core';
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'app-add-timesheet',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './add-timesheet.component.html',
  styleUrls: ['./add-timesheet.component.css']
})
export class AddTimesheetComponent implements OnInit {
  timesheetForm: FormGroup;
  isSubmitting = false;
  
  // Range options for hours and minutes
  hoursRange: number[] = Array.from({ length: 13 }, (_, i) => i); // 0-12 hours
  minutesRange: number[] = Array.from({ length: 4 }, (_, i) => i * 15);
  
  baseURL = environment.apiBaseUrl;

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


  taskOptions: any;
  filteredOptions: any;

  isTaskInputFocused = false;




  constructor(
    private toastr: ToastrService,
    private fb: FormBuilder,
    private http: HttpClient,
    private dialogRef: MatDialogRef<AddTimesheetComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { empId: number }
  ) {
    this.timesheetForm = this.fb.group({
      taskId: ['', Validators.required],
      date: [this.getTodayDate(), Validators.required],
      hours: [1, Validators.required],
      minutes: [0, Validators.required],
      notes: ['Coding']
    });
  }

  // ngOnInit(): void {
  //   // Any additional initialization

  //     this.http.get<any[]>(`${environment.apiBaseUrl}/tasks/assigned/${this.data.empId}`, { withCredentials: true }).subscribe(res => {
  //   this.taskOptions = res.map(t => `${t.taskId} - ${t.taskName}`);
  //   this.filteredOptions = this.taskOptions;
  // });

  // this.timesheetForm.get('taskId')?.valueChanges.subscribe(value => {
  //   this.filterTasks(value);
  // });
  // }

  ngOnInit(): void {
  // Call the backend API to get assigned tasks for the given empId
  const empId = this.data.empId
  this.http.get<any[]>(`${this.baseURL}/tasks/${empId}`, { withCredentials: true })
    .subscribe({
      next: (res) => {
        console.log(res);
        // this.taskOptions = res.map(t => `${t.taskId} - ${t.taskName}`);
        this.taskOptions = res.map(t => ({
  label: `"${t.taskId}" - ${t.taskName}`,
  value: t.taskId
}));

        this.filteredOptions = this.taskOptions;
      },
      error: (err) => {
        console.error('Failed to fetch task list:', err);
        this.taskOptions = [];
        this.filteredOptions = [];
        // Optional: Show a user-friendly error message
      }
    });

  // Filter task options on taskId input change
  this.timesheetForm.get('taskId')?.valueChanges.subscribe(value => {
    this.filterTasks(value);
  });
}


  filterTasks(value: string) {
  const filterValue = value.toLowerCase();
this.filteredOptions = this.taskOptions
  .filter((option: any) => option.label.toLowerCase().includes(value.toLowerCase()));

}

selectOption(option: { label: string, value: string }) {
  this.timesheetForm.get('taskId')?.setValue(option.value);  // Sets correct taskId even if it contains spaces or dashes
  this.filteredOptions = [];
}


@HostListener('document:click', ['$event'])
onClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.autocomplete-wrapper')) {
    this.isTaskInputFocused = false;
  }
}


  // Getters for form controls
  get taskId() { return this.timesheetForm.get('taskId')!; }
  get date() { return this.timesheetForm.get('date')!; }
  get hours() { return this.timesheetForm.get('hours')!; }
  get minutes() { return this.timesheetForm.get('minutes')!; }

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  formatNumber(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  close(): void {
    this.dialogRef.close();
  }

  // save(): void {
  //   if (this.timesheetForm.invalid) return;
    
  //   // Check if duration is greater than 0
  //   if (this.hours.value === 0 && this.minutes.value === 0) {
  //     this.timesheetForm.get('hours')?.setErrors({ 'zeroDuration': true });
  //     return;
  //   }

  //   this.isSubmitting = true;
    
  //   const formValues = this.timesheetForm.value;
  //   const totalMinutes = (formValues.hours * 60) + formValues.minutes;
    
  //   const timesheet = {
  //     empId: this.data.empId,
  //     taskId: formValues.taskId,
  //     date: formValues.date,
  //     totalMinutes: totalMinutes,
  //     notes: formValues.notes
  //   };

  //   console.log(timesheet);
    
  //   this.http.post(`${this.baseURL}/timesheet/addlog`, timesheet).subscribe({
  //     next: (response: any) => {
  //       console.log('Timesheet saved successfully', response);
  //       this.dialogRef.close(response);
  //     },
  //     error: (error: any) => {
  //       console.error('Error saving timesheet', error);
  //       this.isSubmitting = false;
  //       // Handle error (you could add error handling UI here)
  //     }
  //   });
  // }


save(): void {
  if (this.timesheetForm.invalid) {
    this.toastr.error('Please correct the form errors.', 'Form Invalid');
    return;
  }

  if (this.hours.value === 0 && this.minutes.value === 0) {
    this.timesheetForm.get('hours')?.setErrors({ 'zeroDuration': true });
    this.toastr.warning('Duration cannot be zero.', 'Invalid Time');
    return;
  }

  this.isSubmitting = true;

  const formValues = this.timesheetForm.value;
  const totalMinutes = (formValues.hours * 60) + formValues.minutes;

  const timesheet = {
    empId: this.data.empId,
    taskId: formValues.taskId,
    date: formValues.date,
    totalMinutes: totalMinutes,
    notes: formValues.notes
  };

  this.http.post(`${this.baseURL}/timesheet/addlog`, timesheet).subscribe({
    next: (response: any) => {
      this.toastr.success('Timesheet saved successfully.', 'Success');
      this.dialogRef.close(response);
    },
    error: (error: any) => {
      this.isSubmitting = false;

      if (error.status === 400) {
        const message = typeof error.error === 'string' ? error.error : 'Invalid input data.';
        this.toastr.error(message, 'Bad Request');
      } else if (error.status === 500) {
        this.toastr.error('A server error occurred. Please try again later.', 'Server Error');
      } else {
        this.toastr.error('An unexpected error occurred. Please try again.', 'Error');
      }

      console.error('Error saving timesheet:', error);
    }
  });
}


}