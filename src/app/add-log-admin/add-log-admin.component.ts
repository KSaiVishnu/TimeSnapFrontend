import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { TimesheetService } from '../shared/services/timesheet.service';

import { provideNativeDateAdapter } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { MatDialogRef } from '@angular/material/dialog';
import { catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-add-log-admin',
  providers: [provideNativeDateAdapter()],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    // Material Modules
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
  ],
  templateUrl: './add-log-admin.component.html',
  styleUrl: './add-log-admin.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddLogAdminComponent implements OnInit {
  logForm!: FormGroup;

  employees: any[] = [];
  filteredEmployees: any[] = [];
  loadingEmployees = false;

  tasks: any[] = [];
  filteredTasks: any[] = [];
  loadingTasks = false;

  baseURL = environment.apiBaseUrl;

  isSubmitting = false;
  formError: string | null = null;

  constructor(
    private toastr: ToastrService,
    private http: HttpClient,
    private fb: FormBuilder,
    private timesheetService: TimesheetService,
    private dialogRef: MatDialogRef<AddLogAdminComponent>,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadEmployees();
  }

  initForm(): void {
    this.logForm = this.fb.group({
      empId: ['', Validators.required],
      taskId: ['', Validators.required],
      date: [new Date(), Validators.required],
      hours: [1, [Validators.required, Validators.min(0), Validators.max(12)]],
      minutes: [0, [Validators.required, Validators.min(0), Validators.max(45)]],
      notes: ['Coding', Validators.required],
    });
  }

  loadEmployees(): void {
    this.loadingEmployees = true;
    this.formError = null;
    
    this.timesheetService.getAllEmployees()
      .pipe(
        catchError(this.handleError),
        finalize(() => {
          this.loadingEmployees = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe(res => {
        this.employees = res;
        this.filteredEmployees = res;
        this.cdr.markForCheck();
      });
  }

  filterEmployees(): void {
    const value = this.logForm.get('empId')?.value?.toLowerCase() || '';
    this.filteredEmployees = this.employees.filter((emp) =>
      (emp.empId + ' - ' + emp.userName).toLowerCase().includes(value)
    );
  }

  onEmpSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedEmpId = event.option.value;
    this.logForm.patchValue({ empId: selectedEmpId });
    this.loadTasksForEmployee(selectedEmpId);
  }

  loadTasksForEmployee(empId: string): void {
    this.loadingTasks = true;
    this.formError = null;
    
    this.timesheetService.getTasksByEmpId(empId)
      .pipe(
        catchError(this.handleError),
        finalize(() => {
          this.loadingTasks = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe(res => {
        this.tasks = res;
        console.log(res);
        this.filteredTasks = res;
        if(res.length == 0){
          // alert("User not have any tasks", "Search With Other EmpId")
          alert("No tasks found for this user. Please try searching with a different Employee ID.");

        }
        this.logForm.patchValue({ taskId: '' }); // clear old task
        this.cdr.markForCheck();
      });
  }

  filterTasks(): void {
    const value = this.logForm.get('taskId')?.value?.toLowerCase() || '';
    this.filteredTasks = this.tasks.filter((task) =>
      (task.taskId + ' - ' + task.taskName).toLowerCase().includes(value)
    );
  }

  onTaskSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedTaskId = event.option.value;
    this.logForm.patchValue({ taskId: selectedTaskId });
  }

  saveLog(): void {
    if (this.logForm.invalid) {
      this.markFormGroupTouched(this.logForm);
      this.formError = 'Please fill in all required fields correctly.';
      this.cdr.markForCheck();
      return;
    }

    this.formError = null;
    this.isSubmitting = true;
    this.cdr.markForCheck();

    const formValues = this.logForm.value;
    const totalMinutes = formValues.hours * 60 + formValues.minutes;

    const timesheet = {
      empId: formValues.empId,
      taskId: formValues.taskId,
      date: formValues.date,
      totalMinutes: totalMinutes,
      notes: formValues.notes,
    };

    this.http.post(`${this.baseURL}/timesheet/addlog`, timesheet)
      .pipe(
        catchError(this.handleError),
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response: any) => {
          this.toastr.success('Timesheet saved successfully.', 'Success');
          this.dialogRef.close(response);
        }
      });
  }

  private handleError = (error: HttpErrorResponse) => {
    this.isSubmitting = false;
    
    if (error.status === 400) {
      const message = typeof error.error === 'string' 
        ? error.error 
        : 'Invalid input data.';
      this.formError = message;
      this.toastr.error(message, 'Bad Request');
    } else if (error.status === 500) {
      this.formError = 'A server error occurred. Please try again later.';
      this.toastr.error(this.formError, 'Server Error');
    } else {
      this.formError = 'An unexpected error occurred. Please try again.';
      this.toastr.error(this.formError, 'Error');
    }
    
    console.error('Error:', error);
    return throwError(() => error);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  get hourOptions() {
    return Array.from({ length: 13 }, (_, i) => i); // 0-12 hours
  }

  get minuteOptions() {
    return Array.from({ length: 4 }, (_, i) => i * 15);
  }

  get notesOptions() {
    return [
      'Complex Story Brainstorming',
      'Requirements Review',
      'Estimation',
      'Research',
      'Software Design',
      'Coding',
      'Testing',
      'Demonstrations',
      'Bug Fix',
      'Management',
    ];
  }

  formatNumber(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.logForm.get(controlName);
    return !!(control && control.hasError(errorName) && control.touched);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}